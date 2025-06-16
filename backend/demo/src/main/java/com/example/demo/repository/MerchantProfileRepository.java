package com.example.demo.repository;

import com.example.demo.entity.MerchantProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MerchantProfileRepository extends JpaRepository<MerchantProfile, Integer> {
}
