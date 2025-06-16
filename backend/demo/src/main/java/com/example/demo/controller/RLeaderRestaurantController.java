package com.example.demo.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.RLeaderRestaurant;
import com.example.demo.service.RLeaderRestaurantService;

@RestController
@RequestMapping("/api/rleader")
public class RLeaderRestaurantController {

    @Autowired
    private RLeaderRestaurantService service;

    @GetMapping("/ranking/restaurants")
    public ResponseEntity<List<RLeaderRestaurant>> getRestaurantRanking() {
        List<RLeaderRestaurant> restaurants = service.getRestaurants();
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping("/ranking/restaurant/photo/{restaurantId}")
    public ResponseEntity<?> getRestaurantPhoto(@PathVariable Integer restaurantId) {
        return service.getCoverImageUrlById(restaurantId)
                .map(url -> ResponseEntity.ok(Map.of("photoUrl", url)))
                .orElse(ResponseEntity.notFound().build());
    }
} 