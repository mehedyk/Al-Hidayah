import { mkdir, readFile, writeFile } from 'node:fs/promises';
import type { RawQuranFile, RawSurah, ReminderPool } from './data-model';

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

const edition = {
  ar: arabic.data.edition.englishName,
  en: english.data.edition.englishName,
  bn: bangla.data.edition.englishName,
};

function buildItem(surah: RawSurah, ayahNumber: number, categories: string[]) {
  const surahIndex = surah.number - 1;
  const ayahIndex = ayahNumber - 1;
  return {
    id: `q:${surah.number}:${ayahNumber}`,
    ref: {
      kind: 'quran',
      surah: surah.number,
      ayah: ayahNumber,
      surahName: surah.englishName,
      edition,
    },
    ar: surah.ayahs[ayahIndex].text,
    en: english.data.surahs[surahIndex].ayahs[ayahIndex].text,
    bn: bangla.data.surahs[surahIndex].ayahs[ayahIndex].text,
    categories,
    contextUrl: `https://quran.com/${surah.number}/${ayahNumber}`,
  };
}

const items = pool.items.map((entry) => {
  const match = /^q:(\d+):(\d+)$/.exec(entry.id);
  if (!match) throw new Error(`${entry.id}: unsupported reminder id.`);
  const surah = arabic.data.surahs[Number(match[1]) - 1];
  return buildItem(surah, Number(match[2]), entry.categories);
});

await writeFile(
  'src/data/generated/items.json',
  `${JSON.stringify({ poolVersion: pool.poolVersion, items }, null, 2)}\n`,
);

const surahs = arabic.data.surahs.map((surah) => ({
  number: surah.number,
  name: surah.name,
  englishName: surah.englishName,
  englishNameTranslation: surah.englishNameTranslation,
  numberOfAyahs: surah.ayahs.length,
}));
const quranIndex = { version: 1, verseCount: 6236, surahs };
await Promise.all([
  mkdir('public/data/quran/surahs', { recursive: true }),
  writeFile('src/data/generated/quran-index.json', `${JSON.stringify(quranIndex, null, 2)}\n`),
]);

const searchIndex = [];
for (const surah of arabic.data.surahs) {
  const shard = {
    ...quranIndex.surahs[surah.number - 1],
    items: surah.ayahs.map((ayah) => buildItem(surah, ayah.numberInSurah, [])),
  };
  await writeFile(
    `public/data/quran/surahs/${String(surah.number).padStart(3, '0')}.json`,
    JSON.stringify(shard),
  );
  for (const item of shard.items) {
    searchIndex.push({
      id: item.id,
      surah: surah.number,
      ayah: item.ref.ayah,
      surahName: surah.englishName,
      en: item.en,
      bn: item.bn,
    });
  }
}
await writeFile('public/data/quran/search-index.json', JSON.stringify(searchIndex));

console.log(
  `Built ${items.length} reviewed reminders, 114 Quran shards, and ${searchIndex.length} search records without changing source text.`,
);
