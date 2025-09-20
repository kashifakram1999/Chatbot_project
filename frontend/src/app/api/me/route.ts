import { NextResponse } from "next/server";
import { cookies as getCookies } from "next/headers";

function parseJwtUnsafe(t?: string) {
  if (!t) return null;
  try { const [, p] = t.split("."); return JSON.parse(Buffer.from(p, "base64").toString("utf8")); }
  catch { return null; }
}

export async function GET() {
  const cookies = await getCookies();
  const access = cookies.get("access")?.value || cookies.get("jwt")?.value;
  const payload = parseJwtUnsafe(access);
  if (!payload) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({
    user: { sub: payload.sub, email: payload.email, name: payload.name, role: payload.role }
  });
}
