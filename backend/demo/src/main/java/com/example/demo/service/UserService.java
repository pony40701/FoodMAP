package com.example.demo.service;

import com.example.demo.dto.UserDto;
import com.example.demo.entity.User;

public interface UserService {

    UserDto login(String email, String password);
    
    User findByEmail(String email);
    
    boolean checkPassword(User user, String password);
} 