package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.RestaurantListDTO;
import com.example.demo.entity.Restaurant;
import com.example.demo.service.RestaurantService;

@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {
@Autowired
private RestaurantService restaurantService;

@GetMapping
public List<Restaurant> getAllRestaurant(){
	return restaurantService.getAllRestaurants();
}
@GetMapping("/{placeId}")
public Restaurant getRestaurantByPlaceId(@PathVariable String placeId) {
	return restaurantService.getRestaurantByPlaceId(placeId);
}
@GetMapping("/list")
public List<RestaurantListDTO> getRestaurantList(){
	return restaurantService.getRestaurantList();
}
}
