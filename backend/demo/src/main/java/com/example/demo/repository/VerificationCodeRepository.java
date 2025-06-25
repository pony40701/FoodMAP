package com.example.demo.repository;

import com.example.demo.entity.VerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VerificationCodeRepository extends JpaRepository<VerificationCode, Long> {
    
    Optional<VerificationCode> findByEmailAndCodeAndTypeAndUsedFalse(String email, String code, String type);
    
    List<VerificationCode> findByEmailAndTypeAndUsedFalse(String email, String type);
    
    @Modifying
    @Query("UPDATE VerificationCode v SET v.used = true WHERE v.email = :email AND v.type = :type")
    void markAllAsUsed(@Param("email") String email, @Param("type") String type);
    
    @Modifying
    @Query("DELETE FROM VerificationCode v WHERE v.expiresAt < CURRENT_TIMESTAMP")
    void deleteExpiredCodes();
} 