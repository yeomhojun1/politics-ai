import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import { config } from 'dotenv';

config();

const app = express();
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }));
app.use(express.json());

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-sonnet-4-6';
const BASE = '당신은 한국 정치 전문가 AI "정CHPT"입니다. 항상 한국어로 답변하고, 객관적이고 균형 잡힌 시각을 유지하세요. 특정 정당이나 정치인을 편향되게 지지하거나 비판하지 마세요.';

app.get('/api/health', (_, res) => res.json({ ok: true }));

// 1. 정치인 정보 검색
app.post('/api/politician', async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: '정치인 이름을 입력해주세요.' });
  try {
    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: BASE + ' 정치인 정보 요청 시: ① 소속 정당 ② 현재 직책 ③ 주요 경력 ④ 핵심 정책 ⑤ 주요 이슈 순으로 체계적으로 정리하세요.',
      messages: [{ role: 'user', content: `"${name.trim()}"에 대해 자세히 알려주세요.` }]
    });
    res.json({ result: msg.content[0].text });
  } catch (e) {
    res.status(500).json({ error: 'API 오류: ' + e.message });
  }
});

// 2. 정책 비교
app.post('/api/policy-compare', async (req, res) => {
  const { politician1, politician2, topic } = req.body;
  if (!politician1?.trim() || !politician2?.trim()) {
    return res.status(400).json({ error: '두 정치인의 이름을 모두 입력해주세요.' });
  }
  try {
    const topicText = topic?.trim() ? `"${topic}" 주제에서의 ` : '';
    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2000,
      system: BASE + ' 정책 비교 시 두 정치인의 입장을 항목별로 명확하게 대조하고, 각각의 장단점을 균형 있게 서술하세요.',
      messages: [{
        role: 'user',
        content: `"${politician1.trim()}"와 "${politician2.trim()}"의 ${topicText}정책 입장을 비교 분석해주세요.`
      }]
    });
    res.json({ result: msg.content[0].text });
  } catch (e) {
    res.status(500).json({ error: 'API 오류: ' + e.message });
  }
});

// 3. 뉴스 요약
app.post('/api/news-summary', async (req, res) => {
  const { newsText } = req.body;
  if (!newsText?.trim()) return res.status(400).json({ error: '뉴스 내용을 입력해주세요.' });
  try {
    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1000,
      system: BASE + ' 뉴스 분석 시: ① 핵심 사실 요약 ② 정치적 의미 분석 ③ 향후 전망 순으로 간결하게 정리하세요.',
      messages: [{ role: 'user', content: `다음 뉴스를 분석해주세요:\n\n${newsText.trim()}` }]
    });
    res.json({ result: msg.content[0].text });
  } catch (e) {
    res.status(500).json({ error: 'API 오류: ' + e.message });
  }
});

// 4. 챗봇
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  if (!messages?.length) return res.status(400).json({ error: '메시지가 없습니다.' });
  try {
    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2000,
      system: BASE + ' 한국 정치에 관한 모든 질문에 친절하고 상세하게 답변하세요. 정치인, 정책, 선거, 법안, 정당, 국회 등 모든 정치 관련 주제를 다룹니다.',
      messages
    });
    res.json({ result: msg.content[0].text });
  } catch (e) {
    res.status(500).json({ error: 'API 오류: ' + e.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`서버 실행 중: http://localhost:${PORT}`));
