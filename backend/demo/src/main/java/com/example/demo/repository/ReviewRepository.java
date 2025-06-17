package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.Review;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review,Integer>{
    //增、刪、修、查、計算

    //查
    List<Review> findByUserIdAndStatus(Integer userId, String status);
    List<Review> findByRestaurantId(Integer restaurantId);
    List<Review> findByUserId(Integer userId);
    List<Review> findByStatus(String status);
    List<Review> findByStatusOrderByCreatedAtDesc(String status);

  
    //計算

     // 用戶的評論數量
     Integer countByUserId(Integer userId);
     // 餐廳的評論數量
     Integer countByRestaurantId(Integer restaurantId);



    
}
