import { authHeaders } from "./auth";

const RAW_API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
const _base = RAW_API.replace(/\/+$/, "");
const API = _base.endsWith("/api") ? _base : `${_base}/api`;

// ---- Conversations ----

export async function getOrCreateConversation(
  character = "Bronn"
): Promise<{ id: string }> {
  // Try latest existing conversation for now (you can add proper list/choose later)
  const list = await fetch(`${API}/conversations`, { headers: authHeaders() });
  if (!list.ok) throw new Error("Failed to list conversations");
  const page = await list.json();
  if (page?.results?.length) return { id: page.results[0].id };

  const r = await fetch(`${API}/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ character }),
  });
  if (!r.ok) throw new Error("Failed to create conversation");
  return await r.json();
}

export async function createUserMessage(
  conversationId: string,
  content: string
) {
  const r = await fetch(
    `${API}/conversations/${conversationId}/messages/create`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ content }),
    }
  );
  if (!r.ok) throw new Error("Failed to create user message");
  return await r.json(); // {id, role, content, ...}
}

// ---- Streaming (SSE) ----
// Backend emits:
//  event: start   data: {"message_id": "<uuid>", "ts": ...}
//  event: token   data: {"delta": "..."}
//  event: end     data: {"ts": ...}
export async function streamReply(
  conversationId: string,
  prompt: string,
  onChunk: (text: string) => void,
  onStart?: (messageId: string) => void,
  onEnd?: () => void
) {
  const res = await fetch(`${API}/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({
      conversation_id: conversationId,
      prompt,
      create_user_message: false,
    }),
  });
  if (!res.ok || !res.body) throw new Error("Failed to open stream");

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buf = "";

  const flush = (block: string) => {
    // multiple SSE events may be in a block
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
