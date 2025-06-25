package com.example.demo.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmailResponse {
    
    private boolean success;
    private String message;
    private String messageId;
    
    public static EmailResponse success(String messageId) {
        return new EmailResponse(true, "郵件發送成功", messageId);
    }
    
    public static EmailResponse error(String message) {
        return new EmailResponse(false, message, null);
    }
} 