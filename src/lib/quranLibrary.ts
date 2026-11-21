import generated from '../data/generated/quran-index.json';
import { getItem, isItem } from './data';
import type { Item } from './types';

export interface QuranSurahSummary {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
}

export interface QuranShard extends QuranSurahSummary {
  items: Item[];
}

export interface QuranSearchResult {
  id: string;
  surah: number;
  ayah: number;
  surahName: string;
  en: string;
  bn: string;
}

export const quranSurahs: QuranSurahSummary[] = generated.surahs;
export const quranVerseCount = generated.verseCount;
/** The 30 juz, each with the surah and ayah where it begins (from the frozen source's own data). */
export const quranJuz: Array<{ number: number; surah: number; ayah: number }> = generated.juz;

const LAST_READ_KEY = 'al-hidayah:last-read:v1';

export function readLastPosition(): { surah: number; ayah: number } | undefined {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(LAST_READ_KEY) ?? 'null');
    if (!value || typeof value !== 'object') return undefined;
    const { surah, ayah } = value as Record<string, unknown>;
    if (typeof surah !== 'number' || typeof ayah !== 'number') return undefined;
    const summary = quranSurahs[surah - 1];
    if (!summary || ayah < 1 || ayah > summary.numberOfAyahs) return undefined;
    return { surah, ayah };
  } catch {
    return undefined;
  }
}

export function saveLastPosition(surah: number, ayah: number): void {
  try {
    localStorage.setItem(LAST_READ_KEY, JSON.stringify({ surah, ayah }));
  } catch {
    // Storage can be blocked; reading still works, we just cannot remember the place.
  }
}
export const allQuranIds = new Set(
  quranSurahs.flatMap((surah) =>
    Array.from({ length: surah.numberOfAyahs }, (_, index) => `q:${surah.number}:${index + 1}`),
  ),
);

const surahCache = new Map<number, Promise<QuranShard>>();
let searchCache: Promise<QuranSearchResult[]> | undefined;

export function parseQuranId(id: string): { surah: number; ayah: number } | undefined {
  const match = /^q:(\d+):(\d+)$/.exec(id);
  if (!match) return undefined;
  const surah = Number(match[1]);
  const ayah = Number(match[2]);
  const summary = quranSurahs[surah - 1];
  if (!summary || ayah < 1 || ayah > summary.numberOfAyahs) return undefined;
  return { surah, ayah };
}

function validateShard(value: unknown, expected: QuranSurahSummary): QuranShard {
  if (!value || typeof value !== 'object') throw new Error('The surah data is incomplete.');
  const shard = value as Record<string, unknown>;
  if (
    shard.number !== expected.number ||
    shard.name !== expected.name ||
    shard.englishName !== expected.englishName ||
    shard.englishNameTranslation !== expected.englishNameTranslation ||
    shard.numberOfAyahs !== expected.numberOfAyahs ||
    !Array.isArray(shard.items) ||
    shard.items.length !== expected.numberOfAyahs
  ) {
    throw new Error(`Surah ${expected.number} failed its structural check.`);
  }
  const items = shard.items.map((item, index) => {
    if (!isItem(item) || item.id !== `q:${expected.number}:${index + 1}`) {
      throw new Error(`Surah ${expected.number}, ayah ${index + 1} is incomplete.`);
    }
    return item;
  });
  return { ...expected, items };
}

export function loadSurah(number: number): Promise<QuranShard> {
  const expected = quranSurahs[number - 1];
  if (!expected) return Promise.reject(new Error('Choose a surah from 1 to 114.'));
  const cached = surahCache.get(number);
  if (cached) return cached;
  const request = fetch(`/data/quran/surahs/${String(number).padStart(3, '0')}.json`)
    .then((response) => {
      if (!response.ok) throw new Error('This surah could not be loaded. Try again when online.');
      return response.json() as Promise<unknown>;
    })
    .then((value) => validateShard(value, expected))
    .catch((error: unknown) => {
      surahCache.delete(number);
      throw error;
    });
  surahCache.set(number, request);
  return request;
}

export async function getQuranItem(id: string): Promise<Item | undefined> {
  const reference = parseQuranId(id);
  if (!reference) return undefined;
  const shard = await loadSurah(reference.surah);
  return shard.items[reference.ayah - 1];
}

export async function resolveItem(id: string): Promise<Item | undefined> {
  return getItem(id) ?? getQuranItem(id);
}

function loadSearchIndex(): Promise<QuranSearchResult[]> {
  if (!searchCache) {
    searchCache = fetch('/data/quran/search-index.json')
      .then((response) => {
        if (!response.ok) throw new Error('Search is unavailable offline until it has been loaded once.');
        return response.json() as Promise<unknown>;
      })
      .then((value) => {
        if (!Array.isArray(value) || value.length !== quranVerseCount) {
          throw new Error('The Quran search index is incomplete.');
        }
        return value.map((entry: unknown) => {
          if (!entry || typeof entry !== 'object') throw new Error('A search record is invalid.');
          const result = entry as Record<string, unknown>;
          if (
            typeof result.id !== 'string' ||
            !parseQuranId(result.id) ||
            typeof result.surah !== 'number' ||
            typeof result.ayah !== 'number' ||
            typeof result.surahName !== 'string' ||
            typeof result.en !== 'string' ||
            typeof result.bn !== 'string'
          ) {
            throw new Error('A search record is invalid.');
          }
          return {
            id: result.id,
            surah: result.surah,
            ayah: result.ayah,
            surahName: result.surahName,
            en: result.en,
            bn: result.bn,
          };
        });
      })
      .catch((error: unknown) => {
        searchCache = undefined;
        throw error;
      });
  }
  return searchCache;
}

export async function searchQuran(query: string): Promise<QuranSearchResult[]> {
  const needles = query.toLocaleLowerCase().split(/\s+/).filter(Boolean);
  if (needles.length === 0) return [];
  const index = await loadSearchIndex();
  return index.filter((entry) => {
    const searchable =
      `${entry.id} ${entry.surah}:${entry.ayah} ${entry.surahName} ${entry.en} ${entry.bn}`.toLocaleLowerCase();
    return needles.every((needle) => searchable.includes(needle));
  });
}
