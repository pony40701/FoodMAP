package com.example.demo.controller;

import com.example.demo.dto.EmailRequest;
import com.example.demo.dto.EmailResponse;
import com.example.demo.service.EmailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/email")
@Tag(name = "郵件服務", description = "郵件發送相關 API")
@Slf4j
@CrossOrigin(origins = {"http://localhost:5500", "http://127.0.0.1:5500"})
public class EmailController {

    @Autowired
    private EmailService emailService;

    /**
     * 發送一般郵件
     */
    @PostMapping("/send")
    @Operation(summary = "發送郵件", description = "發送一般郵件（文字或 HTML）")
    public ResponseEntity<EmailResponse> sendEmail(@Valid @RequestBody EmailRequest request) {
        log.info("收到郵件發送請求，收件者: {}", request.getTo());
        EmailResponse response = emailService.sendEmail(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * 發送簡單文字郵件
     */
    @PostMapping("/send-simple")
    @Operation(summary = "發送簡單文字郵件", description = "發送純文字郵件")
    public ResponseEntity<EmailResponse> sendSimpleEmail(@Valid @RequestBody EmailRequest request) {
        log.info("收到簡單郵件發送請求，收件者: {}", request.getTo());
        EmailResponse response = emailService.sendSimpleEmail(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * 發送 HTML 郵件
     */
    @PostMapping("/send-html")
    @Operation(summary = "發送 HTML 郵件", description = "發送 HTML 格式郵件")
    public ResponseEntity<EmailResponse> sendHtmlEmail(@Valid @RequestBody EmailRequest request) {
        log.info("收到 HTML 郵件發送請求，收件者: {}", request.getTo());
        EmailResponse response = emailService.sendHtmlEmail(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * 發送歡迎郵件
     */
    @PostMapping("/welcome")
    @Operation(summary = "發送歡迎郵件", description = "發送新用戶歡迎郵件")
    public ResponseEntity<EmailResponse> sendWelcomeEmail(
            @RequestParam String email,
            @RequestParam String username) {
        log.info("收到歡迎郵件發送請求，收件者: {}", email);
        EmailResponse response = emailService.sendWelcomeEmail(email, username);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * 發送密碼重設郵件
     */
    @PostMapping("/password-reset")
    @Operation(summary = "發送密碼重設郵件", description = "發送密碼重設郵件")
    public ResponseEntity<EmailResponse> sendPasswordResetEmail(
            @RequestParam String email,
            @RequestParam String resetToken) {
        log.info("收到密碼重設郵件發送請求，收件者: {}", email);
        EmailResponse response = emailService.sendPasswordResetEmail(email, resetToken);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * 測試郵件服務
     */
    @PostMapping("/test")
    @Operation(summary = "測試郵件服務", description = "發送測試郵件")
    public ResponseEntity<EmailResponse> testEmail(@RequestParam String email) {
        log.info("收到測試郵件發送請求，收件者: {}", email);
        
        EmailRequest request = new EmailRequest();
        request.setTo(email);
        request.setSubject("FoodMAP 郵件服務測試");
        request.setContent("這是一封測試郵件，用於驗證郵件服務是否正常運作。\n\n如果您收到這封郵件，表示郵件服務設定成功！");
        request.setHtml(false);
        
        EmailResponse response = emailService.sendEmail(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * 批量發送郵件
     */
    @PostMapping("/send-batch")
    @Operation(summary = "批量發送郵件", description = "批量發送郵件給多個收件者")
    public ResponseEntity<List<EmailResponse>> sendBatchEmails(
            @RequestParam List<String> emails,
            @RequestParam String subject,
            @RequestParam String content,
            @RequestParam(defaultValue = "false") boolean isHtml) {
        
        log.info("收到批量郵件發送請求，收件者數量: {}", emails.size());
        
        List<EmailResponse> responses = emails.stream()
                .map(email -> {
                    EmailRequest request = new EmailRequest();
                    request.setTo(email);
                    request.setSubject(subject);
                    request.setContent(content);
                    request.setHtml(isHtml);
                    return emailService.sendEmail(request);
                })
                .toList();
        
        return ResponseEntity.ok(responses);
    }
} 