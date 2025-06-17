package com.example.foodmap.repository;

import com.example.foodmap.entity.ReviewRating;
import org.springframework.data.jpa.repository.JpaRepository;


public interface ReviewRatingRepository extends JpaRepository<ReviewRating, Integer> {
    
} 