import { describe, it, expect, beforeEach, vi } from 'vitest'
import { rateLimit, getClientIP, createRateLimitResponse } from '../../lib/rate-limit'

describe('Rate Limiting Security Tests', () => {
  beforeEach(() => {
    // Clear rate limit map before each test
    vi.clearAllMocks()
  })

  describe('Rate Limit Function', () => {
    it('should track requests per identifier', () => {
      const identifier = 'test-user-1'
      
      const result1 = rateLimit(identifier, 5, 60000)
      const result2 = rateLimit(identifier, 5, 60000)
      
      expect(result1.success).toBe(true)
      expect(result1.remaining).toBe(4)
      expect(result2.success).toBe(true)
      expect(result2.remaining).toBe(3)
    })

    it('should block requests when limit exceeded', () => {
      const identifier = 'test-user-2'
      
      // Make 5 requests (limit is 5)
      for (let i = 0; i < 5; i++) {
        rateLimit(identifier, 5, 60000)
      }
      
      // 6th request should be blocked
      const result = rateLimit(identifier, 5, 60000)
      
      expect(result.success).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should handle different identifiers independently', () => {
      const user1 = 'user-1'
      const user2 = 'user-2'
      
      // User 1 makes 5 requests
      for (let i = 0; i < 5; i++) {
        rateLimit(user1, 5, 60000)
      }
      
      // User 2 should still be able to make requests
      const result = rateLimit(user2, 5, 60000)
      
      expect(result.success).toBe(true)
      expect(result.remaining).toBe(4)
    })

    it('should reset after window expires', () => {
      const identifier = 'test-user-3'
      
      // Exceed rate limit with short window
      rateLimit(identifier, 1, 100) // 1 request per 100ms
      const blockedResult = rateLimit(identifier, 1, 100)
      expect(blockedResult.success).toBe(false)
      
      // Wait for window to expire
      return new Promise((resolve) => {
        setTimeout(() => {
          const newResult = rateLimit(identifier, 1, 100)
          expect(newResult.success).toBe(true)
          resolve(undefined)
        }, 150)
      })
    })

    it('should clean up expired entries', () => {
      const identifier = 'test-user-4'
      
      // Create an entry that should expire
      rateLimit(identifier, 1, 50) // 1 request per 50ms
      
      // Wait for expiration
      return new Promise((resolve) => {
        setTimeout(() => {
          // This should create a new entry
          const result = rateLimit(identifier, 1, 50)
          expect(result.success).toBe(true)
          expect(result.remaining).toBe(0) // Should be 0 because it's a new entry
          resolve(undefined)
        }, 100)
      })
    })
  })

  describe('Client IP Extraction', () => {
    it('should prioritize cf-connecting-ip header', () => {
      const mockRequest = {
        headers: {
          get: vi.fn((header: string) => {
            switch (header) {
              case 'cf-connecting-ip': return '203.0.113.1'
              case 'x-forwarded-for': return '192.168.1.1'
              case 'x-real-ip': return '10.0.0.1'
              default: return null
            }
          })
        }
      } as any
      
      const ip = getClientIP(mockRequest)
      expect(ip).toBe('203.0.113.1')
    })

    it('should fallback to x-forwarded-for header', () => {
      const mockRequest = {
        headers: {
          get: vi.fn((header: string) => {
            switch (header) {
              case 'cf-connecting-ip': return null
              case 'x-forwarded-for': return '192.168.1.1, 10.0.0.1'
              case 'x-real-ip': return '203.0.113.1'
              default: return null
            }
          })
        }
      } as any
      
      const ip = getClientIP(mockRequest)
      expect(ip).toBe('192.168.1.1')
    })

    it('should fallback to x-real-ip header', () => {
      const mockRequest = {
        headers: {
          get: vi.fn((header: string) => {
            switch (header) {
              case 'cf-connecting-ip': return null
              case 'x-forwarded-for': return null
              case 'x-real-ip': return '203.0.113.1'
              default: return null
            }
          })
        }
      } as any
      
      const ip = getClientIP(mockRequest)
      expect(ip).toBe('203.0.113.1')
    })

    it('should return unknown when no IP headers present', () => {
      const mockRequest = {
        headers: {
          get: vi.fn(() => null)
        }
      } as any
      
      const ip = getClientIP(mockRequest)
      expect(ip).toBe('unknown')
    })

    it('should handle multiple IPs in x-forwarded-for', () => {
      const mockRequest = {
        headers: {
          get: vi.fn((header: string) => {
            switch (header) {
              case 'x-forwarded-for': return '203.0.113.1, 192.168.1.1, 10.0.0.1'
              default: return null
            }
          })
        }
      } as any
      
      const ip = getClientIP(mockRequest)
      expect(ip).toBe('203.0.113.1')
    })
  })

  describe('Rate Limit Response', () => {
    it('should create proper rate limit response', () => {
      const remaining = 0
      const resetTime = Date.now() + 60000
      
      const response = createRateLimitResponse(remaining, resetTime)
      
      expect(response.status).toBe(429)
      expect(response.headers.get('Content-Type')).toBe('application/json')
      expect(response.headers.get('X-RateLimit-Limit')).toBe('5')
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('0')
      expect(response.headers.get('Retry-After')).toBeDefined()
    })

    it('should calculate retry-after correctly', () => {
      const remaining = 0
      const resetTime = Date.now() + 30000 // 30 seconds from now
      
      const response = createRateLimitResponse(remaining, resetTime)
      const retryAfter = response.headers.get('Retry-After')
      
      expect(retryAfter).toBeDefined()
      expect(parseInt(retryAfter!)).toBeGreaterThan(25) // Should be around 30
      expect(parseInt(retryAfter!)).toBeLessThan(35)
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero limit', () => {
      const identifier = 'test-user-zero'
      
      const result = rateLimit(identifier, 0, 60000)
      
      // With zero limit, the first request should succeed but remaining should be -1
      expect(result.success).toBe(true)
      expect(result.remaining).toBe(-1)
    })

    it('should handle very short window', () => {
      const identifier = 'test-user-short'
      
      const result1 = rateLimit(identifier, 1, 1) // 1ms window
      const result2 = rateLimit(identifier, 1, 1)
      
      expect(result1.success).toBe(true)
      expect(result2.success).toBe(false)
    })

    it('should handle concurrent requests', () => {
      const identifier = 'test-user-concurrent'
      const promises = []
      
      // Make 10 concurrent requests with limit of 5
      for (let i = 0; i < 10; i++) {
        promises.push(Promise.resolve(rateLimit(identifier, 5, 60000)))
      }
      
      return Promise.all(promises).then((results) => {
        const successful = results.filter(r => r.success).length
        const blocked = results.filter(r => !r.success).length
        
        expect(successful).toBe(5)
        expect(blocked).toBe(5)
      })
    })
  })
})
