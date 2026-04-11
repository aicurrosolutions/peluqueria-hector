import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteger rutas /admin/* excepto /admin (login)
  if (pathname.startsWith("/admin") && pathname !== "/admin") {
    const secret = process.env.NEXTAUTH_SECRET;
    const token = request.cookies.get("hl_admin_token")?.value;

    if (!token || !secret) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    try {
      await jwtVerify(token, new TextEncoder().encode(secret));
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
