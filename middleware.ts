import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuthenticated = !!token

  // Define protected routes
  const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard")
  const isAuthRoute = request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/signup")

  // Redirect logic
  if (isProtectedRoute && !isAuthenticated) {
    // Redirect to login if trying to access protected route while not authenticated
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (isAuthRoute && isAuthenticated) {
    // Redirect to dashboard if trying to access auth routes while already authenticated
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Admin-only routes
  const isAdminRoute = request.nextUrl.pathname.startsWith("/dashboard/admin")
  if (isAdminRoute && token?.role !== "ADMIN") {
    // Redirect to dashboard if trying to access admin routes without admin role
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup", "/register/:path*"],
}
