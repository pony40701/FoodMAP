package com.example.demo.controller;

import com.example.demo.entity.Favorite;
import com.example.demo.entity.FavoriteId;
import com.example.demo.repository.FavoriteRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    @Autowired
    private FavoriteRepository favoriteRepository;
    
    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping("/restaurants")
    public ResponseEntity<List<Favorite>> getAllRestaurants() {
        List<Favorite> restaurants = favoriteRepository.findAllRestaurants();
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping("/restaurant/{userId}/{targetId}")
    public ResponseEntity<?> getFavoriteByIds(@PathVariable Long userId, @PathVariable String targetId) {
        FavoriteId favoriteId = new FavoriteId(userId, "restaurant", targetId);
        return favoriteRepository.findById(favoriteId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    /**
     * 按分類獲取餐廳資料
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Favorite>> getRestaurantsByCategory(@PathVariable String category) {
        try {
            List<Favorite> allRestaurants = favoriteRepository.findAllRestaurants();
            List<Favorite> filteredRestaurants = allRestaurants.stream()
                .filter(restaurant -> {
                    try {
                        JsonNode restaurantData = objectMapper.readTree(restaurant.getTargetId());
                        if (restaurantData.has("cuisine_type") && restaurantData.get("cuisine_type").isArray()) {
                            for (JsonNode type : restaurantData.get("cuisine_type")) {
                                if (type.asText().equalsIgnoreCase(category)) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    } catch (Exception e) {
                        return false;
                    }
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(filteredRestaurants);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
    
    /**
     * 獲取所有可用的餐廳分類
     */
    @GetMapping("/categories")
    public ResponseEntity<Set<String>> getAllCategories() {
        try {
            List<Favorite> allRestaurants = favoriteRepository.findAllRestaurants();
            Set<String> allCategories = new HashSet<>();
            
            for (Favorite restaurant : allRestaurants) {
                try {
                    JsonNode restaurantData = objectMapper.readTree(restaurant.getTargetId());
                    if (restaurantData.has("cuisine_type") && restaurantData.get("cuisine_type").isArray()) {
                        for (JsonNode type : restaurantData.get("cuisine_type")) {
                            allCategories.add(type.asText());
                        }
                    }
                } catch (Exception e) {
                    // Skip invalid JSON
                }
            }
            
            return ResponseEntity.ok(allCategories);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
    
    /**
     * 獲取系統狀態資訊
     */
    @GetMapping("/system-status")
    public ResponseEntity<?> getSystemStatus() {
        try {
            List<Favorite> allRestaurants = favoriteRepository.findAllRestaurants();
            int totalCount = allRestaurants.size();
            
            int categorizedCount = 0;
            Set<String> availableCategories = new HashSet<>();
            Map<String, Integer> categoryStats = new HashMap<>();
            
            for (Favorite restaurant : allRestaurants) {
                try {
                    JsonNode restaurantData = objectMapper.readTree(restaurant.getTargetId());
                    if (restaurantData.has("cuisine_type") && restaurantData.get("cuisine_type").isArray()) {
                        categorizedCount++;
                        for (JsonNode type : restaurantData.get("cuisine_type")) {
                            String category = type.asText();
                            availableCategories.add(category);
                            categoryStats.put(category, categoryStats.getOrDefault(category, 0) + 1);
                        }
                    }
                } catch (Exception e) {
                    // Skip invalid JSON
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("total_restaurants", totalCount);
            response.put("categorized_restaurants", categorizedCount);
            response.put("uncategorized_restaurants", totalCount - categorizedCount);
            response.put("available_categories", availableCategories);
            response.put("category_statistics", categoryStats);
            response.put("time", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "獲取系統狀態失敗: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * 新增收藏
     */
    @PostMapping("")
    public ResponseEntity<?> addFavorite(@RequestBody Map<String, Object> request) {
        try {
            // 驗證必要欄位
            if (!request.containsKey("userId") || !request.containsKey("targetId")) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "缺少必要欄位"
                ));
            }

            Long userId = Long.parseLong(request.get("userId").toString());
            String targetId = request.get("targetId").toString();
            
            // 檢查是否已經收藏
            if (favoriteRepository.existsByUserIdAndTargetId(userId, targetId)) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "已經收藏過此餐廳"
                ));
            }

            // 創建新的收藏記錄
            Favorite favorite = new Favorite();
            favorite.setUserId(userId);
            favorite.setTargetId(targetId);
            favorite.setTargetType("restaurant");
            favorite.setFavoritedAt(LocalDateTime.now());
            
            // 儲存收藏
            favoriteRepository.save(favorite);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "收藏成功"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "收藏失敗: " + e.getMessage()
            ));
        }
    }

    /**
     * 獲取用戶收藏的餐廳列表
     */
    @GetMapping("/{userId}/restaurants")
    public ResponseEntity<?> getUserFavoriteRestaurants(@PathVariable Long userId) {
        try {
            List<Favorite> favorites = favoriteRepository.findUserRestaurants(userId);
            
            if (favorites.isEmpty()) {
                return ResponseEntity.ok(Collections.emptyList());
            }

            return ResponseEntity.ok(favorites.stream()
                .map(favorite -> Map.of(
                    "targetId", favorite.getTargetId(),
                    "favoritedAt", favorite.getFavoritedAt().format(DateTimeFormatter.ISO_DATE_TIME)
                ))
                .collect(Collectors.toList()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "獲取收藏列表失敗: " + e.getMessage()
            ));
        }
    }

    /**
     * 刪除收藏
     */
    @DeleteMapping("/{userId}/restaurants/{targetId}")
    public ResponseEntity<?> removeFavorite(@PathVariable Long userId, @PathVariable String targetId) {
        try {
            favoriteRepository.deleteByUserIdAndTargetId(userId, targetId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "取消收藏成功"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "取消收藏失敗: " + e.getMessage()
            ));
        }
    }
}