package com.example.demo.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
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

    public List<GoogleRestaurant> getGoogleRestaurants() {
        // 先抓取所有資料，之後可以再加入排序邏輯
        return repository.findAll();
    }

    public Optional<String> getPhotoUrlByPlaceId(String placeId) {
        return photoRepository.findFirstByPlaceId(placeId)
                .map(LLeaderGoogleRestaurantPhoto::getPhotoUrl);
    }
} 