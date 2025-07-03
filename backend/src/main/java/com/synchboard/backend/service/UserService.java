// File: backend/src/main/java/com/synchboard/backend/service/UserService.java

package com.synchboard.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.synchboard.backend.dto.auth.RegisterRequest;
import com.synchboard.backend.entity.User;
import com.synchboard.backend.repository.UserRepository;

@Service // Marks this class as a Service component in Spring.
public class UserService {

    // Spring will inject the beans we defined earlier. This is called Dependency Injection.
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Registers a new user in the system.
     * @param request The registration data from the client.
     * @return The saved User entity.
     */
    public User registerUser(RegisterRequest request) {
        // 1. Check if a user with the given email already exists to prevent duplicates.
        if (userRepository.existsById(request.getEmail())) {
            // For now, we throw a simple exception. Later, this can be a custom, more specific exception.
            throw new RuntimeException("Error: Email is already in use!");
        }

        // 2. Create a new User entity object.
        User newUser = new User();

        // 3. Populate the new user's details from the request DTO.
        newUser.setEmail(request.getEmail());
        newUser.setFirstName(request.getFirstName());
        newUser.setLastName(request.getLastName());
        newUser.setPhoneNumber(request.getPhoneNumber());

        // 4. IMPORTANT: Encode the password before saving it to the database.
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));

        // 5. Save the new User entity to the database using the repository.
        // The save() method returns the saved entity, including any DB-generated values.
        return userRepository.save(newUser);
    }
}