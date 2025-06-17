package com.example.demo.repository;

import com.example.demo.entity.ReviewTag;
import com.example.demo.entity.ReviewTagId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewTagRepository extends JpaRepository<ReviewTag, ReviewTagId> {
    void deleteByReviewId(Integer reviewId);
    List<ReviewTag> findByReviewId(Integer reviewId);
} 