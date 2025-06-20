package com.bookstore.repository;

import com.bookstore.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    List<OrderItem> findByOrderId(Long orderId);
    
    List<OrderItem> findByBookId(Long bookId);
    
    @Query("SELECT oi FROM OrderItem oi WHERE oi.order.user.id = :userId")
    List<OrderItem> findByUserId(@Param("userId") Long userId);
    
    @Query("SELECT SUM(oi.quantity) FROM OrderItem oi WHERE oi.book.id = :bookId")
    Integer getTotalQuantitySoldForBook(@Param("bookId") Long bookId);
    
    @Query("SELECT oi.book.id, SUM(oi.quantity) FROM OrderItem oi " +
           "GROUP BY oi.book.id ORDER BY SUM(oi.quantity) DESC")
    List<Object[]> findBestSellingBooks();
}
