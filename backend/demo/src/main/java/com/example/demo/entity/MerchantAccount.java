package com.example.demo.entity;
//boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "merchant_accounts")
public class MerchantAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "restaurant_id")
    private Restaurant restaurant;

    @OneToOne(mappedBy = "merchantAccount", cascade = CascadeType.ALL, orphanRemoval = true)
    private MerchantProfile profile;
}
