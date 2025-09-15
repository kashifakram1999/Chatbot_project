import { API_BASE } from "./api";
import { getAccess } from "./auth";

export async function streamReply({
  conversationId, prompt, createUserMessage = true,
  onStart, onToken, onEnd,
}: {
  conversationId: string;
  prompt: string;
  createUserMessage?: boolean;
  onStart?: (assistantMessageId: string | number) => void;
  onToken?: (delta: string) => void;
  onEnd?: () => void;
}) {
  const res = await fetch(`${API_BASE}/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type":"application/json",
      "Accept":"text/event-stream",
      "Authorization": `Bearer ${getAccess()}`
    },
    body: JSON.stringify({ conversation_id: conversationId, prompt, create_user_message: createUserMessage }),
  });
  if (!res.ok || !res.body) throw new Error(`Stream failed: ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buffer.indexOf("\n\n")) >= 0) {
      const raw = buffer.slice(0, idx).trim(); buffer = buffer.slice(idx + 2);
      if (!raw) continue;
      let event: string | null = null, dataStr = "";
      for (const line of raw.split("\n")) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        if (line.startsWith("data:"))  dataStr += line.slice(5).trim();
      }
      if (!dataStr) continue;
      try {
        const data = JSON.parse(dataStr);
        if (event === "start") onStart?.(data.message_id);
        else if (event === "token" && data.delta) onToken?.(data.delta);
        else if (event === "end") onEnd?.();
      } catch {}
    }
  }
  onEnd?.();
}
