import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

// Import all security modules
import { middleware } from '../../middleware'
import { rateLimit, getClientIP } from '../../lib/rate-limit'
import { verifyToken, generateToken } from '../../lib/auth'
import { validateInput, loginSchema, patientSchema } from '../../lib/validation'

describe('Comprehensive Security Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_SECRET = 'test-secret-key-that-is-long-enough-for-security'
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Authentication Flow Security', () => {
    it('should complete secure authentication flow', async () => {
      // 1. Test rate limiting on login
      const clientIP = '192.168.1.1'
      const rateLimitResult = rateLimit(`login:${clientIP}`, 5, 60000)
      expect(rateLimitResult.success).toBe(true)

      // 2. Test input validation
      const loginData = {
        email: 'admin@example.com',
        password: 'SecurePass123'
      }
      const validationResult = validateInput(loginSchema, loginData)
      expect(validationResult.success).toBe(true)

      // 3. Test token generation
      const user = {
        id: 1,
        full_name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date()
      }
      const token = generateToken(user)
      expect(token).toBeDefined()

      // 4. Test token verification
      const decoded = verifyToken(token)
      expect(decoded).toBeDefined()
      expect(decoded?.id).toBe(user.id)

      // 5. Test middleware protection
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

    it('should block unauthorized access attempts', async () => {
      // 1. Test rate limiting blocks excessive attempts
      const clientIP = '192.168.1.2'
      
      // Make 5 requests (limit is 5)
      for (let i = 0; i < 5; i++) {
        rateLimit(`login:${clientIP}`, 5, 60000)
      }
      
      // 6th request should be blocked
      const blockedResult = rateLimit(`login:${clientIP}`, 5, 60000)
      expect(blockedResult.success).toBe(false)

      // 2. Test invalid input validation
      const invalidLoginData = {
        email: 'invalid-email',
        password: 'weak'
      }
      const validationResult = validateInput(loginSchema, invalidLoginData)
      expect(validationResult.success).toBe(false)

      // 3. Test middleware blocks requests without token
      const request = new NextRequest('http://localhost:3000/admin')
      
      // Mock NextResponse.redirect
      const mockRedirect = vi.fn()
      vi.mocked(require('next/server').NextResponse.redirect).mockImplementation(mockRedirect)
      
      middleware(request)
      expect(mockRedirect).toHaveBeenCalled()
    })
  })

  describe('Data Validation Security', () => {
    it('should prevent SQL injection attempts', () => {
      const maliciousInputs = [
        "'; DROP TABLE users; --",
        "1' OR '1'='1",
        "admin'--",
        "'; INSERT INTO users VALUES ('hacker', 'password'); --"
      ]

      maliciousInputs.forEach(maliciousInput => {
        // Test patient data validation
        const result = validateInput(patientSchema, {
          first_name: maliciousInput,
          last_name: 'Test',
          phone_number: '+54 11 1234-5678'
        })
        
        expect(result.success).toBe(false)
        expect(result.errors).toContain('first_name: First name contains invalid characters')
      })
    })

    it('should prevent XSS attempts', () => {
      const xssInputs = [
        '<script>alert("xss")</script>',
        '"><script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src=x onerror=alert("xss")>'
      ]

      xssInputs.forEach(xssInput => {
        const result = validateInput(patientSchema, {
          first_name: xssInput,
          last_name: 'Test',
          phone_number: '+54 11 1234-5678'
        })
        
        expect(result.success).toBe(false)
      })
    })

    it('should prevent data overflow attacks', () => {
      const overflowInputs = [
        'A'.repeat(1000), // Very long string
        '1'.repeat(1000), // Very long number string
        'test@' + 'a'.repeat(1000) + '.com' // Very long email
      ]

      overflowInputs.forEach(overflowInput => {
        const result = validateInput(patientSchema, {
          first_name: overflowInput,
          last_name: 'Test',
          phone_number: '+54 11 1234-5678'
        })
        
        expect(result.success).toBe(false)
      })
    })
  })

  describe('Token Security', () => {
    it('should handle token tampering attempts', () => {
      const user = {
        id: 1,
        full_name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date()
      }
      
      const validToken = generateToken(user)
      
      // Test various tampering attempts
      const tamperedTokens = [
        validToken.slice(0, -10) + 'tampered', // Modify signature
        validToken.replace('admin', 'superadmin'), // Modify payload
        validToken + 'extra', // Add extra data
        validToken.slice(0, 50), // Truncate token
        'Bearer ' + validToken, // Add prefix
        validToken.toUpperCase(), // Change case
      ]

      tamperedTokens.forEach(tamperedToken => {
        const result = verifyToken(tamperedToken)
        expect(result).toBeNull()
      })
    })

    it('should handle expired token scenarios', () => {
      const user = {
        id: 1,
        full_name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date()
      }
      
      // Create a token that expires in 1 second
      const shortLivedToken = generateToken(user)
      
      // Mock time to simulate expiration
      const originalDateNow = Date.now
      vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 25 * 60 * 60 * 1000) // 25 hours later
      
      const result = verifyToken(shortLivedToken)
      expect(result).toBeNull()
      
      vi.spyOn(Date, 'now').mockReturnValue(originalDateNow())
    })
  })

  describe('Rate Limiting Security', () => {
    it('should prevent brute force attacks', () => {
      const attackerIP = '192.168.1.100'
      
      // Simulate brute force attack
      const results = []
      for (let i = 0; i < 10; i++) {
        results.push(rateLimit(`login:${attackerIP}`, 5, 60000))
      }
      
      const successful = results.filter(r => r.success).length
      const blocked = results.filter(r => !r.success).length
      
      expect(successful).toBe(5) // Only first 5 should succeed
      expect(blocked).toBe(5) // Last 5 should be blocked
    })

    it('should handle distributed attacks', () => {
      const attackerIPs = [
        '192.168.1.100',
        '192.168.1.101',
        '192.168.1.102',
        '192.168.1.103',
        '192.168.1.104'
      ]
      
      // Each IP tries to exceed rate limit
      attackerIPs.forEach(ip => {
        for (let i = 0; i < 6; i++) {
          const result = rateLimit(`login:${ip}`, 5, 60000)
          if (i < 5) {
            expect(result.success).toBe(true)
          } else {
            expect(result.success).toBe(false)
          }
        }
      })
    })
  })

  describe('Input Sanitization', () => {
    it('should sanitize all user inputs', () => {
      const maliciousInputs = [
        {
          input: 'John<script>alert("xss")</script>Doe',
          expected: 'Johnalert("xss")Doe'
        },
        {
          input: 'Test"quotes"and\'apostrophes\'',
          expected: 'Testquotesandapostrophes'
        },
        {
          input: '  Whitespace  ',
          expected: 'Whitespace'
        },
        {
          input: 'A'.repeat(300),
          expected: 'A'.repeat(255)
        }
      ]

      maliciousInputs.forEach(({ input, expected }) => {
        const { sanitizeString } = require('../../lib/validation')
        const result = sanitizeString(input)
        expect(result).toBe(expected)
      })
    })
  })

  describe('Environment Security', () => {
    it('should require secure environment variables', () => {
      // Test JWT_SECRET requirement
      delete process.env.JWT_SECRET
      
      expect(() => {
        require('../../lib/auth')
      }).toThrow('JWT_SECRET environment variable is required')
      
      // Restore for other tests
      process.env.JWT_SECRET = 'test-secret-key-that-is-long-enough-for-security'
    })

    it('should validate JWT_SECRET strength', () => {
      const weakSecrets = [
        'short',
        '123456789012345678901234567890', // exactly 30 chars
        'password',
        'secret'
      ]

      weakSecrets.forEach(secret => {
        process.env.JWT_SECRET = secret
        
        expect(() => {
          require('../../lib/auth')
        }).toThrow('JWT_SECRET must be at least 32 characters long')
      })
      
      // Restore for other tests
      process.env.JWT_SECRET = 'test-secret-key-that-is-long-enough-for-security'
    })
  })

  describe('API Endpoint Security', () => {
    it('should protect sensitive endpoints', () => {
      const protectedEndpoints = [
        '/api/admin/users',
        '/api/admin/appointments',
        '/api/admin/patients',
        '/admin/dashboard',
        '/admin/settings'
      ]

      protectedEndpoints.forEach(endpoint => {
        const request = new NextRequest(`http://localhost:3000${endpoint}`)
        
        // Mock NextResponse.redirect for admin routes
        const mockRedirect = vi.fn()
        vi.mocked(require('next/server').NextResponse.redirect).mockImplementation(mockRedirect)
        
        // Mock NextResponse.json for API routes
        const mockJson = vi.fn()
        vi.mocked(require('next/server').NextResponse.json).mockImplementation(mockJson)
        
        middleware(request)
        
        if (endpoint.startsWith('/admin')) {
          expect(mockRedirect).toHaveBeenCalled()
        } else if (endpoint.startsWith('/api/admin')) {
          expect(mockJson).toHaveBeenCalledWith(
            { error: 'Unauthorized - No token provided' },
            { status: 401 }
          )
        }
      })
    })
  })
})
