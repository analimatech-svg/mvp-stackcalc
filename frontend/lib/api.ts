import { Session, Artifact, SSEEvent } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

export const api = {
  sessions: {
    list: () => request<Session[]>('/api/sessions'),
    get: (id: string) => request<Session>(`/api/sessions/${id}`),
    create: (title?: string, locale = 'pt-BR') =>
      request<Session>('/api/sessions', {
        method: 'POST',
        body: JSON.stringify({ title, locale }),
      }),
    advance: (id: string, to_phase: string) =>
      request(`/api/sessions/${id}/advance`, {
        method: 'POST',
        body: JSON.stringify({ to_phase }),
      }),
    artifacts: (id: string) =>
      request<Artifact[]>(`/api/sessions/${id}/artifacts`),
  },
};

export async function* streamChat(
  sessionId: string,
  message: string,
  context?: Record<string, unknown>,
  locale = 'pt-BR',
): AsyncGenerator<SSEEvent> {
  const res = await fetch(`${API_BASE}/api/sessions/${sessionId}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ message, context, locale }),
  });

  if (!res.ok) throw new Error(`Chat failed: ${res.statusText}`);
  if (!res.body) throw new Error('No response body');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();
        if (data === '[DONE]') return;
        try {
          yield JSON.parse(data) as SSEEvent;
        } catch {
          // ignore malformed lines
        }
      }
    }
  }
}
