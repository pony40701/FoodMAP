package com.foodmap.backend.controller;

import com.foodmap.backend.dto.LoginRequest;
import com.foodmap.backend.dto.LoginResponse;
import com.foodmap.backend.dto.UserDto;
import com.foodmap.backend.model.User;
import com.foodmap.backend.security.JwtService;
import com.foodmap.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;

    @Autowired
    public AuthController(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        // 嘗試登入
        UserDto userDto = userService.login(loginRequest.getEmail(), loginRequest.getPassword());
        
        if (userDto == null) {
            // 登入失敗
            LoginResponse response = new LoginResponse();
            response.setSuccess(false);
            response.setMessage("帳號或密碼錯誤");
            response.setToken(null);
            response.setUser(null);
            return ResponseEntity.status(401).body(response);
        }
        
        // 登入成功，生成 JWT Token
        User user = userService.findByEmail(loginRequest.getEmail());
        String token = jwtService.generateToken(user);
        
        // 返回登入成功響應
        LoginResponse response = new LoginResponse();
        response.setSuccess(true);
        response.setMessage("登入成功");
        response.setToken(token);
        response.setUser(userDto);
        return ResponseEntity.ok(response);
    }
} 