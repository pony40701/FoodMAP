package com.example.demo.controller;

import com.example.demo.entity.UserFavorite;
import com.example.demo.repository.UserFavoriteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.*;

@RestController
@RequestMapping("/api/favorites")
@CrossOrigin(
    origins = {"http://127.0.0.1:5500", "http://localhost:5500"},
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.DELETE},
    allowCredentials = "true",
    maxAge = 3600
)
public class UserFavoriteController {

    @Autowired
    private UserFavoriteRepository favoriteRepository;
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    // 獲取使用者的所有收藏餐廳
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserFavorites(@PathVariable Long userId) {
        try {
            // 獲取使用者的所有收藏
            List<UserFavorite> favorites = favoriteRepository.findByUserId(userId);
            
            // 如果沒有收藏，返回空列表
            if (favorites.isEmpty()) {
                return ResponseEntity.ok(Collections.emptyList());
            }
            
            // 獲取所有收藏餐廳的詳細資訊
            List<Map<String, Object>> restaurantDetails = new ArrayList<>();
            for (UserFavorite favorite : favorites) {
                String sql = "SELECT id, place_id, name, address, rating, user_ratings_total FROM google_restaurants WHERE place_id = ?";
                List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, favorite.getRestaurantPlaceId());
                
                if (!results.isEmpty()) {
                    Map<String, Object> restaurant = results.get(0);
                    restaurant.put("favorite_id", favorite.getId());
                    restaurant.put("created_at", favorite.getCreatedAt());
                    restaurantDetails.add(restaurant);
                }
            }
            
            return ResponseEntity.ok(restaurantDetails);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "獲取收藏列表失敗：" + e.getMessage()));
        }
    }

    // 新增收藏
    @PostMapping("/add")
    public ResponseEntity<?> addFavorite(@RequestBody Map<String, Object> request) {
        try {
            // 獲取請求參數
            Long userId = Long.parseLong(request.get("userId").toString());
            String restaurantPlaceId = request.get("restaurantPlaceId").toString();
            
            // 檢查是否已經收藏
            if (favoriteRepository.existsByUserIdAndRestaurantPlaceId(userId, restaurantPlaceId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "此餐廳已在收藏列表中"));
            }
            
            // 創建新的收藏記錄
            UserFavorite favorite = new UserFavorite();
            favorite.setUserId(userId);
            favorite.setRestaurantPlaceId(restaurantPlaceId);
            
            // 儲存收藏
            favorite = favoriteRepository.save(favorite);
            
            // 獲取餐廳詳細資訊
            String sql = "SELECT id, place_id, name, address, rating, user_ratings_total FROM google_restaurants WHERE place_id = ?";
            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, restaurantPlaceId);
            
            if (results.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                    "message", "收藏成功，但無法獲取餐廳詳細資訊",
                    "favorite_id", favorite.getId()
                ));
            }
            
            Map<String, Object> response = new HashMap<>(results.get(0));
            response.put("favorite_id", favorite.getId());
            response.put("created_at", favorite.getCreatedAt());
            response.put("message", "收藏成功");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "新增收藏失敗：" + e.getMessage()));
        }
    }

    // 移除收藏
    @DeleteMapping("/remove/{userId}/{restaurantPlaceId}")
    public ResponseEntity<?> removeFavorite(
            @PathVariable Long userId,
            @PathVariable String restaurantPlaceId) {
        try {
            // 檢查收藏是否存在
            Optional<UserFavorite> favorite = favoriteRepository.findByUserIdAndRestaurantPlaceId(userId, restaurantPlaceId);
            
            if (favorite.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "找不到此收藏記錄"));
            }
            
            // 刪除收藏
            favoriteRepository.delete(favorite.get());
            
            return ResponseEntity.ok(Map.of("message", "成功移除收藏"));
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "移除收藏失敗：" + e.getMessage()));
        }
    }

    // 檢查是否已收藏
    @GetMapping("/check/{userId}/{restaurantPlaceId}")
    public ResponseEntity<?> checkFavorite(
            @PathVariable Long userId,
            @PathVariable String restaurantPlaceId) {
        try {
            boolean isFavorited = favoriteRepository.existsByUserIdAndRestaurantPlaceId(userId, restaurantPlaceId);
            return ResponseEntity.ok(Map.of("isFavorited", isFavorited));
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "檢查收藏狀態失敗：" + e.getMessage()));
        }
    }
} 