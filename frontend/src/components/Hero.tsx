"use client";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { Button } from "@/components/ui/Button";

export default function Hero() {
  const [authed, setAuthed] = React.useState<boolean | null>(null);
  const [lastConversationId, setLastConversationId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await fetch("/api/me", { credentials: "include", cache: "no-store" });
        const ok = me.ok ? (await me.json())?.user : null;
        if (!mounted) return;
        setAuthed(!!ok);
        if (ok) {
          const r = await fetch(`/api/dj/conversations`, { credentials: "include", cache: "no-store" });
          if (!mounted) return;
          if (r.ok) {
            const j = await r.json();
            const arr = Array.isArray(j) ? j : (j?.results ?? []);
            const first = arr[0];
            if (first?.id) setLastConversationId(String(first.id));
          }
        }
      } catch {
        if (!mounted) return;
        setAuthed(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const enterHref = "/characters";

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
      <div className="space-y-5">
        <h1 className="font-heading text-4xl sm:text-5xl">
          Speak with characters from the world of{" "}
          <span className="text-wtr-gold">Ice and Fire</span>.
        </h1>
        <p className="text-muted">
          Live, in-character conversations powered by retrieval and careful
          prompt craft. Switch to narrator mode with{" "}
          <code className="badge">[[OOC]]</code>.
        </p>
        <div className="flex gap-3">
          {authed ? (
            <>
              <Link href={enterHref}>
                <Button className="px-5">Enter the hall</Button>
              </Link>
              <Link href="/chats">
                <Button variant="ghost">All chats</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button className="px-5">Login</Button>
              </Link>
              <Link href="/register">
                <Button variant="ghost">Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="card-wtr overflow-hidden">
        <Image
          src="/images/hero.jpg"
          alt="Westeros themed hero"
          width={1200}
          height={800}
          className="w-full h-[320px] object-cover"
        />
      </div>
    </section>
  );
}
