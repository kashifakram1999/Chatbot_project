import { NextRequest } from "next/server";
import { cookies as getCookies } from "next/headers";

// Keep NEXT_PUBLIC_API_BASE including '/api', e.g. http://localhost:8000/api
const DJANGO_BASE = process.env.NEXT_PUBLIC_API_BASE!.replace(/\/+$/, "");

async function openUpstream(body: any, bearer: string | null) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (bearer) headers.Authorization = `Bearer ${bearer}`;

  // 1st try: /chat/stream/ (trailing slash)
  let res = await fetch(`${DJANGO_BASE}/chat/stream/`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    credentials: "include" as any,
  });
  if (res.status !== 404) return res;

  // 2nd try: /chat/stream (no trailing slash)
  res = await fetch(`${DJANGO_BASE}/chat/stream`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    credentials: "include" as any,
  });
  return res;
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Read httpOnly cookie → Authorization header
  const cookies = await getCookies();
  const token = cookies.get("access")?.value || cookies.get("jwt")?.value || null;

  const upstream = await openUpstream(body, token);

  if (!upstream.ok || !upstream.body) {
    // Surface upstream status so you see 401/404/etc from Django directly
    const msg = await upstream.text().catch(() => "Upstream error");
    return new Response(msg || "Upstream error", { status: upstream.status || 500 });
  }

  // Stream straight back to the browser
  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        controller.enqueue(value);
      }
      controller.close();
    },
  });

  const contentType = upstream.headers.get("content-type") || "text/plain; charset=utf-8";
  return new Response(stream, { headers: { "Content-Type": contentType } });
}
