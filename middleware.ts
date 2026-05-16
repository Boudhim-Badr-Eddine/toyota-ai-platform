import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // These admin routes require authentication
  const protectedPaths = ['/dashboard', '/leads', '/reservations']
  const isProtected = protectedPaths.some(p => pathname.startsWith(p))

  if (isProtected) {
    // Check for session cookie (NextAuth v4/v5 compatible)
    const sessionToken =
      request.cookies.get('next-auth.session-token') ??
      request.cookies.get('__Secure-next-auth.session-token')

    if (!sessionToken) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/leads/:path*', '/reservations/:path*'],
}
