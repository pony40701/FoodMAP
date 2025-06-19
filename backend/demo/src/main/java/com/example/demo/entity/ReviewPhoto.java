package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "review_photos")
public class ReviewPhoto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne
    @JoinColumn(name = "review_id")
    private Review review;
    
    @Column(name = "image_url", length = 255)
    private String imageUrl;
    
    @Lob
    @Column(name = "image", columnDefinition = "LONGBLOB")
    private byte[] image;
    
    @Column(name = "image_width", length = 50)
    private String imageWidth;
    
    @Column(name = "image_height", length = 50)
    private String imageHeight;
} 