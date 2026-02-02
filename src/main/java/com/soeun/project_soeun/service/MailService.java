package com.soeun.project_soeun.service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class MailService {
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailUser;

    @PostConstruct
    void check() {
        log.info("MAIL CONFIG username={}", mailUser);
    }


    public void sendVerificationEmail(String to, String verifyLink) {
        SimpleMailMessage message = new SimpleMailMessage();

        try {
            message.setTo(to);
            message.setSubject("[project-soeun] 이메일 인증을 완료해주세요");
            message.setText("""
                    안녕하세요.
                    아래 링크를 클릭하여 이메일 인증을 완료해주세요.
                    
                    %s
                    
                    감사합니다.
                    """.formatted(verifyLink));

            mailSender.send(message);
        } catch (Exception e) {
            log.error("MAIL SEND FAILED to={}, link={}", to, verifyLink, e);
            throw e;
        }
     }
}
