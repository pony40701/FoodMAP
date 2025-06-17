package com.example.demo.repository;

import com.example.demo.entity.ReviewStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReviewStatsRepository extends JpaRepository<ReviewStats, Integer> {
    @Query("SELECT SUM(rs.totalViews) FROM ReviewStats rs WHERE rs.review.user.id = :userId")
    Integer sumTotalViewsByUserId(@Param("userId") Integer userId);
    
    @Query("SELECT SUM(rs.totalFavorites) FROM ReviewStats rs WHERE rs.review.user.id = :userId")
    Integer sumTotalFavoritesByUserId(@Param("userId") Integer userId);
    
    @Query("SELECT COUNT(rs) FROM ReviewStats rs WHERE rs.review.user.id = :userId")
    Integer countByUserId(@Param("userId") Integer userId);
    
    void deleteByReviewId(Integer reviewId);
} 