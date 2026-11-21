/**
 * Scene themes: real, openly licensed photographs used as decorative page wallpapers.
 *
 * Every photo is from Pexels (https://www.pexels.com/license/: free for commercial use, no
 * attribution required, modification allowed). None shows people, buildings or text, in line with
 * AGENTS.md section 3. Credit is given anyway, in the Settings page and in docs/ASSETS.md.
 *
 * The photos are loaded from the Pexels CDN by default (see WALLPAPER_SOURCE). Run
 * `pnpm wallpapers:fetch` to download them into public/wallpapers/ and serve them from your own
 * origin instead; the script flips the constant below for you.
 */
export type SceneId = 'emerald' | 'ink' | 'dawn' | 'sahara' | 'midnight';

export interface Scene {
  id: SceneId;
  name: string;
  mood: string;
  /** Pexels photo id, used to build the CDN URL. */
  photoId: number;
  photographer: string;
  title: string;
  page: string;
  /** Three swatches for the picker: backdrop, surface, accent. */
  swatch: [string, string, string];
}

export type WallpaperSource = 'remote' | 'local';
export const WALLPAPER_SOURCE: WallpaperSource = 'remote';
export const WALLPAPER_CDN = 'https://images.pexels.com';

export const scenes: Scene[] = [
  {
    id: 'emerald',
    name: 'Emerald Mist',
    mood: 'The classic Al-Hidayah green',
    photoId: 39757686,
    photographer: 'Sami TÜRK',
    title: 'Serene misty lake with lush greenery and fog-shrouded mountains',
    page: 'https://www.pexels.com/photo/misty-lake-with-lush-greenery-and-foggy-mountains-39757686/',
    swatch: ['#08241d', '#123b30', '#e2b857'],
  },
  {
    id: 'ink',
    name: 'Ink Mountains',
    mood: 'Quiet teal, like ink on paper',
    photoId: 10989215,
    photographer: 'Marina Solis',
    title: 'Mountain range enveloped in mist',
    page: 'https://www.pexels.com/photo/misty-mountains-10989215/',
    swatch: ['#0c2f36', '#175a67', '#eae3de'],
  },
  {
    id: 'dawn',
    name: 'Lake at Dawn',
    mood: 'A still lake before sunrise',
    photoId: 29609552,
    photographer: 'eberhard grossgasteiger',
    title: 'Mountain lake with perfect reflections at dawn',
    page: 'https://www.pexels.com/photo/serene-mountain-lake-reflection-at-dawn-29609552/',
    swatch: ['#2a2330', '#5a4a5c', '#f0b98f'],
  },
  {
    id: 'sahara',
    name: 'Golden Dunes',
    mood: 'Warm sand in evening light',
    photoId: 28829635,
    photographer: 'NaturEye Conservation',
    title: 'Sahara Desert dunes in golden hour light',
    page: 'https://www.pexels.com/photo/golden-sahara-desert-dunes-at-sunset-28829635/',
    swatch: ['#2b1c0f', '#7a4a1f', '#f0b45a'],
  },
  {
    id: 'midnight',
    name: 'Crescent Night',
    mood: 'A crescent moon among the stars',
    photoId: 28849652,
    photographer: 'Cris Ménlés',
    title: 'Crescent moon surrounded by stars and clouds',
    page: 'https://www.pexels.com/photo/crescent-moon-in-a-starry-night-sky-28849652/',
    swatch: ['#080d28', '#1d2a63', '#e6ecff'],
  },
];

export const defaultSceneId: SceneId = 'emerald';

export function isSceneId(value: unknown): value is SceneId {
  return typeof value === 'string' && scenes.some((scene) => scene.id === value);
}

export function getScene(id: SceneId): Scene {
  return scenes.find((scene) => scene.id === id) ?? scenes[0];
}

/** URL of the wallpaper for a scene; `width` picks a smaller file on phones. */
export function wallpaperUrl(scene: Scene, width: 400 | 1080 | 1920 = 1920): string {
  if (WALLPAPER_SOURCE === 'local') return `/wallpapers/${scene.id}-${width === 400 ? 1080 : width}.jpg`;
  return `${WALLPAPER_CDN}/photos/${scene.photoId}/pexels-photo-${scene.photoId}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;
}
