package com.example.demo.service.impl;

import com.example.demo.dto.UserDto;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Autowired
    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
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
        return passwordEncoder.matches(password, user.getPasswordHash());
    }

    private UserDto convertToDto(User user) {
        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setEmail(user.getEmail());
        userDto.setUsername(user.getUsername());
        userDto.setName(user.getFullName());
        userDto.setFullName(user.getFullName());
        
        // 處理頭像資料
        byte[] avatarData = user.getAvatarUrl();
        if (avatarData != null) {
            String base64Avatar = java.util.Base64.getEncoder().encodeToString(avatarData);
            userDto.setAvatarUrl("data:image/jpeg;base64," + base64Avatar);
        } else {
            userDto.setAvatarUrl(null);
        }
        
        userDto.setPhoneNumber(user.getPhoneNumber());
        return userDto;
    }
} 