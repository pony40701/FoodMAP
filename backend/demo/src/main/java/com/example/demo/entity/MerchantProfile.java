package com.example.demo.entity;
//boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "merchant_profiles")
public class MerchantProfile {

    @Id
    @Column(name = "merchant_id")
    private Integer id;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "description")
    private String description;

    @OneToOne
    @MapsId
    @JoinColumn(name = "merchant_id")
    private MerchantAccount merchantAccount;
}
