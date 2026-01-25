package com.cctrs.backend.startup;

import com.cctrs.backend.model.User;
import com.cctrs.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class AdminDataLoader implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminDataLoader.class);
    private final UserRepository userRepository;

    public AdminDataLoader(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        try {
            User existingAdmin = userRepository.findByEmail("admin@cctrs.com");

            if (existingAdmin == null) {
                User admin = new User(
                        "Admin",
                        "admin@cctrs.com",
                        "admin",
                        "ADMIN",
                        0
                );
                userRepository.save(admin);
                logger.info("Admin user created successfully");
            } else {
                logger.info("Admin user already exists");
            }
        } catch (Exception e) {
            logger.error("Error loading admin data", e);
        }
    }
}
