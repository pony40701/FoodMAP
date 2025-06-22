package com.example.demo.repository;

import com.example.demo.entity.MerchantMenuItems;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface MerchantMenuItemsRepository extends JpaRepository<MerchantMenuItems, Integer> {
    
    // 根據餐廳ID查詢所有菜單項目
    List<MerchantMenuItems> findByRestaurantId(Integer restaurantId);

    // 根據餐廳ID和菜單項目ID查詢特定項目
    @Query("SELECT m FROM MerchantMenuItems m WHERE m.restaurant.id = :restaurantId AND m.id = :menuItemId")
    MerchantMenuItems findByRestaurantIdAndMenuItemId(
        @Param("restaurantId") Integer restaurantId, 
        @Param("menuItemId") Integer menuItemId
    );

    // 刪除特定餐廳的特定菜單項目
    @Modifying
    @Transactional
    @Query("DELETE FROM MerchantMenuItems m WHERE m.restaurant.id = :restaurantId AND m.id = :menuItemId")
    void deleteByRestaurantIdAndMenuItemId(
        @Param("restaurantId") Integer restaurantId, 
        @Param("menuItemId") Integer menuItemId
    );
} 