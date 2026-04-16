package com.ecommerce.productservice.controller;

import com.ecommerce.productservice.dto.ProductDTO;
import com.ecommerce.productservice.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Product Controller
 * REST API endpoints for product management
 */
@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    /**
     * GET /api/products
     * Get all products
     */
    @GetMapping
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        List<ProductDTO> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    /**
     * GET /api/products/{id}
     * Get product by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Long id) {
        ProductDTO product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }

    /**
     * GET /api/products/sku/{sku}
     * Get product by SKU
     */
    @GetMapping("/sku/{sku}")
    public ResponseEntity<ProductDTO> getProductBySku(@PathVariable String sku) {
        ProductDTO product = productService.getProductBySku(sku);
        return ResponseEntity.ok(product);
    }

    /**
     * GET /api/products/search
     * Search products by name
     */
    @GetMapping("/search")
    public ResponseEntity<List<ProductDTO>> searchProducts(@RequestParam String name) {
        List<ProductDTO> products = productService.searchByName(name);
        return ResponseEntity.ok(products);
    }

    /**
     * GET /api/products/category/{category}
     * Get approved products by category (for customers)
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<List<ProductDTO>> getProductsByCategory(@PathVariable String category) {
        List<ProductDTO> products = productService.getApprovedProductsByCategory(category);
        return ResponseEntity.ok(products);
    }

    /**
     * GET /api/products/supplier/{supplierId}
     * Get products by supplier (Supplier role only)
     */
    @GetMapping("/supplier/{supplierId}")
    @PreAuthorize("hasAnyRole('SUPPLIER', 'DATA_STEWARD')")
    public ResponseEntity<List<ProductDTO>> getProductsBySupplier(@PathVariable Long supplierId) {
        List<ProductDTO> products = productService.getProductsBySupplier(supplierId);
        return ResponseEntity.ok(products);
    }

    /**
     * GET /api/products/status/pending
     * Get pending products for approval (Data Steward only)
     */
    @GetMapping("/status/pending")
    @PreAuthorize("hasAnyRole('DATA_STEWARD')")
    public ResponseEntity<List<ProductDTO>> getPendingProducts() {
        List<ProductDTO> products = productService.getPendingProducts();
        return ResponseEntity.ok(products);
    }

    /**
     * GET /api/products/status/approved
     * Get approved products
     */
    @GetMapping("/status/approved")
    public ResponseEntity<List<ProductDTO>> getApprovedProducts() {
        List<ProductDTO> products = productService.getApprovedProducts();
        return ResponseEntity.ok(products);
    }

    /**
     * POST /api/products
     * Create new product (Supplier role only)
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPPLIER')")
    public ResponseEntity<ProductDTO> createProduct(@RequestBody ProductDTO productDTO) {
        // In a real app, get the supplier ID from authentication context
        Long supplierId = 1L;  // TODO: Extract from JWT token
        ProductDTO createdProduct = productService.createProduct(productDTO, supplierId);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProduct);
    }

    /**
     * PUT /api/products/{id}
     * Update product (Supplier role only)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPPLIER', 'DATA_STEWARD')")
    public ResponseEntity<ProductDTO> updateProduct(
        @PathVariable Long id,
        @RequestBody ProductDTO productDTO
    ) {
        ProductDTO updatedProduct = productService.updateProduct(id, productDTO);
        return ResponseEntity.ok(updatedProduct);
    }

    /**
     * PATCH /api/products/{id}/stock
     * Update product stock
     */
    @PatchMapping("/{id}/stock")
    @PreAuthorize("hasAnyRole('SUPPLIER', 'DATA_STEWARD')")
    public ResponseEntity<ProductDTO> updateStock(
        @PathVariable Long id,
        @RequestParam Long stock
    ) {
        ProductDTO updatedProduct = productService.updateStock(id, stock);
        return ResponseEntity.ok(updatedProduct);
    }

    /**
     * POST /api/products/{id}/approve
     * Approve product (Data Steward only)
     */
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('DATA_STEWARD')")
    public ResponseEntity<ProductDTO> approveProduct(@PathVariable Long id) {
        // In a real app, get the steward ID from authentication context
        Long stewardId = 1L;  // TODO: Extract from JWT token
        ProductDTO approvedProduct = productService.approveProduct(id, stewardId);
        return ResponseEntity.ok(approvedProduct);
    }

    /**
     * POST /api/products/{id}/reject
     * Reject product (Data Steward only)
     */
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('DATA_STEWARD')")
    public ResponseEntity<ProductDTO> rejectProduct(@PathVariable Long id) {
        // In a real app, get the steward ID from authentication context
        Long stewardId = 1L;  // TODO: Extract from JWT token
        ProductDTO rejectedProduct = productService.rejectProduct(id, stewardId);
        return ResponseEntity.ok(rejectedProduct);
    }

    /**
     * DELETE /api/products/{id}
     * Delete product (Data Steward only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('DATA_STEWARD')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
