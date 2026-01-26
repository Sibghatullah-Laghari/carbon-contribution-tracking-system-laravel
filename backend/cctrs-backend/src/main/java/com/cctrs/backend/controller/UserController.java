package com.cctrs.backend.controller;

import com.cctrs.backend.dto.ApiResponse;
import com.cctrs.backend.dto.UserRequestDto;
import com.cctrs.backend.model.User;
import com.cctrs.backend.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * UserController handles all user-related API endpoints
 * Endpoints: /api/users
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
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
    @io.swagger.v3.oas.annotations.Operation(summary = "Create a new user")
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

}
