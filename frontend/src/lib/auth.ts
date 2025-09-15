const API = process.env.NEXT_PUBLIC_API_BASE!;
const ACCESS_KEY = "access";
const REFRESH_KEY = "refresh";

export function getAccessToken() {
  try {
    return localStorage.getItem(ACCESS_KEY) || "";
  } catch {
    return "";
  }
}
export function setTokens({
  access,
  refresh,
}: {
  access: string;
  refresh?: string;
}) {
  try {
    localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  } catch {}
}
export function clearTokens() {
  try {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  } catch {}
}

export async function login(email: string, password: string) {
  const r = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) throw new Error((await r.json()).detail || "Login failed");
  const data = await r.json(); // { access, refresh, user }
  try {
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
  } catch {}
  return data;
}

export async function register(email: string, password: string) {
  const r = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) throw new Error((await r.json()).detail || "Registration failed");
  const data = await r.json();
  setTokens(data); // optional: or redirect to login instead
  return data;
}

export function authHeaders(extra?: HeadersInit): HeadersInit {
  const token = getAccessToken();
  return { Authorization: token ? `Bearer ${token}` : "", ...(extra || {}) };
}


export async function loginWithGoogle(idToken: string) {
  const r = await fetch(`${API.replace(/\/+$/, "")}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token: idToken }),
  });
  if (!r.ok) {
    let msg = `Google login failed (${r.status})`;
    try {
      const j = await r.json();
      if (j?.detail) msg = j.detail;
    } catch {}
    throw new Error(msg);
  }
  const data = await r.json(); // { access, refresh, user }
  try {
    localStorage.setItem("access", data.access);
    if (data.refresh) localStorage.setItem("refresh", data.refresh);
  } catch {}
  return data;
}