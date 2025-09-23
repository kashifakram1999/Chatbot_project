"use client";

export default function AuthNav() {
  return (
    <div className="flex items-center gap-2">
      <a href="/chat" className="btn btn-ghost px-3 py-1.5 text-xs">Chat</a>
      <a href="/logout" className="btn btn-primary px-3 py-1.5 text-xs">Logout</a>
    </div>
  );
}
