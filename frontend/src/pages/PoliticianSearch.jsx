import { useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function Loading() {
  return <div className="loading"><div className="spinner" />AI가 분석 중입니다...</div>;
}

export default function PoliticianSearch() {
  const [name, setName] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = async () => {
    if (!name.trim() || loading) return;
    setLoading(true);
    setError('');
    setResult('');
    try {
      const res = await fetch(`${API}/api/politician`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() })
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
      <h1 className="page-title">정치인 검색</h1>
      <div className="form-group">
        <label>정치인 이름을 입력하세요</label>
        <div className="input-row">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="예: 이재명, 한동훈, 윤석열"
          />
          <button className="submit-btn" onClick={search} disabled={loading || !name.trim()}>
            {loading ? '검색 중' : '검색'}
          </button>
        </div>
      </div>
      {loading && <Loading />}
      {error && <div className="error-box">{error}</div>}
      {result && <div className="result-box">{result}</div>}
    </div>
  );
}
