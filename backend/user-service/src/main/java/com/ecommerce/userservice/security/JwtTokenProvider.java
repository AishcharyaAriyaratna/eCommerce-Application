package com.ecommerce.userservice.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

/**
 * Utility class for extracting user info from JWT token
 */
@Component
public class JwtTokenProvider {

    /**
     * Get user ID from JWT
     */
    public String getUserId(Authentication authentication) {
        if (authentication == null) {
            return null;
        }

        if (authentication.getPrincipal() instanceof Jwt) {
            Jwt jwt = (Jwt) authentication.getPrincipal();
            return jwt.getClaimAsString("sub");
        }

        return null;
    }

    /**
     * Get email from JWT
     */
    public String getEmail(Authentication authentication) {
        if (authentication == null) {
            return null;
        }

        if (authentication.getPrincipal() instanceof Jwt) {
            Jwt jwt = (Jwt) authentication.getPrincipal();
            return jwt.getClaimAsString("email");
        }

        return null;
    }

    /**
     * Get user roles from JWT
     */
    public java.util.List<String> getRoles(Authentication authentication) {
        if (authentication == null) {
            return new java.util.ArrayList<>();
        }

        if (authentication.getPrincipal() instanceof Jwt) {
            Jwt jwt = (Jwt) authentication.getPrincipal();
            return jwt.getClaimAsStringList("cognito:groups");
        }

        return new java.util.ArrayList<>();
    }

    /**
     * Check if user has specific role
     */
    public boolean hasRole(Authentication authentication, String role) {
        java.util.List<String> roles = getRoles(authentication);
        return roles != null && roles.contains(role);
    }
}
