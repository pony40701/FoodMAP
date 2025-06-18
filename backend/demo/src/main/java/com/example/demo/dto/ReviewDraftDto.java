package com.example.demo.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ReviewDraftDto {
    private Integer id;
    private String title;
    private String contentJson;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private ReviewRatingsDto ratings;
    private List<String> photos;
    private List<String> tags;

    @Data
    public static class ReviewRatingsDto {
        private Integer environmentScore;
        private Integer serviceScore;
        private Integer tasteScore;
        private Integer priceScore;
        private Float overallScore;
    }
} 