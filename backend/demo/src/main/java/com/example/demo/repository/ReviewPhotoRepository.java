package com.example.foodmap.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.foodmap.entity.ReviewPhoto;
import java.util.List;

public interface ReviewPhotoRepository extends JpaRepository<ReviewPhoto, Integer>{
    List<ReviewPhoto> findByReviewId(Integer reviewId);
    void deleteByReviewId(Integer reviewId);
}
