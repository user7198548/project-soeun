package com.soeun.project_soeun.service;

import com.soeun.project_soeun.domain.user.EmailVerification;
import com.soeun.project_soeun.domain.user.User;
import com.soeun.project_soeun.domain.user.UserStatus;
import com.soeun.project_soeun.dto.*;
import com.soeun.project_soeun.repository.EmailVerificationRepository;
import com.soeun.project_soeun.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    public static final String SESSION_USER_ID = "userId";

    @Value("${app.base-url}")
    private String baseUrl;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailVerificationRepository emailVerificationRepository;
    private final MailService mailService;

    public void signup(SignupRequest req) {

        boolean isFirstUser = userRepository.count() == 0;
        String role = isFirstUser ? "ADMIN" : "USER";

        if (userRepository.existsByEmail((req.email))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 가입된 이메일입니다.");
        }

        String hashed = passwordEncoder.encode((req.password));

        User user = User.create(req.email, hashed, req.name, role);
        user.setStatus(UserStatus.PENDING);
        userRepository.save(user);

        String token = UUID.randomUUID().toString();

        EmailVerification ev = EmailVerification.create(
                user,
                token,
                Instant.now().plus(Duration.ofHours(24))
        );
        emailVerificationRepository.save(ev);

        String verifyLink = baseUrl + "/verify?token=" + token;

        log.info("SIGNUP: created user={}, email={}", user.getId(), user.getEmail());
        log.info("SIGNUP: about to send verification mail. link={}", verifyLink);

        mailService.sendVerificationEmail(user.getEmail(), verifyLink);
        log.info("SIGNUP: verification mail sent.");

    }

    public MeResponse login(LoginRequest req, HttpSession session) {
        // email이 일치하지 않을 때
        User user = userRepository.findByEmail(req.email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                        "이메일 또는 비밀번호가 일치하지 않습니다."));

        //비밀번호가 일치하지 않을 때
        if(!passwordEncoder.matches(req.password, user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "이메일 또는 비밀번호가 일치하지 않습니다.");
        }

        //비활성화 된 계정
        if(!user.isActive()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "비활성화 된 계정입니다.");
        }

        if (user.getStatus() == UserStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "이메일 인증이 필요합니다.");
        }


        session.setAttribute(SESSION_USER_ID, user.getId());
        //admin 체크
        session.setAttribute("role", user.getRole());
        return new MeResponse(user.getId(), user.getEmail(), user.getName(), user.getRole());
    }

    public void logout(HttpSession session) {
        session.invalidate();
    }

    @Transactional(readOnly = true)
    public MeResponse me(HttpSession session) {
        Object userIdObj = session.getAttribute(SESSION_USER_ID);
        if(userIdObj == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }

        Long userId = (Long) userIdObj;

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                        "세션이 유효하지 않습니다."));

        return new MeResponse(user.getId(), user.getEmail(), user.getName(), user.getRole());
    }

    public boolean isEmailDuplicated(String email) {
        return userRepository.existsByEmail(email);
    }

    @Transactional
    public VerifyResponse verifyEmail(String token) {
        EmailVerification ev = emailVerificationRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "유효하지 않은 토큰입니다."));

        if (ev.isVerified()) {
            return new VerifyResponse("이미 인증 완료되었습니다.");
        }
        if (ev.isExpired()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "인증 링크가 만료되었습니다.");
        }

        ev.setVerifiedAt(Instant.now());

        User user = ev.getUser();
        user.setStatus(UserStatus.ACTIVE);

        return new VerifyResponse("이메일 인증이 완료되었습니다.");
    }

    public ResendResponse resendVerification(ResendRequest req) {
//        User user = userRepository.findByEmail(req.email())
//                .orElseThrow(() -> new ResponseStatusException(HttpStatus.OK, "전송 처리 완료"));
        User user = userRepository.findByEmail(req.email()).orElse(null);
        if (user == null) return new ResendResponse("전송 처리 완료"); // 존재 숨김

        if (    user.getStatus() == UserStatus.ACTIVE) {
            return new ResendResponse("이미 인증이 완료된 계정입니다.");
        }

        // 여기서 "기존 pending 토큰 만료 처리" 호출
        emailVerificationRepository.expireAllPendingByUserId(user.getId(), Instant.now());

        String token = UUID.randomUUID().toString();
        Instant expiresAt = Instant.now().plus(Duration.ofHours(24));

        EmailVerification ev = EmailVerification.create(user, token, expiresAt);
        emailVerificationRepository.save(ev);

        String verifyLink = baseUrl + "/verify?token=" + token;
        mailService.sendVerificationEmail(user.getEmail(), verifyLink);

        return new ResendResponse("인증 메일을 전송했습니다. 메일함을 확인해주세요.");
    }

}
