package com.foodmap.backend.controller;

import com.foodmap.backend.model.User;
import com.foodmap.backend.model.UserProfile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class UserController {

    // 獲取用戶資料
    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getUserProfile(@PathVariable Integer userId) {
        // 模擬從資料庫獲取用戶資料
        Map<String, Object> userProfile = new HashMap<>();
        userProfile.put("id", userId);
        userProfile.put("name", "測試用戶");
        userProfile.put("email", "test@example.com");
        userProfile.put("phoneNumber", "0912345678");
        userProfile.put("address", "台北市信義區101號");
        
        return ResponseEntity.ok(userProfile);
    }
    
    // 更新用戶資料
    @PutMapping("/users/{userId}")
    public ResponseEntity<?> updateUserProfile(@PathVariable Integer userId, @RequestBody Map<String, Object> userData) {
        // 模擬更新用戶資料
        userData.put("id", userId);
        
        return ResponseEntity.ok(userData);
    }
    
    // 獲取用戶訂單
    @GetMapping("/orders/user/{userId}")
    public ResponseEntity<?> getUserOrders(@PathVariable Integer userId, @RequestParam(required = false, defaultValue = "all") String status) {
        // 模擬從資料庫獲取訂單資料
        List<Map<String, Object>> orders = new ArrayList<>();
        
        Map<String, Object> order1 = new HashMap<>();
        order1.put("id", "ORD001");
        order1.put("userId", userId);
        order1.put("storeName", "老王牛肉麵");
        order1.put("orderTime", "2024-03-15T12:30:00");
        order1.put("status", "completed");
        order1.put("totalAmount", 350);
        order1.put("items", List.of("牛肉麵", "小菜"));
        
        Map<String, Object> order2 = new HashMap<>();
        order2.put("id", "ORD002");
        order2.put("userId", userId);
        order2.put("storeName", "阿婆滷肉飯");
        order2.put("orderTime", "2024-03-14T18:45:00");
        order2.put("status", "pending");
        order2.put("totalAmount", 280);
        order2.put("items", List.of("滷肉飯", "湯品"));
        
        Map<String, Object> order3 = new HashMap<>();
        order3.put("id", "ORD003");
        order3.put("userId", userId);
        order3.put("storeName", "小籠包專賣店");
        order3.put("orderTime", "2024-03-13T11:20:00");
        order3.put("status", "cancelled");
        order3.put("totalAmount", 420);
        order3.put("items", List.of("小籠包", "酸辣湯"));
        
        orders.add(order1);
        orders.add(order2);
        orders.add(order3);
        
        // 根據狀態篩選
        if (!"all".equals(status)) {
            List<Map<String, Object>> filteredOrders = new ArrayList<>();
            for (Map<String, Object> order : orders) {
                if (status.equals(order.get("status"))) {
                    filteredOrders.add(order);
                }
            }
            return ResponseEntity.ok(filteredOrders);
        }
        
        return ResponseEntity.ok(orders);
    }
    
    // 獲取用戶評論
    @GetMapping("/reviews/user/{userId}")
    public ResponseEntity<?> getUserReviews(@PathVariable Integer userId, @RequestParam(required = false, defaultValue = "all") String rating) {
        // 模擬從資料庫獲取評論資料
        List<Map<String, Object>> reviews = new ArrayList<>();
        
        Map<String, Object> review1 = new HashMap<>();
        review1.put("id", 1);
        review1.put("userId", userId);
        review1.put("storeName", "老王牛肉麵");
        review1.put("title", "超好吃的牛肉麵");
        review1.put("content", "牛肉很嫩，湯頭濃郁，服務態度很好！");
        review1.put("rating", 5);
        review1.put("time", "2024-03-15T14:30:00");
        review1.put("tags", List.of("牛肉麵", "湯頭濃郁", "服務好"));
        
        Map<String, Object> review2 = new HashMap<>();
        review2.put("id", 2);
        review2.put("userId", userId);
        review2.put("storeName", "阿婆滷肉飯");
        review2.put("title", "道地的滷肉飯");
        review2.put("content", "滷肉香而不膩，米飯粒粒分明。");
        review2.put("rating", 4);
        review2.put("time", "2024-03-14T19:20:00");
        review2.put("tags", List.of("滷肉飯", "道地", "CP值高"));
        
        Map<String, Object> review3 = new HashMap<>();
        review3.put("id", 3);
        review3.put("userId", userId);
        review3.put("storeName", "小籠包專賣店");
        review3.put("title", "皮薄餡多的小籠包");
        review3.put("content", "小籠包皮薄餡多，湯汁豐富。");
        review3.put("rating", 5);
        review3.put("time", "2024-03-13T12:15:00");
        review3.put("tags", List.of("小籠包", "湯包", "點心"));
        
        reviews.add(review1);
        reviews.add(review2);
        reviews.add(review3);
        
        // 根據評分篩選
        if (!"all".equals(rating)) {
            int ratingValue = Integer.parseInt(rating);
            List<Map<String, Object>> filteredReviews = new ArrayList<>();
            for (Map<String, Object> review : reviews) {
                int reviewRating = (int) review.get("rating");
                if (reviewRating >= ratingValue) {
                    filteredReviews.add(review);
                }
            }
            return ResponseEntity.ok(filteredReviews);
        }
        
        return ResponseEntity.ok(reviews);
    }
    
    // 獲取用戶通知
    @GetMapping("/notifications/user/{userId}")
    public ResponseEntity<?> getUserNotifications(@PathVariable Integer userId, @RequestParam(required = false, defaultValue = "all") String type) {
        // 模擬從資料庫獲取通知資料
        List<Map<String, Object>> notifications = new ArrayList<>();
        
        Map<String, Object> notification1 = new HashMap<>();
        notification1.put("id", 1);
        notification1.put("userId", userId);
        notification1.put("type", "order");
        notification1.put("content", "您的訂單 ORD001 已準備完成，請前往取餐。");
        notification1.put("time", "2024-03-15T12:30:00");
        notification1.put("read", false);
        
        Map<String, Object> notification2 = new HashMap<>();
        notification2.put("id", 2);
        notification2.put("userId", userId);
        notification2.put("type", "promotion");
        notification2.put("content", "本週末全館商品 8 折起！");
        notification2.put("time", "2024-03-14T10:00:00");
        notification2.put("read", true);
        
        Map<String, Object> notification3 = new HashMap<>();
        notification3.put("id", 3);
        notification3.put("userId", userId);
        notification3.put("type", "system");
        notification3.put("content", "您的評論已獲得回覆。");
        notification3.put("time", "2024-03-13T15:45:00");
        notification3.put("read", false);
        
        notifications.add(notification1);
        notifications.add(notification2);
        notifications.add(notification3);
        
        // 根據類型篩選
        if (!"all".equals(type)) {
            List<Map<String, Object>> filteredNotifications = new ArrayList<>();
            for (Map<String, Object> notification : notifications) {
                if (type.equals(notification.get("type"))) {
                    filteredNotifications.add(notification);
                }
            }
            return ResponseEntity.ok(filteredNotifications);
        }
        
        return ResponseEntity.ok(notifications);
    }
    
    // 獲取用戶數據分析
    @GetMapping("/analytics/user/{userId}")
    public ResponseEntity<?> getUserAnalytics(@PathVariable Integer userId, @RequestParam(required = false, defaultValue = "month") String timeRange) {
        // 模擬從資料庫獲取數據分析資料
        Map<String, Object> analytics = new HashMap<>();
        
        Map<String, Object> orders = new HashMap<>();
        orders.put("totalOrders", 12);
        orders.put("totalSpent", 3500);
        orders.put("averageOrderAmount", 292);
        
        Map<String, Object> consumption = new HashMap<>();
        consumption.put("mostFrequentCategory", "台式料理");
        consumption.put("highestSingleOrder", 1200);
        consumption.put("mostFrequentStore", "老王牛肉麵");
        
        Map<String, Object> reviews = new HashMap<>();
        reviews.put("totalReviews", 8);
        reviews.put("averageRating", 4.5);
        reviews.put("totalLikes", 3);
        
        Map<String, Object> favorites = new HashMap<>();
        favorites.put("totalFavoriteStores", 15);
        favorites.put("totalFavoriteReviews", 8);
        favorites.put("newThisMonth", 5);
        
        analytics.put("orders", orders);
        analytics.put("consumption", consumption);
        analytics.put("reviews", reviews);
        analytics.put("favorites", favorites);
        
        return ResponseEntity.ok(analytics);
    }
    
    // 更新用戶設定
    @PutMapping("/users/{userId}/settings")
    public ResponseEntity<?> updateUserSettings(@PathVariable Integer userId, @RequestBody Map<String, Object> settings) {
        // 模擬更新用戶設定
        settings.put("userId", userId);
        settings.put("updated", true);
        
        return ResponseEntity.ok(settings);
    }
    
    // 獲取收藏店家
    @GetMapping("/favorites/user/{userId}/restaurants")
    public ResponseEntity<?> getFavoriteRestaurants(@PathVariable Integer userId) {
        // 模擬從資料庫獲取收藏店家資料
        List<Map<String, Object>> favoriteRestaurants = new ArrayList<>();
        
        Map<String, Object> restaurant1 = new HashMap<>();
        restaurant1.put("id", "ChIJN1t_tDeuEmsRUsoyG83frY4");
        restaurant1.put("name", "老王牛肉麵");
        restaurant1.put("rating", 4.5);
        restaurant1.put("address", "台北市中山區中山北路一段");
        restaurant1.put("imageUrl", "images/restaurant1.jpg");
        restaurant1.put("isOpen", true);
        
        Map<String, Object> restaurant2 = new HashMap<>();
        restaurant2.put("id", "ChIJP3Sa8ziYEmsRUKgyFmh9AQM");
        restaurant2.put("name", "阿婆滷肉飯");
        restaurant2.put("rating", 4.2);
        restaurant2.put("address", "台北市大安區復興南路");
        restaurant2.put("imageUrl", "images/restaurant2.jpg");
        restaurant2.put("isOpen", false);
        
        favoriteRestaurants.add(restaurant1);
        favoriteRestaurants.add(restaurant2);
        
        return ResponseEntity.ok(favoriteRestaurants);
    }
    
    // 獲取收藏評論
    @GetMapping("/favorites/user/{userId}/reviews")
    public ResponseEntity<?> getFavoriteReviews(@PathVariable Integer userId) {
        // 模擬從資料庫獲取收藏評論資料
        List<Map<String, Object>> favoriteReviews = new ArrayList<>();
        
        Map<String, Object> review1 = new HashMap<>();
        review1.put("id", 101);
        review1.put("reviewerId", 2);
        review1.put("reviewerName", "美食家小明");
        review1.put("storeName", "老王牛肉麵");
        review1.put("content", "這家牛肉麵的湯頭真的很讚，牛肉也很嫩，推薦大家來嚐嚐！");
        review1.put("rating", 5);
        review1.put("time", "2024-03-10T14:30:00");
        review1.put("userAvatar", "../IMAGE/default_avatar.jpg");
        
        Map<String, Object> review2 = new HashMap<>();
        review2.put("id", 102);
        review2.put("reviewerId", 3);
        review2.put("reviewerName", "吃貨小華");
        review2.put("storeName", "阿婆滷肉飯");
        review2.put("content", "滷肉飯香氣四溢，滷肉軟嫩不膩，絕對是台北數一數二的好味道！");
        review2.put("rating", 4);
        review2.put("time", "2024-03-08T19:15:00");
        review2.put("userAvatar", "../IMAGE/default_avatar.jpg");
        
        favoriteReviews.add(review1);
        favoriteReviews.add(review2);
        
        return ResponseEntity.ok(favoriteReviews);
    }
    
    // 移除收藏店家
    @DeleteMapping("/favorites/user/{userId}/restaurant/{restaurantId}")
    public ResponseEntity<?> removeFavoriteRestaurant(@PathVariable Integer userId, @PathVariable String restaurantId) {
        // 模擬移除收藏店家
        Map<String, Object> result = new HashMap<>();
        result.put("userId", userId);
        result.put("restaurantId", restaurantId);
        result.put("removed", true);
        
        return ResponseEntity.ok(result);
    }
    
    // 移除收藏評論
    @DeleteMapping("/favorites/user/{userId}/review/{reviewId}")
    public ResponseEntity<?> removeFavoriteReview(@PathVariable Integer userId, @PathVariable Integer reviewId) {
        // 模擬移除收藏評論
        Map<String, Object> result = new HashMap<>();
        result.put("userId", userId);
        result.put("reviewId", reviewId);
        result.put("removed", true);
        
        return ResponseEntity.ok(result);
    }
} 