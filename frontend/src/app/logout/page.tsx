"use client";
import { useEffect } from "react";

export default function LogoutPage() {
  useEffect(() => {
    fetch("/api/logout", { method: "POST" })
      .catch(() => {})
      .finally(() => { window.location.href = "/login"; });
  }, []);

  return (
    <div className="mx-auto max-w-md card p-6 text-center">
      <h1 className="text-lg font-semibold">Signing you out…</h1>
      <p className="mt-2 text-sm text-muted">Please wait.</p>
    </div>
  );
}
