package com.admindesk.Admindesk.service;

import com.admindesk.Admindesk.dto.UserRegisterDTO;
import com.admindesk.Admindesk.dto.UserResponseDTO;
import com.admindesk.Admindesk.dto.UserUpdateDTO;
import com.admindesk.Admindesk.entity.User;
import com.admindesk.Admindesk.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Registro via DTO — cliente nunca define a role
    public UserResponseDTO registrar(UserRegisterDTO dto) {
        User user = new User();
        user.setNome(dto.getNome());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole("ROLE_USER"); // role sempre definida pelo servidor
        User saved = userRepository.save(user);
        return toDTO(saved);
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .authorities(user.getRole()) // carrega a role real do banco
                .build();
    }

    public List<UserResponseDTO> listarTodos() {
        return userRepository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public void deletar(Long id) {
        userRepository.deleteById(id);
    }

    public UserResponseDTO atualizar(Long id, UserUpdateDTO dto) {
        User existing = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        existing.setNome(dto.getNome());
        existing.setEmail(dto.getEmail());

        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            existing.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        return toDTO(userRepository.save(existing));
    }

    // Nunca retorna a entidade direta — usa DTO sem senha
    private UserResponseDTO toDTO(User user) {
        return new UserResponseDTO(user.getId(), user.getNome(), user.getEmail(), user.getRole());
    }
}