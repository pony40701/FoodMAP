package com.example.demo.repository;

import com.example.demo.dto.RankingGoogleRestaurantDTO;
import com.example.demo.entity.LLeaderGoogleRestaurantPhoto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.GoogleRestaurant;

@Repository
public interface LLeaderGoogleRestaurantRepository extends JpaRepository<GoogleRestaurant, String> {

    // 綜合排行: 將 BLOB 圖片轉為 Base64 Data URL
    @Query(value = "SELECT g.place_id as placeId, g.name, g.address, g.rating, g.review_count as reviewCount, " +
                   "CASE WHEN MIN(p.photo_url) IS NOT NULL THEN CONCAT('data:image/jpeg;base64,', TO_BASE64(MIN(p.photo_url))) ELSE NULL END as photoUrl " +
                   "FROM google_restaurants g LEFT JOIN google_restaurant_photos p ON g.place_id = p.restaurant_place_id " +
                   "GROUP BY g.place_id, g.name, g.address, g.rating, g.review_count " +
                   "ORDER BY COALESCE(g.rating, 0) * LOG10(COALESCE(g.review_count, 0) + 1) DESC", nativeQuery = true)
    Page<RankingGoogleRestaurantDTO> findAllByCompositeScore(Pageable pageable);

    // 熱門排行: 將 BLOB 圖片轉為 Base64 Data URL
    @Query(value = "SELECT g.place_id as placeId, g.name, g.address, g.rating, g.review_count as reviewCount, " +
                   "CASE WHEN MIN(p.photo_url) IS NOT NULL THEN CONCAT('data:image/jpeg;base64,', TO_BASE64(MIN(p.photo_url))) ELSE NULL END as photoUrl " +
                   "FROM google_restaurants g LEFT JOIN google_restaurant_photos p ON g.place_id = p.restaurant_place_id " +
                   "GROUP BY g.place_id, g.name, g.address, g.rating, g.review_count " +
                   "ORDER BY COALESCE(g.review_count, 0) DESC", nativeQuery = true)
    Page<RankingGoogleRestaurantDTO> findAllByWeekly(Pageable pageable);

    // 新店排行: 將 BLOB 圖片轉為 Base64 Data URL (暫用綜合排行邏輯)
    @Query(value = "SELECT g.place_id as placeId, g.name, g.address, g.rating, g.review_count as reviewCount, " +
                   "CASE WHEN MIN(p.photo_url) IS NOT NULL THEN CONCAT('data:image/jpeg;base64,', TO_BASE64(MIN(p.photo_url))) ELSE NULL END as photoUrl " +
                   "FROM google_restaurants g LEFT JOIN google_restaurant_photos p ON g.place_id = p.restaurant_place_id " +
                   "GROUP BY g.place_id, g.name, g.address, g.rating, g.review_count " +
                   "ORDER BY COALESCE(g.rating, 0) * LOG10(COALESCE(g.review_count, 0) + 1) DESC", nativeQuery = true)
    Page<RankingGoogleRestaurantDTO> findAllByNew(Pageable pageable);
} 