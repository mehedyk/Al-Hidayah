import { describe, expect, it } from 'vitest';
import { defaultSettings, sanitizeSettings } from '../../src/lib/settings';
import { getScene, isSceneId, scenes, wallpaperUrl } from '../../src/lib/scenes';

describe('settings sanitiser', () => {
  it('returns defaults for anything that is not an object', () => {
    for (const value of [null, undefined, 'x', 7, []]) {
      expect(sanitizeSettings(value)).toEqual(defaultSettings);
    }
  });

  it('keeps valid values and replaces invalid ones', () => {
    const result = sanitizeSettings({
      theme: 'light',
      scene: 'midnight',
      textSize: 'huge',
      dailyTime: '7am',
      showEnglish: false,
    });
    expect(result.theme).toBe('light');
    expect(result.scene).toBe('midnight');
    expect(result.textSize).toBe(defaultSettings.textSize);
    expect(result.dailyTime).toBe(defaultSettings.dailyTime);
    expect(result.showEnglish).toBe(false);
  });

  it('rejects unknown scenes', () => {
    expect(sanitizeSettings({ scene: '<script>' }).scene).toBe('emerald');
    expect(isSceneId('dawn')).toBe(true);
    expect(isSceneId('nope')).toBe(false);
  });
});

describe('scene catalogue', () => {
  it('has five unique scenes, each with a credited Pexels photo', () => {
    expect(new Set(scenes.map((scene) => scene.id)).size).toBe(5);
    for (const scene of scenes) {
      expect(scene.photographer.length).toBeGreaterThan(0);
      expect(scene.page).toContain(`${scene.photoId}`);
      expect(scene.page.startsWith('https://www.pexels.com/photo/')).toBe(true);
      expect(wallpaperUrl(scene, 1080)).toContain(`pexels-photo-${scene.photoId}.jpeg`);
    }
    expect(getScene('ink').name).toBe('Ink Mountains');
  });
});
