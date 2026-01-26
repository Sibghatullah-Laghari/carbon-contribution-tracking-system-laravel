package com.cctrs.backend.security;

import com.cctrs.backend.dto.ApiResponse;
import com.cctrs.backend.model.User;
import com.cctrs.backend.model.LoginRequest;
import com.cctrs.backend.repository.UserRepository;
import com.cctrs.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(AuthController.class);

    @Autowired
    UserRepository userRepository;
    @Autowired
    PasswordEncoder encoder;
    @Autowired
    JwtUtil jwtUtil;
    @Autowired
    EmailService emailService;

    @PostMapping("/signup")
    public ApiResponse<String> signup(
            @jakarta.validation.Valid @RequestBody com.cctrs.backend.dto.SignupRequest request) {
        if (userRepository.findByEmail(request.getEmail()) != null) {
            throw new IllegalArgumentException("Email already in use");
        }
        if (userRepository.findByUsername(request.getUsername()) != null) {
            throw new IllegalArgumentException("Username already in use");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setUsername(request.getUsername());
        user.setPassword(encoder.encode(request.getPassword()));

        user.setRole("USER");
        user.setEmailVerified(false);
        user.setVerificationToken(UUID.randomUUID().toString());
        user.setPoints(0);

        userRepository.save(user);
        logger.info("New user registered: {}", user.getEmail());
        emailService.sendVerificationEmail(user.getEmail(), user.getVerificationToken());

        return ApiResponse.created("User registered. Please check email for verification.", null);
    }

    @io.swagger.v3.oas.annotations.Operation(summary = "User login")
    @PostMapping("/login")
    public ApiResponse<String> login(@jakarta.validation.Valid @RequestBody LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail());

        if (user == null || !encoder.matches(req.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        if (Boolean.FALSE.equals(user.getEmailVerified())) {
            throw new IllegalArgumentException("Email not verified. Please check your inbox.");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        logger.info("User logged in: {}", req.getEmail());
        return ApiResponse.success("Login successful", token);
    }

    @GetMapping("/verify")
    public ApiResponse<String> verifyEmail(@RequestParam String token) {
        User user = userRepository.findByVerificationToken(token);
        if (user == null) {
            throw new IllegalArgumentException("Invalid verification token");
        }

        userRepository.verifyEmail(user.getId());
        return ApiResponse.success("Email verified successfully! You can now login.", null);
    }
}
