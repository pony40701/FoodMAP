package com.example.demo.repository;
//boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.RestaurantPhoto;

public interface RestaurantPhotoRepository extends JpaRepository<RestaurantPhoto, Integer> {
    Optional<RestaurantPhoto> findFirstByRestaurantId(Integer restaurantId);
}
