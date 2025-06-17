package com.example.demo.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.demo.dto.RankingGoogleRestaurantDTO;
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

    public Page<RankingGoogleRestaurantDTO> getGoogleRestaurants(String filter, Pageable pageable) {
        Page<RankingGoogleRestaurantDTO> restaurantsPage;
        switch (filter) {
            case "weekly":
                restaurantsPage = repository.findAllByWeekly(pageable);
                break;
            case "new":
                restaurantsPage = repository.findAllByNew(pageable);
                break;
            case "all":
            default:
                restaurantsPage = repository.findAllByCompositeScore(pageable);
                break;
        }

        // 因為 Repository 已直接返回 DTO，所以不再需要手動轉換和額外的照片查詢
        return restaurantsPage;
    }

    public Optional<String> getPhotoUrlByPlaceId(String placeId) {
        return photoRepository.findFirstByPlaceId(placeId)
                .map(LLeaderGoogleRestaurantPhoto::getPhotoUrl);
    }
} 