import { NextRequest } from "next/server";

const DJANGO_BASE = process.env.NEXT_PUBLIC_API_BASE; // e.g. http://127.0.0.1:8000

export async function POST(req: NextRequest) {
  // (Optional) call your Django logout endpoint if you have one
  try {
    await fetch(`${DJANGO_BASE}/api/accounts/logout/`, {
      method: "POST",
      headers: { Authorization: req.headers.get("authorization") || "" },
      // include cookies if your Django uses session cookies
      credentials: "include" as any,
    });
  } catch {
    // ignore network errors; we'll still clear cookies client-side
  }

  // Expire common JWT cookies
  const headers = new Headers();
  const expire = "Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax";
  headers.append("Set-Cookie", `access=; ${expire}`);
  headers.append("Set-Cookie", `refresh=; ${expire}`);
  headers.append("Set-Cookie", `jwt=; ${expire}`);

  return new Response("ok", { status: 200, headers });
}
