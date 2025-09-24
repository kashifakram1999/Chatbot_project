"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import ChatMessage from "@/components/Chat/ChatMessage";
import ChatComposer from "@/components/Chat/ChatComposer";
import RightPanel from "@/components/Chat/RightPanel";
import { CopyBtn, EditBtn, DeleteBtn, RegenerateBtn } from "@/components/Chat/MessageActions";
import { getOrCreateConversation, createUserMessage, streamReply, listMessages, createConversation, getConversation } from "@/lib/api";

type Role = "user" | "assistant";
type Msg = { id: string; role: Role; content: string };

// once-only cleanup to delete old localStorage key, in case it's there from a prior build
const LEGACY_STORAGE_KEY = "bronn_chat_v1";

export default function ChatClient() {
  const [conversationId, setConversationId] = React.useState<string | null>(null);
  const [character, setCharacter] = React.useState<string>("Bronn");
  const [messages, setMessages] = React.useState<Msg[]>([
    {
      id: "seed-hello",
      role: "assistant",
      content: "How can I help?",
    },
  ]);
  const [busy, setBusy] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  // Guard to prevent double execution under React Strict Mode in dev
  const initRef = React.useRef(false);

  // one-time: purge legacy localStorage persistence
  React.useEffect(() => {
    try { localStorage.removeItem(LEGACY_STORAGE_KEY); } catch {}
  }, []);

  // Auto-scroll on new messages
  React.useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, busy]);

  // Ensure conversation exists and hydrate from server if possible
  React.useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const pickId = params.get("c");
      const forceNew = params.get("new") === "1";
      const characterName = (params.get("character") || "Bronn").trim() || "Bronn";
      setCharacter(characterName);

      let conv: { id: string };
      if (pickId) {
        conv = { id: pickId };
        try {
          const meta = await getConversation(pickId);
          if (meta?.character) {
            setCharacter(meta.character);
            // ensure URL carries character for subsequent renders/shares
            const url = new URL(window.location.href);
            url.searchParams.set("character", meta.character);
            window.history.replaceState({}, "", url.toString());
          }
        } catch {}
      } else if (forceNew) {
        conv = await createConversation(characterName);
        // clean up the query string so refreshes don't keep creating
        const url = new URL(window.location.href);
        url.searchParams.delete("new");
        window.history.replaceState({}, "", url.toString());
      } else {
        conv = await getOrCreateConversation(characterName);
      }
      setConversationId(conv.id);

      // try to load history from backend; if endpoint doesn't exist, this returns []
      const history = await listMessages(conv.id).catch(() => []);
      if (history.length) setMessages(history);
    })().catch((e) => console.error(e));
  }, []);

  // ----- Actions -----

  async function handleSend(text: string) {
    if (!conversationId) return;

    // Persist user message on server (source of truth)
    await createUserMessage(conversationId, text);

    // Add user + placeholder assistant locally
    const userId = crypto.randomUUID();
    const asstId = crypto.randomUUID();

    setMessages((m) => [
      ...m,
      { id: userId, role: "user", content: text },
      { id: asstId, role: "assistant", content: "" },
    ]);
    setBusy(true);

    // Stream reply into the same assistant bubble
    await streamReply(
      conversationId,
      text,
      (delta) =>
        setMessages((m) =>
          m.map((x) => (x.id === asstId ? { ...x, content: x.content + delta } : x))
        ),
      () => {},
      () => setBusy(false)
    );
  }

  function copyMsg(id: string) {
    const msg = messages.find((m) => m.id === id);
    if (msg) navigator.clipboard.writeText(msg.content);
  }

  async function regenerateAssistant(asstId: string) {
    if (!conversationId) return;
    const idx = messages.findIndex((m) => m.id === asstId);
    if (idx <= 0 || messages[idx].role !== "assistant") return;
    const prevUser = messages[idx - 1];
    if (!prevUser || prevUser.role !== "user") return;

    setMessages((m) => m.map((x) => (x.id === asstId ? { ...x, content: "" } : x)));
    setBusy(true);
    await streamReply(
      conversationId,
      prevUser.content,
      (delta) =>
        setMessages((m) =>
          m.map((x) => (x.id === asstId ? { ...x, content: x.content + delta } : x))
        ),
      () => {},
      () => setBusy(false)
    );
  }

  function deleteMsg(id: string) {
    const idx = messages.findIndex((m) => m.id === id);
    if (idx === -1) return;
    const target = messages[idx];

    if (target.role === "user") {
      const next = messages[idx + 1];
      const removeIds = next && next.role === "assistant" ? [target.id, next.id] : [target.id];
      setMessages((m) => m.filter((x) => !removeIds.includes(x.id)));
    } else {
      setMessages((m) => m.filter((x) => x.id !== id));
    }
  }

  function startEdit(userId: string) {
    const msg = messages.find((m) => m.id === userId);
    if (!msg || msg.role !== "user") return;
    setEditingId(userId);
  }

  async function saveEdit(userId: string, newText: string) {
    if (!conversationId) return;
    const idx = messages.findIndex((m) => m.id === userId);
    if (idx === -1 || messages[idx].role !== "user") return;
    const nextIsAssistant = messages[idx + 1]?.role === "assistant";
    const asstId = nextIsAssistant ? messages[idx + 1].id : null;

    setMessages((m) =>
      m.map((x) => {
        if (x.id === userId) return { ...x, content: newText };
        if (asstId && x.id === asstId) return { ...x, content: "" };
        return x;
      })
    );
    setEditingId(null);

    if (asstId) {
      setBusy(true);
      await streamReply(
        conversationId,
        newText,
        (delta) =>
          setMessages((m) =>
            m.map((x) => (x.id === asstId ? { ...x, content: x.content + delta } : x))
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
          title={`${character} Chat`}
          actions={
            <button className="badge hover:opacity-80" onClick={clearAll}>
              Clear
            </button>
          }
        >
          <Card className="p-0">
            <div ref={listRef} className="max-h-[62vh] overflow-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isEditing = editingId === msg.id && msg.role === "user";
                return (
                  <ChatMessage
                    key={msg.id}
                    role={msg.role}
                    content={msg.content}
                    assistantInitial={character?.[0] ?? "B"}
                    editing={isEditing}
                    onEditChange={(v) =>
                      setMessages((m) =>
                        m.map((x) => (x.id === msg.id ? { ...x, content: v } : x))
                      )
                    }
                    onEditKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        const val = (e.target as HTMLTextAreaElement).value.trim();
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
                        <RegenerateBtn onClick={() => regenerateAssistant(msg.id)} />
                      </>
                    )}
                  </ChatMessage>
                );
              })}
              {busy && (
                <div className="text-xs text-muted px-4 pb-4 animate-pulse-soft">
                  {character} is thinking…
                </div>
              )}
            </div>
          </Card>
        </Section>

        <ChatComposer onSend={handleSend} character={character} />
      </div>

      <div className="hidden lg:block">
        <RightPanel />
      </div>
    </>
  );
}
