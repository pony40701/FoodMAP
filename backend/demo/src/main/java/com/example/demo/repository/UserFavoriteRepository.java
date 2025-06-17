package com.example.demo.repository;

import com.example.demo.entity.UserFavorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserFavoriteRepository extends JpaRepository<UserFavorite, Long> {
    
    // 查詢使用者的所有收藏
    List<UserFavorite> findByUserId(Long userId);
    
    // 檢查特定餐廳是否已被使用者收藏
    Optional<UserFavorite> findByUserIdAndRestaurantPlaceId(Long userId, String restaurantPlaceId);
    
    // 刪除特定使用者的特定餐廳收藏
    void deleteByUserIdAndRestaurantPlaceId(Long userId, String restaurantPlaceId);
    
    // 檢查是否存在
    boolean existsByUserIdAndRestaurantPlaceId(Long userId, String restaurantPlaceId);
} 