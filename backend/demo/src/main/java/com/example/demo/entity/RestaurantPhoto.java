package com.example.demo.entity;
//boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan boyan
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "restaurant_photos")
public class RestaurantPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob
    @Column(name = "image_url", columnDefinition = "LONGBLOB")
    private byte[] photoData;

    @ManyToOne
    @JoinColumn(name = "restaurant_id")
    private Restaurant restaurant;
}
