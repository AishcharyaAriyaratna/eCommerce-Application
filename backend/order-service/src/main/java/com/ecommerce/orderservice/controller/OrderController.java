package com.ecommerce.orderservice.controller;

import com.ecommerce.orderservice.dto.OrderDTO;
import com.ecommerce.orderservice.dto.OrderItemDTO;
import com.ecommerce.orderservice.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Order Controller
 * REST API endpoints for order management
 */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    /**
     * GET /api/orders
     * Get all orders (Admin/Data Steward only)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('DATA_STEWARD')")
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        List<OrderDTO> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    /**
     * GET /api/orders/{id}
     * Get order by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable Long id) {
        OrderDTO order = orderService.getOrderById(id);
        return ResponseEntity.ok(order);
    }

    /**
     * GET /api/orders/number/{orderNumber}
     * Get order by order number
     */
    @GetMapping("/number/{orderNumber}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderDTO> getOrderByNumber(@PathVariable String orderNumber) {
        OrderDTO order = orderService.getOrderByNumber(orderNumber);
        return ResponseEntity.ok(order);
    }

    /**
     * GET /api/orders/customer/{customerId}
     * Get customer orders
     */
    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'DATA_STEWARD')")
    public ResponseEntity<List<OrderDTO>> getCustomerOrders(@PathVariable Long customerId) {
        List<OrderDTO> orders = orderService.getCustomerOrders(customerId);
        return ResponseEntity.ok(orders);
    }

    /**
     * GET /api/orders/status/{status}
     * Get orders by status
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('DATA_STEWARD')")
    public ResponseEntity<List<OrderDTO>> getOrdersByStatus(@PathVariable String status) {
        List<OrderDTO> orders = orderService.getOrdersByStatus(status);
        return ResponseEntity.ok(orders);
    }

    /**
     * POST /api/orders
     * Create new order
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER')")
    public ResponseEntity<OrderDTO> createOrder(
        @RequestBody CreateOrderRequest request
    ) {
        OrderDTO createdOrder = orderService.createOrder(request.getOrder(), request.getItems());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdOrder);
    }

    /**
     * POST /api/orders/{id}/items
     * Add item to order
     */
    @PostMapping("/{id}/items")
    @PreAuthorize("hasAnyRole('CUSTOMER')")
    public ResponseEntity<OrderDTO> addItemToOrder(
        @PathVariable Long id,
        @RequestBody OrderItemDTO itemDTO
    ) {
        OrderDTO updatedOrder = orderService.addItemToOrder(id, itemDTO);
        return ResponseEntity.ok(updatedOrder);
    }

    /**
     * DELETE /api/orders/{orderId}/items/{itemId}
     * Remove item from order
     */
    @DeleteMapping("/{orderId}/items/{itemId}")
    @PreAuthorize("hasAnyRole('CUSTOMER')")
    public ResponseEntity<OrderDTO> removeItemFromOrder(
        @PathVariable Long orderId,
        @PathVariable Long itemId
    ) {
        OrderDTO updatedOrder = orderService.removeItemFromOrder(orderId, itemId);
        return ResponseEntity.ok(updatedOrder);
    }

    /**
     * PATCH /api/orders/{id}/confirm
     * Confirm order
     */
    @PatchMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('CUSTOMER')")
    public ResponseEntity<OrderDTO> confirmOrder(@PathVariable Long id) {
        OrderDTO confirmedOrder = orderService.confirmOrder(id);
        return ResponseEntity.ok(confirmedOrder);
    }

    /**
     * PATCH /api/orders/{id}/ship
     * Ship order (Data Steward only)
     */
    @PatchMapping("/{id}/ship")
    @PreAuthorize("hasAnyRole('DATA_STEWARD')")
    public ResponseEntity<OrderDTO> shipOrder(@PathVariable Long id) {
        OrderDTO shippedOrder = orderService.shipOrder(id);
        return ResponseEntity.ok(shippedOrder);
    }

    /**
     * PATCH /api/orders/{id}/deliver
     * Deliver order (Data Steward only)
     */
    @PatchMapping("/{id}/deliver")
    @PreAuthorize("hasAnyRole('DATA_STEWARD')")
    public ResponseEntity<OrderDTO> deliverOrder(@PathVariable Long id) {
        OrderDTO deliveredOrder = orderService.deliverOrder(id);
        return ResponseEntity.ok(deliveredOrder);
    }

    /**
     * PATCH /api/orders/{id}/cancel
     * Cancel order
     */
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'DATA_STEWARD')")
    public ResponseEntity<OrderDTO> cancelOrder(@PathVariable Long id) {
        OrderDTO cancelledOrder = orderService.cancelOrder(id);
        return ResponseEntity.ok(cancelledOrder);
    }

    /**
     * DELETE /api/orders/{id}
     * Delete order (Data Steward only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('DATA_STEWARD')")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Request DTO for creating orders
     */
    public static class CreateOrderRequest {
        private OrderDTO order;
        private List<OrderItemDTO> items;

        public OrderDTO getOrder() {
            return order;
        }

        public void setOrder(OrderDTO order) {
            this.order = order;
        }

        public List<OrderItemDTO> getItems() {
            return items;
        }

        public void setItems(List<OrderItemDTO> items) {
            this.items = items;
        }
    }
}
