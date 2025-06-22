package com.example.demo.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.demo.dto.RLeaderRankingDTO;
import com.example.demo.repository.RLeaderRestaurantRepository;
import com.example.demo.repository.RestaurantPhotoRepository;

@Service
public class RLeaderRestaurantService {

    @Autowired
    private RLeaderRestaurantRepository repository;

    @Autowired
    private RestaurantPhotoRepository photoRepository;

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

    public Optional<byte[]> getCoverPhotoDataById(Integer restaurantId) {
        return photoRepository.findFirstByRestaurantId(restaurantId)
                .map(photo -> photo.getPhotoData());
    }
} 