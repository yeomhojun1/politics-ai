import { useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function Loading() {
  return <div className="loading"><div className="spinner" />AI가 분석 중입니다...</div>;
}

export default function PolicyCompare() {
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const compare = async () => {
    if (!p1.trim() || !p2.trim() || loading) return;
    setLoading(true);
    setError('');
    setResult('');
    try {
      const res = await fetch(`${API}/api/policy-compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ politician1: p1.trim(), politician2: p2.trim(), topic: topic.trim() })
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
      <h1 className="page-title">정책 비교</h1>
      <div className="form-group">
        <label>첫 번째 정치인</label>
        <input type="text" value={p1} onChange={e => setP1(e.target.value)} placeholder="예: 이재명" />
      </div>
      <div className="form-group">
        <label>두 번째 정치인</label>
        <input type="text" value={p2} onChange={e => setP2(e.target.value)} placeholder="예: 한동훈" />
      </div>
      <div className="form-group">
        <label>비교 주제 (선택사항)</label>
        <input
          type="text"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="예: 경제정책, 복지, 외교, 교육"
        />
      </div>
      <button
        className="submit-btn submit-btn-full"
        onClick={compare}
        disabled={loading || !p1.trim() || !p2.trim()}
      >
        {loading ? '분석 중...' : '비교하기'}
      </button>
      {loading && <Loading />}
      {error && <div className="error-box">{error}</div>}
      {result && <div className="result-box">{result}</div>}
    </div>
  );
}
