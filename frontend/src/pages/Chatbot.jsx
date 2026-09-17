import { useState, useRef, useEffect } from 'react';
import { API } from '../config';

const GREETING = { role: 'assistant', content: '안녕하세요! 저는 정CHPT입니다.\n한국 정치에 관한 질문이 있으시면 무엇이든 물어보세요.', local: true };

export default function Chatbot() {
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const apiMessages = updatedMessages
        .filter(m => !m.local)
        .map(({ role, content }) => ({ role, content }));

      const res = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages(prev => [...prev, { role: 'assistant', content: data.result }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: `오류: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="chat-container">
      <h1 className="page-title">정치 챗봇</h1>
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.role === 'user' ? 'user' : 'ai'}`}>
            <span className="chat-label">{msg.role === 'user' ? '나' : '정CHPT'}</span>
            <div className="chat-bubble">{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div className="chat-msg ai">
            <span className="chat-label">정CHPT</span>
            <div className="chat-bubble" style={{ color: 'var(--text-muted)' }}>답변 생성 중...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="chat-input-row">
        <textarea
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="한국 정치에 관해 질문하세요... (Enter로 전송, Shift+Enter 줄바꿈)"
          rows={1}
        />
        <button className="submit-btn" onClick={send} disabled={loading || !input.trim()}>
          전송
        </button>
      </div>
    </div>
  );
}
