package com.ecommerce.userservice.controller;

import com.ecommerce.userservice.dto.UserDTO;
import com.ecommerce.userservice.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * User Controller
 * REST API endpoints for user management
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * GET /api/users
     * Get all users
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('DATA_STEWARD')")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * GET /api/users/{id}
     * Get user by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        UserDTO user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    /**
     * GET /api/users/username/{username}
     * Get user by username
     */
    @GetMapping("/username/{username}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDTO> getUserByUsername(@PathVariable String username) {
        UserDTO user = userService.getUserByUsername(username);
        return ResponseEntity.ok(user);
    }

    /**
     * GET /api/users/email/{email}
     * Get user by email
     */
    @GetMapping("/email/{email}")
    @PreAuthorize("hasAnyRole('DATA_STEWARD')")
    public ResponseEntity<UserDTO> getUserByEmail(@PathVariable String email) {
        UserDTO user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }

    /**
     * GET /api/users/role/{role}
     * Get all users by role
     */
    @GetMapping("/role/{role}")
    @PreAuthorize("hasAnyRole('DATA_STEWARD')")
    public ResponseEntity<List<UserDTO>> getUsersByRole(@PathVariable String role) {
        List<UserDTO> users = userService.getUsersByRole(role);
        return ResponseEntity.ok(users);
    }

    /**
     * GET /api/users/status/active
     * Get all active users
     */
    @GetMapping("/status/active")
    @PreAuthorize("hasAnyRole('DATA_STEWARD')")
    public ResponseEntity<List<UserDTO>> getActiveUsers() {
        List<UserDTO> users = userService.getActiveUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * POST /api/users
     * Create new user
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('DATA_STEWARD')")
    public ResponseEntity<UserDTO> createUser(@RequestBody UserDTO userDTO) {
        UserDTO createdUser = userService.createUser(userDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    /**
     * PUT /api/users/{id}
     * Update user
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DATA_STEWARD') or authentication.principal.username == #id")
    public ResponseEntity<UserDTO> updateUser(
        @PathVariable Long id,
        @RequestBody UserDTO userDTO
    ) {
        UserDTO updatedUser = userService.updateUser(id, userDTO);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * PATCH /api/users/{id}/status
     * Update user status
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('DATA_STEWARD')")
    public ResponseEntity<UserDTO> updateUserStatus(
        @PathVariable Long id,
        @RequestParam String status
    ) {
        UserDTO updatedUser = userService.updateUserStatus(id, status);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * PATCH /api/users/{id}/role
     * Update user role
     */
    @PatchMapping("/{id}/role")
    @PreAuthorize("hasAnyRole('DATA_STEWARD')")
    public ResponseEntity<UserDTO> updateUserRole(
        @PathVariable Long id,
        @RequestParam String role
    ) {
        UserDTO updatedUser = userService.updateUserRole(id, role);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * DELETE /api/users/{id}
     * Delete user
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('DATA_STEWARD')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/users/stats/count-by-role
     * Get count of users by role
     */
    @GetMapping("/stats/count-by-role")
    @PreAuthorize("hasAnyRole('DATA_STEWARD')")
    public ResponseEntity<Long> getUserCountByRole(@RequestParam String role) {
        long count = userService.getUserCountByRole(role);
        return ResponseEntity.ok(count);
    }
}
