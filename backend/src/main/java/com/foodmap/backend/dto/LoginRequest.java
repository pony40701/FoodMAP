package com.foodmap.backend.dto;

import lombok.Data;

@Data
public class LoginRequest {

    private String email;
    private String password;
    
    // 提供基本的 getter 和 setter 方法
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
} 