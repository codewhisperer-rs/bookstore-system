package com.bookstore.controller;

import com.bookstore.dto.CartDto;
import com.bookstore.dto.CartItemDto;
import com.bookstore.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<CartDto> getCart() {
        return ResponseEntity.ok(cartService.getCart());
    }

    @PostMapping("/add")
    public ResponseEntity<CartDto> addToCart(@RequestBody CartItemDto cartItemDto) {
        return ResponseEntity.ok(cartService.addToCart(cartItemDto.getBookId(), cartItemDto.getQuantity()));
    }

    @DeleteMapping("/remove/{bookId}")
    public ResponseEntity<CartDto> removeFromCart(@PathVariable Long bookId) {
        return ResponseEntity.ok(cartService.removeFromCart(bookId));
    }

    @PutMapping("/update")
    public ResponseEntity<CartDto> updateQuantity(@RequestBody CartItemDto cartItemDto) {
        return ResponseEntity.ok(cartService.updateQuantity(cartItemDto.getBookId(), cartItemDto.getQuantity()));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart() {
        cartService.clearCart();
        return ResponseEntity.ok().build();
    }
}