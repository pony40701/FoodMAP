package com.example.demo.service;

import com.example.demo.dto.MenuItemDTO;
import com.example.demo.entity.MerchantMenuItems;
import com.example.demo.entity.Restaurant;
import com.example.demo.repository.MerchantMenuItemsRepository;
import com.example.demo.repository.LocalRestaurantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.Base64;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MerchantMenuService {

    private final MerchantMenuItemsRepository menuItemsRepository;
    private final LocalRestaurantRepository restaurantRepository;

    // 獲取單一菜品
    public MenuItemDTO.MenuItemResponse getMenuItem(Integer restaurantId, Integer menuItemId) {
        MerchantMenuItems menuItem = menuItemsRepository.findByRestaurantIdAndMenuItemId(restaurantId, menuItemId);
        if (menuItem == null) {
            throw new RuntimeException("Menu item not found");
        }
        return convertToResponse(menuItem);
    }

    // 獲取餐廳的所有菜單項目
    public List<MenuItemDTO.MenuItemResponse> getMenuItems(Integer restaurantId) {
        List<MerchantMenuItems> menuItems = menuItemsRepository.findByRestaurantId(restaurantId);
        return menuItems.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }

    // 新增菜單項目
    @Transactional
    public MenuItemDTO.MenuItemResponse addMenuItem(Integer restaurantId, MenuItemDTO.MenuItemRequest request) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
            .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        MerchantMenuItems menuItem = new MerchantMenuItems();
        menuItem.setRestaurant(restaurant);
        menuItem.setItemName(request.getItemName());
        menuItem.setDescription(request.getDescription());
        menuItem.setPrice(request.getPrice());
        
        if (request.getMenuImage() != null && !request.getMenuImage().isEmpty()) {
            menuItem.setMenuImage(Base64.getDecoder().decode(request.getMenuImage()));
        }

        MerchantMenuItems savedMenuItem = menuItemsRepository.save(menuItem);
        return convertToResponse(savedMenuItem);
    }

    // 更新菜單項目
    @Transactional
    public MenuItemDTO.MenuItemResponse updateMenuItem(Integer restaurantId, Integer menuItemId, MenuItemDTO.MenuItemRequest request) {
        MerchantMenuItems menuItem = menuItemsRepository.findByRestaurantIdAndMenuItemId(restaurantId, menuItemId);
        if (menuItem == null) {
            throw new RuntimeException("Menu item not found");
        }

        menuItem.setItemName(request.getItemName());
        menuItem.setDescription(request.getDescription());
        menuItem.setPrice(request.getPrice());
        
        // 只有當提供了新圖片時才更新圖片
        if (request.getMenuImage() != null && !request.getMenuImage().isEmpty()) {
            // 移除可能存在的 data:image/jpeg;base64, 前綴
            String base64Image = request.getMenuImage();
            if (base64Image.contains(",")) {
                base64Image = base64Image.split(",")[1];
            }
            menuItem.setMenuImage(Base64.getDecoder().decode(base64Image));
        }

        MerchantMenuItems updatedMenuItem = menuItemsRepository.save(menuItem);
        return convertToResponse(updatedMenuItem);
    }

    // 刪除菜單項目
    @Transactional
    public void deleteMenuItem(Integer restaurantId, Integer menuItemId) {
        menuItemsRepository.deleteByRestaurantIdAndMenuItemId(restaurantId, menuItemId);
    }

    // 將實體轉換為回應DTO
    private MenuItemDTO.MenuItemResponse convertToResponse(MerchantMenuItems menuItem) {
        String base64Image = null;
        if (menuItem.getMenuImage() != null) {
            base64Image = Base64.getEncoder().encodeToString(menuItem.getMenuImage());
        }

        return MenuItemDTO.MenuItemResponse.builder()
            .id(menuItem.getId())
            .itemName(menuItem.getItemName())
            .description(menuItem.getDescription())
            .price(menuItem.getPrice())
            .menuImage(base64Image)
            .build();
    }
} 