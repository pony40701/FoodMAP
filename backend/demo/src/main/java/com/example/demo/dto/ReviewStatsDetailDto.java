package com.example.demo.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReviewStatsDetailDto {
    private Integer reviewId;
    private String title;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer totalViews;
    private Integer totalFavorites;
    private Integer userTotalViews;
    private Integer userTotalFavorites;
    private Integer userTotalReviews;
} 