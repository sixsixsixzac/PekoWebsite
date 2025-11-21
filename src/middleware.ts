import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { findRouteConfig, protectedRoutes } from '@/lib/auth/route-config'
import { hasRole, type UserRole } from '@/lib/utils/roles'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Find matching route configuration
  const routeConfig = findRouteConfig(pathname)

  // If no route config found, allow access
  if (!routeConfig) {
    return NextResponse.next()
  }

  // Get user token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const userRole = token?.role as UserRole | undefined

  // Check if authentication is required
  if (routeConfig.requireAuth && !token) {
    const signInUrl = new URL('/auth/signin', request.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Check if specific roles are required
  if (routeConfig.roles && routeConfig.roles.length > 0) {
    // If not authenticated, redirect to sign-in
    if (!token) {
      const signInUrl = new URL('/auth/signin', request.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(signInUrl)
    }

    // Check if user has one of the required roles
    // hasRole handles hierarchy: admin can access writer/user routes, writer can access user routes
    const hasRequiredRole = userRole && routeConfig.roles.some((role) =>
      hasRole(userRole, role)
    )

    if (!hasRequiredRole) {
      // Redirect to unauthorized page or home
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

// Static matcher - Next.js requires this to be statically analyzable
// The middleware function will handle the actual route matching dynamically
export const config = {
  matcher: [
    '/settings/:path*',
    '/manga/:path*',
    '/admin/:path*',
    '/writer/:path*',
    '/api/:path*',
    // Add more common protected route patterns here as needed
  ],
}

