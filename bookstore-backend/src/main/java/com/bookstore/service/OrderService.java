package com.bookstore.service;

import com.bookstore.dto.CancelRequestResponse;
import com.bookstore.dto.OrderItemResponse;
import com.bookstore.dto.OrderRequest;
import com.bookstore.dto.OrderResponse;
import com.bookstore.entity.Book;
import com.bookstore.entity.CancelRequest;
import com.bookstore.entity.Order;
import com.bookstore.entity.OrderItem;
import com.bookstore.entity.User;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.CancelRequestRepository;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final CancelRequestRepository cancelRequestRepository;

    @Transactional
    public OrderResponse createOrder(OrderRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = new Order();
        order.setUser(user);
        order.setStatus(Order.OrderStatus.PENDING);

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalPrice = BigDecimal.ZERO;

        for (var itemRequest : request.getOrderItems()) {
            Book book = bookRepository.findById(itemRequest.getBookId())
                    .orElseThrow(() -> new RuntimeException("Book not found: " + itemRequest.getBookId()));

            if (book.getStock() < itemRequest.getQuantity()) {
                throw new RuntimeException("Insufficient stock for book: " + book.getTitle());
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setBook(book);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setPrice(book.getPrice());

            BigDecimal itemTotal = book.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            totalPrice = totalPrice.add(itemTotal);

            // Update book stock
            book.setStock(book.getStock() - itemRequest.getQuantity());
            bookRepository.save(book);

            orderItems.add(orderItem);
        }

        order.setTotalPrice(totalPrice);
        order.setOrderItems(orderItems);

        Order savedOrder = orderRepository.save(order);
        return convertToResponse(savedOrder);
    }

    public OrderResponse getOrderById(Long id, String username) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Check if user owns this order or is admin
        if (!order.getUser().getUsername().equals(username)) {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            if (user.getRole() != User.Role.ADMIN) {
                throw new RuntimeException("Access denied");
            }
        }

        return convertToResponse(order);
    }

    public Page<OrderResponse> getUserOrders(String username, int page, int size) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);
        return orders.map(this::convertToResponse);
    }

    public Page<OrderResponse> getAllOrders(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Order> orders = orderRepository.findAll(pageable);
        return orders.map(this::convertToResponse);
    }

    public Page<OrderResponse> getOrdersByStatus(Order.OrderStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Order> orders = orderRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
        return orders.map(this::convertToResponse);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long id, Order.OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(status);
        Order savedOrder = orderRepository.save(order);
        return convertToResponse(savedOrder);
    }

    private OrderResponse convertToResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getOrderItems().stream()
                .map(this::convertItemToResponse)
                .collect(Collectors.toList());

        CancelRequestResponse cancelRequestResponse = null;
        if (order.getCancelRequest() != null) {
            CancelRequest cr = order.getCancelRequest();
            cancelRequestResponse = new CancelRequestResponse(
                    cr.getId(),
                    order.getId(),
                    cr.getReason(),
                    cr.getStatus().name(),
                    cr.getAdminNote(),
                    cr.getCreatedAt(),
                    cr.getProcessedAt()
            );
        }

        return new OrderResponse(
                order.getId(),
                order.getUser().getId(),
                order.getUser().getUsername(),
                order.getTotalPrice(),
                order.getStatus().name(),
                order.getCreatedAt(),
                itemResponses,
                cancelRequestResponse
        );
    }

    private OrderItemResponse convertItemToResponse(OrderItem item) {
        BigDecimal subtotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
        return new OrderItemResponse(
                item.getId(),
                item.getBook().getId(),
                item.getBook().getTitle(),
                item.getBook().getAuthor(),
                item.getQuantity(),
                item.getPrice(),
                subtotal
        );
    }

    // Cancel order methods
    @Transactional
    public OrderResponse cancelOrder(Long orderId, String username) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Check if user owns this order
        if (!order.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Access denied");
        }

        // Only allow cancellation for PENDING and PAID orders
        if (order.getStatus() != Order.OrderStatus.PENDING && order.getStatus() != Order.OrderStatus.PAID) {
            throw new RuntimeException("Cannot cancel order with status: " + order.getStatus());
        }

        // Restore book stock
        for (OrderItem item : order.getOrderItems()) {
            Book book = item.getBook();
            book.setStock(book.getStock() + item.getQuantity());
            bookRepository.save(book);
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        Order savedOrder = orderRepository.save(order);
        return convertToResponse(savedOrder);
    }

    @Transactional
    public void requestCancelOrder(Long orderId, String reason, String username) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Check if user owns this order
        if (!order.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Access denied");
        }

        // Only allow cancel request for SHIPPED orders
        if (order.getStatus() != Order.OrderStatus.SHIPPED) {
            throw new RuntimeException("Can only request cancellation for shipped orders");
        }

        // Check if cancel request already exists
        if (order.getCancelRequest() != null) {
            throw new RuntimeException("Cancel request already exists for this order");
        }

        CancelRequest cancelRequest = new CancelRequest();
        cancelRequest.setOrder(order);
        cancelRequest.setReason(reason);
        cancelRequest.setStatus(CancelRequest.CancelRequestStatus.PENDING);

        cancelRequestRepository.save(cancelRequest);
    }

    public Page<CancelRequest> getPendingCancelRequests(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return cancelRequestRepository.findPendingRequests(pageable);
    }

    @Transactional
    public void handleCancelRequest(Long orderId, boolean approved, String adminNote) {
        CancelRequest cancelRequest = cancelRequestRepository.findByOrderId(orderId);
        if (cancelRequest == null) {
            throw new RuntimeException("Cancel request not found for order: " + orderId);
        }

        if (cancelRequest.getStatus() != CancelRequest.CancelRequestStatus.PENDING) {
            throw new RuntimeException("Cancel request is not pending");
        }

        cancelRequest.setStatus(approved ? CancelRequest.CancelRequestStatus.APPROVED : CancelRequest.CancelRequestStatus.REJECTED);
        cancelRequest.setAdminNote(adminNote);
        cancelRequest.setProcessedAt(LocalDateTime.now());

        if (approved) {
            Order order = cancelRequest.getOrder();
            // Restore book stock
            for (OrderItem item : order.getOrderItems()) {
                Book book = item.getBook();
                book.setStock(book.getStock() + item.getQuantity());
                bookRepository.save(book);
            }
            order.setStatus(Order.OrderStatus.CANCELLED);
            orderRepository.save(order);
        }

        cancelRequestRepository.save(cancelRequest);
    }
}
