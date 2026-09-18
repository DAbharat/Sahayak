package com.sahayak.scheme.persistence;

import com.sahayak.scheme.domain.ReviewAudit;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewAuditRepository extends JpaRepository<ReviewAudit, Long> {
}
