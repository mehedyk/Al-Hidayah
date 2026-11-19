import generated from '../data/generated/items.json';
import type { Item } from './types';

export function isItem(value: unknown): value is Item {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  const ref = item.ref as Record<string, unknown> | undefined;
  return (
    typeof item.id === 'string' &&
    typeof item.ar === 'string' &&
    item.ar.length > 0 &&
    typeof item.en === 'string' &&
    item.en.length > 0 &&
    typeof item.bn === 'string' &&
    item.bn.length > 0 &&
    typeof item.contextUrl === 'string' &&
    Array.isArray(item.categories) &&
    ref?.kind === 'quran' &&
    typeof ref.surah === 'number' &&
    typeof ref.ayah === 'number' &&
    typeof ref.surahName === 'string'
  );
}

export const poolVersion = generated.poolVersion;
export const items: Item[] = generated.items.map((item: unknown) => {
  if (!isItem(item)) throw new Error('Incomplete reminder data; the item cannot be displayed.');
  return item;
});

export function getItem(id: string): Item | undefined {
  return items.find((item) => item.id === id);
}

export function formatReference(item: Item): string {
  if (item.ref.kind === 'quran') {
    return `Qur’an · ${item.ref.surahName} ${item.ref.surah}:${item.ref.ayah}`;
  }
  return `Sahih ${item.ref.collection === 'bukhari' ? 'al-Bukhari' : 'Muslim'} · Book ${item.ref.book}, Hadith ${item.ref.number} · Sahih`;
}

export function formatShortReference(item: Item): string {
  return item.ref.kind === 'quran'
    ? `Qur’an, ${item.ref.surah}:${item.ref.ayah}`
    : `Sahih ${item.ref.collection}, ${item.ref.number}`;
}
