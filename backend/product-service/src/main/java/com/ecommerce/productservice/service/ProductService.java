package com.ecommerce.productservice.service;

import com.ecommerce.productservice.dto.ProductDTO;
import com.ecommerce.productservice.entity.Product;
import com.ecommerce.productservice.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Product Service
 * Contains business logic for product management
 */
@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    /**
     * Get product by ID
     */
    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found with ID: " + id));
        return convertToDTO(product);
    }

    /**
     * Get product by SKU
     */
    public ProductDTO getProductBySku(String sku) {
        Product product = productRepository.findBySku(sku)
            .orElseThrow(() -> new RuntimeException("Product not found with SKU: " + sku));
        return convertToDTO(product);
    }

    /**
     * Get all products
     */
    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll()
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Search products by name
     */
    public List<ProductDTO> searchByName(String name) {
        return productRepository.findByNameContainingIgnoreCase(name)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get products by category
     */
    public List<ProductDTO> getProductsByCategory(String category) {
        return productRepository.findByCategory(category)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get approved products by category (for customers)
     */
    public List<ProductDTO> getApprovedProductsByCategory(String category) {
        return productRepository.findByCategoryAndStatus(category, "APPROVED")
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get products by supplier
     */
    public List<ProductDTO> getProductsBySupplier(Long supplierId) {
        return productRepository.findBySupplierId(supplierId)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get products by status
     */
    public List<ProductDTO> getProductsByStatus(String status) {
        return productRepository.findByStatus(status)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get pending products for approval
     */
    public List<ProductDTO> getPendingProducts() {
        return productRepository.findByStatusAndApprovedByIsNull("PENDING")
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get approved products
     */
    public List<ProductDTO> getApprovedProducts() {
        return productRepository.findByStatusAndApprovedByIsNotNull("APPROVED")
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Create new product
     */
    public ProductDTO createProduct(ProductDTO productDTO, Long supplierId) {
        // Check if SKU already exists
        if (productRepository.existsBySku(productDTO.getSku())) {
            throw new RuntimeException("SKU already exists: " + productDTO.getSku());
        }

        Product product = new Product(
            productDTO.getName(),
            productDTO.getDescription(),
            productDTO.getPrice(),
            supplierId,
            productDTO.getCategory(),
            productDTO.getStock(),
            productDTO.getSku()
        );
        product.setCreatedBy(supplierId);

        Product savedProduct = productRepository.save(product);
        return convertToDTO(savedProduct);
    }

    /**
     * Update product
     */
    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found with ID: " + id));

        if (productDTO.getName() != null) {
            product.setName(productDTO.getName());
        }
        if (productDTO.getDescription() != null) {
            product.setDescription(productDTO.getDescription());
        }
        if (productDTO.getPrice() != null) {
            product.setPrice(productDTO.getPrice());
        }
        if (productDTO.getCategory() != null) {
            product.setCategory(productDTO.getCategory());
        }
        if (productDTO.getStock() != null) {
            product.setStock(productDTO.getStock());
        }

        Product updatedProduct = productRepository.save(product);
        return convertToDTO(updatedProduct);
    }

    /**
     * Update product stock
     */
    public ProductDTO updateStock(Long id, Long newStock) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found with ID: " + id));
        product.setStock(newStock);
        Product updated = productRepository.save(product);
        return convertToDTO(updated);
    }

    /**
     * Approve product (Data Steward action)
     */
    public ProductDTO approveProduct(Long id, Long dataStewartId) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found with ID: " + id));

        if (!"PENDING".equals(product.getStatus())) {
            throw new RuntimeException("Only pending products can be approved");
        }

        product.setStatus("APPROVED");
        product.setApprovedBy(dataStewartId);
        product.setApprovalDate(LocalDateTime.now());

        Product updated = productRepository.save(product);
        return convertToDTO(updated);
    }

    /**
     * Reject product (Data Steward action)
     */
    public ProductDTO rejectProduct(Long id, Long dataStewartId) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found with ID: " + id));

        if (!"PENDING".equals(product.getStatus())) {
            throw new RuntimeException("Only pending products can be rejected");
        }

        product.setStatus("REJECTED");
        product.setApprovedBy(dataStewartId);
        product.setApprovalDate(LocalDateTime.now());

        Product updated = productRepository.save(product);
        return convertToDTO(updated);
    }

    /**
     * Delete product
     */
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found with ID: " + id);
        }
        productRepository.deleteById(id);
    }

    /**
     * Convert entity to DTO
     */
    private ProductDTO convertToDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setSupplierId(product.getSupplierId());
        dto.setCategory(product.getCategory());
        dto.setStock(product.getStock());
        dto.setStatus(product.getStatus());
        dto.setSku(product.getSku());
        dto.setCreatedAt(product.getCreatedAt());
        dto.setUpdatedAt(product.getUpdatedAt());
        dto.setCreatedBy(product.getCreatedBy());
        dto.setApprovedBy(product.getApprovedBy());
        dto.setApprovalDate(product.getApprovalDate());
        return dto;
    }
}
