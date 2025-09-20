import { NextRequest } from "next/server";

const DJANGO_BASE = process.env.NEXT_PUBLIC_API_BASE!.replace(/\/+$/, ""); // e.g. http://localhost:8000/api

export async function POST(req: NextRequest) {
  try {
    // If you have a Django logout endpoint, call it WITHOUT adding another /api
    await fetch(`${DJANGO_BASE}/accounts/logout/`, {
      method: "POST",
      headers: { Authorization: req.headers.get("authorization") || "" },
      credentials: "include" as any,
    });
  } catch { /* ignore network errors */ }

  // Expire our httpOnly cookies on the Next side
  const headers = new Headers();
  const expire = "Max-Age=0; Path=/; HttpOnly; SameSite=Lax";
  // Secure= only in prod, but harmless in dev; you can leave it on:
  headers.append("Set-Cookie", `access=; ${expire}`);
  headers.append("Set-Cookie", `refresh=; ${expire}`);
  headers.append("Set-Cookie", `jwt=; ${expire}`);

  return new Response("ok", { status: 200, headers });
}
