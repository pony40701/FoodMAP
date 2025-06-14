package com.example.demo.repository;

import com.example.demo.entity.GoogleRestaurant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GoogleRestaurantRepository extends JpaRepository<GoogleRestaurant, Long> {
    // 預設會有 findAll() 可以查全部資料
}
