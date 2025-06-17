package com.example.demo.repository;

import com.example.demo.entity.ReviewViewLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ReviewViewLogRepository extends JpaRepository<ReviewViewLog, Long> {
    // 查詢特定評論的瀏覽記錄
    List<ReviewViewLog> findByReviewId(Long reviewId);
    
    // 查詢特定用戶的瀏覽記錄
    List<ReviewViewLog> findByUserId(Long userId);
    
    // 查詢特定評論的瀏覽次數
    long countByReviewId(Long reviewId);
    
    // 查詢特定用戶的瀏覽次數
    long countByUserId(Long userId);
    
    // 查詢特定評論的最近瀏覽記錄（按時間倒序）
    List<ReviewViewLog> findByReviewIdOrderByCreatedAtDesc(Long reviewId);
    
    // 查詢特定IP的瀏覽記錄
    List<ReviewViewLog> findByIpAddress(String ipAddress);
    
    // 查詢特定時間範圍內的瀏覽記錄
    @Query("SELECT l FROM ReviewViewLog l WHERE l.createdAt BETWEEN ?1 AND ?2")
    List<ReviewViewLog> findByCreatedAtBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);
    
    // 查詢特定評論在特定時間範圍內的瀏覽記錄
    @Query("SELECT l FROM ReviewViewLog l WHERE l.review.id = ?1 AND l.createdAt BETWEEN ?2 AND ?3")
    List<ReviewViewLog> findByReviewIdAndCreatedAtBetween(Long reviewId, java.time.LocalDateTime start, java.time.LocalDateTime end);
} 