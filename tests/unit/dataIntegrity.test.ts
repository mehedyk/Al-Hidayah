import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { formatReference, items } from '../../src/lib/data';
import { reminderText } from '../../src/lib/share/shareText';
import type { RawQuranFile, ReminderPool } from '../../scripts/data-model';
import generated from '../../src/data/generated/items.json';
import quranIndex from '../../src/data/generated/quran-index.json';
import type { Item } from '../../src/lib/types';

describe('shipped reminder data', () => {
  it('matches the frozen Arabic, English, and Bangla codepoints', async () => {
    const pool = JSON.parse(
      await readFile('data/pools/reminder-pool.json', 'utf8'),
    ) as ReminderPool;
    const arabic = JSON.parse(
      await readFile('data/sources/quran-uthmani.json', 'utf8'),
    ) as RawQuranFile;
    const english = JSON.parse(
      await readFile('data/sources/en-sahih.json', 'utf8'),
    ) as RawQuranFile;
    const bangla = JSON.parse(
      await readFile('data/sources/bn-muhiuddin-khan.json', 'utf8'),
    ) as RawQuranFile;

    for (const entry of pool.items) {
      const [, surah, ayah] = entry.id.split(':');
      const item = generated.items.find((candidate) => candidate.id === entry.id);
      expect(item).toBeDefined();
      expect(item?.ar).toBe(arabic.data.surahs[Number(surah) - 1].ayahs[Number(ayah) - 1].text);
      expect(item?.en).toBe(english.data.surahs[Number(surah) - 1].ayahs[Number(ayah) - 1].text);
      expect(item?.bn).toBe(bangla.data.surahs[Number(surah) - 1].ayahs[Number(ayah) - 1].text);
    }
  });

  it('ships every frozen verse and translation in the complete library without changing codepoints', async () => {
    const [arabic, english, bangla, searchIndex] = await Promise.all([
      readFile('data/sources/quran-uthmani.json', 'utf8').then(
        (value) => JSON.parse(value) as RawQuranFile,
      ),
      readFile('data/sources/en-sahih.json', 'utf8').then(
        (value) => JSON.parse(value) as RawQuranFile,
      ),
      readFile('data/sources/bn-muhiuddin-khan.json', 'utf8').then(
        (value) => JSON.parse(value) as RawQuranFile,
      ),
      readFile('public/data/quran/search-index.json', 'utf8').then(
        (value) =>
          JSON.parse(value) as Array<{
            id: string;
            surah: number;
            ayah: number;
            surahName: string;
            en: string;
            bn: string;
          }>,
      ),
    ]);

    expect(quranIndex.surahs).toHaveLength(114);
    expect(quranIndex.verseCount).toBe(6236);
    expect(searchIndex).toHaveLength(6236);
    let verseTotal = 0;
    for (const summary of quranIndex.surahs) {
      const shard = JSON.parse(
        await readFile(
          `public/data/quran/surahs/${String(summary.number).padStart(3, '0')}.json`,
          'utf8',
        ),
      ) as { items: Item[] };
      expect(shard.items).toHaveLength(summary.numberOfAyahs);
      for (const item of shard.items) {
        if (item.ref.kind !== 'quran') throw new Error('Unexpected library reference.');
        const surahIndex = item.ref.surah - 1;
        const ayahIndex = item.ref.ayah - 1;
        expect(item.ar).toBe(arabic.data.surahs[surahIndex].ayahs[ayahIndex].text);
        expect(item.en).toBe(english.data.surahs[surahIndex].ayahs[ayahIndex].text);
        expect(item.bn).toBe(bangla.data.surahs[surahIndex].ayahs[ayahIndex].text);
        const searchRecord = searchIndex[verseTotal];
        expect(searchRecord.id).toBe(item.id);
        expect(searchRecord.en).toBe(item.en);
        expect(searchRecord.bn).toBe(item.bn);
        verseTotal += 1;
      }
    }
    expect(verseTotal).toBe(6236);
  });

  it('always includes a reference in displayed and copied text', () => {
    for (const item of items) {
      expect(item.ref.kind).toBe('quran');
      if (item.ref.kind !== 'quran') throw new Error('Unexpected reminder reference.');
      expect(formatReference(item)).toContain(`${item.ref.surah}:${item.ref.ayah}`);
      expect(reminderText(item, true, true)).toContain(formatReference(item));
      expect(reminderText(item, false, false)).toContain(item.ar);
    }
  });
});

describe('juz navigation index', () => {
  it('lists all 30 juz in order, each pointing at a real ayah', () => {
    expect(quranIndex.juz).toHaveLength(30);
    let previous = 0;
    quranIndex.juz.forEach((juz, index) => {
      expect(juz.number).toBe(index + 1);
      const summary = quranIndex.surahs[juz.surah - 1];
      expect(summary).toBeDefined();
      expect(juz.ayah).toBeGreaterThanOrEqual(1);
      expect(juz.ayah).toBeLessThanOrEqual(summary.numberOfAyahs);
      const position = juz.surah * 1000 + juz.ayah;
      expect(position).toBeGreaterThan(previous);
      previous = position;
    });
    expect(quranIndex.juz[1]).toMatchObject({ surah: 2, ayah: 142 });
    expect(quranIndex.juz[29]).toMatchObject({ surah: 78, ayah: 1 });
  });
});
