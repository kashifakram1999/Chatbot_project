"use client";

import RequireAuth from "@/components/auth/RequireAuth";
import Link from "next/link";
import {
  listConversations,
  updateConversationTitle,
  deleteConversationsByCharacter,
} from "@/lib/api";
import { Card, CardBody } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import * as React from "react";
import { useSearchParams } from "next/navigation";
import DeleteConversationButton from "@/components/Chat/DeleteConversationButton";

export default function AllChatsPage() {
  return (
    <RequireAuth>
      <React.Suspense fallback={<ChatsFallback />}>
        <ChatsContent />
      </React.Suspense>
    </RequireAuth>
  );
}

function ChatsContent() {
  const [items, setItems] = React.useState<
    Array<{ id: string; title: string; character: string }>
  >([]);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);
  const search = useSearchParams();
  const character = (search.get("character") || "").trim();

  React.useEffect(() => {
    listConversations()
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  const grouped = React.useMemo(() => {
    if (character) return null;
    const map = new Map<string, { id: string; title: string; character: string }[]>();
    for (const c of items) {
      const arr = map.get(c.character) || [];
      arr.push(c);
      map.set(c.character, arr);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [items, character]);

  return (
    <Section title={character ? `${character} Chats` : "All Chats"}>
      {character ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {error ? (
            <Card>
              <CardBody className="p-6 text-red-400">{error}</CardBody>
            </Card>
          ) : items.length === 0 ? (
            <Card>
              <CardBody className="p-6 text-muted">No conversations yet.</CardBody>
            </Card>
          ) : (
            <>
              <div className="sm:col-span-2 lg:col-span-3 -mt-2 -mb-2">
                <Link href={`/chat?new=1&character=${encodeURIComponent(character)}`}>
                  <Button size="sm">New Chat</Button>
                </Link>
              </div>
              {items
                .filter((x) => x.character === character)
                .map((c) => (
                  <Card key={c.id}>
                    <CardBody className="p-5 space-y-2">
                      <div className="text-sm text-muted">{c.character}</div>
                      {editingId === c.id ? (
                        <input
                          className="w-full rounded-md border border-[var(--border)] bg-card px-2 py-1 text-sm"
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          onKeyDown={async (e) => {
                            if (e.key === "Enter") {
                              const name = draft.trim();
                              if (name) {
                                try {
                                  setError(null);
                                  await updateConversationTitle(c.id, name);
                                  setItems((arr) =>
                                    arr.map((x) =>
                                      x.id === c.id ? { ...x, title: name } : x
                                    )
                                  );
                                } catch (err: any) {
                                  setError(err?.message || "Failed to update title");
                                }
                              }
                              setEditingId(null);
                            }
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          autoFocus
                        />
                      ) : (
                        <div
                          className="font-medium truncate cursor-text"
                          title={c.title || `${c.character} — ${c.id}`}
                          onDoubleClick={() => {
                            setEditingId(c.id);
                            setDraft(c.title || "");
                          }}
                        >
                          {c.title || `${c.character} — ${c.id}`}
                        </div>
                      )}
                      <div className="flex items-center gap-2 pt-1">
                        <Link
                          href={`/chat?c=${encodeURIComponent(c.id)}&character=${encodeURIComponent(c.character)}`}
                          className="inline-block"
                        >
                          <Button size="sm">Open</Button>
                        </Link>
                        <DeleteConversationButton
                          id={c.id}
                          onDeleted={() =>
                            setItems((arr) => arr.filter((x) => x.id !== c.id))
                          }
                        />
                      </div>
                    </CardBody>
                  </Card>
                ))}
            </>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {grouped && grouped.length === 0 ? (
            <Card>
              <CardBody className="p-6 text-muted">No conversations yet.</CardBody>
            </Card>
          ) : (
            grouped?.map(([charName, list]) => (
              <section key={charName} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{charName}</h3>
                  <div className="flex items-center gap-2">
                    <Link href={`/chat?new=1&character=${encodeURIComponent(charName)}`}>
                      <Button size="sm">New Chat</Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        const ok = confirm(
                          `Delete all ${charName} chats? This cannot be undone.`
                        );
                        if (!ok) return;
                        await deleteConversationsByCharacter(charName).catch(
                          () => {}
                        );
                        setItems((arr) =>
                          arr.filter((x) => x.character !== charName)
                        );
                      }}
                    >
                      Delete all
                    </Button>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((c) => (
                    <Card key={c.id}>
                      <CardBody className="p-5 space-y-2">
                        <div className="text-sm text-muted">{c.character}</div>
                        {editingId === c.id ? (
                          <input
                            className="w-full rounded-md border border-[var(--border)] bg-card px-2 py-1 text-sm"
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={async (e) => {
                              if (e.key === "Enter") {
                                const name = draft.trim();
                                if (name) {
                                  try {
                                    setError(null);
                                    await updateConversationTitle(c.id, name);
                                    setItems((arr) =>
                                      arr.map((x) =>
                                        x.id === c.id ? { ...x, title: name } : x
                                      )
                                    );
                                  } catch (err: any) {
                                    setError(err?.message || "Failed to update title");
                                  }
                                }
                                setEditingId(null);
                              }
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            autoFocus
                          />
                        ) : (
                          <div
                            className="font-medium truncate cursor-text"
                            title={c.title || `${c.character} — ${c.id}`}
                            onDoubleClick={() => {
                              setEditingId(c.id);
                              setDraft(c.title || "");
                            }}
                          >
                            {c.title || `${c.character} — ${c.id}`}
                          </div>
                        )}
                        <div className="flex items-center gap-2 pt-1">
                          <Link
                            href={`/chat?c=${encodeURIComponent(c.id)}&character=${encodeURIComponent(c.character)}`}
                            className="inline-block"
                          >
                            <Button size="sm">Open</Button>
                          </Link>
                          <DeleteConversationButton
                            id={c.id}
                            onDeleted={() =>
                              setItems((arr) => arr.filter((x) => x.id !== c.id))
                            }
                          />
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      )}
    </Section>
  );
}

function ChatsFallback() {
  return (
    <Section title="Chats">
      <Card>
        <CardBody className="p-6 text-muted">Loading chats…</CardBody>
      </Card>
    </Section>
  );
}
