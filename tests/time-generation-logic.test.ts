import { describe, it, expect } from 'vitest';

// Helper function to create time intervals (matching the component logic)
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

describe('Time Generation Logic Tests', () => {
  describe('Basic Time Generation', () => {
    it('should generate correct time intervals for standard work day', () => {
      const startTime = '09:00';
      const endTime = '17:00';
      const appointmentTimes: string[] = [];
      
      const times = createTimeIntervals(startTime, endTime, appointmentTimes);
      
      // Should generate times from 09:00 to 16:40 with 20-minute intervals
      const expectedTimes = [
        '09:00', '09:20', '09:40',
        '10:00', '10:20', '10:40',
        '11:00', '11:20', '11:40',
        '12:00', '12:20', '12:40',
        '13:00', '13:20', '13:40',
        '14:00', '14:20', '14:40',
        '15:00', '15:20', '15:40',
        '16:00', '16:20', '16:40'
      ];
      
      expect(times).toEqual(expectedTimes);
      expect(times).toHaveLength(24);
    });

    it('should generate correct time intervals for half day', () => {
      const startTime = '09:00';
      const endTime = '13:00';
      const appointmentTimes: string[] = [];
      
      const times = createTimeIntervals(startTime, endTime, appointmentTimes);
      
      const expectedTimes = [
        '09:00', '09:20', '09:40',
        '10:00', '10:20', '10:40',
        '11:00', '11:20', '11:40',
        '12:00', '12:20', '12:40'
      ];
      
      expect(times).toEqual(expectedTimes);
      expect(times).toHaveLength(12);
    });

    it('should generate correct time intervals for odd start/end times', () => {
      const startTime = '09:30';
      const endTime = '16:30';
      const appointmentTimes: string[] = [];
      
      const times = createTimeIntervals(startTime, endTime, appointmentTimes);
      
      const expectedTimes = [
        '09:30', '09:50',
        '10:10', '10:30', '10:50',
        '11:10', '11:30', '11:50',
        '12:10', '12:30', '12:50',
        '13:10', '13:30', '13:50',
        '14:10', '14:30', '14:50',
        '15:10', '15:30', '15:50',
        '16:10', '16:30'
      ];
      
      expect(times).toEqual(expectedTimes);
      expect(times).toHaveLength(22);
    });
  });

  describe('Appointment Exclusion Logic', () => {
    it('should exclude booked appointment times', () => {
      const startTime = '09:00';
      const endTime = '17:00';
      const appointmentTimes = ['10:00', '14:00', '16:00'];
      
      const times = createTimeIntervals(startTime, endTime, appointmentTimes);
      
      // Should not include the booked times
      expect(times).not.toContain('10:00');
      expect(times).not.toContain('14:00');
      expect(times).not.toContain('16:00');
      
      // Should include other times
      expect(times).toContain('09:00');
      expect(times).toContain('09:20');
      expect(times).toContain('10:20');
      expect(times).toContain('13:40');
      expect(times).toContain('15:40');
      
      // Should have 21 times (24 - 3 booked)
      expect(times).toHaveLength(21);
    });

    it('should handle many booked appointments', () => {
      const startTime = '09:00';
      const endTime = '17:00';
      const appointmentTimes = [
        '09:00', '09:20', '09:40',
        '10:00', '10:20', '10:40',
        '11:00', '11:20', '11:40',
        '12:00', '12:20', '12:40',
        '13:00', '13:20', '13:40',
        '14:00', '14:20', '14:40',
        '15:00', '15:20', '15:40',
        '16:00', '16:20', '16:40'
      ];
      
      const times = createTimeIntervals(startTime, endTime, appointmentTimes);
      
      // All times should be excluded
      expect(times).toHaveLength(0);
    });

    it('should handle partial booking scenarios', () => {
      const startTime = '09:00';
      const endTime = '13:00';
      const appointmentTimes = ['09:00', '10:20', '12:40'];
      
      const times = createTimeIntervals(startTime, endTime, appointmentTimes);
      
      // Should exclude the booked times
      expect(times).not.toContain('09:00');
      expect(times).not.toContain('10:20');
      expect(times).not.toContain('12:40');
      
      // Should include other times
      expect(times).toContain('09:20');
      expect(times).toContain('09:40');
      expect(times).toContain('10:00');
      expect(times).toContain('10:40');
      expect(times).toContain('11:00');
      expect(times).toContain('12:00');
      expect(times).toContain('12:20');
      
      // Should have 9 times (12 - 3 booked)
      expect(times).toHaveLength(9);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty start/end times', () => {
      const times1 = createTimeIntervals('', '17:00', []);
      const times2 = createTimeIntervals('09:00', '', []);
      const times3 = createTimeIntervals('', '', []);
      
      expect(times1).toEqual([]);
      expect(times2).toEqual([]);
      expect(times3).toEqual([]);
    });

    it('should handle same start and end time', () => {
      const times = createTimeIntervals('09:00', '09:00', []);
      expect(times).toEqual([]);
    });

    it('should handle end time before start time', () => {
      const times = createTimeIntervals('17:00', '09:00', []);
      expect(times).toEqual([]);
    });

    it('should handle very short time windows', () => {
      const times = createTimeIntervals('09:00', '09:10', []);
      expect(times).toEqual([]);
    });

    it('should handle time windows exactly matching interval', () => {
      const times = createTimeIntervals('09:00', '09:20', []);
      expect(times).toEqual(['09:00']);
    });

    it('should handle time windows just over one interval', () => {
      const times = createTimeIntervals('09:00', '09:30', []);
      expect(times).toEqual(['09:00', '09:20']);
    });
  });

  describe('Time Format Validation', () => {
    it('should handle single digit hours and minutes', () => {
      const startTime = '9:0';
      const endTime = '17:0';
      const appointmentTimes: string[] = [];
      
      const times = createTimeIntervals(startTime, endTime, appointmentTimes);
      
      // Should still generate times correctly
      expect(times).toContain('9:00');
      expect(times).toContain('9:20');
      expect(times).toContain('16:40');
    });

    it('should handle times with leading zeros', () => {
      const startTime = '09:00';
      const endTime = '17:00';
      const appointmentTimes: string[] = [];
      
      const times = createTimeIntervals(startTime, endTime, appointmentTimes);
      
      // All times should be properly formatted
      times.forEach(time => {
        const [hour, minutes] = time.split(':');
        expect(hour.length).toBeGreaterThan(0);
        expect(minutes.length).toBe(2);
        expect(parseInt(minutes)).toBeLessThan(60);
      });
    });
  });

  describe('Performance with Large Datasets', () => {
    it('should handle many appointment times efficiently', () => {
      const startTime = '09:00';
      const endTime = '17:00';
      const appointmentTimes = Array.from({ length: 100 }, (_, i) => {
        const hour = 9 + Math.floor(i / 3);
        const minute = (i % 3) * 20;
        return `${hour}:${minute.toString().padStart(2, '0')}`;
      });
      
      const startTime = Date.now();
      const times = createTimeIntervals(startTime, endTime, appointmentTimes);
      const endTime = Date.now();
      
      // Should complete quickly (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);
      expect(times).toBeDefined();
    });

    it('should handle very long time windows efficiently', () => {
      const startTime = '00:00';
      const endTime = '23:40';
      const appointmentTimes: string[] = [];
      
      const startTime = Date.now();
      const times = createTimeIntervals(startTime, endTime, appointmentTimes);
      const endTime = Date.now();
      
      // Should complete quickly
      expect(endTime - startTime).toBeLessThan(100);
      expect(times.length).toBeGreaterThan(0);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle typical clinic schedule', () => {
      const startTime = '08:00';
      const endTime = '18:00';
      const appointmentTimes = [
        '08:00', '08:20', '08:40',
        '09:00', '09:20', '09:40',
        '10:00', '10:20', '10:40',
        '11:00', '11:20', '11:40',
        '12:00', '12:20', '12:40',
        '13:00', '13:20', '13:40',
        '14:00', '14:20', '14:40',
        '15:00', '15:20', '15:40',
        '16:00', '16:20', '16:40',
        '17:00', '17:20', '17:40'
      ];
      
      const times = createTimeIntervals(startTime, endTime, appointmentTimes);
      
      // Should have some available times
      expect(times.length).toBeGreaterThan(0);
      expect(times.length).toBeLessThan(30);
    });

    it('should handle lunch break scenario', () => {
      const startTime = '09:00';
      const endTime = '17:00';
      const appointmentTimes = [
        '12:00', '12:20', '12:40', '13:00', '13:20', '13:40' // Lunch break
      ];
      
      const times = createTimeIntervals(startTime, endTime, appointmentTimes);
      
      // Should exclude lunch break times
      expect(times).not.toContain('12:00');
      expect(times).not.toContain('12:20');
      expect(times).not.toContain('12:40');
      expect(times).not.toContain('13:00');
      expect(times).not.toContain('13:20');
      expect(times).not.toContain('13:40');
      
      // Should include other times
      expect(times).toContain('09:00');
      expect(times).toContain('11:40');
      expect(times).toContain('14:00');
      expect(times).toContain('16:40');
    });

    it('should handle end-of-day scenario', () => {
      const startTime = '09:00';
      const endTime = '17:00';
      const appointmentTimes = [
        '16:00', '16:20', '16:40' // Last appointments of the day
      ];
      
      const times = createTimeIntervals(startTime, endTime, appointmentTimes);
      
      // Should exclude the last appointments
      expect(times).not.toContain('16:00');
      expect(times).not.toContain('16:20');
      expect(times).not.toContain('16:40');
      
      // Should include earlier times
      expect(times).toContain('09:00');
      expect(times).toContain('15:40');
    });
  });

  describe('Time Synchronization Issues', () => {
    it('should ensure consistent time generation across multiple calls', () => {
      const startTime = '09:00';
      const endTime = '17:00';
      const appointmentTimes = ['10:00', '14:00'];
      
      // Generate times multiple times
      const times1 = createTimeIntervals(startTime, endTime, appointmentTimes);
      const times2 = createTimeIntervals(startTime, endTime, appointmentTimes);
      const times3 = createTimeIntervals(startTime, endTime, appointmentTimes);
      
      // Should be consistent
      expect(times1).toEqual(times2);
      expect(times2).toEqual(times3);
    });

    it('should handle rapid changes in appointment times', () => {
      const startTime = '09:00';
      const endTime = '17:00';
      
      // Simulate rapid changes in appointment times
      const scenarios = [
        [],
        ['10:00'],
        ['10:00', '14:00'],
        ['10:00', '14:00', '16:00'],
        ['10:00', '14:00'],
        ['10:00'],
        []
      ];
      
      const results = scenarios.map(appointmentTimes => 
        createTimeIntervals(startTime, endTime, appointmentTimes)
      );
      
      // Each result should be valid
      results.forEach(times => {
        expect(Array.isArray(times)).toBe(true);
        times.forEach(time => {
          expect(typeof time).toBe('string');
          expect(time).toMatch(/^\d{1,2}:\d{2}$/);
        });
      });
    });
  });
});
