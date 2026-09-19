package com.sahayak.scheme.persistence;

import com.sahayak.scheme.domain.Scheme;
import com.sahayak.scheme.domain.SchemeStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SchemeRepository extends JpaRepository<Scheme, Long> {
    Optional<Scheme> findByNameIgnoreCase(String name);
    List<Scheme> findByStatus(SchemeStatus status);
    List<Scheme> findByStatusAndNameContainingIgnoreCase(SchemeStatus status, String name);
    List<Scheme> findByNameContainingIgnoreCase(String name);
}
