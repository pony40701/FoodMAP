package com.example.demo.controller;
//boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan
import java.util.ArrayList;
import java.util.List;
import java.io.IOException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpStatus;

import com.example.demo.dto.RegisterRequest;
import com.example.demo.service.MerchantRegistrationService;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/merchants")
@CrossOrigin(
    origins = {"http://127.0.0.1:5500", "http://localhost:5500"},
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.DELETE},
    allowCredentials = "true",
    maxAge = 3600   
)
@RequiredArgsConstructor
public class MerchantRegistrationController {

    private static final Logger logger = LoggerFactory.getLogger(MerchantRegistrationController.class);
    
    private final MerchantRegistrationService registrationService;

    @PostMapping("/register")
    public ResponseEntity<String> registerMerchant(
        @RequestPart("data") RegisterRequest request,
        @RequestPart(value = "avatar", required = false) MultipartFile avatar,
        @RequestPart(value = "photos", required = false) MultipartFile[] photos) {

        try {
            logger.info("收到註冊請求，email: {}", request.getEmail());
            logger.info("頭像檔案: {}", avatar != null ? avatar.getOriginalFilename() : "無");
            logger.info("照片數量: {}", photos != null ? photos.length : 0);

            // 將 photos 陣列轉換為 List
            List<MultipartFile> photoList = new ArrayList<>();
            if (photos != null) {
                for (MultipartFile photo : photos) {
                    if (photo != null && !photo.isEmpty()) {
                        logger.info("處理照片: {}, 大小: {} bytes", photo.getOriginalFilename(), photo.getSize());
                        photoList.add(photo);
                    }
                }
            }
            
            registrationService.registerMerchant(request, avatar, photoList);
            logger.info("註冊成功");
            return ResponseEntity.ok("註冊成功");
            
        } catch (IOException e) {
            logger.error("處理圖片時發生錯誤: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("處理圖片時發生錯誤: " + e.getMessage());
        } catch (Exception e) {
            logger.error("註冊過程中發生錯誤: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("註冊失敗: " + e.getMessage());
        }
    }
}
