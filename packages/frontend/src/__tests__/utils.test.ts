import { describe, it, expect } from 'vitest';
import { formatDate, formatRelativeTime, truncate } from '../lib/utils';

describe('Utils', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2025-12-10T15:30:00');
      const formatted = formatDate(date);
      expect(formatted).toContain('dez');
      expect(formatted).toContain('2025');
    });
  });

  describe('formatRelativeTime', () => {
    it('should format recent time', () => {
      const now = new Date();
      const result = formatRelativeTime(now);
      expect(result).toMatch(/\d+[smhd] atrás/);
    });

    it('should show seconds for very recent', () => {
      const fiveSecsAgo = new Date(Date.now() - 5000);
      const result = formatRelativeTime(fiveSecsAgo);
      expect(result).toContain('s atrás');
    });

    it('should show days for older dates', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const result = formatRelativeTime(threeDaysAgo);
      expect(result).toContain('d atrás');
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      const long = 'This is a very long string that needs truncation';
      const result = truncate(long, 20);
      expect(result).toHaveLength(23); // 20 + '...'
      expect(result).toContain('...');
    });

    it('should not truncate short strings', () => {
      const short = 'Short';
      const result = truncate(short, 20);
      expect(result).toBe(short);
    });
  });
});
