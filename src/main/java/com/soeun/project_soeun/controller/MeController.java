package com.soeun.project_soeun.controller;

import com.soeun.project_soeun.dto.MeResponse;
import com.soeun.project_soeun.service.AuthService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MeController {

    private final AuthService authService;

    @GetMapping("/me")
    public MeResponse me(HttpSession session) {
        return authService.me(session);
    }
}
