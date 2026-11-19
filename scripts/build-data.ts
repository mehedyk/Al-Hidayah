import { readFile, writeFile } from 'node:fs/promises';
import type { RawQuranFile, ReminderPool } from './data-model';

const [arabic, english, bangla, pool] = await Promise.all([
  readFile('data/sources/quran-uthmani.json', 'utf8').then(
    (value) => JSON.parse(value) as RawQuranFile,
  ),
  readFile('data/sources/en-sahih.json', 'utf8').then((value) => JSON.parse(value) as RawQuranFile),
  readFile('data/sources/bn-muhiuddin-khan.json', 'utf8').then(
    (value) => JSON.parse(value) as RawQuranFile,
  ),
  readFile('data/pools/reminder-pool.json', 'utf8').then(
    (value) => JSON.parse(value) as ReminderPool,
  ),
]);

const items = pool.items.map((entry) => {
  const match = /^q:(\d+):(\d+)$/.exec(entry.id);
  if (!match) throw new Error(`${entry.id}: unsupported reminder id.`);
  const surahNumber = Number(match[1]);
  const ayahNumber = Number(match[2]);
  const arSurah = arabic.data.surahs[surahNumber - 1];
  const enSurah = english.data.surahs[surahNumber - 1];
  const bnSurah = bangla.data.surahs[surahNumber - 1];
  const ar = arSurah.ayahs[ayahNumber - 1].text;
  const en = enSurah.ayahs[ayahNumber - 1].text;
  const bn = bnSurah.ayahs[ayahNumber - 1].text;

  return {
    id: entry.id,
    ref: {
      kind: 'quran',
      surah: surahNumber,
      ayah: ayahNumber,
      surahName: arSurah.englishName,
      edition: {
        ar: arabic.data.edition.englishName,
        en: english.data.edition.englishName,
        bn: bangla.data.edition.englishName,
      },
    },
    ar,
    en,
    bn,
    categories: entry.categories,
    contextUrl: `https://quran.com/${surahNumber}/${ayahNumber}`,
  };
});

await writeFile(
  'src/data/generated/items.json',
  `${JSON.stringify({ poolVersion: pool.poolVersion, items }, null, 2)}\n`,
);
console.log(`Built ${items.length} reminder records without changing source text.`);
