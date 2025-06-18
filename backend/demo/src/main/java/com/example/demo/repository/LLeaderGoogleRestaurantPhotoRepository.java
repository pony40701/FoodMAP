package com.example.demo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.LLeaderGoogleRestaurantPhoto;

@Repository
public interface LLeaderGoogleRestaurantPhotoRepository extends JpaRepository<LLeaderGoogleRestaurantPhoto, Long> {
    
    /**
     * 根據 placeId 尋找第一張照片
     * @param placeId 餐廳的 placeId
     * @return 可能包含照片實體的 Optional 物件
     */
    Optional<LLeaderGoogleRestaurantPhoto> findFirstByPlaceId(String placeId);
} 