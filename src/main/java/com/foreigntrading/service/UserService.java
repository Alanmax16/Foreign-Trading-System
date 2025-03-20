package com.foreigntrading.service;

import com.foreigntrading.entity.User;
import com.foreigntrading.repository.UserRepository;
import com.foreigntrading.exception.ResourceNotFoundException;
import com.foreigntrading.exception.DuplicateResourceException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new DuplicateResourceException("Email already exists");
        }
        if (user.getPhoneNumber() != null && userRepository.existsByPhoneNumber(user.getPhoneNumber())) {
            throw new DuplicateResourceException("Phone number already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setCreatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public User updateUser(Long id, User userDetails) {
        User user = getUserById(id);
        
        if (userDetails.getFirstName() != null) {
            user.setFirstName(userDetails.getFirstName());
        }
        if (userDetails.getLastName() != null) {
            user.setLastName(userDetails.getLastName());
        }
        if (userDetails.getPhoneNumber() != null) {
            if (!userDetails.getPhoneNumber().equals(user.getPhoneNumber()) &&
                    userRepository.existsByPhoneNumber(userDetails.getPhoneNumber())) {
                throw new DuplicateResourceException("Phone number already exists");
            }
            user.setPhoneNumber(userDetails.getPhoneNumber());
        }
        if (userDetails.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }

        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = getUserById(id);
        userRepository.delete(user);
    }

    @Transactional
    public void enableMfa(Long id) {
        User user = getUserById(id);
        user.setMfaEnabled(true);
        userRepository.save(user);
    }

    @Transactional
    public void disableMfa(Long id) {
        User user = getUserById(id);
        user.setMfaEnabled(false);
        user.setMfaSecret(null);
        userRepository.save(user);
    }

    @Transactional
    public void updateLastLogin(Long id) {
        User user = getUserById(id);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
    }

    @Transactional
    public void addRole(Long id, String role) {
        User user = getUserById(id);
        user.addRole(role);
        userRepository.save(user);
    }

    @Transactional
    public void removeRole(Long id, String role) {
        User user = getUserById(id);
        user.removeRole(role);
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Transactional(readOnly = true)
    public boolean existsByPhoneNumber(String phoneNumber) {
        return userRepository.existsByPhoneNumber(phoneNumber);
    }
} 