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
```
com.soeun.project_soeun
├─ controller
├─ service
├─ repository
├─ domain
├─ dto
└─ config
```

**결정 이유**
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

---

### 정리
- DB와 엔티티 구조가 안정적으로 정리됨
- 이후 Repository/Service 구현을 바로 시작할 수 있는 상태 확보

---

## 2026-01-27 (화) — 인증 뼈대 구현 준비 및 Repository/보안 설정

### 오늘 목표
- 인증 기능 구현을 위한 기반 작업
- Repository, 보안 의존성, 서비스 설계 이해
- 사용자 관리(User Management) 조회 API 구현 시작

---

### 진행한 작업

#### 1) Spring Data JPA Repository 이해 및 구현
- `UserRepository` 생성
- `JpaRepository<User, Long>` 상속

#### 2) 회원가입(Sign up) / 로그인(Login) API 구현
- 회원가입 API (`POST /api/auth/signup`) 구현  
- 로그인 API (`POST /api/auth/login`) 구현  
  - 이메일/비밀번호 검증
  - 로그인 성공 시 HttpSession에 userId, role 저장  
- 로그아웃 API (`POST /api/auth/logout`) 구현  
  - session.invalidate()를 통해 세션 무효화  
- 내 정보 조회 API (`GET /api/me`) 구현  
  - 세션에 userId가 없을 경우 401 반환
  - 로그인 상태일 경우 사용자 기본 정보 반환

#### 3) 관리자(ADMIN) / 일반 사용자(USER) 역할 개념 도입
- User 엔티티에 role 컬럼 존재 확인  
- 개발 단계에서 관리자 계정 테스트를 위해  
  - DBeaver에서 특정 계정의 role을 ADMIN으로 직접 수정  
- 로그인 시 세션에 role 값을 함께 저장하여  
  이후 API 접근 제어에 활용하도록 설계  

#### 4) 사용자 목록 조회 API (관리자 전용) 구현
- `GET /api/users` 엔드포인트 구현  
- 관리자(ADMIN)만 접근 가능하도록 권한 체크 로직 추가  
- Pageable을 이용한 페이지네이션 적용  
  - page, size 파라미터 기반 조회 가능  
- User 엔티티를 그대로 반환하지 않고  
  UserListItemResponse DTO로 변환하여 응답하도록 설계  

#### 5) 사용자 목록 검색 조건 확장
- 검색 조건을 optional query parameter로 설계  
  - email (부분 일치)
  - name (부분 일치)
  - role (ADMIN / USER)
  - createdAt 기간(from ~ to)  
- JpaSpecificationExecutor를 이용한 동적 쿼리 구성  
- Specification을 조합하여 검색 조건이 있을 때만 필터가 적용되도록 구현  
- `Specification.allOf()` 방식을 사용하여  
  deprecated API 경고를 회피하고 안정적인 조건 결합 구조로 개선  

#### 6) 회원가입 비밀번호 정책 추가
- 회원가입 요청 DTO(SignupRequest)에 Bean Validation 적용  
- 비밀번호 정책:
  - 8자 이상
  - 영문 + 숫자 포함  
- `@Pattern` 애노테이션을 이용해 DTO 레벨에서 검증 처리  
- 잘못된 비밀번호 입력 시 400 Bad Request 반환 확인

#### 7) Postman을 이용한 API 동작 검증
- Postman을 이용해 회원가입 요청 전송  
  - 실제 DB(users 테이블)에 사용자 데이터가 저장됨을 확인  
- 로그인 요청 시 JSESSIONID 쿠키가 생성되는 것을 확인  
- 로그인 상태에서 `/api/me` 호출 시 200 OK 반환 확인  
- 로그아웃 후 `/api/me` 호출 시 401 Unauthorized 반환 확인  
- 관리자 계정으로 로그인 후 `/api/users` 호출 성공 확인  
- 페이지네이션 응답 구조(content, totalElements, totalPages 등) 확인  
- role, email 등의 검색 조건이 정상적으로 적용되는 것을 확인  

→ 세션 기반 인증 흐름 및 사용자 관리 조회 기능이 정상적으로 동작함을 검증함

---

### 정리
- Postman은 단순 테스트 도구가 아니라 실제 HTTP 요청을 전송하며  
  서버 로직과 DB에 그대로 반영된다는 점을 명확히 이해함  
- 세션 기반 인증 구조에서  
  - 로그인 시 세션 생성
  - 쿠키(JSESSIONID) 기반 상태 유지
  - 로그아웃 시 세션 무효화  
  전체 흐름을 직접 검증하며 이해함  
- 사용자 관리 기능 구현 시  
  엔티티와 응답 DTO를 분리하는 구조의 필요성을 체감함  
- 관리자/일반 사용자 권한 분기를  
  세션 정보(role, userId)를 기준으로 처리하는 구조를 확립함

## 2026-01-28 (수) — 사용자 관리 기능 확장 및 프론트 화면(React) 연동

### 오늘 목표
- 사용자 관리 기능을 “조회만”에서 “수정/상태 변경”까지 확장
- React(Vite)로 화면을 띄우고 백엔드 API와 연동
- 관리자 콘솔 형태로 목록/상세/필터/수정 UI 구성
- 로깅(Log4j2) 환경 정리 및 로그 설계 적용

---

### 진행한 작업

#### 1) 로깅(Log4j2) 도입 및 충돌 해결
- Spring Boot 기본 로깅(Logback)과 Log4j2가 함께 포함되며 충돌 발생
- 개발 단계에서 필요한 로그 레벨을 패키지별로 조절하는 방향(프로젝트 패키지, Spring framework, 트랜잭션 등)으로 설정을 검토함

#### 2) 사용자 관리 API 기능 확장 (상태 변경/수정)
- 사용자 활성/비활성 변경 API 구현 및 검증
- 사용자 정보 수정 API 구현 및 검증
- ADMIN 또는 본인(SELF)만 접근 가능하도록 권한 로직 적용

#### 3) Controller 로깅 정리
- UserController에 @Slf4j 적용 후, 과도한 로그를 줄이고 필요한 정보만 남기는 방향으로 조정
- actor(userId, role) 추출 로직을 중복 없이 관리하는 방식(공통 변수/헬퍼)으로 정리 검토

#### 4) 프론트엔드(React/Vite) 화면 구성 및 API 연동
- API 연동 공통 함수 구성
  - api.ts 생성
  - fetch에 credentials: "include" 적용하여 세션 쿠키(JSESSIONID)가 유지되도록 처리
- 관리자 콘솔 UI 구현
  - 유저 목록 페이지(UsersPage)
    - 검색 필터 UI (email/name/role/date(from~to))
    - 페이지네이션 적용 
    - 사용자 active 토글(활성/비활성) 버튼 연동 
    - 유저 카드 클릭 시 상세 페이지로 이동
  - 유저 상세 페이지(UserDetailPage)
    - 상세 정보 조회
    - active 토글(ADMIN 전용)
    - name 수정 기능(ADMIN 또는 본인만 가능) 추가
- 로그인/회원가입 UX 
  - 로그인 화면에서 회원가입으로 이동 가능한 버튼 추가

#### 5) 개발 도구 및 작업 방식 개선 (피드백 반영)
- 개발 중 참고용 AI 도구 확장을 위해 Gemini CLI를 로컬 개발 환경에 설치
- Git 커밋 전략 개선
  - “작업 단위가 아닌 기능 단위로 커밋을 묶는 것이 더 명확하다”는 점을 인지
  - 프론트엔드 로그인/회원가입/라우팅/유저 관리 UI를 하나의 frontend 기능 단위 커밋으로 묶음
  - 로그 파일, 실행 산출물 등은 커밋 대상에서 제외
---

#### 정리
- 백엔드 사용자 관리 기능을 “조회”에서 “상태 변경/수정”까지 확장하며 관리자 콘솔 기능의 핵심 흐름을 완성함
- 프론트(React)에서 세션 기반 인증을 유지하며 목록/상세/수정/토글 기능까지 연결

---

## 2026-01-29 (목) — 프론트엔드 화면 구성 및 API 호출 구조 리팩토링

### 오늘 목표
- React 기반 프론트엔드 화면 구동
- 사용자 관리 화면(목록/상세) 구현
- 백엔드 API와 연동되는 프론트 호출 구조 정리

---

### 진행한 작업
### 1) 프론트엔드 개발 환경 구성 및 실행
- Vite + React 기반 프론트엔드 프로젝트 구성
- frontend 디렉터리에서 npm install, npm run dev로 개발 서버 정상 구동 확인
- 백엔드(Spring Boot)와 프론트엔드(React)를 완전히 분리된 환경에서 병행 실행

### 2) 로그인 상태 기반 화면 라우팅 구성
- App.tsx에서 전역 로그인 상태(me) 관리
- 로그인 상태에 따라 라우팅 분기 처리
- 상단 헤더에 로그인 사용자 정보(email, role) 표시 및 로그아웃 버튼 추가

### 3) 사용자 목록 화면(UsersPage) 구현
- 관리자(ADMIN) 전용 사용자 목록 페이지 구현기능 구성 
- 사용자 목록 조회 
- 페이지네이션 
- 검색 필터(email / name / role / createdAt 기간(from ~ to))
- 사용자 활성화/비활성화 토글 
- 사용자 카드 클릭 시 상세 페이지(/users/{id})로 이동하도록 라우팅 연결 
- 프론트엔드에서도 role을 기준으로 ADMIN이 아닐 경우 접근 제한 메시지 표시 
- 백엔드 권한 체크와 이중으로 보호되는 구조

### 4) 사용자 상세 화면(UserDetailPage) 구현
- 사용자 상세 정보 조회 (GET /api/users/{id})
- 기본 정보 표시 
- 이름(name) 수정 기능 
- ADMIN 또는 본인만 수정 가능 
- 활성화/비활성화 토글(ADMIN 전용)

### 5) API 호출 및 에러 처리 구조 리팩토링
- 공통 API 호출 훅 useApiCall 도입 
- api.ts에서 에러 응답 파싱 로직 통합 
- 백엔드 ErrorResponse의 message를 그대로 프론트에 전달 
- UsersPage, UserDetailPage에 useApiCall 패턴 적용 완료

---

### 정리 
- 프론트엔드 화면이 실제로 동작하는 단계까지 완성 
- 사용자 관리 기능이 백엔드 API / 프론트 화면 / 권한 처리, 세 영역에서 일관되게 연결됨 
- API 호출/에러 처리 구조를 공통화함으로써 이후 로그인/회원가입, UX 개선 작업을 안정적으로 확장할 수 있는 기반을 마련함

---

