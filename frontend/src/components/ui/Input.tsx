"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

type BaseProps = {
  label?: string;
  hint?: string;
  error?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
};

export function Input({
  label,
  hint,
  error,
  left,
  right,
  className,
  id,
  ...rest
}: BaseProps & React.InputHTMLAttributes<HTMLInputElement>) {
  const inputId = id || React.useId();
  const invalid = Boolean(error);

  return (
    <label htmlFor={inputId} className="block">
      {label && <div className="mb-1 text-sm text-muted">{label}</div>}
      <div
        className={cn(
          "relative rounded-xl border transition",
          "border-[var(--border)] bg-ink-700 focus-within:shadow-ring",
          invalid && "border-blood-500"
        )}
      >
        {left && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            {left}
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            "input border-0 bg-transparent focus:shadow-none",
            left && "pl-9",
            right && "pr-10",
            className
          )}
          aria-invalid={invalid || undefined}
          {...rest}
        />
        {right && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {right}
          </div>
        )}
      </div>
      {error ? (
        <p className="mt-1 text-xs text-blood-500">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-muted">{hint}</p>
      ) : null}
    </label>
  );
}

export function PasswordInput(
  props: Omit<React.ComponentProps<typeof Input>, "type" | "right">
) {
  const [show, setShow] = React.useState(false);
  return (
    <Input
      {...props}
      type={show ? "text" : "password"}
      right={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="text-xs text-muted hover:text-text/90"
        >
          {show ? "Hide" : "Show"}
        </button>
      }
    />
  );
}
