package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
import java.util.UUID;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;

@RestController
@RequestMapping("/api/merchants/restaurant")
@CrossOrigin(
    origins = {"http://127.0.0.1:5500", "http://localhost:5500"},
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.PUT, RequestMethod.OPTIONS},
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

    @PutMapping(value = "/basic-info", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateBasicInfo(
            @RequestHeader("Authorization") String authHeader,
            @ModelAttribute MerchantRestaurantDTO.UpdateBasicInfoRequest request) {
        logger.info("收到更新基本資料請求");
        
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

        try {
            // 處理頭像上傳
            String avatarUrl = null;
            if (request.getAvatar() != null && !request.getAvatar().isEmpty()) {
                String fileName = UUID.randomUUID().toString() + "_" + request.getAvatar().getOriginalFilename();
                Path uploadPath = Paths.get("uploads");
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                Path filePath = uploadPath.resolve(fileName);
                Files.copy(request.getAvatar().getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                avatarUrl = "/uploads/" + fileName;
                logger.info("頭像上傳成功: {}", avatarUrl);
            }

            // 更新資料庫
            int updatedRows = merchantAccountRepository.updateBasicInfo(
                restaurantId,
                request.getName(),
                request.getEmail(),
                request.getPhoneNumber(),
                request.getAddress(),
                avatarUrl
            );

            if (updatedRows > 0) {
                logger.info("基本資料更新成功");
                // 獲取更新後的餐廳資料
                return merchantAccountRepository.findRestaurantInfoById(restaurantId)
                    .map(projection -> {
                        MerchantRestaurantDTO dto = MerchantRestaurantDTO.fromProjection(projection);
                        return ResponseEntity.ok().body(dto);
                    })
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "找不到餐廳資料"));
            } else {
                logger.warn("找不到要更新的餐廳資料");
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "找不到要更新的餐廳資料");
            }
        } catch (Exception e) {
            logger.error("更新基本資料時發生錯誤", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "更新基本資料失敗: " + e.getMessage());
        }
    }

    @PutMapping("/business-info")
    public ResponseEntity<?> updateBusinessInfo(
        @RequestHeader("Authorization") String authHeader,
        @RequestBody MerchantRestaurantDTO.UpdateBusinessInfoRequest request) {
    logger.info("收到更新營業資訊請求");
    
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

    try {
        // 更新資料庫
        int updatedRows = merchantAccountRepository.updateBusinessInfo(
            restaurantId,
            request.getBusinessHours(),
            request.getCuisineType(),
            request.getPaymentMethods()
        );

        if (updatedRows > 0) {
            logger.info("營業資訊更新成功");
            // 獲取更新後的餐廳資料
            return merchantAccountRepository.findRestaurantInfoById(restaurantId)
                .map(projection -> {
                    MerchantRestaurantDTO dto = MerchantRestaurantDTO.fromProjection(projection);
                    return ResponseEntity.ok().body(dto);
                })
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "找不到餐廳資料"));
        } else {
            logger.warn("找不到要更新的餐廳資料");
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "找不到要更新的餐廳資料");
        }
    } catch (Exception e) {
        logger.error("更新營業資訊時發生錯誤", e);
        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "更新營業資訊失敗: " + e.getMessage());
    }
    }

    @PutMapping("/description")
    public ResponseEntity<?> updateDescription(
        @RequestHeader("Authorization") String authHeader,
        @RequestBody Map<String, String> request) {
        logger.info("收到更新餐廳簡介請求");
        
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

        try {
            String description = request.get("description");
            // 更新資料庫
            int updatedRows = merchantAccountRepository.updateDescription(
                restaurantId,
                description
            );

            if (updatedRows > 0) {
                logger.info("餐廳簡介更新成功");
                // 獲取更新後的餐廳資料
                return merchantAccountRepository.findRestaurantInfoById(restaurantId)
                    .map(projection -> {
                        MerchantRestaurantDTO dto = MerchantRestaurantDTO.fromProjection(projection);
                        return ResponseEntity.ok().body(dto);
                    })
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "找不到餐廳資料"));
            } else {
                logger.warn("找不到要更新的餐廳資料");
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "找不到要更新的餐廳資料");
            }
        } catch (Exception e) {
            logger.error("更新餐廳簡介時發生錯誤", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "更新餐廳簡介失敗: " + e.getMessage());
        }
    }
} 