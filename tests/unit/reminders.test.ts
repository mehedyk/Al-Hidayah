import { beforeEach, describe, expect, it } from 'vitest';
import { dailyReminderId, nextReminderId, poolIds, shortReferenceFromId } from '../../src/lib/reminders';
import { quranIdList } from '../../src/lib/quranLibrary';

const store = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
  },
  configurable: true,
});

beforeEach(() => store.clear());

describe('reminder pools', () => {
  it('the Qur’an pool holds every verse in reading order', () => {
    expect(poolIds('quran')).toHaveLength(6236);
    expect(quranIdList[0]).toBe('q:1:1');
    expect(quranIdList[6235]).toBe('q:114:6');
    expect(new Set(quranIdList).size).toBe(6236);
  });

  it('the reviewed pool stays the small owner-approved set', () => {
    expect(poolIds('reviewed')).toEqual(['q:94:6', 'q:13:28']);
  });
});

describe('daily reminder', () => {
  it('is a pure function of the local calendar date', () => {
    const noon = new Date(2026, 10, 21, 12, 0, 0);
    const lateNight = new Date(2026, 10, 21, 23, 59, 59);
    const early = new Date(2026, 10, 21, 0, 0, 1);
    expect(dailyReminderId(noon, 'quran')).toBe(dailyReminderId(lateNight, 'quran'));
    expect(dailyReminderId(noon, 'quran')).toBe(dailyReminderId(early, 'quran'));
  });

  it('visits all 6,236 verses before repeating, one per day', () => {
    const seen = new Set<string>();
    for (let day = 0; day < 6236; day += 1) {
      seen.add(dailyReminderId(new Date(2026, 0, 1 + day), 'quran'));
    }
    expect(seen.size).toBe(6236);
  });

  it('every daily id is a valid verse', () => {
    for (let day = 0; day < 400; day += 1) {
      expect(dailyReminderId(new Date(2026, 0, 1 + day), 'quran')).toMatch(/^q:\d+:\d+$/);
    }
    expect(['q:94:6', 'q:13:28']).toContain(dailyReminderId(new Date(2026, 5, 1), 'reviewed'));
  });
});

describe('random reminder (shuffle bag)', () => {
  it('never repeats a verse within one pass and never repeats back-to-back', () => {
    const seen = new Set<string>();
    let current = 'q:1:1';
    for (let index = 0; index < 500; index += 1) {
      const next = nextReminderId('quran', current);
      expect(next).not.toBe(current);
      expect(seen.has(next)).toBe(false);
      seen.add(next);
      current = next;
    }
  });

  it('persists its position between calls', () => {
    nextReminderId('quran', 'q:1:1');
    nextReminderId('quran', 'q:1:2');
    const saved = JSON.parse(store.get('al-hidayah:shuffle:v2:quran') ?? '{}') as { position: number };
    expect(saved.position).toBe(2);
  });

  it('the reviewed pool alternates between its two verses', () => {
    const first = nextReminderId('reviewed', 'q:94:6');
    expect(first).toBe('q:13:28');
  });
});

describe('references from ids', () => {
  it('formats without a network request', () => {
    expect(shortReferenceFromId('q:2:255')).toBe('Qur’an, Al-Baqara 2:255');
    expect(shortReferenceFromId('weird')).toBe('weird');
  });
});
