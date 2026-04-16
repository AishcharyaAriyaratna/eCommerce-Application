package com.ecommerce.productservice.repository;

import com.ecommerce.productservice.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Product Repository
 * Provides database access for Product entity
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    /**
     * Find products by name
     */
    List<Product> findByNameContainingIgnoreCase(String name);

    /**
     * Find products by category
     */
    List<Product> findByCategory(String category);

    /**
     * Find products by supplier ID
     */
    List<Product> findBySupplierId(Long supplierId);

    /**
     * Find products by status
     */
    List<Product> findByStatus(String status);

    /**
     * Find products by supplier and status
     */
    List<Product> findBySupplierIdAndStatus(Long supplierId, String status);

    /**
     * Find products by category and status
     */
    List<Product> findByCategoryAndStatus(String category, String status);

    /**
     * Find product by SKU
     */
    Optional<Product> findBySku(String sku);

    /**
     * Check if SKU exists
     */
    boolean existsBySku(String sku);

    /**
     * Find approved products
     */
    List<Product> findByStatusAndApprovedByIsNotNull(String status);

    /**
     * Find pending products for approval
     */
    List<Product> findByStatusAndApprovedByIsNull(String status);
}
