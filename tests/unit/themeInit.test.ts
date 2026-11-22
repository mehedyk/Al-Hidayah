import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { scenes, WALLPAPER_SOURCE } from '../../src/lib/scenes';

const init = readFileSync(new URL('../../public/theme-init.js', import.meta.url), 'utf8');

describe('theme-init.js (pre-paint script)', () => {
  it('knows every scene, with the same photo and local flag as scenes.ts', () => {
    for (const scene of scenes) {
      const local = scene.local ? ', local: true' : '';
      expect(init).toContain(`${scene.id}: { photo: ${scene.photoId}${local} }`);
    }
    expect(init.match(/photo: \d+/g)).toHaveLength(scenes.length);
  });

  it('uses the same wallpaper source as scenes.ts', () => {
    expect(init).toContain(`WALLPAPER_SOURCE = '${WALLPAPER_SOURCE}'`);
  });
});
