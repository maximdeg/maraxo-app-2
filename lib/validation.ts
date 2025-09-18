import { z } from 'zod'

// Common validation patterns
const phoneRegex = /^\+?[\d\s\-\(\)]{10,20}$/
const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/
const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
const dateRegex = /^\d{4}-\d{2}-\d{2}$/

// Login validation
export const loginSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .min(1, 'Email is required')
    .max(255, 'Email too long'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number')
})

// Patient validation
export const patientSchema = z.object({
  first_name: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name too long')
    .regex(nameRegex, 'First name contains invalid characters'),
  last_name: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name too long')
    .regex(nameRegex, 'Last name contains invalid characters'),
  phone_number: z.string()
    .min(10, 'Phone number too short')
    .max(20, 'Phone number too long')
    .regex(phoneRegex, 'Invalid phone number format')
})

// Appointment validation
export const appointmentSchema = z.object({
  patient_id: z.number()
    .int('Patient ID must be an integer')
    .positive('Invalid patient ID'),
  appointment_date: z.string()
    .regex(dateRegex, 'Invalid date format (YYYY-MM-DD)')
    .refine((date) => {
      const appointmentDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return appointmentDate >= today
    }, 'Appointment date cannot be in the past'),
  appointment_time: z.string()
    .regex(timeRegex, 'Invalid time format (HH:MM)'),
  consult_type_id: z.number()
    .int('Consult type ID must be an integer')
    .positive('Invalid consult type ID')
    .optional(),
  visit_type_id: z.number()
    .int('Visit type ID must be an integer')
    .positive('Invalid visit type ID')
    .optional(),
  practice_type_id: z.number()
    .int('Practice type ID must be an integer')
    .min(0, 'Invalid practice type ID')
    .optional(),
  health_insurance: z.string()
    .max(100, 'Health insurance name too long')
    .optional()
})

// New appointment with patient data
export const newAppointmentSchema = z.object({
  first_name: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name too long')
    .regex(nameRegex, 'First name contains invalid characters'),
  last_name: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name too long')
    .regex(nameRegex, 'Last name contains invalid characters'),
  phone_number: z.string()
    .min(10, 'Phone number too short')
    .max(20, 'Phone number too long')
    .regex(phoneRegex, 'Invalid phone number format'),
  appointment_date: z.string()
    .regex(dateRegex, 'Invalid date format (YYYY-MM-DD)')
    .refine((date) => {
      const appointmentDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return appointmentDate >= today
    }, 'Appointment date cannot be in the past'),
  appointment_time: z.string()
    .regex(timeRegex, 'Invalid time format (HH:MM)'),
  consult_type_id: z.number()
    .int('Consult type ID must be an integer')
    .positive('Invalid consult type ID')
    .optional(),
  visit_type_id: z.number()
    .int('Visit type ID must be an integer')
    .positive('Invalid visit type ID')
    .optional(),
  practice_type_id: z.number()
    .int('Practice type ID must be an integer')
    .min(0, 'Invalid practice type ID')
    .optional(),
  health_insurance: z.string()
    .max(100, 'Health insurance name too long')
    .optional()
})

// Password reset validation
export const forgotPasswordSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .min(1, 'Email is required')
})

export const resetPasswordSchema = z.object({
  token: z.string()
    .min(1, 'Reset token is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number')
})

// Cancellation token validation
export const cancellationTokenSchema = z.object({
  token: z.string()
    .min(1, 'Cancellation token is required')
})

// Validation helper function
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: string[]
} {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }
    }
    return {
      success: false,
      errors: ['Validation failed']
    }
  }
}

// Sanitization helper
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes to prevent injection
    .substring(0, 255) // Limit length
}

export function sanitizePhoneNumber(phone: string): string {
  return phone.replace(/[^\d\+\-\(\)\s]/g, '').trim()
}
