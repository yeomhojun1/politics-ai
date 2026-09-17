// SDK/네트워크 오류를 사용자용 한국어 메시지로 변환한다.
// 영문 원문(예: "Could not resolve authentication method...")이 그대로 노출되지 않도록 한다.
// 외부 호출 없이 순수 함수라 단위 테스트가 가능하다.

/**
 * @param {unknown} e 잡힌 예외
 * @param {boolean} hasKey ANTHROPIC_API_KEY 설정 여부
 * @returns {{status: number, error: string}}
 */
export function mapLlmError(e, hasKey) {
  const raw = String(e?.message || '');
  const status = e?.status;

  if (!hasKey || status === 401 || /authentication|api\s?key|apikey|authtoken/i.test(raw)) {
    return {
      status: 503,
      error: 'AI 기능이 설정되지 않았습니다. backend/.env 에 ANTHROPIC_API_KEY 를 설정한 뒤 서버를 다시 시작해주세요.'
    };
  }
  if (status === 429 || /rate.?limit/i.test(raw)) {
    return { status: 429, error: '요청이 많아 잠시 처리할 수 없습니다. 잠시 후 다시 시도해주세요.' };
  }
  if (status === 400) {
    return { status: 400, error: '입력 내용을 AI가 처리할 수 없습니다. 내용을 줄이거나 바꿔서 다시 시도해주세요.' };
  }
  if (/timeout|abort|ECONNRESET|ENOTFOUND|ECONNREFUSED|fetch failed/i.test(raw)) {
    return { status: 504, error: 'AI 서버에 연결하지 못했습니다. 네트워크 상태를 확인한 뒤 다시 시도해주세요.' };
  }
  return { status: 502, error: 'AI 응답을 받지 못했습니다. 잠시 후 다시 시도해주세요.' };
}

/** 본문 파싱 계열 오류를 JSON 응답으로 변환. 해당 없으면 null. */
export function mapBodyError(err) {
  if (err?.type === 'entity.too.large') {
    return { status: 413, error: '요청 본문이 너무 큽니다. 내용을 줄여서 다시 시도해주세요.' };
  }
  if (err?.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    return { status: 400, error: '잘못된 JSON 형식입니다. 요청 본문을 확인해주세요.' };
  }
  return null;
}
