package com.soeun.project_soeun.dto;

public class MeResponse {

    public Long id;
    public String email;
    public String name;
    public String role;

    public MeResponse(Long id, String email, String name, String role) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.role = role;
    }
}
