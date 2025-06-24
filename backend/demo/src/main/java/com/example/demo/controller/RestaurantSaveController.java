package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.RestaurantSaveRequest;
import com.example.demo.dto.RestaurantSaveResponse;
import com.example.demo.entity.Restaurant;
import com.example.demo.repository.RestaurantSaveRepository;

import java.util.Optional;

//shrsheng

@RestController
@RequestMapping("/api/restaurant-save")
@CrossOrigin(
    origins = {"http://127.0.0.1:5500", "http://localhost:5500"},
    allowedHeaders = "*",
    methods = {org.springframework.web.bind.annotation.RequestMethod.GET, 
               org.springframework.web.bind.annotation.RequestMethod.POST, 
               org.springframework.web.bind.annotation.RequestMethod.OPTIONS},
    allowCredentials = "true",
    maxAge = 3600
)
public class RestaurantSaveController {

    @Autowired
    private RestaurantSaveRepository restaurantSaveRepository;

    @GetMapping("/{restaurantId}")
    public ResponseEntity<RestaurantSaveResponse> getRestaurantById(@PathVariable Integer restaurantId) {
        try {
            Optional<Restaurant> restaurantOpt = restaurantSaveRepository.findById(restaurantId);
            
            if (restaurantOpt.isPresent()) {
                Restaurant restaurant = restaurantOpt.get();
                return ResponseEntity.ok(new RestaurantSaveResponse(
                    restaurant.getId(),
                    restaurant.getName(),
                    restaurant.getAddress(),
                    restaurant.getPlaceId(),
                    "餐廳資料查詢成功"
                ));
            } else {
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new RestaurantSaveResponse(
                null, null, null, null, "查詢餐廳失敗: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/save")
    public ResponseEntity<RestaurantSaveResponse> saveRestaurant(@RequestBody RestaurantSaveRequest request) {
        try {
            // 檢查是否已存在相同 placeId 的餐廳
            Optional<Restaurant> existingRestaurantOpt = restaurantSaveRepository.findByPlaceId(request.getPlaceId());
            
            if (existingRestaurantOpt.isPresent()) {
                // 如果已存在，返回現有的餐廳 ID
                Restaurant existingRestaurant = existingRestaurantOpt.get();
                return ResponseEntity.ok(new RestaurantSaveResponse(
                    existingRestaurant.getId(),
                    existingRestaurant.getName(),
                    existingRestaurant.getAddress(),
                    existingRestaurant.getPlaceId(),
                    "餐廳已存在於資料庫中"
                ));
            }
            
            // 創建新的餐廳實體
            Restaurant restaurant = new Restaurant();
            restaurant.setName(request.getName());
            restaurant.setAddress(request.getAddress());
            restaurant.setPlaceId(request.getPlaceId());
            
            // 儲存到資料庫
            Restaurant savedRestaurant = restaurantSaveRepository.save(restaurant);
            
            return ResponseEntity.ok(new RestaurantSaveResponse(
                savedRestaurant.getId(),
                savedRestaurant.getName(),
                savedRestaurant.getAddress(),
                savedRestaurant.getPlaceId(),
                "餐廳已成功儲存到資料庫"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new RestaurantSaveResponse(
                null, null, null, null, "儲存餐廳失敗: " + e.getMessage()
            ));
        }
    }
} 