"use client";

import { useEffect, useState } from "react";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const authed = !!localStorage.getItem("access") || !!localStorage.getItem("jwt");
      if (!authed) {
        window.location.replace("/login");
      } else {
        setAllowed(true);
      }
    } catch {
      window.location.replace("/login");
    }
  }, []);

  if (allowed === null) return null; // avoid flash
  return <>{children}</>;
}
