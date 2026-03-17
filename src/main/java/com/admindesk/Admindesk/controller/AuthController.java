package com.admindesk.Admindesk.controller;

import com.admindesk.Admindesk.dto.LoginRequest;
import com.admindesk.Admindesk.dto.UserRegisterDTO;
import com.admindesk.Admindesk.dto.UserResponseDTO;
import com.admindesk.Admindesk.dto.UserUpdateDTO;
import com.admindesk.Admindesk.entity.User;
import com.admindesk.Admindesk.repository.UserRepository;
import com.admindesk.Admindesk.security.JwtUtil;
import com.admindesk.Admindesk.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired private UserService userService;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private AuthenticationManager authManager;
    @Autowired private UserRepository userRepository;

    // Rate limiting em memória: IP → tentativas e timestamp
    private final Map<String, int[]> loginAttempts = new ConcurrentHashMap<>();
    private static final int MAX_ATTEMPTS = 5;
    private static final long WINDOW_MS = 60_000; // 1 minuto

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request,
                                   HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        int[] attempts = loginAttempts.getOrDefault(ip, new int[]{0, 0});

        // Reseta contador se janela de 1 minuto passou
        if (Instant.now().toEpochMilli() - attempts[1] > WINDOW_MS) {
            attempts[0] = 0;
            attempts[1] = (int) Instant.now().toEpochMilli();
        }

        if (attempts[0] >= MAX_ATTEMPTS) {
            return ResponseEntity.status(429).body("Muitas tentativas. Aguarde 1 minuto.");
        }

        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (Exception e) {
            attempts[0]++;
            attempts[1] = (int) Instant.now().toEpochMilli();
            loginAttempts.put(ip, attempts);
            return ResponseEntity.status(401).body("Email ou senha incorretos.");
        }

        // Login bem-sucedido — reseta tentativas
        loginAttempts.remove(ip);

        // Busca role real do banco para embutir no token
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        String token = jwtUtil.gerarToken(user.getEmail(), user.getRole());
        return ResponseEntity.ok(token);
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody @Valid UserRegisterDTO dto) {
        userService.registrar(dto);
        return ResponseEntity.ok("Usuário criado com sucesso!");
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponseDTO>> listar() {
        return ResponseEntity.ok(userService.listarTodos());
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deletar(@PathVariable Long id) {
        userService.deletar(id);
        return ResponseEntity.ok("Usuário deletado!");
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDTO> atualizar(@PathVariable Long id,
                                                     @RequestBody @Valid UserUpdateDTO user) {
        return ResponseEntity.ok(userService.atualizar(id, user));
    }
}