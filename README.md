# 테스트 과제 – 사용자 관리 시스템

Spring Boot + React 기반 **세션 인증(User Management) 시스템 구현 과제**

---

## 📌 과제 목적

본 과제는 다음 역량을 검증하기 위한 테스트 과제이다.

> 프로젝트 환경에서  
> **혼자서 기능을 끝까지 구현하고,  
> 문서화 · 테스트 · 에러 처리까지 기본 품질을 맞출 수 있는지** 확인

---


## 🛠 기술 스택

### Backend
- Java 21
- Spring Boot 3.5.10
- Spring Data JPA
- PostgreSQL
- Flyway (DB Migration)
- Lombok
- Gradle
- `spring-security-crypto`  
 

### Frontend
- React
- Vite
- Fetch API

---

## 🧩 인증 및 권한 설계

### 인증 방식
- **서버 세션(HttpSession) 기반 인증**
- JWT 미사용
- 로그인 성공 시:
  - 세션에 `userId`, `role` 저장
- 로그아웃 시:
  - `session.invalidate()`

### 권한 구조
- `USER`
  - 본인 정보 조회/수정 가능
- `ADMIN`
  - 전체 사용자 조회
  - 사용자 정보 수정
  - 사용자 비활성화 가능

---

## ✨ 구현 기능 요약

### A. 공통 (필수)
- 레이아웃: **사이드바 + 콘텐츠 영역**
- UX 필수 요소
  - 실패 알림 (Alert/Toast)
  - 폼 유효성 메시지 (필드별)
  - 모달 UX
    - ESC 닫기 또는 바깥 클릭 닫기 중 1개 이상 구현
- 서버 실행:
  - 로컬 환경에서 재현 가능
- Git 기반 형상 관리
  - 기능 단위 커밋

---

### B. 회원가입 (Sign Up)
- 필수 입력값
  - email
  - password
  - name
- 이메일 중복 불가
- 비밀번호 정책
  - 8자 이상
  - 영문 + 숫자 포함
- 서버/클라이언트 이중 검증

---

### C. 로그인 (Login)
- ID / PW 기반 로그인
- 서버 세션 생성
- 로그아웃 기능 포함
- 실패 케이스 처리
  - 존재하지 않는 계정
  - 비밀번호 불일치
  - 비활성화된 계정

---

### D. 사용자 관리 (User Management)

#### 사용자 목록
- 페이지네이션 필수
- 검색 조건
  - email (부분 일치)
  - name (부분 일치)
  - role (선택)
  - createdAt 기간 검색

#### 사용자 상세
- 단건 조회 모달/팝업
- 수정 모달/팝업
  - 수정 가능 / 불가능 필드 구분

#### 비활성화
- 삭제 대신 **Soft Delete**
  - `isActive = false`
- 비활성화된 사용자는 로그인 불가

---
