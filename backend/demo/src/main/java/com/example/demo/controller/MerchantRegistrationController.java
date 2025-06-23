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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.example.demo.dto.RegisterRequest;
import com.example.demo.service.MerchantRegistrationService;

import lombok.RequiredArgsConstructor;

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

    
    private final MerchantRegistrationService registrationService;

    @GetMapping("/check-email")
    public ResponseEntity<Boolean> checkEmailExists(@RequestParam String email) {
        boolean exists = registrationService.isEmailExists(email);
        return ResponseEntity.ok(exists);
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerMerchant(
        @RequestPart("data") RegisterRequest request,
        @RequestPart(value = "avatar", required = false) MultipartFile avatar,
        @RequestPart(value = "photos", required = false) MultipartFile[] photos) {

        try {

            // 將 photos 陣列轉換為 List
            List<MultipartFile> photoList = new ArrayList<>();
            if (photos != null) {
                for (MultipartFile photo : photos) {
                    if (photo != null && !photo.isEmpty()) {
                        photoList.add(photo);
                    }
                }
            }
            
            registrationService.registerMerchant(request, avatar, photoList);
            return ResponseEntity.ok("註冊成功");
            
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("處理圖片時發生錯誤: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("註冊失敗: " + e.getMessage());
        }
    }
}
