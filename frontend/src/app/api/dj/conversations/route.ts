// src/app/api/dj/conversations/route.ts
import { cookies as getCookies, headers as getHeaders } from "next/headers";

const DJANGO_BASE = process.env.NEXT_PUBLIC_API_BASE!.replace(/\/+$/, ""); // e.g. http://localhost:8000/api

export async function GET(req: Request) {
  const cookies = await getCookies();
  const token = cookies.get("access")?.value || cookies.get("jwt")?.value || "";

  const inbound = await getHeaders();
  const headers = new Headers();
  const ct = inbound.get("content-type");
  if (ct) headers.set("content-type", ct);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const upstream = await fetch(`${DJANGO_BASE}/conversations`, {
    method: "GET",
    headers,
    credentials: "include" as any,
  });

  const respHeaders = new Headers();
  const uct = upstream.headers.get("content-type");
  if (uct) respHeaders.set("content-type", uct);

  return new Response(upstream.body, { status: upstream.status, headers: respHeaders });
}

export async function POST(req: Request) {
  const cookies = await getCookies();
  const token = cookies.get("access")?.value || cookies.get("jwt")?.value || "";

  const inbound = await getHeaders();
  const headers = new Headers();
  const ct = inbound.get("content-type") || "application/json";
  headers.set("content-type", ct);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const upstream = await fetch(`${DJANGO_BASE}/conversations`, {
    method: "POST",
    headers,
    body: await req.text(), // pass through as-is
    credentials: "include" as any,
  });

  const respHeaders = new Headers();
  const uct = upstream.headers.get("content-type");
  if (uct) respHeaders.set("content-type", uct);

  return new Response(upstream.body, { status: upstream.status, headers: respHeaders });
}
