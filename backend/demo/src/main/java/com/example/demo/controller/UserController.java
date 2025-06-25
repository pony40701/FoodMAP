package com.example.demo.controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            System.out.println("=== 獲取用戶資料請求 ===");
            System.out.println("用戶ID: " + id);
            
            Optional<User> userOptional = userRepository.findById(id);
            
            if (userOptional.isEmpty()) {
                System.out.println("找不到用戶，ID: " + id);
                return ResponseEntity.notFound().build();
            }
            
            User user = userOptional.get();
            System.out.println("找到用戶: " + user.getUsername());
            
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
            if (avatarData != null && avatarData.length > 0) {
                String base64Avatar = java.util.Base64.getEncoder().encodeToString(avatarData);
                response.put("avatar_url", "data:image/jpeg;base64," + base64Avatar);
                System.out.println("返回的頭像資料長度: " + avatarData.length + " bytes");
            } else {
                System.out.println("用戶沒有頭像資料，返回預設值");
                response.put("avatar_url", null);
            }
            
            System.out.println("=== 用戶資料回應完成 ===");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("獲取用戶資料失敗: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "獲取用戶資料失敗：" + e.getMessage()));
        }
    }

    @GetMapping("/{id}/avatar")
    @CrossOrigin(origins = "*", allowedHeaders = "*")
    public ResponseEntity<byte[]> getUserAvatar(@PathVariable Long id) {
        System.out.println("=== 獲取用戶頭像請求 ===");
        System.out.println("用戶ID: " + id);
        
        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (user.getAvatarUrl() != null && user.getAvatarUrl().length > 0) {
                System.out.println("返回頭像，大小: " + user.getAvatarUrl().length + " bytes");
                return ResponseEntity.ok()
                        .header("Content-Type", "image/jpeg")
                        .header("Cache-Control", "no-cache, no-store, must-revalidate")
                        .header("Pragma", "no-cache")
                        .header("Expires", "0")
                        .body(user.getAvatarUrl());
            }
        }
        System.out.println("找不到頭像或用戶不存在");
        return ResponseEntity.notFound().build();
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

    @PostMapping("/{id}/avatar")
    @CrossOrigin(origins = "*", allowedHeaders = "*")
    public ResponseEntity<?> uploadAvatar(@PathVariable Long id, @RequestParam("avatar") MultipartFile file) {
        try {
            System.out.println("=== 頭像上傳請求開始 ===");
            System.out.println("用戶ID: " + id);
            System.out.println("檔案名稱: " + file.getOriginalFilename());
            System.out.println("檔案大小: " + file.getSize() + " bytes");
            System.out.println("檔案類型: " + file.getContentType());
            
            // 檢查文件是否為空
            if (file.isEmpty()) {
                System.out.println("檔案為空");
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "請選擇要上傳的檔案"
                ));
            }
            
            // 檢查文件大小 (限制為 5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                System.out.println("檔案過大: " + file.getSize() + " bytes");
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "檔案大小不能超過 5MB"
                ));
            }
            
            // 檢查文件類型
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                System.out.println("檔案類型不正確: " + contentType);
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "只允許上傳圖片檔案"
                ));
            }
            
            // 尋找用戶
            Optional<User> userOptional = userRepository.findById(id);
            if (userOptional.isEmpty()) {
                System.out.println("找不到用戶: " + id);
                return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "error", "找不到指定用戶"
                ));
            }
            
            User user = userOptional.get();
            System.out.println("找到用戶: " + user.getUsername());
            
            // 將圖片轉換為 byte array 並儲存
            byte[] imageBytes = file.getBytes();
            user.setAvatarUrl(imageBytes);
            
            System.out.println("準備儲存頭像，大小: " + imageBytes.length + " bytes");
            user = userRepository.save(user);
            System.out.println("頭像儲存成功");
            
            // 回傳更新後的用戶資料
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "頭像更新成功");
            
            // 返回 base64 編碼的頭像
            String base64Avatar = java.util.Base64.getEncoder().encodeToString(imageBytes);
            String avatarDataUrl = "data:" + contentType + ";base64," + base64Avatar;
            response.put("avatar_url", avatarDataUrl);
            
            System.out.println("返回 base64 頭像，長度: " + avatarDataUrl.length() + " 字符");
            System.out.println("=== 頭像上傳完成 ===");
            
            return ResponseEntity.ok(response);
            
        } catch (IOException e) {
            System.err.println("檔案處理失敗: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "檔案處理失敗：" + e.getMessage()
            ));
        } catch (Exception e) {
            System.err.println("頭像上傳失敗: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "頭像上傳失敗：" + e.getMessage()
            ));
        }
    }
} 