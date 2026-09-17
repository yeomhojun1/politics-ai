# politics-ai 기능 테스트 보고 (2026-09-16)

> 5개 프로젝트 전체 현황: https://claude.ai/artifact/PvWqAcbkvtL8VSNHZhL48e

## 한 줄 요약: 전체 기능 17개 중 PASS 9 / FAIL 4 / 미실행(과금 회피) 4

- 테스트 환경: Windows 11, Node v18.20.8, npm 10.8.2. 백엔드는 `ANTHROPIC_API_KEY` **없이** `PORT=3200`으로 기동(테스트 후 종료). 프론트는 이미 떠 있던 `http://localhost:5174` 개발 서버를 curl로만 확인(브라우저 자동화 미사용). 소스 수정·커밋 없음.
- 프로젝트 정체: 앱 이름 "정CHPT". 백엔드 `backend/server.js`(Express 4 + `@anthropic-ai/sdk` 0.52.0, 모델 `claude-sonnet-4-6`), 프론트 `frontend/src`(Vite 5.4.21 + React 18 + react-router 6 + vite-plugin-pwa 0.17.5).
- 실제 Anthropic 호출이 필요한 4개 기능(정치인 검색·정책 비교·뉴스 요약·챗봇의 "정상 응답")은 과금 회피를 위해 **실행하지 않았고**, 키 없음 처리 경로만 확인했다.

## 기능 목록과 결과

| # | 기능 | 종류 | 테스트 방법(명령) | 결과 | 관찰/근거 |
|---|------|------|-------------------|------|-----------|
| 1 | 백엔드 의존성 설치 | API | `cd backend; npm install --no-audit --no-fund` | PASS | 72패키지 2초. `package-lock.json` 변경 없음(git status 확인) |
| 2 | 백엔드 기동 (포트 환경변수) | API | `PORT=3200 node server.js` (키 없음) | PASS | `서버 실행 중: http://localhost:3200` 출력. 키가 없어도 기동 자체는 됨(SDK는 호출 시점에만 검증) |
| 3 | 헬스체크 `GET /api/health` | API | `curl http://localhost:3200/api/health` | PASS | `{"ok":true}` 200 |
| 4 | 정치인 검색 `POST /api/politician` — 입력 검증 | API | `-d '{"name":"   "}'`, 본문 없음 | PASS | 둘 다 400 `{"error":"정치인 이름을 입력해주세요."}` |
| 5 | 정치인 검색 — 키 없음 처리 | API | `-d '{"name":"홍길동"}'` | PASS(동작) / 메시지 품질 낮음 | 500 `{"error":"API 오류: Could not resolve authentication method. Expected either apiKey or authToken to be set..."}` — SDK 영문 원문이 사용자에게 그대로 노출됨 |
| 6 | 정치인 검색 — 실제 AI 응답 | API | (미실행) | 미실행(과금 회피) | 코드상 `messages.create(max_tokens 1500)` 후 `msg.content[0].text` 반환 |
| 7 | 정책 비교 `POST /api/policy-compare` — 검증/키없음 | API | `{"politician1":"A"}` → 400 / 둘 다 있을 때 → 500 | PASS(검증) | 400 `두 정치인의 이름을 모두 입력해주세요.`; 키 없음 시 #5와 동일 500 |
| 8 | 정책 비교 — 실제 AI 응답 | API | (미실행) | 미실행(과금 회피) | topic 선택 입력이 프롬프트에 삽입됨(`topic`은 trim 없이 원문 삽입) |
| 9 | 뉴스 요약 `POST /api/news-summary` — 검증/키없음 | API | `{"newsText":""}` → 400 / 텍스트 있을 때 → 500 | PASS(검증) | 400 `뉴스 내용을 입력해주세요.`; 키 없음 시 500 동일 |
| 10 | 뉴스 요약 — 실제 AI 응답 | API | (미실행) | 미실행(과금 회피) | |
| 11 | 챗봇 `POST /api/chat` — 검증/키없음 | API | `{"messages":[]}`, `{}` → 400 / 메시지 1건 → 500 | PASS(검증) | 400 `메시지가 없습니다.`; 키 없음 시 500 동일 |
| 12 | 챗봇 — 실제 AI 응답(멀티턴) | API | (미실행) | 미실행(과금 회피) | 프론트가 인사말(`local:true`)을 제외한 전체 대화 이력을 `messages`로 전송 |
| 13 | 잘못된 입력 내성 (타입 오류) | API | `-d '{"name":123}'` | **FAIL** | **서버 프로세스가 죽음**. `TypeError: name?.trim is not a function` → async 핸들러의 unhandled rejection으로 Node 종료. 이후 모든 요청 connection refused |
| 14 | 잘못된 JSON / 과대 본문 | API | `-d '{bad json'` / 200KB 본문 | PASS(생존) / 응답 형식 문제 | 400·413이지만 본문이 Express 기본 **HTML 에러 페이지**(스택트레이스 포함). 프론트는 `res.json()`을 하므로 파싱 에러 문구가 그대로 사용자에게 표시됨 |
| 15 | CORS (프론트 5174 → 백엔드) | API | `OPTIONS /api/chat -H 'Origin: http://localhost:5174'` vs `5173` | **FAIL** | 5173은 `Access-Control-Allow-Origin` 헤더 있음, **5174는 없음** → 현재 떠 있는 프론트에서 백엔드 호출은 브라우저가 전부 차단 |
| 16 | 프론트 라우팅 5종 (`/`, `/politician`, `/policy`, `/news`, `/chat`) | UI | `curl localhost:5174/<route>` + 변환된 `App.jsx`, `Navbar.jsx`, `Home.jsx` 확인 | PASS | 모든 경로 200 HTML(SPA fallback). Route 5개, 네비 라벨 `홈/정치인/정책비교/뉴스요약/챗봇`, 홈 카드 4개(`정치인 검색/정책 비교/뉴스 요약/정치 챗봇`) 존재. 미정의 경로(`/nonexistent`)도 200이며 404 화면 없음 |
| 17 | 백엔드 주소 결정 방식 | UI | `curl localhost:5174/src/pages/Chatbot.jsx` | PASS(확인) | 4개 페이지 각각 `const API = import.meta.env.VITE_API_URL \|\| 'http://localhost:3001'` 로 중복 정의. `.env` 파일 없음 → 기본 3001 사용 |
| 18 | 프론트 프로덕션 빌드 `npm run build` | PWA | `cd frontend; npm run build` | **FAIL** | JS/CSS/manifest까지 생성 후 `Error: Dynamic require of "workbox-build" is not supported`로 종료. **sw.js 미생성**. 원인은 아래 버그 3 |
| 19 | PWA 매니페스트·서비스워커 | PWA | `dist/manifest.webmanifest`, `dist/index.html`, `dist/sw.js` 확인 | **FAIL** | manifest는 생성됐고 `dist/index.html`에 `<link rel=manifest>` + `registerSW.js` 주입됨. 그러나 `sw.js` 없음 → 등록 실패. 또한 manifest에 **`icons` 항목이 없어** 브라우저 설치(홈 화면 추가) 조건 미충족. `lang:"en"` 기본값 |

(표의 #1~#3, #16~#17 등 인프라 항목을 제외하고 "기능" 단위로 세면 17개: PASS 9, FAIL 4(#13, #15, #18, #19), 미실행 4(#6, #8, #10, #12).)

## 발견한 버그·문제 (재현법 포함)

### 1. [심각] 비문자열 입력 하나로 백엔드 프로세스 전체가 종료됨
- 재현: 백엔드 기동 후
  ```
  curl -X POST http://localhost:3200/api/politician -H "Content-Type: application/json" -d "{\"name\":123}"
  ```
- 현상: 응답 없이 연결이 끊기고 콘솔에 `TypeError: name?.trim is not a function` 후 Node 종료(exit 1). 이후 `/api/health`도 connection refused.
- 원인: `backend/server.js:21` `name?.trim()`이 숫자/배열/객체에서 throw → `async` 핸들러의 거부된 Promise를 Express 4가 잡지 못해 unhandled rejection → 프로세스 종료. 같은 패턴이 `/api/policy-compare`(`politician1?.trim()`), `/api/news-summary`(`newsText?.trim()`)에도 있음. `/api/chat`은 `messages`가 문자열이면 `"hello".length`가 truthy라 통과되어 Anthropic까지 전달됨(키 있으면 400 과금 없이 SDK 에러).
- 영향: 인터넷에 노출 시 누구나 요청 1건으로 서비스 다운 가능.

### 2. [심각] CORS 허용 목록에 현재 프론트 포트(5174)가 없음
- 재현: `curl -i -X OPTIONS http://localhost:3200/api/chat -H "Origin: http://localhost:5174" -H "Access-Control-Request-Method: POST"` → `Access-Control-Allow-Origin` 헤더 없음(5173은 있음).
- 원인: `server.js:9` `cors({ origin: ['http://localhost:5173','http://localhost:4173'] })`. 5173이 다른 프로젝트에 점유돼 Vite가 5174로 자동 이동(`.run-frontend.log`)했기 때문에 지금 떠 있는 화면에서는 4개 기능 모두 브라우저에서 "Failed to fetch"가 됨.

### 3. [심각] `npm run build` 실패 → PWA 서비스워커 미생성
- 재현: `cd frontend; npm run build`
- 현상: `Error: Dynamic require of "workbox-build" is not supported` (vite-plugin-pwa/dist/index.js:271). `dist/sw.js` 없음.
- 실제 원인(로더 훅으로 삼킨 예외를 출력해 확인): `workbox-build@7.4.1`(engines `node>=20`) → `@rollup/plugin-terser@1.0.0` → `serialize-javascript@7.0.5`가 전역 `crypto`를 사용하는데 **Node 18에는 전역 `crypto`가 없음**(`ReferenceError: crypto is not defined`). 플러그인이 ESM import 실패를 삼키고 CJS `require`로 재시도하다 위 메시지로 죽음.
- 조치 후보(미적용): Node 20+로 빌드하거나, `workbox-build`를 7.1.x/7.3.x로 고정하거나, `vite-plugin-pwa` 상위 버전으로 올려 재검증. 참고로 `frontend/package-lock.json`이 오늘 10:58 `npm install` 시점에 변경돼 있음(git status `M`) — 이번 세션 이전 작업이며 락 갱신으로 7.4.1이 들어온 것으로 보임.

### 4. [중간] PWA 매니페스트에 아이콘 없음
- `vite.config.js`의 manifest에 `icons` 배열이 없고 `public/`에도 아이콘 파일이 없음 → Chrome/Edge "앱 설치" 조건 불충족(README의 "모바일 홈 화면 추가" 미달성). `public/manifest.json`은 `index.html`에서 참조되지 않는 죽은 파일(빌드 시 `manifest.webmanifest`가 별도 생성됨).

### 5. [중간] 프론트 기본 백엔드 주소(3001)가 이 PC에서는 다른 앱을 가리킴
- 4개 페이지가 `http://localhost:3001` 하드코딩 폴백. 이 PC의 3001은 `homepick/frontend`의 Vite 서버(pid 27496)가 점유 중이라 `/api/*` 요청이 404. 백엔드를 기본 포트로 띄우면 EADDRINUSE. `VITE_API_URL`을 `.env`로 지정하는 안내가 README에 없음. API 상수가 4파일에 중복 정의된 점도 정리 대상.

### 6. [낮음] 에러 응답 형식 불일치·영문 노출
- 잘못된 JSON(400)·100KB 초과 본문(413, `express.json()` 기본 limit)은 HTML 스택트레이스 페이지. 프론트는 `res.json()`을 무조건 호출하므로 사용자에겐 `Unexpected token '<'...` 같은 문구가 표시됨. 긴 뉴스 기사(한글 약 3만자 이상) 붙여넣기 시 발생 가능.
- 키 없음/SDK 오류가 `API 오류: Could not resolve authentication method...` 영문 원문으로 노출. 기동 시 `ANTHROPIC_API_KEY` 부재 경고도 없음.

### 7. [낮음] 기타
- 정의되지 않은 경로에 404 화면 없음(빈 main 영역).
- `topic` 값은 trim 없이, 사용자 입력(이름·뉴스)은 그대로 프롬프트에 삽입됨(프롬프트 인젝션 여지).
- 모델 `claude-sonnet-4-6`은 유효한 ID(구세대, $3/$15 per MTok). 최신 세대로 올리려면 별도 결정 필요.

## 브라우저에서 직접 눌러봐야 할 UI 시나리오 (LLM 호출 없이 확인 가능)

1. **네비게이션·활성 표시**: `http://localhost:5174/` 에서 상단 5개 링크(홈/정치인/정책비교/뉴스요약/챗봇)를 순서대로 클릭 → URL 변경, 현재 탭에 `active` 스타일, 브라우저 뒤로가기 정상 동작. 홈의 4개 카드 클릭도 같은 경로로 이동하는지.
2. **버튼 비활성 조건**: 정치인 검색에서 공백만 입력 → `검색` 버튼 비활성 유지. 정책 비교에서 첫 번째 이름만 입력 → `비교하기` 비활성, 두 번째까지 입력 → 활성. 뉴스요약 textarea 비우면 `요약하기` 비활성.
3. **CORS 차단 체험(버그 2 확인)**: 백엔드를 `PORT=3001`이 아닌 다른 포트로 띄우고 `frontend/.env`에 `VITE_API_URL=http://localhost:<포트>` 없이 그대로 정치인 이름 입력 후 검색 → 개발자도구 Network에서 CORS 에러/404, 화면에는 `error-box`에 "Failed to fetch" 표시되는지.
4. **챗봇 입력 UX**: `/chat`에서 인사말 말풍선 1개 존재, Enter로 전송 시 사용자 말풍선 추가 + textarea 비워짐 + `답변 생성 중...` 표시 후 오류 말풍선(`오류: ...`)으로 바뀌는지, Shift+Enter는 줄바꿈만 되는지, 새 메시지 후 자동 스크롤.
5. **반응형·PWA 헤더**: 창 폭 600px 이하로 줄였을 때 `@media (max-width: 600px)` 레이아웃(카드 1열, 네비 줄바꿈) 확인. 개발 모드에서는 서비스워커가 등록되지 않는 게 정상(`devOptions` 미설정)이며 Application 탭 Manifest에 아이콘 경고가 뜨는지 확인.

## 환경 한계 / 의도적으로 실행 안 한 것

- **Anthropic 실제 호출 4건 미실행**(과금 회피). `ANTHROPIC_API_KEY` 미설정 상태로만 테스트했고, 응답 본문 파싱(`msg.content[0].text`)·max_tokens 적정성·한국어 품질은 검증하지 못함.
- 브라우저 자동화 도구 미사용 → 렌더링·클릭·SW 등록은 curl로 소스/HTML 수준 확인만 했음(위 UI 시나리오 5개는 미검증).
- 5174 개발 서버와 3001(homepick)·기타 포트 프로세스는 건드리지 않음. 제가 띄운 3200 백엔드(pid 3720)만 테스트 후 종료.
- Node 20+ 런타임이 이 PC에 없어(`C:\Program Files\nodejs` 18.20.8 단일) 빌드 실패의 "Node 20에서는 되는지"는 확인 못 함.
- 소스·설정 파일 수정 없음. 부산물: `frontend/dist/`(빌드 실패로 sw.js 없는 불완전 산출물, .gitignore 대상)와 `backend/node_modules/`(.gitignore 대상)만 생성됨. `frontend/package-lock.json` 변경과 `.run-frontend.log`는 이번 세션 이전부터 있던 상태.
