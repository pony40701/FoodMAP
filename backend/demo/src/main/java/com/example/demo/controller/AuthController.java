package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.VerificationService;
import com.example.demo.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://localhost:5500"})
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VerificationService verificationService;

    @Autowired
    private EmailService emailService;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        try {
            String email = loginRequest.get("email");
            String password = loginRequest.get("password");

            // 驗證必要欄位
            if (email == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "電子郵件和密碼為必填欄位"));
            }

            // 查找使用者
            Optional<User> userOptional = userRepository.findByEmail(email);
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(401).body(Map.of("error", "使用者不存在"));
            }

            User user = userOptional.get();
            String storedHash = user.getPasswordHash();

            // 驗證密碼
            if (storedHash == null || !passwordEncoder.matches(password, storedHash)) {
                return ResponseEntity.status(401).body(Map.of("error", "密碼錯誤"));
            }

            // 創建回應
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("email", user.getEmail());
            response.put("username", user.getUsername());
            response.put("fullName", user.getFullName());
            
            // 處理頭像資料
            byte[] avatarData = user.getAvatarUrl();
            if (avatarData != null) {
                String base64Avatar = java.util.Base64.getEncoder().encodeToString(avatarData);
                response.put("avatar_url", "data:image/jpeg;base64," + base64Avatar);
            }
            
            response.put("message", "登入成功");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "登入失敗：" + e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> registerRequest) {
        try {
            // 獲取並驗證必要欄位
            String email = registerRequest.get("email");
            String username = registerRequest.get("username");
            String password = registerRequest.get("password");
            String name = registerRequest.get("name");
            String phoneNumber = registerRequest.get("phone_number");
            String avatarBase64 = registerRequest.get("avatar_url");

            // 驗證必要欄位是否為空
            if (email == null || email.trim().isEmpty() ||
                username == null || username.trim().isEmpty() ||
                password == null || password.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "電子郵件、使用者名稱和密碼為必填欄位"));
            }

            // 清理輸入
            email = email.trim().toLowerCase();
            username = username.trim();
            
            // 檢查郵箱是否已存在
            if (userRepository.existsByEmail(email)) {
                return ResponseEntity.badRequest().body(Map.of("error", "此郵箱已被註冊"));
            }

            // 檢查使用者名稱是否已存在
            if (userRepository.existsByUsername(username)) {
                return ResponseEntity.badRequest().body(Map.of("error", "此使用者名稱已被使用"));
            }

            // 驗證使用者名稱格式
            if (!username.matches("^[a-zA-Z0-9_]{3,20}$")) {
                return ResponseEntity.badRequest().body(Map.of("error", "使用者名稱只能包含英文字母、數字和底線，長度為 3-20 個字元"));
            }

            // 創建新使用者
            User user = new User();
            user.setEmail(email);
            user.setUsername(username);
            
            // 加密並設置密碼
            String encryptedPassword = passwordEncoder.encode(password);
            user.setPasswordHash(encryptedPassword);
            
            user.setFullName(name);
            user.setPhoneNumber(phoneNumber);

            // 處理頭像
            if (avatarBase64 != null && !avatarBase64.isEmpty()) {
                try {
                    // 檢查是否包含 data:image 前綴
                    String base64Data = avatarBase64;
                    if (avatarBase64.contains(",")) {
                        base64Data = avatarBase64.split(",")[1];
                    }
                    
                    // 解碼 base64 數據為二進制圖片資料
                    byte[] imageBytes = java.util.Base64.getDecoder().decode(base64Data);
                    user.setAvatarUrl(imageBytes);
                    
                    System.out.println("頭像處理成功，大小: " + imageBytes.length + " bytes");
                } catch (Exception e) {
                    System.err.println("頭像處理失敗: " + e.getMessage());
                    e.printStackTrace();  // 輸出詳細錯誤訊息
                    return ResponseEntity.badRequest().body(Map.of("error", "頭像處理失敗: " + e.getMessage()));
                }
            } else {
                System.out.println("未提供頭像");
            }

            // 儲存使用者
            user = userRepository.save(user);

            // 發送註冊成功歡迎信
            emailService.sendWelcomeEmail(email, username);

            // 創建回應
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("email", user.getEmail());
            response.put("username", user.getUsername());
            response.put("name", user.getFullName());
            response.put("message", "註冊成功");
            
            // 處理頭像資料
            byte[] avatarData = user.getAvatarUrl();
            if (avatarData != null) {
                String base64Avatar = java.util.Base64.getEncoder().encodeToString(avatarData);
                response.put("avatar_url", "data:image/jpeg;base64," + base64Avatar);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace(); // 記錄詳細錯誤
            return ResponseEntity.status(500).body(Map.of("error", "註冊失敗：" + e.getMessage()));
        }
    }

    @PostMapping("/send-registration-code")
    public ResponseEntity<?> sendRegistrationCode(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String username = request.get("username");

            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "電子郵件為必填欄位"));
            }

            email = email.trim().toLowerCase();

            // 檢查郵箱是否已存在
            if (userRepository.existsByEmail(email)) {
                return ResponseEntity.badRequest().body(Map.of("error", "此郵箱已被註冊"));
            }

            // 發送註冊驗證碼
            boolean success = verificationService.sendRegistrationCode(email, username != null ? username : "用戶");
            
            if (success) {
                return ResponseEntity.ok(Map.of("message", "註冊驗證碼已發送"));
            } else {
                return ResponseEntity.status(500).body(Map.of("error", "驗證碼發送失敗"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "發送驗證碼失敗：" + e.getMessage()));
        }
    }

    @PostMapping("/verify-registration-code")
    public ResponseEntity<?> verifyRegistrationCode(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String code = request.get("code");

            if (email == null || code == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "電子郵件和驗證碼為必填欄位"));
            }

            email = email.trim().toLowerCase();

            // 驗證驗證碼
            boolean isValid = verificationService.verifyCode(email, code, "REGISTRATION");
            
            if (isValid) {
                return ResponseEntity.ok(Map.of("message", "驗證碼驗證成功"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "驗證碼無效或已過期"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "驗證失敗：" + e.getMessage()));
        }
    }

    @PostMapping("/send-password-reset-code")
    public ResponseEntity<?> sendPasswordResetCode(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");

            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "電子郵件為必填欄位"));
            }

            email = email.trim().toLowerCase();

            // 檢查郵箱是否存在
            if (!userRepository.existsByEmail(email)) {
                return ResponseEntity.badRequest().body(Map.of("error", "此郵箱未註冊"));
            }

            // 發送密碼重設驗證碼
            boolean success = verificationService.sendPasswordResetCode(email);
            
            if (success) {
                return ResponseEntity.ok(Map.of("message", "密碼重設驗證碼已發送"));
            } else {
                return ResponseEntity.status(500).body(Map.of("error", "驗證碼發送失敗"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "發送驗證碼失敗：" + e.getMessage()));
        }
    }

    @PostMapping("/verify-password-reset-code")
    public ResponseEntity<?> verifyPasswordResetCode(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String code = request.get("code");

            if (email == null || code == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "電子郵件和驗證碼為必填欄位"));
            }

            email = email.trim().toLowerCase();

            // 驗證驗證碼
            boolean isValid = verificationService.verifyCode(email, code, "PASSWORD_RESET");
            
            if (isValid) {
                return ResponseEntity.ok(Map.of("message", "驗證碼驗證成功"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "驗證碼無效或已過期"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "驗證失敗：" + e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String code = request.get("code");
            String newPassword = request.get("newPassword");

            if (email == null || code == null || newPassword == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "電子郵件、驗證碼和新密碼為必填欄位"));
            }

            email = email.trim().toLowerCase();

            // 驗證驗證碼
            boolean isValid = verificationService.verifyCode(email, code, "PASSWORD_RESET");
            
            if (!isValid) {
                return ResponseEntity.badRequest().body(Map.of("error", "驗證碼無效或已過期"));
            }

            // 查找使用者
            Optional<User> userOptional = userRepository.findByEmail(email);
            if (userOptional.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "使用者不存在"));
            }

            User user = userOptional.get();
            
            // 更新密碼
            String encryptedPassword = passwordEncoder.encode(newPassword);
            user.setPasswordHash(encryptedPassword);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "密碼重設成功"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "密碼重設失敗：" + e.getMessage()));
        }
    }

    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String email) {
        try {
            boolean exists = userRepository.existsByEmail(email);
            return ResponseEntity.ok(Map.of("exists", exists));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "檢查郵箱失敗：" + e.getMessage()));
        }
    }

    @GetMapping("/generate-test-password")
    public ResponseEntity<?> generateTestPassword() {
        String testPassword = "test123";
        String hashedPassword = passwordEncoder.encode(testPassword);
        return ResponseEntity.ok(Map.of(
            "password", testPassword,
            "hashedPassword", hashedPassword
        ));
    }
} 