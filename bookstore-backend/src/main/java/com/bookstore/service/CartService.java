package com.bookstore.service;

import com.bookstore.dto.CartDto;

public interface CartService {
    CartDto getCart();
    CartDto addToCart(Long bookId, int quantity);
    CartDto removeFromCart(Long bookId);
    CartDto updateQuantity(Long bookId, int quantity);
    void clearCart();
}