package com.soeun.project_soeun.repository;

import com.soeun.project_soeun.domain.user.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {
    Optional<EmailVerification> findByToken(String token);
    boolean existsByUser_IdAndVerifiedAtIsNull(Long userId);

    @Modifying
    @Query("update EmailVerification e set e.expiresAt = :now where e.user.id = :userId and e.verifiedAt is null")
    int expireAllPendingByUserId(@Param("userId") Long userId, @Param("now") Instant now);

}
