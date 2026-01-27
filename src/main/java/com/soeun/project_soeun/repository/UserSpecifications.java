package com.soeun.project_soeun.repository;

import com.soeun.project_soeun.domain.user.User;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class UserSpecifications {

    public static Specification<User> emailContains(String email) {
        return (root, query, cb) ->
                email == null || email.isBlank()
                        ? null
                        : cb.like(cb.lower(root.get("email")), "%" + email.toLowerCase() + "%");
    }

    public static Specification<User> nameContains(String name) {
        return (root, query, cb) ->
                name == null || name.isBlank()
                        ? null
                        : cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%");
    }

    public static Specification<User> roleEquals(String role) {
        return (root, query, cb) ->
                role == null || role.isBlank()
                        ? null
                        : cb.equal(root.get("role"), role);
    }

    public static Specification<User> createdAtBetween(LocalDate from, LocalDate to) {
        return (root, query, cb) -> {
            if (from == null && to == null) return null;

            LocalDateTime fromDt = (from == null) ? LocalDateTime.MIN : from.atStartOfDay();
            LocalDateTime toDt = (to == null) ? LocalDateTime.MAX : to.plusDays(1).atStartOfDay().minusNanos(1);

            return cb.between(root.get("createdAt"), fromDt, toDt);
        };
    }
}
