package com.bookstore.dto;

import com.bookstore.entity.Payment;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentRequest {

    @NotNull(message = "Order ID is required")
    private Long orderId;

    @NotNull(message = "Payment method is required")
    private Payment.PaymentMethod paymentMethod;

    private String returnUrl; // 支付成功后的回调URL
    
    private String notifyUrl; // 支付网关异步通知URL
}