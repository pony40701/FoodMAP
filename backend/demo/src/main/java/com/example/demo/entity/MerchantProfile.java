package com.example.demo.entity;
//boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.Data;

@Data
@Entity
@Table(name = "merchant_profiles")
public class MerchantProfile {

    @Id
    @Column(name = "merchant_id")
    private Integer id;

    @Lob
    @Column(name = "avatar_url", columnDefinition = "LONGBLOB")
    private byte[] avatarData;

    @Column(name = "description")
    private String description;

    @Version
    @Column(name = "version")
    private Long version;

    @OneToOne
    @MapsId
    @JoinColumn(name = "merchant_id")
    private MerchantAccount merchantAccount;
}
