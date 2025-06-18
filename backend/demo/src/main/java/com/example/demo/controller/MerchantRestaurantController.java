package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.example.demo.dto.MerchantRestaurantDTO;
import com.example.demo.repository.MerchantAccountRepository;
import com.example.demo.security.MerchantJwtService;
import com.example.demo.entity.Restaurant;
import com.example.demo.entity.RestaurantPhoto;
import com.example.demo.repository.RestaurantPhotoRepository;
import com.example.demo.repository.LocalRestaurantRepository;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/merchants/restaurant")
@CrossOrigin(
    origins = {"http://127.0.0.1:5500", "http://localhost:5500"},
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.PUT},
    allowCredentials = "true",
    maxAge = 3600
)
@RequiredArgsConstructor
public class MerchantRestaurantController {
    private static final Logger logger = LoggerFactory.getLogger(MerchantRestaurantController.class);

    private final MerchantAccountRepository merchantAccountRepository;
    private final MerchantJwtService merchantJwtService;
    private final LocalRestaurantRepository restaurantRepository;
    private final RestaurantPhotoRepository restaurantPhotoRepository;

    @GetMapping("/validate")
    public ResponseEntity<Boolean> validateToken(@RequestHeader("Authorization") String authHeader) {
        logger.info("收到 token 驗證請求");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.warn("未提供有效的 Authorization header");
            return ResponseEntity.ok(false);
        }

        String token = authHeader.substring(7);
        String email = merchantJwtService.extractEmail(token);
        logger.info("正在驗證 token，email: {}", email);
        
        boolean isValid = merchantJwtService.validateToken(token, email);
        logger.info("token 驗證結果: {}", isValid);
        
        return ResponseEntity.ok(isValid);
    }

    @GetMapping("/info")
    public ResponseEntity<MerchantRestaurantDTO> getRestaurantInfo(@RequestHeader("Authorization") String authHeader) {
        logger.info("收到獲取餐廳資料請求");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.warn("未提供有效的 Authorization header");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "未提供有效的認證token");
        }

        String token = authHeader.substring(7);
        String email = merchantJwtService.extractEmail(token);
        Integer restaurantId = merchantJwtService.extractRestaurantId(token);
        logger.info("解析 token - email: {}, restaurantId: {}", email, restaurantId);
        
        // 驗證 token
        if (!merchantJwtService.validateToken(token, email)) {
            logger.warn("無效的 token");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "無效的token");
        }

        // 獲取餐廳資料
        logger.info("開始查詢餐廳資料，restaurantId: {}", restaurantId);
        return merchantAccountRepository.findRestaurantInfoById(restaurantId)
                .map(projection -> {
                    logger.info("成功獲取餐廳資料: {}", projection);
                    logger.info("頭像URL: {}", projection.getAvatar_url());
                    MerchantRestaurantDTO dto = MerchantRestaurantDTO.fromProjection(projection);
                    logger.info("轉換後的 DTO 資料: {}", dto);
                    logger.info("DTO 中的頭像URL: {}", dto.getAvatarUrl());
                    return ResponseEntity.ok(dto);
                })
                .orElseThrow(() -> {
                    logger.warn("找不到餐廳資料，restaurantId: {}", restaurantId);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "找不到餐廳資料");
                });
    }

    @GetMapping("/photos/{restaurantId}")
    public ResponseEntity<List<String>> getRestaurantPhotos(@PathVariable Integer restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        List<String> photoUrls = restaurant.getPhotos().stream()
                .map(RestaurantPhoto::getImageUrl)
                .collect(Collectors.toList());

        return ResponseEntity.ok(photoUrls);
    }
} 