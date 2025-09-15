import * as React from "react";
import { cn } from "@/lib/cn";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
  size?: "sm" | "md";
  loading?: boolean;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading = false,
  children,
  ...rest
}: Props) {
  return (
    <button
      className={cn(
        "btn",
        variant === "primary" ? "btn-primary" : "btn-ghost",
        size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2",
        loading && "opacity-90 cursor-not-allowed",
        className
      )}
      aria-busy={loading || undefined}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading && (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-ink-900 border-t-transparent" />
      )}
      {children}
    </button>
  );
}
