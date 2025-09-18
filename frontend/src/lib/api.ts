import { fetchAuth } from "./auth";

const API = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/+$/, "");

// Conversations
export async function getOrCreateConversation(character = "Bronn"): Promise<{ id: string }> {
  // list
  let r = await fetchAuth(`${API}/conversations`, { method: "GET" });
  if (!r.ok) throw new Error("Failed to list conversations");
  const page = await r.json();
  if (page?.results?.length) return { id: page.results[0].id };

  // create
  r = await fetchAuth(`${API}/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ character }),
  });
  if (!r.ok) throw new Error("Failed to create conversation");
  return await r.json();
}

export async function createUserMessage(conversationId: string, content: string) {
  const r = await fetchAuth(`${API}/conversations/${conversationId}/messages/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!r.ok) throw new Error("Failed to create user message");
  return await r.json();
}

// SSE stream: we still open with current token; if it 401s up-front, fetchAuth will refresh & retry.
// (If the token expires mid-stream, the connection will drop; user can hit regenerate.)
export async function streamReply(
  conversationId: string,
  prompt: string,
  onChunk: (text: string) => void,
  onStart?: (messageId: string) => void,
  onEnd?: () => void,
) {
  // We can’t (easily) reuse fetchAuth streaming because we need the Response.body reader.
  // So we do a manual refresh-once here.
  const open = async (): Promise<Response> => {
    return await fetch(`${API}/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await getAuthHeader()),
      },
      body: JSON.stringify({ conversation_id: conversationId, prompt, create_user_message: false }),
    });
  };

  let res = await open();
  if (res.status === 401) {
    // try refresh once
    const { refreshAccessToken } = await import("./auth");
    const ok = await refreshAccessToken();
    if (!ok) throw new Error("Unauthorized");
    res = await open();
  }
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

async function getAuthHeader(): Promise<Record<string, string>> {
  const { getAccessToken } = await import("./auth");
  const t = getAccessToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}
