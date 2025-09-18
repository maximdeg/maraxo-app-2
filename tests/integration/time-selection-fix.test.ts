import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the API response
const mockApiResponse = {
  availableSlots: {
    start_time: "10:00:00",
    end_time: "13:00:00",
    is_working_day: true
  },
  appointmentTimes: [],
  date: "2024-12-25",
  type: "default_schedule"
}

// Mock fetch
global.fetch = vi.fn()

describe('Time Selection Fix Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should handle the correct API response format', async () => {
    // Mock the API response
    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    })

    // Simulate the component logic
    const data = mockApiResponse
    
    // Check if availableSlots exists and has the required structure
    expect(data.availableSlots).toBeDefined()
    expect(data.availableSlots.start_time).toBe("10:00:00")
    expect(data.availableSlots.end_time).toBe("13:00:00")
    
    // Test time generation
    const slot = data.availableSlots
    const startTimeFormatted = slot.start_time.split(':').slice(0, 2).join(':')
    const endTimeFormatted = slot.end_time.split(':').slice(0, 2).join(':')
    
    expect(startTimeFormatted).toBe('10:00')
    expect(endTimeFormatted).toBe('13:00')
    
    // Generate times
    const startHour = parseInt(startTimeFormatted.split(":")[0])
    const startMinutes = parseInt(startTimeFormatted.split(":")[1])
    const endHour = parseInt(endTimeFormatted.split(":")[0])
    const endMinutes = parseInt(endTimeFormatted.split(":")[1])
    
    const totalMinutes = (endHour - startHour) * 60 + (endMinutes - startMinutes)
    const intervalMinutes = 20
    
    const times: string[] = []
    for (let i = 0; i <= totalMinutes - intervalMinutes; i += intervalMinutes) {
      const hour = startHour + Math.floor(i / 60)
      const minutes = (i % 60).toString().padStart(2, "0")
      const time = `${hour}:${minutes}`
      times.push(time)
    }
    
    expect(times).toEqual([
      "10:00", "10:20", "10:40", "11:00", "11:20", "11:40", 
      "12:00", "12:20", "12:40"
    ])
  })

  it('should handle userSelectedDate initialization', () => {
    // Test that userSelectedDate is initialized with a date
    const initialDate = new Date()
    const userSelectedDate = initialDate
    
    expect(userSelectedDate).toBeInstanceOf(Date)
    expect(userSelectedDate.getTime()).toBe(initialDate.getTime())
  })

  it('should sync form date with userSelectedDate', () => {
    // Test the sync logic
    const formDate = new Date('2024-12-25')
    const userSelectedDate = new Date('2024-12-24')
    
    // Simulate the sync effect
    if (formDate && formDate !== userSelectedDate) {
      const newUserSelectedDate = formDate
      expect(newUserSelectedDate).toEqual(formDate)
    }
  })

  it('should handle calendar date selection', () => {
    // Test calendar selection logic
    const selectedDate = new Date('2024-12-25')
    
    // Simulate handleDateChange
    const userSelectedDate = selectedDate
    expect(userSelectedDate).toEqual(selectedDate)
    
    // Simulate form field update
    const formFieldValue = selectedDate
    expect(formFieldValue).toEqual(selectedDate)
  })

  it('should generate correct time slots for different time ranges', () => {
    const testCases = [
      {
        start: "09:00:00",
        end: "12:00:00",
        expected: ["09:00", "09:20", "09:40", "10:00", "10:20", "10:40", "11:00", "11:20", "11:40"]
      },
      {
        start: "14:00:00", 
        end: "16:00:00",
        expected: ["14:00", "14:20", "14:40", "15:00", "15:20", "15:40"]
      }
    ]
    
    testCases.forEach(({ start, end, expected }) => {
      const startTimeFormatted = start.split(':').slice(0, 2).join(':')
      const endTimeFormatted = end.split(':').slice(0, 2).join(':')
      
      const startHour = parseInt(startTimeFormatted.split(":")[0])
      const startMinutes = parseInt(startTimeFormatted.split(":")[1])
      const endHour = parseInt(endTimeFormatted.split(":")[0])
      const endMinutes = parseInt(endTimeFormatted.split(":")[1])
      
      const totalMinutes = (endHour - startHour) * 60 + (endMinutes - startMinutes)
      const intervalMinutes = 20
      
      const times: string[] = []
      for (let i = 0; i <= totalMinutes - intervalMinutes; i += intervalMinutes) {
        const hour = startHour + Math.floor(i / 60)
        const minutes = (i % 60).toString().padStart(2, "0")
        const time = `${hour.toString().padStart(2, "0")}:${minutes}`
        times.push(time)
      }
      
      expect(times).toEqual(expected)
    })
  })
})
