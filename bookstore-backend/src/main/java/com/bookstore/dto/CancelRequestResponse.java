package com.bookstore.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CancelRequestResponse {
    
    private Long id;
    private Long orderId;
    private String reason;
    private String status;
    private String adminNote;
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;
}