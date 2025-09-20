"use client";
import { useEffect } from "react";

export default function RedirectIfAuthed({ to = "/chat" }: { to?: string }) {
  useEffect(() => {
    let mounted = true;
    fetch("/api/me", { credentials: "include" })
      .then(r => r.ok ? r.json() : { user: null })
      .then(j => { if (!mounted) return; if (j.user) window.location.replace(to); })
      .catch(() => {});
    return () => { mounted = false; };
  }, [to]);
  return null;
}
