package com.foodmap.backend.service.impl;

import com.foodmap.backend.dto.UserDto;
import com.foodmap.backend.model.User;
import com.foodmap.backend.repository.UserRepository;
import com.foodmap.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
        // 在實際應用中應使用加密比對
        System.out.println("檢查密碼: 用戶密碼=[" + user.getPasswordHash() + "], 輸入密碼=[" + password + "]");
        boolean matches = user.getPasswordHash().equals(password);
        System.out.println("密碼比對結果: " + matches);
        return matches;
    }

    private UserDto convertToDto(User user) {
        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setName(user.getName());
        userDto.setEmail(user.getEmail());
        userDto.setAvatarUrl(user.getAvatarUrl());
        return userDto;
    }
} 