package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "review_ratings")
public class ReviewRating {
    @Id
    @Column(name = "review_id")
    private Integer reviewId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "review_id")
    private Review review;

    private Integer environmentScore;
    private Integer serviceScore;
    private Integer tasteScore;
    private Integer priceScore;
    private Float overallScore;
} 