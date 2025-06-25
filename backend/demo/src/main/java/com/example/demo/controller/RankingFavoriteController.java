package com.example.demo.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.RestaurantListDTO;
import com.example.demo.entity.Favorite;
import com.example.demo.entity.GoogleRestaurant;
import com.example.demo.repository.FavoriteRepository;
import com.example.demo.repository.GoogleRestaurantRepository;
import com.example.demo.repository.LLeaderGoogleRestaurantPhotoRepository;

@RestController
@RequestMapping("/api/ranking-favorite")
@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://localhost:5500"}, allowCredentials = "true")
public class RankingFavoriteController {
    @Autowired
    private FavoriteRepository favoriteRepository;
    @Autowired
    private GoogleRestaurantRepository googleRestaurantRepository;
    @Autowired
    private LLeaderGoogleRestaurantPhotoRepository photoRepository;

    // 新增收藏
    @PostMapping("/add")
    public ResponseEntity<?> addFavorite(@RequestBody Map<String, Object> req) {
        try {
            if (!req.containsKey("userId") || !req.containsKey("restaurantId")) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "缺少必要欄位"
                ));
            }
            Long userId = Long.parseLong(req.get("userId").toString());
            String restaurantId = req.get("restaurantId").toString();
            if (favoriteRepository.existsByUserIdAndTargetId(userId, restaurantId)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "已經收藏過此餐廳"
                ));
            }
            Favorite fav = new Favorite();
            fav.setUserId(userId);
            fav.setTargetId(restaurantId);
            fav.setTargetType("restaurant");
            fav.setFavoritedAt(LocalDateTime.now());
            favoriteRepository.save(fav);
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

    // 取消收藏
    @DeleteMapping("/remove/{userId}/{restaurantId}")
    public ResponseEntity<?> removeFavorite(@PathVariable Long userId, @PathVariable String restaurantId) {
        int deleted = favoriteRepository.deleteByUserIdAndTargetId(userId, restaurantId);
        if (deleted > 0) {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "取消收藏成功"
            ));
        } else {
            return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "尚未收藏此餐廳，無法取消"
            ));
        }
    }

    // 查詢是否已收藏
    @GetMapping("/check/{userId}/{restaurantId}")
    public ResponseEntity<?> checkFavorite(@PathVariable Long userId, @PathVariable String restaurantId) {
        boolean isFavorited = favoriteRepository.existsByUserIdAndTargetId(userId, restaurantId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "isFavorited", isFavorited
        ));
    }

    /**
     * 取得所有用戶收藏的餐廳（合併重複 placeId，依收藏數排序）
     * GET /api/ranking-favorite/list
     */
    @GetMapping("/list")
    public ResponseEntity<List<RestaurantListDTO>> getAllFavoriteRestaurants() {
        // 取得所有收藏紀錄
        List<Favorite> allFavorites = favoriteRepository.findAllRestaurants();
        // 統計每個 placeId 的收藏數
        Map<String, Long> countMap = allFavorites.stream()
            .collect(Collectors.groupingBy(Favorite::getTargetId, Collectors.counting()));
        // 依收藏數排序，取得唯一 placeId 列表
        List<String> sortedPlaceIds = countMap.entrySet().stream()
            .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());
        // 取得餐廳詳細資料
        List<RestaurantListDTO> result = sortedPlaceIds.stream().map(placeId -> {
            GoogleRestaurant restaurant = googleRestaurantRepository.findById(placeId).orElse(null);
            if (restaurant == null) return null;
            String base64Photo = null;
            try {
                var photoOpt = photoRepository.findFirstByPlaceId(placeId);
                if (photoOpt.isPresent() && photoOpt.get().getPhotoUrl() != null) {
                    byte[] photoBytes = photoOpt.get().getPhotoUrl().getBytes();
                    base64Photo = "data:image/jpeg;base64," + java.util.Base64.getEncoder().encodeToString(photoBytes);
                }
            } catch (Exception e) {
                base64Photo = null;
            }
            return new RestaurantListDTO(
                restaurant.getName(),
                restaurant.getAddress(),
                restaurant.getRating(),
                restaurant.getReviewCount(),
                restaurant.getPlaceId(),
                restaurant.getCreatedAt(),
                restaurant.getDescription(),
                restaurant.getTypes(),
                base64Photo,
                restaurant.getLatitude() != null ? restaurant.getLatitude() : restaurant.getLat(),
                restaurant.getLongitude() != null ? restaurant.getLongitude() : restaurant.getLng(),
                restaurant.getOpeningHours()
            );
        }).filter(r -> r != null).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }
} 