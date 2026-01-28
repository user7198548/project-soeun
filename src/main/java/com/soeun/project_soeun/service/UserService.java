package com.soeun.project_soeun.service;

import com.soeun.project_soeun.domain.user.User;
import com.soeun.project_soeun.dto.UpdateActiveRequest;
import com.soeun.project_soeun.dto.UpdateUserRequest;
import com.soeun.project_soeun.dto.UserDetailResponse;
import com.soeun.project_soeun.dto.UserListItemResponse;
import com.soeun.project_soeun.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

import static com.soeun.project_soeun.repository.UserSpecifications.*;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public Page<UserListItemResponse> list(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(this::toListItem);
    }

    private UserListItemResponse toListItem(User u) {
        return new UserListItemResponse(
                u.getId(),
                u.getEmail(),
                u.getName(),
                u.getRole(),
                u.isActive(),
                u.getCreatedAt()
        );
    }

    public Page<UserListItemResponse> search(
            String email,
            String name,
            String role,
            LocalDate from,
            LocalDate to,
            Pageable pageable
    ) {
        Specification<User> spec = Specification.allOf(
                emailContains(email),
                nameContains(name),
                roleEquals(role),
                createdAtBetween(from, to)
        );

        return userRepository.findAll(spec, pageable)
                .map(this::toListItem);
    }

    public UserDetailResponse getById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        return new UserDetailResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole(),
                user.isActive(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    @Transactional
    public UserDetailResponse updateActive(Long id, UpdateActiveRequest req) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        user.setActive(req.isActive());

        userRepository.save(user);

        return toDetailResponse(user);
    }

    @Transactional
    public UserDetailResponse updateUser(Long id, UpdateUserRequest req) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        user.setName(req.getName());
        userRepository.save(user);

        return toDetailResponse(user);
    }

    private UserDetailResponse toDetailResponse(User user) {
        return new UserDetailResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                (user.getRole() != null ? user.getRole() : null),
                user.isActive(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
