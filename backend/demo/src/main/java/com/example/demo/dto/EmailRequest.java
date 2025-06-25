package com.example.demo.dto;

import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

@Data
public class EmailRequest {
    
    @NotEmpty(message = "收件者不能為空")
    @Email(message = "收件者郵箱格式不正確")
    private String to;
    
    private List<String> cc;
    
    private List<String> bcc;
    
    @NotBlank(message = "主旨不能為空")
    private String subject;
    
    @NotBlank(message = "內容不能為空")
    private String content;
    
    private boolean isHtml = false;
    
    private List<String> attachments;
} 