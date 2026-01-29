package com.soeun.project_soeun.controller;

import com.soeun.project_soeun.dto.LoginRequest;
import com.soeun.project_soeun.dto.MeResponse;
import com.soeun.project_soeun.dto.SignupRequest;
import com.soeun.project_soeun.service.AuthService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<Void> signup(@Valid @RequestBody SignupRequest req) {
        authService.signup(req);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<MeResponse> login(@Valid @RequestBody LoginRequest req, HttpSession session) {
        MeResponse me = authService.login(req, session);
        return ResponseEntity.ok(me);
    }


    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpSession session) {
        authService.logout(session);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/check-email")
    public ResponseEntity<CheckEmailResponse> checkEmail(@RequestParam String email) {
        boolean duplicated = authService.isEmailDuplicated(email);
        return ResponseEntity.ok(new CheckEmailResponse(duplicated));
    }

    public record CheckEmailResponse(boolean duplicated) {}

}

