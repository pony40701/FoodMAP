package com.example.demo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class LoginResponse {
    private boolean success;
    private String message;
    private String token;
    private UserDto user;

    public LoginResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public LoginResponse(boolean success, String message, String token, UserDto user) {
        this.success = success;
        this.message = message;
        this.token = token;
        this.user = user;
    }

    public static LoginResponse success(String token, UserDto user) {
        return new LoginResponse(true, "登入成功", token, user);
    }

    public static LoginResponse failure(String message) {
        return new LoginResponse(false, message);
    }
} 