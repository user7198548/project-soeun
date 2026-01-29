export type ErrorResponse = {
  status: number;
  error: string;
  message: string;
  path?: string;
};

export class ApiError extends Error {
  status: number;
  error?: string;
  path?: string;

  constructor(message: string, status: number, error?: string, path?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.error = error;
    this.path = path;
  }
}

function isErrorResponse(x: any): x is ErrorResponse {
  return (
    x &&
    typeof x === "object" &&
    typeof x.status === "number" &&
    typeof x.message === "string" &&
    typeof x.error === "string"
  );
}

// 서버가 text/plain이나 HTML을 주는 케이스(예: 502, 프록시/서버 오류)도 대비
async function safeReadBody(res: Response): Promise<{ text: string; json: any | null }> {
  const text = await res.text();
  try {
    return { text, json: JSON.parse(text) };
  } catch {
    return { text, json: null };
  }
}

export async function api<T>(
  url: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    credentials: "include", // 세션 쿠키 유지
  });

  // 성공이면 JSON 파싱
  if (res.ok) {
    // 204 No Content 같은 경우 대비
    if (res.status === 204) return undefined as T;

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return (await res.json()) as T;
    }
    // 혹시 JSON이 아닌 성공 응답이 오면 text로 반환(거의 없지만 안정성)
    return (await res.text()) as unknown as T;
  }

  // 실패면: 백엔드 ErrorResponse면 message를 그대로 사용
  const { text, json } = await safeReadBody(res);

  if (isErrorResponse(json)) {
    throw new ApiError(json.message, json.status, json.error, json.path);
  }

  // 스프링 기본 에러 포맷(timestamp/status/error/path)인 경우도 처리
  if (json && typeof json === "object" && typeof json.message === "string") {
    throw new ApiError(json.message, res.status, json.error, json.path);
  }

  // JSON도 아니면 text를 메시지로 사용
  throw new ApiError(text || `HTTP ${res.status}`, res.status);
}
