import { vi } from 'vitest'

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key-that-is-long-enough-for-security-testing'
process.env.NODE_ENV = 'test'

// Mock Next.js modules
vi.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    constructor(public url: string, public init?: any) {}
    get headers() {
      return {
        get: vi.fn((name: string) => this.init?.headers?.[name] || null)
      }
    }
    get cookies() {
      return {
        get: vi.fn((name: string) => ({ value: this.init?.cookies?.[name] }))
      }
    }
  },
  NextResponse: {
    next: vi.fn(() => ({ headers: { set: vi.fn() } })),
    redirect: vi.fn(() => ({ cookies: { delete: vi.fn() } })),
    json: vi.fn((data: any, init?: any) => ({ 
      status: init?.status || 200,
      json: () => Promise.resolve(data)
    }))
  }
}))

// Mock database
vi.mock('../../lib/db', () => ({
  query: vi.fn().mockResolvedValue({
    rows: [
      {
        id: 1,
        full_name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date()
      }
    ],
    rowCount: 1
  })
}))

// Mock nodemailer
vi.mock('nodemailer', () => ({
  createTransporter: vi.fn(() => ({
    sendMail: vi.fn().mockResolvedValue(true)
  }))
}))

// Global test utilities
global.console = {
  ...console,
  error: vi.fn(),
  log: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn()
}
