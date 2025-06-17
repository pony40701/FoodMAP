package com.example.demo.dto;

import lombok.Data;

@Data
public class MerchantLoginRequest {
    private String email;
    private String password;
}
