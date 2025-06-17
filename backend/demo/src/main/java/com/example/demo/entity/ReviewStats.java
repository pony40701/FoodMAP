package com.example.foodmap.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "review_stats")
public class ReviewStats {
    @Id
    @Column(name = "review_id")
    private Integer reviewId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "review_id", foreignKey = @ForeignKey(
        name = "fk_review_stats_review",
        foreignKeyDefinition = "FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE ON UPDATE RESTRICT"
    ))
    private Review review;
    
    @Column(name = "total_views", nullable = false)
    private Integer totalViews = 0;
    
    @Column(name = "total_favorites", nullable = false)
    private Integer totalFavorites = 0;
} 