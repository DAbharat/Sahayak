"""
Integration and Unit Tests for faster-whisper Voice Transcription Endpoint
POST /api/voice/transcribe
"""
from __future__ import annotations

import io
from pathlib import Path
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.whisper_service import WhisperService, get_whisper_service, TranscriptionError

client = TestClient(app)

AUDIO_FILE = Path(__file__).parent.parent / "test_english.wav"


class TestVoiceTranscribeEndpoint:
    def test_transcribe_missing_file_rejected_422(self):
        """Request without audio file returns 422 Unprocessable Entity."""
        response = client.post("/api/voice/transcribe", data={"language_code": "en-IN"})
        assert response.status_code == 422

    def test_transcribe_unsupported_content_type_rejected_415(self):
        """Request with unsupported mime type (e.g. text/plain) returns 415."""
        fake_file = io.BytesIO(b"not an audio file")
        response = client.post(
            "/api/voice/transcribe",
            files={"file": ("test.txt", fake_file, "text/plain")},
        )
        assert response.status_code == 415
        data = response.json()
        assert data["error"] == "UnsupportedFileTypeError"

    def test_transcribe_oversized_file_rejected_413(self):
        """Files exceeding 10MB are rejected with 413."""
        # 11 MB
        oversized = io.BytesIO(b"0" * (11 * 1024 * 1024))
        response = client.post(
            "/api/voice/transcribe",
            files={"file": ("large.wav", oversized, "audio/wav")},
        )
        assert response.status_code == 413
        data = response.json()
        assert data["error"] == "FileTooLargeError"

    def test_transcribe_empty_file_returns_error(self):
        """Empty audio file returns 502 TranscriptionError."""
        empty_file = io.BytesIO(b"")
        response = client.post(
            "/api/voice/transcribe",
            files={"file": ("empty.wav", empty_file, "audio/wav")},
        )
        assert response.status_code == 502
        data = response.json()
        assert data["error"] == "TranscriptionError"

    def test_transcribe_contract_preservation_with_mock(self):
        """Verify the exact response schema is preserved when WhisperService succeeds."""
        mock_whisper = MagicMock(spec=WhisperService)
        mock_whisper.transcribe_audio.return_value = (
            "Hello world, this is a test.",
            "whisper-test-12345",
            0.95,
        )

        app.dependency_overrides[get_whisper_service] = lambda: mock_whisper

        try:
            fake_wav = io.BytesIO(b"RIFF" + b"\x00" * 100)
            response = client.post(
                "/api/voice/transcribe",
                files={"file": ("test.wav", fake_wav, "audio/wav")},
                data={"language_code": "en-IN"},
                headers={"x-correlation-id": "test-corr-id"},
            )

            assert response.status_code == 200
            data = response.json()

            # Ensure all required schema fields exist with exact keys
            assert "transcript" in data
            assert "language_code" in data
            assert "job_name" in data
            assert "confidence" in data
            assert "correlation_id" in data

            assert data["transcript"] == "Hello world, this is a test."
            assert data["language_code"] == "en-IN"
            assert data["job_name"] == "whisper-test-12345"
            assert data["confidence"] == 0.95
            assert isinstance(data["correlation_id"], str)
        finally:
            app.dependency_overrides.pop(get_whisper_service, None)

    def test_transcribe_whisper_failure_returns_502(self):
        """TranscriptionError in service maps to 502 Bad Gateway."""
        mock_whisper = MagicMock(spec=WhisperService)
        mock_whisper.transcribe_audio.side_effect = TranscriptionError("Decoder error")

        app.dependency_overrides[get_whisper_service] = lambda: mock_whisper

        try:
            fake_wav = io.BytesIO(b"RIFF" + b"\x00" * 100)
            response = client.post(
                "/api/voice/transcribe",
                files={"file": ("test.wav", fake_wav, "audio/wav")},
            )
            assert response.status_code == 502
            data = response.json()
            assert data["error"] == "TranscriptionError"
        finally:
            app.dependency_overrides.pop(get_whisper_service, None)

    @pytest.mark.skipif(not AUDIO_FILE.exists(), reason="Real audio file not found")
    def test_real_audio_transcription_live(self):
        """End-to-end integration test with real audio file."""
        with open(AUDIO_FILE, "rb") as f:
            audio_bytes = f.read()

        response = client.post(
            "/api/voice/transcribe",
            files={"file": ("test_english.wav", audio_bytes, "audio/wav")},
            data={"language_code": "en-IN"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "Ramesh" in data["transcript"]
        assert data["language_code"] == "en-IN"
        assert data["confidence"] > 0.5
        assert data["job_name"].startswith("whisper-")
