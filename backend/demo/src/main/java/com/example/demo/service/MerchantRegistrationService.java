package com.example.demo.service;
//boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan
import java.util.List;
import java.io.IOException;

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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RequiredArgsConstructor
@Service
public class MerchantRegistrationService {

    private static final Logger logger = LoggerFactory.getLogger(MerchantRegistrationService.class);

    private final MerchantAccountRepository merchantAccountRepository;
    private final MerchantProfileRepository merchantProfileRepository;
    private final LocalRestaurantRepository localRestaurantRepository;
    private final RestaurantPhotoRepository restaurantPhotoRepository;
    private final PasswordEncoder passwordEncoder;

    public void registerMerchant(RegisterRequest request, MultipartFile avatar, List<MultipartFile> photos) throws IOException {
        logger.info("開始註冊商家流程");
        logger.info("收到的照片數量: {}", photos != null ? photos.size() : 0);

        // 儲存餐廳
        Restaurant restaurant = new Restaurant();
        restaurant.setName(request.getName());
        restaurant.setPhoneNumber(request.getPhoneNumber());
        restaurant.setAddress(request.getAddress());
        restaurant.setCuisineType(request.getCuisineType());
        restaurant.setBusinessHours(request.getBusinessHours());
        Restaurant savedRestaurant = localRestaurantRepository.save(restaurant);
        logger.info("餐廳資料已儲存，ID: {}", savedRestaurant.getId());

        // 儲存帳號
        MerchantAccount account = new MerchantAccount();
        account.setEmail(request.getEmail());
        account.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        account.setPhoneNumber(request.getPhoneNumber());
        account.setRestaurant(savedRestaurant);
        MerchantAccount savedAccount = merchantAccountRepository.save(account);
        logger.info("商家帳號已儲存，ID: {}", savedAccount.getId());

        // 儲存頭像
        MerchantProfile profile = new MerchantProfile();
        profile.setMerchantAccount(savedAccount);
        if (avatar != null && !avatar.isEmpty()) {
            logger.info("處理頭像: {}", avatar.getOriginalFilename());
            profile.setAvatarUrl(avatar.getBytes());
        }
        MerchantProfile savedProfile = merchantProfileRepository.save(profile);
        logger.info("商家檔案已儲存，ID: {}", savedProfile.getId());

        // 儲存餐廳照片（多張）
        if (photos != null) {
            logger.info("開始處理餐廳照片，總數量：{}", photos.size());
            for (MultipartFile photo : photos) {
                if (photo != null && !photo.isEmpty()) {
                    try {
                        logger.info("處理照片：{}, 大小：{} bytes", photo.getOriginalFilename(), photo.getSize());
                        RestaurantPhoto restaurantPhoto = new RestaurantPhoto();
                        restaurantPhoto.setRestaurant(savedRestaurant);
                        restaurantPhoto.setImageUrl(photo.getBytes());
                        RestaurantPhoto savedPhoto = restaurantPhotoRepository.save(restaurantPhoto);
                        logger.info("照片已儲存成功，ID：{}", savedPhoto.getId());
                    } catch (Exception e) {
                        logger.error("儲存照片時發生錯誤：{}", e.getMessage());
                        throw e;
                    }
                } else {
                    logger.warn("跳過空的照片檔案");
                }
            }
        } else {
            logger.info("沒有收到餐廳照片");
        }
        
        logger.info("商家註冊完成");
    }
}