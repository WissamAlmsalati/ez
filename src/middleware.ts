// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request });

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

  // Protect non-auth routes
  if (!token) {
    // Redirect unauthenticated users to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Matcher configuration
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|firebase-messaging-sw.js).*)"],
};