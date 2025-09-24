"use client";

import RequireAuth from "@/components/auth/RequireAuth";
import Link from "next/link";
import { listConversations, updateConversationTitle } from "@/lib/api";
import { Card, CardBody } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import * as React from "react";
import { useSearchParams } from "next/navigation";

export default function AllChatsPage() {
  const [items, setItems] = React.useState<Array<{ id: string; title: string; character: string }>>([]);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);
  const search = useSearchParams();
  const character = (search.get("character") || "").trim();
  React.useEffect(() => {
    listConversations().then(setItems).catch(() => setItems([]));
  }, []);

  return (
    <RequireAuth>
      <Section title={character ? `${character} Chats` : "All Chats"} actions={<Link href={`/chat?new=1${character ? `&character=${encodeURIComponent(character)}` : ""}`}><Button size="sm">New Chat</Button></Link>}>
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
            (character ? items.filter((x) => x.character === character) : items).map((c) => (
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
                              setItems((arr) => arr.map((x) => (x.id === c.id ? { ...x, title: name } : x)));
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
                      onDoubleClick={() => { setEditingId(c.id); setDraft(c.title || ""); }}
                    >
                      {c.title || `${c.character} — ${c.id}`}
                    </div>
                  )}
                  <Link href={`/chat?c=${encodeURIComponent(c.id)}&character=${encodeURIComponent(c.character)}`} className="inline-block">
                    <Button size="sm" className="mt-2">Open</Button>
                  </Link>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      </Section>
    </RequireAuth>
  );
}


