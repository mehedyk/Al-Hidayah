import { describe, expect, it } from 'vitest';
import { parseFavoriteImport } from '../../src/lib/storage/favorites';

const validIds = new Set(['q:94:6', 'q:13:28']);

describe('favorites import', () => {
  it('accepts a valid export', () => {
    const text = JSON.stringify({
      version: 1,
      favorites: [{ id: 'q:94:6', savedAt: '2026-11-19T10:00:00.000Z' }],
    });
    expect(parseFavoriteImport(text, validIds)).toEqual([
      { id: 'q:94:6', savedAt: '2026-11-19T10:00:00.000Z' },
    ]);
  });

  it('rejects unknown ids, duplicates, and invalid dates', () => {
    expect(() =>
      parseFavoriteImport(
        JSON.stringify({
          version: 1,
          favorites: [{ id: 'unknown', savedAt: '2026-11-19T10:00:00Z' }],
        }),
        validIds,
      ),
    ).toThrow('unknown reminder');
    expect(() =>
      parseFavoriteImport(
        JSON.stringify({ version: 1, favorites: [{ id: 'q:94:6', savedAt: 'not-a-date' }] }),
        validIds,
      ),
    ).toThrow('saved date');
    expect(() =>
      parseFavoriteImport(
        JSON.stringify({
          version: 1,
          favorites: [
            { id: 'q:94:6', savedAt: '2026-11-19T10:00:00Z' },
            { id: 'q:94:6', savedAt: '2026-11-19T10:00:00Z' },
          ],
        }),
        validIds,
      ),
    ).toThrow('duplicate');
  });

  it('rejects malformed files without executing their contents', () => {
    expect(() =>
      parseFavoriteImport(
        '{"version":1,"favorites":[{"id":"q:94:6","savedAt":"2026-11-19T10:00:00Z","__proto__":{"admin":true}}]}',
        validIds,
      ),
    ).not.toThrow();
    expect(() => parseFavoriteImport('<script>alert(1)</script>', validIds)).toThrow();
    expect(() => parseFavoriteImport('{}', validIds)).toThrow('version 1');
  });
});
