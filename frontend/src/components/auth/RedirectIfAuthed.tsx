"use client";

import { useEffect } from "react";

export default function RedirectIfAuthed({ to = "/chat" }: { to?: string }) {
  useEffect(() => {
    try {
      const authed = !!localStorage.getItem("access") || !!localStorage.getItem("jwt");
      if (authed) window.location.replace(to);
    } catch {}
  }, [to]);

  return null;
}
