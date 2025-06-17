package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/restaurant-images")
@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://localhost:5500"})
public class RestaurantImageController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * 獲取餐廳的圖片
     * @param restaurantId 餐廳ID
     * @return 圖片資料
     */
    @GetMapping("/{restaurantId}")
    public ResponseEntity<?> getRestaurantImage(@PathVariable String restaurantId) {
        try {
            String sql = "SELECT photo_url FROM google_restaurant_photos WHERE restaurant_place_id = ? LIMIT 1";
            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, restaurantId);
            
            if (results.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            byte[] photoData = (byte[]) results.get(0).get("photo_url");
            if (photoData == null) {
                return ResponseEntity.notFound().build();
            }
            
            // 將圖片轉換為Base64
            String base64Image = Base64.getEncoder().encodeToString(photoData);
            Map<String, Object> response = new HashMap<>();
            response.put("imageData", "data:image/jpeg;base64," + base64Image);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("獲取圖片失敗: " + e.getMessage());
        }
    }

    /**
     * 獲取餐廳的圖片（直接返回圖片數據）
     * @param restaurantId 餐廳ID
     * @return 圖片數據
     */
    @GetMapping(value = "/{restaurantId}/raw", produces = MediaType.IMAGE_JPEG_VALUE)
    public ResponseEntity<?> getRestaurantImageRaw(@PathVariable String restaurantId) {
        try {
            String sql = "SELECT photo_url FROM google_restaurant_photos WHERE restaurant_place_id = ? LIMIT 1";
            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, restaurantId);
            
            if (results.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            byte[] photoData = (byte[]) results.get(0).get("photo_url");
            if (photoData == null) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(photoData);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 獲取所有餐廳的圖片
     * @return 所有餐廳的圖片資訊
     */
    @GetMapping("/all")
    public ResponseEntity<?> getAllRestaurantImages() {
        try {
            String sql = "SELECT p.restaurant_place_id, r.name AS restaurant_name " +
                        "FROM google_restaurant_photos p " +
                        "JOIN google_restaurants r ON p.restaurant_place_id = r.place_id";
            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql);
            
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("獲取圖片失敗: " + e.getMessage());
        }
    }
} 