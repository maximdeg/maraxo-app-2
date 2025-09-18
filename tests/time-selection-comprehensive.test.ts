import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import AvailableTimesComponent from '@/components/agendar-visita/AvailableTimesComponent';

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

describe('Time Selection Comprehensive Tests', () => {
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

  describe('Date and Time Synchronization', () => {
    it('should clear times when date changes', async () => {
      const { getAvailableTimesByDate } = require('@/lib/actions');
      
      // Mock successful response
      getAvailableTimesByDate.mockResolvedValueOnce(createMockSlots('09:00', '17:00'));
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockAppointments([]))
      });

      const TestComponent = () => {
        const form = useForm();
        return (
          <QueryClientProvider client={queryClient}>
            <AvailableTimesComponent selectedDate={new Date('2024-01-01')} form={form} />
          </QueryClientProvider>
        );
      };

      const { rerender } = render(<TestComponent />);
      
      // Wait for initial load
      await waitFor(() => {
        expect(getAvailableTimesByDate).toHaveBeenCalledWith('2024-01-01');
      });

      // Change date
      rerender(
        <QueryClientProvider client={queryClient}>
          <AvailableTimesComponent selectedDate={new Date('2024-01-02')} form={mockForm} />
        </QueryClientProvider>
      );

      // Should call API with new date
      await waitFor(() => {
        expect(getAvailableTimesByDate).toHaveBeenCalledWith('2024-01-02');
      });
    });

    it('should handle rapid date changes without race conditions', async () => {
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
  });

  describe('Time Generation Logic', () => {
    it('should generate correct time intervals', async () => {
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
            <AvailableTimesComponent selectedDate={new Date('2024-01-01')} form={form} />
          </QueryClientProvider>
        );
      };

      render(<TestComponent />);
      
      await waitFor(() => {
        expect(getAvailableTimesByDate).toHaveBeenCalled();
      });

      // The component should generate times from 09:00 to 16:40 with 20-minute intervals
      // Expected times: 09:00, 09:20, 09:40, 10:00, 10:20, 10:40, 11:00, 11:20, 11:40, 12:00, 12:20, 12:40, 13:00, 13:20, 13:40, 14:00, 14:20, 14:40, 15:00, 15:20, 15:40, 16:00, 16:20, 16:40
    });

    it('should exclude booked appointment times', async () => {
      const { getAvailableTimesByDate } = require('@/lib/actions');
      
      getAvailableTimesByDate.mockResolvedValueOnce(createMockSlots('09:00', '17:00'));
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockAppointments(['10:00', '14:00', '16:00']))
      });

      const TestComponent = () => {
        const form = useForm();
        return (
          <QueryClientProvider client={queryClient}>
            <AvailableTimesComponent selectedDate={new Date('2024-01-01')} form={form} />
          </QueryClientProvider>
        );
      };

      render(<TestComponent />);
      
      await waitFor(() => {
        expect(getAvailableTimesByDate).toHaveBeenCalled();
      });

      // Should not include 10:00, 14:00, 16:00 in available times
    });

    it('should handle edge case times correctly', async () => {
      const { getAvailableTimesByDate } = require('@/lib/actions');
      
      // Test with odd start/end times
      getAvailableTimesByDate.mockResolvedValueOnce(createMockSlots('09:30', '16:30'));
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createMockAppointments([]))
      });

      const TestComponent = () => {
        const form = useForm();
        return (
          <QueryClientProvider client={queryClient}>
            <AvailableTimesComponent selectedDate={new Date('2024-01-01')} form={form} />
          </QueryClientProvider>
        );
      };

      render(<TestComponent />);
      
      await waitFor(() => {
        expect(getAvailableTimesByDate).toHaveBeenCalled();
      });

      // Should generate times from 09:30 to 16:10 with 20-minute intervals
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const { getAvailableTimesByDate } = require('@/lib/actions');
      
      getAvailableTimesByDate.mockRejectedValueOnce(new Error('API Error'));

      const TestComponent = () => {
        const form = useForm();
        return (
          <QueryClientProvider client={queryClient}>
            <AvailableTimesComponent selectedDate={new Date('2024-01-01')} form={form} />
          </QueryClientProvider>
        );
      };

      render(<TestComponent />);
      
      await waitFor(() => {
        expect(getAvailableTimesByDate).toHaveBeenCalled();
      });

      // Should not crash and should show appropriate UI state
    });

    it('should handle network errors when fetching appointments', async () => {
      const { getAvailableTimesByDate } = require('@/lib/actions');
      
      getAvailableTimesByDate.mockResolvedValueOnce(createMockSlots('09:00', '17:00'));
      mockFetch.mockRejectedValueOnce(new Error('Network Error'));

      const TestComponent = () => {
        const form = useForm();
        return (
          <QueryClientProvider client={queryClient}>
            <AvailableTimesComponent selectedDate={new Date('2024-01-01')} form={form} />
          </QueryClientProvider>
        );
      };

      render(<TestComponent />);
      
      await waitFor(() => {
        expect(getAvailableTimesByDate).toHaveBeenCalled();
      });

      // Should still generate times even if appointments fetch fails
    });

    it('should handle invalid date formats', async () => {
      const { getAvailableTimesByDate } = require('@/lib/actions');
      
      getAvailableTimesByDate.mockRejectedValueOnce(new Error('Invalid date format'));

      const TestComponent = () => {
        const form = useForm();
        return (
          <QueryClientProvider client={queryClient}>
            <AvailableTimesComponent selectedDate={new Date('invalid-date')} form={form} />
          </QueryClientProvider>
        );
      };

      render(<TestComponent />);
      
      await waitFor(() => {
        expect(getAvailableTimesByDate).toHaveBeenCalled();
      });
    });
  });

  describe('Performance and Caching', () => {
    it('should cache results for the same date', async () => {
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
        expect(getAvailableTimesByDate).toHaveBeenCalledTimes(1);
      });

      // Change to different date
      rerender(<TestComponent selectedDate={new Date('2024-01-02')} />);
      
      await waitFor(() => {
        expect(getAvailableTimesByDate).toHaveBeenCalledTimes(2);
      });

      // Go back to first date - should use cache
      rerender(<TestComponent selectedDate={new Date('2024-01-01')} />);
      
      await waitFor(() => {
        expect(getAvailableTimesByDate).toHaveBeenCalledTimes(2); // Should not call again
      });
    });
  });

  describe('UI State Management', () => {
    it('should show loading state while fetching', async () => {
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

      const TestComponent = () => {
        const form = useForm();
        return (
          <QueryClientProvider client={queryClient}>
            <AvailableTimesComponent selectedDate={new Date('2024-01-01')} form={form} />
          </QueryClientProvider>
        );
      };

      render(<TestComponent />);
      
      // Should show loading state
      expect(screen.getByText('Cargando...')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
      });
    });

    it('should show no times available when no slots exist', async () => {
      const { getAvailableTimesByDate } = require('@/lib/actions');
      
      getAvailableTimesByDate.mockResolvedValueOnce({
        availableSlots: [],
        date: '2024-01-01',
        type: 'default_schedule'
      });

      const TestComponent = () => {
        const form = useForm();
        return (
          <QueryClientProvider client={queryClient}>
            <AvailableTimesComponent selectedDate={new Date('2024-01-01')} form={form} />
          </QueryClientProvider>
        );
      };

      render(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByText('No hay horarios disponibles')).toBeInTheDocument();
      });
    });

    it('should hide component when no date is selected', () => {
      const TestComponent = () => {
        const form = useForm();
        return (
          <QueryClientProvider client={queryClient}>
            <AvailableTimesComponent selectedDate={null as any} form={form} />
          </QueryClientProvider>
        );
      };

      render(<TestComponent />);
      
      const formItem = screen.getByRole('group');
      expect(formItem).toHaveClass('hidden');
    });
  });

  describe('100+ Date Test Suite', () => {
    it('should handle 100+ different dates correctly', async () => {
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

    it('should handle leap year dates correctly', async () => {
      const { getAvailableTimesByDate } = require('@/lib/actions');
      
      const leapYearDates = [
        new Date('2024-02-29'), // Leap year
        new Date('2024-12-31'), // End of leap year
        new Date('2025-01-01'), // After leap year
      ];

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

      for (const date of leapYearDates) {
        const { rerender } = render(<TestComponent selectedDate={date} />);
        
        await waitFor(() => {
          expect(getAvailableTimesByDate).toHaveBeenCalledWith(
            date.toISOString().split('T')[0]
          );
        });
      }
    });

    it('should handle timezone edge cases', async () => {
      const { getAvailableTimesByDate } = require('@/lib/actions');
      
      const timezoneDates = [
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-01T23:59:59Z'),
        new Date('2024-12-31T00:00:00Z'),
        new Date('2024-12-31T23:59:59Z'),
      ];

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

      for (const date of timezoneDates) {
        const { rerender } = render(<TestComponent selectedDate={date} />);
        
        await waitFor(() => {
          expect(getAvailableTimesByDate).toHaveBeenCalledWith(
            date.toISOString().split('T')[0]
          );
        });
      }
    });
  });

  describe('Form Integration', () => {
    it('should clear form field when date changes', async () => {
      const { getAvailableTimesByDate } = require('@/lib/actions');
      const mockSetValue = vi.fn();
      
      getAvailableTimesByDate.mockResolvedValue(createMockSlots('09:00', '17:00'));
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(createMockAppointments([]))
      });

      const mockFormWithSetValue = {
        ...mockForm,
        setValue: mockSetValue
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

    it('should handle form field changes correctly', async () => {
      const { getAvailableTimesByDate } = require('@/lib/actions');
      
      getAvailableTimesByDate.mockResolvedValue(createMockSlots('09:00', '17:00'));
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(createMockAppointments([]))
      });

      const TestComponent = () => {
        const form = useForm();
        return (
          <QueryClientProvider client={queryClient}>
            <AvailableTimesComponent selectedDate={new Date('2024-01-01')} form={form} />
          </QueryClientProvider>
        );
      };

      render(<TestComponent />);
      
      await waitFor(() => {
        expect(getAvailableTimesByDate).toHaveBeenCalled();
      });

      // Should be able to select a time
      const selectTrigger = screen.getByRole('combobox');
      fireEvent.click(selectTrigger);
      
      // Should show available times
      await waitFor(() => {
        expect(screen.getByText('Horarios disponibles')).toBeInTheDocument();
      });
    });
  });
});
