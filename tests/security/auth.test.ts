import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { middleware } from '../../middleware'
import { rateLimit, getClientIP } from '../../lib/rate-limit'
import { verifyToken, generateToken } from '../../lib/auth'
import { validateInput, loginSchema } from '../../lib/validation'

// Mock NextResponse
vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server')
  return {
    ...actual,
    NextResponse: {
      next: vi.fn(() => ({ headers: { set: vi.fn() } })),
      redirect: vi.fn(() => ({ cookies: { delete: vi.fn() } })),
      json: vi.fn(() => ({ status: 401 }))
    }
  }
})

describe('Authentication Security Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set required environment variables
    process.env.JWT_SECRET = 'test-secret-key-that-is-long-enough-for-security'
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('JWT Token Security', () => {
    it('should reject tokens with invalid signature', () => {
      const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIn0.invalid-signature'
      
      const result = verifyToken(invalidToken)
      expect(result).toBeNull()
    })

    it('should reject expired tokens', () => {
      const expiredToken = generateToken({
        id: 1,
        full_name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date()
      })
      
      // Mock Date.now to simulate expired token
      const originalDateNow = Date.now
      vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 25 * 60 * 60 * 1000) // 25 hours later
      
      const result = verifyToken(expiredToken)
      expect(result).toBeNull()
      
      vi.spyOn(Date, 'now').mockReturnValue(originalDateNow())
    })

    it('should accept valid tokens', () => {
      const user = {
        id: 1,
        full_name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date()
      }
      
      const token = generateToken(user)
      const result = verifyToken(token)
      
      expect(result).toBeDefined()
      expect(result?.id).toBe(user.id)
      expect(result?.email).toBe(user.email)
      expect(result?.role).toBe(user.role)
    })
  })

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', () => {
      const identifier = 'test-user'
      const result1 = rateLimit(identifier, 3, 60000)
      const result2 = rateLimit(identifier, 3, 60000)
      
      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true)
      expect(result1.remaining).toBe(2)
      expect(result2.remaining).toBe(1)
    })

    it('should block requests exceeding rate limit', () => {
      const identifier = 'test-user'
      
      // Make 3 requests (limit is 3)
      rateLimit(identifier, 3, 60000)
      rateLimit(identifier, 3, 60000)
      rateLimit(identifier, 3, 60000)
      
      // 4th request should be blocked
      const result = rateLimit(identifier, 3, 60000)
      
      expect(result.success).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should reset rate limit after window expires', () => {
      const identifier = 'test-user'
      
      // Exceed rate limit
      rateLimit(identifier, 1, 1000) // 1 request per second
      const blockedResult = rateLimit(identifier, 1, 1000)
      expect(blockedResult.success).toBe(false)
      
      // Wait for window to expire and try again
      setTimeout(() => {
        const newResult = rateLimit(identifier, 1, 1000)
        expect(newResult.success).toBe(true)
      }, 1100)
    })

    it('should extract client IP correctly', () => {
      const mockRequest = {
        headers: {
          get: vi.fn((header: string) => {
            switch (header) {
              case 'x-forwarded-for': return '192.168.1.1, 10.0.0.1'
              case 'x-real-ip': return '203.0.113.1'
              case 'cf-connecting-ip': return null
              default: return null
            }
          })
        }
      } as unknown as NextRequest
      
      const ip = getClientIP(mockRequest)
      expect(ip).toBe('192.168.1.1')
    })
  })

  describe('Input Validation', () => {
    it('should validate login credentials correctly', () => {
      const validData = {
        email: 'test@example.com',
        password: 'SecurePass123'
      }
      
      const result = validateInput(loginSchema, validData)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(validData)
    })

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'SecurePass123'
      }
      
      const result = validateInput(loginSchema, invalidData)
      expect(result.success).toBe(false)
      expect(result.errors).toContain('email: Invalid email format')
    })

    it('should reject weak passwords', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'weak'
      }
      
      const result = validateInput(loginSchema, invalidData)
      expect(result.success).toBe(false)
      expect(result.errors).toContain('password: Password must be at least 8 characters')
    })

    it('should reject passwords without required complexity', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'weakpassword'
      }
      
      const result = validateInput(loginSchema, invalidData)
      expect(result.success).toBe(false)
      expect(result.errors).toContain('password: Password must contain at least one lowercase letter, one uppercase letter, and one number')
    })
  })

  describe('Middleware Security', () => {
    it('should protect admin routes without token', () => {
      const request = new NextRequest('http://localhost:3000/admin')
      
      // Mock NextResponse.redirect
      const mockRedirect = vi.fn()
      vi.mocked(require('next/server').NextResponse.redirect).mockImplementation(mockRedirect)
      
      middleware(request)
      
      expect(mockRedirect).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: '/admin'
        })
      )
    })

    it('should protect admin API routes without token', () => {
      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        method: 'GET'
      })
      
      // Mock NextResponse.json
      const mockJson = vi.fn()
      vi.mocked(require('next/server').NextResponse.json).mockImplementation(mockJson)
      
      middleware(request)
      
      expect(mockJson).toHaveBeenCalledWith(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      )
    })

    it('should allow access with valid token', () => {
      const user = {
        id: 1,
        full_name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date()
      }
      
      const token = generateToken(user)
      const request = new NextRequest('http://localhost:3000/admin', {
        headers: {
          cookie: `auth-token=${token}`
        }
      })
      
      // Mock NextResponse.next
      const mockNext = vi.fn()
      vi.mocked(require('next/server').NextResponse.next).mockImplementation(mockNext)
      
      middleware(request)
      
      expect(mockNext).toHaveBeenCalled()
    })
  })

  describe('Environment Security', () => {
    it('should require JWT_SECRET environment variable', () => {
      delete process.env.JWT_SECRET
      
      expect(() => {
        require('../../lib/auth')
      }).toThrow('JWT_SECRET environment variable is required')
    })

    it('should require JWT_SECRET to be at least 32 characters', () => {
      process.env.JWT_SECRET = 'short'
      
      expect(() => {
        require('../../lib/auth')
      }).toThrow('JWT_SECRET must be at least 32 characters long')
    })
  })
})
