import type { Settings } from './types';

const STORAGE_KEY = 'al-hidayah:settings:v1';

export const defaultSettings: Settings = {
  theme: 'dark',
  showEnglish: true,
  showBangla: true,
  textSize: 'default',
  reducedMotion: false,
  city: 'Dhaka',
  prayerMethod: 1,
  dailyEnabled: false,
  dailyTime: '07:00',
};

export function loadSettings(): Settings {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    if (!value || typeof value !== 'object') return defaultSettings;
    const saved = value as Partial<Settings>;
    return {
      ...defaultSettings,
      ...saved,
      showEnglish: saved.showEnglish !== false,
      showBangla: saved.showBangla !== false,
      dailyEnabled: saved.dailyEnabled === true,
    };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
