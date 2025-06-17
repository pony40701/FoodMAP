package com.example.demo.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserReviewStatsDto {
    private Integer userId;
    private Integer totalViews;
    private Integer totalFavorites;
    private Integer totalReviews;
} 