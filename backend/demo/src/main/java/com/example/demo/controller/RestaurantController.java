package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.RestaurantListDTO;
import com.example.demo.entity.GoogleRestaurant;
import com.example.demo.service.RestaurantService;

@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {
@Autowired
private RestaurantService restaurantService;

@GetMapping
public Page<RestaurantListDTO> getAllRestaurant(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "10") int size) {
    Pageable pageable = PageRequest.of(page, size);
    return restaurantService.getRestaurants(pageable);
}

@GetMapping("/{placeId}")
public GoogleRestaurant getRestaurantByPlaceId(@PathVariable String placeId) {
	return restaurantService.getRestaurantByPlaceId(placeId);
}

@GetMapping("/list")
public List<RestaurantListDTO> getRestaurantList(@RequestParam(required = false) String sort){
	return restaurantService.getRestaurantList(sort);
}

@GetMapping("/sort")
public Page<RestaurantListDTO> getRestaurantsBySort(
    @RequestParam String sortBy,
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "10") int size) {
    Pageable pageable = PageRequest.of(page, size);
    return restaurantService.getRestaurantsBySort(sortBy, pageable);
}
}
