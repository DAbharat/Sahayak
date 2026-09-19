package com.sahayak.scheme.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sahayak.scheme.domain.SourceType;
import com.sahayak.scheme.dto.CreateSchemeRequest;
import com.sahayak.scheme.dto.ReviewActionRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SchemeControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void rejectsSchemeWithoutSourceMetadata() throws Exception {
        String payload = "{\"name\":\"Example\",\"sourceType\":\"TEXT\"}";

        mockMvc.perform(post("/api/v1/schemes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest());
    }

    @Test
    void exposesPublishedSchemesForBackendConsumption() throws Exception {
        CreateSchemeRequest draft = new CreateSchemeRequest();
        draft.setName("Scheme A");
        draft.setDescription("draft scheme");
        draft.setSource("Gov notification");
        draft.setSourceType(SourceType.TEXT);
        draft.setSourceUrl("https://example.gov/scheme-a");
        draft.setLastVerified(LocalDate.now());

        String createResponse = mockMvc.perform(post("/api/v1/schemes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(draft)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long schemeId = objectMapper.readTree(createResponse).get("id").asLong();

        ReviewActionRequest approve = new ReviewActionRequest();
        approve.setActor("reviewer");
        approve.setNotes("approved");

        mockMvc.perform(post("/api/v1/schemes/{schemeId}/review/approve", schemeId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(approve)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PUBLISHED"));

        mockMvc.perform(get("/api/v1/schemes").param("status", "PUBLISHED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Scheme A"))
                .andExpect(jsonPath("$[0].sourceUrl").value("https://example.gov/scheme-a"));
    }
}
