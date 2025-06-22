package com.bookstore.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class BookDto {
    private Long id;
    private String title;
    private String author;
    private BigDecimal price;
    private Integer stock;
    private String description;
    private String coverUrl;
}