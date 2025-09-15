import { NextRequest } from "next/server";

const DJANGO_BASE = process.env.NEXT_PUBLIC_API_BASE; // e.g. http://127.0.0.1:8000

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Forward to your Django streaming endpoint (SSE or chunked text)
  const upstream = await fetch(`${DJANGO_BASE}/api/chat/stream/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // pass auth if you use JWT cookies or headers
      Authorization: req.headers.get("authorization") || "",
    },
    body: JSON.stringify(body),
  });

  if (!upstream.ok || !upstream.body) {
    return new Response("Upstream error", { status: upstream.status || 500 });
  }

  // Re-stream to the browser (don’t buffer)
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

  // If Django returns SSE, forward the same type.
  const contentType =
    upstream.headers.get("content-type") || "text/plain; charset=utf-8";
  return new Response(stream, {
    headers: { "Content-Type": contentType },
  });
}
