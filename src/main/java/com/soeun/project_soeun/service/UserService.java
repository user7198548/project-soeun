package com.soeun.project_soeun.service;

import com.soeun.project_soeun.domain.user.User;
import com.soeun.project_soeun.dto.UserListItemResponse;
import com.soeun.project_soeun.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import org.springframework.data.jpa.domain.Specification;

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

}
