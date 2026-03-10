package com.admindesk.Admindesk.controller;

import com.admindesk.Admindesk.dto.LoginRequest;
import com.admindesk.Admindesk.entity.User;
import com.admindesk.Admindesk.security.JwtUtil;
import com.admindesk.Admindesk.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private AuthenticationManager authManager;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody @Valid User user) {
        userService.registrar(user);
        return ResponseEntity.ok("Usuário criado com sucesso!");
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest request) {
        // Tenta autenticar — lança exceção se senha/email errado
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        String token = jwtUtil.gerarToken(request.getEmail());
        return ResponseEntity.ok(token);
    }
}
