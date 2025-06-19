package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.entity.Favorite;
import com.example.demo.entity.FavoriteId;

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
    
    // 根據用戶ID和餐廳ID刪除收藏，返回刪除的行數
    @Modifying
    @Transactional
    @Query("DELETE FROM Favorite f WHERE f.userId = :userId AND f.targetId = :targetId AND f.targetType = 'restaurant'")
    int deleteByUserIdAndTargetId(@Param("userId") Long userId, @Param("targetId") String targetId);
    
    // 查詢用戶收藏餐廳的原始JSON資料
    @Query(value = "SELECT gr.json_raw " +
           "FROM google_restaurants gr " +
           "JOIN user_favorites uf " +
           "  ON gr.place_id = uf.target_id " +
           "WHERE uf.user_id     = :userId " +
           "  AND uf.target_type = 'restaurant' " +
           "ORDER BY uf.favorited_at DESC", nativeQuery = true)
    List<String> findFavoriteJsonRawByUserId(@Param("userId") Long userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Favorite f WHERE f.userId = :userId AND f.targetId = :targetId AND f.targetType = :targetType")
    int deleteByUserIdAndTargetIdAndTargetType(@Param("userId") Long userId, @Param("targetId") String targetId, @Param("targetType") String targetType);
} 