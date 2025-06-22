package com.bookstore.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentStatistics {
    
    /**
     * 成功支付总笔数
     */
    private Long totalSuccessfulPayments;
    
    /**
     * 总支付金额
     */
    private BigDecimal totalPaymentAmount;
    
    /**
     * 总退款金额
     */
    private BigDecimal totalRefundAmount;
    
    /**
     * 待支付订单数
     */
    private Long pendingPayments;
    
    /**
     * 支付中订单数
     */
    private Long processingPayments;
    
    /**
     * 失败支付数
     */
    private Long failedPayments;
    
    /**
     * 已取消支付数
     */
    private Long cancelledPayments;
}