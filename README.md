# TodoList

Spring Boot + React 기반 할 일 관리 서비스

**배포 URL: http://43.203.215.207:8080**

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | React 19, Vite, Axios, Day.js |
| Backend | Spring Boot 4.1, Spring Data JPA, Spring Security, Spring Validation |
| 인증 | JWT (jjwt 0.12.6), BCrypt 암호화 |
| DB (dev) | H2 (In-Memory) |
| DB (prod) | MySQL |
| 빌드 도구 | Gradle (백엔드), npm (프론트엔드) |
| 배포 | AWS EC2 |

---

## 기능

- **회원가입 / 로그인** — JWT 기반 인증, 본인 할일만 조회·수정·삭제 가능
- Todo **등록 / 조회 / 수정 / 삭제 (CRUD)**
- **완료 처리** 토글 (체크박스)
- **마감 24시간 이내** 항목 구분 표시 (`마감 임박` 배지)
- **카테고리** 분류 (업무 / 개인 / 학습 / 기타)
- 카테고리 / 완료 여부 **필터링** (활성 필터 재클릭 시 전체로 초기화)
- 상세 **모달** (항목 클릭 시 제목·내용·마감일·카테고리 확인, 완료 처리·수정·삭제 가능)
- **목록 보기** — 마감일 기준 날짜 섹션 그룹화 (오늘 / 내일 / 이번 주 / 나중에 / 날짜 없음 / 기한 지남), 무한스크롤 (20개씩 자동 로드)
- **달력 보기** — 월별 캘린더, 날짜 클릭 시 해당 할일 목록 표시 및 해당 날짜로 할일 바로 추가, 진행 중인 할일을 카테고리별 색상 바(형광펜 스타일)로 표시 (최대 3개, 초과 시 +N 표기)
- **상단 고정** — 중요 항목 📌 고정 토글, 고정된 항목은 목록 최상단 "고정됨" 섹션에 별도 표시
- **다크모드** — 헤더 토글 버튼으로 라이트/다크 전환, 설정은 localStorage에 저장되어 새로고침 후에도 유지
- **로고 클릭 홈 이동** — 헤더 로고 클릭 시 필터·검색어 초기화 및 목록 보기 최상단으로 이동
- **환경 분리** — dev(H2) / prod(MySQL), CORS, API Base URL

---

## ERD

```
┌─────────────────────────────────────────┐
│                  users                  │
├──────────────┬──────────────────────────┤
│ id           │ BIGINT (PK, AUTO_INCREMENT│
│ username     │ VARCHAR(20) UNIQUE NOT NULL│
│ password     │ VARCHAR(255) NOT NULL     │
│ created_at   │ DATETIME (자동)           │
└──────────────┴──────────────────────────┘
                      │ 1
                      │
                      │ N
┌──────────────────────────────────────────┐
│                   todos                  │
├──────────────┬───────────────────────────┤
│ id           │ BIGINT (PK, AUTO_INCREMENT)│
│ user_id      │ BIGINT (FK → users.id)    │
│ title        │ VARCHAR(255) NOT NULL      │
│ content      │ TEXT                       │
│ deadline     │ DATETIME                   │
│ completed    │ BOOLEAN DEFAULT false      │
│ category     │ VARCHAR (WORK/PERSONAL/    │
│              │          STUDY/OTHER)      │
│ pinned       │ BOOLEAN DEFAULT false      │
│ created_at   │ DATETIME (자동)            │
│ updated_at   │ DATETIME (자동)            │
└──────────────┴───────────────────────────┘
```

---

## REST API 설계

### Base URL
- 개발: `http://localhost:8080/api`
- 운영: `http://43.203.215.207:8080/api`

### 인증

인증이 필요한 API는 요청 헤더에 JWT 토큰을 포함해야 합니다.
```
Authorization: Bearer {token}
```

#### 회원가입
```
POST /auth/signup
Content-Type: application/json
```
**Request Body**
```json
{ "username": "홍길동", "password": "password123" }
```
| 필드 | 조건 |
|------|------|
| username | 3~20자, 중복 불가 |
| password | 6자 이상 |

**Response 201**
```json
{ "token": "eyJ...", "username": "홍길동" }
```

#### 로그인
```
POST /auth/login
Content-Type: application/json
```
**Request Body**
```json
{ "username": "홍길동", "password": "password123" }
```
**Response 200**
```json
{ "token": "eyJ...", "username": "홍길동" }
```

---

### Todo (인증 필요)

#### 목록 조회
```
GET /todos
Authorization: Bearer {token}
```
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| page | int | N | 페이지 번호 (기본값 0) |
| size | int | N | 페이지 크기 (기본값 10) |
| category | string | N | WORK / PERSONAL / STUDY / OTHER |
| completed | boolean | N | 완료 여부 필터 |

**Response 200**
```json
{
  "content": [
    {
      "id": 1,
      "title": "할일 제목",
      "content": "내용",
      "deadline": "2026-09-01T12:00:00",
      "completed": false,
      "category": "WORK",
      "deadlineImminent": false,
      "pinned": false,
      "createdAt": "2026-08-31T09:00:00",
      "updatedAt": "2026-08-31T09:00:00"
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "number": 0,
  "size": 10
}
```

#### 단건 조회
```
GET /todos/{id}
Authorization: Bearer {token}
```
**Response 200** — 위 content 배열의 단일 객체

#### 등록
```
POST /todos
Authorization: Bearer {token}
Content-Type: application/json
```
**Request Body**
```json
{
  "title": "할일 제목",
  "content": "내용 (선택)",
  "deadline": "2026-09-01T12:00:00 (선택)",
  "category": "WORK (선택)"
}
```
**Response 201** — 생성된 Todo 객체

#### 수정
```
PUT /todos/{id}
Authorization: Bearer {token}
Content-Type: application/json
```
**Request Body** — 등록과 동일 / **Response 200** — 수정된 Todo 객체

#### 삭제
```
DELETE /todos/{id}
Authorization: Bearer {token}
```
**Response 204 No Content**

#### 완료 토글
```
PATCH /todos/{id}/complete
Authorization: Bearer {token}
```
**Response 200** — 완료 상태가 반전된 Todo 객체

#### 상단 고정 토글
```
PATCH /todos/{id}/pin
Authorization: Bearer {token}
```
**Response 200** — 고정 상태가 반전된 Todo 객체

### 에러 응답
```json
{ "message": "에러 메시지" }
```
| 상태코드 | 원인 |
|---------|------|
| 400 | 유효성 검사 실패 / 중복 아이디 / 잘못된 비밀번호 |
| 401 | 토큰 없음 또는 만료 |
| 404 | 해당 Todo 없음 |
| 500 | 서버 오류 |

---

## 프로젝트 구조

```
todolist/
├── src/                                  # Spring Boot 백엔드
│   └── main/
│       ├── java/com/example/todolist/
│       │   ├── config/
│       │   │   ├── CorsConfig.java       # CORS 설정
│       │   │   ├── SecurityConfig.java   # Spring Security + JWT 설정
│       │   │   └── JpaConfig.java        # JPA Auditing
│       │   ├── security/
│       │   │   ├── JwtTokenProvider.java       # JWT 생성/검증
│       │   │   ├── JwtAuthenticationFilter.java# 요청마다 토큰 검사
│       │   │   └── UserDetailsServiceImpl.java # 사용자 조회
│       │   ├── controller/
│       │   │   ├── AuthController.java   # 회원가입/로그인 API
│       │   │   └── TodoController.java   # Todo CRUD API
│       │   ├── service/
│       │   │   ├── AuthService.java      # 인증 비즈니스 로직
│       │   │   └── TodoService.java      # Todo 비즈니스 로직
│       │   ├── repository/
│       │   │   ├── UserRepository.java
│       │   │   └── TodoRepository.java
│       │   ├── entity/
│       │   │   ├── User.java
│       │   │   ├── Todo.java
│       │   │   └── Category.java
│       │   ├── dto/
│       │   │   ├── request/SignupRequest.java
│       │   │   ├── request/LoginRequest.java
│       │   │   ├── request/TodoRequest.java
│       │   │   ├── response/TokenResponse.java
│       │   │   └── response/TodoResponse.java
│       │   └── exception/
│       │       ├── GlobalExceptionHandler.java
│       │       └── TodoNotFoundException.java
│       └── resources/
│           ├── application.yml           # 공통 설정
│           ├── application-dev.yml       # 개발 환경 (H2)
│           └── application-prod.yml      # 운영 환경 (MySQL)
├── frontend/                             # React 프론트엔드
│   ├── src/
│   │   ├── api/
│   │   │   ├── authApi.js               # 인증 API 호출
│   │   │   └── todoApi.js               # Todo API 호출 (Bearer 토큰 자동 첨부)
│   │   ├── context/
│   │   │   └── AuthContext.jsx          # 로그인 상태 전역 관리
│   │   ├── components/
│   │   │   ├── AuthForm.jsx             # 로그인/회원가입 화면
│   │   │   ├── TodoForm.jsx             # 등록/수정 폼
│   │   │   ├── TodoItem.jsx             # 할일 목록 아이템
│   │   │   ├── TodoDateGroup.jsx        # 날짜별 그룹 목록
│   │   │   ├── TodoCalendar.jsx         # 달력 보기
│   │   │   └── TodoDetail.jsx           # 상세 모달
│   │   ├── App.jsx                      # 메인 컴포넌트
│   │   └── index.css                    # 스타일
│   ├── .env.development                 # 개발 환경 변수
│   ├── .env.production                  # 운영 환경 변수
│   └── vite.config.js                   # Vite + 프록시 설정
├── build.gradle
└── README.md
```

---

## 로컬 실행 방법

### 사전 요구사항
- Java 21
- Node.js 18 이상

### 백엔드 실행
```bash
./gradlew bootRun
# 서버: http://localhost:8080
# H2 Console: http://localhost:8080/h2-console
```

### 프론트엔드 실행
```bash
cd frontend
npm install
npm run dev
# 브라우저: http://localhost:5173
```

---

## 환경 설정

### 백엔드 환경 변수 (prod)

| 변수명 | 설명 |
|--------|------|
| `DB_HOST` | MySQL 호스트 |
| `DB_PORT` | MySQL 포트 (기본 3306) |
| `DB_NAME` | DB 이름 |
| `DB_USERNAME` | DB 사용자명 |
| `DB_PASSWORD` | DB 비밀번호 |
| `CORS_ALLOWED_ORIGINS` | 허용할 프론트엔드 도메인 |
| `JWT_SECRET` | JWT 서명 키 (32자 이상) |

### 프론트엔드 환경 변수 (prod)

`.env.production` 파일에서 수정:
```
VITE_API_BASE_URL=https://{EC2_DOMAIN}/api
```
