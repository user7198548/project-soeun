package com.soeun.project_soeun.controller;

import com.soeun.project_soeun.dto.UpdateActiveRequest;
import com.soeun.project_soeun.dto.UpdateUserRequest;
import com.soeun.project_soeun.dto.UserDetailResponse;
import com.soeun.project_soeun.dto.UserListItemResponse;
import com.soeun.project_soeun.service.UserService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    // =============================
    // APIs
    // =============================

    @GetMapping
    public Page<UserListItemResponse> list(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @PageableDefault(
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            ) Pageable pageable,
            HttpSession session
    ) {
        log.info("[AUDIT] action=USER_LIST actorId={} role={} page={}", actorId(session), actorRole(session), pageable);

        requireAdmin(session);
        return userService.search(email, name, role, from, to, pageable);
    }

    @GetMapping("/{id}")
    public UserDetailResponse get(@PathVariable Long id, HttpSession session) {
        log.info("[AUDIT] action=USER_GET actorId={} role={} targetId={}", actorId(session), actorRole(session), id);

        requireLogin(session);
        requireAdminOrSelf(session, id);
        return userService.getById(id);
    }

    @PatchMapping("/{id}/active")
    public UserDetailResponse updateActive(
            @PathVariable Long id,
            @RequestBody UpdateActiveRequest req,
            HttpSession session
    ) {
        log.info("[AUDIT] action=USER_ACTIVE_SET actorId={} role={} targetId={} active={}",
                actorId(session), actorRole(session), id, req.isActive());

        requireAdmin(session);

        UserDetailResponse res = userService.updateActive(id, req);

        log.info("[AUDIT] action=USER_ACTIVE_SET_OK actorId={} targetId={} active={}", actorId(session), id, res.isActive());
        return res;
    }

    @PatchMapping("/{id}")
    public UserDetailResponse updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest req,
            HttpSession session
    ) {
        log.info("[AUDIT] action=USER_UPDATE actorId={} role={} targetId={}", actorId(session), actorRole(session), id);

        requireLogin(session);
        requireAdminOrSelf(session, id);

        UserDetailResponse res = userService.updateUser(id, req);

        log.info("[AUDIT] action=USER_UPDATE_OK actorId={} targetId={}", actorId(session), id);
        return res;
    }

    // =============================
    // helpers: actor info
    // =============================

    private Long actorId(HttpSession session) {
        Object v = session.getAttribute("userId");
        return (v instanceof Long) ? (Long) v : null;
    }

    private String actorRole(HttpSession session) {
        Object v = session.getAttribute("role");
        return String.valueOf(v); // null이면 "null"이지만, 로그/권한 체크에서 충분히 판단 가능
    }

    // =============================
    // helpers: auth checks (권한 실패는 WARN)
    // =============================

    private void requireLogin(HttpSession session) {
        if (actorId(session) == null) {
            log.warn("[AUDIT] action=AUTH_FAIL reason=UNAUTHORIZED (no session userId)");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
    }

    private void requireAdmin(HttpSession session) {
        Object roleObj = session.getAttribute("role");
        if (roleObj == null) {
            log.warn("[AUDIT] action=AUTH_FAIL reason=UNAUTHORIZED (no session role)");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        if (!"ADMIN".equals(String.valueOf(roleObj))) {
            log.warn("[AUDIT] action=AUTH_FAIL reason=FORBIDDEN (not admin) userId={} role={}",
                    actorId(session), roleObj);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "관리자만 접근 가능합니다.");
        }
    }

    private void requireAdminOrSelf(HttpSession session, Long targetUserId) {
        String role = actorRole(session);
        Long sessionUserId = actorId(session);

        if ("ADMIN".equals(role)) return;

        if (sessionUserId == null || !sessionUserId.equals(targetUserId)) {
            log.warn("[AUDIT] action=AUTH_FAIL reason=FORBIDDEN (not self) userId={} targetId={}",
                    sessionUserId, targetUserId);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인 정보만 조회할 수 있습니다.");
        }
    }
}
