package com.example.demo.repository;

import com.example.demo.entity.GoogleRestaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LLeaderGoogleRestaurantRepository extends JpaRepository<GoogleRestaurant, String> {
} 