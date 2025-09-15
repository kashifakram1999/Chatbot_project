export function EmptyState({
  title,
  text,
  action,
}: {
  title: string;
  text?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card p-6 text-center">
      <h3 className="text-base font-semibold">{title}</h3>
      {text && <p className="mt-2 text-sm text-muted">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
