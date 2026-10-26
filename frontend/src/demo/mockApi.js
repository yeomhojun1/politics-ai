// 데모 모드(VITE_DEMO=true) 전용 가짜 백엔드.
// window.fetch 를 감싸서 `${API}/api/...` 요청만 브라우저 안에서 처리한다.
import { API } from '../config';
import { findDemoAnswer, DEMO_UNKNOWN } from './answers';

const DELAY_MS = 700;
const OTHER_FEATURE =
  '데모 모드에서는 이 기능이 실제 AI 없이 동작하지 않습니다.\n상단 메뉴의 "챗봇"에서 예시 질문을 눌러 보세요.';

const json = (body, status = 200) =>
  new Promise(resolve =>
    setTimeout(
      () => resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })),
      DELAY_MS
    )
  );

function handle(path, body) {
  switch (path) {
    case '/api/health':
      return json({ ok: true });
    case '/api/chat': {
      const last = [...(body?.messages || [])].reverse().find(m => m.role === 'user');
      const answer = last ? findDemoAnswer(String(last.content)) : null;
      return json({ result: answer || DEMO_UNKNOWN, demoUnknown: !answer });
    }
    case '/api/politician':
    case '/api/policy-compare':
    case '/api/news-summary':
      return json({ result: OTHER_FEATURE });
    default:
      return json({ error: '데모 모드에서 지원하지 않는 요청입니다.' }, 404);
  }
}

export function installMockApi() {
  const realFetch = window.fetch.bind(window);
  window.fetch = (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url;
    if (!url.startsWith(`${API}/api/`)) return realFetch(input, init);
    let body = null;
    try { body = init.body ? JSON.parse(init.body) : null; } catch { body = null; }
    return handle(url.slice(API.length).split('?')[0], body);
  };
}
