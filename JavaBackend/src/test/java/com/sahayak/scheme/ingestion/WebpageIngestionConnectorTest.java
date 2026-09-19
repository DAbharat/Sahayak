package com.sahayak.scheme.ingestion;

import com.sahayak.scheme.domain.SourceType;
import com.sahayak.scheme.dto.OnboardingIngestionRequest;
import com.sahayak.scheme.exception.BadRequestException;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

class WebpageIngestionConnectorTest {

    private final WebpageIngestionConnector connector = new WebpageIngestionConnector();

    @Test
    void rejectsUnsupportedProtocol() {
        OnboardingIngestionRequest request = new OnboardingIngestionRequest();
        request.setSourceType(SourceType.WEBPAGE);
        request.setSourceUrl("file:///etc/passwd");

        assertThatThrownBy(() -> connector.ingest(request, null))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Only http and https protocols are supported");
    }

    @Test
    void blocksSsrfToLoopbackAddress() {
        OnboardingIngestionRequest request = new OnboardingIngestionRequest();
        request.setSourceType(SourceType.WEBPAGE);
        request.setSourceUrl("http://127.0.0.1:8080/actuator");

        assertThatThrownBy(() -> connector.ingest(request, null))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("forbidden");
    }

    @Test
    void blocksSsrfToCloudMetadataIp() {
        OnboardingIngestionRequest request = new OnboardingIngestionRequest();
        request.setSourceType(SourceType.WEBPAGE);
        request.setSourceUrl("http://169.254.169.254/latest/meta-data");

        assertThatThrownBy(() -> connector.ingest(request, null))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("forbidden");
    }
}
