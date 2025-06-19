package com.example.demo.repository;
//boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan
import com.example.demo.entity.MerchantAccount;
import com.example.demo.dto.MerchantRestaurantDTO;
import com.example.demo.dto.MerchantRestaurantDTO.MerchantRestaurantProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

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

    @Modifying
    @Transactional
    @Query(value = "UPDATE restaurants r " +
           "JOIN merchant_accounts ma ON r.id = ma.restaurant_id " +
           "LEFT JOIN merchant_profiles mp ON ma.id = mp.merchant_id " +
           "SET r.name = :name, " +
           "r.email = :email, " +
           "r.phone_number = :phoneNumber, " +
           "r.address = :address, " +
           "mp.avatar_url = CASE WHEN :avatarUrl IS NOT NULL AND mp.merchant_id IS NOT NULL THEN :avatarUrl ELSE mp.avatar_url END " +
           "WHERE r.id = :restaurantId", nativeQuery = true)
    int updateBasicInfo(
        @Param("restaurantId") Integer restaurantId,
        @Param("name") String name,
        @Param("email") String email,
        @Param("phoneNumber") String phoneNumber,
        @Param("address") String address,
        @Param("avatarUrl") String avatarUrl
    );

    @Modifying
    @Transactional
    @Query(value = """
            UPDATE restaurants r
            SET r.business_hours = :businessHours,
                r.cuisine_type = :cuisineType,
                r.payment_methods = :paymentMethods
            WHERE r.id = :restaurantId
            """, nativeQuery = true)
    int updateBusinessInfo(
        @Param("restaurantId") Integer restaurantId,
        @Param("businessHours") String businessHours,
        @Param("cuisineType") String cuisineType,
        @Param("paymentMethods") String paymentMethods
    );

    @Modifying
    @Transactional
    @Query(value = """
            UPDATE restaurants r
            JOIN merchant_accounts ma ON r.id = ma.restaurant_id
            SET r.description = :description
            WHERE r.id = :restaurantId
            """, nativeQuery = true)
    int updateDescription(
        @Param("restaurantId") Integer restaurantId,
        @Param("description") String description
    );
}
