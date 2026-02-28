package com.cctrs.backend.controller;

import com.cctrs.backend.dto.ApiResponse;
import com.cctrs.backend.dto.UserRequestDto;
import com.cctrs.backend.model.User;
import com.cctrs.backend.repository.UserRepository;
import com.cctrs.backend.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * UserController handles all user-related API endpoints
 * Endpoints: /api/users
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;
    private final UserRepository userRepository;

    public UserController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    /**
     * Create a new user in the system
     * 
     * @param dto User request containing name, email, username, and optional role
     * @return Created user with generated ID
     *
     *         Validation:
     *         - Name: required, not empty
     *         - Email: required, valid format, unique
     *         - Username: required, unique, not empty
     *         - Role: optional, defaults to "USER"
     *
     * @throws IllegalArgumentException if validation fails
     */
    @PreAuthorize("hasRole('ADMIN')")
    @io.swagger.v3.oas.annotations.Operation(summary = "Create a new user (admin only)")
    @PostMapping
    public ResponseEntity<ApiResponse<User>> createUser(@jakarta.validation.Valid @RequestBody UserRequestDto dto) {

        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setUsername(dto.getUsername());
        user.setRole(dto.getRole() != null ? dto.getRole() : "USER");
        user.setPoints(0);

        User savedUser = userService.createUser(user);
        logger.info("User created with ID: {}", savedUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("User created successfully", savedUser));
    }

    /**
     * Retrieve all users from the system
     * 
     * @return List of all users
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success("All users retrieved", users));
    }

    /**
     * Retrieve a specific user by ID
     * 
     * @param id User ID
     * @return User object if found
     * @throws ResponseEntity.notFound() if user doesn't exist
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> getUser(@PathVariable Long id) {
        User user = userService.getUserById(id);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("User not found", 404));
        }
        return ResponseEntity.ok(ApiResponse.success("User retrieved", user));
    }

    /**
     * Retrieve the currently authenticated user's profile
     *
     * @return User object for the logged-in user
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null) {
            throw new IllegalArgumentException("User not authenticated");
        }

        String email = auth.getName();
        User user = userRepository.findByEmail(email);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("User not found", 404));
        }

        logger.info("Current user fetched: {}", email);
        return ResponseEntity.ok(ApiResponse.success("Current user retrieved", user));
    }

    /**
     * Send OTP to the user's email for verification
     *
     * @param dto User request containing email
     * @return Success message with OTP
     */
    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<String>> sendOtp(@RequestBody UserRequestDto dto) {
        String otp = userService.generateAndSendOtp(dto.getEmail());
        return ResponseEntity.ok(ApiResponse.success("OTP sent successfully", otp));
    }

    /**
     * Verify the OTP received by the user
     *
     * @param request Map containing email and OTP
     * @return Success message and created user if OTP is valid
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<User>> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        if (userService.verifyOtp(email, otp)) {
            User user = userService.createUserAfterOtpVerification(email);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.created("User created successfully", user));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid or expired OTP", 400));
        }
    }

}
