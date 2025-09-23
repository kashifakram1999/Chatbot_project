import { NextResponse } from "next/server";
import { cookies as getCookies } from "next/headers";

const DJANGO_BASE = process.env.NEXT_PUBLIC_API_BASE!.replace(/\/+$/, "");
const IS_PROD = process.env.NODE_ENV === "production";

export async function POST() {
  const cookies = await getCookies();
  const refresh = cookies.get("refresh")?.value || "";

  // SimpleJWT expects the refresh token in JSON body: { refresh: "..." }
  const upstream = await fetch(`${DJANGO_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
    credentials: "include" as any,
  });

  let data: any = {};
  try { data = await upstream.json(); } catch {}

  if (!upstream.ok) {
    return NextResponse.json({ detail: data?.detail || "Refresh failed" }, { status: upstream.status });
  }

  const res = NextResponse.json(data);
  // SimpleJWT refresh often returns only { access }
  if (data?.access) {
    res.cookies.set("access", data.access, {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // align with your access lifetime
    });
  }

  const setCookie = upstream.headers.get("set-cookie");
  if (setCookie) res.headers.append("Set-Cookie", setCookie);

  return res;
}
