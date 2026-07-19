import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "default_jwt_secret_must_be_at_least_32_characters_long_for_security"
);

export async function decrypt(input: string) {
  try {
    const { payload } = await jwtVerify(input, SECRET_KEY, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static files and Next.js internals bypass
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") ||
    pathname.startsWith("/api/public")
  ) {
    return NextResponse.next();
  }

  const session = request.cookies.get("session")?.value;
  const payload = session ? await decrypt(session) : null;

  const isAuthenticated = !!payload;
  const hasCompletedOnboarding = isAuthenticated && !!payload?.username;

  // Auth pages (sign-in, sign-up, forgot-password)
  const isAuthPage =
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/forgot-password");

  // Landing page is public
  const isLandingPage = pathname === "/";

  // Handle Redirection Logic
  if (isAuthPage) {
    if (isAuthenticated) {
      if (hasCompletedOnboarding) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      } else {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
    }
    return NextResponse.next();
  }

  // If not authenticated and trying to access protected paths
  if (!isAuthenticated && !isLandingPage) {
    const signInUrl = new URL("/sign-in", request.url);
    // Keep track of redirect target
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // If authenticated but onboarding is incomplete, restrict them to /onboarding
  if (isAuthenticated && !hasCompletedOnboarding && pathname !== "/onboarding" && !pathname.startsWith("/api/auth/sign-out")) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // If onboarding is complete and trying to access /onboarding, send to dashboard
  if (hasCompletedOnboarding && pathname === "/onboarding") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Role-based protection for /admin
  if (pathname.startsWith("/admin")) {
    const userRole = payload?.role as string;
    if (userRole !== "ADMIN" && userRole !== "MODERATOR") {
      // Redirect to a custom unauthorized page or dashboard
      return NextResponse.redirect(new URL("/dashboard?error=unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
