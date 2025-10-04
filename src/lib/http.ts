// Lightweight fetch helpers with retry/backoff & JSON parsing

export interface FetchRetryOptions {
  retries?: number;
  backoffMs?: number;
  retryOn?: number[]; // status codes
  timeoutMs?: number;
  cacheKey?: string;
  cacheTtlMs?: number; // localStorage cache TTL
}

export async function fetchWithRetry(url: string, opts: RequestInit = {}, retry: FetchRetryOptions = {}) {
  const { retries = 2, backoffMs = 500, retryOn = [429, 500, 502, 503, 504], timeoutMs = 15000, cacheKey, cacheTtlMs } = retry;

  if (cacheKey && cacheTtlMs) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.time < cacheTtlMs) {
          return new Response(new Blob([JSON.stringify(parsed.data)]), { status: 200 });
        } else {
          localStorage.removeItem(cacheKey);
        }
      } catch { /* ignore */ }
    }
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(url, { ...opts, signal: controller.signal });
      clearTimeout(t);
      if (retryOn.includes(res.status) && attempt < retries) {
        await new Promise(r => setTimeout(r, backoffMs * (attempt + 1)));
        continue;
      }
      if (!res.ok) return res;
      if (cacheKey && cacheTtlMs) {
        try {
          const clone = res.clone();
          const data = await clone.json();
          localStorage.setItem(cacheKey, JSON.stringify({ time: Date.now(), data }));
          return new Response(new Blob([JSON.stringify(data)]), { status: 200 });
        } catch { /* ignore cache failure */ }
      }
      return res;
    } catch (e) {
      if (attempt === retries) throw e;
      await new Promise(r => setTimeout(r, backoffMs * (attempt + 1)));
    }
  }
  throw new Error('fetchWithRetry exhausted');
}

export async function getJson<T>(url: string, opts?: RequestInit, retry?: FetchRetryOptions): Promise<T> {
  const res = await fetchWithRetry(url, opts, retry);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}
