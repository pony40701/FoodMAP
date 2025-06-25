package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Arrays;
import java.util.ArrayList;
import java.sql.Connection;
import java.sql.DatabaseMetaData;

@RestController
@RequestMapping("/api/google-restaurants")
@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://localhost:5500"})
public class GoogleRestaurantController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // 獲取所有餐廳
    @GetMapping("/all")
    public ResponseEntity<?> getAllRestaurants() {
        System.out.println("\n==== 獲取所有餐廳 - 開始 [" + new java.util.Date() + "] ====");
        
        try {
            // 檢查資料庫連接
            try {
                System.out.println("檢查資料庫連接...");
                Connection connection = jdbcTemplate.getDataSource().getConnection();
                DatabaseMetaData metaData = connection.getMetaData();
                System.out.println("資料庫連接 URL: " + metaData.getURL());
                System.out.println("資料庫用戶名: " + metaData.getUserName());
                System.out.println("資料庫產品名稱: " + metaData.getDatabaseProductName());
                System.out.println("資料庫產品版本: " + metaData.getDatabaseProductVersion());
                System.out.println("JDBC 驅動名稱: " + metaData.getDriverName());
                System.out.println("JDBC 驅動版本: " + metaData.getDriverVersion());
                
                // 測試連接
                jdbcTemplate.execute("SELECT 1");
                System.out.println("資料庫連接正常");
                
                // 關閉連接
                connection.close();
                
                // 檢查資料表是否存在
                try {
                    int count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM google_restaurants", Integer.class);
                    System.out.println("google_restaurants 資料表存在，包含 " + count + " 筆資料");
                } catch (Exception e) {
                    System.err.println("檢查資料表時發生錯誤: " + e.getMessage());
                    e.printStackTrace();
                    return ResponseEntity.status(500).body("資料表不存在或無法訪問: " + e.getMessage());
                }
            } catch (Exception e) {
                System.err.println("資料庫連接失敗: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(500).body("資料庫連接失敗: " + e.getMessage());
            }
            
            // 嘗試不同的查詢方式
            List<Map<String, Object>> restaurants = null;
                
            
            // 方法 2：使用簡單查詢
            try {
                String sql2 = "SELECT * FROM google_restaurants LIMIT 100";
                System.out.println("嘗試方法 2 - 簡單查詢: " + sql2);
                long startTime = System.currentTimeMillis();
                restaurants = jdbcTemplate.queryForList(sql2);
                long endTime = System.currentTimeMillis();
                System.out.println("方法 2 成功獲取 " + restaurants.size() + " 間餐廳，耗時 " + (endTime - startTime) + " 毫秒");
                
                if (!restaurants.isEmpty()) {
                    System.out.println("第一筆資料: " + restaurants.get(0));
                    System.out.println("最後一筆資料: " + restaurants.get(restaurants.size() - 1));
                    System.out.println("==== 獲取所有餐廳 - 完成 [" + new java.util.Date() + "] ====\n");
                    return ResponseEntity.ok(restaurants);
                }
            } catch (Exception e) {
                System.err.println("方法 2 失敗: " + e.getMessage());
                e.printStackTrace();
            }
            
            // 方法 3：使用原生 SQL
            try {
                String sql3 = "SELECT id, name FROM google_restaurants";
                System.out.println("嘗試方法 3 - 原生 SQL: " + sql3);
                long startTime = System.currentTimeMillis();
                restaurants = jdbcTemplate.queryForList(sql3);
                long endTime = System.currentTimeMillis();
                System.out.println("方法 3 成功獲取 " + restaurants.size() + " 間餐廳，耗時 " + (endTime - startTime) + " 毫秒");
                
                if (!restaurants.isEmpty()) {
                    System.out.println("第一筆資料: " + restaurants.get(0));
                    System.out.println("最後一筆資料: " + restaurants.get(restaurants.size() - 1));
                    System.out.println("==== 獲取所有餐廳 - 完成 [" + new java.util.Date() + "] ====\n");
                    return ResponseEntity.ok(restaurants);
                }
            } catch (Exception e) {
                System.err.println("方法 3 失敗: " + e.getMessage());
                e.printStackTrace();
            }
            
            // 如果所有方法都失敗，返回錯誤
            System.err.println("所有查詢方法都失敗，無法獲取餐廳資料");
            System.out.println("==== 獲取所有餐廳 - 失敗 [" + new java.util.Date() + "] ====\n");
            return ResponseEntity.status(500).body("無法從資料庫獲取餐廳資料");
        } catch (Exception e) {
            System.err.println("獲取所有餐廳時發生錯誤: " + e.getMessage());
            e.printStackTrace();
            System.out.println("==== 獲取所有餐廳 - 異常 [" + new java.util.Date() + "] ====\n");
            return ResponseEntity.status(500).body("獲取餐廳資料失敗: " + e.getMessage());
        }
    }

    // 獲取餐廳總數
    @GetMapping("/count")
    public ResponseEntity<Integer> getRestaurantCount() {
        try {
            String sql = "SELECT COUNT(*) FROM google_restaurants";
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // 根據 ID 獲取餐廳
    @GetMapping("/{id}")
    public ResponseEntity<?> getRestaurantById(@PathVariable String id) {
        try {
            System.out.println("獲取餐廳詳情 - ID: " + id);
            
            // 使用簡單的查詢，避免複雜的映射
            String sql = "SELECT * FROM google_restaurants WHERE id = ? OR place_id = ?";
            System.out.println("執行 SQL: " + sql);
            
            // 使用 queryForList 直接獲取 Map 列表
            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, id, id);
            
            if (results.isEmpty()) {
                System.out.println("找不到餐廳 - ID: " + id);
                return ResponseEntity.notFound().build();
            }
            
            System.out.println("成功獲取餐廳詳情 - ID: " + id);
            return ResponseEntity.ok(results.get(0));
        } catch (Exception e) {
            System.err.println("獲取餐廳詳情時發生錯誤: " + e.getMessage());
            e.printStackTrace();
            
            // 返回錯誤訊息而不是空響應
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    // 根據分類獲取餐廳
    @GetMapping("/category/{category}")
    public ResponseEntity<?> getRestaurantsByCategory(@PathVariable String category) {
        try {
            System.out.println("獲取分類餐廳 - 分類: " + category);
            
            // 使用簡單的查詢，避免複雜的映射
            String sql = "SELECT id, name, address, rating, user_ratings_total FROM google_restaurants WHERE json_raw LIKE ?";
            System.out.println("執行 SQL: " + sql);
            
            // 使用 queryForList 直接獲取 Map 列表
            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, "%" + category + "%");
            
            System.out.println("成功獲取分類餐廳 - 分類: " + category + ", 數量: " + results.size());
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            System.err.println("獲取分類餐廳時發生錯誤: " + e.getMessage());
            e.printStackTrace();
            
            // 返回錯誤訊息而不是空響應
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    // 餐廳資料映射器
    private static class RestaurantRowMapper implements RowMapper<Map<String, Object>> {
        @Override
        public Map<String, Object> mapRow(ResultSet rs, int rowNum) throws SQLException {
            Map<String, Object> restaurant = new HashMap<>();
            
            // 基本欄位
            restaurant.put("id", rs.getString("id"));
            
            // 處理可能不存在的欄位
            try { restaurant.put("place_id", rs.getString("place_id")); } 
            catch (SQLException e) { restaurant.put("place_id", null); }
            
            try { restaurant.put("name", rs.getString("name")); } 
            catch (SQLException e) { restaurant.put("name", "未命名餐廳"); }
            
            try { restaurant.put("address", rs.getString("address")); } 
            catch (SQLException e) { restaurant.put("address", null); }
            
            try { restaurant.put("phone", rs.getString("phone")); } 
            catch (SQLException e) { restaurant.put("phone", null); }
            
            try { restaurant.put("website", rs.getString("website")); } 
            catch (SQLException e) { restaurant.put("website", null); }
            
            try { restaurant.put("rating", rs.getDouble("rating")); } 
            catch (SQLException e) { restaurant.put("rating", 0.0); }
            
            try { restaurant.put("user_ratings_total", rs.getInt("user_ratings_total")); } 
            catch (SQLException e) { restaurant.put("user_ratings_total", 0); }
            
            try { restaurant.put("price_level", rs.getInt("price_level")); } 
            catch (SQLException e) { restaurant.put("price_level", 0); }
            
            try { restaurant.put("vicinity", rs.getString("vicinity")); } 
            catch (SQLException e) { restaurant.put("vicinity", null); }
            
            try { restaurant.put("photos", rs.getString("photos")); } 
            catch (SQLException e) { restaurant.put("photos", null); }
            
            try { restaurant.put("json_raw", rs.getString("json_raw")); } 
            catch (SQLException e) { restaurant.put("json_raw", null); }
            
            return restaurant;
        }
    }
} 