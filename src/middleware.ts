// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Use secret to ensure getToken works correctly in middleware (edge)
  const token = await getToken({
    req: request,
    // Support either NEXTAUTH_SECRET (v4) or AUTH_SECRET (v5 env name)
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  });
  const userRole = (token as any)?.user?.role as string | undefined;

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

  // إذا كان الدور customer: سجّل الخروج مباشرة (امسح الكوكيز وأعد التوجيه لصفحة الدخول)
  if (token && userRole === "customer") {
    const resp = NextResponse.redirect(new URL("/login", request.url));
    resp.cookies.delete("next-auth.session-token");
    resp.cookies.delete("__Secure-next-auth.session-token");
    return resp;
  }

  // Handle auth routes for authenticated users (غير العملاء)
  if (isAuthRoute) {
    if (token) {
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

  // Manager-only sections: restrict these prefixes and their subpaths to role=manager
  // NOTE: Keep this list in sync with admin-only pages in the app router
  const managerOnlyPrefixes = [
    "/categories",
    "/advertisements",
    "/users",
    "/settings",
  ];
  const isManagerOnlyRoute = managerOnlyPrefixes.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (isManagerOnlyRoute && userRole !== "manager") {
    // السماح للموظف بالوصول إلى صفحة بياناته الشخصية فقط /users/{id}
    const userId = (token as any)?.user?.id as string | number | undefined;
    const match = pathname.match(/^\/users\/(\d+)(?:$|\/)/);
    if (userRole === "employee" && match && userId != null) {
      const requestedId = match[1];
      // مقارنة بعد تحويل الرقمين إلى نص لتفادي اختلاف النوع
      if (String(requestedId) === String(userId)) {
        return NextResponse.next();
      }
    }
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
