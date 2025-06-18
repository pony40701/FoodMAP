package com.example.demo.controller;
//boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan 
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.dto.MerchantLoginRequest;
import com.example.demo.dto.MerchantLoginResponse;
import com.example.demo.entity.MerchantAccount;
import com.example.demo.repository.MerchantAccountRepository;
import com.example.demo.security.MerchantJwtService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/merchants")
@CrossOrigin(
    origins = {"http://127.0.0.1:5500", "http://localhost:5500"},
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST},
    allowCredentials = "true",
    maxAge = 3600
)
@RequiredArgsConstructor
public class MerchantLoginController {

    private final MerchantAccountRepository merchantAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final MerchantJwtService merchantJwtService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody MerchantLoginRequest request) {
        // 查詢帳號
        MerchantAccount account = merchantAccountRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "帳號不存在"));

        // 驗證密碼
        if (!passwordEncoder.matches(request.getPassword(), account.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "密碼錯誤");
        }

        // 生成 JWT token
        String token = merchantJwtService.generateToken(account);

        // 回傳登入成功訊息和 token
        return ResponseEntity.ok(MerchantLoginResponse.builder()
                .token(token)
                .email(account.getEmail())
                .restaurantId(account.getRestaurant() != null ? account.getRestaurant().getId() : null)
                .build());
    }

    @GetMapping("/validate")
    public ResponseEntity<Boolean> validateToken(@RequestHeader("Authorization") String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            String email = merchantJwtService.extractEmail(token);
            return ResponseEntity.ok(merchantJwtService.validateToken(token, email));
        }
        return ResponseEntity.ok(false);
    }
}
