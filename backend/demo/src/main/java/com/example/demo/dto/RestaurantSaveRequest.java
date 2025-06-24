package com.example.demo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

//shrsheng

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantSaveRequest {
    private String name;
    private String address;
    private String placeId;
} 