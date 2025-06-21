package com.example.demo.service;

import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.dto.ExReviewDTO;
import com.example.demo.dto.ExReviewProjection;
import com.example.demo.repository.ExReviewRepository;

@Service
public class ExReviewService {

    @Autowired
    private ExReviewRepository exReviewRepository;

    public List<ExReviewDTO> getLatestReviews(int limit, int offset, String sort, String search, List<String> cuisineTypes, Long userId) {
        List<String> effectiveCuisineTypes = (cuisineTypes == null || cuisineTypes.isEmpty()) ? null : cuisineTypes;
        String effectiveSearch = (search == null || search.trim().isEmpty()) ? null : search;

        List<ExReviewProjection> projections = exReviewRepository.findLatestReviews(limit, offset, sort, effectiveSearch, effectiveCuisineTypes, userId);
        return projections.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private ExReviewDTO convertToDto(ExReviewProjection projection) {
        String imageBase64 = null;
        if (projection.getImage() != null) {
            imageBase64 = Base64.getEncoder().encodeToString(projection.getImage());
        }

        return new ExReviewDTO(
            projection.getReviewId(),
            imageBase64,
            projection.getAuthorName(),
            projection.getAuthorAvatar(),
            projection.getAuthorRating(),
            projection.getReviewTitle(),
            projection.getRestaurantName(),
            projection.getContentJson(),
            projection.getReviewDate(),
            projection.getCuisineType(),
            projection.getViewCount(),
            projection.getIsFavorited() != null && projection.getIsFavorited() == 1
        );
    }
} 