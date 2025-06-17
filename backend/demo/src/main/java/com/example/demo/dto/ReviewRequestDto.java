package com.example.demo.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ReviewRequestDto {
    private Integer id;  // 用於編輯時識別
    private Integer userId; // 用戶ID
    private String title;
    private String content_json;
    private String status; // draft/published
    private ReviewRatingsDto ratings;
    private List<String> tags;
    private List<String> photos;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    public static class ReviewRatingsDto {
        private Integer environment_score;
        private Integer service_score;
        private Integer taste_score;
        private Integer price_score;
        private Float overall_score;
    }
} 