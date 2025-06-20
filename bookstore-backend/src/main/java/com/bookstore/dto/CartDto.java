package com.bookstore.dto;

import lombok.Data;

import java.util.List;

@Data
public class CartDto {
    private Long id;
    private List<CartItemDto> items;
}