package com.sahayak.scheme.persistence;

import com.sahayak.scheme.domain.ReviewAudit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewAuditRepository extends JpaRepository<ReviewAudit, Long> {
    List<ReviewAudit> findByRuleId(Long ruleId);
}
