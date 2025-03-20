package com.foreigntrading.service;

import com.foreigntrading.entity.Role;
import com.foreigntrading.entity.User;
import com.foreigntrading.exception.ResourceNotFoundException;
import com.foreigntrading.repository.RoleRepository;
import com.foreigntrading.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class RoleService {
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Role getRoleByName(String name) {
        return roleRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with name: " + name));
    }

    @Transactional(readOnly = true)
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    @Transactional
    public Role createRole(String name, String description) {
        Role role = new Role();
        role.setName(name);
        role.setDescription(description);
        return roleRepository.save(role);
    }

    @Transactional
    public void assignRoleToUser(Long userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        Role role = getRoleByName(roleName);
        
        Set<Role> userRoles = user.getRoles();
        userRoles.add(role);
        user.setRoles(userRoles);
        
        userRepository.save(user);
    }

    @Transactional
    public void removeRoleFromUser(Long userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        Role role = getRoleByName(roleName);
        
        Set<Role> userRoles = user.getRoles();
        userRoles.remove(role);
        user.setRoles(userRoles);
        
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public boolean hasRole(Long userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        return user.getRoles().stream()
                .anyMatch(role -> role.getName().equals(roleName));
    }

    @Transactional
    public void initializeRoles() {
        if (roleRepository.count() == 0) {
            createRole("ROLE_USER", "Regular user with standard permissions");
            createRole("ROLE_ADMIN", "Administrator with all permissions");
        }
    }
} 