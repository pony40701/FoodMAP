package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Email;
import lombok.Data;
import java.util.List;

@Data
public class RegisterRequest {

    @NotNull
    private String email;

    @NotNull
    private String password;

    @NotNull
    private String phoneNumber;

    @NotNull
    private String name;

    @NotNull
    private String address;

    @NotNull
    private String cuisineType;

    @NotNull
    private String businessHours;

    @NotNull
    private List<String> imageUrls;
}