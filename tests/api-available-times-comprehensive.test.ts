import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GET } from '@/app/api/available-times/[date]/route';
import { query } from '@/lib/db';

// Mock the database query function
vi.mock('@/lib/db', () => ({
  query: vi.fn()
}));

// Helper function to create test dates
function createTestDates(count: number = 100) {
  const dates = [];
  const startDate = new Date('2024-01-01');
  
  for (let i = 0; i < count; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date);
  }
  
  return dates;
}

// Helper function to create mock database responses
function createMockWorkSchedule(dayOfWeek: number, isWorkingDay: boolean = true) {
  return {
    rows: [{
      start_time: '09:00',
      end_time: '17:00',
      is_working_day: isWorkingDay,
      day_of_week: dayOfWeek
    }]
  };
}

function createMockUnavailableTimeFrames(date: string) {
  return {
    rows: [{
      is_working_day: true,
      start_time: '09:00',
      end_time: '17:00',
      is_confirmed: false
    }]
  };
}

function createMockAppointments(date: string, times: string[] = []) {
  return {
    rows: times.map(time => ({
      appointment_date: date,
      appointment_time: time
    }))
  };
}

describe('Available Times API Comprehensive Tests', () => {
  let mockQuery: any;

  beforeEach(() => {
    mockQuery = vi.mocked(query);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Default Schedule Tests', () => {
    it('should return available slots for Monday', async () => {
      const date = '2024-01-01'; // Monday
      const dayOfWeek = 1;
      
      mockQuery
        .mockResolvedValueOnce(createMockUnavailableTimeFrames(date)) // No custom schedule
        .mockResolvedValueOnce(createMockWorkSchedule(dayOfWeek)) // Default schedule
        .mockResolvedValueOnce(createMockAppointments(date)); // No appointments

      const request = new Request('http://localhost:3000/api/available-times/2024-01-01');
      const response = await GET(request, { params: Promise.resolve({ date }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.type).toBe('default_schedule');
      expect(data.availableSlots).toBeDefined();
      expect(data.appointmentTimes).toEqual([]);
    });

    it('should return available slots for Sunday (non-working day)', async () => {
      const date = '2024-01-07'; // Sunday
      const dayOfWeek = 0;
      
      mockQuery
        .mockResolvedValueOnce(createMockUnavailableTimeFrames(date)) // No custom schedule
        .mockResolvedValueOnce(createMockWorkSchedule(dayOfWeek, false)); // Non-working day

      const request = new Request('http://localhost:3000/api/available-times/2024-01-07');
      const response = await GET(request, { params: Promise.resolve({ date }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('This day is not a working day');
    });

    it('should handle 100+ different dates correctly', async () => {
      const testDates = createTestDates(100);
      
      for (const date of testDates) {
        const dateObj = new Date(date);
        const dayOfWeek = dateObj.getDay();
        
        // Mock different responses based on day of week
        if (dayOfWeek === 0) { // Sunday
          mockQuery
            .mockResolvedValueOnce(createMockUnavailableTimeFrames(date))
            .mockResolvedValueOnce(createMockWorkSchedule(dayOfWeek, false));
        } else if (dayOfWeek === 6) { // Saturday
          mockQuery
            .mockResolvedValueOnce(createMockUnavailableTimeFrames(date))
            .mockResolvedValueOnce(createMockWorkSchedule(dayOfWeek, true))
            .mockResolvedValueOnce(createMockAppointments(date));
        } else { // Weekdays
          mockQuery
            .mockResolvedValueOnce(createMockUnavailableTimeFrames(date))
            .mockResolvedValueOnce(createMockWorkSchedule(dayOfWeek, true))
            .mockResolvedValueOnce(createMockAppointments(date));
        }

        const request = new Request(`http://localhost:3000/api/available-times/${date}`);
        const response = await GET(request, { params: Promise.resolve({ date }) });
        
        if (dayOfWeek === 0) {
          expect(response.status).toBe(404);
        } else {
          expect(response.status).toBe(200);
          const data = await response.json();
          expect(data.type).toBe('default_schedule');
          expect(data.availableSlots).toBeDefined();
        }
      }
    });
  });

  describe('Custom Schedule Tests', () => {
    it('should return custom schedule when available', async () => {
      const date = '2024-01-01';
      
      mockQuery.mockResolvedValueOnce({
        rows: [{
          is_working_day: true,
          start_time: '10:00',
          end_time: '16:00',
          is_confirmed: false
        }]
      });

      const request = new Request('http://localhost:3000/api/available-times/2024-01-01');
      const response = await GET(request, { params: Promise.resolve({ date }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.type).toBe('custom_schedule');
      expect(data.availableSlots).toBeDefined();
    });

    it('should return unavailable when custom schedule is confirmed', async () => {
      const date = '2024-01-01';
      
      mockQuery.mockResolvedValueOnce({
        rows: [{
          is_working_day: true,
          start_time: '10:00',
          end_time: '16:00',
          is_confirmed: true
        }]
      });

      const request = new Request('http://localhost:3000/api/available-times/2024-01-01');
      const response = await GET(request, { params: Promise.resolve({ date }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('This day is unavailable');
      expect(data.reason).toBe('Day marked as unavailable');
    });

    it('should return unavailable when custom schedule is not a working day', async () => {
      const date = '2024-01-01';
      
      mockQuery.mockResolvedValueOnce({
        rows: [{
          is_working_day: false,
          start_time: '10:00',
          end_time: '16:00',
          is_confirmed: false
        }]
      });

      const request = new Request('http://localhost:3000/api/available-times/2024-01-01');
      const response = await GET(request, { params: Promise.resolve({ date }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('This day is unavailable');
      expect(data.reason).toBe('Not a working day');
    });
  });

  describe('Appointment Integration Tests', () => {
    it('should return existing appointments for the date', async () => {
      const date = '2024-01-01';
      const appointmentTimes = ['10:00', '14:00', '16:00'];
      
      mockQuery
        .mockResolvedValueOnce(createMockUnavailableTimeFrames(date))
        .mockResolvedValueOnce(createMockWorkSchedule(1, true))
        .mockResolvedValueOnce(createMockAppointments(date, appointmentTimes));

      const request = new Request('http://localhost:3000/api/available-times/2024-01-01');
      const response = await GET(request, { params: Promise.resolve({ date }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.appointmentTimes).toEqual(appointmentTimes);
    });

    it('should handle dates with many appointments', async () => {
      const date = '2024-01-01';
      const appointmentTimes = Array.from({ length: 20 }, (_, i) => 
        `${9 + Math.floor(i / 3)}:${(i % 3) * 20 === 0 ? '00' : (i % 3) * 20}`
      );
      
      mockQuery
        .mockResolvedValueOnce(createMockUnavailableTimeFrames(date))
        .mockResolvedValueOnce(createMockWorkSchedule(1, true))
        .mockResolvedValueOnce(createMockAppointments(date, appointmentTimes));

      const request = new Request('http://localhost:3000/api/available-times/2024-01-01');
      const response = await GET(request, { params: Promise.resolve({ date }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.appointmentTimes).toEqual(appointmentTimes);
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle invalid date format', async () => {
      const date = 'invalid-date';
      
      const request = new Request('http://localhost:3000/api/available-times/invalid-date');
      const response = await GET(request, { params: Promise.resolve({ date }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid date format');
    });

    it('should handle database errors gracefully', async () => {
      const date = '2024-01-01';
      
      mockQuery.mockRejectedValueOnce(new Error('Database connection failed'));

      const request = new Request('http://localhost:3000/api/available-times/2024-01-01');
      const response = await GET(request, { params: Promise.resolve({ date }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch available times');
    });

    it('should handle missing available slots', async () => {
      const date = '2024-01-01';
      
      mockQuery
        .mockResolvedValueOnce(createMockUnavailableTimeFrames(date))
        .mockResolvedValueOnce({ rows: [] }); // No available slots

      const request = new Request('http://localhost:3000/api/available-times/2024-01-01');
      const response = await GET(request, { params: Promise.resolve({ date }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('No available slots configured for this day of week');
    });
  });

  describe('Edge Cases Tests', () => {
    it('should handle leap year dates correctly', async () => {
      const leapYearDates = [
        '2024-02-29', // Leap year
        '2024-12-31', // End of leap year
        '2025-01-01', // After leap year
      ];

      for (const date of leapYearDates) {
        const dateObj = new Date(date);
        const dayOfWeek = dateObj.getDay();
        
        mockQuery
          .mockResolvedValueOnce(createMockUnavailableTimeFrames(date))
          .mockResolvedValueOnce(createMockWorkSchedule(dayOfWeek, true))
          .mockResolvedValueOnce(createMockAppointments(date));

        const request = new Request(`http://localhost:3000/api/available-times/${date}`);
        const response = await GET(request, { params: Promise.resolve({ date }) });
        
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.type).toBe('default_schedule');
      }
    });

    it('should handle timezone edge cases', async () => {
      const timezoneDates = [
        '2024-01-01T00:00:00Z',
        '2024-01-01T23:59:59Z',
        '2024-12-31T00:00:00Z',
        '2024-12-31T23:59:59Z',
      ];

      for (const date of timezoneDates) {
        const dateObj = new Date(date);
        const dayOfWeek = dateObj.getDay();
        
        mockQuery
          .mockResolvedValueOnce(createMockUnavailableTimeFrames(date))
          .mockResolvedValueOnce(createMockWorkSchedule(dayOfWeek, true))
          .mockResolvedValueOnce(createMockAppointments(date));

        const request = new Request(`http://localhost:3000/api/available-times/${date}`);
        const response = await GET(request, { params: Promise.resolve({ date }) });
        
        expect(response.status).toBe(200);
      }
    });

    it('should handle year boundaries correctly', async () => {
      const yearBoundaryDates = [
        '2023-12-31',
        '2024-01-01',
        '2024-12-31',
        '2025-01-01',
      ];

      for (const date of yearBoundaryDates) {
        const dateObj = new Date(date);
        const dayOfWeek = dateObj.getDay();
        
        mockQuery
          .mockResolvedValueOnce(createMockUnavailableTimeFrames(date))
          .mockResolvedValueOnce(createMockWorkSchedule(dayOfWeek, true))
          .mockResolvedValueOnce(createMockAppointments(date));

        const request = new Request(`http://localhost:3000/api/available-times/${date}`);
        const response = await GET(request, { params: Promise.resolve({ date }) });
        
        expect(response.status).toBe(200);
      }
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent requests efficiently', async () => {
      const dates = createTestDates(10);
      const promises = dates.map(date => {
        const dateStr = date.toISOString().split('T')[0];
        const dateObj = new Date(dateStr);
        const dayOfWeek = dateObj.getDay();
        
        mockQuery
          .mockResolvedValueOnce(createMockUnavailableTimeFrames(dateStr))
          .mockResolvedValueOnce(createMockWorkSchedule(dayOfWeek, true))
          .mockResolvedValueOnce(createMockAppointments(dateStr));

        const request = new Request(`http://localhost:3000/api/available-times/${dateStr}`);
        return GET(request, { params: Promise.resolve({ date: dateStr }) });
      });

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('should handle large date ranges efficiently', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const dates = [];
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }

      // Test a subset of dates to avoid timeout
      const testDates = dates.slice(0, 50);
      
      for (const date of testDates) {
        const dateStr = date.toISOString().split('T')[0];
        const dateObj = new Date(dateStr);
        const dayOfWeek = dateObj.getDay();
        
        mockQuery
          .mockResolvedValueOnce(createMockUnavailableTimeFrames(dateStr))
          .mockResolvedValueOnce(createMockWorkSchedule(dayOfWeek, true))
          .mockResolvedValueOnce(createMockAppointments(dateStr));

        const request = new Request(`http://localhost:3000/api/available-times/${dateStr}`);
        const response = await GET(request, { params: Promise.resolve({ date: dateStr }) });
        
        expect(response.status).toBe(200);
      }
    });
  });
});
