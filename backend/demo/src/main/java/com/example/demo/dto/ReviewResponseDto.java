package com.example.foodmap.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ReviewResponseDto {
    private Integer id;
    private Integer userId;
    private String title;
    private String contentJson;
    private String status;
    private List<String> photos;
    private List<String> tags;
    private ReviewRatingsDto ratings;
    private Integer viewCount;
    private Integer favoriteCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    public static class ReviewRatingsDto {
        private Integer environmentScore;
        private Integer serviceScore;
        private Integer tasteScore;
        private Integer priceScore;
        private Float overallScore;
    }
} 