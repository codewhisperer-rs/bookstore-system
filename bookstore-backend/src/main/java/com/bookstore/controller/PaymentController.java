package com.bookstore.controller;

import com.bookstore.dto.PaymentRequest;
import com.bookstore.dto.PaymentResponse;
import com.bookstore.dto.PaymentStatistics;
import com.bookstore.dto.RefundRequest;
import com.bookstore.entity.Payment;
import com.bookstore.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<PaymentResponse> createPayment(@Valid @RequestBody PaymentRequest request,
                                                       Authentication authentication) {
        PaymentResponse response = paymentService.createPayment(request, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable Long id,
                                                        Authentication authentication) {
        PaymentResponse response = paymentService.getPaymentById(id, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<PaymentResponse> getPaymentByOrderId(@PathVariable Long orderId,
                                                             Authentication authentication) {
        PaymentResponse response = paymentService.getPaymentByOrderId(orderId, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-payments")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Page<PaymentResponse>> getUserPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        Page<PaymentResponse> payments = paymentService.getUserPayments(authentication.getName(), page, size);
        return ResponseEntity.ok(payments);
    }

    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PaymentResponse> confirmPayment(@PathVariable Long id) {
        PaymentResponse response = paymentService.confirmPayment(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<PaymentResponse> cancelPayment(@PathVariable Long id,
                                                       Authentication authentication) {
        PaymentResponse response = paymentService.cancelPayment(id, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refund")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PaymentResponse> requestRefund(@Valid @RequestBody RefundRequest request) {
        PaymentResponse response = paymentService.requestRefund(request);
        return ResponseEntity.ok(response);
    }

    // 管理员接口
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<PaymentResponse>> getAllPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<PaymentResponse> payments = paymentService.getAllPayments(page, size);
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/admin/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<PaymentResponse>> getPaymentsByStatus(
            @PathVariable Payment.PaymentStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<PaymentResponse> payments = paymentService.getPaymentsByStatus(status, page, size);
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PaymentStatistics> getPaymentStatistics() {
        PaymentStatistics statistics = paymentService.getPaymentStatistics();
        return ResponseEntity.ok(statistics);
    }

    @PostMapping("/admin/{id}/refund")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PaymentResponse> processRefund(@PathVariable Long id,
                                                       @RequestBody RefundProcessRequest request) {
        PaymentResponse response = paymentService.processRefund(
                id, request.getRefundAmount(), request.getReason(), request.getAdminNote());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin/cleanup-expired")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> cleanupExpiredPayments() {
        paymentService.cleanupExpiredPayments();
        return ResponseEntity.ok().build();
    }

    // 模拟支付网关回调
    @PostMapping("/callback")
    public ResponseEntity<Void> handlePaymentCallback(@RequestBody PaymentCallbackRequest request) {
        paymentService.handlePaymentCallback(
                request.getTransactionId(), request.getStatus(), request.getGatewayResponse());
        return ResponseEntity.ok().build();
    }

    // 内部DTO类
    public static class RefundProcessRequest {
        private BigDecimal refundAmount;
        private String reason;
        private String adminNote;

        public BigDecimal getRefundAmount() { return refundAmount; }
        public void setRefundAmount(BigDecimal refundAmount) { this.refundAmount = refundAmount; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
        public String getAdminNote() { return adminNote; }
        public void setAdminNote(String adminNote) { this.adminNote = adminNote; }
    }

    public static class PaymentCallbackRequest {
        private String transactionId;
        private String status;
        private String gatewayResponse;

        public String getTransactionId() { return transactionId; }
        public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getGatewayResponse() { return gatewayResponse; }
        public void setGatewayResponse(String gatewayResponse) { this.gatewayResponse = gatewayResponse; }
    }
}