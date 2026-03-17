package com.admindesk.Admindesk.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class UserUpdateDTO {

    @NotBlank
    private String nome;

    @Email
    @NotBlank
    private String email;

    private String password; // opcional — só atualiza se vier preenchido

    public String getNome() { return nome; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
}