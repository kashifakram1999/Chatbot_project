"use client";

import * as React from "react";
import { deleteConversation } from "@/lib/api";
import { Button } from "@/components/ui/Button";

export default function DeleteConversationButton({
  id,
  onDeleted,
  size = "sm",
}: {
  id: string;
  onDeleted?: () => void;
  size?: "sm" | "md";
}) {
  const [busy, setBusy] = React.useState(false);
  return (
    <Button
      variant="ghost"
      size={size}
      disabled={busy}
      onClick={async () => {
        if (busy) return;
        const ok = confirm("Delete this chat? This cannot be undone.");
        if (!ok) return;
        setBusy(true);
        try {
          await deleteConversation(id);
          onDeleted?.();
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy ? "Deleting…" : "Delete"}
    </Button>
  );
}


