import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth-edge'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      // Clear invalid token
      const response = NextResponse.redirect(new URL('/admin', request.url))
      response.cookies.delete('auth-token')
      return response
    }

    // Add user info to headers for server components
    const response = NextResponse.next()
    response.headers.set('x-user-id', decoded.id.toString())
    response.headers.set('x-user-role', decoded.role)
    return response
  }
  
  // Protect admin API routes
  if (pathname.startsWith('/api/admin')) {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      )
    }

    // Add user info to headers
    const response = NextResponse.next()
    response.headers.set('x-user-id', decoded.id.toString())
    response.headers.set('x-user-role', decoded.role)
    return response
  }

  // Protect sensitive API routes (appointments, patients)
  if (pathname.startsWith('/api/appointments') || pathname.startsWith('/api/patients')) {
    // Allow GET requests for public data, but protect POST/PUT/DELETE
    if (request.method !== 'GET') {
      const token = request.headers.get('authorization')?.replace('Bearer ', '')
      
      if (!token) {
        return NextResponse.json(
          { error: 'Unauthorized - Admin access required for this operation' },
          { status: 401 }
        )
      }

      const decoded = verifyToken(token)
      if (!decoded || decoded.role !== 'admin') {
        return NextResponse.json(
          { error: 'Unauthorized - Admin role required' },
          { status: 403 }
        )
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/appointments/:path*',
    '/api/patients/:path*'
  ]
}
