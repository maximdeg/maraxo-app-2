import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth-edge'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin routes - but allow /admin to load for authentication
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('auth-token')?.value
    
    // If no token, let the page load and let ProtectedRoute handle authentication
    if (!token) {
      return NextResponse.next()
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      // Clear invalid token but still allow page to load
      const response = NextResponse.next()
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
    // Allow GET requests and appointment creation for public access
    // Only protect admin operations like updating/deleting appointments
    if (request.method === 'PUT' || request.method === 'DELETE') {
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
    // Allow GET and POST requests for public access (appointment scheduling)
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
