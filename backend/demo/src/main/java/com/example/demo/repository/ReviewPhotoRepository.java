package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.ReviewPhoto;
import java.util.List;

public interface ReviewPhotoRepository extends JpaRepository<ReviewPhoto, Integer>{
    List<ReviewPhoto> findByReviewId(Integer reviewId);
    void deleteByReviewId(Integer reviewId);
}
