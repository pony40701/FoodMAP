package com.example.demo.repository;

import com.example.demo.dto.RLeaderRankingDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.RLeaderRestaurant;

@Repository
public interface RLeaderRestaurantRepository extends JpaRepository<RLeaderRestaurant, Integer> {

    // 綜合排行: 使用原生 SQL 和介面投影
    @Query(value = "SELECT id as restaurantId, name, address, average_rating as averageRating, review_count as reviewCount, cover_image_url as photoUrl " +
                   "FROM restaurants " +
                   "ORDER BY COALESCE(average_rating, 0) * LOG10(COALESCE(review_count, 0) + 1) DESC", nativeQuery = true)
    Page<RLeaderRankingDTO> findAllByCompositeScore(Pageable pageable);

    // 熱門排行: 使用原生 SQL 和介面投影
    @Query(value = "SELECT id as restaurantId, name, address, average_rating as averageRating, review_count as reviewCount, cover_image_url as photoUrl " +
                   "FROM restaurants " +
                   "ORDER BY COALESCE(review_count, 0) DESC", nativeQuery = true)
    Page<RLeaderRankingDTO> findAllByWeekly(Pageable pageable);

    // 新店排行: 使用原生 SQL 和介面投影 (暫用綜合排行邏輯)
    @Query(value = "SELECT id as restaurantId, name, address, average_rating as averageRating, review_count as reviewCount, cover_image_url as photoUrl " +
                   "FROM restaurants " +
                   "ORDER BY COALESCE(average_rating, 0) * LOG10(COALESCE(review_count, 0) + 1) DESC", nativeQuery = true)
    Page<RLeaderRankingDTO> findAllByNew(Pageable pageable);
} 