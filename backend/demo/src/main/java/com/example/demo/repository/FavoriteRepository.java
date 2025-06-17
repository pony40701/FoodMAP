package com.example.demo.repository;

import com.example.demo.entity.Favorite;
import com.example.demo.entity.FavoriteId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface FavoriteRepository extends JpaRepository<Favorite, FavoriteId> {
    // 預設會有 findAll() 可以查全部資料
    
    // 自定義查詢，返回所有餐廳收藏
    @Query("SELECT f FROM Favorite f WHERE f.targetType = 'restaurant'")
    List<Favorite> findAllRestaurants();
    
    // 檢查是否已經存在相同的收藏
    @Query("SELECT COUNT(f) > 0 FROM Favorite f WHERE f.userId = :userId AND f.targetId = :targetId AND f.targetType = 'restaurant'")
    boolean existsByUserIdAndTargetId(@Param("userId") Long userId, @Param("targetId") String targetId);
    
    // 查詢用戶的餐廳收藏
    @Query("SELECT f FROM Favorite f WHERE f.userId = :userId AND f.targetType = 'restaurant'")
    List<Favorite> findUserRestaurants(@Param("userId") Long userId);
    
    // 根據用戶ID和餐廳ID刪除收藏
    @Modifying
    @Transactional
    @Query("DELETE FROM Favorite f WHERE f.userId = :userId AND f.targetId = :targetId AND f.targetType = 'restaurant'")
    void deleteByUserIdAndTargetId(@Param("userId") Long userId, @Param("targetId") String targetId);
} 