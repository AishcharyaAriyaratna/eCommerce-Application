package com.ecommerce.supplymgmtservice.controller;

import com.ecommerce.supplymgmtservice.dto.SupplierDTO;
import com.ecommerce.supplymgmtservice.service.SupplierService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Supplier Controller
 * REST API endpoints for supplier management
 */
@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    @Autowired
    private SupplierService supplierService;

    /**
     * GET /api/suppliers
     * Get all suppliers
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('DATA_STEWARD')")
    public ResponseEntity<List<SupplierDTO>> getAllSuppliers() {
        List<SupplierDTO> suppliers = supplierService.getAllSuppliers();
        return ResponseEntity.ok(suppliers);
    }

    /**
     * GET /api/suppliers/{id}
     * Get supplier by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPPLIER', 'DATA_STEWARD')")
    public ResponseEntity<SupplierDTO> getSupplierById(@PathVariable Long id) {
        SupplierDTO supplier = supplierService.getSupplierById(id);
        return ResponseEntity.ok(supplier);
    }

    /**
     * GET /api/suppliers/name/{companyName}
     * Get supplier by company name
     */
    @GetMapping("/name/{companyName}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SupplierDTO> getSupplierByCompanyName(@PathVariable String companyName) {
        SupplierDTO supplier = supplierService.getSupplierByCompanyName(companyName);
        return ResponseEntity.ok(supplier);
    }

    /**
     * GET /api/suppliers/email/{email}
     * Get supplier by email
     */
    @GetMapping("/email/{email}")
    @PreAuthorize("hasAnyRole('DATA_STEWARD')")
    public ResponseEntity<SupplierDTO> getSupplierByEmail(@PathVariable String email) {
        SupplierDTO supplier = supplierService.getSupplierByEmail(email);
        return ResponseEntity.ok(supplier);
    }

    /**
     * GET /api/suppliers/status/active
     * Get active suppliers
     */
    @GetMapping("/status/active")
    public ResponseEntity<List<SupplierDTO>> getActiveSuppliers() {
        List<SupplierDTO> suppliers = supplierService.getActiveSuppliers();
        return ResponseEntity.ok(suppliers);
    }

    /**
     * GET /api/suppliers/status/pending
     * Get pending suppliers for approval (Data Steward only)
     */
    @GetMapping("/status/pending")
    @PreAuthorize("hasAnyRole('DATA_STEWARD')")
    public ResponseEntity<List<SupplierDTO>> getPendingSuppliers() {
        List<SupplierDTO> suppliers = supplierService.getPendingSuppliers();
        return ResponseEntity.ok(suppliers);
    }

    /**
     * GET /api/suppliers/country/{country}
     * Get suppliers by country
     */
    @GetMapping("/country/{country}")
    @PreAuthorize("hasAnyRole('DATA_STEWARD')")
    public ResponseEntity<List<SupplierDTO>> getSuppliersByCountry(@PathVariable String country) {
        List<SupplierDTO> suppliers = supplierService.getSuppliersByCountry(country);
        return ResponseEntity.ok(suppliers);
    }

    /**
     * POST /api/suppliers
     * Create new supplier
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPPLIER')")
    public ResponseEntity<SupplierDTO> createSupplier(@RequestBody SupplierDTO supplierDTO) {
        SupplierDTO createdSupplier = supplierService.createSupplier(supplierDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdSupplier);
    }

    /**
     * PUT /api/suppliers/{id}
     * Update supplier
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPPLIER', 'DATA_STEWARD')")
    public ResponseEntity<SupplierDTO> updateSupplier(
        @PathVariable Long id,
        @RequestBody SupplierDTO supplierDTO
    ) {
        SupplierDTO updatedSupplier = supplierService.updateSupplier(id, supplierDTO);
        return ResponseEntity.ok(updatedSupplier);
    }

    /**
     * POST /api/suppliers/{id}/approve
     * Approve supplier (Data Steward only)
     */
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('DATA_STEWARD')")
    public ResponseEntity<SupplierDTO> approveSupplier(@PathVariable Long id) {
        // In a real app, get the steward ID from authentication context
        Long stewardId = 1L;  // TODO: Extract from JWT token
        SupplierDTO approvedSupplier = supplierService.approveSupplier(id, stewardId);
        return ResponseEntity.ok(approvedSupplier);
    }

    /**
     * POST /api/suppliers/{id}/reject
     * Reject supplier (Data Steward only)
     */
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('DATA_STEWARD')")
    public ResponseEntity<SupplierDTO> rejectSupplier(@PathVariable Long id) {
        // In a real app, get the steward ID from authentication context
        Long stewardId = 1L;  // TODO: Extract from JWT token
        SupplierDTO rejectedSupplier = supplierService.rejectSupplier(id, stewardId);
        return ResponseEntity.ok(rejectedSupplier);
    }

    /**
     * PATCH /api/suppliers/{id}/suspend
     * Suspend supplier (Data Steward only)
     */
    @PatchMapping("/{id}/suspend")
    @PreAuthorize("hasAnyRole('DATA_STEWARD')")
    public ResponseEntity<SupplierDTO> suspendSupplier(@PathVariable Long id) {
        SupplierDTO suspendedSupplier = supplierService.suspendSupplier(id);
        return ResponseEntity.ok(suspendedSupplier);
    }

    /**
     * PATCH /api/suppliers/{id}/activate
     * Activate supplier (Data Steward only)
     */
    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('DATA_STEWARD')")
    public ResponseEntity<SupplierDTO> activateSupplier(@PathVariable Long id) {
        SupplierDTO activatedSupplier = supplierService.activateSupplier(id);
        return ResponseEntity.ok(activatedSupplier);
    }

    /**
     * DELETE /api/suppliers/{id}
     * Delete supplier (Data Steward only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('DATA_STEWARD')")
    public ResponseEntity<Void> deleteSupplier(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.noContent().build();
    }
}
