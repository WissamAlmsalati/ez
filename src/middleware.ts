// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Use secret to ensure getToken works correctly in middleware (edge)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // مسارات عامة (الصور، الصحة، الخ) يمكن توسيعها لاحقاً
  const publicPaths = [
    "/favicon.ico",
    "/robots.txt",
    "/_next",
    "/public",
    "/api/auth",
  ];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Define authentication routes
  const authRoutes = ["/login", "/login/forgot-password"];
  const isAuthRoute = authRoutes.includes(pathname);

  // Handle auth routes for authenticated users
  if (isAuthRoute) {
    if (token) {
      // Redirect authenticated users from auth routes to home page
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Protect non-auth routes strictly (remove cookie heuristic to prevent false positives)
  if (!token) {
    // Allow query flag force=login to bypass redirect loop diagnostics
    const loginURL = new URL("/login", request.url);
    return NextResponse.redirect(loginURL);
  }

  // Manager-only sections: restrict /categories and its subpaths to role=manager
  const managerOnlyPrefixes = ["/categories"];
  const isManagerOnlyRoute = managerOnlyPrefixes.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  const userRole = (token as any)?.user?.role as string | undefined;
  if (isManagerOnlyRoute && userRole !== "manager") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Matcher configuration
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|firebase-messaging-sw.js).*)",
  ],
};
