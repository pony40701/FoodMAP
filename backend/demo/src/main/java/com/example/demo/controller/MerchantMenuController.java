package com.example.demo.controller;

import com.example.demo.dto.MenuItemDTO;
import com.example.demo.security.MerchantJwtService;
import com.example.demo.service.MerchantMenuService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.List;

@RestController
@RequestMapping("/api/merchants/menu")
@CrossOrigin(
    origins = {"http://127.0.0.1:5500", "http://localhost:5500"},
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE},
    allowCredentials = "true",
    maxAge = 3600
)
@RequiredArgsConstructor
public class MerchantMenuController {

    
    private final MerchantMenuService menuService;
    private final MerchantJwtService merchantJwtService;

    // 獲取菜單列表
    @GetMapping
    public ResponseEntity<List<MenuItemDTO.MenuItemResponse>> getMenuItems(@RequestHeader("Authorization") String authHeader) {
        validateToken(authHeader);
        Integer restaurantId = extractRestaurantId(authHeader);
        return ResponseEntity.ok(menuService.getMenuItems(restaurantId));
    }

    // 獲取單一菜品
    @GetMapping("/{menuItemId}")
    public ResponseEntity<MenuItemDTO.MenuItemResponse> getMenuItem(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer menuItemId) {
        validateToken(authHeader);
        Integer restaurantId = extractRestaurantId(authHeader);
        return ResponseEntity.ok(menuService.getMenuItem(restaurantId, menuItemId));
    }

    // 新增菜單項目
    @PostMapping
    public ResponseEntity<MenuItemDTO.MenuItemResponse> addMenuItem(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody MenuItemDTO.MenuItemRequest request) {
        validateToken(authHeader);
        Integer restaurantId = extractRestaurantId(authHeader);
        return ResponseEntity.ok(menuService.addMenuItem(restaurantId, request));
    }

    // 更新菜單項目
    @PutMapping("/{menuItemId}")
    public ResponseEntity<MenuItemDTO.MenuItemResponse> updateMenuItem(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer menuItemId,
            @RequestBody MenuItemDTO.MenuItemRequest request) {
        validateToken(authHeader);
        Integer restaurantId = extractRestaurantId(authHeader);
        return ResponseEntity.ok(menuService.updateMenuItem(restaurantId, menuItemId, request));
    }

    // 刪除菜單項目
    @DeleteMapping("/{menuItemId}")
    public ResponseEntity<Void> deleteMenuItem(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer menuItemId) {
        validateToken(authHeader);
        Integer restaurantId = extractRestaurantId(authHeader);
        menuService.deleteMenuItem(restaurantId, menuItemId);
        return ResponseEntity.ok().build();
    }

    // 驗證 JWT Token
    private void validateToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("未提供有效的認證token");
        }

        String token = authHeader.substring(7);
        String email = merchantJwtService.extractEmail(token);
        
        if (!merchantJwtService.validateToken(token, email)) {
            throw new RuntimeException("無效的token");
        }
    }

    // 從 Token 中提取餐廳 ID
    private Integer extractRestaurantId(String authHeader) {
        String token = authHeader.substring(7);
        return merchantJwtService.extractRestaurantId(token);
    }
} 