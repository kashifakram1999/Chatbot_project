const API = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/+$/, "");
const ACCESS_KEY = "access";
const REFRESH_KEY = "refresh";

export function getAccessToken() {
  try { return localStorage.getItem(ACCESS_KEY) || ""; } catch { return ""; }
}
export function getRefreshToken() {
  try { return localStorage.getItem(REFRESH_KEY) || ""; } catch { return ""; }
}
export function setTokens({ access, refresh }: { access: string; refresh?: string }) {
  try {
    if (access) localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  } catch {}
}
export function clearTokens() {
  try {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  } catch {}
}

export function authHeaders(extra?: HeadersInit): HeadersInit {
  const token = getAccessToken();
  return { Authorization: token ? `Bearer ${token}` : "", ...(extra || {}) };
}

// --- Email/password
export async function login(email: string, password: string) {
  const r = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) throw new Error((await safeJson(r))?.detail || "Login failed");
  const data = await r.json(); // { access, refresh, user }
  setTokens(data);
  return data;
}

// --- Register
export async function register(email: string, password: string) {
  const r = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) throw new Error((await safeJson(r))?.detail || "Registration failed");
  const data = await r.json();
  setTokens(data);
  return data;
}

// --- Google
export async function loginWithGoogle(idToken: string) {
  const r = await fetch(`${API}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token: idToken }),
  });
  if (!r.ok) throw new Error((await safeJson(r))?.detail || `Google login failed (${r.status})`);
  const data = await r.json(); // { access, refresh, user }
  setTokens(data);
  return data;
}

// --- Refresh
export async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  const r = await fetch(`${API}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!r.ok) return null;
  const data = await r.json(); // { access }
  if (data?.access) {
    setTokens({ access: data.access });
    return data.access;
  }
  return null;
}

// --- Fetch with auto-refresh-once
export async function fetchAuth(input: RequestInfo | URL, init: RequestInit = {}, retry = true): Promise<Response> {
  const withAuth: RequestInit = {
    ...init,
    headers: authHeaders(init.headers),
    credentials: init.credentials ?? "include", // harmless if unused
  };
  let res = await fetch(input, withAuth);
  if (res.status !== 401) return res;

  // Try to refresh once
  if (!retry) return res;
  const newAccess = await refreshAccessToken();
  if (!newAccess) return res;

  const retryInit: RequestInit = {
    ...init,
    headers: { ...(init.headers || {}), Authorization: `Bearer ${newAccess}` },
    credentials: init.credentials ?? "include",
  };
  res = await fetch(input, retryInit);
  // If still 401 -> clear and bounce to login (optional)
  if (res.status === 401) {
    clearTokens();
  }
  return res;
}

async function safeJson(r: Response) {
  try { return await r.json(); } catch { return null; }
}
