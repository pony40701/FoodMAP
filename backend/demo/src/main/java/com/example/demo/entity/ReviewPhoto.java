package com.example.foodmap.entity;

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
    
    @Column(name = "image_url")
    private String imageUrl;
   
} 