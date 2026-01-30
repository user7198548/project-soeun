package com.soeun.project_soeun.domain.user;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.*;
import java.time.Instant;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter @Setter
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
@Entity
@Table(name = "email_verifications")
public class EmailVerification {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="user_id", nullable=false)
    private User user;

    @Column(nullable=false, unique=true)
    private String token;

    @Column(name="expires_at", nullable=false)
    private Instant expiresAt;

    @Column(name="verified_at")
    private Instant verifiedAt;

    public boolean isVerified() { return verifiedAt != null; }
    public boolean isExpired() { return expiresAt.isBefore(Instant.now()); }

    public static EmailVerification create(User user, String token, Instant expiresAt) {
        EmailVerification ev = new EmailVerification();
        ev.user = user;
        ev.token = token;
        ev.expiresAt = expiresAt;
        return ev;
    }


}
