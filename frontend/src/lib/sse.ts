// Cookie-first SSE open helper (no Authorization header)
export function openSSE(url: string, onMessage: (ev: MessageEvent) => void, onError?: (e: Event) => void) {
  const es = new EventSource(url, { withCredentials: true } as any);
  es.onmessage = onMessage;
  if (onError) es.onerror = onError;
  return es;
}
