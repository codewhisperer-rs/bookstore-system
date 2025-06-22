package com.bookstore.dto;

import com.bookstore.entity.Payment;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PaymentResponse {

    private Long id;
    private Long orderId;
    private Payment.PaymentMethod paymentMethod;
    private String paymentMethodName;
    private BigDecimal amount;
    private Payment.PaymentStatus status;
    private String statusName;
    private String transactionId;
    private String paymentGateway;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
    private LocalDateTime refundedAt;
    private BigDecimal refundAmount;
    private String refundReason;
    
    // 支付URL（用于跳转到支付页面）
    private String paymentUrl;
    
    // 二维码数据（用于扫码支付）
    private String qrCodeData;
}