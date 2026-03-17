package com.admindesk.Admindesk.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class UserRegisterDTO {

    @NotBlank
    private String nome;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    @Size(min = 8, message = "Senha deve ter no mínimo 8 caracteres")
    private String password;

}