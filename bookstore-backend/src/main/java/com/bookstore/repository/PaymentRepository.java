package com.bookstore.repository;

import com.bookstore.entity.Payment;
import com.bookstore.entity.Payment.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByOrderId(Long orderId);

    Optional<Payment> findByTransactionId(String transactionId);

    List<Payment> findByStatus(Payment.PaymentStatus status);

    Page<Payment> findByStatus(Payment.PaymentStatus status, Pageable pageable);

    @Query("SELECT p FROM Payment p WHERE p.order.user.username = :username")
    Page<Payment> findByOrderUserUsername(@Param("username") String username, Pageable pageable);

    @Query("SELECT p FROM Payment p WHERE p.createdAt BETWEEN :startDate AND :endDate")
    List<Payment> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, 
                                        @Param("endDate") LocalDateTime endDate);

    @Query("SELECT p FROM Payment p WHERE p.status = :status AND p.createdAt < :expiredTime")
    List<Payment> findExpiredPayments(@Param("status") Payment.PaymentStatus status, 
                                     @Param("expiredTime") LocalDateTime expiredTime);



    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = 'SUCCESS'")
    java.math.BigDecimal getTotalSuccessfulPaymentAmount();

    @Query("SELECT SUM(p.refundAmount) FROM Payment p WHERE p.refundAmount IS NOT NULL")
    BigDecimal getTotalRefundAmount();
    
    /**
     * 根据状态统计支付数量
     */
    Long countByStatus(PaymentStatus status);
}