// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protect whole /chat area (add more matchers if needed)
export const config = { matcher: ["/chat/:path*"] };

export function middleware(req: NextRequest) {
  // Fast presence + exp check only (no DB calls here)
  const token = req.cookies.get("access")?.value || req.cookies.get("jwt")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  // Optional: lightweight exp guard without verifying signature
  try {
    const [, payloadB64] = token.split(".");
    const json = JSON.parse(Buffer.from(payloadB64, "base64").toString("utf8"));
    if (json?.exp && Date.now() / 1000 > json.exp) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}
