package com.soeun.project_soeun.controller;

import com.soeun.project_soeun.dto.UserDetailResponse;
import com.soeun.project_soeun.dto.UserListItemResponse;
import com.soeun.project_soeun.service.UserService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @GetMapping
    public Page<UserListItemResponse> list(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            Pageable pageable, HttpSession session) {
        requireAdmin(session);
        return userService.search(email, name, role, from, to, pageable);
    }

    private void requireAdmin(HttpSession session) {
        Object roleObj = session.getAttribute("role");
        if (roleObj == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        if (!"ADMIN".equals(String.valueOf(roleObj))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "관리자만 접근 가능합니다.");
        }
    }

    @GetMapping("/{id}")
    public UserDetailResponse get(@PathVariable Long id, HttpSession session) {
        requireLogin(session);
        requireAdminOrSelf(session, id);
        return userService.getById(id);
    }

    private void requireLogin(HttpSession session) {
        if (session.getAttribute("userId") == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
    }

    private void requireAdminOrSelf(HttpSession session, Long targetUserId) {
        String role = String.valueOf(session.getAttribute("role"));
        Long sessionUserId = (Long) session.getAttribute("userId");

        if ("ADMIN".equals(role)) return;

        if (sessionUserId == null || !sessionUserId.equals(targetUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인 정보만 조회할 수 있습니다.");
        }
    }

}
