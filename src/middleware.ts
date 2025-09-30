// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request });

  // مسارات عامة (الصور، الصحة، الخ) يمكن توسيعها لاحقاً
  const publicPaths = ["/favicon.ico", "/robots.txt", "/_next", "/public"];
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

  // Protect non-auth routes
  if (!token) {
    // محاولة كشف وجود كعكة جلسة (next-auth.session-token أو __Secure-next-auth.session-token)
    const hasSessionCookie = Array.from(request.cookies.getAll()).some((c) =>
      /session-token$/i.test(c.name)
    );
    // إذا كان هناك كوكي جلسة قد يكون getToken تأخر في القراءة (تش race) نسمح بالمرور ليتم إعادة الجلب عبر العميل
    if (!hasSessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

// Matcher configuration
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|firebase-messaging-sw.js).*)",
  ],
};
