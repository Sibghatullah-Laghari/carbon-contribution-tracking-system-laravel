package com.cctrs.backend.dto;

public class UserRequestDto {

    private Long id;
    private String name;
    private String email;
    private String username;
    private String role;
    private Integer points;

    // ✅ Default constructor (VERY IMPORTANT for JSON)
    public UserRequestDto() {
    }

    // ✅ Constructor for responses
    public UserRequestDto(Long id, String name, String email, String username, String role, Integer points) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.username = username;
        this.role = role;
        this.points = points;
    }

    // ✅ Getters & Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }
}
