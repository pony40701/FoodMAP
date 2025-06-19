package com.example.demo.security;

import com.example.demo.entity.MerchantAccount;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class MerchantJwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    // 生成商家 JWT Token
    public String generateToken(MerchantAccount merchant) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", merchant.getId());
        claims.put("email", merchant.getEmail());
        claims.put("restaurant_id", merchant.getRestaurant() != null ? merchant.getRestaurant().getId() : null);
        claims.put("type", "merchant");
        return createToken(claims, merchant.getEmail());
    }

    // 建立 Token
    private String createToken(Map<String, Object> claims, String subject) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        Key key = Keys.hmacShaKeyFor(secret.getBytes());

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // 驗證 Token
    public boolean validateToken(String token, String merchantEmail) {
        final String email = extractEmail(token);
        return (email.equals(merchantEmail) && !isTokenExpired(token) && isMerchantToken(token));
    }

    // 從 Token 提取商家 Email
    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // 從 Token 提取商家 ID
    public Integer extractMerchantId(String token) {
        return extractClaim(token, claims -> claims.get("id", Integer.class));
    }

    // 從 Token 提取餐廳 ID
    public Integer extractRestaurantId(String token) {
        return extractClaim(token, claims -> claims.get("restaurant_id", Integer.class));
    }

    // 檢查是否為商家 Token
    public boolean isMerchantToken(String token) {
        return "merchant".equals(extractClaim(token, claims -> claims.get("type", String.class)));
    }

    // 從 Token 提取過期時間
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // 提取指定資訊
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // 提取所有資訊
    private Claims extractAllClaims(String token) {
        Key key = Keys.hmacShaKeyFor(secret.getBytes());
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // 檢查 Token 是否過期
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
} 