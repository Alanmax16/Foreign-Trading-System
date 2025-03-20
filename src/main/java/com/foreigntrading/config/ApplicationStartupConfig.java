package com.foreigntrading.config;

import com.foreigntrading.service.RoleService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class ApplicationStartupConfig {
    private final RoleService roleService;

    @PostConstruct
    public void initialize() {
        // Initialize roles
        roleService.initializeRoles();
    }
} 