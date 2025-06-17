package com.example.demo.service;

import java.util.List;

import com.example.demo.dto.RestaurantListDTO;
import com.example.demo.entity.GoogleRestaurant;

public interface RestaurantService {
    List<GoogleRestaurant> getAllRestaurants();
    GoogleRestaurant getRestaurantByPlaceId(String placeId);
    List<RestaurantListDTO> getRestaurantList();
    List<RestaurantListDTO> getRestaurantList(String sort);
}
