"use client";
import AuthNav from "./auth/AuthNav";
import { useEffect, useState } from "react";

export default function SiteNavbar({ user: _serverUser }: { user?: any } = {}) {
  const [authed, setAuthed] = useState<boolean | null>(_serverUser ? true : null);

  useEffect(() => {
    if (_serverUser) { setAuthed(true); return; }
    let mounted = true;
    fetch("/api/me", { credentials: "include" })
      .then(r => r.ok ? r.json() : { user: null })
      .then(j => { if (!mounted) return; setAuthed(!!j.user); })
      .catch(() => { if (!mounted) return; setAuthed(false); });
    return () => { mounted = false; };
  }, [_serverUser]);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur border-b border-[var(--border)]/70 bg-card/75">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <a href="/" className="font-semibold tracking-wide">
          Throne<span className="text-[var(--accent)]">Talk</span>
        </a>
        {authed === null ? (
          <div />
        ) : authed ? (
          <AuthNav />
        ) : (
          <div className="flex items-center gap-2">
            <a href="/login" className="btn btn-ghost px-3 py-1.5 text-xs">Sign in</a>
            <a href="/register" className="btn btn-primary px-3 py-1.5 text-xs">Create account</a>
          </div>
        )}
      </div>
    </nav>
  );
}
