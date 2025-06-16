package com.example.demo.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.demo.entity.RLeaderRestaurant;
import com.example.demo.repository.RLeaderRestaurantRepository;

@Service
public class RLeaderRestaurantService {

    @Autowired
    private RLeaderRestaurantRepository repository;

    public Page<RLeaderRestaurant> getRestaurants(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public Optional<String> getCoverImageUrlById(Integer restaurantId) {
        return repository.findById(restaurantId)
                .map(RLeaderRestaurant::getCoverImageUrl);
    }
} 