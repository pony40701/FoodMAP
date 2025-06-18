package com.example.demo.repository;
//boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan
import com.example.demo.entity.MerchantAccount;
import com.example.demo.dto.MerchantRestaurantDTO;
import com.example.demo.dto.MerchantRestaurantDTO.MerchantRestaurantProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface MerchantAccountRepository extends JpaRepository<MerchantAccount, Integer> {
    Optional<MerchantAccount> findByEmail(String email);

    @Query(value = "SELECT r.name, r.email, r.phone_number, r.address, " +
           "r.business_hours, r.cuisine_type, r.payment_methods, r.description, " +
           "COALESCE(mp.avatar_url, 'images/default-avatar.png') as avatar_url " +
           "FROM restaurants r " +
           "JOIN merchant_accounts ma ON r.id = ma.restaurant_id " +
           "LEFT JOIN merchant_profiles mp ON ma.id = mp.merchant_id " +
           "WHERE r.id = :restaurantId", nativeQuery = true)
    Optional<MerchantRestaurantProjection> findRestaurantInfoById(@Param("restaurantId") Integer restaurantId);
}
