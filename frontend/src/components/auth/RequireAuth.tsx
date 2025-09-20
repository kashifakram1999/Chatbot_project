"use client";
import { useEffect, useState } from "react";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/me", { credentials: "include" })
      .then(r => r.ok ? r.json() : { user: null })
      .then(j => { if (!mounted) return; setAllowed(!!j.user); if (!j.user) window.location.replace("/login"); })
      .catch(() => { if (!mounted) return; window.location.replace("/login"); });
    return () => { mounted = false; };
  }, []);

  if (allowed === null) return null; // avoid flash
  return <>{children}</>;
}
