import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

type RouteConfig = {
  requiresAuth: boolean
  requiresRegistration: boolean
}

const ROUTE_CONFIG: Record<string, RouteConfig> = {
  '/': { requiresAuth: false, requiresRegistration: false },
  '/user': { requiresAuth: true, requiresRegistration: true },
  '/user/media': { requiresAuth: true, requiresRegistration: false },
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('access_token')?.value
  const isRegistered = request.cookies.get('userRegistered')?.value
  
  const routeConfig = ROUTE_CONFIG[pathname] || { requiresAuth: true, requiresRegistration: true }

  // Handle authentication
  if (routeConfig.requiresAuth && !token) {
    return redirectToLogin(request)
  }

  // Handle registration requirement
  if (routeConfig.requiresRegistration && !isRegistered) {
    return redirectToRegistration(request)
  }

  // Prevent authenticated users from accessing login
  if (token && pathname === '/') {
    return redirectToUserDashboard(request, isRegistered)
  }

  // Prevent registered users from accessing registration
  if (token && isRegistered && pathname === '/user/media') {
    return redirectToUserDashboard(request, isRegistered)
  }

  return NextResponse.next()
}

// Helper functions for redirects
function redirectToLogin(request: NextRequest) {
  return NextResponse.redirect(new URL('/', request.url))
}

function redirectToRegistration(request: NextRequest) {
  return NextResponse.redirect(new URL('/user/media', request.url))
}

function redirectToUserDashboard(request: NextRequest, isRegistered: string | undefined) {
  return NextResponse.redirect(
    new URL(isRegistered ? '/user' : '/user/media', request.url)
  )
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}