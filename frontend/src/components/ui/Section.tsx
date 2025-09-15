export function Section({
  title,
  actions,
  children,
}: {
  title?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      {(title || actions) && (
        <header className="flex items-center justify-between">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}
