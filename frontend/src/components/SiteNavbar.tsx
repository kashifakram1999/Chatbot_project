"use client";

import AuthNav from "./auth/AuthNav";
import { useEffect, useState } from "react";

export default function SiteNavbar() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const has =
        !!localStorage.getItem("access") || !!localStorage.getItem("jwt");
      setAuthed(has);
    } catch {
      setAuthed(false);
    }
  }, []);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur border-b border-[var(--border)]/70 bg-card/75">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <a href="/" className="font-semibold tracking-wide">
          Bronn <span className="text-[var(--accent)]">Chat</span>
        </a>

        {authed === null ? (
          // While loading (hydration), render nothing to avoid mismatch
          <div />
        ) : authed ? (
          <AuthNav /> // shows Chat + Logout
        ) : (
          <div className="flex items-center gap-2">
            <a href="/chat" className="badge hover:opacity-90">
              Chat
            </a>
            <a href="/login" className="badge hover:opacity-90">
              Sign in
            </a>
            <a href="/register" className="badge hover:opacity-90">
              Create account
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}
