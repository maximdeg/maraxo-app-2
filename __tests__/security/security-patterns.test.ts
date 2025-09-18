import { describe, it, expect } from 'vitest'

describe('Security Pattern Tests', () => {
  describe('Input Validation Patterns', () => {
    it('should validate email format correctly', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'admin+test@company.org'
      ]
      
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test.example.com',
        'test@.com',
        'test@domain.',
        ''
      ]
      
      validEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(true)
      })
      
      invalidEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(false)
      })
    })

    it('should validate password strength', () => {
      const strongPasswords = [
        'SecurePass123',
        'MyStr0ng!Pass',
        'ComplexP@ssw0rd',
        'Test123456'
      ]
      
      const weakPasswords = [
        'short',
        '12345678',
        'password',
        'PASSWORD',
        'Password',
        'password123',
        'PASSWORD123'
      ]
      
      strongPasswords.forEach(password => {
        const hasLower = /[a-z]/.test(password)
        const hasUpper = /[A-Z]/.test(password)
        const hasNumber = /\d/.test(password)
        const isLongEnough = password.length >= 8
        
        expect(hasLower && hasUpper && hasNumber && isLongEnough).toBe(true)
      })
      
      weakPasswords.forEach(password => {
        const hasLower = /[a-z]/.test(password)
        const hasUpper = /[A-Z]/.test(password)
        const hasNumber = /\d/.test(password)
        const isLongEnough = password.length >= 8
        
        expect(hasLower && hasUpper && hasNumber && isLongEnough).toBe(false)
      })
    })

    it('should validate phone number format', () => {
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,20}$/
      
      const validPhones = [
        '+54 11 1234-5678',
        '011-1234-5678',
        '(011) 1234-5678',
        '+1 555 123 4567',
        '555 123 4567'
      ]
      
      const invalidPhones = [
        '123',
        'abc-def-ghij',
        '',
        '123-456-789-012-345-678',
        '555@123#4567'
      ]
      
      validPhones.forEach(phone => {
        expect(phoneRegex.test(phone)).toBe(true)
      })
      
      invalidPhones.forEach(phone => {
        expect(phoneRegex.test(phone)).toBe(false)
      })
    })

    it('should validate date format', () => {
      const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/
      
      const validDates = [
        '2024-12-25',
        '2024-01-01',
        '2024-12-31',
        '2024-02-29' // Leap year
      ]
      
      const invalidDates = [
        '25-12-2024',
        '2024/12/25',
        '2024-13-25',
        '2024-12-32',
        'not-a-date',
        '2024-2-25',
        '24-12-25'
      ]
      
      validDates.forEach(date => {
        expect(dateRegex.test(date)).toBe(true)
      })
      
      invalidDates.forEach(date => {
        expect(dateRegex.test(date)).toBe(false)
      })
    })

    it('should validate time format', () => {
      const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/
      
      const validTimes = [
        '09:00',
        '14:30',
        '23:59',
        '00:00',
        '12:00'
      ]
      
      const invalidTimes = [
        '25:30',
        '14:60',
        '14.30',
        '2:30',
        'not-a-time',
        '14:5',
        '9:00'
      ]
      
      validTimes.forEach(time => {
        expect(timeRegex.test(time)).toBe(true)
      })
      
      invalidTimes.forEach(time => {
        expect(timeRegex.test(time)).toBe(false)
      })
    })
  })

  describe('Security Threat Detection', () => {
    it('should detect SQL injection attempts', () => {
      const maliciousInputs = [
        "'; DROP TABLE users; --",
        "1' OR '1'='1",
        "admin'--",
        "'; INSERT INTO users VALUES ('hacker', 'password'); --",
        "1' UNION SELECT * FROM users--",
        "admin' OR 1=1--"
      ]
      
      maliciousInputs.forEach(input => {
        // Check for common SQL injection patterns
        const hasSQLKeywords = /(DROP|INSERT|DELETE|UPDATE|SELECT|UNION|OR|AND)/i.test(input)
        const hasQuotes = /['"]/.test(input)
        const hasSemicolon = /;/.test(input)
        const hasComment = /--/.test(input)
        
        expect(hasSQLKeywords || hasQuotes || hasSemicolon || hasComment).toBe(true)
      })
    })

    it('should detect XSS attempts', () => {
      const xssInputs = [
        '<script>alert("xss")</script>',
        '"><script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src=x onerror=alert("xss")>',
        '<iframe src="javascript:alert(\'xss\')"></iframe>',
        '<svg onload=alert("xss")>',
        '"><img src=x onerror=alert("xss")>'
      ]
      
      xssInputs.forEach(input => {
        // Check for common XSS patterns
        const hasScript = /<script/i.test(input)
        const hasJavascript = /javascript:/i.test(input)
        const hasOnError = /onerror/i.test(input)
        const hasOnLoad = /onload/i.test(input)
        const hasHTMLTags = /<[^>]*>/i.test(input)
        
        expect(hasScript || hasJavascript || hasOnError || hasOnLoad || hasHTMLTags).toBe(true)
      })
    })

    it('should detect path traversal attempts', () => {
      const pathTraversalInputs = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
        '....//....//....//etc/passwd',
        '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
        '..%252f..%252f..%252fetc%252fpasswd'
      ]
      
      pathTraversalInputs.forEach(input => {
        // Check for path traversal patterns
        const hasParentDir = /\.\./.test(input)
        const hasEncodedParentDir = /%2e%2e|%252e%252e/.test(input)
        const hasBackslashes = /\\\.\./.test(input)
        
        expect(hasParentDir || hasEncodedParentDir || hasBackslashes).toBe(true)
      })
    })

    it('should detect command injection attempts', () => {
      const commandInjectionInputs = [
        '; ls -la',
        '| cat /etc/passwd',
        '&& whoami',
        '`id`',
        '$(whoami)',
        '; rm -rf /',
        '| nc -l 4444'
      ]
      
      commandInjectionInputs.forEach(input => {
        // Check for command injection patterns
        const hasSemicolon = /;/.test(input)
        const hasPipe = /\|/.test(input)
        const hasAmpersand = /&&/.test(input)
        const hasBackticks = /`/.test(input)
        const hasDollarParen = /\$\(/.test(input)
        
        expect(hasSemicolon || hasPipe || hasAmpersand || hasBackticks || hasDollarParen).toBe(true)
      })
    })
  })

  describe('Data Sanitization', () => {
    it('should sanitize HTML tags', () => {
      const testCases = [
        { input: 'Hello <script>alert("xss")</script> World', expected: 'Hello alert("xss") World' },
        { input: 'Test <img src=x onerror=alert("xss")>', expected: 'Test ' },
        { input: 'Normal text', expected: 'Normal text' },
        { input: '<div>Content</div>', expected: 'Content' }
      ]
      
      testCases.forEach(({ input, expected }) => {
        const result = input.replace(/<[^>]*>/g, '')
        expect(result).toBe(expected)
      })
    })

    it('should sanitize quotes and special characters', () => {
      const testCases = [
        { input: 'Test"quotes"', expected: 'Testquotes' },
        { input: "Test'apostrophes'", expected: 'Testapostrophes' },
        { input: 'Test<script>', expected: 'Testscript' },
        { input: 'Test>content<', expected: 'Testcontent' }
      ]
      
      testCases.forEach(({ input, expected }) => {
        const result = input.replace(/['"<>]/g, '')
        expect(result).toBe(expected)
      })
    })

    it('should limit string length', () => {
      const longString = 'A'.repeat(1000)
      const maxLength = 255
      
      const result = longString.substring(0, maxLength)
      
      expect(result.length).toBe(maxLength)
      expect(result).toBe('A'.repeat(maxLength))
    })

    it('should sanitize phone numbers', () => {
      const testCases = [
        { input: '+54 11 1234-5678', expected: '+54 11 1234-5678' },
        { input: 'abc123def456', expected: '123456' },
        { input: '555-123-4567', expected: '555-123-4567' },
        { input: '555@123#4567', expected: '5551234567' },
        { input: '  +1 555 123 4567  ', expected: '+1 555 123 4567' }
      ]
      
      testCases.forEach(({ input, expected }) => {
        const result = input.replace(/[^\d\+\-\(\)\s]/g, '').trim()
        expect(result).toBe(expected)
      })
    })
  })

  describe('Environment Security', () => {
    it('should validate JWT secret strength', () => {
      const strongSecrets = [
        'super-secret-key-that-is-very-long-and-secure',
        'a'.repeat(64),
        'MyVerySecureSecretKey12345678901234567890'
      ]
      
      const weakSecrets = [
        'short',
        'password',
        'secret',
        '123456789012345678901234567890' // exactly 30 chars
      ]
      
      strongSecrets.forEach(secret => {
        expect(secret.length).toBeGreaterThanOrEqual(32)
        expect(secret.length).toBeLessThanOrEqual(512)
      })
      
      weakSecrets.forEach(secret => {
        expect(secret.length).toBeLessThan(32)
      })
    })

    it('should validate environment variable names', () => {
      const validEnvVars = [
        'JWT_SECRET',
        'DATABASE_URL',
        'API_KEY',
        'NODE_ENV'
      ]
      
      const invalidEnvVars = [
        'jwt-secret', // lowercase with dash
        'JWT SECRET', // with space
        'JWT_SECRET!', // with special char
        '123JWT_SECRET', // starting with number
        '' // empty
      ]
      
      const envVarRegex = /^[A-Z][A-Z0-9_]*$/
      
      validEnvVars.forEach(envVar => {
        expect(envVarRegex.test(envVar)).toBe(true)
      })
      
      invalidEnvVars.forEach(envVar => {
        expect(envVarRegex.test(envVar)).toBe(false)
      })
    })
  })

  describe('Rate Limiting Patterns', () => {
    it('should validate rate limit configurations', () => {
      const validConfigs = [
        { limit: 5, window: 60000 }, // 5 requests per minute
        { limit: 100, window: 3600000 }, // 100 requests per hour
        { limit: 1, window: 1000 } // 1 request per second
      ]
      
      const invalidConfigs = [
        { limit: -1, window: 60000 }, // negative limit
        { limit: 5, window: -1000 }, // negative window
        { limit: 0, window: 60000 }, // zero limit
        { limit: 5, window: 0 } // zero window
      ]
      
      validConfigs.forEach(config => {
        expect(config.limit).toBeGreaterThan(0)
        expect(config.window).toBeGreaterThan(0)
      })
      
      invalidConfigs.forEach(config => {
        expect(config.limit <= 0 || config.window <= 0).toBe(true)
      })
    })

    it('should validate IP address formats', () => {
      const validIPs = [
        '192.168.1.1',
        '10.0.0.1',
        '172.16.0.1',
        '203.0.113.1',
        '::1'
      ]
      
      const invalidIPs = [
        '256.256.256.256',
        '192.168.1',
        'not-an-ip',
        '192.168.1.1.1',
        ''
      ]
      
      const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
      
      validIPs.forEach(ip => {
        const isValid = ipv4Regex.test(ip) || ipv6Regex.test(ip) || ip === '::1'
        expect(isValid).toBe(true)
      })
      
      invalidIPs.forEach(ip => {
        const isValid = ipv4Regex.test(ip) || ipv6Regex.test(ip)
        expect(isValid).toBe(false)
      })
    })
  })
})
