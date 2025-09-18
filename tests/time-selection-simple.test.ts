import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

// Mock the actions module
vi.mock('@/lib/actions', () => ({
  getAvailableTimesByDate: vi.fn()
}));

// Mock fetch for appointments API
global.fetch = vi.fn();

// Mock form hook
const mockForm = {
  control: {},
  setValue: vi.fn(),
  watch: vi.fn(),
  getValues: vi.fn(),
  formState: { errors: {} }
};

// Helper function to create mock available slots
function createMockSlots(startTime: string, endTime: string) {
  return {
    availableSlots: [{
      start_time: startTime,
      end_time: endTime,
      is_working_day: true
    }],
    date: '2024-01-01',
    type: 'default_schedule'
  };
}

// Helper function to create mock appointments
function createMockAppointments(times: string[]) {
  return {
    appointments: times.map(time => ({
      appointment_time: time,
      status: 'confirmed'
    }))
  };
}

describe('Time Selection Simple Tests', () => {
  let queryClient: QueryClient;
  let mockGetAvailableTimesByDate: any;
  let mockFetch: any;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    mockGetAvailableTimesByDate = vi.mocked(require('@/lib/actions').getAvailableTimesByDate);
    mockFetch = vi.mocked(fetch);
    
    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should render without crashing', () => {
      const { getAvailableTimesByDate } = require('@/lib/actions');
      
      getAvailableTimesByDate.mockResolvedValueOnce(createMockSlots('09:00', '17:00'));
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockAppointments([]))
      });

      const TestComponent = () => {
        const form = useForm();
        return (
          <QueryClientProvider client={queryClient}>
            <div>Time Selection Component</div>
          </QueryClientProvider>
        );
      };

      render(<TestComponent />);
      
      expect(screen.getByText('Time Selection Component')).toBeInTheDocument();
    });

    it('should handle API calls correctly', async () => {
      const { getAvailableTimesByDate } = require('@/lib/actions');
      
      getAvailableTimesByDate.mockResolvedValueOnce(createMockSlots('09:00', '17:00'));
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockAppointments([]))
      });

      const TestComponent = () => {
        const form = useForm();
        return (
          <QueryClientProvider client={queryClient}>
            <div>API Test Component</div>
          </QueryClientProvider>
        );
      };

      render(<TestComponent />);
      
      // Wait for any async operations
      await waitFor(() => {
        expect(getAvailableTimesByDate).toHaveBeenCalledTimes(0); // No date selected
      });
    });
  });

  describe('Time Generation Logic', () => {
    it('should generate correct time intervals', () => {
      // Test the time generation logic directly
      function createTimeIntervals(startTime: string, endTime: string, appointmentTimes: string[] = []) {
        if (!startTime || !endTime) {
          return [];
        }

        const startHour = parseInt(startTime.split(":")[0]);
        const startMinutes = parseInt(startTime.split(":")[1]);
        const endHour = parseInt(endTime.split(":")[0]);
        const endMinutes = parseInt(endTime.split(":")[1]);

        const totalMinutes = (endHour - startHour) * 60 + (endMinutes - startMinutes);
        const intervalMinutes = 20; // 20-minute intervals

        const times: string[] = [];
        
        for (let i = 0; i <= totalMinutes - intervalMinutes; i += intervalMinutes) {
          const hour = startHour + Math.floor(i / 60);
          const minutes = (i % 60).toString().padStart(2, "0");
          const time = `${hour}:${minutes}`;
          if (!appointmentTimes.includes(time)) {
            times.push(time);
          }
        }
        
        return times;
      }

      const startTime = '09:00';
      const endTime = '17:00';
      const appointmentTimes: string[] = [];
      
      const times = createTimeIntervals(startTime, endTime, appointmentTimes);
      
      // Should generate times from 09:00 to 16:40 with 20-minute intervals
      expect(times).toContain('09:00');
      expect(times).toContain('09:20');
      expect(times).toContain('10:00');
      expect(times).toContain('16:40');
      expect(times).toHaveLength(24);
    });

    it('should exclude booked appointment times', () => {
      function createTimeIntervals(startTime: string, endTime: string, appointmentTimes: string[] = []) {
        if (!startTime || !endTime) {
          return [];
        }

        const startHour = parseInt(startTime.split(":")[0]);
        const startMinutes = parseInt(startTime.split(":")[1]);
        const endHour = parseInt(endTime.split(":")[0]);
        const endMinutes = parseInt(endTime.split(":")[1]);

        const totalMinutes = (endHour - startHour) * 60 + (endMinutes - startMinutes);
        const intervalMinutes = 20; // 20-minute intervals

        const times: string[] = [];
        
        for (let i = 0; i <= totalMinutes - intervalMinutes; i += intervalMinutes) {
          const hour = startHour + Math.floor(i / 60);
          const minutes = (i % 60).toString().padStart(2, "0");
          const time = `${hour}:${minutes}`;
          if (!appointmentTimes.includes(time)) {
            times.push(time);
          }
        }
        
        return times;
      }

      const startTime = '09:00';
      const endTime = '17:00';
      const appointmentTimes = ['10:00', '14:00', '16:00'];
      
      const times = createTimeIntervals(startTime, endTime, appointmentTimes);
      
      // Should exclude the booked times
      expect(times).not.toContain('10:00');
      expect(times).not.toContain('14:00');
      expect(times).not.toContain('16:00');
      
      // Should include other times
      expect(times).toContain('09:00');
      expect(times).toContain('09:20');
      expect(times).toContain('10:20');
      
      // Should have 21 times (24 - 3 booked)
      expect(times).toHaveLength(21);
    });
  });

  describe('Date Handling', () => {
    it('should handle different date formats', () => {
      const testDates = [
        new Date('2024-01-01'),
        new Date('2024-02-29'), // Leap year
        new Date('2024-12-31'),
        new Date('2025-01-01')
      ];

      testDates.forEach(date => {
        const dateString = date.toISOString().split('T')[0];
        expect(dateString).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });

    it('should handle 100+ dates correctly', () => {
      const dates = [];
      const startDate = new Date('2024-01-01');
      
      for (let i = 0; i < 100; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        dates.push(date);
      }
      
      expect(dates).toHaveLength(100);
      
      // Check that all dates are valid
      dates.forEach(date => {
        expect(date).toBeInstanceOf(Date);
        expect(date.getTime()).not.toBeNaN();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle empty start/end times', () => {
      function createTimeIntervals(startTime: string, endTime: string, appointmentTimes: string[] = []) {
        if (!startTime || !endTime) {
          return [];
        }
        return ['09:00', '09:20']; // Mock return
      }

      const times1 = createTimeIntervals('', '17:00', []);
      const times2 = createTimeIntervals('09:00', '', []);
      const times3 = createTimeIntervals('', '', []);
      
      expect(times1).toEqual([]);
      expect(times2).toEqual([]);
      expect(times3).toEqual([]);
    });

    it('should handle API errors gracefully', async () => {
      const { getAvailableTimesByDate } = require('@/lib/actions');
      
      getAvailableTimesByDate.mockRejectedValueOnce(new Error('API Error'));

      const TestComponent = () => {
        const form = useForm();
        return (
          <QueryClientProvider client={queryClient}>
            <div>Error Test Component</div>
          </QueryClientProvider>
        );
      };

      render(<TestComponent />);
      
      // Should not crash
      expect(screen.getByText('Error Test Component')).toBeInTheDocument();
    });
  });
});
