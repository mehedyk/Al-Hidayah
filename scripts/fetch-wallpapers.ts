/**
 * Optional: download the Pexels scene photos and serve them from your own origin.
 *
 *   pnpm wallpapers:fetch
 *
 * Writes public/wallpapers/<scene>-1080.jpg and -1920.jpg, then switches WALLPAPER_SOURCE in
 * src/lib/scenes.ts to 'local'. After that the Pexels hosts can be removed from the CSP.
 * Needs outbound HTTPS to images.pexels.com.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { scenes, WALLPAPER_CDN } from '../src/lib/scenes';

await mkdir('public/wallpapers', { recursive: true });
for (const scene of scenes) {
  for (const width of [1080, 1920]) {
    const url = `${WALLPAPER_CDN}/photos/${scene.photoId}/pexels-photo-${scene.photoId}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${scene.id} ${width}px: HTTP ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    await writeFile(`public/wallpapers/${scene.id}-${width}.jpg`, bytes);
    console.log(`${scene.id}-${width}.jpg  ${(bytes.length / 1024).toFixed(0)} KB`);
  }
}
const file = 'src/lib/scenes.ts';
const source = await readFile(file, 'utf8');
await writeFile(file, source.replace("WALLPAPER_SOURCE: WallpaperSource = 'remote'", "WALLPAPER_SOURCE: WallpaperSource = 'local'"));
console.log('Switched WALLPAPER_SOURCE to local.');
