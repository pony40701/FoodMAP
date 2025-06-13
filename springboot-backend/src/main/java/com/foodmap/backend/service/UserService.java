package com.foodmap.backend.service;

import com.foodmap.backend.dto.UserDto;
import com.foodmap.backend.model.User;

public interface UserService {
    UserDto login(String email, String password);
    User findByEmail(String email);
    boolean checkPassword(User user, String password);
    
    // 新增方法
    boolean existsByEmail(String email);
    UserDto register(String email, String password, String name, String phone, String avatarUrl);
} 