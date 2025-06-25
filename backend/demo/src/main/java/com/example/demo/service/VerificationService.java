package com.example.demo.service;

import com.example.demo.entity.VerificationCode;
import com.example.demo.repository.VerificationCodeRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Optional;

@Service
@Slf4j
public class VerificationService {

    @Autowired
    private VerificationCodeRepository verificationCodeRepository;
    
    @Autowired
    private EmailService emailService;

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String CODE_CHARS = "0123456789";

    /**
     * 生成 6 位數驗證碼
     */
    public String generateVerificationCode() {
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            code.append(CODE_CHARS.charAt(RANDOM.nextInt(CODE_CHARS.length())));
        }
        return code.toString();
    }

    /**
     * 發送註冊驗證碼
     */
    public boolean sendRegistrationCode(String email, String username) {
        try {
            // 生成驗證碼
            String code = generateVerificationCode();
            
            // 儲存驗證碼
            VerificationCode verificationCode = new VerificationCode(email, code, "REGISTRATION");
            verificationCodeRepository.save(verificationCode);
            
            // 發送郵件
            String subject = "FoodMAP 註冊驗證碼";
            String content = createRegistrationEmailContent(username, code);
            
            var emailRequest = new com.example.demo.dto.EmailRequest();
            emailRequest.setTo(email);
            emailRequest.setSubject(subject);
            emailRequest.setContent(content);
            emailRequest.setHtml(true);
            
            var response = emailService.sendEmail(emailRequest);
            
            if (response.isSuccess()) {
                log.info("註冊驗證碼發送成功，郵箱: {}", email);
                return true;
            } else {
                log.error("註冊驗證碼發送失敗，郵箱: {}, 錯誤: {}", email, response.getMessage());
                return false;
            }
            
        } catch (Exception e) {
            log.error("發送註冊驗證碼時發生錯誤，郵箱: {}", email, e);
            return false;
        }
    }

    /**
     * 發送密碼重設驗證碼
     */
    public boolean sendPasswordResetCode(String email) {
        try {
            // 生成驗證碼
            String code = generateVerificationCode();
            
            // 儲存驗證碼
            VerificationCode verificationCode = new VerificationCode(email, code, "PASSWORD_RESET");
            verificationCodeRepository.save(verificationCode);
            
            // 發送郵件
            String subject = "FoodMAP 密碼重設驗證碼";
            String content = createPasswordResetEmailContent(code);
            
            var emailRequest = new com.example.demo.dto.EmailRequest();
            emailRequest.setTo(email);
            emailRequest.setSubject(subject);
            emailRequest.setContent(content);
            emailRequest.setHtml(true);
            
            var response = emailService.sendEmail(emailRequest);
            
            if (response.isSuccess()) {
                log.info("密碼重設驗證碼發送成功，郵箱: {}", email);
                return true;
            } else {
                log.error("密碼重設驗證碼發送失敗，郵箱: {}, 錯誤: {}", email, response.getMessage());
                return false;
            }
            
        } catch (Exception e) {
            log.error("發送密碼重設驗證碼時發生錯誤，郵箱: {}", email, e);
            return false;
        }
    }

    /**
     * 驗證驗證碼
     */
    public boolean verifyCode(String email, String code, String type) {
        try {
            Optional<VerificationCode> verificationCodeOpt = 
                verificationCodeRepository.findByEmailAndCodeAndTypeAndUsedFalse(email, code, type);
            
            if (verificationCodeOpt.isPresent()) {
                VerificationCode verificationCode = verificationCodeOpt.get();
                
                if (verificationCode.isValid()) {
                    // 標記為已使用
                    verificationCode.setUsed(true);
                    verificationCodeRepository.save(verificationCode);
                    return true;
                }
            }
            
            return false;
            
        } catch (Exception e) {
            log.error("驗證驗證碼時發生錯誤，郵箱: {}, 驗證碼: {}", email, code, e);
            return false;
        }
    }

    /**
     * 建立註冊郵件內容
     */
    private String createRegistrationEmailContent(String username, String code) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>FoodMAP 註冊驗證碼</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #e74c3c;">FoodMAP 註冊驗證碼</h1>
                    <p>親愛的 <strong>%s</strong>，</p>
                    <p>感謝您註冊 FoodMAP！請使用以下驗證碼完成註冊：</p>
                    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
                        <h2 style="color: #e74c3c; font-size: 32px; letter-spacing: 5px; margin: 0;">%s</h2>
                    </div>
                    <p><strong>驗證碼將在 10 分鐘後失效</strong></p>
                    <p>如果您沒有註冊 FoodMAP 帳戶，請忽略此郵件。</p>
                    <p>祝您用餐愉快！</p>
                    <p>FoodMAP 團隊</p>
                </div>
            </body>
            </html>
            """.formatted(username, code);
    }

    /**
     * 建立密碼重設郵件內容
     */
    private String createPasswordResetEmailContent(String code) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>FoodMAP 密碼重設驗證碼</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #e74c3c;">FoodMAP 密碼重設驗證碼</h1>
                    <p>您要求重設 FoodMAP 帳戶的密碼。</p>
                    <p>請使用以下驗證碼重設您的密碼：</p>
                    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
                        <h2 style="color: #e74c3c; font-size: 32px; letter-spacing: 5px; margin: 0;">%s</h2>
                    </div>
                    <p><strong>驗證碼將在 10 分鐘後失效</strong></p>
                    <p>如果您沒有要求重設密碼，請忽略此郵件。</p>
                    <p>FoodMAP 團隊</p>
                </div>
            </body>
            </html>
            """.formatted(code);
    }
} 