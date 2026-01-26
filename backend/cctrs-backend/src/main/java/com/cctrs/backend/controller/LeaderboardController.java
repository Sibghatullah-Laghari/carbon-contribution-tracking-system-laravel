package com.cctrs.backend.controller;

import com.cctrs.backend.dto.ApiResponse;
import com.cctrs.backend.dto.LeaderboardDTO;
import com.cctrs.backend.model.User;
import com.cctrs.backend.repository.UserRepository;
import com.cctrs.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

/**
 * LeaderboardController handles leaderboard-related endpoints
 */
@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(LeaderboardController.class);
    private final UserRepository userRepository;
    private final UserService userService;

    public LeaderboardController(UserRepository userRepository, UserService userService) {
        this.userRepository = userRepository;
        this.userService = userService;
    }

    /**
     * Get top 10 users by points with badges
     * 
     * @return List of top 10 users with rank, name, points, and badge
     */
    @io.swagger.v3.oas.annotations.Operation(summary = "Get top 10 leaderboard")
    @GetMapping
    public ResponseEntity<ApiResponse<List<LeaderboardDTO>>> getLeaderboard() {
        logger.info("Fetching leaderboard");
        List<User> topUsers = userRepository.findTopUsersByPoints(10);
        List<LeaderboardDTO> leaderboard = new ArrayList<>();

        int rank = 1;
        for (User user : topUsers) {
            String badge = userService.calculateBadge(user.getPoints());
            LeaderboardDTO entry = new LeaderboardDTO(
                    rank++,
                    user.getId(),
                    user.getName(),
                    user.getPoints(),
                    badge);
            leaderboard.add(entry);
        }

        return ResponseEntity.ok(ApiResponse.success("Leaderboard retrieved", leaderboard));
    }
}
