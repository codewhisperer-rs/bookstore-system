package com.bookstore.repository;

import com.bookstore.entity.CancelRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface CancelRequestRepository extends JpaRepository<CancelRequest, Long> {

    @Query("SELECT cr FROM CancelRequest cr WHERE cr.status = 'PENDING'")
    Page<CancelRequest> findPendingRequests(Pageable pageable);

    @Query("SELECT cr FROM CancelRequest cr WHERE cr.order.id = :orderId")
    CancelRequest findByOrderId(Long orderId);
}