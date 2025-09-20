import { cookies as getCookies, headers as getHeaders } from "next/headers";

const DJANGO_BASE = process.env.NEXT_PUBLIC_API_BASE!.replace(/\/+$/, "");
const DJANGO_BASE_HAS_API_SUFFIX = /\/api$/.test(DJANGO_BASE);

function buildTarget(path: string, search: string) {
  const clean = path.replace(/^\/+/, "");

  // If DJANGO_BASE already ends with /api and client path starts with "api/",
  // strip the redundant "api/" to avoid /api/api/*
  const normalized = DJANGO_BASE_HAS_API_SUFFIX
    ? clean.replace(/^api\/?/, "")
    : clean;

  const base = DJANGO_BASE;
  const url = `${base}/${normalized}`;
  return search ? `${url}?${search}` : url;
}

async function proxy(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params; // ✅ await params
  const url = new URL(req.url);
  const target = buildTarget((path || []).join("/"), url.searchParams.toString());

  // Read cookie and forward as Authorization
  const cookies = await getCookies(); // ✅ await cookies()
  const token = cookies.get("access")?.value || cookies.get("jwt")?.value || "";
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  // Preserve relevant inbound headers (content-type only)
  const inbound = await getHeaders(); // ✅ await headers()
  const h = new Headers();
  const ct = inbound.get("content-type");
  if (ct) h.set("content-type", ct);
  Object.entries(authHeader).forEach(([k, v]) => h.set(k, v));

  const init: RequestInit = {
    method: req.method,
    headers: h,
    body: ["GET","HEAD"].includes(req.method) ? undefined : req.body,
    redirect: "manual",
    credentials: "include" as any,
  };

  const upstream = await fetch(target, init);

  // Stream response back
  const respHeaders = new Headers();
  const uct = upstream.headers.get("content-type");
  if (uct) respHeaders.set("content-type", uct);
  return new Response(upstream.body, { status: upstream.status, headers: respHeaders });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
