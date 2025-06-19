package com.example.demo.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

@Entity
@Table(name = "user_favorites")
@IdClass(FavoriteId.class)
public class Favorite {
    @Id
    @Column(name = "user_id")
    private Long userId;
    
    @Id
    @Column(name = "target_type")
    private String targetType;
    
    @Id
    @Column(name = "target_id")
    private String targetId;
    
    @Column(name = "favorited_at")
    private LocalDateTime favoritedAt;
    
    @Column(name = "restaurant_place_id")
    private String restaurantPlaceId;
    
    // Getters and Setters
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getTargetType() {
        return targetType;
    }
    
    public void setTargetType(String targetType) {
        this.targetType = targetType;
    }
    
    public String getTargetId() {
        return targetId;
    }
    
    public void setTargetId(String targetId) {
        this.targetId = targetId;
    }
    
    public LocalDateTime getFavoritedAt() {
        return favoritedAt;
    }
    
    public void setFavoritedAt(LocalDateTime favoritedAt) {
        this.favoritedAt = favoritedAt;
    }
    
    public String getRestaurantPlaceId() {
        return restaurantPlaceId;
    }
    
    public void setRestaurantPlaceId(String restaurantPlaceId) {
        this.restaurantPlaceId = restaurantPlaceId;
    }
} 