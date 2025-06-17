package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RankingGoogleRestaurantDTO {
    private String placeId;
    private String name;
    private String address;
    private Double rating;
    private Integer reviewCount;
    private String photoUrl;
} 