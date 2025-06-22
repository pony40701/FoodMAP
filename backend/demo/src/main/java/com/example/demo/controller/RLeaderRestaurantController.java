package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.RLeaderRankingDTO;
import com.example.demo.service.RLeaderRestaurantService;

@RestController
@RequestMapping("/api/rleader")
public class RLeaderRestaurantController {

    @Autowired
    private RLeaderRestaurantService service;

    @GetMapping("/ranking/restaurants")
    public ResponseEntity<Page<RLeaderRankingDTO>> getRestaurantRanking(
            @RequestParam(defaultValue = "all") String filter,
            Pageable pageable) {
        Page<RLeaderRankingDTO> restaurants = service.getRestaurants(filter, pageable);
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping("/ranking/restaurant/photo/{restaurantId}")
    public ResponseEntity<byte[]> getRestaurantPhoto(@PathVariable Integer restaurantId) {
        return service.getCoverPhotoDataById(restaurantId)
                .map(photoData -> ResponseEntity.ok().contentType(MediaType.IMAGE_JPEG).body(photoData))
                .orElse(ResponseEntity.notFound().build());
    }
} 