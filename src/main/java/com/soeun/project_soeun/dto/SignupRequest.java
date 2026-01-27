package com.soeun.project_soeun.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SignupRequest {

    @Email
    @NotBlank
    public String email;

    @NotBlank
    @Size(min = 8, max = 64)
    public String password;

    @NotBlank
    public String name;
}
