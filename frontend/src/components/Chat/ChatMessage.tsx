import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";

export type ChatRole = "user" | "assistant";

export default function ChatMessage({
  role,
  children,
  content,
  editing = false,
  onEditChange,
  onEditKeyDown,
  assistantInitial = "B",
}: {
  role: ChatRole;
  content: string;
  children?: React.ReactNode; // actions slot (icons)
  editing?: boolean; // when true, show textarea (user message)
  onEditChange?: (val: string) => void;
  onEditKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  assistantInitial?: string;
}) {
  const isUser = role === "user";
  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        isUser ? "items-end" : "items-start"
      )}
    >
      <div
        className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}
      >
        {!isUser && <Avatar fallback={assistantInitial} />}
        <div
          className={cn(
            "max-w-[75%] rounded-2xl border px-4 py-3 shadow-soft",
            isUser
              ? "bg-ink-700/70 border-[var(--border)]"
              : "bg-parchment-noise/[.55] border-[var(--border)] text-ink-900"
          )}
        >
          {editing ? (
            <textarea
              autoFocus
              className="input min-h-16 w-full bg-transparent border-0 focus:shadow-none p-0"
              value={content}
              onChange={(e) => onEditChange?.(e.target.value)}
              onKeyDown={onEditKeyDown}
              placeholder="Edit your message…"
            />
          ) : (
            <div
              className={cn(
                !isUser && "prose prose-sm max-w-none text-white"
              )}
            >
              {content}
            </div>
          )}
        </div>
        {isUser && <Avatar fallback="U" />}
      </div>

      {/* actions row (icons) */}
      <div className={cn(isUser ? "pr-12" : "pl-12")}>
        <div className="flex items-center gap-2">{children}</div>
      </div>
    </div>
  );
}
