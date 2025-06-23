package com.example.demo.controller;

import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.dto.MerchantRestaurantDTO;
import com.example.demo.entity.MerchantAccount;
import com.example.demo.entity.MerchantProfile;
import com.example.demo.entity.Restaurant;
import com.example.demo.entity.RestaurantPhoto;
import com.example.demo.repository.LocalRestaurantRepository;
import com.example.demo.repository.MerchantAccountRepository;
import com.example.demo.repository.MerchantProfileRepository;
import com.example.demo.repository.RestaurantPhotoRepository;
import com.example.demo.security.MerchantJwtService;

import lombok.RequiredArgsConstructor;

import java.util.stream.Collectors;
import java.util.Arrays;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/merchants/restaurant")
@CrossOrigin(
    origins = {"http://127.0.0.1:5500", "http://localhost:5500"},
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.PUT, RequestMethod.POST, RequestMethod.DELETE, RequestMethod.OPTIONS},
    allowCredentials = "true",
    maxAge = 3600
)
@RequiredArgsConstructor
public class MerchantRestaurantController {

    private final MerchantAccountRepository merchantAccountRepository;
    private final MerchantJwtService merchantJwtService;
    private final LocalRestaurantRepository restaurantRepository;
    private final RestaurantPhotoRepository restaurantPhotoRepository;
    private final MerchantProfileRepository merchantProfileRepository;

    @GetMapping("/validate")
    public ResponseEntity<Boolean> validateToken(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.ok(false);
        }

        String token = authHeader.substring(7);
        String email = merchantJwtService.extractEmail(token);
        
        boolean isValid = merchantJwtService.validateToken(token, email);
        
        return ResponseEntity.ok(isValid);
    }

    @GetMapping("/info")
    public ResponseEntity<MerchantRestaurantDTO> getRestaurantInfo(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "未提供有效的認證token");
        }

        String token = authHeader.substring(7);
        String email = merchantJwtService.extractEmail(token);
        Integer restaurantId = merchantJwtService.extractRestaurantId(token);
        
        // 驗證 token
        if (!merchantJwtService.validateToken(token, email)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "無效的token");
        }

        // 獲取餐廳資料
        return merchantAccountRepository.findRestaurantInfoById(restaurantId)
                .map(projection -> {
                    MerchantRestaurantDTO dto = MerchantRestaurantDTO.fromProjection(projection);
                    return ResponseEntity.ok(dto);
                })
                .orElseThrow(() -> {
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "找不到餐廳資料");
                });
    }

    @GetMapping("/photos/{restaurantId}")
    public ResponseEntity<List<String>> getRestaurantPhotos(@PathVariable Integer restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        List<String> photoBase64List = new ArrayList<>();
        for (RestaurantPhoto photo : restaurant.getPhotos()) {
            if (photo.getPhotoData() != null) {
                String base64Image = Base64.getEncoder().encodeToString(photo.getPhotoData());
                photoBase64List.add("data:image/jpeg;base64," + base64Image);
            }
        }

        return ResponseEntity.ok(photoBase64List);
    }

    @PutMapping(value = "/basic-info", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Transactional
    public ResponseEntity<?> updateBasicInfo(
            @RequestHeader("Authorization") String authHeader,
            @ModelAttribute MerchantRestaurantDTO.UpdateBasicInfoRequest request) {
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "未提供有效的認證token");
        }

        String token = authHeader.substring(7);
        String email = merchantJwtService.extractEmail(token);
        Integer restaurantId = merchantJwtService.extractRestaurantId(token);
        
        // 驗證 token
        if (!merchantJwtService.validateToken(token, email)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "無效的token");
        }

        try {
            // 處理頭像上傳
            byte[] avatarBytes = null;
            if (request.getAvatar() != null && !request.getAvatar().isEmpty()) {
                avatarBytes = request.getAvatar().getBytes();
            }

            // 更新資料庫
            int updatedRows = merchantAccountRepository.updateBasicInfo(
                restaurantId,
                request.getName(),
                request.getEmail(),
                request.getPhoneNumber(),
                request.getAddress()
            );

            // 如果有新的頭像，更新 MerchantProfile
            if (avatarBytes != null) {
                // 先通過 email 找到商家帳號
                MerchantAccount merchantAccount = merchantAccountRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("商家帳號不存在"));

                // 獲取或創建 MerchantProfile
                MerchantProfile profile = merchantProfileRepository.findById(merchantAccount.getId())
                    .orElseGet(() -> {
                        MerchantProfile newProfile = new MerchantProfile();
                        newProfile.setId(merchantAccount.getId());
                        newProfile.setMerchantAccount(merchantAccount);
                        return newProfile;
                    });

                // 設置頭像
                profile.setAvatarData(avatarBytes);
                profile.setAvatarData(avatarBytes);
                merchantProfileRepository.save(profile);
            }

            if (updatedRows > 0) {
                // 獲取更新後的餐廳資料
                return merchantAccountRepository.findRestaurantInfoById(restaurantId)
                    .map(projection -> {
                        MerchantRestaurantDTO dto = MerchantRestaurantDTO.fromProjection(projection);
                        return ResponseEntity.ok().body(dto);
                    })
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "找不到餐廳資料"));
            } else {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "找不到要更新的餐廳資料");
            }
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "更新基本資料失敗: " + e.getMessage());
        }
    }

    @PutMapping("/business-info")
    public ResponseEntity<?> updateBusinessInfo(
        @RequestHeader("Authorization") String authHeader,
        @RequestBody MerchantRestaurantDTO.UpdateBusinessInfoRequest request) {
    
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "未提供有效的認證token");
    }

    String token = authHeader.substring(7);
    String email = merchantJwtService.extractEmail(token);
    Integer restaurantId = merchantJwtService.extractRestaurantId(token);
    
    // 驗證 token
    if (!merchantJwtService.validateToken(token, email)) {
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "無效的token");
    }

    try {
        // 更新資料庫
        int updatedRows = merchantAccountRepository.updateBusinessInfo(
            restaurantId,
            request.getBusinessHours(),
            request.getCuisineType(),
            request.getPaymentMethods()
        );

        if (updatedRows > 0) {
            // 獲取更新後的餐廳資料
            return merchantAccountRepository.findRestaurantInfoById(restaurantId)
                .map(projection -> {
                    MerchantRestaurantDTO dto = MerchantRestaurantDTO.fromProjection(projection);
                    return ResponseEntity.ok().body(dto);
                })
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "找不到餐廳資料"));
        } else {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "找不到要更新的餐廳資料");
        }
    } catch (Exception e) {
        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "更新營業資訊失敗: " + e.getMessage());
    }
    }

    @PutMapping("/description")
    public ResponseEntity<?> updateDescription(
        @RequestHeader("Authorization") String authHeader,
        @RequestBody Map<String, String> request) {
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "未提供有效的認證token");
        }

        String token = authHeader.substring(7);
        String email = merchantJwtService.extractEmail(token);
        Integer restaurantId = merchantJwtService.extractRestaurantId(token);
        
        // 驗證 token
        if (!merchantJwtService.validateToken(token, email)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "無效的token");
        }

        try {
            String description = request.get("description");
            // 更新資料庫
            int updatedRows = merchantAccountRepository.updateDescription(
                restaurantId,
                description
            );

            if (updatedRows > 0) {
                // 獲取更新後的餐廳資料
                return merchantAccountRepository.findRestaurantInfoById(restaurantId)
                    .map(projection -> {
                        MerchantRestaurantDTO dto = MerchantRestaurantDTO.fromProjection(projection);
                        return ResponseEntity.ok().body(dto);
                    })
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "找不到餐廳資料"));
            } else {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "找不到要更新的餐廳資料");
            }
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "更新餐廳簡介失敗: " + e.getMessage());
        }
    }

    @DeleteMapping("/photos")
    @Transactional
    public ResponseEntity<?> deleteRestaurantPhoto(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> request) {
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "未提供有效的認證token");
        }

        String token = authHeader.substring(7);
        String email = merchantJwtService.extractEmail(token);
        Integer restaurantId = merchantJwtService.extractRestaurantId(token);
        
        // 驗證 token
        if (!merchantJwtService.validateToken(token, email)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "無效的token");
        }

        String base64Image = request.get("imageUrl");
        if (base64Image == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "未提供照片資料");
        }

        try {
            Restaurant restaurant = restaurantRepository.findById(restaurantId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "找不到餐廳"));

            // 將 base64 字串轉換為 byte array
            String base64Data = base64Image;
            if (base64Image.contains(",")) {
                base64Data = base64Image.split(",")[1];
            }
            
            try {
                byte[] imageData = Base64.getDecoder().decode(base64Data);
                
                // 找到並刪除照片
                List<RestaurantPhoto> photos = restaurant.getPhotos();
                boolean photoFound = false;
                RestaurantPhoto photoToDelete = null;
                
                for (RestaurantPhoto photo : photos) {
                    byte[] existingImageData = photo.getPhotoData();
                    if (existingImageData == null) {
                        continue;
                    }
                    
                    
                    // 比較圖片資料
                    if (Arrays.equals(existingImageData, imageData)) {
                        photoToDelete = photo;
                        photoFound = true;
                        break;
                    }
                }

                if (!photoFound) {
                    throw new ResponseStatusException(HttpStatus.NOT_FOUND, "找不到要刪除的照片");
                }

                // 從餐廳的照片列表中移除
                restaurant.getPhotos().remove(photoToDelete);
                restaurantRepository.save(restaurant);
                
                // 刪除照片記錄
                restaurantPhotoRepository.delete(photoToDelete);
                restaurantPhotoRepository.flush();

                return ResponseEntity.ok().build();
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "照片格式錯誤: " + e.getMessage());
            }
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "刪除照片失敗: " + e.getMessage());
        }
    }

    @PostMapping(value = "/photos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Transactional
    public ResponseEntity<?> addRestaurantPhoto(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("photo") MultipartFile photo) {
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "未提供有效的認證token");
        }

        String token = authHeader.substring(7);
        String email = merchantJwtService.extractEmail(token);
        Integer restaurantId = merchantJwtService.extractRestaurantId(token);
        
        // 驗證 token
        if (!merchantJwtService.validateToken(token, email)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "無效的token");
        }

        try {
            Restaurant restaurant = restaurantRepository.findById(restaurantId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "找不到餐廳"));

            // 讀取照片資料並轉換為 base64
            byte[] photoData = photo.getBytes();
            String base64Image = Base64.getEncoder().encodeToString(photoData);

            // 儲存到資料庫
            RestaurantPhoto restaurantPhoto = new RestaurantPhoto();
            restaurantPhoto.setRestaurant(restaurant);
            restaurantPhoto.setPhotoData(photoData);
            restaurantPhotoRepository.save(restaurantPhoto);

            return ResponseEntity.ok().body(Map.of("imageUrl", "data:image/jpeg;base64," + base64Image));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "新增照片失敗: " + e.getMessage());
        }
    }

    @GetMapping("/photos")
    public ResponseEntity<List<String>> getRestaurantPhotos(
            @RequestHeader("Authorization") String authHeader) {
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "未提供有效的認證token");
        }

        String token = authHeader.substring(7);
        String email = merchantJwtService.extractEmail(token);
        Integer restaurantId = merchantJwtService.extractRestaurantId(token);
        
        // 驗證 token
        if (!merchantJwtService.validateToken(token, email)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "無效的token");
        }

        try {
            Restaurant restaurant = restaurantRepository.findById(restaurantId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "找不到餐廳"));

            List<String> photoUrls = restaurant.getPhotos().stream()
                    .map(photo -> {
                        String base64Image = Base64.getEncoder().encodeToString(photo.getPhotoData());
                        return "data:image/jpeg;base64," + base64Image;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(photoUrls);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "獲取照片失敗");
        }
    }
} 