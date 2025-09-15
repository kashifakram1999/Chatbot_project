"use client";

import { ClipboardCopy, Pencil, Trash2, RefreshCcw } from "lucide-react";

export function CopyBtn({ onClick }: { onClick: () => void }) {
  return (
    <button className="icon-btn" onClick={onClick} title="Copy">
      <ClipboardCopy size={16} />
    </button>
  );
}

export function EditBtn({ onClick }: { onClick: () => void }) {
  return (
    <button className="icon-btn" onClick={onClick} title="Edit">
      <Pencil size={16} />
    </button>
  );
}

export function DeleteBtn({ onClick }: { onClick: () => void }) {
  return (
    <button className="icon-btn" onClick={onClick} title="Delete">
      <Trash2 size={16} />
    </button>
  );
}

export function RegenerateBtn({ onClick }: { onClick: () => void }) {
  return (
    <button className="icon-btn" onClick={onClick} title="Regenerate">
      <RefreshCcw size={16} />
    </button>
  );
}
