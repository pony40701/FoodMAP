package com.example.demo.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import com.example.demo.service.RestaurantService;

@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {
    private static final Logger logger = LoggerFactory.getLogger(RestaurantController.class);

    @Autowired
    private RestaurantService restaurantService;

    @GetMapping
    public Page<RestaurantListDTO> getAllRestaurant(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return restaurantService.getRestaurantsWithReviews(pageable);
    }

    @GetMapping("/{placeId}")
    public RestaurantListDTO getRestaurantByPlaceId(@PathVariable String placeId) {
        return restaurantService.getRtoLDRestaurantDTOByPlaceId(placeId);
    }

    @GetMapping("/list")
    public List<RestaurantListDTO> getRestaurantList(@RequestParam(required = false) String sort){
        return restaurantService.getRestaurantList();
    }

    @GetMapping("/sort")
    public Page<RestaurantListDTO> getRestaurantsBySort(
        @RequestParam String sortBy,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return restaurantService.getRestaurantsBySortWithReviews(sortBy, pageable);
    }
}
