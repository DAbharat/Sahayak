package com.sahayak.scheme.ingestion;

import com.sahayak.scheme.domain.SourceType;
import com.sahayak.scheme.dto.OnboardingIngestionRequest;
import com.sahayak.scheme.exception.BadRequestException;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.InetAddress;
import java.net.URI;
import java.net.UnknownHostException;
import java.time.Instant;

@Component
public class WebpageIngestionConnector implements IngestionConnector {

    public static class TransientWebpageException extends RuntimeException {
        public TransientWebpageException(String message, Throwable cause) {
            super(message, cause);
        }
    }

    @Override
    public boolean supports(SourceType sourceType) {
        return SourceType.WEBPAGE == sourceType;
    }

    @Override
    @Retryable(retryFor = TransientWebpageException.class, maxAttempts = 3, backoff = @Backoff(delay = 500, multiplier = 2))
    public NormalizedDocument ingest(OnboardingIngestionRequest request, MultipartFile file) {
        validateUrl(request.getSourceUrl());

        try {
            Document document = Jsoup.connect(request.getSourceUrl()).timeout(15_000).get();
            String text = document.body() == null ? "" : document.body().text();
            String normalized = text.replaceAll("\\s+", " ").trim();
            if (normalized.isBlank()) {
                throw new BadRequestException("Webpage body text is empty");
            }
            return new NormalizedDocument(
                    SourceType.WEBPAGE,
                    request.getSourceUrl(),
                    document.title() == null || document.title().isBlank() ? request.getSourceUrl() : document.title(),
                    normalized,
                    IngestionUtils.sha256(normalized),
                    Instant.now()
            );
        } catch (IOException e) {
            throw new TransientWebpageException("Failed to fetch webpage: " + e.getMessage(), e);
        }
    }

    @Recover
    public NormalizedDocument recover(TransientWebpageException ex, OnboardingIngestionRequest request, MultipartFile file) {
        throw new BadRequestException("Failed to fetch webpage after retries: " + ex.getMessage());
    }

    public void validateUrl(String urlString) {
        if (urlString == null || urlString.isBlank()) {
            throw new BadRequestException("WEBPAGE sourceType requires sourceUrl");
        }
        URI uri;
        try {
            uri = URI.create(urlString.trim());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid sourceUrl: " + e.getMessage());
        }
        String scheme = uri.getScheme();
        if (scheme == null || (!scheme.equalsIgnoreCase("http") && !scheme.equalsIgnoreCase("https"))) {
            throw new BadRequestException("Only http and https protocols are supported");
        }
        String host = uri.getHost();
        if (host == null || host.isBlank()) {
            throw new BadRequestException("Invalid host in sourceUrl");
        }

        try {
            InetAddress[] addresses = InetAddress.getAllByName(host);
            for (InetAddress addr : addresses) {
                if (addr.isLoopbackAddress() || addr.isAnyLocalAddress() || addr.isLinkLocalAddress() || addr.isSiteLocalAddress()) {
                    throw new BadRequestException("Access to internal/private network addresses is forbidden: " + host);
                }
                String ip = addr.getHostAddress();
                if (ip.startsWith("169.254.") || ip.startsWith("127.") || ip.startsWith("10.") || ip.startsWith("192.168.")) {
                    throw new BadRequestException("Access to internal/metadata addresses is forbidden: " + host);
                }
            }
        } catch (UnknownHostException e) {
            throw new BadRequestException("Cannot resolve host: " + host);
        }
    }
}
