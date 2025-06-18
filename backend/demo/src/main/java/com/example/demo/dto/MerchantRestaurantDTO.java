package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.web.multipart.MultipartFile;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MerchantRestaurantDTO {
    private String name;
    private String email;
    private String phoneNumber;
    private String address;
    private String businessHours;
    private String cuisineType;
    private String paymentMethods;
    private String description;
    private String avatarUrl;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateBasicInfoRequest {
        private String name;
        private String email;
        private String phoneNumber;
        private String address;
        private MultipartFile avatar;
    }

    public interface MerchantRestaurantProjection {
        String getName();
        String getEmail();
        String getPhone_number();
        String getAddress();
        String getBusiness_hours();
        String getCuisine_type();
        String getPayment_methods();
        String getDescription();
        String getAvatar_url();
    }

    public static MerchantRestaurantDTO fromProjection(MerchantRestaurantProjection projection) {
        MerchantRestaurantDTO dto = new MerchantRestaurantDTO();
        dto.setName(projection.getName());
        dto.setEmail(projection.getEmail());
        dto.setPhoneNumber(projection.getPhone_number());
        dto.setAddress(projection.getAddress());
        dto.setBusinessHours(projection.getBusiness_hours());
        dto.setCuisineType(projection.getCuisine_type());
        dto.setPaymentMethods(projection.getPayment_methods());
        dto.setDescription(projection.getDescription());
        dto.setAvatarUrl(projection.getAvatar_url());
        return dto;
    }
} 