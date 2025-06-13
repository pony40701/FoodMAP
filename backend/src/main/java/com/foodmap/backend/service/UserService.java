package com.foodmap.backend.service;

import com.foodmap.backend.dto.UserDto;
import com.foodmap.backend.model.User;

public interface UserService {

    UserDto login(String email, String password);
    
    User findByEmail(String email);
    
    boolean checkPassword(User user, String password);
} 