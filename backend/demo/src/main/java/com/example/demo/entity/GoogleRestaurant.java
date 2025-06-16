package com.example.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.Data;

@Entity
@Table(name = "google_restaurants")
@Data
public class GoogleRestaurant {

    @Id
    private String placeId;

    private String name;
    private String address;
    private Double rating;
    
    @Column(name = "review_count") // 將 snake_case 欄位映射到 camelCase
    private Integer reviewCount;

    private String photoUrl;
    private Double lat;
    private Double lng;

    // 新增綜合評分欄位，但不儲存到資料庫
    @Transient
    private Double compositeScore;
}
