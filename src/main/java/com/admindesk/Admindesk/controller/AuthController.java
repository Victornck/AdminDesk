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
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Email ou senha incorretos.");
        }
        String token = jwtUtil.gerarToken(request.getEmail());
        return ResponseEntity.ok(token);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> listar() {
        return ResponseEntity.ok(userService.listarTodos());
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deletar(@PathVariable Long id) {
        userService.deletar(id);
        return ResponseEntity.ok("Usuário deletado!");
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<User> atualizar(@PathVariable Long id, @RequestBody User user) {
        return ResponseEntity.ok(userService.atualizar(id, user));
    }
}
