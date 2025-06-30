package com.example.demo.controller;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/google-reviews")
@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://localhost:5500", "http://localhost:8080", "http://127.0.0.1:8080"})
public class GoogleReviewsController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // 獲取用戶的評論 - 根據用戶ID查找其發表的評論
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserReviews(@PathVariable Long userId) {
        try {
            System.out.println("獲取用戶評論 - 用戶ID: " + userId);
            
            // 先獲取用戶名稱
            String userSql = "SELECT username FROM users WHERE id = ?";
            String username;
            
            try {
                username = jdbcTemplate.queryForObject(userSql, String.class, userId);
            } catch (Exception e) {
                System.err.println("獲取用戶信息失敗: " + e.getMessage());
                // 如果找不到用戶，返回空列表
                return ResponseEntity.ok(Arrays.asList());
            }
            
            // 使用用戶名稱查詢評論（因為 google_reviews 表沒有 user_id，只有 author_name）
            String sql = "SELECT id, restaurant_place_id as place_id, restaurant_name, " +
                        "rating, text as content, time_created as created_at, author_name, " +
                        "profile_photo_url FROM google_reviews WHERE author_name = ? ORDER BY time_created DESC";
            
            List<Map<String, Object>> reviews = jdbcTemplate.queryForList(sql, username);
            
            // 處理資料格式，確保前端相容性
            reviews.forEach(review -> {
                // 確保時間格式正確
                if (review.get("created_at") != null) {
                    review.put("time", review.get("created_at"));
                    review.put("createdAt", review.get("created_at"));
                }
                // 確保評分為整數
                if (review.get("rating") != null) {
                    review.put("rating", ((Number) review.get("rating")).intValue());
                }
                // 添加標題和標籤欄位（新功能）
                if (!review.containsKey("title")) {
                    review.put("title", "");
                }
                review.put("tags", "[]");
                
                // 添加用戶ID以便前端使用
                review.put("user_id", userId);
            });
            
            System.out.println("成功獲取用戶評論 - 用戶ID: " + userId + ", 評論數量: " + reviews.size());
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            System.err.println("獲取用戶評論時發生錯誤: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> error = new HashMap<>();
            error.put("error", "獲取評論失敗: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    // 新增評論
    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody Map<String, Object> reviewData) {
        try {
            System.out.println("新增評論請求 - 數據: " + reviewData);
            
            // 驗證必填欄位
            if (!reviewData.containsKey("user_id") || !reviewData.containsKey("restaurant_name") 
                || !reviewData.containsKey("rating") || !reviewData.containsKey("content")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "缺少必填欄位");
                return ResponseEntity.badRequest().body(error);
            }
            
            // 獲取用戶信息
            Long userId = Long.valueOf(reviewData.get("user_id").toString());
            String userSql = "SELECT username FROM users WHERE id = ?";
            String authorName;
            
            try {
                authorName = jdbcTemplate.queryForObject(userSql, String.class, userId);
            } catch (Exception e) {
                System.err.println("獲取用戶信息失敗: " + e.getMessage());
                authorName = "匿名用戶";
            }
            
            // 檢查是否需要添加 title 和 tags 欄位到表中
            // 先嘗試檢查表結構
            try {
                jdbcTemplate.queryForList("SELECT title FROM google_reviews LIMIT 1");
            } catch (Exception e) {
                // 如果 title 欄位不存在，則添加
                try {
                    jdbcTemplate.execute("ALTER TABLE google_reviews ADD COLUMN title VARCHAR(255) DEFAULT ''");
                    System.out.println("已添加 title 欄位到 google_reviews 表");
                } catch (Exception ex) {
                    System.out.println("title 欄位可能已存在或添加失敗: " + ex.getMessage());
                }
            }
            
            try {
                jdbcTemplate.queryForList("SELECT tags FROM google_reviews LIMIT 1");
            } catch (Exception e) {
                // 如果 tags 欄位不存在，則添加
                try {
                    jdbcTemplate.execute("ALTER TABLE google_reviews ADD COLUMN tags TEXT DEFAULT '[]'");
                    System.out.println("已添加 tags 欄位到 google_reviews 表");
                } catch (Exception ex) {
                    System.out.println("tags 欄位可能已存在或添加失敗: " + ex.getMessage());
                }
            }
            
            // 準備插入數據 - 使用實際的表結構
            String sql = "INSERT INTO google_reviews (restaurant_place_id, restaurant_name, " +
                        "rating, text, time_created, author_name, profile_photo_url, title, tags) " +
                        "VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?)";
            
            Object placeId = reviewData.get("place_id");
            String restaurantName = (String) reviewData.get("restaurant_name");
            Integer rating = Integer.valueOf(reviewData.get("rating").toString());
            String text = (String) reviewData.get("content");
            String profilePhotoUrl = (String) reviewData.getOrDefault("profile_photo_url", "");
            String title = (String) reviewData.getOrDefault("title", "");
            
            // 處理標籤
            String tags = "[]";
            if (reviewData.containsKey("tags")) {
                Object tagsObj = reviewData.get("tags");
                if (tagsObj instanceof List) {
                    @SuppressWarnings("unchecked")
                    List<String> tagList = (List<String>) tagsObj;
                    if (!tagList.isEmpty()) {
                        tags = "[\"" + String.join("\",\"", tagList) + "\"]";
                    }
                } else if (tagsObj instanceof String) {
                    String tagsStr = (String) tagsObj;
                    if (tagsStr.startsWith("[") && tagsStr.endsWith("]")) {
                        tags = tagsStr;
                    } else {
                        // 視為逗號分隔的字串
                        String[] tagArray = tagsStr.split(",");
                        List<String> tagList = Arrays.stream(tagArray)
                                .map(String::trim)
                                .filter(tag -> !tag.isEmpty())
                                .collect(Collectors.toList());
                        if (!tagList.isEmpty()) {
                            tags = "[\"" + String.join("\",\"", tagList) + "\"]";
                        }
                    }
                }
            }
            
            System.out.println("插入評論 - SQL: " + sql);
            System.out.println("參數: placeId=" + placeId + ", restaurantName=" + restaurantName + 
                             ", rating=" + rating + ", authorName=" + authorName + 
                             ", title=" + title + ", tags=" + tags);
            
            int rowsAffected = jdbcTemplate.update(sql, placeId, restaurantName, 
                                                  rating, text, authorName, profilePhotoUrl, title, tags);
            
            if (rowsAffected > 0) {
                System.out.println("評論新增成功 - 用戶: " + authorName);
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "評論發布成功");
                response.put("user_id", userId);
                response.put("author_name", authorName);
                response.put("restaurant_name", restaurantName);
                response.put("rating", rating);
                response.put("title", title);
                
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "評論新增失敗");
                return ResponseEntity.status(500).body(error);
            }
            
        } catch (Exception e) {
            System.err.println("新增評論時發生錯誤: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> error = new HashMap<>();
            error.put("error", "新增評論失敗: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    // 刪除評論
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteReview(@PathVariable Long reviewId) {
        try {
            System.out.println("刪除評論請求 - 評論ID: " + reviewId);
            
            String sql = "DELETE FROM google_reviews WHERE id = ?";
            int rowsAffected = jdbcTemplate.update(sql, reviewId);
            
            if (rowsAffected > 0) {
                System.out.println("評論刪除成功 - 評論ID: " + reviewId);
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "評論刪除成功");
                
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "找不到指定的評論");
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            System.err.println("刪除評論時發生錯誤: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> error = new HashMap<>();
            error.put("error", "刪除評論失敗: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    // 獲取評論詳情
    @GetMapping("/{reviewId}")
    public ResponseEntity<?> getReviewById(@PathVariable Long reviewId) {
        try {
            System.out.println("獲取評論詳情 - 評論ID: " + reviewId);
            
            String sql = "SELECT * FROM google_reviews WHERE id = ?";
            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, reviewId);
            
            if (results.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            System.out.println("成功獲取評論詳情 - 評論ID: " + reviewId);
            return ResponseEntity.ok(results.get(0));
        } catch (Exception e) {
            System.err.println("獲取評論詳情時發生錯誤: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> error = new HashMap<>();
            error.put("error", "獲取評論詳情失敗: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    // 更新評論
    @PutMapping("/{reviewId}")
    public ResponseEntity<?> updateReview(@PathVariable Long reviewId, @RequestBody Map<String, Object> reviewData) {
        try {
            System.out.println("更新評論請求 - 評論ID: " + reviewId + ", 數據: " + reviewData);
            
            // 檢查評論是否存在
            String checkSql = "SELECT COUNT(*) FROM google_reviews WHERE id = ?";
            Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, reviewId);
            
            if (count == null || count == 0) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "找不到指定的評論");
                return ResponseEntity.notFound().build();
            }
            
            // 準備更新的欄位
            StringBuilder sqlBuilder = new StringBuilder("UPDATE google_reviews SET ");
            List<Object> params = new ArrayList<>();
            List<String> updateFields = new ArrayList<>();
            
            // 評分
            if (reviewData.containsKey("rating")) {
                updateFields.add("rating = ?");
                params.add(Integer.valueOf(reviewData.get("rating").toString()));
            }
            
            // 評論內容
            if (reviewData.containsKey("content")) {
                updateFields.add("text = ?");
                params.add((String) reviewData.get("content"));
            }
            
            // 評論標題
            if (reviewData.containsKey("title")) {
                updateFields.add("title = ?");
                params.add((String) reviewData.get("title"));
            }
            
            // 標籤
            if (reviewData.containsKey("tags")) {
                Object tagsObj = reviewData.get("tags");
                String tags = "[]";
                
                if (tagsObj instanceof List) {
                    @SuppressWarnings("unchecked")
                    List<String> tagList = (List<String>) tagsObj;
                    if (!tagList.isEmpty()) {
                        tags = "[\"" + String.join("\",\"", tagList) + "\"]";
                    }
                } else if (tagsObj instanceof String) {
                    String tagsStr = (String) tagsObj;
                    if (tagsStr.startsWith("[") && tagsStr.endsWith("]")) {
                        tags = tagsStr;
                    } else if (!tagsStr.trim().isEmpty()) {
                        // 視為逗號分隔的字串
                        String[] tagArray = tagsStr.split(",");
                        List<String> tagList = Arrays.stream(tagArray)
                                .map(String::trim)
                                .filter(tag -> !tag.isEmpty())
                                .collect(Collectors.toList());
                        if (!tagList.isEmpty()) {
                            tags = "[\"" + String.join("\",\"", tagList) + "\"]";
                        }
                    }
                }
                
                updateFields.add("tags = ?");
                params.add(tags);
            }
            
            if (updateFields.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "沒有要更新的欄位");
                return ResponseEntity.badRequest().body(error);
            }
            
            // 組合SQL
            sqlBuilder.append(String.join(", ", updateFields));
            sqlBuilder.append(" WHERE id = ?");
            params.add(reviewId);
            
            String sql = sqlBuilder.toString();
            
            System.out.println("更新評論 SQL: " + sql);
            System.out.println("參數: " + params);
            
            int rowsAffected = jdbcTemplate.update(sql, params.toArray());
            
            if (rowsAffected > 0) {
                System.out.println("評論更新成功 - 評論ID: " + reviewId);
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "評論更新成功");
                response.put("reviewId", reviewId);
                
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "評論更新失敗");
                return ResponseEntity.status(500).body(error);
            }
            
        } catch (Exception e) {
            System.err.println("更新評論時發生錯誤: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> error = new HashMap<>();
            error.put("error", "更新評論失敗: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
} 