package com.example.foodmap.repository;

import com.example.foodmap.entity.ReviewTag;
import com.example.foodmap.entity.ReviewTagId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewTagRepository extends JpaRepository<ReviewTag, ReviewTagId> {
    void deleteByReviewId(Integer reviewId);
    List<ReviewTag> findByReviewId(Integer reviewId);
} 