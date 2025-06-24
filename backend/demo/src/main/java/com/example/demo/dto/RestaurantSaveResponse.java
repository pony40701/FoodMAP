package com.example.demo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

//shrsheng

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantSaveResponse {
    private Integer restaurantId;
    private String name;
    private String address;
    private String placeId;
    private String message;
} 