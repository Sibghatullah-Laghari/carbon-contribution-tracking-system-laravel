package com.cctrs.backend.controller;

import com.cctrs.backend.model.ProofSession;
import com.cctrs.backend.model.User;
import com.cctrs.backend.repository.UserRepository;
import com.cctrs.backend.service.ProofSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping({ "/proof", "/api/proof" })
public class ProofController {

    @Autowired
    private ProofSessionService proofService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/start")
    public ProofSession startProof(
            @RequestParam(required = false) Long activityId,
            @RequestBody(required = false) Map<String, Object> body) {

        Long resolvedActivityId = activityId;
        if (resolvedActivityId == null && body != null && body.get("activityId") != null) {
            Object value = body.get("activityId");
            resolvedActivityId = value instanceof Number ? ((Number) value).longValue()
                    : Long.valueOf(value.toString());
        }

        if (resolvedActivityId == null || resolvedActivityId <= 0) {
            throw new IllegalArgumentException("Valid activityId is required");
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        User user = userRepository.findByEmail(email);

        return proofService.createSession(user.getId(), resolvedActivityId);
    }
}
