import { NextResponse } from "next/server";

const DJANGO_BASE = process.env.NEXT_PUBLIC_API_BASE!.replace(/\/+$/, "");
const IS_PROD = process.env.NODE_ENV === "production";

function setAuthCookies(res: NextResponse, tokens: { access?: string; refresh?: string }) {
  const cookieBase = { httpOnly: true, secure: IS_PROD, sameSite: "lax" as const, path: "/" };
  if (tokens.access) res.cookies.set("access", tokens.access, { ...cookieBase, maxAge: 60 * 60 });
  if (tokens.refresh) res.cookies.set("refresh", tokens.refresh, { ...cookieBase, maxAge: 60 * 60 * 24 * 14 });
}

export async function POST(req: Request) {
  const body = await req.json();

  const upstream = await fetch(`${DJANGO_BASE}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include" as any,
  });

  let data: any = {};
  try { data = await upstream.json(); } catch {}

  if (!upstream.ok) {
    return NextResponse.json({ detail: data?.detail || "Google login failed" }, { status: upstream.status });
  }

  const res = NextResponse.json(data);
  setAuthCookies(res, { access: data?.access, refresh: data?.refresh });

  const setCookie = upstream.headers.get("set-cookie");
  if (setCookie) res.headers.append("Set-Cookie", setCookie);

  return res;
}
