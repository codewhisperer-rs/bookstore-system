package com.bookstore.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "cancel_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CancelRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @NotNull(message = "Order is required")
    private Order order;

    @Column(nullable = false, length = 1000)
    @NotBlank(message = "Reason is required")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CancelRequestStatus status = CancelRequestStatus.PENDING;

    @Column(name = "admin_note", length = 1000)
    private String adminNote;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    public enum CancelRequestStatus {
        PENDING, APPROVED, REJECTED
    }
}