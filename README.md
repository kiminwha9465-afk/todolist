# TodoList

Spring Boot + React 기반 할 일 관리 서비스

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | React 19, Vite, Axios, Day.js |
| Backend | Spring Boot 4.1, Spring Data JPA, Spring Validation |
| DB (dev) | H2 (In-Memory) |
| DB (prod) | MySQL |
| 빌드 도구 | Gradle (백엔드), npm (프론트엔드) |
| 배포 | AWS EC2 |

---

## 기능

- Todo **등록 / 조회 / 수정 / 삭제 (CRUD)**
- **완료 처리** 토글 (체크박스)
- **마감 24시간 이내** 항목 구분 표시 (`마감 임박` 배지)
- **카테고리** 분류 (업무 / 개인 / 학습 / 기타)
- **페이지네이션** (10개씩)
- 카테고리 / 완료 여부 **필터링**
- 상세 **모달** (제목 클릭 시 상세 정보 확인)
- **환경 분리** — dev(H2) / prod(MySQL), CORS, API Base URL

---

## ERD

```
┌──────────────────────────────────────────┐
│                   todos                  │
├──────────────┬───────────────────────────┤
│ id           │ BIGINT (PK, AUTO_INCREMENT)│
│ title        │ VARCHAR(255) NOT NULL      │
│ content      │ TEXT                       │
│ deadline     │ DATETIME                   │
│ completed    │ BOOLEAN DEFAULT false      │
│ category     │ VARCHAR (WORK/PERSONAL/    │
│              │          STUDY/OTHER)      │
│ created_at   │ DATETIME (자동)            │
│ updated_at   │ DATETIME (자동)            │
└──────────────┴───────────────────────────┘
```

---

## REST API 설계

### Base URL
- 개발: `http://localhost:8080/api`
- 운영: `https://{EC2_DOMAIN}/api`

### 엔드포인트

#### 목록 조회
```
GET /todos
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
```
**Response 200** — 위 content 배열의 단일 객체

#### 등록
```
POST /todos
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
Content-Type: application/json
```
**Request Body** — 등록과 동일

**Response 200** — 수정된 Todo 객체

#### 삭제
```
DELETE /todos/{id}
```
**Response 204 No Content**

#### 완료 토글
```
PATCH /todos/{id}/complete
```
**Response 200** — 완료 상태가 반전된 Todo 객체

### 에러 응답
```json
{
  "message": "에러 메시지"
}
```
| 상태코드 | 원인 |
|---------|------|
| 400 | 유효성 검사 실패 (제목 누락 등) |
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
│       │   │   └── JpaConfig.java        # JPA Auditing
│       │   ├── controller/
│       │   │   └── TodoController.java   # REST API 엔드포인트
│       │   ├── service/
│       │   │   └── TodoService.java      # 비즈니스 로직
│       │   ├── repository/
│       │   │   └── TodoRepository.java   # JPA 쿼리
│       │   ├── entity/
│       │   │   ├── Todo.java             # Todo 엔티티
│       │   │   └── Category.java         # 카테고리 Enum
│       │   ├── dto/
│       │   │   ├── request/TodoRequest.java
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
│   │   ├── api/todoApi.js               # Axios API 호출
│   │   ├── components/
│   │   │   ├── TodoForm.jsx             # 등록/수정 폼
│   │   │   ├── TodoItem.jsx             # 할일 목록 아이템
│   │   │   ├── TodoList.jsx             # 할일 목록 + 페이지네이션
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

### 프론트엔드 환경 변수 (prod)

`.env.production` 파일에서 수정:
```
VITE_API_BASE_URL=https://{EC2_DOMAIN}/api
```
