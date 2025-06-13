package com.foodmap.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse implements Serializable {
    
    @JsonProperty("success")
    private boolean success;
    
    @JsonProperty("message")
    private String message;
    
    @JsonProperty("token")
    private String token;
    
    @JsonProperty("user")
    private UserDto user;

    // 添加手動構造函數
    public LoginResponse(boolean success, String message, String token, UserDto user) {
        this.success = success;
        this.message = message;
        this.token = token;
        this.user = user;
    }
} 