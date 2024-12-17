import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')
  const isRegistered = request.cookies.get('userRegistered')
  const isAuthPage = request.nextUrl.pathname === '/'
  const isRegisterPage = request.nextUrl.pathname === '/user/media'

  // If user is not logged in and trying to access protected routes
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If user is logged in but trying to access login page
  if (token && isAuthPage) {
    return NextResponse.redirect(
      new URL(isRegistered?.value ? '/user' : '/user/media', request.url)
    )
  }

  // If user is logged in but not registered and trying to access other pages than register
  if (token && !isRegistered?.value && !isRegisterPage) {
    return NextResponse.redirect(new URL('/user/media', request.url))
  }

  // If user is logged in and registered but trying to access register page
  if (token && isRegistered?.value && isRegisterPage) {
    return NextResponse.redirect(new URL('/user', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/user/:path*']
} 