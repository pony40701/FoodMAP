package com.foodmap.backend.service.impl;

import com.foodmap.backend.dto.UserDto;
import com.foodmap.backend.model.User;
import com.foodmap.backend.repository.UserRepository;
import com.foodmap.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDto login(String email, String password) {
        User user = findByEmail(email);
        if (user != null && checkPassword(user, password)) {
            return convertToDto(user);
        }
        return null;
    }

    @Override
    public User findByEmail(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        return userOptional.orElse(null);
    }

    @Override
    public boolean checkPassword(User user, String password) {
        // 輸出調試信息
        System.out.println("密碼比對開始：");
        System.out.println("輸入密碼: " + password);
        System.out.println("資料庫密碼 (passwordHash): " + user.getPasswordHash());
        
        // 直接使用測試帳號密碼 (根據資料庫中的資料)
        if (user.getEmail().equals("alice@example.com") && password.equals("hashedpwd1")) {
            System.out.println("測試帳號 alice 登入成功");
            return true;
        }
        
        if (user.getEmail().equals("bob@example.com") && password.equals("hashedpwd2")) {
            System.out.println("測試帳號 bob 登入成功");
            return true;
        }
        
        // 直接比對 password_hash 欄位
        if (user.getPasswordHash() != null && user.getPasswordHash().equals(password)) {
            System.out.println("密碼比對成功 (使用 passwordHash)");
            return true;
        }
        
        System.out.println("密碼比對失敗");
        return false;
    }

    private UserDto convertToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setAvatarUrl(user.getAvatarUrl());
        return dto;
    }
    
    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    @Override
    public UserDto register(String email, String password, String name, String phone, String avatarUrl) {
        try {
            // 檢查電子郵件是否已存在
            if (existsByEmail(email)) {
                return null;
            }
            
            // 創建新用戶
            User user = new User();
            user.setEmail(email);
            user.setPasswordHash(password); // 在實際應用中應該對密碼進行雜湊處理
            user.setPassword(password); // 同時設置 password 欄位，避免 null 錯誤
            user.setName(name);
            user.setPhoneNumber(phone);
            
            // 處理頭像 URL，如果太長則截斷或使用預設頭像
            if (avatarUrl != null && avatarUrl.length() > 250) {
                // 使用預設頭像
                user.setAvatarUrl("images/default-avatar.png");
            } else {
                user.setAvatarUrl(avatarUrl);
            }
            
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            
            // 儲存用戶
            User savedUser = userRepository.save(user);
            
            // 轉換為 DTO 並返回
            return convertToDto(savedUser);
        } catch (Exception e) {
            System.err.println("註冊用戶時發生錯誤: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
} 