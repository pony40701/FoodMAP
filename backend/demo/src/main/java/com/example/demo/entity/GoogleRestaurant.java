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
    
    @Column(name = "review_count")
    private Integer reviewCount;

    private String photoUrl;
    
    // 保留原有的 lat/lng 欄位，同時添加 latitude/longitude 以保持兼容性
    private Double lat;
    private Double lng;
    
    @Column(name = "latitude")
    private Double latitude;
    
    @Column(name = "longitude")
    private Double longitude;
    
    @Column(name = "created_at")
    private java.sql.Timestamp createdAt;
    
    @Column(name = "types")
    private String types;
    
    @Column(name = "description")
    private String description;

    // 新增綜合評分欄位，但不儲存到資料庫
    @Transient
    private Double compositeScore;
    
    // 添加 getAverageRating 方法以保持與原 Restaurant 的兼容性
    public Double getAverageRating() {
        return rating != null ? rating : null;
    }
}
