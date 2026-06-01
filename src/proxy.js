import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/api/auth", "/signin", "/_next", "/favicon.ico"];

function isPublic(pathname) {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

export default async function proxy(request) {
  const { pathname } = request.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();

  const session = await auth();
  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { code: 1, msg: "Unauthorized", data: null },
        { status: 401 }
      );
    }
    const url = new URL("/signin", request.url);
    url.searchParams.set("callbackUrl", request.nextUrl.href);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
