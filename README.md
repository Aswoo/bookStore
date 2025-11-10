# BookStore 프로젝트

북마크 하고 싶은 도서를 커뮤니티에 공유하고, 다른 사용자의 추천 도서를 탐색할 수 있는 풀스택 예제 애플리케이션입니다.  
`backend`는 Node.js + Express + MongoDB 기반의 REST API를 제공하고, `mobile`은 Expo Router와 TypeScript를 사용하는 React Native 앱으로 구성되어 있습니다.

## 주요 기능

### Backend (Express API)
- JWT 인증 기반 회원가입/로그인
- DiceBear 아바타 자동 생성
- Cloudinary 업로드를 포함한 도서 추천 CRUD
- 페이지네이션(무한 스크롤)과 사용자별 추천 조회, 삭제
- 환경 변수로 제어 가능한 Keep-Alive 크론 잡

### Mobile (Expo / React Native + TypeScript)
- Expo Router 기반 인증 스택과 탭 네비게이션
- TypeScript 기반으로 타입 안전성 강화 (`mobile/docs/ts-migration-summary.md` 참고)
- Zustand + AsyncStorage로 로그인 상태 관리
- 도서 피드 무한 스크롤, 당겨서 새로고침, 추천 삭제
- 이미지 피커/파일 시스템을 통한 Cloudinary 업로드 (base64)
- 한글 UI, 다크 모드에 어울리는 색상 팔레트

## 기술 스택

- **Backend:** Node.js, Express 5, Mongoose, JWT, Bcrypt, Cloudinary SDK, Nodemon, Cron
- **Database:** MongoDB Atlas (또는 호환 인스턴스)
- **Mobile:** React Native 0.81, TypeScript, Expo SDK 54, Expo Router 6, Expo Image Picker, Zustand, AsyncStorage

## 폴더 구조

```
bookStore/
├── backend/        # Express REST API
│   └── src/
│       ├── index.js
│       ├── lib/   # DB, Cloudinary, Cron 설정
│       ├── middleware/
│       ├── models/
│       └── routes/
└── mobile/         # Expo(React Native & TypeScript) 앱
    ├── app/        # Expo Router 경로
    ├── assets/     # 폰트, 스타일, 이미지
    ├── components/ # 공용 UI 컴포넌트 (.tsx)
    ├── constants/  # 상수 정의 (.ts)
    ├── store/      # Zustand 스토어 (.ts)
    └── lib/        # 유틸 함수 (.ts)
```

## 개발 환경 준비

### 요구 사항
- Node.js 18+
- npm 9+ (또는 pnpm/yarn, 문서는 npm 기준)
- Expo CLI (선택) 또는 `npx expo`
- MongoDB 연결 문자열
- Cloudinary 계정

---

### 1. Backend 설정

```bash
cd backend
npm install
```

`.env` 파일(루트: `backend/.env`)에 다음 값을 채워 주세요.

| 변수 | 설명 |
| --- | --- |
| `PORT` | 서버 포트 (기본값 3000) |
| `MONGO_URI` | MongoDB 연결 문자열 |
| `JWT_SECRET` | JWT 서명 키 |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary 클라우드 이름 |
| `CLOUDINARY_API_KEY` | Cloudinary API 키 |
| `CLOUDINARY_API_SECRET` | Cloudinary API 시크릿 |
| `ENABLE_CRON` | `true`/`false` (기본 `false`) |
| `CRON_INTERVAL` | 크론 표현식 (예: `"*/30 * * * *"`) |
| `API_URL` | Keep-Alive 요청을 보낼 본인 API 주소 |

로컬 개발 시작:

```bash
npm run dev
```

---

### 2. Mobile 설정

```bash
cd mobile
npm install
```

필요한 Expo 패키지(이미 설치된 경우 생략 가능):

```bash
npx expo install expo-image-picker
```

`mobile/constants/api.ts`에서 백엔드 주소를 실제 IP로 맞춰 주세요.

```javascript
export const API_URL = "http://<로컬 IP>:3000/api";
```

> iOS/Android 실제 기기에서 테스트할 때는 **맥과 동일한 Wi-Fi**에 연결하고, `localhost` 대신 사설 IP(예: `http://192.168.x.x:3000/api`)를 입력해야 합니다.

Expo 개발 서버 실행 (TypeScript 검사 포함):

```bash
npx tsc --noEmit && npx expo start
```

필요 시 `npx expo start -c`로 캐시를 초기화해 주세요.

---

## API 요약

| 메소드 | 경로 | 설명 | 인증 |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | 회원가입 | ❌ |
| `POST` | `/api/auth/login` | 로그인 | ❌ |
| `POST` | `/api/books` | 도서 추천 등록 (Cloudinary 업로드) | ✅ |
| `GET` | `/api/books?page=&limit=` | 도서 추천 목록 (페이지네이션) | ✅ |
| `GET` | `/api/books/user` | 내 추천 목록 | ✅ |
| `DELETE` | `/api/books/:id` | 추천 삭제 | ✅ |

요청 시 `Authorization: Bearer <token>` 헤더가 필요합니다.

---

## 유용한 스크립트

| 위치 | 명령 | 설명 |
| --- | --- | --- |
| `backend` | `npm run dev` | Nodemon으로 Express 개발 서버 기동 |
| `mobile` | `npm run start` | Expo 개발 서버 기동 |
| `mobile` | `npm run android` / `npm run ios` / `npm run web` | 해당 플랫폼에서 앱 실행 |

---

## Keep-Alive 크론 잡 참고

무료 호스팅(Railway, Render 등)에서 슬립 방지를 위해 30분마다 GET 요청을 보내도록 설정되어 있습니다.  
환경 변수 `ENABLE_CRON=true`로 활성화할 수 있으며, UptimeRobot 등 외부 모니터링 서비스로 대체하는 것도 좋은 방법입니다.

---

## 향후 개선 아이디어

- 댓글, 좋아요 등 소셜 기능 확장
- 이미지 리사이징/압축 최적화
- 다국어 지원(L10N) 및 접근성 개선
- E2E 테스트 및 CI 파이프라인 구축

---

