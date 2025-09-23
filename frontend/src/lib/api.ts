// src/lib/api.ts
import { fetchAuth } from "./auth";

// We call our Next proxies so cookies -> Authorization happens server-side.
const API_DJ = "/api/dj";

export type ConversationSummary = {
  id: string;
  title: string;
  character: string;
  created_at?: string;
  updated_at?: string;
};

export async function listConversations(): Promise<ConversationSummary[]> {
  const r = await fetchAuth(`${API_DJ}/conversations`, { method: "GET" });
  if (!r.ok) throw new Error("Failed to list conversations");
  const page = await r.json();
  const arr = Array.isArray(page) ? page : (page?.results ?? []);
  return arr.map((c: any) => ({
    id: String(c.id),
    title: String(c.title ?? ""),
    character: String(c.character ?? "Bronn"),
    created_at: c.created_at,
    updated_at: c.updated_at,
  }));
}

export async function createConversation(character = "Bronn"): Promise<{ id: string } & ConversationSummary> {
  const r = await fetchAuth(`${API_DJ}/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ character }),
  });
  if (!r.ok) throw new Error("Failed to create conversation");
  const c = await r.json();
  return {
    id: String(c.id),
    title: String(c.title ?? ""),
    character: String(c.character ?? character),
    created_at: c.created_at,
    updated_at: c.updated_at,
  };
}

export async function updateConversationTitle(id: string, title: string): Promise<void> {
  async function attempt(url: string) {
    const res = await fetchAuth(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    return res;
  }

  let r = await attempt(`${API_DJ}/conversations/${id}`);
  if (!r.ok && (r.status === 404 || r.status === 405)) {
    r = await attempt(`${API_DJ}/conversations/${id}/`);
  }
  if (!r.ok) {
    let msg = "Failed to update title";
    try { const j = await r.json(); msg = j?.detail || msg; } catch {}
    throw new Error(msg);
  }
}

export async function getOrCreateConversation(character = "Bronn"): Promise<{ id: string }> {
  // list existing
  let r = await fetchAuth(`${API_DJ}/conversations`, { method: "GET" });
  if (!r.ok) throw new Error("Failed to list conversations");
  const page = await r.json();
  if (page?.results?.length) return { id: page.results[0].id };

  // create new
  r = await fetchAuth(`${API_DJ}/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ character }),
  });
  if (!r.ok) throw new Error("Failed to create conversation");
  return await r.json();
}

export async function createUserMessage(conversationId: string, content: string) {
  const r = await fetchAuth(`${API_DJ}/conversations/${conversationId}/messages/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!r.ok) throw new Error("Failed to create user message");
  return await r.json();
}

// Streaming reply uses our Next streaming proxy /api/chat
export async function streamReply(
  conversationId: string,
  prompt: string,
  onChunk: (text: string) => void,
  onStart?: (messageId: string) => void,
  onEnd?: () => void,
) {
  const res = await fetch(`/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ conversation_id: conversationId, prompt, create_user_message: false }),
  });
  if (!res.ok || !res.body) throw new Error("Failed to open stream");

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buf = "";

  const flush = (block: string) => {
    const events = block.split("\n\n").filter(Boolean);
    for (const raw of events) {
      const lines = raw.split("\n");
      let event = "message";
      let data = "";
      for (const ln of lines) {
        if (ln.startsWith("event:")) event = ln.slice(6).trim();
        if (ln.startsWith("data:")) data += ln.slice(5).trim();
      }
      if (!data) continue;
      try {
        const j = JSON.parse(data);
        if (event === "start" && j.message_id) onStart?.(j.message_id);
        if (event === "token" && typeof j.delta === "string") onChunk(j.delta);
        if (event === "end") onEnd?.();
      } catch {
        if (event === "token") onChunk(data);
      }
    }
  };

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const parts = buf.split("\n\n");
    buf = parts.pop() || "";
    for (const p of parts) flush(p);
  }
  if (buf) flush(buf);
}

// list existing messages for a conversation (adjust the shape if your API differs)
export async function listMessages(conversationId: string): Promise<Array<{ id: string; role: "user"|"assistant"; content: string }>> {
  const r = await fetchAuth(`/api/dj/conversations/${conversationId}/messages`, { method: "GET" });
  if (!r.ok) {
    // If your backend doesn't have this endpoint yet, just return empty; the UI still works.
    return [];
  }
  const data = await r.json();
  // Expected either { results: [...] } or an array
  const arr = Array.isArray(data) ? data : (data?.results ?? []);
  // Map to the Msg shape used by the Chat UI
  return arr.map((m: any) => ({
    id: m.id ?? crypto.randomUUID(),
    role: m.role === "assistant" ? "assistant" : "user",
    content: String(m.content ?? ""),
  }));
}
