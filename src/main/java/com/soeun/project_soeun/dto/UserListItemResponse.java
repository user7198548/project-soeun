package com.soeun.project_soeun.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class UserListItemResponse {
    private Long id;
    private String email;
    private String name;
    private String role;
    private boolean isActive;
    private LocalDateTime createdAt;
}
