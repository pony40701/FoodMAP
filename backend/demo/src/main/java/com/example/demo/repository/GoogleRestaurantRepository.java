package com.example.demo.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.GoogleRestaurant;

@Repository
public interface GoogleRestaurantRepository extends JpaRepository<GoogleRestaurant, String> {
    // 預設會有 findAll() 可以查全部資料
    
    // 分頁查詢方法
    Page<GoogleRestaurant> findAll(Pageable pageable);
    
    // 按評分降冪排序（由高到低）
    List<GoogleRestaurant> findAllByOrderByRatingDesc();
    
    // 按評論數降冪排序（由多到少）
    List<GoogleRestaurant> findAllByOrderByReviewCountDesc();
    
    // 按創建時間降冪排序（由新到舊）
    List<GoogleRestaurant> findAllByOrderByCreatedAtDesc();
    
    // 支援分頁的排序查詢方法
    Page<GoogleRestaurant> findAllByOrderByRatingDesc(Pageable pageable);
    
    Page<GoogleRestaurant> findAllByOrderByReviewCountDesc(Pageable pageable);
    
    Page<GoogleRestaurant> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
