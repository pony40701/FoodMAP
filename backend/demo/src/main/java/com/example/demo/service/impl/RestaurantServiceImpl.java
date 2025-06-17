package com.example.demo.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.example.demo.dto.RestaurantListDTO;
import com.example.demo.entity.Restaurant;
import com.example.demo.repository.RestaurantRepository;
import com.example.demo.service.RestaurantService;

@Service
public class RestaurantServiceImpl implements RestaurantService {

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // 查詢全部餐廳原始資料（for 後台或管理）
    @Override
    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }

    // 根據 placeId 查詢單筆餐廳資料
    @Override
    public Restaurant getRestaurantByPlaceId(String placeId) {
        return restaurantRepository.findByPlaceId(placeId);
    }

    @Override
    public List<RestaurantListDTO> getRestaurantList() {
        List<Restaurant> restaurants = restaurantRepository.findAll();
        return restaurants.stream().map(restaurant -> {
            // 將圖片 URL 直接組成 API 路徑
            String photoUrl = "/api/restaurant-images/" + restaurant.getPlaceId() + "/raw";
            return new RestaurantListDTO(
                restaurant.getName(),
                restaurant.getAddress(),
                restaurant.getAverageRating(),
                restaurant.getReviewCount(),
                restaurant.getPlaceId(),
                restaurant.getCreatedAt(),
                restaurant.getDescription(),
                restaurant.getTypes(),
                photoUrl,
                restaurant.getLatitude(),
                restaurant.getLongitude()
            );
        }).toList();
    }
}
