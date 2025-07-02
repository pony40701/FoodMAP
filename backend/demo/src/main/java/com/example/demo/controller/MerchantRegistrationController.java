package com.example.demo.controller;
//boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan
import java.util.ArrayList;
import java.util.List;
import java.io.IOException;
import java.util.Map;

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
import org.springframework.web.bind.annotation.RequestBody;

import com.example.demo.dto.RegisterRequest;
import com.example.demo.service.MerchantRegistrationService;
import com.example.demo.service.VerificationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/merchants")
@CrossOrigin(
    origins = {"http://localhost:5500", "http://127.0.0.1:5500"},
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.DELETE},
    allowCredentials = "true",
    maxAge = 3600   
)
@RequiredArgsConstructor
public class MerchantRegistrationController {

    
    private final MerchantRegistrationService registrationService;
    private final VerificationService verificationService;

    @GetMapping("/check-email")
    public ResponseEntity<Boolean> checkEmailExists(@RequestParam String email) {
        boolean exists = registrationService.isEmailExists(email);
        return ResponseEntity.ok(exists);
    }

    @PostMapping("/send-registration-code")
    public ResponseEntity<?> sendRegistrationCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String name = request.get("name");
        
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "電子郵件不能為空"));
        }
        
        try {
            // 檢查電子郵件是否已被註冊
            if (registrationService.isEmailExists(email)) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "此電子郵件已被註冊"));
            }
            
            // 發送商家註冊驗證碼
            boolean success = verificationService.sendMerchantRegistrationCode(email, name != null ? name : "商家");
            
            if (success) {
                return ResponseEntity.ok(Map.of("success", true, "message", "驗證碼已發送"));
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("success", false, "message", "發送驗證碼失敗"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "發送驗證碼失敗: " + e.getMessage()));
        }
    }

    @PostMapping("/verify-registration-code")
    public ResponseEntity<?> verifyRegistrationCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");
        
        if (email == null || email.isEmpty() || code == null || code.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "電子郵件和驗證碼不能為空"));
        }
        
        try {
            // 驗證驗證碼
            boolean isValid = verificationService.verifyCode(email, code, "MERCHANT_REGISTRATION");
            
            if (isValid) {
                return ResponseEntity.ok(Map.of("success", true, "message", "驗證成功"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "驗證碼無效或已過期"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "驗證失敗: " + e.getMessage()));
        }
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
