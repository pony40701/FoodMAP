package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.GoogleRestaurant;

@Repository
public interface RestaurantRepository extends JpaRepository<GoogleRestaurant, String> {
    GoogleRestaurant findByPlaceId(String placeId);
}
