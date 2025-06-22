package com.bookstore.controller;

import com.bookstore.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentSimulateController {

    private final PaymentService paymentService;

    // 模拟支付回调接口
    @PostMapping("/callback/simulate")
    public ResponseEntity<Void> simulatePaymentCallback(@RequestBody SimulateCallbackRequest request) {
        // 根据success参数决定支付状态
        String status = request.isSuccess() ? "SUCCESS" : "FAILED";
        String gatewayResponse = request.isSuccess() 
            ? "{\"result\":\"success\",\"time\":\"" + System.currentTimeMillis() + "\"}" 
            : "{\"result\":\"failed\",\"reason\":\"user_cancelled\",\"time\":\"" + System.currentTimeMillis() + "\"}";
        
        // 调用支付服务的回调处理方法
        paymentService.handlePaymentCallback(
                request.getTransactionId(), status, gatewayResponse);
        
        return ResponseEntity.ok().build();
    }

    // 模拟回调请求DTO
    public static class SimulateCallbackRequest {
        private String transactionId;
        private boolean success;

        public String getTransactionId() { return transactionId; }
        public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
    }
}