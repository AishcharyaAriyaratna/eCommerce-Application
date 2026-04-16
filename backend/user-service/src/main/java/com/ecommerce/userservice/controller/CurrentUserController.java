package com.ecommerce.userservice.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.ecommerce.userservice.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Current user controller
 * Provides endpoints for getting current user info and checking roles
 */
@RestController
@RequestMapping("/api/users/me")
public class CurrentUserController {

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    /**
     * GET /api/users/me
     * Get current user information
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public UserResponse getCurrentUser(Authentication authentication) {
        return new UserResponse(
            jwtTokenProvider.getUserId(authentication),
            jwtTokenProvider.getEmail(authentication),
            jwtTokenProvider.getRoles(authentication)
        );
    }

    /**
     * GET /api/users/me/roles
     * Get current user roles
     */
    @GetMapping("/roles")
    @PreAuthorize("isAuthenticated()")
    public RolesResponse getUserRoles(Authentication authentication) {
        return new RolesResponse(jwtTokenProvider.getRoles(authentication));
    }

    /**
     * GET /api/users/me/has-role/{role}
     * Check if current user has specific role
     */
    @GetMapping("/has-role/{role}")
    @PreAuthorize("isAuthenticated()")
    public RoleCheckResponse hasRole(
        @PathVariable String role,
        Authentication authentication
    ) {
        return new RoleCheckResponse(
            role,
            jwtTokenProvider.hasRole(authentication, role)
        );
    }

    // Response DTOs
    
    public static class UserResponse {
        public String userId;
        public String email;
        public java.util.List<String> roles;

        public UserResponse(String userId, String email, java.util.List<String> roles) {
            this.userId = userId;
            this.email = email;
            this.roles = roles;
        }
    }

    public static class RolesResponse {
        public java.util.List<String> roles;

        public RolesResponse(java.util.List<String> roles) {
            this.roles = roles;
        }
    }

    public static class RoleCheckResponse {
        public String role;
        public boolean hasRole;

        public RoleCheckResponse(String role, boolean hasRole) {
            this.role = role;
            this.hasRole = hasRole;
        }
    }
}
