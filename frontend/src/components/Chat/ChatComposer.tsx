"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";

export default function ChatComposer({
  onSend,
}: {
  onSend: (text: string) => void;
}) {
  const [text, setText] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
    taRef.current?.focus();
  };

  return (
    <div className="card p-3">
      <div className="flex items-end gap-3">
        <textarea
          ref={taRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          className="input min-h-10 resize-y"
          placeholder="Ask Bronn something…"
        />
        <Button onClick={submit} className="shrink-0">
          Send
        </Button>
      </div>
      <div className="mt-2 text-[11px] text-muted">Shift+Enter for newline</div>
    </div>
  );
}
