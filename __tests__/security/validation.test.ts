import { describe, it, expect } from 'vitest'
import { 
  validateInput, 
  loginSchema, 
  patientSchema, 
  appointmentSchema,
  newAppointmentSchema,
  sanitizeString,
  sanitizePhoneNumber
} from '../../lib/validation'

describe('Input Validation Security Tests', () => {
  describe('Login Validation', () => {
    it('should accept valid login credentials', () => {
      const validData = {
        email: 'test@example.com',
        password: 'SecurePass123'
      }
      
      const result = validateInput(loginSchema, validData)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(validData)
    })

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test.example.com',
        '',
        'test@example',
        'test..test@example.com'
      ]
      
      invalidEmails.forEach(email => {
        const result = validateInput(loginSchema, {
          email,
          password: 'SecurePass123'
        })
        expect(result.success).toBe(false)
        expect(result.errors).toContain('email: Invalid email format')
      })
    })

    it('should reject weak passwords', () => {
      const weakPasswords = [
        'short',
        '12345678', // no letters
        'password', // no numbers or uppercase
        'PASSWORD', // no lowercase or numbers
        'Password', // no numbers
        '', // empty
        'a'.repeat(129) // too long
      ]
      
      weakPasswords.forEach(password => {
        const result = validateInput(loginSchema, {
          email: 'test@example.com',
          password
        })
        expect(result.success).toBe(false)
      })
    })

    it('should accept strong passwords', () => {
      const strongPasswords = [
        'SecurePass123',
        'MyStr0ng!Pass',
        'ComplexP@ssw0rd',
        'Test123456'
      ]
      
      strongPasswords.forEach(password => {
        const result = validateInput(loginSchema, {
          email: 'test@example.com',
          password
        })
        expect(result.success).toBe(true)
      })
    })
  })

  describe('Patient Validation', () => {
    it('should accept valid patient data', () => {
      const validData = {
        first_name: 'Juan',
        last_name: 'Pérez',
        phone_number: '+54 11 1234-5678'
      }
      
      const result = validateInput(patientSchema, validData)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(validData)
    })

    it('should reject invalid names', () => {
      const invalidNames = [
        'J0hn', // contains numbers
        'John@Doe', // contains special characters
        'A', // too short
        'A'.repeat(51), // too long
        '', // empty
        'John<script>', // contains HTML
        'John"O\'Connor' // contains quotes
      ]
      
      invalidNames.forEach(name => {
        const result = validateInput(patientSchema, {
          first_name: name,
          last_name: 'Valid',
          phone_number: '+54 11 1234-5678'
        })
        expect(result.success).toBe(false)
      })
    })

    it('should reject invalid phone numbers', () => {
      const invalidPhones = [
        '123', // too short
        'A'.repeat(21), // too long
        'abc-def-ghij', // contains letters
        '', // empty
        '123-456-789-012-345-678', // too many digits
        '123@456#789' // invalid characters
      ]
      
      invalidPhones.forEach(phone => {
        const result = validateInput(patientSchema, {
          first_name: 'Juan',
          last_name: 'Pérez',
          phone_number: phone
        })
        expect(result.success).toBe(false)
      })
    })

    it('should accept various valid phone formats', () => {
      const validPhones = [
        '+54 11 1234-5678',
        '011-1234-5678',
        '(011) 1234-5678',
        '+1 555 123 4567',
        '555.123.4567',
        '555 123 4567'
      ]
      
      validPhones.forEach(phone => {
        const result = validateInput(patientSchema, {
          first_name: 'Juan',
          last_name: 'Pérez',
          phone_number: phone
        })
        expect(result.success).toBe(true)
      })
    })
  })

  describe('Appointment Validation', () => {
    it('should accept valid appointment data', () => {
      const validData = {
        patient_id: 1,
        appointment_date: '2024-12-25',
        appointment_time: '14:30',
        consult_type_id: 1,
        visit_type_id: 1,
        practice_type_id: 1,
        health_insurance: 'OSDE'
      }
      
      const result = validateInput(appointmentSchema, validData)
      expect(result.success).toBe(true)
    })

    it('should reject past dates', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const pastDate = yesterday.toISOString().split('T')[0]
      
      const result = validateInput(appointmentSchema, {
        patient_id: 1,
        appointment_date: pastDate,
        appointment_time: '14:30'
      })
      
      expect(result.success).toBe(false)
      expect(result.errors).toContain('appointment_date: Appointment date cannot be in the past')
    })

    it('should reject invalid date formats', () => {
      const invalidDates = [
        '25-12-2024', // wrong format
        '2024/12/25', // wrong separator
        '2024-13-25', // invalid month
        '2024-12-32', // invalid day
        'not-a-date',
        ''
      ]
      
      invalidDates.forEach(date => {
        const result = validateInput(appointmentSchema, {
          patient_id: 1,
          appointment_date: date,
          appointment_time: '14:30'
        })
        expect(result.success).toBe(false)
      })
    })

    it('should reject invalid time formats', () => {
      const invalidTimes = [
        '25:30', // invalid hour
        '14:60', // invalid minute
        '14.30', // wrong separator
        '2:30', // should be 02:30
        'not-a-time',
        ''
      ]
      
      invalidTimes.forEach(time => {
        const result = validateInput(appointmentSchema, {
          patient_id: 1,
          appointment_date: '2024-12-25',
          appointment_time: time
        })
        expect(result.success).toBe(false)
      })
    })

    it('should reject invalid patient IDs', () => {
      const invalidIds = [
        0, // zero
        -1, // negative
        1.5, // decimal
        '1', // string
        null,
        undefined
      ]
      
      invalidIds.forEach(id => {
        const result = validateInput(appointmentSchema, {
          patient_id: id,
          appointment_date: '2024-12-25',
          appointment_time: '14:30'
        })
        expect(result.success).toBe(false)
      })
    })
  })

  describe('New Appointment Validation', () => {
    it('should accept valid new appointment data', () => {
      const validData = {
        first_name: 'Juan',
        last_name: 'Pérez',
        phone_number: '+54 11 1234-5678',
        appointment_date: '2024-12-25',
        appointment_time: '14:30',
        consult_type_id: 1,
        visit_type_id: 1,
        practice_type_id: 1,
        health_insurance: 'OSDE'
      }
      
      const result = validateInput(newAppointmentSchema, validData)
      expect(result.success).toBe(true)
    })

    it('should reject appointments with invalid patient data', () => {
      const result = validateInput(newAppointmentSchema, {
        first_name: 'J0hn', // invalid name
        last_name: 'Doe',
        phone_number: '123', // invalid phone
        appointment_date: '2024-12-25',
        appointment_time: '14:30'
      })
      
      expect(result.success).toBe(false)
      expect(result.errors).toContain('first_name: First name contains invalid characters')
      expect(result.errors).toContain('phone_number: Phone number too short')
    })
  })

  describe('Sanitization Functions', () => {
    it('should sanitize strings correctly', () => {
      const testCases = [
        { input: '  Hello World  ', expected: 'Hello World' },
        { input: 'Test<script>alert("xss")</script>', expected: 'Testalert("xss")' },
        { input: 'Test"quotes"', expected: 'Testquotes' },
        { input: 'A'.repeat(300), expected: 'A'.repeat(255) },
        { input: 'Normal text', expected: 'Normal text' }
      ]
      
      testCases.forEach(({ input, expected }) => {
        const result = sanitizeString(input)
        expect(result).toBe(expected)
      })
    })

    it('should sanitize phone numbers correctly', () => {
      const testCases = [
        { input: '+54 11 1234-5678', expected: '+54 11 1234-5678' },
        { input: 'abc123def456', expected: '123456' },
        { input: '555-123-4567', expected: '555-123-4567' },
        { input: '555@123#4567', expected: '5551234567' },
        { input: '  +1 555 123 4567  ', expected: '+1 555 123 4567' }
      ]
      
      testCases.forEach(({ input, expected }) => {
        const result = sanitizePhoneNumber(input)
        expect(result).toBe(expected)
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle null and undefined inputs', () => {
      const result1 = validateInput(loginSchema, null)
      const result2 = validateInput(loginSchema, undefined)
      
      expect(result1.success).toBe(false)
      expect(result2.success).toBe(false)
    })

    it('should handle empty objects', () => {
      const result = validateInput(loginSchema, {})
      
      expect(result.success).toBe(false)
      expect(result.errors).toContain('email: Invalid email format')
      expect(result.errors).toContain('password: Password must be at least 8 characters')
    })

    it('should handle extra properties', () => {
      const result = validateInput(loginSchema, {
        email: 'test@example.com',
        password: 'SecurePass123',
        extraProperty: 'should be ignored'
      })
      
      expect(result.success).toBe(true)
      expect(result.data).not.toHaveProperty('extraProperty')
    })

    it('should handle very long inputs', () => {
      const longString = 'A'.repeat(1000)
      
      const result = validateInput(loginSchema, {
        email: longString,
        password: 'SecurePass123'
      })
      
      expect(result.success).toBe(false)
      expect(result.errors).toContain('email: Email too long')
    })
  })
})
