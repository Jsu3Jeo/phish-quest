import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TOKEN_NAME } from "@/lib/constants";

export function middleware(req: NextRequest) {
  const token = req.cookies.get(TOKEN_NAME)?.value;

  const isApi = req.nextUrl.pathname.startsWith("/api/");
  const isPublic =
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/signup") ||
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.startsWith("/favicon") ||
    req.nextUrl.pathname.startsWith("/api/auth");

  if (isPublic) return NextResponse.next();

  if (!token) {
    if (isApi) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/home/:path*", "/scoreboard/:path*", "/game/:path*", "/result/:path*", "/set-name/:path*", "/api/:path*"]
};
