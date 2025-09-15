export function Avatar({
  src,
  fallback = "?",
  size = 36,
}: {
  src?: string;
  fallback?: string;
  size?: number;
}) {
  const style = { width: size, height: size };
  return (
    <div
      className="rounded-full border border-[var(--border)] bg-ink-700 overflow-hidden"
      style={style}
    >
      {src ? (
        <img src={src} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full grid place-items-center text-xs text-muted">
          {fallback}
        </div>
      )}
    </div>
  );
}
