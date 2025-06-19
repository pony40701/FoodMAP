package com.example.demo.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.Favorite;
import com.example.demo.entity.FavoriteId;
import com.example.demo.repository.FavoriteRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/users")
public class FavoriteController {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/restaurants")
    public ResponseEntity<List<Favorite>> getAllRestaurants() {
        List<Favorite> restaurants = favoriteRepository.findAllRestaurants();
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping("/restaurant/{userId}/{targetId}")
    public ResponseEntity<?> getFavoriteByIds(
            @PathVariable Long userId,
            @PathVariable String targetId) {
        FavoriteId favoriteId = new FavoriteId(userId, "restaurant", targetId);
        return favoriteRepository.findById(favoriteId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Favorite>> getRestaurantsByCategory(
            @PathVariable String category) {
        try {
            List<Favorite> all = favoriteRepository.findAllRestaurants();
            List<Favorite> filtered = all.stream().filter(fav -> {
                try {
                    JsonNode data = objectMapper.readTree(fav.getTargetId());
                    if (data.has("cuisine_type") && data.get("cuisine_type").isArray()) {
                        for (JsonNode t : data.get("cuisine_type")) {
                            if (t.asText().equalsIgnoreCase(category)) {
                                return true;
                            }
                        }
                    }
                } catch (Exception ignored) {}
                return false;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(filtered);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/categories")
    public ResponseEntity<Set<String>> getAllCategories() {
        try {
            List<Favorite> all = favoriteRepository.findAllRestaurants();
            Set<String> cats = new HashSet<>();
            all.forEach(fav -> {
                try {
                    JsonNode data = objectMapper.readTree(fav.getTargetId());
                    if (data.has("cuisine_type") && data.get("cuisine_type").isArray()) {
                        for (JsonNode t : data.get("cuisine_type")) {
                            cats.add(t.asText());
                        }
                    }
                } catch (Exception ignored) {}
            });
            return ResponseEntity.ok(cats);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/system-status")
    public ResponseEntity<?> getSystemStatus() {
        try {
            List<Favorite> all = favoriteRepository.findAllRestaurants();
            int total = all.size();
            int catCount = 0;
            Set<String> cats = new HashSet<>();
            Map<String,Integer> stats = new HashMap<>();

            for (Favorite fav : all) {
                try {
                    JsonNode data = objectMapper.readTree(fav.getTargetId());
                    if (data.has("cuisine_type") && data.get("cuisine_type").isArray()) {
                        catCount++;
                        for (JsonNode t : data.get("cuisine_type")) {
                            String txt = t.asText();
                            cats.add(txt);
                            stats.put(txt, stats.getOrDefault(txt, 0) + 1);
                        }
                    }
                } catch (Exception ignored) {}
            }

            Map<String,Object> resp = new LinkedHashMap<>();
            resp.put("total_restaurants", total);
            resp.put("categorized_restaurants", catCount);
            resp.put("uncategorized_restaurants", total - catCount);
            resp.put("available_categories", cats);
            resp.put("category_statistics", stats);
            resp.put("time", LocalDateTime.now()
                    .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            Map<String,Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "獲取系統狀態失敗: " + e.getMessage());
            return ResponseEntity.status(500).body(err);
        }
    }

    @PostMapping("")
    public ResponseEntity<?> addFavorite(@RequestBody Map<String,Object> req) {
        try {
            if (!req.containsKey("userId") || !req.containsKey("targetId")) {
                return ResponseEntity.badRequest().body(Map.of(
                   "success", false,
                   "message", "缺少必要欄位"
                ));
            }
            Long userId = Long.parseLong(req.get("userId").toString());
            String targetId = req.get("targetId").toString();
            if (favoriteRepository.existsByUserIdAndTargetId(userId, targetId)) {
                return ResponseEntity.badRequest().body(Map.of(
                   "success", false,
                   "message", "已經收藏過此餐廳"
                ));
            }
            Favorite fav = new Favorite();
            fav.setUserId(userId);
            fav.setTargetId(targetId);
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

    @GetMapping("/{userId}/favorites/restaurants")
    public ResponseEntity<List<Map<String,Object>>> getUserFavoriteRestaurants(
            @PathVariable Long userId) {
        List<String> raw = favoriteRepository.findFavoriteJsonRawByUserId(userId);
        List<Map<String,Object>> out = raw.stream().map(json -> {
            try {
                return objectMapper.readValue(
                    json, new TypeReference<Map<String,Object>>() {});
            } catch (Exception e) {
                throw new RuntimeException("JSON 解析失敗", e);
            }
        }).collect(Collectors.toList());
        return ResponseEntity.ok(out);
    }

    @DeleteMapping("/{userId}/favorites/restaurants/{targetId}")
    @Modifying
    @Transactional
    public ResponseEntity<Map<String,Object>> removeFavorite(
            @PathVariable Long userId,
            @PathVariable String targetId) {
        int deleted = favoriteRepository.deleteByUserIdAndTargetId(userId, targetId);
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

    @PostMapping("/{userId}/favorites/restaurants/{placeId}")
    public ResponseEntity<Map<String,Object>> addFavorite(
        @PathVariable Long userId,
        @PathVariable String placeId
    ) {
        if (favoriteRepository.existsByUserIdAndTargetId(userId, placeId)) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", "已收藏過"));
        }
        Favorite fav = new Favorite();
        fav.setUserId(userId);
        fav.setTargetType("restaurant");
        fav.setTargetId(placeId);
        fav.setFavoritedAt(LocalDateTime.now());
        favoriteRepository.save(fav);
        return ResponseEntity.ok(Map.of("success", true, "message", "收藏成功"));
    }

    /**
     * 通用收藏端點，支援 targetType = restaurant 或 review
     * POST /api/users/favorite
     * body: { userId, targetId, targetType, restaurantPlaceId }
     */
    @PostMapping("/favorite")
    public ResponseEntity<?> addUniversalFavorite(@RequestBody Map<String,Object> req) {
        try {
            if (!req.containsKey("userId") || !req.containsKey("targetId") || !req.containsKey("targetType")) {
                return ResponseEntity.badRequest().body(Map.of(
                   "success", false,
                   "message", "缺少必要欄位"
                ));
            }
            Long userId = Long.parseLong(req.get("userId").toString());
            String targetId = req.get("targetId").toString();
            String targetType = req.get("targetType").toString();
            String restaurantPlaceId = req.getOrDefault("restaurantPlaceId", null) != null ? req.get("restaurantPlaceId").toString() : null;

            // 檢查是否已經收藏
            if (favoriteRepository.existsByUserIdAndTargetId(userId, targetId)) {
                return ResponseEntity.badRequest().body(Map.of(
                   "success", false,
                   "message", "已經收藏過此項目"
                ));
            }
            Favorite fav = new Favorite();
            fav.setUserId(userId);
            fav.setTargetId(targetId);
            fav.setTargetType(targetType);
            fav.setFavoritedAt(LocalDateTime.now());
            fav.setRestaurantPlaceId(restaurantPlaceId);
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

    /**
     * 取消收藏評論
     * DELETE /api/users/favorite/review/{userId}/{reviewId}
     */
    @DeleteMapping("/favorite/review/{userId}/{reviewId}")
    @Transactional
    public ResponseEntity<?> removeReviewFavorite(@PathVariable Long userId, @PathVariable String reviewId) {
        int deleted = favoriteRepository.deleteByUserIdAndTargetIdAndTargetType(userId, reviewId, "review");
        if (deleted > 0) {
            return ResponseEntity.ok(Map.of("success", true, "message", "已取消收藏評論"));
        } else {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", "未找到收藏紀錄"));
        }
    }

    @PostMapping("/favorite/toggle")
    @Transactional
    public ResponseEntity<?> toggleReviewFavorite(
            @RequestParam Long userId, 
            @RequestParam Long reviewId,
            @RequestParam(required = false) String restaurantPlaceId) {
        // First, check if the favorite already exists
        String checkSql = "SELECT COUNT(*) FROM user_favorites WHERE user_id = ? AND target_id = ? AND target_type = 'review'";
        Integer count = jdbcTemplate.queryForObject(checkSql, new Object[]{userId, reviewId}, Integer.class);

        Map<String, Object> response = new HashMap<>();

        if (count != null && count > 0) {
            // Favorite exists, so delete it
            String deleteSql = "DELETE FROM user_favorites WHERE user_id = ? AND target_id = ? AND target_type = 'review'";
            int deletedRows = jdbcTemplate.update(deleteSql, userId, reviewId);
            if (deletedRows > 0) {
                response.put("success", true);
                response.put("message", "取消收藏成功");
                response.put("isFavorited", false);
            } else {
                response.put("success", false);
                response.put("message", "取消收藏失敗");
            }
        } else {
            // Favorite does not exist, so add it
            String insertSql = "INSERT INTO user_favorites (user_id, target_id, target_type, favorited_at, restaurant_place_id) VALUES (?, ?, 'review', NOW(), ?)";
            int insertedRows = jdbcTemplate.update(insertSql, userId, reviewId, restaurantPlaceId);
            if (insertedRows > 0) {
                response.put("success", true);
                response.put("message", "收藏成功");
                response.put("isFavorited", true);
            } else {
                response.put("success", false);
                response.put("message", "收藏失敗");
            }
        }
        return ResponseEntity.ok(response);
    }
}
