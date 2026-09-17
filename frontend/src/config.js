// 백엔드 주소는 여기 한 곳에서만 결정한다.
// 바꾸려면 frontend/.env 에 VITE_API_URL 을 설정하세요 (.env.example 참고).
export const API = import.meta.env.VITE_API_URL || 'http://localhost:4004';
