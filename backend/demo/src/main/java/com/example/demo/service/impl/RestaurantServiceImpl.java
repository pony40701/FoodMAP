package com.example.demo.service.impl;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Base64;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.dto.RestaurantListDTO;
import com.example.demo.entity.GoogleRestaurant;
import com.example.demo.repository.GoogleRestaurantRepository;
import com.example.demo.repository.LLeaderGoogleRestaurantPhotoRepository;
import com.example.demo.entity.LLeaderGoogleRestaurantPhoto;
import com.example.demo.service.RestaurantService;

@Service
public class RestaurantServiceImpl implements RestaurantService {

    @Autowired
    private GoogleRestaurantRepository googleRestaurantRepository;

    @Autowired
    private LLeaderGoogleRestaurantPhotoRepository photoRepository;

    @Override
    public List<GoogleRestaurant> getAllRestaurants() {
        return googleRestaurantRepository.findAll();
    }

    @Override
    public GoogleRestaurant getRestaurantByPlaceId(String placeId) {
        return googleRestaurantRepository.findById(placeId).orElse(null);
    }

    @Override
    public List<RestaurantListDTO> getRestaurantList() {
        List<GoogleRestaurant> restaurants = googleRestaurantRepository.findAll();
        return restaurants.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private RestaurantListDTO convertToDTO(GoogleRestaurant restaurant) {
        // 查詢第一張圖片
        String base64Photo = null;
        try {
            java.util.Optional<LLeaderGoogleRestaurantPhoto> photoOpt = photoRepository.findFirstByPlaceId(restaurant.getPlaceId());
            if (photoOpt.isPresent() && photoOpt.get().getPhotoUrl() != null) {
                byte[] photoBytes = photoOpt.get().getPhotoUrl().getBytes();
                base64Photo = "data:image/jpeg;base64," + Base64.getEncoder().encodeToString(photoBytes);
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
                restaurant.getLongitude() != null ? restaurant.getLongitude() : restaurant.getLng()
        );
    }
} 