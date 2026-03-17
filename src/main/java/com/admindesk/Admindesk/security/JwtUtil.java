package com.admindesk.Admindesk.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    private Key getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    // Gera token com email e role embutidos
    public String gerarToken(String email, String role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role) // role dentro do token
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 3600000)) // 1h — mais seguro que 24h
                .signWith(getKey())
                .compact();
    }

    public String extrairEmail(String token) {
        return getClaims(token).getSubject();
    }

    // Lê a role diretamente do token — sem bater no banco
    public String extrairRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    public boolean tokenValido(String token) {
        try {
            return !getClaims(token).getExpiration().before(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}