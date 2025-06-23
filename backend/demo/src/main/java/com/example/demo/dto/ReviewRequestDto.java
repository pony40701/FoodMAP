package com.example.demo.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
public class ReviewRequestDto {
    private Integer id;  // 用於編輯時識別
    private Integer userId; // 用戶ID
    private Integer restaurantId; // 餐廳ID
    private String title;
    private String content_json;
    private String status; // draft/published
    private ReviewRatingsDto ratings;
    private List<String> tags;
    private List<String> photos; // 保留向後兼容
    private List<PhotoData> photoData; // 新增：圖片數據
    private Map<String, PhotoData> existingImageInfo; // 新增：已存在圖片的信息
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
    
    @Data
    public static class PhotoData {
        private String fileName;
        private String contentType;
        private byte[] imageData;
        private ImageSize size; // 圖片大小信息
        private String alignment; // 圖片對齊信息
    }
    
    @Data
    public static class ImageSize {
        private String width;
        private String height;
    }
} 