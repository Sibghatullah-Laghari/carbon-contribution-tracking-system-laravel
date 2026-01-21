package com.cctrs.backend.startup;

import com.cctrs.backend.entity.User;
import com.cctrs.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner loadUsers(UserRepository userRepository) {
        return args -> {
            if (userRepository.count() == 0) {

                userRepository.save(new User("Demo User", "USER"));
                userRepository.save(new User("Admin User", "ADMIN"));

                System.out.println("Demo users inserted into database");
            }
        };
    }
}
