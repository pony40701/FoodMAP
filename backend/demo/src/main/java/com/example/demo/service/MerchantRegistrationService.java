package com.example.demo.service;

import com.example.demo.dto.RegisterRequest;
import com.example.demo.entity.MerchantAccount;
import com.example.demo.entity.MerchantProfile;
import com.example.demo.entity.Restaurant;
import com.example.demo.entity.RestaurantPhoto;
import com.example.demo.repository.MerchantAccountRepository;
import com.example.demo.repository.MerchantProfileRepository;
import com.example.demo.repository.RestaurantPhotoRepository;
import com.example.demo.repository.RestaurantRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class MerchantRegistrationService {

    private final MerchantAccountRepository merchantAccountRepository;
    private final MerchantProfileRepository merchantProfileRepository;
    private final RestaurantRepository restaurantRepository;
    private final RestaurantPhotoRepository restaurantPhotoRepository;
    private final PasswordEncoder passwordEncoder;

    public void registerMerchant(RegisterRequest request) {
        // Create restaurant
        Restaurant restaurant = new Restaurant();
        restaurant.setName(request.getName());
        restaurant.setPhoneNumber(request.getPhoneNumber());
        restaurant.setAddress(request.getAddress());
        restaurant.setCuisineType(request.getCuisineType());
        restaurant.setBusinessHours(request.getBusinessHours());
        restaurantRepository.save(restaurant);

        // Create account
        MerchantAccount account = new MerchantAccount();
        account.setEmail(request.getEmail());
        account.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        account.setPhoneNumber(request.getPhoneNumber());
        account.setRestaurant(restaurant);
        merchantAccountRepository.save(account);

        // Create profile
        MerchantProfile profile = new MerchantProfile();
        profile.setMerchantAccount(account); // 假設有 @MapsId 映射
        profile.setAvatarUrl(request.getImageUrls().get(0));
        merchantProfileRepository.save(profile);

        // Create restaurant photo
        RestaurantPhoto photo = new RestaurantPhoto();
        photo.setRestaurant(restaurant);
        photo.setImageUrl(request.getImageUrls().get(0));
        restaurantPhotoRepository.save(photo);
    }
}
