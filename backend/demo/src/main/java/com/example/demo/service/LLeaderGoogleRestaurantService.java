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
        Page<GoogleRestaurant> restaurantsPage;
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

        // 遍歷餐廳並設置 photoUrl
        restaurantsPage.getContent().forEach(restaurant -> {
            photoRepository.findFirstByPlaceId(restaurant.getPlaceId())
                    .map(LLeaderGoogleRestaurantPhoto::getPhotoUrl)
                    .ifPresent(restaurant::setPhotoUrl);
        });

        // 將 Page<GoogleRestaurant> 轉換為 Page<RankingGoogleRestaurantDTO>
        return restaurantsPage.map(this::convertToDto);
    }

    private RankingGoogleRestaurantDTO convertToDto(GoogleRestaurant restaurant) {
        return new RankingGoogleRestaurantDTO(
                restaurant.getPlaceId(),
                restaurant.getName(),
                restaurant.getAddress(),
                restaurant.getRating(),
                restaurant.getReviewCount(),
                restaurant.getPhotoUrl()
        );
    }

    public Optional<String> getPhotoUrlByPlaceId(String placeId) {
        return photoRepository.findFirstByPlaceId(placeId)
                .map(LLeaderGoogleRestaurantPhoto::getPhotoUrl);
    }
} 