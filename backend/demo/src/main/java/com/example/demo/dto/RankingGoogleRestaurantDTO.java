package com.example.demo.dto;

// 將 DTO 從 class 改為 interface，以支援原生查詢的投影
public interface RankingGoogleRestaurantDTO {
    String getPlaceId();
    String getName();
    String getAddress();
    Double getRating();
    Integer getReviewCount();
    String getPhotoUrl();
} 