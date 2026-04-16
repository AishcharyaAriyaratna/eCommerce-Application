package com.ecommerce.supplymgmtservice.service;

import com.ecommerce.supplymgmtservice.dto.SupplierDTO;
import com.ecommerce.supplymgmtservice.entity.Supplier;
import com.ecommerce.supplymgmtservice.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Supplier Service
 * Contains business logic for supplier management
 */
@Service
public class SupplierService {

    @Autowired
    private SupplierRepository supplierRepository;

    /**
     * Get supplier by ID
     */
    public SupplierDTO getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Supplier not found with ID: " + id));
        return convertToDTO(supplier);
    }

    /**
     * Get supplier by company name
     */
    public SupplierDTO getSupplierByCompanyName(String companyName) {
        Supplier supplier = supplierRepository.findByCompanyName(companyName)
            .orElseThrow(() -> new RuntimeException("Supplier not found with company name: " + companyName));
        return convertToDTO(supplier);
    }

    /**
     * Get supplier by email
     */
    public SupplierDTO getSupplierByEmail(String email) {
        Supplier supplier = supplierRepository.findByContactEmail(email)
            .orElseThrow(() -> new RuntimeException("Supplier not found with email: " + email));
        return convertToDTO(supplier);
    }

    /**
     * Get all suppliers
     */
    public List<SupplierDTO> getAllSuppliers() {
        return supplierRepository.findAll()
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get suppliers by status
     */
    public List<SupplierDTO> getSuppliersByStatus(String status) {
        return supplierRepository.findByStatus(status)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get suppliers by country
     */
    public List<SupplierDTO> getSuppliersByCountry(String country) {
        return supplierRepository.findByCountry(country)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get active suppliers
     */
    public List<SupplierDTO> getActiveSuppliers() {
        return supplierRepository.findByStatusAndApprovedByIsNotNull("ACTIVE")
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get pending suppliers for approval
     */
    public List<SupplierDTO> getPendingSuppliers() {
        return supplierRepository.findByStatusAndApprovedByIsNull("PENDING_APPROVAL")
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Create new supplier
     */
    public SupplierDTO createSupplier(SupplierDTO supplierDTO) {
        // Check if company name already exists
        if (supplierRepository.existsByCompanyName(supplierDTO.getCompanyName())) {
            throw new RuntimeException("Company name already exists: " + supplierDTO.getCompanyName());
        }

        // Check if email already exists
        if (supplierRepository.existsByContactEmail(supplierDTO.getContactEmail())) {
            throw new RuntimeException("Email already exists: " + supplierDTO.getContactEmail());
        }

        Supplier supplier = new Supplier(
            supplierDTO.getCompanyName(),
            supplierDTO.getContactEmail(),
            supplierDTO.getContactPerson(),
            supplierDTO.getPhoneNumber()
        );

        if (supplierDTO.getAddress() != null) {
            supplier.setAddress(supplierDTO.getAddress());
        }
        if (supplierDTO.getCity() != null) {
            supplier.setCity(supplierDTO.getCity());
        }
        if (supplierDTO.getCountry() != null) {
            supplier.setCountry(supplierDTO.getCountry());
        }
        if (supplierDTO.getZipCode() != null) {
            supplier.setZipCode(supplierDTO.getZipCode());
        }
        if (supplierDTO.getTaxId() != null) {
            supplier.setTaxId(supplierDTO.getTaxId());
        }

        Supplier savedSupplier = supplierRepository.save(supplier);
        return convertToDTO(savedSupplier);
    }

    /**
     * Update supplier
     */
    public SupplierDTO updateSupplier(Long id, SupplierDTO supplierDTO) {
        Supplier supplier = supplierRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Supplier not found with ID: " + id));

        if (supplierDTO.getContactPerson() != null) {
            supplier.setContactPerson(supplierDTO.getContactPerson());
        }
        if (supplierDTO.getPhoneNumber() != null) {
            supplier.setPhoneNumber(supplierDTO.getPhoneNumber());
        }
        if (supplierDTO.getAddress() != null) {
            supplier.setAddress(supplierDTO.getAddress());
        }
        if (supplierDTO.getCity() != null) {
            supplier.setCity(supplierDTO.getCity());
        }
        if (supplierDTO.getCountry() != null) {
            supplier.setCountry(supplierDTO.getCountry());
        }
        if (supplierDTO.getZipCode() != null) {
            supplier.setZipCode(supplierDTO.getZipCode());
        }

        Supplier updatedSupplier = supplierRepository.save(supplier);
        return convertToDTO(updatedSupplier);
    }

    /**
     * Approve supplier (Data Steward action)
     */
    public SupplierDTO approveSupplier(Long id, Long dataStewartId) {
        Supplier supplier = supplierRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Supplier not found with ID: " + id));

        if (!"PENDING_APPROVAL".equals(supplier.getStatus())) {
            throw new RuntimeException("Only pending suppliers can be approved");
        }

        supplier.setStatus("ACTIVE");
        supplier.setApprovedBy(dataStewartId);
        supplier.setApprovedDate(LocalDateTime.now());

        Supplier updated = supplierRepository.save(supplier);
        return convertToDTO(updated);
    }

    /**
     * Reject supplier (Data Steward action)
     */
    public SupplierDTO rejectSupplier(Long id, Long dataStewartId) {
        Supplier supplier = supplierRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Supplier not found with ID: " + id));

        supplier.setStatus("INACTIVE");
        supplier.setApprovedBy(dataStewartId);
        supplier.setApprovedDate(LocalDateTime.now());

        Supplier updated = supplierRepository.save(supplier);
        return convertToDTO(updated);
    }

    /**
     * Suspend supplier
     */
    public SupplierDTO suspendSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Supplier not found with ID: " + id));

        supplier.setStatus("SUSPENDED");
        Supplier updated = supplierRepository.save(supplier);
        return convertToDTO(updated);
    }

    /**
     * Activate supplier
     */
    public SupplierDTO activateSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Supplier not found with ID: " + id));

        supplier.setStatus("ACTIVE");
        Supplier updated = supplierRepository.save(supplier);
        return convertToDTO(updated);
    }

    /**
     * Delete supplier
     */
    public void deleteSupplier(Long id) {
        if (!supplierRepository.existsById(id)) {
            throw new RuntimeException("Supplier not found with ID: " + id);
        }
        supplierRepository.deleteById(id);
    }

    /**
     * Update total products count
     */
    public void updateProductCount(Long supplierId, Long count) {
        Supplier supplier = supplierRepository.findById(supplierId)
            .orElseThrow(() -> new RuntimeException("Supplier not found with ID: " + supplierId));
        supplier.setTotalProducts(count);
        supplierRepository.save(supplier);
    }

    /**
     * Convert entity to DTO
     */
    private SupplierDTO convertToDTO(Supplier supplier) {
        SupplierDTO dto = new SupplierDTO();
        dto.setId(supplier.getId());
        dto.setCompanyName(supplier.getCompanyName());
        dto.setContactEmail(supplier.getContactEmail());
        dto.setContactPerson(supplier.getContactPerson());
        dto.setPhoneNumber(supplier.getPhoneNumber());
        dto.setAddress(supplier.getAddress());
        dto.setCity(supplier.getCity());
        dto.setCountry(supplier.getCountry());
        dto.setZipCode(supplier.getZipCode());
        dto.setStatus(supplier.getStatus());
        dto.setTaxId(supplier.getTaxId());
        dto.setTotalProducts(supplier.getTotalProducts());
        dto.setCreatedAt(supplier.getCreatedAt());
        dto.setUpdatedAt(supplier.getUpdatedAt());
        dto.setApprovedDate(supplier.getApprovedDate());
        dto.setApprovedBy(supplier.getApprovedBy());
        return dto;
    }
}
