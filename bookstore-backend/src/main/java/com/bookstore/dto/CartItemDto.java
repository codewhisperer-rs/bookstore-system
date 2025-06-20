package com.bookstore.dto;

import com.bookstore.entity.Book;
import lombok.Data;

@Data
public class CartItemDto {
    private Long bookId;
    private int quantity;
    private Book book;
}