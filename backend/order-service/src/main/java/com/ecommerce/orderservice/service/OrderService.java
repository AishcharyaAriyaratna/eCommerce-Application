package com.ecommerce.orderservice.service;

import com.ecommerce.orderservice.dto.OrderDTO;
import com.ecommerce.orderservice.dto.OrderItemDTO;
import com.ecommerce.orderservice.entity.Order;
import com.ecommerce.orderservice.entity.OrderItem;
import com.ecommerce.orderservice.repository.OrderRepository;
import com.ecommerce.orderservice.repository.OrderItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Order Service
 * Contains business logic for order management
 */
@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    /**
     * Get order by ID
     */
    public OrderDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Order not found with ID: " + id));
        return convertToDTO(order);
    }

    /**
     * Get order by order number
     */
    public OrderDTO getOrderByNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
            .orElseThrow(() -> new RuntimeException("Order not found with number: " + orderNumber));
        return convertToDTO(order);
    }

    /**
     * Get all orders for a customer
     */
    public List<OrderDTO> getCustomerOrders(Long customerId) {
        return orderRepository.findByCustomerId(customerId)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get all orders
     */
    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAll()
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get orders by status
     */
    public List<OrderDTO> getOrdersByStatus(String status) {
        return orderRepository.findByStatus(status)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Create new order
     */
    public OrderDTO createOrder(OrderDTO orderDTO, List<OrderItemDTO> items) {
        // Generate order number
        String orderNumber = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        if (orderRepository.existsByOrderNumber(orderNumber)) {
            throw new RuntimeException("Order number already exists: " + orderNumber);
        }

        // Create order
        Order order = new Order(
            orderDTO.getCustomerId(),
            orderNumber,
            BigDecimal.ZERO
        );

        if (orderDTO.getShippingAddress() != null) {
            order.setShippingAddress(orderDTO.getShippingAddress());
        }
        if (orderDTO.getBillingAddress() != null) {
            order.setBillingAddress(orderDTO.getBillingAddress());
        }

        // Save order first
        Order savedOrder = orderRepository.save(order);

        // Add items
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (OrderItemDTO itemDTO : items) {
            OrderItem item = new OrderItem(
                savedOrder,
                itemDTO.getProductId(),
                itemDTO.getProductName(),
                itemDTO.getPrice(),
                itemDTO.getQuantity()
            );
            orderItemRepository.save(item);
            totalAmount = totalAmount.add(item.getSubtotal());
        }

        // Update total amount
        savedOrder.setTotalAmount(totalAmount);
        Order finalOrder = orderRepository.save(savedOrder);

        return convertToDTO(finalOrder);
    }

    /**
     * Add item to order
     */
    public OrderDTO addItemToOrder(Long orderId, OrderItemDTO itemDTO) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        OrderItem item = new OrderItem(
            order,
            itemDTO.getProductId(),
            itemDTO.getProductName(),
            itemDTO.getPrice(),
            itemDTO.getQuantity()
        );
        orderItemRepository.save(item);

        // Update total
        BigDecimal newTotal = order.getTotalAmount().add(item.getSubtotal());
        order.setTotalAmount(newTotal);
        Order updated = orderRepository.save(order);

        return convertToDTO(updated);
    }

    /**
     * Remove item from order
     */
    public OrderDTO removeItemFromOrder(Long orderId, Long itemId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        OrderItem item = orderItemRepository.findById(itemId)
            .orElseThrow(() -> new RuntimeException("Order item not found with ID: " + itemId));

        if (!item.getOrder().getId().equals(orderId)) {
            throw new RuntimeException("Item does not belong to this order");
        }

        // Update total
        BigDecimal newTotal = order.getTotalAmount().subtract(item.getSubtotal());
        order.setTotalAmount(newTotal);
        orderItemRepository.delete(item);
        Order updated = orderRepository.save(order);

        return convertToDTO(updated);
    }

    /**
     * Update order status
     */
    public OrderDTO updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Order not found with ID: " + id));

        order.setStatus(status);

        if ("SHIPPED".equals(status) && order.getShippedDate() == null) {
            order.setShippedDate(LocalDateTime.now());
        } else if ("DELIVERED".equals(status) && order.getDeliveredDate() == null) {
            order.setDeliveredDate(LocalDateTime.now());
        }

        Order updated = orderRepository.save(order);
        return convertToDTO(updated);
    }

    /**
     * Confirm order
     */
    public OrderDTO confirmOrder(Long id) {
        return updateOrderStatus(id, "CONFIRMED");
    }

    /**
     * Ship order
     */
    public OrderDTO shipOrder(Long id) {
        return updateOrderStatus(id, "SHIPPED");
    }

    /**
     * Deliver order
     */
    public OrderDTO deliverOrder(Long id) {
        return updateOrderStatus(id, "DELIVERED");
    }

    /**
     * Cancel order
     */
    public OrderDTO cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Order not found with ID: " + id));

        if (!"PENDING".equals(order.getStatus()) && !"CONFIRMED".equals(order.getStatus())) {
            throw new RuntimeException("Only pending or confirmed orders can be cancelled");
        }

        order.setStatus("CANCELLED");
        Order updated = orderRepository.save(order);
        return convertToDTO(updated);
    }

    /**
     * Delete order
     */
    public void deleteOrder(Long id) {
        if (!orderRepository.existsById(id)) {
            throw new RuntimeException("Order not found with ID: " + id);
        }
        orderRepository.deleteById(id);
    }

    /**
     * Convert entity to DTO
     */
    private OrderDTO convertToDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setCustomerId(order.getCustomerId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setBillingAddress(order.getBillingAddress());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());
        dto.setShippedDate(order.getShippedDate());
        dto.setDeliveredDate(order.getDeliveredDate());

        if (order.getItems() != null) {
            dto.setItems(
                order.getItems().stream()
                    .map(this::convertItemToDTO)
                    .collect(Collectors.toList())
            );
        }

        return dto;
    }

    /**
     * Convert OrderItem entity to DTO
     */
    private OrderItemDTO convertItemToDTO(OrderItem item) {
        OrderItemDTO dto = new OrderItemDTO();
        dto.setId(item.getId());
        dto.setOrderId(item.getOrder().getId());
        dto.setProductId(item.getProductId());
        dto.setProductName(item.getProductName());
        dto.setPrice(item.getPrice());
        dto.setQuantity(item.getQuantity());
        dto.setSubtotal(item.getSubtotal());
        return dto;
    }
}
