// src/lib/auth.ts
const API = ""; // use same-origin Next API

/** ---- Server/session helpers (used by server components & API routes) ---- **/
export type SessionUser = { sub: string; email?: string; name?: string; role?: string };

function parseJwtUnsafe(t?: string): any | null {
  if (!t) return null;
  try {
    const [, p] = t.split(".");
    return JSON.parse(Buffer.from(p, "base64").toString("utf8"));
  } catch { return null; }
}

// Server components should hit /api/me (same-origin, cookies included)
export async function getServerUser(): Promise<SessionUser | null> {
  try {
    const r = await fetch(`${API}/api/me`, { cache: "no-store" });
    if (!r.ok) return null;
    const { user } = await r.json();
    return user || null;
  } catch { return null; }
}

/** ---- Client-side auth actions now call Next API which sets httpOnly cookies ---- **/

// Email/password
export async function login(email: string, password: string) {
  const r = await fetch(`/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) throw new Error((await safeJson(r))?.detail || "Login failed");
  return await r.json(); // { user? ... } as returned by Django/proxy
}

// Register
export async function register(email: string, password: string) {
  const r = await fetch(`/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) throw new Error((await safeJson(r))?.detail || "Registration failed");
  return await r.json();
}

// Google
export async function loginWithGoogle(idToken: string) {
  const r = await fetch(`/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ id_token: idToken }),
  });
  if (!r.ok) throw new Error((await safeJson(r))?.detail || `Google login failed (${r.status})`);
  return await r.json();
}

// Optional refresh (if you use refresh cookie server-side)
export async function refreshAccessToken(): Promise<boolean> {
  const r = await fetch(`/api/auth/refresh`, { method: "POST", credentials: "include" });
  return r.ok;
}

/** ---- Generic fetch wrapper: rely on cookies (no Authorization header) ---- **/
export async function fetchAuth(input: RequestInfo | URL, init: RequestInit = {}, retry = true): Promise<Response> {
  const withAuth: RequestInit = {
    ...init,
    credentials: init.credentials ?? "include", // send cookies
  };
  let res = await fetch(input, withAuth);
  if (res.status !== 401) return res;

  if (!retry) return res;
  const ok = await refreshAccessToken();
  if (!ok) return res;

  return fetch(input, withAuth);
}

async function safeJson(r: Response) {
  try { return await r.json(); } catch { return null; }
}
