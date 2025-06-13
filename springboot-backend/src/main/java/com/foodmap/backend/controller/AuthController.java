package com.foodmap.backend.controller;

import com.foodmap.backend.dto.LoginRequest;
import com.foodmap.backend.dto.RegisterRequest;
import com.foodmap.backend.dto.UserDto;
import com.foodmap.backend.model.User;
import com.foodmap.backend.security.JwtTokenUtil;
import com.foodmap.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AuthController {

    private static final Logger logger = Logger.getLogger(AuthController.class.getName());
    
    private final UserService userService;
    private final JwtTokenUtil jwtTokenUtil;

    @Autowired
    public AuthController(UserService userService, JwtTokenUtil jwtTokenUtil) {
        this.userService = userService;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    @PostMapping(value = "/login", 
                produces = MediaType.APPLICATION_JSON_VALUE, 
                consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest loginRequest) {
        logger.info("接收到登入請求: " + loginRequest.getEmail());
        
        try {
            // 嘗試登入
            UserDto userDto = userService.login(loginRequest.getEmail(), loginRequest.getPassword());
            
            if (userDto == null) {
                // 登入失敗，返回錯誤訊息
                logger.warning("登入失敗: " + loginRequest.getEmail());
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "帳號或密碼錯誤");
                response.put("token", null);
                response.put("user", null);
                
                return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response);
            }
            
            // 登入成功，生成 JWT
            User user = userService.findByEmail(loginRequest.getEmail());
            String token = jwtTokenUtil.generateToken(user);
            
            logger.info("登入成功: " + loginRequest.getEmail());
            
            // 創建用戶資訊 Map
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", userDto.getId());
            userMap.put("name", userDto.getName());
            userMap.put("email", userDto.getEmail());
            userMap.put("avatarUrl", userDto.getAvatarUrl());
            
            // 創建響應 Map
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "登入成功");
            response.put("token", token);
            response.put("user", userMap);
            
            // 返回登入成功響應
            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(response);
        } catch (Exception e) {
            logger.severe("登入處理發生錯誤: " + e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "系統錯誤，請稍後再試");
            response.put("token", null);
            response.put("user", null);
            
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .contentType(MediaType.APPLICATION_JSON)
                .body(response);
        }
    }
    
    @PostMapping(value = "/register", 
                produces = MediaType.APPLICATION_JSON_VALUE, 
                consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> register(@RequestBody RegisterRequest registerRequest) {
        logger.info("接收到註冊請求: " + registerRequest.getEmail());
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 檢查電子郵件是否已存在
            if (userService.existsByEmail(registerRequest.getEmail())) {
                logger.warning("註冊失敗: 電子郵件已存在 - " + registerRequest.getEmail());
                
                response.put("success", false);
                response.put("message", "此電子郵件已被註冊");
                
                return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response);
            }
            
            // 創建新用戶
            UserDto userDto = userService.register(
                registerRequest.getEmail(),
                registerRequest.getPassword(),
                registerRequest.getName(),
                registerRequest.getPhone(),
                registerRequest.getAvatarUrl()
            );
            
            if (userDto != null) {
                logger.info("註冊成功: " + registerRequest.getEmail());
                
                // 創建用戶資訊 Map
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", userDto.getId());
                userMap.put("name", userDto.getName());
                userMap.put("email", userDto.getEmail());
                userMap.put("avatarUrl", userDto.getAvatarUrl());
                
                // 生成 JWT
                User user = userService.findByEmail(registerRequest.getEmail());
                String token = jwtTokenUtil.generateToken(user);
                
                response.put("success", true);
                response.put("message", "註冊成功");
                response.put("token", token);
                response.put("user", userMap);
                
                return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response);
            } else {
                logger.warning("註冊失敗: 無法創建用戶 - " + registerRequest.getEmail());
                
                response.put("success", false);
                response.put("message", "註冊失敗，請稍後再試");
                
                return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response);
            }
        } catch (Exception e) {
            logger.severe("註冊處理發生錯誤: " + e.getMessage());
            
            response.put("success", false);
            response.put("message", "系統錯誤，請稍後再試");
            
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .contentType(MediaType.APPLICATION_JSON)
                .body(response);
        }
    }
} 