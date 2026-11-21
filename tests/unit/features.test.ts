import { describe, expect, it } from 'vitest';
import { translate } from '../../src/lib/i18n';
import { audioUrl, nextPosition, previousPosition, reciters } from '../../src/lib/audio/recitation';
import { emptyMix, layers, sanitizeMix } from '../../src/lib/audio/ambient';
import { defaultSettings, sanitizeSettings } from '../../src/lib/settings';
import { loadCustomTemplates } from '../../src/lib/share/templates';

describe('interface language', () => {
  it('renders English, Bangla, or both', () => {
    expect(translate('nav.home', 'en')).toBe('Home');
    expect(translate('nav.home', 'bn')).toBe('হোম');
    expect(translate('nav.home', 'both')).toBe('Home · হোম');
  });
  it('falls back to English for unknown saved values', () => {
    expect(sanitizeSettings({ uiLanguage: 'fr' }).uiLanguage).toBe('en');
    expect(sanitizeSettings({ uiLanguage: 'both' }).uiLanguage).toBe('both');
    expect(defaultSettings.uiLanguage).toBe('en');
  });
});

describe('recitation', () => {
  it('builds EveryAyah URLs with zero padding', () => {
    expect(audioUrl('Alafasy_128kbps', 1, 1)).toBe('https://everyayah.com/data/Alafasy_128kbps/001001.mp3');
    expect(audioUrl('Husary_128kbps', 114, 6)).toBe('https://everyayah.com/data/Husary_128kbps/114006.mp3');
  });
  it('walks verse to verse and across surahs, and stops at the end', () => {
    expect(nextPosition({ surah: 1, ayah: 7 })).toEqual({ surah: 2, ayah: 1 });
    expect(nextPosition({ surah: 2, ayah: 1 })).toEqual({ surah: 2, ayah: 2 });
    expect(nextPosition({ surah: 114, ayah: 6 })).toBeUndefined();
    expect(previousPosition({ surah: 2, ayah: 1 })).toEqual({ surah: 1, ayah: 7 });
    expect(previousPosition({ surah: 1, ayah: 1 })).toBeUndefined();
  });
  it('only accepts safe reciter folder names from storage', () => {
    expect(sanitizeSettings({ reciter: '../../etc' }).reciter).toBe(defaultSettings.reciter);
    expect(sanitizeSettings({ reciter: reciters[2].id }).reciter).toBe(reciters[2].id);
  });
});

describe('calm sounds', () => {
  it('clamps and completes any saved mix', () => {
    const mix = sanitizeMix({ master: 7, levels: { rain: -3, wind: 0.5, bogus: 1 } });
    expect(mix.master).toBe(1);
    expect(mix.levels.rain).toBe(0);
    expect(mix.levels.wind).toBe(0.5);
    expect(Object.keys(mix.levels)).toHaveLength(layers.length);
    expect(sanitizeMix('nonsense')).toEqual(sanitizeMix(null));
    expect(emptyMix.levels.rain).toBe(0);
  });
});

describe('share templates', () => {
  it('returns nothing when the optional manifest is missing', async () => {
    const original = globalThis.fetch;
    globalThis.fetch = (async () => new Response('nope', { status: 404 })) as typeof fetch;
    expect(await loadCustomTemplates()).toEqual([]);
    globalThis.fetch = original;
  });
  it('skips entries with unsafe file names', async () => {
    const original = globalThis.fetch;
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify([
          { id: 'ok', name: 'Fine', file: 'dunes.jpg' },
          { id: 'bad', name: 'Evil', file: '../secret.jpg' },
          { id: 'bad2', name: 'Evil', file: 'https://x.test/a.jpg' },
        ]),
      )) as typeof fetch;
    const list = await loadCustomTemplates();
    expect(list.map((entry) => entry.name)).toEqual(['Fine']);
    expect(list[0].photoUrl).toBe('/share-templates/dunes.jpg');
    globalThis.fetch = original;
  });
});
