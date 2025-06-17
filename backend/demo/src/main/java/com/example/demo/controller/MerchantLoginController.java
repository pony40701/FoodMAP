package com.example.demo.controller;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.MerchantLoginRequest;
import com.example.demo.entity.MerchantAccount;
import com.example.demo.repository.MerchantAccountRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/merchants")
@RequiredArgsConstructor
public class MerchantLoginController {

    private final MerchantAccountRepository merchantAccountRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody MerchantLoginRequest request) {
        // 查詢帳號
        Optional<MerchantAccount> accountOpt = merchantAccountRepository.findByEmail(request.getEmail());

        if (accountOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("帳號不存在");
        }

        MerchantAccount account = accountOpt.get();

        // 驗證密碼
        if (!passwordEncoder.matches(request.getPassword(), account.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("密碼錯誤");
        }

        // TODO: 可以回傳 token 或簡單訊息
        return ResponseEntity.ok("登入成功");
    }
}
