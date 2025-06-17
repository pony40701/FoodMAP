package com.example.demo.service;

import java.util.List;

import com.example.demo.dto.RestaurantListDTO;
import com.example.demo.entity.Restaurant;

public interface RestaurantService {
    List<Restaurant> getAllRestaurants();
    Restaurant getRestaurantByPlaceId(String placeId);
    List<RestaurantListDTO> getRestaurantList();
}
