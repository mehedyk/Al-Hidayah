/**
 * Interface language. The scripture is never translated here: Arabic, English and Bangla
 * renderings come only from the frozen sources. This file only covers the app's own buttons,
 * labels and headings. Modes: English, Bangla, or both together ("Home · হোম").
 */
import type { UiLanguage } from './types';

const dictionary = {
  'nav.home': ['Home', 'হোম'],
  'nav.quran': ['Qur’an', 'কুরআন'],
  'nav.favorites': ['Favorites', 'প্রিয়'],
  'nav.settings': ['Settings', 'সেটিংস'],
  'card.today': ['Today’s reminder', 'আজকের স্মরণিকা'],
  'card.new': ['Get New Reminder', 'নতুন স্মরণিকা'],
  'card.loading': ['Loading…', 'লোড হচ্ছে…'],
  'card.save': ['Save', 'সংরক্ষণ'],
  'card.saved': ['Saved', 'সংরক্ষিত'],
  'card.share': ['Share', 'শেয়ার'],
  'card.reader': ['Open in the Qur’an reader', 'কুরআন পাঠে খুলুন'],
  'card.context': ['Read in context', 'প্রসঙ্গসহ পড়ুন'],
  'title.quran': ['From the Qur’an', 'কুরআন থেকে'],
  'title.hadith': ['From the Hadith', 'হাদিস থেকে'],
  'title.categories': ['Guidance by theme', 'বিষয়ভিত্তিক দিকনির্দেশনা'],
  'title.daily': ['Daily Reminder', 'দৈনিক স্মরণিকা'],
  'title.prayer': ['Prayer Times', 'নামাজের সময়'],
  'title.favorites': ['Favorites', 'প্রিয় তালিকা'],
  'title.about': ['About Al-Hidayah', 'আল-হিদায়াহ সম্পর্কে'],
  'title.settings': ['Settings', 'সেটিংস'],
  'reader.surah': ['Choose a surah', 'সূরা নির্বাচন করুন'],
  'reader.juz': ['Juz (part)', 'পারা'],
  'reader.prev': ['Previous', 'আগের'],
  'reader.next': ['Next', 'পরের'],
  'reader.go': ['Go', 'যান'],
  'reader.continue': ['Continue', 'চালিয়ে যান'],
  'reader.search': ['Search all 6,236 verses…', 'সব ৬,২৩৬ আয়াতে খুঁজুন…'],
  'reader.listen': ['Listen', 'শুনুন'],
  'reader.playSurah': ['Play surah', 'পুরো সূরা শুনুন'],
  'hadi.nudge': ['Want to read it more comfortably?', 'আরও আরামে পড়তে চান?'],
  'hadi.cta': ['Open in Hadi', 'হাদি-তে পড়ুন'],
  'player.pause': ['Pause', 'বিরতি'],
  'player.play': ['Play', 'চালান'],
  'player.stop': ['Stop', 'বন্ধ'],
  'sound.title': ['Calm sounds', 'প্রশান্তির শব্দ'],
  'sound.open': ['Calm sounds mixer', 'শব্দ মিক্সার'],
  'share.title': ['Share this reminder', 'এই স্মরণিকা শেয়ার করুন'],
  'settings.language': ['Interface language', 'ইন্টারফেসের ভাষা'],
} as const satisfies Record<string, readonly [string, string]>;

export type TextKey = keyof typeof dictionary;

export function translate(key: TextKey, mode: UiLanguage): string {
  const [en, bn] = dictionary[key];
  if (mode === 'bn') return bn;
  if (mode === 'both') return `${en} · ${bn}`;
  return en;
}
