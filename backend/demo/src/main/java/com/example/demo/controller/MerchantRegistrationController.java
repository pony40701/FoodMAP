package com.example.demo.controller;

import com.example.demo.dto.RegisterRequest;
import com.example.demo.service.MerchantRegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

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

    @PostMapping("/register")
public ResponseEntity<?> registerMerchant(@Valid @RequestBody RegisterRequest request) {
    try {
        registrationService.registerMerchant(request);
        return ResponseEntity.ok("註冊成功！");
    } catch (Exception e) {
        e.printStackTrace();  // 直接印堆疊到 console
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("註冊失敗: " + e.getMessage());
    }
}
}
