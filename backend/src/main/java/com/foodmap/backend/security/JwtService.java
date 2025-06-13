package com.foodmap.backend.security;

import com.foodmap.backend.model.User;
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
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    // 生成 JWT Token
    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", user.getId());
        claims.put("email", user.getEmail());
        return createToken(claims, user.getEmail());
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
    public boolean validateToken(String token, String userEmail) {
        final String email = extractEmail(token);
        return (email.equals(userEmail) && !isTokenExpired(token));
    }

    // 從 Token 提取使用者 Email
    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
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