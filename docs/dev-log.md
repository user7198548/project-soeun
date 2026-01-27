# Dev Log (개발 진행 기록)

> 테스트 과제 진행 과정을 날짜별로 기록한다.  
> 각 날짜별로 목표, 수행 작업, 결정 이유, 이슈 및 해결을 정리한다.

---

## 2026-01-23 (금) — 프로젝트 환경 점검 및 인증 방식 방향 결정

### 작업 배경
- 테스트 과제 요구사항 분석
- 인증/회원 관리 기능 구현을 위한 기술 선택 및 범위 확정

---

### 진행한 작업

#### 1) 과제 요구사항 분석
- 회원가입 / 로그인 / 사용자 관리 기능 요구사항 확인
- 세션 기반 인증 필수 조건 확인
- 관리자(ADMIN) / 일반 사용자(USER) 권한 분리 필요성 파악
- 프론트엔드 UX 요구사항(Toast, 모달, 폼 유효성) 확인

---

#### 2) 인증 방식 결정
- **서버 세션(HttpSession) 기반 로그인**으로 방향 결정

**결정 이유**
- 과제 목적이 “인증의 기본 원리 이해”에 있음
- 세션 기반 인증이 서버 인증 흐름 이해에 더 적합하다고 판단

---

#### 3) 기술 스택 초안 확정
- Backend
  - Spring Boot 3.5.10 (Java 21)
  - Spring Data JPA
  - PostgreSQL
  - Flyway
- Frontend
  - React (Vite)

---

### 정리
- 과제 범위 및 방향성 확정
- “기능 완성 + 문서화”를 동시에 진행하기로 결정
- 이후 구현 순서를 다음과 같이 계획:
  1. 프로젝트 구조 정리
  2. User 엔티티 + DB 마이그레이션
  3. 인증 서비스(AuthService)
  4. 컨트롤러/API
  5. 프론트 연동

---

## 2026-01-26 (월) — 프로젝트 구조 정리 및 DB/엔티티 설계

### 오늘 목표
- Spring Boot 프로젝트 구조 안정화
- DB 마이그레이션 및 User 엔티티 설계 완료

---

### 진행한 작업

#### 1) 패키지 구조 정리

**정리된 패키지 구조**
com.soeun.project_soeun
├─ controller
├─ service
├─ repository
├─ domain
├─ dto
└─ config


**결정 이유**
- 스프링 컴포넌트 스캔 누락으로 인한 API 미동작 방지
- 계층별 책임 분리를 명확히 하기 위함

---

#### 2) Flyway 마이그레이션 적용
- `db/migration` 디렉터리 구성
- V1 마이그레이션으로 `users` 테이블 생성

**테이블 설계**
- email: unique + not null
- password_hash: not null
- role: USER / ADMIN 
- is_active: soft delete 
- created_at / updated_at

---

#### 3) User 엔티티 설계
- JPA 엔티티 생성 (`User.java`)
- `@Entity`, `@Table`, `@Column` 등 기본 매핑 설정
- `@PrePersist`, `@PreUpdate`로 시간 자동 관리

---

#### 4) Lombok 적용
- `@Getter`, `@Setter`
- `@NoArgsConstructor(access = AccessLevel.PROTECTED)` 적용

**결정 이유**
- JPA의 기본 생성자 요구사항 충족
- 임의의 `new User()` 생성을 방지하여 도메인 무결성 유지

---

### 정리
- DB와 엔티티 구조가 안정적으로 정리됨
- 이후 Repository/Service 구현을 바로 시작할 수 있는 상태 확보

---

## 2026-01-27 (화) — 인증 뼈대 구현 준비 및 Repository/보안 설정

### 오늘 목표
- 인증 기능 구현을 위한 기반 작업
- Repository, 보안 의존성, 서비스 설계 이해

---

### 진행한 작업

#### 1) Spring Data JPA Repository 이해 및 구현
- `UserRepository` 생성
- `JpaRepository<User, Long>` 상속

### 정리

#### 1) Repository 동작 방식 이해
- `JpaRepository`를 상속한 Repository 인터페이스는
  - 스프링이 애플리케이션 실행 시점에
  - 런타임 프록시 기반 구현체를 자동 생성하여 주입함
- 이를 통해 기본 CRUD(`save`, `findById`, `findAll` 등)를
  별도의 구현 없이 사용할 수 있음을 확인함

---

#### 2) 비밀번호 처리 방식 결정
- Spring Security 전체 기능은 사용하지 않기로 결정
- `spring-security-crypto` 모듈만 사용하여
  - `BCryptPasswordEncoder` 기반 비밀번호 해시 처리 적용

**결정 이유**
- 과제 요구사항에 불필요한 보안 설정 및 복잡도 최소화
- 인증 로직의 핵심 요소인
  - “비밀번호 해시 저장 및 검증”에만 집중하기 위함

---

#### 3) Gradle 의존성 추가 및 이슈 해결
- `spring-security-crypto` 의존성 추가 후,
  다음 오류 발생:



