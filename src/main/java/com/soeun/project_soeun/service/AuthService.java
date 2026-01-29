package com.soeun.project_soeun.service;

import com.soeun.project_soeun.domain.user.User;
import com.soeun.project_soeun.dto.LoginRequest;
import com.soeun.project_soeun.dto.MeResponse;
import com.soeun.project_soeun.dto.SignupRequest;
import com.soeun.project_soeun.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    public static final String SESSION_USER_ID = "userId";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public void signup(SignupRequest req) {

        boolean isFirstUser = userRepository.count() == 0;
        String role = isFirstUser ? "ADMIN" : "USER";

        if (userRepository.existsByEmail((req.email))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 가입된 이메일입니다.");
        }

        String hashed = passwordEncoder.encode((req.password));

        User user = User.create(req.email, hashed, req.name, role);

        userRepository.save(user);
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


}
