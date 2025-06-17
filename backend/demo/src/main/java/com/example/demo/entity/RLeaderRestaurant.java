package com.example.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.Data;

@Entity
@Table(name = "restaurants")
@Data
public class RLeaderRestaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer restaurantId;

    @Column(name = "name")
    private String name;

    @Column(name = "average_rating")
    private Double averageRating;

    @Column(name = "review_count")
    private Integer reviewCount;

    @Column(name = "address")
    private String address;

    @Column(name = "cover_image_url")
    private String coverImageUrl;

    // 新增綜合評分欄位，但不儲存到資料庫
    @Transient
    private Double compositeScore;
} 