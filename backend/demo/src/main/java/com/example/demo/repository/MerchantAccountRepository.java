package com.example.demo.repository;

import com.example.demo.entity.MerchantAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MerchantAccountRepository extends JpaRepository<MerchantAccount, Integer> {
    Optional<MerchantAccount> findByEmail(String email);
}
