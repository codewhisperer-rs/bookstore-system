package com.bookstore.repository;

import com.bookstore.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    
    @Query("SELECT b FROM Book b WHERE " +
           "LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Book> findByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT b FROM Book b WHERE b.price BETWEEN :minPrice AND :maxPrice")
    Page<Book> findByPriceRange(@Param("minPrice") BigDecimal minPrice, 
                               @Param("maxPrice") BigDecimal maxPrice, 
                               Pageable pageable);
    
    @Query("SELECT b FROM Book b WHERE b.stock > 0")
    Page<Book> findAvailableBooks(Pageable pageable);
    
    @Query("SELECT b FROM Book b WHERE b.stock <= :threshold")
    List<Book> findLowStockBooks(@Param("threshold") Integer threshold);
    
    Page<Book> findByAuthor(String author, Pageable pageable);
    
    @Query("SELECT b FROM Book b ORDER BY b.createdAt DESC")
    Page<Book> findLatestBooks(Pageable pageable);
}
