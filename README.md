# 정CHPT — 한국 정치 질문에 답하는 챗봇

국회·선거·탄핵 같은 한국 정치 제도를, 특정 정당이나 정치인 편을 들지 않고 근거 법 조항과 함께 쉬운 말로 설명해 주는 웹 서비스입니다.

## 누가 어떤 불편을 겪나요

뉴스에 "필리버스터", "재의요구", "비례대표" 같은 말이 나와도 뜻과 절차를 바로 알기 어렵습니다. 검색하면 정당 입장이 섞인 글이 많아서, 제도 자체만 담백하게 설명한 글을 찾는 데 시간이 걸립니다.

## 바로 써 보기

**https://yeomhojun1.github.io/politics-ai/**

설치나 가입 없이 링크만 누르면 됩니다. 이 데모는 실제 AI 서버 없이, 미리 준비한 답변 8개로 동작합니다. 상단 메뉴의 "챗봇"에서 예시 질문 버튼을 눌러 보세요.

## 할 수 있는 것

- 정치 제도에 대해 물어보면 설명과 근거 법 조항을 함께 받을 수 있습니다. (데모에서는 예시 질문 8개)
- 정치인 이름으로 경력과 소속 정당을 찾아볼 수 있습니다. (실제 AI 서버를 연결했을 때)
- 두 정치인의 정책 입장을 주제별로 나란히 비교할 수 있습니다. (실제 AI 서버를 연결했을 때)
- 정치 뉴스 기사를 붙여 넣으면 핵심만 요약해 줍니다. (실제 AI 서버를 연결했을 때)
- 휴대폰 홈 화면에 앱처럼 추가할 수 있습니다.

## 만든 과정

AI 에이전트로 기능을 만든 뒤, 다른 에이전트가 기능을 하나씩 직접 실행해 확인했습니다([feature-test-report.md](feature-test-report.md)). 이 테스트에서 잘못된 요청 한 건에 서버가 꺼지는 문제, 화면에서 서버 호출이 막히는 문제, 앱 빌드 실패, 앱 아이콘 누락이 발견됐습니다.
네 가지를 고친 뒤 같은 방법으로 다시 실행해 해결을 확인했습니다([fix-report.md](fix-report.md)). 실제 AI 답변 품질은 비용 문제로 아직 테스트하지 않았습니다.

---

# 🗳️ 정치AI (Politics GPT)

한국 정치 관련 질문에 답변해주는 **AI 챗봇 서비스**입니다.
복잡한 정치 이슈, 정당·정책, 용어를 쉽고 중립적으로 설명하는 것을 목표로 합니다.

---

## ✨ 주요 기능

- 정치 이슈·정책·용어에 대한 자연어 질문 답변
- 대화형 챗봇 UI
- PWA 지원 (모바일 홈 화면 추가 가능)

## 🧱 기술 스택

| 구분 | 기술 |
| --- | --- |
| Frontend | React · Vite · React Router · PWA (`vite-plugin-pwa`) |
| Backend | Node.js · Express |
| AI | Anthropic **Claude API** (`@anthropic-ai/sdk`) |

## 📁 구조

```
politics-ai/
├─ frontend/   # React + Vite (PWA)
└─ backend/    # Express API 서버 (Claude 호출)
```

## 🚀 실행 방법

```bash
# 1) 백엔드 (기본 포트 4004)
cd backend
npm install
cp .env.example .env   # .env 에 ANTHROPIC_API_KEY 설정
npm start
npm test               # 단위 테스트 (API 키 불필요)

# 2) 프론트엔드
cd ../frontend
npm install
npm run dev
```

## 🔑 환경변수

**backend/.env** (`backend/.env.example` 복사)

```
PORT=4004
ANTHROPIC_API_KEY=your-claude-api-key
# ALLOWED_ORIGINS=http://localhost:5174   # 미설정 시 5173/5174/4173 허용
```

**frontend/.env** (`frontend/.env.example` 복사)

```
VITE_API_URL=http://localhost:4004
```

AI 설정 상태는 `GET /api/llm-status` 로 확인할 수 있습니다(외부 호출 없이 키 설정 여부만 확인).

> `ANTHROPIC_API_KEY` 를 설정하기 전까지 AI 기능 4종(정치인 검색·정책 비교·뉴스 요약·챗봇)은 503 과 한국어 안내를 반환합니다. 나머지 화면·라우팅·입력 검증은 키 없이도 정상 동작합니다.

> ⚠️ 정치는 민감한 주제입니다. 본 서비스의 답변은 참고용이며, 특정 정당·후보를 지지하지 않는 중립적 정보 제공을 지향합니다.

## 데모 빌드 (GitHub Pages)

`VITE_DEMO=true` 로 빌드하면 백엔드·AI 없이 브라우저 안의 가짜 API(`frontend/src/demo/`)로 동작합니다. 라우터는 HashRouter, 경로는 `/politics-ai/` 로 바뀝니다. 평소 빌드에는 데모 코드가 들어가지 않습니다.

```bash
cd frontend
npm run build:demo     # = vite build --mode demo (.env.demo 의 VITE_DEMO=true 사용)
npx vite preview --mode demo
```

`main` 에 push 하면 `.github/workflows/pages.yml` 이 데모를 빌드해 GitHub Pages 에 배포합니다.
