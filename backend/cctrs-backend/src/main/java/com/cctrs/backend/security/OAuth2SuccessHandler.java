package com.cctrs.backend.security;

import com.cctrs.backend.model.User;
import com.cctrs.backend.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public OAuth2SuccessHandler(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name  = oAuth2User.getAttribute("name");

        if (email == null) {
            response.sendRedirect("http://localhost:5173/login?error=no_email");
            return;
        }

        // Find or create user
        User user = userRepository.findByEmail(email);
        if (user == null) {
            // Create new user from Google account
            user = new User();
            user.setEmail(email);
            user.setName(name != null ? name : email.split("@")[0]);
            // Generate a unique username from email
            String baseUsername = email.split("@")[0].replaceAll("[^a-zA-Z0-9]", "");
            String username = baseUsername;
            int suffix = 1;
            while (userRepository.findByUsername(username) != null) {
                username = baseUsername + suffix++;
            }
            user.setUsername(username);
            user.setPassword(""); // No password for OAuth users
            user.setRole("USER");
            user.setPoints(0);
            user.setEmailVerified(true);
            userRepository.save(user);
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        // Redirect to frontend with token
        response.sendRedirect("http://localhost:5173/oauth2/callback?token=" + token + "&role=" + user.getRole());
    }
}

