package com.example.demo.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    private String phoneNumber;
    private String name;
    private String address;
    private String cuisineType;
    private String businessHours;
    // 移除 imageUrls，因為你會用 MultipartFile 處理檔案
}