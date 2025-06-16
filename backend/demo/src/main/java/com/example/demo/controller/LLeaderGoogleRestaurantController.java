package com.example.demo.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.GoogleRestaurant;
import com.example.demo.service.LLeaderGoogleRestaurantService;

@RestController
@RequestMapping("/api/lleader")
public class LLeaderGoogleRestaurantController {

    @Autowired
    private LLeaderGoogleRestaurantService service;

    @GetMapping("/ranking/google")
    public ResponseEntity<Page<GoogleRestaurant>> getGoogleRestaurantRanking(
            @RequestParam(defaultValue = "all") String filter,
            Pageable pageable) {
        Page<GoogleRestaurant> restaurants = service.getGoogleRestaurants(filter, pageable);
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