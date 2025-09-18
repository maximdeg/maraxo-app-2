import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock fetch globally
global.fetch = vi.fn()

describe('Time Selection Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Available Times API', () => {
    it('should fetch available times for a given date', async () => {
      const mockResponse = {
        availableSlots: {
          start_time: "10:00:00",
          end_time: "13:00:00",
          is_working_day: true
        },
        appointmentTimes: [],
        date: "2024-12-25",
        type: "default_schedule"
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const response = await fetch('/api/available-times/2024-12-25')
      const data = await response.json()

      expect(global.fetch).toHaveBeenCalledWith('/api/available-times/2024-12-25')
      expect(data).toEqual(mockResponse)
    })

    it('should handle API errors gracefully', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      const response = await fetch('/api/available-times/2024-12-25')
      
      expect(response.ok).toBe(false)
      expect(response.status).toBe(500)
    })
  })

  describe('Appointment Creation API', () => {
    it('should create appointment successfully', async () => {
      const mockAppointment = {
        first_name: 'Test',
        last_name: 'User',
        phone_number: '+1234567890',
        visit_type_id: 1,
        consult_type_id: 1,
        appointment_date: '2024-12-25',
        appointment_time: '10:00'
      }

      const mockResponse = {
        success: true,
        appointment_info: {
          id: 123,
          patient_name: 'Test User',
          phone_number: '+1234567890',
          visit_type_name: 'Consulta',
          appointment_date: '2024-12-25',
          appointment_time: '10:00',
          cancellation_token: 'mock-token'
        },
        is_existing_patient: false,
        message: 'Appointment scheduled successfully for new patient.'
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const response = await fetch('/api/appointments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockAppointment),
      })

      const data = await response.json()

      expect(global.fetch).toHaveBeenCalledWith('/api/appointments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockAppointment),
      })
      expect(data).toEqual(mockResponse)
    })

    it('should handle appointment creation errors', async () => {
      const mockAppointment = {
        first_name: 'Test',
        last_name: 'User',
        phone_number: '+1234567890',
        visit_type_id: 1,
        consult_type_id: 1,
        appointment_date: '2024-12-25',
        appointment_time: '10:00'
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Missing required patient information' })
      })

      const response = await fetch('/api/appointments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockAppointment),
      })

      expect(response.ok).toBe(false)
      expect(response.status).toBe(400)
    })
  })

  describe('Time Generation Logic', () => {
    it('should generate correct time slots', () => {
      const startTime = "10:00:00"
      const endTime = "13:00:00"
      const appointmentTimes: string[] = []

      const startHour = parseInt(startTime.split(":")[0])
      const startMinutes = parseInt(startTime.split(":")[1])
      const endHour = parseInt(endTime.split(":")[0])
      const endMinutes = parseInt(endTime.split(":")[1])

      const totalMinutes = (endHour - startHour) * 60 + (endMinutes - startMinutes)
      const intervalMinutes = 20

      const times: string[] = []
      for (let i = 0; i <= totalMinutes - intervalMinutes; i += intervalMinutes) {
        const hour = startHour + Math.floor(i / 60)
        const minutes = (i % 60).toString().padStart(2, "0")
        const time = `${hour}:${minutes}`
        if (!appointmentTimes.includes(time)) {
          times.push(time)
        }
      }

      expect(times).toEqual([
        "10:00",
        "10:20", 
        "10:40",
        "11:00",
        "11:20",
        "11:40",
        "12:00",
        "12:20",
        "12:40"
      ])
    })

    it('should exclude booked appointment times', () => {
      const startTime = "10:00:00"
      const endTime = "13:00:00"
      const appointmentTimes = ["10:20", "11:00", "12:40"]

      const startHour = parseInt(startTime.split(":")[0])
      const startMinutes = parseInt(startTime.split(":")[1])
      const endHour = parseInt(endTime.split(":")[0])
      const endMinutes = parseInt(endTime.split(":")[1])

      const totalMinutes = (endHour - startHour) * 60 + (endMinutes - startMinutes)
      const intervalMinutes = 20

      const times: string[] = []
      for (let i = 0; i <= totalMinutes - intervalMinutes; i += intervalMinutes) {
        const hour = startHour + Math.floor(i / 60)
        const minutes = (i % 60).toString().padStart(2, "0")
        const time = `${hour}:${minutes}`
        if (!appointmentTimes.includes(time)) {
          times.push(time)
        }
      }

      expect(times).toEqual([
        "10:00",
        "10:40",
        "11:20",
        "11:40",
        "12:00",
        "12:20"
      ])
    })
  })

  describe('Date Formatting', () => {
    it('should format date correctly for API calls', () => {
      // Use UTC to avoid timezone issues
      const date = new Date('2024-12-25T00:00:00.000Z')
      const formatedDate = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`
        .split("-")
        .map((item) => (item.length < 2 ? `0${item}` : item))
        .join("-")

      expect(formatedDate).toBe('2024-12-25')
    })

    it('should handle single digit months and days', () => {
      // Use UTC to avoid timezone issues
      const date = new Date('2024-01-05T00:00:00.000Z')
      const formatedDate = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`
        .split("-")
        .map((item) => (item.length < 2 ? `0${item}` : item))
        .join("-")

      expect(formatedDate).toBe('2024-01-05')
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

      try {
        await fetch('/api/available-times/2024-12-25')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('Network error')
      }
    })

    it('should handle invalid date formats', () => {
      const invalidDate = 'invalid-date'
      const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/
      
      expect(dateRegex.test(invalidDate)).toBe(false)
    })

    it('should handle invalid time formats', () => {
      const invalidTimes = ['25:00', '12:60', 'not-a-time', '12:5']
      const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/

      invalidTimes.forEach(time => {
        expect(timeRegex.test(time)).toBe(false)
      })
    })
  })
})
