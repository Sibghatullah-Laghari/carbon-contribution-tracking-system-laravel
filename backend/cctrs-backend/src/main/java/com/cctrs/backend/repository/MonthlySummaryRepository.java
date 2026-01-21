package com.cctrs.backend.repository;

import com.cctrs.backend.entity.MonthlySummary;
import com.cctrs.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MonthlySummaryRepository extends JpaRepository<MonthlySummary, Long> {

    Optional<MonthlySummary> findByUserAndMonth(User user, String month);
}
