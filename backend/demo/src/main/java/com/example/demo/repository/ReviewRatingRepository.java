package com.example.demo.repository;

import com.example.demo.entity.ReviewRating;
import org.springframework.data.jpa.repository.JpaRepository;


public interface ReviewRatingRepository extends JpaRepository<ReviewRating, Integer> {
    
} 