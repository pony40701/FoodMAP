package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(
    origins = {"http://127.0.0.1:5500", "http://localhost:5500"},
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE},
    allowCredentials = "true",
    maxAge = 3600
)
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            Optional<User> userOptional = userRepository.findById(id);
            
            if (userOptional.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            User user = userOptional.get();
            
            // 創建回應
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("email", user.getEmail());
            response.put("username", user.getUsername());
            response.put("fullName", user.getFullName());
            response.put("phoneNumber", user.getPhoneNumber());
            response.put("address", user.getAddress());
            
            // 處理頭像資料
            byte[] avatarData = user.getAvatarUrl();
            if (avatarData != null) {
                String base64Avatar = java.util.Base64.getEncoder().encodeToString(avatarData);
                response.put("avatar_url", "data:image/jpeg;base64," + base64Avatar);
                System.out.println("返回的頭像資料長度: " + avatarData.length);
            } else {
                System.out.println("用戶沒有頭像資料");
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "獲取用戶資料失敗：" + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, String> updateData) {
        try {
            System.out.println("收到更新用戶請求 - 用戶ID: " + id);
            System.out.println("更新資料: " + updateData);
            
            Optional<User> userOptional = userRepository.findById(id);
            
            if (userOptional.isEmpty()) {
                System.out.println("找不到用戶 ID: " + id);
                return ResponseEntity.notFound().build();
            }
            
            User user = userOptional.get();
            System.out.println("找到用戶: " + user.getUsername());
            
            // 更新用戶資料
            if (updateData.containsKey("fullName")) {
                user.setFullName(updateData.get("fullName"));
                System.out.println("更新姓名: " + updateData.get("fullName"));
            }
            if (updateData.containsKey("phoneNumber")) {
                user.setPhoneNumber(updateData.get("phoneNumber"));
                System.out.println("更新電話: " + updateData.get("phoneNumber"));
            }
            if (updateData.containsKey("address")) {
                user.setAddress(updateData.get("address"));
                System.out.println("更新地址: " + updateData.get("address"));
            }
            
            // 儲存更新後的用戶資料
            user = userRepository.save(user);
            System.out.println("用戶資料更新成功");
            
            // 創建回應
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("email", user.getEmail());
            response.put("username", user.getUsername());
            response.put("fullName", user.getFullName());
            response.put("phoneNumber", user.getPhoneNumber());
            response.put("address", user.getAddress());
            
            // 處理頭像資料
            byte[] avatarData = user.getAvatarUrl();
            if (avatarData != null) {
                String base64Avatar = java.util.Base64.getEncoder().encodeToString(avatarData);
                response.put("avatar_url", "data:image/jpeg;base64," + base64Avatar);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "更新用戶資料失敗：" + e.getMessage()));
        }
    }
} 