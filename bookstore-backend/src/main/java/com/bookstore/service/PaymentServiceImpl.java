package com.bookstore.service;

import com.bookstore.dto.PaymentRequest;
import com.bookstore.dto.PaymentResponse;
import com.bookstore.dto.RefundRequest;
import com.bookstore.dto.PaymentStatistics;
import com.bookstore.entity.Order;
import com.bookstore.entity.Payment;
import com.bookstore.entity.User;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.PaymentRepository;
import com.bookstore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public PaymentResponse createPayment(PaymentRequest request, String username) {
        // 验证用户
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 验证订单
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // 检查订单是否属于当前用户（管理员除外）
        if (!order.getUser().getUsername().equals(username) && user.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Access denied");
        }

        // 检查订单状态
        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new RuntimeException("Order is not in pending status");
        }

        // 检查是否已存在支付记录
        if (paymentRepository.findByOrderId(order.getId()).isPresent()) {
            throw new RuntimeException("Payment already exists for this order");
        }

        // 创建支付记录
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setAmount(order.getTotalPrice());
        payment.setStatus(Payment.PaymentStatus.PENDING);
        payment.setTransactionId(generateTransactionId());
        payment.setPaymentGateway(getPaymentGateway(request.getPaymentMethod()));

        Payment savedPayment = paymentRepository.save(payment);
        log.info("Created payment for order {}, transaction ID: {}", order.getId(), savedPayment.getTransactionId());

        return convertToResponse(savedPayment);
    }

    @Override
    public PaymentResponse getPaymentById(Long id, String username) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        // 检查权限
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!payment.getOrder().getUser().getUsername().equals(username) && user.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Access denied");
        }

        return convertToResponse(payment);
    }

    @Override
    public PaymentResponse getPaymentByOrderId(Long orderId, String username) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found for this order"));

        // 检查权限
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!payment.getOrder().getUser().getUsername().equals(username) && user.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Access denied");
        }

        return convertToResponse(payment);
    }

    @Override
    public Page<PaymentResponse> getUserPayments(String username, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Payment> payments = paymentRepository.findByOrderUserUsername(username, pageable);
        return payments.map(this::convertToResponse);
    }

    @Override
    public Page<PaymentResponse> getAllPayments(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Payment> payments = paymentRepository.findAll(pageable);
        return payments.map(this::convertToResponse);
    }

    @Override
    public Page<PaymentResponse> getPaymentsByStatus(Payment.PaymentStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Payment> payments = paymentRepository.findByStatus(status, pageable);
        return payments.map(this::convertToResponse);
    }

    @Override
    @Transactional
    public void handlePaymentCallback(String transactionId, String status, String gatewayResponse) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setGatewayResponse(gatewayResponse);

        if ("SUCCESS".equals(status)) {
            payment.setStatus(Payment.PaymentStatus.SUCCESS);
            payment.setPaidAt(LocalDateTime.now());
            
            // 更新订单状态
            Order order = payment.getOrder();
            order.setStatus(Order.OrderStatus.PAID);
            orderRepository.save(order);
            
            log.info("Payment confirmed for transaction {}", transactionId);
        } else if ("FAILED".equals(status)) {
            payment.setStatus(Payment.PaymentStatus.FAILED);
            log.warn("Payment failed for transaction {}", transactionId);
        }

        paymentRepository.save(payment);
    }

    @Override
    @Transactional
    public PaymentResponse confirmPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (payment.getStatus() != Payment.PaymentStatus.PENDING) {
            throw new RuntimeException("Payment is not in pending status");
        }

        payment.setStatus(Payment.PaymentStatus.SUCCESS);
        payment.setPaidAt(LocalDateTime.now());
        payment.setGatewayResponse("Manual confirmation");

        // 更新订单状态
        Order order = payment.getOrder();
        order.setStatus(Order.OrderStatus.PAID);
        orderRepository.save(order);

        Payment savedPayment = paymentRepository.save(payment);
        log.info("Payment manually confirmed for ID {}", paymentId);

        return convertToResponse(savedPayment);
    }

    @Override
    @Transactional
    public PaymentResponse cancelPayment(Long paymentId, String username) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        // 检查权限
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!payment.getOrder().getUser().getUsername().equals(username) && user.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Access denied");
        }

        if (payment.getStatus() != Payment.PaymentStatus.PENDING) {
            throw new RuntimeException("Only pending payments can be cancelled");
        }

        payment.setStatus(Payment.PaymentStatus.CANCELLED);
        Payment savedPayment = paymentRepository.save(payment);
        
        log.info("Payment cancelled for ID {}", paymentId);
        return convertToResponse(savedPayment);
    }

    @Override
    @Transactional
    public PaymentResponse requestRefund(RefundRequest request) {
        Payment payment = paymentRepository.findById(request.getPaymentId())
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (payment.getStatus() != Payment.PaymentStatus.SUCCESS) {
            throw new RuntimeException("Only successful payments can be refunded");
        }

        if (request.getRefundAmount().compareTo(payment.getAmount()) > 0) {
            throw new RuntimeException("Refund amount cannot exceed payment amount");
        }

        return processRefund(payment.getId(), request.getRefundAmount(), request.getRefundReason(), request.getAdminNote());
    }

    @Override
    @Transactional
    public PaymentResponse processRefund(Long paymentId, BigDecimal refundAmount, String reason, String adminNote) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (payment.getStatus() != Payment.PaymentStatus.SUCCESS) {
            throw new RuntimeException("Only successful payments can be refunded");
        }

        BigDecimal currentRefundAmount = payment.getRefundAmount() != null ? payment.getRefundAmount() : BigDecimal.ZERO;
        BigDecimal totalRefundAmount = currentRefundAmount.add(refundAmount);

        if (totalRefundAmount.compareTo(payment.getAmount()) > 0) {
            throw new RuntimeException("Total refund amount cannot exceed payment amount");
        }

        payment.setRefundAmount(totalRefundAmount);
        payment.setRefundReason(reason);
        payment.setRefundedAt(LocalDateTime.now());

        if (totalRefundAmount.compareTo(payment.getAmount()) == 0) {
            payment.setStatus(Payment.PaymentStatus.REFUNDED);
            // 更新订单状态为已取消
            Order order = payment.getOrder();
            order.setStatus(Order.OrderStatus.CANCELLED);
            orderRepository.save(order);
        } else {
            payment.setStatus(Payment.PaymentStatus.PARTIAL_REFUNDED);
        }

        Payment savedPayment = paymentRepository.save(payment);
        log.info("Refund processed for payment {}, amount: {}", paymentId, refundAmount);

        return convertToResponse(savedPayment);
    }

    @Override
    public PaymentStatistics getPaymentStatistics() {
        PaymentStatistics stats = new PaymentStatistics();

        stats.setTotalSuccessfulPayments(paymentRepository.countByStatus(Payment.PaymentStatus.SUCCESS));
        stats.setTotalPaymentAmount(paymentRepository.getTotalSuccessfulPaymentAmount());
        stats.setTotalRefundAmount(paymentRepository.getTotalRefundAmount());

        // 按状态统计
        stats.setPendingPayments(paymentRepository.countByStatus(Payment.PaymentStatus.PENDING));
        stats.setProcessingPayments(paymentRepository.countByStatus(Payment.PaymentStatus.PROCESSING));
        stats.setFailedPayments(paymentRepository.countByStatus(Payment.PaymentStatus.FAILED));
        stats.setCancelledPayments(paymentRepository.countByStatus(Payment.PaymentStatus.CANCELLED));

        return stats;
    }

    @Override
    @Transactional
    public void cleanupExpiredPayments() {
        LocalDateTime expiredTime = LocalDateTime.now().minusHours(24); // 24小时过期
        List<Payment> expiredPayments = paymentRepository.findExpiredPayments(
                Payment.PaymentStatus.PENDING, expiredTime);
        
        for (Payment payment : expiredPayments) {
            payment.setStatus(Payment.PaymentStatus.CANCELLED);
            paymentRepository.save(payment);
            log.info("Expired payment cancelled: {}", payment.getTransactionId());
        }
    }

    private PaymentResponse convertToResponse(Payment payment) {
        PaymentResponse response = new PaymentResponse();
        response.setId(payment.getId());
        response.setOrderId(payment.getOrder().getId());
        response.setPaymentMethod(payment.getPaymentMethod());
        response.setPaymentMethodName(payment.getPaymentMethod().getDisplayName());
        response.setAmount(payment.getAmount());
        response.setStatus(payment.getStatus());
        response.setStatusName(payment.getStatus().getDisplayName());
        response.setTransactionId(payment.getTransactionId());
        response.setPaymentGateway(payment.getPaymentGateway());
        response.setCreatedAt(payment.getCreatedAt());
        response.setPaidAt(payment.getPaidAt());
        response.setRefundedAt(payment.getRefundedAt());
        response.setRefundAmount(payment.getRefundAmount());
        response.setRefundReason(payment.getRefundReason());
        
        // 生成支付URL（模拟）
        if (payment.getStatus() == Payment.PaymentStatus.PENDING) {
            response.setPaymentUrl(generatePaymentUrl(payment));
            response.setQrCodeData(generateQrCodeData(payment));
        }
        
        return response;
    }

    private String generateTransactionId() {
        return "TXN_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String getPaymentGateway(Payment.PaymentMethod method) {
        switch (method) {
            case ALIPAY: return "Alipay Gateway";
            case WECHAT_PAY: return "WeChat Pay Gateway";
            case BANK_CARD: return "Bank Gateway";
            case CREDIT_CARD: return "Credit Card Gateway";
            default: return "Unknown Gateway";
        }
    }

    private String generatePaymentUrl(Payment payment) {
        // 模拟生成支付URL
        return String.format("https://payment.gateway.com/pay?txn=%s&amount=%s&method=%s", 
                payment.getTransactionId(), payment.getAmount(), payment.getPaymentMethod());
    }

    private String generateQrCodeData(Payment payment) {
        // 模拟生成二维码数据
        return String.format("payment://pay?txn=%s&amount=%s", 
                payment.getTransactionId(), payment.getAmount());
    }
}