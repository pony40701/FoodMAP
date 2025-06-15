package com.example.demo.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

@Data
@NoArgsConstructor
@Entity
@Table(name = "user_profiles")
public class UserProfile {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    private String address;

    @Column(name = "notification_settings", columnDefinition = "json")
    private String notificationSettings;

    @Column(name = "privacy_settings", columnDefinition = "json")
    private String privacySettings;

    @Column(name = "avatar_url")
    private String avatarUrl;

    private String bio;

    @Column(name = "social_links", columnDefinition = "json")
    private String socialLinks;
} 