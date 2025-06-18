package com.example.demo.service;
//boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.demo.repository.MerchantAccountRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MerchantLoginService {

    private final MerchantAccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    public boolean authenticate(String email, String rawPassword) {
        return accountRepository.findByEmail(email)
                .map(account -> passwordEncoder.matches(rawPassword, account.getPasswordHash()))
                .orElse(false);
    }
}
