package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "google_restaurants")
public class GoogleRestaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 如果只查 id，可以只留這個欄位
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
