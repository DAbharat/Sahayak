package com.sahayak.scheme.persistence;

import com.sahayak.scheme.domain.SchemeDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SchemeDocumentRepository extends JpaRepository<SchemeDocument, Long> {
    Optional<SchemeDocument> findTopBySchemeIdOrderByVersionDesc(Long schemeId);
}
