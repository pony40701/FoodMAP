package com.example.demo.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.demo.dto.RLeaderRankingDTO;
import com.example.demo.entity.RLeaderRestaurant;

@Repository
public interface RLeaderRestaurantRepository extends JpaRepository<RLeaderRestaurant, Integer> {

    // 綜合排行: 使用原生 SQL 和介面投影
    @Query(value = "SELECT r.id as restaurantId, r.name, r.address, r.average_rating as averageRating, r.review_count as reviewCount, " +
                   "CASE " +
                   "    WHEN rp.image_url LIKE 'http%' THEN rp.image_url " +
                   "    ELSE CONCAT('http://localhost:8080', CASE WHEN rp.image_url NOT LIKE '/%' THEN '/' ELSE '' END, rp.image_url) " +
                   "END as photoUrl " +
                   "FROM restaurants r JOIN restaurant_photos rp ON r.id = rp.restaurant_id " +
                   "ORDER BY COALESCE(r.average_rating, 0) * LOG10(COALESCE(r.review_count, 0) + 1) DESC",
           countQuery = "SELECT count(*) FROM restaurants r JOIN restaurant_photos rp ON r.id = rp.restaurant_id",
           nativeQuery = true)
    Page<RLeaderRankingDTO> findAllByCompositeScore(Pageable pageable);

    // 熱門排行: 使用原生 SQL 和介面投影
    @Query(value = "SELECT r.id as restaurantId, r.name, r.address, r.average_rating as averageRating, r.review_count as reviewCount, " +
                   "CASE " +
                   "    WHEN rp.image_url LIKE 'http%' THEN rp.image_url " +
                   "    ELSE CONCAT('http://localhost:8080', CASE WHEN rp.image_url NOT LIKE '/%' THEN '/' ELSE '' END, rp.image_url) " +
                   "END as photoUrl " +
                   "FROM restaurants r JOIN restaurant_photos rp ON r.id = rp.restaurant_id " +
                   "ORDER BY COALESCE(r.review_count, 0) DESC",
           countQuery = "SELECT count(*) FROM restaurants r JOIN restaurant_photos rp ON r.id = rp.restaurant_id",
           nativeQuery = true)
    Page<RLeaderRankingDTO> findAllByWeekly(Pageable pageable);

    // 新店排行: 使用原生 SQL 和介面投影 (暫用綜合排行邏輯)
    @Query(value = "SELECT r.id as restaurantId, r.name, r.address, r.average_rating as averageRating, r.review_count as reviewCount, " +
                   "CASE " +
                   "    WHEN rp.image_url LIKE 'http%' THEN rp.image_url " +
                   "    ELSE CONCAT('http://localhost:8080', CASE WHEN rp.image_url NOT LIKE '/%' THEN '/' ELSE '' END, rp.image_url) " +
                   "END as photoUrl " +
                   "FROM restaurants r JOIN restaurant_photos rp ON r.id = rp.restaurant_id " +
                   "ORDER BY COALESCE(r.average_rating, 0) * LOG10(COALESCE(r.review_count, 0) + 1) DESC",
           countQuery = "SELECT count(*) FROM restaurants r JOIN restaurant_photos rp ON r.id = rp.restaurant_id",
           nativeQuery = true)
    Page<RLeaderRankingDTO> findAllByNew(Pageable pageable);
} 