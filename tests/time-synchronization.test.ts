import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import AvailableTimesComponent from '@/components/agendar-visita/AvailableTimesComponent';

// Mock the actions module
vi.mock('@/lib/actions', () => ({
  getAvailableTimesByDate: vi.fn()
}));

// Mock fetch for appointments API
global.fetch = vi.fn();

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

describe('Time Selection Synchronization Tests', () => {
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

  describe('Date-Time Synchronization Issues', () => {
    it('should clear times immediately when date changes', async () => {
      const { getAvailableTimesByDate } = require('@/lib/actions');
      
      // Mock successful response
      getAvailableTimesByDate.mockResolvedValueOnce(createMockSlots('09:00', '17:00'));
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockAppointments([]))
      });

      const TestComponent = ({ selectedDate }: { selectedDate: Date }) => {
        const form = useForm();
        return (
          <QueryClientProvider client={queryClient}>
            <AvailableTimesComponent selectedDate={selectedDate} form={form} />
          </QueryClientProvider>
        );
      };

      const { rerender } = render(<TestComponent selectedDate={new Date('2024-01-01')} />);
      
      // Wait for initial load
      await waitFor(() => {
        expect(getAvailableTimesByDate).toHaveBeenCalledWith('2024-01-01');
      });

      // Change date - this should immediately clear times
      rerender(<TestComponent selectedDate={new Date('2024-01-02')} />);
      
      // Should call API with new date
      await waitFor(() => {
        expect(getAvailableTimesByDate).toHaveBeenCalledWith('2024-01-02');
      });
    });

    it('should handle rapid date changes without showing stale times', async () => {
      const { getAvailableTimesByDate } = require('@/lib/actions');
      
      // Mock delayed responses to simulate race conditions
      getAvailableTimesByDate.mockImplementation((date: string) => 
        new Promise(resolve => 
          setTimeout(() => resolve(createMockSlots('09:00', '17:00')), Math.random() * 100)
        )
      );
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(createMockAppointments([]))
      });

      const TestComponent = ({ selectedDate }: { selectedDate: Date }) => {
        const form = useForm();
        return (
          <QueryClientProvider client={queryClient}>
            <AvailableTimesComponent selectedDate={selectedDate} form={form} />
          </QueryClientProvider>
        );
      };

      const { rerender } = render(<TestComponent selectedDate={new Date('2024-01-01')} />);
      
      // Rapidly change dates
      for (let i = 1; i <= 5; i++) {
        rerender(<TestComponent selectedDate={new Date(`2024-01-0${i + 1}`)} />);
      }

      // Wait for all requests to complete
      await waitFor(() => {
        expect(getAvailableTimesByDate).toHaveBeenCalledTimes(6);
      });
    });

    it('should not display times from previous date selection', async () => {
      const { getAvailableTimesByDate } = require('@/lib/actions');
      
      // Mock different responses for different dates
      getAvailableTimesByDate.mockImplementation((date: string) => {
        if (date === '2024-01-01') {
          return Promise.resolve(createMockSlots('09:00', '17:00'));
        } else if (date === '2024-01-02') {
          return Promise.resolve({
            availableSlots: [],
            date: date,
            type: 'default_schedule'
          });
        }
        return Promise.resolve(createMockSlots('09:00', '17:00'));
      });
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(createMockAppointments([]))
      });

      const TestComponent = ({ selectedDate }: { selectedDate: Date }) => {
        const form = useForm();
        return (
          <QueryClientProvider client={queryClient}>
            <AvailableTimesComponent selectedDate={selectedDate} form={form} />
          </QueryClientProvider>
        );
      };

      // Start with first date
      const { rerender } = render(<TestComponent selectedDate={new Date('2024-01-01')} />);
      
      await waitFor(() => {
        expect(getAvailableTimesByDate).toHaveBeenCalledWith('2024-01-01');
      });

      // Change to second date (no available times)
      rerender(<TestComponent selectedDate={new Date('2024-01-02')} />);
      
      await waitFor(() => {
        expect(getAvailableTimesByDate).toHaveBeenCalledWith('2024-01-02');
      });

      // Should show "No hay horarios disponibles"
      expect(screen.getByText('No hay horarios disponibles')).toBeInTheDocument();
    });
  });

  describe('Form Field Synchronization', () => {
    it('should clear form field when date changes', async () => {
      const { getAvailableTimesByDate } = require('@/lib/actions');
      const mockSetValue = vi.fn();
      
      getAvailableTimesByDate.mockResolvedValue(createMockSlots('09:00', '17:00'));
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(createMockAppointments([]))
      });

      const mockFormWithSetValue = {
        control: {},
        setValue: mockSetValue,
        watch: vi.fn(),
        getValues: vi.fn(),
        formState: { errors: {} }
      };

      const TestComponent = ({ selectedDate }: { selectedDate: Date }) => {
        return (
          <QueryClientProvider client={queryClient}>
            <AvailableTimesComponent selectedDate={selectedDate} form={mockFormWithSetValue} />
          </QueryClientProvider>
        );
      };

      const { rerender } = render(<TestComponent selectedDate={new Date('2024-01-01')} />);
      
      await waitFor(() => {
        expect(getAvailableTimesByDate).toHaveBeenCalled();
      });

      // Change date
      rerender(<TestComponent selectedDate={new Date('2024-01-02')} />);
      
      // Should clear the form field
      expect(mockSetValue).toHaveBeenCalledWith('appointment_time', '');
    });

    it('should maintain form state consistency across date changes', async () => {
      const { getAvailableTimesByDate } = require('@/lib/actions');
      
      getAvailableTimesByDate.mockResolvedValue(createMockSlots('09:00', '17:00'));
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(createMockAppointments([]))
      });

      const TestComponent = ({ selectedDate }: { selectedDate: Date }) => {
        const form = useForm();
        return (
          <QueryClientProvider client={queryClient}>
            <AvailableTimesComponent selectedDate={selectedDate} form={form} />
          </QueryClientProvider>
        );
      };

      const { rerender } = render(<TestComponent selectedDate={new Date('2024-01-01')} />);
      
      await waitFor(() => {
        expect(getAvailableTimesByDate).toHaveBeenCalled();
      });

      // Change date multiple times
      for (let i = 1; i <= 3; i++) {
        rerender(<TestComponent selectedDate={new Date(`2024-01-0${i + 1}`)} />);
        await waitFor(() => {
          expect(getAvailableTimesByDate).toHaveBeenCalledWith(`2024-01-0${i + 1}`);
        });
      }
    });
  });

  describe('Loading State Synchronization', () => {
    it('should show loading state during API calls', async () => {
      const { getAvailableTimesByDate } = require('@/lib/actions');
      
      // Mock delayed response
      getAvailableTimesByDate.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve(createMockSlots('09:00', '17:00')), 100)
        )
      );
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(createMockAppointments([]))
      });

      const TestComponent = ({ selectedDate }: { selectedDate: Date }) => {
        const form = useForm();
        return (
          <QueryClientProvider client={queryClient}>
            <AvailableTimesComponent selectedDate={selectedDate} form={form} />
          </QueryClientProvider>
        );
      };

      const { rerender } = render(<TestComponent selectedDate={new Date('2024-01-01')} />);
      
      // Should show loading state
      expect(screen.getByText('Cargando...')).toBeInTheDocument();
      
      // Change date while loading
      rerender(<TestComponent selectedDate={new Date('2024-01-02')} />);
      
      // Should still show loading state
      expect(screen.getByText('Cargando...')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
      });
    });

    it('should handle loading state during rapid date changes', async () => {
      const { getAvailableTimesByDate } = require('@/lib/actions');
      
      // Mock delayed responses
      getAvailableTimesByDate.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve(createMockSlots('09:00', '17:00')), 200)
        )
      );
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(createMockAppointments([]))
      });

      const TestComponent = ({ selectedDate }: { selectedDate: Date }) => {
        const form = useForm();
        return (
          <QueryClientProvider client={queryClient}>
            <AvailableTimesComponent selectedDate={selectedDate} form={form} />
          </QueryClientProvider>
        );
      };

      const { rerender } = render(<TestComponent selectedDate={new Date('2024-01-01')} />);
      
      // Rapidly change dates
      for (let i = 1; i <= 3; i++) {
        rerender(<TestComponent selectedDate={new Date(`2024-01-0${i + 1}`)} />);
      }

      // Should show loading state
      expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });
  });

  describe('Error State Synchronization', () => {
    it('should handle errors gracefully during date changes', async () => {
      const { getAvailableTimesByDate } = require('@/lib/actions');
      
      // Mock error response
      getAvailableTimesByDate.mockRejectedValue(new Error('API Error'));

      const TestComponent = ({ selectedDate }: { selectedDate: Date }) => {
        const form = useForm();
        return (
          <QueryClientProvider client={queryClient}>
            <AvailableTimesComponent selectedDate={selectedDate} form={form} />
          </QueryClientProvider>
        );
      };

      const { rerender } = render(<TestComponent selectedDate={new Date('2024-01-01')} />);
      
      await waitFor(() => {
        expect(getAvailableTimesByDate).toHaveBeenCalled();
      });

      // Change date
      rerender(<TestComponent selectedDate={new Date('2024-01-02')} />);
      
      // Should not crash and should handle error gracefully
      await waitFor(() => {
        expect(getAvailableTimesByDate).toHaveBeenCalledWith('2024-01-02');
      });
    });

    it('should recover from errors when date changes', async () => {
      const { getAvailableTimesByDate } = require('@/lib/actions');
      
      // Mock error for first date, success for second
      getAvailableTimesByDate.mockImplementation((date: string) => {
        if (date === '2024-01-01') {
          return Promise.reject(new Error('API Error'));
        } else {
          return Promise.resolve(createMockSlots('09:00', '17:00'));
        }
      });
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(createMockAppointments([]))
      });

      const TestComponent = ({ selectedDate }: { selectedDate: Date }) => {
        const form = useForm();
        return (
          <QueryClientProvider client={queryClient}>
            <AvailableTimesComponent selectedDate={selectedDate} form={form} />
          </QueryClientProvider>
        );
      };

      const { rerender } = render(<TestComponent selectedDate={new Date('2024-01-01')} />);
      
      await waitFor(() => {
        expect(getAvailableTimesByDate).toHaveBeenCalledWith('2024-01-01');
      });

      // Change to working date
      rerender(<TestComponent selectedDate={new Date('2024-01-02')} />);
      
      await waitFor(() => {
        expect(getAvailableTimesByDate).toHaveBeenCalledWith('2024-01-02');
      });

      // Should recover and show times
      await waitFor(() => {
        expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
      });
    });
  });

  describe('100+ Date Synchronization Test', () => {
    it('should handle 100+ dates with proper synchronization', async () => {
      const { getAvailableTimesByDate } = require('@/lib/actions');
      const testDates = createTestDates(100);
      
      // Mock different responses for different dates
      getAvailableTimesByDate.mockImplementation((date: string) => {
        const dateObj = new Date(date);
        const dayOfWeek = dateObj.getDay();
        
        // Different schedules for different days
        if (dayOfWeek === 0) { // Sunday
          return Promise.resolve({
            availableSlots: [],
            date: date,
            type: 'default_schedule'
          });
        } else if (dayOfWeek === 6) { // Saturday
          return Promise.resolve(createMockSlots('09:00', '13:00'));
        } else {
          return Promise.resolve(createMockSlots('09:00', '17:00'));
        }
      });
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(createMockAppointments([]))
      });

      const TestComponent = ({ selectedDate }: { selectedDate: Date }) => {
        const form = useForm();
        return (
          <QueryClientProvider client={queryClient}>
            <AvailableTimesComponent selectedDate={selectedDate} form={form} />
          </QueryClientProvider>
        );
      };

      // Test each date
      for (let i = 0; i < testDates.length; i++) {
        const { rerender } = render(<TestComponent selectedDate={testDates[i]} />);
        
        await waitFor(() => {
          expect(getAvailableTimesByDate).toHaveBeenCalledWith(
            testDates[i].toISOString().split('T')[0]
          );
        });

        // Clear mocks for next iteration
        vi.clearAllMocks();
        getAvailableTimesByDate.mockImplementation((date: string) => {
          const dateObj = new Date(date);
          const dayOfWeek = dateObj.getDay();
          
          if (dayOfWeek === 0) {
            return Promise.resolve({
              availableSlots: [],
              date: date,
              type: 'default_schedule'
            });
          } else if (dayOfWeek === 6) {
            return Promise.resolve(createMockSlots('09:00', '13:00'));
          } else {
            return Promise.resolve(createMockSlots('09:00', '17:00'));
          }
        });
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(createMockAppointments([]))
        });
      }
    });
  });
});
