package com.example.demo.controller;
//boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

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

@PostMapping("/register")
public ResponseEntity<String> registerMerchant(
    @RequestPart("data") RegisterRequest request,
    @RequestPart(value = "avatar", required = false) MultipartFile avatar,
    @RequestPart(value = "photos", required = false) List<MultipartFile> photos) {

    System.out.println("後端接收到照片數量：" + (photos != null ? photos.size() : "null"));
    
    if (photos != null) {
        for (MultipartFile photo : photos) {
            System.out.println("收到照片：" + photo.getOriginalFilename());
        }
    }

    registrationService.registerMerchant(
        request,
        avatar,
        photos != null ? photos : new ArrayList<>()
    );

    return ResponseEntity.ok("註冊成功！");
}
}
