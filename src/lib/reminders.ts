import { dailyItemId } from './daily/dailyItem';
import { items } from './data';
import { cryptoRandom, dealNext, emptyBag, type ShuffleBagState } from './picker/shuffleBag';
import { quranIdList, quranSurahs } from './quranLibrary';
import type { ReminderSource } from './types';

/**
 * Where reminders come from.
 *  - 'quran'    : the whole Qur'an, all 6,236 verses (default).
 *  - 'reviewed' : only the small owner-reviewed set in data/pools/reminder-pool.json.
 * The reviewed pool file itself is never changed by this code.
 */
const quranPool = quranIdList.map((id) => ({ id }));

export function poolIds(source: ReminderSource): string[] {
  return source === 'reviewed' ? items.map((item) => item.id) : quranIdList;
}

/** Same verse for everyone on the same local calendar date, with no server and no randomness. */
export function dailyReminderId(date: Date, source: ReminderSource): string {
  return source === 'reviewed' ? dailyItemId(date, items) : dailyItemId(date, quranPool);
}

function loadBag(key: string): ShuffleBagState {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? 'null');
    if (!value || typeof value !== 'object') return emptyBag;
    const state = value as ShuffleBagState;
    return Array.isArray(state.bag) && typeof state.position === 'number' ? state : emptyBag;
  } catch {
    return emptyBag;
  }
}

/** Shuffle bag: every verse is dealt once before any repeats, and the position survives reloads. */
export function nextReminderId(source: ReminderSource, currentId: string): string {
  const key = `al-hidayah:shuffle:v2:${source}`;
  const result = dealNext(poolIds(source), { ...loadBag(key), lastId: currentId }, cryptoRandom);
  try {
    localStorage.setItem(key, JSON.stringify(result.state));
  } catch {
    // Storage can be full or blocked; the reminder still works, it just may repeat sooner.
  }
  return result.id;
}

/** "Qur'an, 94:6" from an id alone, so lists of days need no network request. */
export function shortReferenceFromId(id: string): string {
  const match = /^q:(\d+):(\d+)$/.exec(id);
  if (!match) return id;
  const surah = quranSurahs[Number(match[1]) - 1];
  return `Qur’an, ${surah ? `${surah.englishName} ` : ''}${match[1]}:${match[2]}`;
}
