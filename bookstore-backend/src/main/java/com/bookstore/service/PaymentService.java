package com.bookstore.service;

import com.bookstore.dto.PaymentRequest;
import com.bookstore.dto.PaymentResponse;
import com.bookstore.dto.RefundRequest;
import com.bookstore.dto.PaymentStatistics;
import com.bookstore.entity.Payment;
import com.bookstore.entity.Payment.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface PaymentService {

    /**
     * 创建支付订单
     */
    PaymentResponse createPayment(PaymentRequest request, String username);

    /**
     * 根据ID获取支付信息
     */
    PaymentResponse getPaymentById(Long id, String username);

    /**
     * 根据订单ID获取支付信息
     */
    PaymentResponse getPaymentByOrderId(Long orderId, String username);

    /**
     * 获取用户的支付记录
     */
    Page<PaymentResponse> getUserPayments(String username, int page, int size);

    /**
     * 获取所有支付信息（分页）
     */
    Page<PaymentResponse> getAllPayments(int page, int size);

    /**
     * 根据状态获取支付信息（分页）
     */
    Page<PaymentResponse> getPaymentsByStatus(PaymentStatus status, int page, int size);

    /**
     * 处理支付回调（模拟支付网关回调）
     */
    void handlePaymentCallback(String transactionId, String status, String gatewayResponse);

    /**
     * 确认支付（模拟支付成功）
     */
    PaymentResponse confirmPayment(Long paymentId);

    /**
     * 取消支付
     */
    PaymentResponse cancelPayment(Long paymentId, String username);

    /**
     * 申请退款
     */
    PaymentResponse requestRefund(RefundRequest request);

    /**
     * 处理退款（管理员操作）
     */
    PaymentResponse processRefund(Long paymentId, BigDecimal refundAmount, String reason, String adminNote);

    /**
     * 获取支付统计信息
     */
    PaymentStatistics getPaymentStatistics();

    /**
     * 清理过期的待支付订单
     */
    void cleanupExpiredPayments();
}