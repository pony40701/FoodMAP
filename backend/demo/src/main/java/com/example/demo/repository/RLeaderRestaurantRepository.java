package com.example.demo.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.RLeaderRestaurant;

@Repository
public interface RLeaderRestaurantRepository extends JpaRepository<RLeaderRestaurant, Integer> {

    // 綜合排行 (all)
    @Query(value = "SELECT * FROM restaurants ORDER BY average_rating * LOG10(review_count + 1) DESC", nativeQuery = true)
    Page<RLeaderRestaurant> findAllByCompositeScore(Pageable pageable);

    // 熱門排行 (weekly)
    @Query(value = "SELECT * FROM restaurants ORDER BY review_count DESC", nativeQuery = true)
    Page<RLeaderRestaurant> findAllByWeekly(Pageable pageable);

    // 新店排行 (new) - 暫時與綜合排行相同
    // TODO: 需要一個日期欄位來實現真正的新店排序
    @Query(value = "SELECT * FROM restaurants ORDER BY average_rating * LOG10(review_count + 1) DESC", nativeQuery = true)
    Page<RLeaderRestaurant> findAllByNew(Pageable pageable);
} 