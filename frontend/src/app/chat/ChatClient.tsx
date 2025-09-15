"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import ChatMessage from "@/components/Chat/ChatMessage";
import ChatComposer from "@/components/Chat/ChatComposer";
import RightPanel from "@/components/Chat/RightPanel";
import {
  CopyBtn,
  EditBtn,
  DeleteBtn,
  RegenerateBtn,
} from "@/components/Chat/MessageActions";
import {
  getOrCreateConversation,
  createUserMessage,
  streamReply,
} from "@/lib/api";

type Role = "user" | "assistant";
type Msg = { id: string; role: Role; content: string };

const STORAGE_KEY = "bronn_chat_v1";

export default function ChatClient() {
  const [conversationId, setConversationId] = React.useState<string | null>(
    null
  );
  const [messages, setMessages] = React.useState<Msg[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw
        ? (JSON.parse(raw) as Msg[])
        : [
            {
              id: "seed-hello",
              role: "assistant",
              content:
                "A sellsword’s wit is worth as much as his sword. How can I help?",
            },
          ];
    } catch {
      return [];
    }
  });
  const [busy, setBusy] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Persist to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Auto-scroll on new messages
  React.useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length, busy]);

  // Ensure we have a conversation (defaults to character "Bronn" on the server)
  React.useEffect(() => {
    (async () => {
      const conv = await getOrCreateConversation("Bronn");
      setConversationId(conv.id);
    })().catch((e) => console.error(e));
  }, []);

  // ----- Actions -----

  async function handleSend(text: string) {
    if (!conversationId) return;

    // 1) Persist the user message server-side (no duplication)
    await createUserMessage(conversationId, text);

    // 2) Add the user + placeholder assistant locally
    const userId = crypto.randomUUID();
    const asstId = crypto.randomUUID();

    setMessages((m) => [
      ...m,
      { id: userId, role: "user", content: text },
      { id: asstId, role: "assistant", content: "" },
    ]);
    setBusy(true);

    // 3) Stream assistant tokens into the SAME assistant bubble
    await streamReply(
      conversationId,
      text,
      (delta) =>
        setMessages((m) =>
          m.map((x) =>
            x.id === asstId ? { ...x, content: x.content + delta } : x
          )
        ),
      () => {}, // onStart (server gives real message_id; UI keeps its id)
      () => setBusy(false)
    );
  }

  function copyMsg(id: string) {
    const msg = messages.find((m) => m.id === id);
    if (msg) navigator.clipboard.writeText(msg.content);
  }

  // Regenerate the assistant reply IN PLACE (reuse the same bubble)
  async function regenerateAssistant(asstId: string) {
    if (!conversationId) return;
    const idx = messages.findIndex((m) => m.id === asstId);
    if (idx <= 0 || messages[idx].role !== "assistant") return;
    const prevUser = messages[idx - 1];
    if (!prevUser || prevUser.role !== "user") return;

    // Clear this assistant bubble and stream again
    setMessages((m) =>
      m.map((x) => (x.id === asstId ? { ...x, content: "" } : x))
    );
    setBusy(true);

    await streamReply(
      conversationId,
      prevUser.content,
      (delta) =>
        setMessages((m) =>
          m.map((x) =>
            x.id === asstId ? { ...x, content: x.content + delta } : x
          )
        ),
      () => {},
      () => setBusy(false)
    );
  }

  // Delete message; if it's a user message, also delete the assistant immediately after it
  function deleteMsg(id: string) {
    const idx = messages.findIndex((m) => m.id === id);
    if (idx === -1) return;
    const target = messages[idx];

    if (target.role === "user") {
      const next = messages[idx + 1];
      const removeIds =
        next && next.role === "assistant" ? [target.id, next.id] : [target.id];
      setMessages((m) => m.filter((x) => !removeIds.includes(x.id)));
    } else {
      setMessages((m) => m.filter((x) => x.id !== id));
    }
  }

  // Begin inline edit for a user bubble
  function startEdit(userId: string) {
    const msg = messages.find((m) => m.id === userId);
    if (!msg || msg.role !== "user") return;
    setEditingId(userId);
  }

  // Save inline edit; reuse the SAME assistant bubble (if any) and regenerate in place
  async function saveEdit(userId: string, newText: string) {
    if (!conversationId) return;

    const idx = messages.findIndex((m) => m.id === userId);
    if (idx === -1 || messages[idx].role !== "user") return;
    const nextIsAssistant = messages[idx + 1]?.role === "assistant";
    const asstId = nextIsAssistant ? messages[idx + 1].id : null;

    // Update user text locally; clear the assistant content (if present)
    setMessages((m) =>
      m.map((x) => {
        if (x.id === userId) return { ...x, content: newText };
        if (asstId && x.id === asstId) return { ...x, content: "" };
        return x;
      })
    );
    setEditingId(null);

    // If there's an assistant bubble after it, regenerate in place
    if (asstId) {
      setBusy(true);
      await streamReply(
        conversationId,
        newText,
        (delta) =>
          setMessages((m) =>
            m.map((x) =>
              x.id === asstId ? { ...x, content: x.content + delta } : x
            )
          ),
        () => {},
        () => setBusy(false)
      );
    }
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function clearAll() {
    setMessages([]);
  }

  // ----- UI -----

  return (
    <>
      <div className="space-y-4">
        <Section
          title="Bronn Chat"
          actions={
            <button className="badge hover:opacity-80" onClick={clearAll}>
              Clear
            </button>
          }
        >
          <Card className="p-0">
            <div
              ref={listRef}
              className="max-h-[62vh] overflow-auto p-4 space-y-4"
            >
              {messages.map((msg) => {
                const isEditing = editingId === msg.id && msg.role === "user";
                return (
                  <ChatMessage
                    key={msg.id}
                    role={msg.role}
                    content={msg.content}
                    editing={isEditing}
                    onEditChange={(v) =>
                      setMessages((m) =>
                        m.map((x) =>
                          x.id === msg.id ? { ...x, content: v } : x
                        )
                      )
                    }
                    onEditKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        const val = (
                          e.target as HTMLTextAreaElement
                        ).value.trim();
                        if (val) void saveEdit(msg.id, val);
                        else cancelEdit();
                      }
                      if (e.key === "Escape") cancelEdit();
                    }}
                  >
                    {msg.role === "user" ? (
                      <>
                        <CopyBtn onClick={() => copyMsg(msg.id)} />
                        <EditBtn onClick={() => startEdit(msg.id)} />
                        <DeleteBtn onClick={() => deleteMsg(msg.id)} />
                      </>
                    ) : (
                      <>
                        <CopyBtn onClick={() => copyMsg(msg.id)} />
                        <RegenerateBtn
                          onClick={() => regenerateAssistant(msg.id)}
                        />
                      </>
                    )}
                  </ChatMessage>
                );
              })}
              {busy && (
                <div className="text-xs text-muted px-4 pb-4 animate-pulse-soft">
                  Bronn is thinking…
                </div>
              )}
            </div>
          </Card>
        </Section>

        <ChatComposer onSend={handleSend} />
      </div>

      <div className="hidden lg:block">
        <RightPanel />
      </div>
    </>
  );
}
