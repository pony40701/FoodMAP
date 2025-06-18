package com.example.demo.service;
//boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan
import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.dto.RegisterRequest;
import com.example.demo.entity.MerchantAccount;
import com.example.demo.entity.MerchantProfile;
import com.example.demo.entity.Restaurant;
import com.example.demo.entity.RestaurantPhoto;
import com.example.demo.repository.MerchantAccountRepository;
import com.example.demo.repository.MerchantProfileRepository;
import com.example.demo.repository.LocalRestaurantRepository;
import com.example.demo.repository.RestaurantPhotoRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class MerchantRegistrationService {

    private final MerchantAccountRepository merchantAccountRepository;
    private final MerchantProfileRepository merchantProfileRepository;
    private final LocalRestaurantRepository localRestaurantRepository;
    private final RestaurantPhotoRepository restaurantPhotoRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageService fileStorageService; // ✅ 你需要建立一個這個來處理圖片儲存（可以存硬碟或雲端）

    public void registerMerchant(RegisterRequest request, MultipartFile avatar, List<MultipartFile> photos) {
        // 儲存餐廳
        Restaurant restaurant = new Restaurant();
        restaurant.setName(request.getName());
        restaurant.setPhoneNumber(request.getPhoneNumber());
        restaurant.setAddress(request.getAddress());
        restaurant.setCuisineType(request.getCuisineType());
        restaurant.setBusinessHours(request.getBusinessHours());
        localRestaurantRepository.save(restaurant);

        // 儲存帳號
        MerchantAccount account = new MerchantAccount();
        account.setEmail(request.getEmail());
        account.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        account.setPhoneNumber(request.getPhoneNumber());
        account.setRestaurant(restaurant);
        merchantAccountRepository.save(account);

        // 儲存頭像檔案，並取得 URL
        String avatarUrl = fileStorageService.storeFile(avatar);

        // 儲存商家資料
        MerchantProfile profile = new MerchantProfile();
        profile.setMerchantAccount(account); // 假設有 @MapsId
        profile.setAvatarUrl(avatarUrl);
        merchantProfileRepository.save(profile);

        // 儲存餐廳照片（多張）
        for (MultipartFile photo : photos) {
            String imageUrl = fileStorageService.storeFile(photo);

            RestaurantPhoto restaurantPhoto = new RestaurantPhoto();
            restaurantPhoto.setRestaurant(restaurant);
            restaurantPhoto.setImageUrl(imageUrl);
            restaurantPhotoRepository.save(restaurantPhoto);
        }
    }
}