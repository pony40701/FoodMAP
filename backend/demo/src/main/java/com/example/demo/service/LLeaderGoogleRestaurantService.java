package com.example.demo.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.demo.entity.GoogleRestaurant;
import com.example.demo.entity.LLeaderGoogleRestaurantPhoto;
import com.example.demo.repository.LLeaderGoogleRestaurantPhotoRepository;
import com.example.demo.repository.LLeaderGoogleRestaurantRepository;

@Service
public class LLeaderGoogleRestaurantService {

    @Autowired
    private LLeaderGoogleRestaurantRepository repository;

    @Autowired
    private LLeaderGoogleRestaurantPhotoRepository photoRepository;

    public Page<GoogleRestaurant> getGoogleRestaurants(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public Optional<String> getPhotoUrlByPlaceId(String placeId) {
        return photoRepository.findFirstByPlaceId(placeId)
                .map(LLeaderGoogleRestaurantPhoto::getPhotoUrl);
    }
} 