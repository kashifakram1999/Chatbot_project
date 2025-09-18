"use client";

export default function AuthNav() {
  return (
    <div className="flex items-center gap-2">
      <a href="/chat" className="badge hover:opacity-90">Chat</a>
      <a href="/logout" className="badge hover:opacity-90">Logout</a>
    </div>
  );
}
