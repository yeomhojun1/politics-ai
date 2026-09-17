import test from 'node:test';
import assert from 'node:assert/strict';
import { mapLlmError, mapBodyError } from '../errors.js';

// 외부 호출이 전혀 없는 순수 함수 테스트 (API 키 불필요, 과금 없음)

test('mapLlmError: 키가 없으면 503 + 한국어 안내, 영문 원문은 노출하지 않는다', () => {
  const sdkErr = new Error('Could not resolve authentication method. Expected either apiKey or authToken to be set.');
  const r = mapLlmError(sdkErr, false);
  assert.equal(r.status, 503);
  assert.match(r.error, /ANTHROPIC_API_KEY/);
  assert.doesNotMatch(r.error, /authentication|apiKey/i);

  // 키가 있어도 인증 오류 문구면 같은 처리
  assert.equal(mapLlmError(sdkErr, true).status, 503);
  assert.equal(mapLlmError(Object.assign(new Error('x'), { status: 401 }), true).status, 503);
});

test('mapLlmError: 상태코드별 분기 (429 / 400 / 네트워크 / 기타)', () => {
  assert.equal(mapLlmError(Object.assign(new Error('rate limit'), { status: 429 }), true).status, 429);
  assert.equal(mapLlmError(Object.assign(new Error('bad request'), { status: 400 }), true).status, 400);
  assert.equal(mapLlmError(new Error('fetch failed'), true).status, 504);
  assert.equal(mapLlmError(new Error('Request timeout'), true).status, 504);
  assert.equal(mapLlmError(Object.assign(new Error('boom'), { status: 500 }), true).status, 502);
});

test('mapLlmError: 모든 메시지가 한국어이며 원문 문자열을 포함하지 않는다', () => {
  const cases = [
    [new Error('Could not resolve authentication method'), false],
    [Object.assign(new Error('Overloaded'), { status: 529 }), true],
    [Object.assign(new Error('rate_limit_error'), { status: 429 }), true],
    [undefined, true],
    [null, true]
  ];
  for (const [e, hasKey] of cases) {
    const r = mapLlmError(e, hasKey);
    assert.ok(/[가-힣]/.test(r.error), '한국어 메시지여야 함');
    assert.ok(r.status >= 400 && r.status < 600);
    if (e?.message) assert.ok(!r.error.includes(e.message), '원문 노출 금지');
  }
});

test('mapBodyError: 과대 본문 413, 잘못된 JSON 400, 그 외는 null (버그 6)', () => {
  assert.deepEqual(mapBodyError({ type: 'entity.too.large' }), {
    status: 413, error: '요청 본문이 너무 큽니다. 내용을 줄여서 다시 시도해주세요.'
  });
  assert.equal(mapBodyError({ type: 'entity.parse.failed' }).status, 400);
  assert.equal(mapBodyError(new SyntaxError('Unexpected token b in JSON')).status, 400);
  assert.equal(mapBodyError(new Error('그 밖의 오류')), null);
  assert.equal(mapBodyError(undefined), null);
});
