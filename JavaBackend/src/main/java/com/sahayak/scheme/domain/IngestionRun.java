package com.sahayak.scheme.domain;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "ingestion_runs")
public class IngestionRun {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scheme_id")
    private Scheme scheme;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id")
    private SchemeDocument document;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IngestionState state;

    @Column(name = "errors", columnDefinition = "TEXT")
    private String errors;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Scheme getScheme() { return scheme; }
    public void setScheme(Scheme scheme) { this.scheme = scheme; }
    public SchemeDocument getDocument() { return document; }
    public void setDocument(SchemeDocument document) { this.document = document; }
    public IngestionState getState() { return state; }
    public void setState(IngestionState state) { this.state = state; }
    public String getErrors() { return errors; }
    public void setErrors(String errors) { this.errors = errors; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
