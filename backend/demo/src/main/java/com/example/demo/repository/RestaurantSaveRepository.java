package com.example.demo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.Restaurant;

@Repository
public interface RestaurantSaveRepository extends JpaRepository<Restaurant, Integer> {
    
    /**
     * 根據 placeId 查找餐廳
     * @param placeId 餐廳的 placeId
     * @return 可能包含餐廳實體的 Optional 物件
     */
    Optional<Restaurant> findByPlaceId(String placeId);
    
    /**
     * 檢查是否存在相同 placeId 的餐廳
     * @param placeId 餐廳的 placeId
     * @return 如果存在返回 true，否則返回 false
     */
    boolean existsByPlaceId(String placeId);
} 