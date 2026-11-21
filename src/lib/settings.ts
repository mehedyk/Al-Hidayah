import { defaultSceneId, isSceneId } from './scenes';
import type { Settings, TextSize, Theme } from './types';

const STORAGE_KEY = 'al-hidayah:settings:v1';

export const defaultSettings: Settings = {
  theme: 'dark',
  scene: defaultSceneId,
  showEnglish: true,
  showBangla: true,
  textSize: 'default',
  reducedMotion: false,
  city: 'Dhaka',
  prayerMethod: 1,
  dailyEnabled: false,
  dailyTime: '07:00',
};

const themes: Theme[] = ['dark', 'light', 'system'];
const textSizes: TextSize[] = ['small', 'default', 'large', 'extra-large'];

/** Turns anything read from storage into a safe Settings object; unknown values fall back. */
export function sanitizeSettings(value: unknown): Settings {
  if (!value || typeof value !== 'object') return defaultSettings;
  const saved = value as Partial<Record<keyof Settings, unknown>>;
  return {
    ...defaultSettings,
    theme: themes.includes(saved.theme as Theme) ? (saved.theme as Theme) : defaultSettings.theme,
    scene: isSceneId(saved.scene) ? saved.scene : defaultSettings.scene,
    textSize: textSizes.includes(saved.textSize as TextSize)
      ? (saved.textSize as TextSize)
      : defaultSettings.textSize,
    showEnglish: saved.showEnglish !== false,
    showBangla: saved.showBangla !== false,
    reducedMotion: saved.reducedMotion === true,
    city: typeof saved.city === 'string' && saved.city ? saved.city : defaultSettings.city,
    prayerMethod:
      typeof saved.prayerMethod === 'number' ? saved.prayerMethod : defaultSettings.prayerMethod,
    dailyEnabled: saved.dailyEnabled === true,
    dailyTime:
      typeof saved.dailyTime === 'string' && /^\d{2}:\d{2}$/.test(saved.dailyTime)
        ? saved.dailyTime
        : defaultSettings.dailyTime,
  };
}

export function loadSettings(): Settings {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    return sanitizeSettings(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}'));
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
