"use client";

import { useEffect } from "react";

export default function LogoutPage() {
  useEffect(() => {
    // Clear localStorage tokens (if you store them)
    try {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("jwt");
    } catch {}

    // Hit our API to clear HttpOnly cookies, then redirect
    fetch("/api/logout", { method: "POST" })
      .catch(() => {}) // ignore errors
      .finally(() => {
        window.location.href = "/login";
      });
  }, []);

  return (
    <div className="mx-auto max-w-md card p-6 text-center">
      <h1 className="text-lg font-semibold">Signing you out…</h1>
      <p className="mt-2 text-sm text-muted">Please wait.</p>
    </div>
  );
}
