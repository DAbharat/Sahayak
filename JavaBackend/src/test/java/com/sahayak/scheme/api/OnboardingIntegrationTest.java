package com.sahayak.scheme.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sahayak.scheme.domain.IngestionState;
import com.sahayak.scheme.domain.SourceType;
import com.sahayak.scheme.dto.OnboardingIngestionRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class OnboardingIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void supportsAsyncTextIngestionAndStatusPolling() throws Exception {
        OnboardingIngestionRequest request = new OnboardingIngestionRequest();
        request.setSchemeName("Async Scheme");
        request.setDescription("ingestion flow");
        request.setSource("Official circular");
        request.setSourceType(SourceType.TEXT);
        request.setSourceUrl("https://example.gov/async-scheme");
        request.setTextContent("Applicant must be an unorganized worker and monthly income must not exceed 15000.");
        request.setActor("uploader");
        request.setLastVerified(LocalDate.now());

        MockMultipartFile requestPart = new MockMultipartFile(
                "request",
                "request",
                MediaType.APPLICATION_JSON_VALUE,
                objectMapper.writeValueAsBytes(request)
        );

        String submitResponse = mockMvc.perform(multipart("/api/v1/onboarding/ingestions")
                        .file(requestPart)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isAccepted())
                .andReturn().getResponse().getContentAsString();

        JsonNode submitNode = objectMapper.readTree(submitResponse);
        long runId = submitNode.get("ingestionRunId").asLong();

        JsonNode statusNode = null;
        for (int i = 0; i < 20; i++) {
            String statusResponse = mockMvc.perform(get("/api/v1/onboarding/ingestions/{runId}", runId))
                    .andExpect(status().isOk())
                    .andReturn().getResponse().getContentAsString();
            statusNode = objectMapper.readTree(statusResponse);
            String state = statusNode.get("state").asText();
            if (IngestionState.COMPLETED.name().equals(state) || IngestionState.FAILED.name().equals(state)) {
                break;
            }
            Thread.sleep(100);
        }

        assertThat(statusNode).isNotNull();
        assertThat(statusNode.get("state").asText()).isEqualTo(IngestionState.COMPLETED.name());
    }
}
