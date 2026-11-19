import { readFile } from 'node:fs/promises';
import { VERSE_COUNTS, type RawQuranFile, type ReminderPool } from './data-model';

const files = ['quran-uthmani', 'en-sahih', 'bn-muhiuddin-khan'] as const;
const editions = await Promise.all(
  files.map(
    async (id) => JSON.parse(await readFile(`data/sources/${id}.json`, 'utf8')) as RawQuranFile,
  ),
);
const [arabic, english, bangla] = editions;
function hasForbiddenCodepoint(character: string): boolean {
  const codepoint = character.codePointAt(0) ?? 0;
  return (
    (codepoint >= 0x00 && codepoint <= 0x08) ||
    codepoint === 0x0b ||
    codepoint === 0x0c ||
    (codepoint >= 0x0e && codepoint <= 0x1f) ||
    codepoint === 0x7f ||
    (codepoint >= 0x200b && codepoint <= 0x200f) ||
    (codepoint >= 0x202a && codepoint <= 0x202e) ||
    (codepoint >= 0x2060 && codepoint <= 0x2064) ||
    (codepoint >= 0x2066 && codepoint <= 0x2069) ||
    codepoint === 0xfeff
  );
}

function requireCondition(condition: unknown, id: string, cause: string): asserts condition {
  if (!condition) throw new Error(`${id}: ${cause}`);
}

function validateStructure(edition: RawQuranFile, label: string): void {
  requireCondition(edition.code === 200, label, 'source response was not successful');
  requireCondition(
    edition.data.surahs.length === 114,
    label,
    `expected 114 surahs, found ${edition.data.surahs.length}`,
  );
  let verseTotal = 0;

  for (const surah of edition.data.surahs) {
    const id = `${label}:surah-${surah.number}`;
    requireCondition(
      surah.ayahs.length === VERSE_COUNTS[surah.number - 1],
      id,
      'unexpected verse count',
    );
    if (surah.numberOfAyahs !== undefined) {
      requireCondition(
        surah.numberOfAyahs === surah.ayahs.length,
        id,
        'declared verse count does not match records',
      );
    }
    verseTotal += surah.ayahs.length;

    for (const ayah of surah.ayahs) {
      const ayahId = `${label}:${surah.number}:${ayah.numberInSurah}`;
      requireCondition(ayah.text.length > 0, ayahId, 'empty text');
      const invisibleCodepoints = [...ayah.text].filter(hasForbiddenCodepoint);
      const isFrozenBomAllowance =
        label === 'ar' &&
        surah.number === 1 &&
        ayah.numberInSurah === 1 &&
        invisibleCodepoints.every((character) => character === '\uFEFF');
      requireCondition(
        invisibleCodepoints.length === 0 || isFrozenBomAllowance,
        ayahId,
        `unexpected control or zero-width codepoint: ${invisibleCodepoints.map((character) => `U+${character.codePointAt(0)?.toString(16).toUpperCase()}`).join(', ')}`,
      );
    }
  }

  requireCondition(verseTotal === 6236, label, `expected 6236 verses, found ${verseTotal}`);
}

validateStructure(arabic, 'ar');
validateStructure(english, 'en');
validateStructure(bangla, 'bn');

for (let surahIndex = 0; surahIndex < 114; surahIndex += 1) {
  const arSurah = arabic.data.surahs[surahIndex];
  const enSurah = english.data.surahs[surahIndex];
  const bnSurah = bangla.data.surahs[surahIndex];
  requireCondition(
    arSurah.number === surahIndex + 1,
    `surah-${surahIndex + 1}`,
    'surahs are out of order',
  );
  requireCondition(
    enSurah.number === arSurah.number && bnSurah.number === arSurah.number,
    `surah-${arSurah.number}`,
    'translation surah mismatch',
  );

  for (let ayahIndex = 0; ayahIndex < arSurah.ayahs.length; ayahIndex += 1) {
    const arAyah = arSurah.ayahs[ayahIndex];
    const enAyah = enSurah.ayahs[ayahIndex];
    const bnAyah = bnSurah.ayahs[ayahIndex];
    const id = `q:${arSurah.number}:${arAyah.numberInSurah}`;
    requireCondition(
      enAyah.numberInSurah === arAyah.numberInSurah &&
        bnAyah.numberInSurah === arAyah.numberInSurah,
      id,
      'translation ayah mismatch',
    );
    requireCondition(
      enAyah.number === arAyah.number && bnAyah.number === arAyah.number,
      id,
      'global ayah reference mismatch',
    );
  }
}

const pool = JSON.parse(await readFile('data/pools/reminder-pool.json', 'utf8')) as ReminderPool;
const categories = JSON.parse(await readFile('data/pools/categories.json', 'utf8')) as {
  categories: Array<{ id: string; items: string[] }>;
};
const poolIds = new Set<string>();

for (const entry of pool.items) {
  requireCondition(!poolIds.has(entry.id), entry.id, 'duplicate pool id');
  poolIds.add(entry.id);
  const match = /^q:(\d+):(\d+)$/.exec(entry.id);
  requireCondition(
    match,
    entry.id,
    'unsupported id; only approved Qur’an reminders are currently present',
  );
  const [, surah, ayah] = match;
  requireCondition(
    Boolean(arabic.data.surahs[Number(surah) - 1]?.ayahs[Number(ayah) - 1]),
    entry.id,
    'pool id does not exist in the frozen dataset',
  );
  requireCondition(
    entry.categories.every((category) =>
      categories.categories.some((item) => item.id === category),
    ),
    entry.id,
    'unknown category assignment',
  );
}

for (const category of categories.categories) {
  for (const id of category.items)
    requireCondition(poolIds.has(id), id, 'category item is absent from the reviewed pool');
}

console.log(
  `Verified 114 surahs, 6236 aligned verses, and ${pool.items.length} owner-approved reminder-pool items.`,
);
