import { useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function Loading() {
  return <div className="loading"><div className="spinner" />AI가 분석 중입니다...</div>;
}

export default function NewsSummary() {
  const [newsText, setNewsText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const summarize = async () => {
    if (!newsText.trim() || loading) return;
    setLoading(true);
    setError('');
    setResult('');
    try {
      const res = await fetch(`${API}/api/news-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsText: newsText.trim() })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">뉴스 요약</h1>
      <div className="form-group">
        <label>정치 뉴스 기사를 붙여넣으세요</label>
        <textarea
          value={newsText}
          onChange={e => setNewsText(e.target.value)}
          placeholder="뉴스 기사 내용을 복사해서 여기에 붙여넣으세요..."
        />
      </div>
      <button
        className="submit-btn submit-btn-full"
        onClick={summarize}
        disabled={loading || !newsText.trim()}
      >
        {loading ? '요약 중...' : '요약하기'}
      </button>
      {loading && <Loading />}
      {error && <div className="error-box">{error}</div>}
      {result && <div className="result-box">{result}</div>}
    </div>
  );
}
