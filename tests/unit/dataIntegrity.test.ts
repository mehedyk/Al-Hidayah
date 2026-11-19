import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { formatReference, items } from '../../src/lib/data';
import { reminderText } from '../../src/lib/share/shareText';
import type { RawQuranFile, ReminderPool } from '../../scripts/data-model';
import generated from '../../src/data/generated/items.json';

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
