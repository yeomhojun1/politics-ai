import { Link } from 'react-router-dom';

const features = [
  { path: '/politician', icon: '🔍', name: '정치인 검색', desc: '정치인의 경력, 소속 정당, 핵심 정책을 빠르게 확인' },
  { path: '/policy', icon: '⚖️', name: '정책 비교', desc: '두 정치인의 정책 입장을 항목별로 비교 분석' },
  { path: '/news', icon: '📰', name: '뉴스 요약', desc: '정치 뉴스를 붙여넣으면 핵심만 요약·분석' },
  { path: '/chat', icon: '💬', name: '정치 챗봇', desc: '한국 정치에 관한 모든 질문에 자유롭게 답변' },
];

export default function Home() {
  return (
    <div className="home">
      <h1 className="home-title">정CHPT</h1>
      <p className="home-subtitle">한국 정치 전문 AI</p>
      <div className="feature-grid">
        {features.map(f => (
          <Link key={f.path} to={f.path} className="feature-card">
            <div className="feature-icon">{f.icon}</div>
            <div className="feature-name">{f.name}</div>
            <div className="feature-desc">{f.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
