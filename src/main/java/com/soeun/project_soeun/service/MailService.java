package com.soeun.project_soeun.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {
    private final JavaMailSender mailSender;

    public void sendVerificationEmail(String to, String verifyLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("[project-soeun] 이메일 인증을 완료해주세요");
        message.setText("""
                안녕하세요.
                아래 링크를 클릭하여 이메일 인증을 완료해주세요.

                %s

                감사합니다.
                """.formatted(verifyLink));

        mailSender.send(message);
    }
}
