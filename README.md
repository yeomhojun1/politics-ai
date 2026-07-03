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
# 1) 백엔드
cd backend
npm install
# .env 에 ANTHROPIC_API_KEY 설정
npm start

# 2) 프론트엔드
cd ../frontend
npm install
npm run dev
```

## 🔑 환경변수 (backend/.env)

```
ANTHROPIC_API_KEY=your-claude-api-key
```

> ⚠️ 정치는 민감한 주제입니다. 본 서비스의 답변은 참고용이며, 특정 정당·후보를 지지하지 않는 중립적 정보 제공을 지향합니다.
