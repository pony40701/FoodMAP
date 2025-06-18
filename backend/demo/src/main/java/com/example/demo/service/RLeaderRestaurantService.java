package com.example.demo.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.demo.dto.RLeaderRankingDTO;
import com.example.demo.repository.RLeaderRestaurantRepository;

@Service
public class RLeaderRestaurantService {

    @Autowired
    private RLeaderRestaurantRepository repository;

    public Page<RLeaderRankingDTO> getRestaurants(String filter, Pageable pageable) {
        switch (filter) {
            case "weekly":
                return repository.findAllByWeekly(pageable);
            case "new":
                return repository.findAllByNew(pageable);
            case "all":
            default:
                return repository.findAllByCompositeScore(pageable);
        }
    }

    public Optional<String> getCoverImageUrlById(Integer restaurantId) {
        return repository.findById(restaurantId)
                .map(restaurant -> restaurant.getCoverImageUrl());
    }
} 