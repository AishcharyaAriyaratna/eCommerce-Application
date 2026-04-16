package com.ecommerce.supplymgmtservice.repository;

import com.ecommerce.supplymgmtservice.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Supplier Repository
 * Provides database access for Supplier entity
 */
@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    /**
     * Find supplier by company name
     */
    Optional<Supplier> findByCompanyName(String companyName);

    /**
     * Find supplier by email
     */
    Optional<Supplier> findByContactEmail(String contactEmail);

    /**
     * Find suppliers by status
     */
    List<Supplier> findByStatus(String status);

    /**
     * Find suppliers by country
     */
    List<Supplier> findByCountry(String country);

    /**
     * Check if company name exists
     */
    boolean existsByCompanyName(String companyName);

    /**
     * Check if email exists
     */
    boolean existsByContactEmail(String contactEmail);

    /**
     * Find active suppliers
     */
    List<Supplier> findByStatusAndApprovedByIsNotNull(String status);

    /**
     * Find pending suppliers for approval
     */
    List<Supplier> findByStatusAndApprovedByIsNull(String status);
}
