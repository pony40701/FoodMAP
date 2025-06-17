package com.example.demo.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.dto.RestaurantListDTO;
import com.example.demo.entity.GoogleRestaurant;
import com.example.demo.repository.GoogleRestaurantRepository;
import com.example.demo.service.RestaurantService;

@Service
public class RestaurantServiceImpl implements RestaurantService {

    @Autowired
    private GoogleRestaurantRepository googleRestaurantRepository;

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
        return new RestaurantListDTO(
                restaurant.getName(),
                restaurant.getAddress(),
                restaurant.getRating(),
                restaurant.getReviewCount(),
                restaurant.getPlaceId(),
                restaurant.getCreatedAt(),
                restaurant.getDescription(),
                restaurant.getTypes(),
                restaurant.getPhotoUrl(),
                restaurant.getLatitude() != null ? restaurant.getLatitude() : restaurant.getLat(),
                restaurant.getLongitude() != null ? restaurant.getLongitude() : restaurant.getLng()
        );
    }
} 