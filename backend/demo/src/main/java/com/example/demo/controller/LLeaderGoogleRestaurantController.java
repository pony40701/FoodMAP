package com.example.demo.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.GoogleRestaurant;
import com.example.demo.service.LLeaderGoogleRestaurantService;

@RestController
@RequestMapping("/api/lleader")
public class LLeaderGoogleRestaurantController {

    @Autowired
    private LLeaderGoogleRestaurantService service;

    @GetMapping("/ranking/google")
    public ResponseEntity<List<GoogleRestaurant>> getGoogleRestaurantRanking() {
        List<GoogleRestaurant> restaurants = service.getGoogleRestaurants();
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping("/ranking/google/photo/{placeId}")
    public ResponseEntity<?> getGoogleRestaurantPhoto(@PathVariable String placeId) {
        Optional<String> photoUrlOpt = service.getPhotoUrlByPlaceId(placeId);
        return photoUrlOpt
                .map(url -> ResponseEntity.ok().body(Map.of("photoUrl", url)))
                .orElse(ResponseEntity.notFound().build());
    }
} 