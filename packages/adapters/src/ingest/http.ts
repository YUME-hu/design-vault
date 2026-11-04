/**
 * 外部请求统一入口：超时 + 重试（最多 2 次，指数退避）。
 * 所有适配器都走这里，方便在测试里注入假的 fetch。
 */

export const DEFAULT_TIMEOUT_MS = 10_000;
export const MAX_RETRIES = 2;

export type HttpResult = {
  ok: boolean;
  status: number;
  text: string;
  error?: string;
  headers?: Headers;
};

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type FetchTextOptions = {
  timeoutMs?: number;
  retries?: number;
  fetchImpl?: typeof fetch;
  /** 退避基数，测试里可以调成 0 */
  backoffMs?: number;
};

export async function fetchText(
  url: string,
  init: RequestInit = {},
  options: FetchTextOptions = {},
): Promise<HttpResult> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retries = options.retries ?? MAX_RETRIES;
  const fetchImpl = options.fetchImpl ?? fetch;
  const backoffMs = options.backoffMs ?? 300;

  let lastError = "";
  let lastStatus = 0;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetchImpl(url, { ...init, signal: controller.signal });
      const text = await response.text();

      if (response.status === 429 || response.status >= 500) {
        lastError = `HTTP ${response.status}`;
        lastStatus = response.status;
      } else {
        return {
          ok: response.ok,
          status: response.status,
          text,
          headers: response.headers,
        };
      }
    } catch (error) {
      const aborted = (error as Error).name === "AbortError";
      lastError = aborted ? `请求超时（${timeoutMs}ms）` : (error as Error).message;
      lastStatus = 0;
    } finally {
      clearTimeout(timer);
    }

    if (attempt < retries) {
      await sleep(backoffMs * 2 ** attempt);
    }
  }

  return { ok: false, status: lastStatus, text: "", error: lastError };
}
