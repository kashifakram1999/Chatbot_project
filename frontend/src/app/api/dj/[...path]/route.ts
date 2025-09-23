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

  // Buffer body once so we can retry after refresh without losing it
  const hasBody = !["GET","HEAD"].includes(req.method);
  const bodyText = hasBody ? await req.text() : undefined;

  const init: RequestInit = {
    method: req.method,
    headers: h,
    body: hasBody ? bodyText : undefined,
    redirect: "manual",
    credentials: "include" as any,
  };
  if (init.body) (init as any).duplex = "half"; // required in edge when sending a body

  let upstream = await fetch(target, init);

  // If unauthorized, try refresh-and-retry using the refresh cookie
  if (upstream.status === 401) {
    const refresh = (await getCookies()).get("refresh")?.value || "";
    if (refresh) {
      try {
        const refreshResp = await fetch(`${DJANGO_BASE}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh }),
          credentials: "include" as any,
        });
        if (refreshResp.ok) {
          let data: any = {};
          try { data = await refreshResp.json(); } catch {}
          const newAccess = data?.access as string | undefined;
          if (newAccess) {
            // retry with new access directly
            h.set("authorization", `Bearer ${newAccess}`);
            const retryInit: RequestInit = { ...init, headers: h, body: hasBody ? bodyText : undefined };
            if (retryInit.body) (retryInit as any).duplex = "half";
            upstream = await fetch(target, retryInit);
            // also set Set-Cookie header so client gets updated cookie
            const respHeaders = new Headers();
            const uct = upstream.headers.get("content-type");
            if (uct) respHeaders.set("content-type", uct);
            respHeaders.append(
              "Set-Cookie",
              `access=${newAccess}; Path=/; HttpOnly; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`
            );
            return new Response(upstream.body, { status: upstream.status, headers: respHeaders });
          }
        }
      } catch {}
    }
  }

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
