package com.example.demo.dto;

import java.math.BigDecimal;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemDTO {
    private Integer id;
    private Integer restaurantId;
    private String itemName;
    private String description;
    private BigDecimal price;
    private String menuImage; // Base64 encoded image string

    // 用於新增和更新的請求
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MenuItemRequest {
        private String itemName;
        private String description;
        private BigDecimal price;
        private String menuImage; // Base64 encoded image string
    }

    // 用於回傳菜單項目列表的響應
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MenuItemResponse {
        private Integer id;
        private String itemName;
        private String description;
        private BigDecimal price;
        private String menuImage; // Base64 encoded image string
    }
} 