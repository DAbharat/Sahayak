package com.sahayak.scheme.persistence;

import com.sahayak.scheme.domain.SchemeRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SchemeRuleRepository extends JpaRepository<SchemeRule, Long> {
    List<SchemeRule> findBySchemeId(Long schemeId);
}
