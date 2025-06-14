package com.example.demo;

import com.example.demo.entity.GoogleRestaurant;
import com.example.demo.repository.GoogleRestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.List;

@SpringBootApplication
public class DemoApplication implements CommandLineRunner {

    @Autowired
    private GoogleRestaurantRepository googleRestaurantRepository;

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }

    @Override
    public void run(String... args) {
        List<GoogleRestaurant> restaurants = googleRestaurantRepository.findAll();
        System.out.println("查詢到的 restaurant ID：");
        for (GoogleRestaurant r : restaurants) {
            System.out.println("ID: " + r.getId());
        }
    }
}
