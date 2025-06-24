package com.example.demo.service.impl;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.example.demo.dto.GoogleReviewDTO;
import com.example.demo.dto.RestaurantListDTO;
import com.example.demo.entity.GoogleRestaurant;
import com.example.demo.entity.LLeaderGoogleRestaurantPhoto;
import com.example.demo.repository.GoogleRestaurantRepository;
import com.example.demo.repository.LLeaderGoogleRestaurantPhotoRepository;
import com.example.demo.service.RestaurantService;

@Service
public class RestaurantServiceImpl implements RestaurantService {

    @Autowired
    private GoogleRestaurantRepository googleRestaurantRepository;

    @Autowired
    private LLeaderGoogleRestaurantPhotoRepository photoRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public List<GoogleRestaurant> getAllRestaurants() {
        return googleRestaurantRepository.findAll();
    }

    @Override
    public GoogleRestaurant getRestaurantByPlaceId(String placeId) {
        return googleRestaurantRepository.findById(placeId).orElse(null);
    }

    @Override
    public List<RestaurantListDTO> getRestaurantList() {
        List<GoogleRestaurant> restaurants = googleRestaurantRepository.findAll();
        return restaurants.stream()
                .map(this::convertToDTOWithReviews)
                .collect(Collectors.toList());
    }

    @Override
    public List<RestaurantListDTO> getRestaurantList(String sort) {
        List<GoogleRestaurant> restaurants;
        
        if ("ratingDesc".equals(sort)) {
            restaurants = googleRestaurantRepository.findAllByOrderByRatingDesc();
        } else if ("reviewCountDesc".equals(sort)) {
            restaurants = googleRestaurantRepository.findAllByOrderByReviewCountDesc();
        } else if ("createdAtDesc".equals(sort)) {
            restaurants = googleRestaurantRepository.findAllByOrderByCreatedAtDesc();
        } else {
            restaurants = googleRestaurantRepository.findAll();
        }
        
        return restaurants.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<RestaurantListDTO> getRestaurants(Pageable pageable) {
        Page<GoogleRestaurant> restaurantPage = googleRestaurantRepository.findAll(pageable);
        return restaurantPage.map(this::convertToDTO);
    }

    @Override
    public Page<RestaurantListDTO> getRestaurantsBySort(String sortBy, Pageable pageable) {
        Page<GoogleRestaurant> restaurantPage;
        
        switch (sortBy) {
            case "averageRating":
                restaurantPage = googleRestaurantRepository.findAllByOrderByRatingDesc(pageable);
                break;
            case "reviewCount":
                restaurantPage = googleRestaurantRepository.findAllByOrderByReviewCountDesc(pageable);
                break;
            case "createdAt":
                restaurantPage = googleRestaurantRepository.findAllByOrderByCreatedAtDesc(pageable);
                break;
            default:
                restaurantPage = googleRestaurantRepository.findAll(pageable);
                break;
        }
        
        return restaurantPage.map(this::convertToDTO);
    }

    @Override
    public Page<RestaurantListDTO> getRestaurantsWithReviews(Pageable pageable) {
        Page<GoogleRestaurant> restaurantPage = googleRestaurantRepository.findAll(pageable);
        return restaurantPage.map(this::convertToDTOWithReviews);
    }

    @Override
    public Page<RestaurantListDTO> getRestaurantsBySortWithReviews(String sortBy, Pageable pageable) {
        Page<GoogleRestaurant> restaurantPage;
        
        switch (sortBy) {
            case "averageRating":
                restaurantPage = googleRestaurantRepository.findAllByOrderByRatingDesc(pageable);
                break;
            case "reviewCount":
                restaurantPage = googleRestaurantRepository.findAllByOrderByReviewCountDesc(pageable);
                break;
            case "createdAt":
                restaurantPage = googleRestaurantRepository.findAllByOrderByCreatedAtDesc(pageable);
                break;
            default:
                restaurantPage = googleRestaurantRepository.findAll(pageable);
                break;
        }
        
        return restaurantPage.map(this::convertToDTOWithReviews);
    }

    @Override
    public RestaurantListDTO getRtoLDRestaurantDTOByPlaceId(String placeId) {
        GoogleRestaurant restaurant = getRestaurantByPlaceId(placeId);
        if (restaurant == null) return null;
        return convertToDTOWithReviews(restaurant);
    }

    private RestaurantListDTO convertToDTO(GoogleRestaurant restaurant) {
        String base64Photo = null;
        try {
            java.util.Optional<LLeaderGoogleRestaurantPhoto> photoOpt = photoRepository.findFirstByPlaceId(restaurant.getPlaceId());
            if (photoOpt.isPresent() && photoOpt.get().getPhotoUrl() != null) {
                byte[] photoBytes = photoOpt.get().getPhotoUrl().getBytes();
                base64Photo = "data:image/jpeg;base64," + Base64.getEncoder().encodeToString(photoBytes);
            }
        } catch (Exception e) {
            base64Photo = null;
        }
        return new RestaurantListDTO(
                restaurant.getName(),
                restaurant.getAddress(),
                restaurant.getRating(),
                restaurant.getReviewCount(),
                restaurant.getPlaceId(),
                restaurant.getCreatedAt(),
                restaurant.getDescription(),
                restaurant.getTypes(),
                base64Photo,
                restaurant.getLatitude() != null ? restaurant.getLatitude() : restaurant.getLat(),
                restaurant.getLongitude() != null ? restaurant.getLongitude() : restaurant.getLng(),
                restaurant.getOpeningHours()
        );
    }

    private RestaurantListDTO convertToDTOWithReviews(GoogleRestaurant restaurant) {
        RestaurantListDTO dto = convertToDTO(restaurant);
        String placeId = restaurant.getPlaceId();
        String sql = "SELECT author_name, rating, text, time_created, profile_photo_url FROM google_reviews WHERE restaurant_place_id = ?";
        List<GoogleReviewDTO> googleReviews = jdbcTemplate.query(sql, new Object[]{placeId}, (rs, rowNum) -> mapGoogleReview(rs));
        dto.setGoogleReviews(googleReviews);
        return dto;
    }

    private GoogleReviewDTO mapGoogleReview(ResultSet rs) throws SQLException {
        GoogleReviewDTO review = new GoogleReviewDTO();
        review.setAuthorName(rs.getString("author_name"));
        review.setRating(rs.getDouble("rating"));
        review.setText(rs.getString("text"));
        review.setTimeCreated(rs.getTimestamp("time_created"));
        review.setProfilePhotoUrl(rs.getString("profile_photo_url"));
        return review;
    }
} 