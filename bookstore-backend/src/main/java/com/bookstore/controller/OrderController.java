package com.bookstore.controller;

import com.bookstore.dto.OrderRequest;
import com.bookstore.dto.OrderResponse;
import com.bookstore.entity.CancelRequest;
import com.bookstore.entity.Order;
import com.bookstore.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderRequest request, 
                                                   Authentication authentication) {
        OrderResponse response = orderService.createOrder(request, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id, 
                                                    Authentication authentication) {
        OrderResponse response = orderService.getOrderById(id, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-orders")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Page<OrderResponse>> getUserOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        Page<OrderResponse> orders = orderService.getUserOrders(authentication.getName(), page, size);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<OrderResponse>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<OrderResponse> orders = orderService.getAllOrders(page, size);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/admin/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<OrderResponse>> getOrdersByStatus(
            @PathVariable Order.OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<OrderResponse> orders = orderService.getOrdersByStatus(status, page, size);
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/admin/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderResponse> updateOrderStatus(@PathVariable Long id, 
                                                         @RequestParam Order.OrderStatus status) {
        OrderResponse response = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(response);
    }

    // Cancel order endpoints
    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<OrderResponse> cancelOrder(@PathVariable Long id, 
                                                   Authentication authentication) {
        OrderResponse response = orderService.cancelOrder(id, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/cancel-request")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Void> requestCancelOrder(@PathVariable Long id, 
                                                  @RequestBody CancelOrderRequest request,
                                                  Authentication authentication) {
        orderService.requestCancelOrder(id, request.getReason(), authentication.getName());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/admin/cancel-requests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<CancelRequest>> getPendingCancelRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<CancelRequest> requests = orderService.getPendingCancelRequests(page, size);
        return ResponseEntity.ok(requests);
    }

    @PutMapping("/admin/{id}/cancel-request")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> handleCancelRequest(@PathVariable Long id,
                                                   @RequestBody HandleCancelRequestRequest request) {
        orderService.handleCancelRequest(id, request.isApproved(), request.getAdminNote());
        return ResponseEntity.ok().build();
    }

    // Request DTOs
    public static class CancelOrderRequest {
        private String reason;
        
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    public static class HandleCancelRequestRequest {
        private boolean approved;
        private String adminNote;
        
        public boolean isApproved() { return approved; }
        public void setApproved(boolean approved) { this.approved = approved; }
        public String getAdminNote() { return adminNote; }
        public void setAdminNote(String adminNote) { this.adminNote = adminNote; }
    }
}
