package com.soeun.project_soeun.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class SignupRequest {

    @Email
    @NotBlank
    public String email;

    @NotBlank
    @Pattern(
            regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$",
            message = "비밀번호는 8자 이상이며 영문과 숫자를 포함해야 합니다."
    )
    @Size(min = 8, max = 64)
    public String password;

    @NotBlank
    public String name;
}
