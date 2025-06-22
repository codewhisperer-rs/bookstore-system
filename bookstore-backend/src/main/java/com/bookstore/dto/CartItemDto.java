package com.bookstore.dto;

import lombok.Data;

@Data
public class CartItemDto {
    private Long bookId;
    private int quantity;
    private BookDto book;
}