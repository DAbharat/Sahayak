package com.sahayak.scheme.dto;

import jakarta.validation.constraints.NotBlank;

public class ReviewActionRequest {
    @NotBlank
    private String actor;
    private String notes;

    public String getActor() { return actor; }
    public void setActor(String actor) { this.actor = actor; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
