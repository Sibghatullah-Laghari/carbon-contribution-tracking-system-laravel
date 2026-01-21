package com.cctrs.backend.repository;

import com.cctrs.backend.entity.Activity;
import com.cctrs.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Long> {

    List<Activity> findByStatus(String status);

    List<Activity> findByUserAndMonthAndStatus(
            User user,
            String month,
            String status
    );
}
