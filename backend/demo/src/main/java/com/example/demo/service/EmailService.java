package com.example.demo.service;

import com.example.demo.dto.EmailRequest;
import com.example.demo.dto.EmailResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.File;
import java.util.List;

@Service
@Slf4j
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    /**
     * 發送簡單文字郵件
     */
    public EmailResponse sendSimpleEmail(EmailRequest request) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(request.getTo());
            message.setSubject(request.getSubject());
            message.setText(request.getContent());
            
            // 設定副本收件者
            if (request.getCc() != null && !request.getCc().isEmpty()) {
                message.setCc(request.getCc().toArray(new String[0]));
            }
            
            // 設定密件副本收件者
            if (request.getBcc() != null && !request.getBcc().isEmpty()) {
                message.setBcc(request.getBcc().toArray(new String[0]));
            }
            
            mailSender.send(message);
            log.info("郵件發送成功，收件者: {}", request.getTo());
            return EmailResponse.success("simple-email-" + System.currentTimeMillis());
            
        } catch (Exception e) {
            log.error("發送郵件失敗: {}", e.getMessage(), e);
            return EmailResponse.error("發送郵件失敗: " + e.getMessage());
        }
    }

    /**
     * 發送 HTML 郵件
     */
    public EmailResponse sendHtmlEmail(EmailRequest request) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(request.getTo());
            helper.setSubject(request.getSubject());
            helper.setText(request.getContent(), true); // true 表示 HTML 內容
            
            // 設定副本收件者
            if (request.getCc() != null && !request.getCc().isEmpty()) {
                helper.setCc(request.getCc().toArray(new String[0]));
            }
            
            // 設定密件副本收件者
            if (request.getBcc() != null && !request.getBcc().isEmpty()) {
                helper.setBcc(request.getBcc().toArray(new String[0]));
            }
            
            // 處理附件
            if (request.getAttachments() != null && !request.getAttachments().isEmpty()) {
                for (String attachmentPath : request.getAttachments()) {
                    if (StringUtils.hasText(attachmentPath)) {
                        File file = new File(attachmentPath);
                        if (file.exists()) {
                            helper.addAttachment(file.getName(), new FileSystemResource(file));
                        } else {
                            log.warn("附件檔案不存在: {}", attachmentPath);
                        }
                    }
                }
            }
            
            mailSender.send(message);
            log.info("HTML 郵件發送成功，收件者: {}", request.getTo());
            return EmailResponse.success("html-email-" + System.currentTimeMillis());
            
        } catch (MessagingException e) {
            log.error("發送 HTML 郵件失敗: {}", e.getMessage(), e);
            return EmailResponse.error("發送 HTML 郵件失敗: " + e.getMessage());
        }
    }

    /**
     * 發送郵件（自動判斷是否為 HTML）
     */
    public EmailResponse sendEmail(EmailRequest request) {
        if (request.isHtml()) {
            return sendHtmlEmail(request);
        } else {
            return sendSimpleEmail(request);
        }
    }

    /**
     * 發送歡迎郵件
     */
    public EmailResponse sendWelcomeEmail(String to, String username) {
        EmailRequest request = new EmailRequest();
        request.setTo(to);
        request.setSubject("歡迎加入 FoodMAP！");
        request.setContent(createWelcomeEmailContent(username));
        request.setHtml(true);
        
        return sendEmail(request);
    }

    /**
     * 發送密碼重設郵件
     */
    public EmailResponse sendPasswordResetEmail(String to, String resetToken) {
        EmailRequest request = new EmailRequest();
        request.setTo(to);
        request.setSubject("FoodMAP 密碼重設");
        request.setContent(createPasswordResetEmailContent(resetToken));
        request.setHtml(true);
        
        return sendEmail(request);
    }

    /**
     * 建立歡迎郵件內容
     */
    private String createWelcomeEmailContent(String username) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>歡迎加入 FoodMAP</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #e74c3c;">歡迎加入 FoodMAP！</h1>
                    <p>親愛的 <strong>%s</strong>，</p>
                    <p>感謝您註冊 FoodMAP！我們很高興您加入我們的美食探索社群。</p>
                    <p>在 FoodMAP，您可以：</p>
                    <ul>
                        <li>探索各種美食餐廳</li>
                        <li>分享您的用餐體驗</li>
                        <li>收藏喜愛的餐廳</li>
                        <li>查看其他用戶的評價</li>
                    </ul>
                    <p>立即開始您的美食之旅吧！</p>
                    <p>祝您用餐愉快！</p>
                    <p>FoodMAP 團隊</p>
                </div>
            </body>
            </html>
            """.formatted(username);
    }

    /**
     * 建立密碼重設郵件內容
     */
    private String createPasswordResetEmailContent(String resetToken) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>密碼重設</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #e74c3c;">密碼重設</h1>
                    <p>您要求重設 FoodMAP 帳戶的密碼。</p>
                    <p>請點擊以下連結重設您的密碼：</p>
                    <p><a href="http://localhost:5500/reset-password?token=%s" 
                          style="background-color: #e74c3c; color: white; padding: 10px 20px; 
                                 text-decoration: none; border-radius: 5px; display: inline-block;">
                        重設密碼
                    </a></p>
                    <p>如果您沒有要求重設密碼，請忽略此郵件。</p>
                    <p>此連結將在 24 小時後失效。</p>
                    <p>FoodMAP 團隊</p>
                </div>
            </body>
            </html>
            """.formatted(resetToken);
    }
} 