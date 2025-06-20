package com.bookstore.repository;

import com.bookstore.entity.Cart;
import com.bookstore.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    void deleteByCartAndBookId(Cart cart, Long bookId);
    void deleteByCart(Cart cart);
}