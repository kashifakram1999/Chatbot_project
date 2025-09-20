import { NextResponse } from "next/server";

const DJANGO_BASE = process.env.NEXT_PUBLIC_API_BASE!.replace(/\/+$/, ""); // e.g. http://localhost:8000/api
const IS_PROD = process.env.NODE_ENV === "production";

function setAuthCookies(res: NextResponse, tokens: { access?: string; refresh?: string }) {
  const cookieBase = { httpOnly: true, secure: IS_PROD, sameSite: "lax" as const, path: "/" };
  if (tokens.access) res.cookies.set("access", tokens.access, { ...cookieBase, maxAge: 60 * 60 });              // 1h
  if (tokens.refresh) res.cookies.set("refresh", tokens.refresh, { ...cookieBase, maxAge: 60 * 60 * 24 * 14 }); // 14d
}

export async function POST(req: Request) {
  const payload = await req.json();

  const upstream = await fetch(`${DJANGO_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include" as any,
  });

  // Try to parse JSON body regardless of status (for details)
  let data: any = {};
  try { data = await upstream.json(); } catch {}

  if (!upstream.ok) {
    return NextResponse.json({ detail: data?.detail || "Login failed" }, { status: upstream.status });
  }

  // Create response and set httpOnly cookies from JSON tokens
  const res = NextResponse.json(data);
  setAuthCookies(res, { access: data?.access, refresh: data?.refresh });

  // If upstream ALSO sent Set-Cookie (rare), forward it too (won't overwrite our cookies)
  const setCookie = upstream.headers.get("set-cookie");
  if (setCookie) res.headers.append("Set-Cookie", setCookie);

  return res;
}
