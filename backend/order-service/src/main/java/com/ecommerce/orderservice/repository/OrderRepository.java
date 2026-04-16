package com.ecommerce.orderservice.repository;

import com.ecommerce.orderservice.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Order Repository
 * Provides database access for Order entity
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    /**
     * Find orders by customer ID
     */
    List<Order> findByCustomerId(Long customerId);

    /**
     * Find order by order number
     */
    Optional<Order> findByOrderNumber(String orderNumber);

    /**
     * Find orders by status
     */
    List<Order> findByStatus(String status);

    /**
     * Find orders by customer and status
     */
    List<Order> findByCustomerIdAndStatus(Long customerId, String status);

    /**
     * Check if order number exists
     */
    boolean existsByOrderNumber(String orderNumber);
}
