import { afterEach, describe, expect, it } from 'vitest';
import {
  dailyItemId,
  localDateKey,
  localDayNumber,
  permutedIndex,
} from '../../src/lib/daily/dailyItem';

const previousZone = process.env.TZ;
afterEach(() => {
  process.env.TZ = previousZone;
});

describe('daily reminder', () => {
  it('uses local calendar parts in Dhaka, UTC, and a western timezone', () => {
    for (const zone of ['Asia/Dhaka', 'UTC', 'America/Los_Angeles']) {
      process.env.TZ = zone;
      const date = new Date(2026, 10, 19, 12, 0);
      expect(localDayNumber(date)).toBe(Math.floor(Date.UTC(2026, 10, 19) / 86_400_000));
      expect(localDateKey(date)).toBe('2026-11-19');
    }
  });

  it('does not let a UTC timestamp define the local day', () => {
    process.env.TZ = 'Asia/Dhaka';
    expect(localDateKey(new Date('2026-11-18T20:00:00Z'))).toBe('2026-11-19');
    process.env.TZ = 'America/Los_Angeles';
    expect(localDateKey(new Date('2026-11-19T07:00:00Z'))).toBe('2026-11-18');
  });

  it('is deterministic and handles midnight', () => {
    const pool = [{ id: 'a' }, { id: 'b' }];
    const before = new Date(2026, 10, 19, 23, 59, 59);
    const after = new Date(2026, 10, 20, 0, 0, 0);
    expect(dailyItemId(before, pool)).toBe(dailyItemId(new Date(2026, 10, 19, 3), pool));
    expect(dailyItemId(after, pool)).toBe(dailyItemId(new Date(2026, 10, 20, 3), pool));
  });

  it('wraps negative and positive day numbers into the pool', () => {
    expect(permutedIndex(-20, 7)).toBeGreaterThanOrEqual(0);
    expect(permutedIndex(-20, 7)).toBeLessThan(7);
    expect(() => permutedIndex(1, 0)).toThrow();
  });
});
