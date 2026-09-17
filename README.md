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
