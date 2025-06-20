package com.bookstore.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookResponse {
    
    private Long id;
    private String title;
    private String author;
    private BigDecimal price;
    private Integer stock;
    private String description;
    private String coverUrl;
    private LocalDateTime createdAt;
}
