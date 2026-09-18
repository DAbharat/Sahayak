package com.sahayak.scheme.api;

import com.sahayak.scheme.domain.IngestionRun;
import com.sahayak.scheme.dto.IngestionRunResponse;
import com.sahayak.scheme.dto.IngestionSubmitResponse;
import com.sahayak.scheme.dto.OnboardingIngestionRequest;
import com.sahayak.scheme.service.IngestionService;
import com.sahayak.scheme.service.SchemeMapper;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/onboarding")
@Validated
public class OnboardingController {

    private final IngestionService ingestionService;
    private final SchemeMapper schemeMapper;

    public OnboardingController(IngestionService ingestionService, SchemeMapper schemeMapper) {
        this.ingestionService = ingestionService;
        this.schemeMapper = schemeMapper;
    }

    @PostMapping(value = "/ingestions", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<IngestionSubmitResponse> submit(
            @RequestPart("request") @Valid OnboardingIngestionRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        IngestionRun run = ingestionService.submitIngestion(request, file);
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(new IngestionSubmitResponse(run.getId(), run.getScheme().getId(), run.getState().name()));
    }

    @GetMapping("/ingestions/{runId}")
    public IngestionRunResponse getStatus(@PathVariable Long runId) {
        return schemeMapper.toIngestionRunResponse(ingestionService.getIngestionRun(runId));
    }
}
