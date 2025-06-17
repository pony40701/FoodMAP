package com.example.demo.repository;

import com.example.demo.entity.GoogleRestaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GoogleRestaurantRepository extends JpaRepository<GoogleRestaurant, String> {
    // 預設會有 findAll() 可以查全部資料
}
