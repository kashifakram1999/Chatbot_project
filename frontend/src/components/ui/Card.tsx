import * as React from "react";
import { cn } from "@/lib/cn";

export function Card({
  className,
  children,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        "card relative",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl",
        "before:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="px-5 pt-5 pb-2 flex items-start justify-between">
      <div>
        <h1 className="text-lg font-semibold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

export function CardBody({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn("px-5 pb-5", className)}>{children}</div>;
}
