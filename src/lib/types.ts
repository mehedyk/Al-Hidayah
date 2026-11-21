import type { SceneId } from './scenes';

export type Route =
  | 'home'
  | 'quran'
  | 'hadith'
  | 'categories'
  | 'daily'
  | 'prayer'
  | 'favorites'
  | 'about'
  | 'settings';

export interface QuranReference {
  kind: 'quran';
  surah: number;
  ayah: number;
  surahName: string;
  edition: { ar: string; en: string; bn: string };
}

export interface HadithReference {
  kind: 'hadith';
  collection: 'bukhari' | 'muslim';
  book: number;
  number: number;
  grade: 'sahih';
  edition: { ar: string; en: string; bn: string };
}

export interface Item {
  id: string;
  ref: QuranReference | HadithReference;
  ar: string;
  en: string;
  bn: string;
  categories: string[];
  contextUrl: string;
}

export type Theme = 'dark' | 'light' | 'system';
export type TextSize = 'small' | 'default' | 'large' | 'extra-large';

export interface Settings {
  theme: Theme;
  scene: SceneId;
  showEnglish: boolean;
  showBangla: boolean;
  textSize: TextSize;
  reducedMotion: boolean;
  city: string;
  prayerMethod: number;
  dailyEnabled: boolean;
  dailyTime: string;
}

export interface PrayerDay {
  date: string;
  fetchedAt: string;
  city: string;
  timings: Record<'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha', string>;
}
