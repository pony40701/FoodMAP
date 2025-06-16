package com.example.demo.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    public ResponseEntity<Page<RLeaderRestaurant>> getRestaurantRanking(Pageable pageable) {
        Page<RLeaderRestaurant> restaurants = service.getRestaurants(pageable);
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping("/ranking/restaurant/photo/{restaurantId}")
    public ResponseEntity<?> getRestaurantPhoto(@PathVariable Integer restaurantId) {
        return service.getCoverImageUrlById(restaurantId)
                .map(url -> ResponseEntity.ok(Map.of("photoUrl", url)))
                .orElse(ResponseEntity.notFound().build());
    }
} 