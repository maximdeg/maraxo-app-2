import { NextRequest } from 'next/server'

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

export function rateLimit(
  identifier: string, 
  limit: number = 5, 
  windowMs: number = 60000
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const windowStart = now - windowMs
  
  // Clean up expired entries
  for (const [key, entry] of rateLimitMap.entries()) {
    if (entry.resetTime < now) {
      rateLimitMap.delete(key)
    }
  }
  
  const entry = rateLimitMap.get(identifier)
  
  if (!entry || entry.resetTime < now) {
    // First request or window expired
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    })
    return {
      success: true,
      remaining: limit - 1,
      resetTime: now + windowMs
    }
  }
  
  if (entry.count >= limit) {
    // Rate limit exceeded
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime
    }
  }
  
  // Increment counter
  entry.count++
  rateLimitMap.set(identifier, entry)
  
  return {
    success: true,
    remaining: limit - entry.count,
    resetTime: entry.resetTime
  }
}

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (cfConnectingIP) return cfConnectingIP
  if (forwarded) return forwarded.split(',')[0].trim()
  if (realIP) return realIP
  
  return 'unknown'
}

export function createRateLimitResponse(
  remaining: number, 
  resetTime: number
): Response {
  const resetDate = new Date(resetTime)
  
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil((resetTime - Date.now()) / 1000)
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': resetDate.toISOString(),
        'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
      }
    }
  )
}
