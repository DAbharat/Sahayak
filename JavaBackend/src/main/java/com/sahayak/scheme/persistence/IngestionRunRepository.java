package com.sahayak.scheme.persistence;

import com.sahayak.scheme.domain.IngestionRun;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IngestionRunRepository extends JpaRepository<IngestionRun, Long> {
}
