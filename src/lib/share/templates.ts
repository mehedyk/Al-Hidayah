import { scenes, wallpaperUrl } from '../scenes';

/**
 * Share-card backgrounds.
 *  - "built-in": drawn in code (gradient + geometric lattice). Original work, no licence needed.
 *  - "photo": the Pexels scene photographs (free licence), loaded at render time.
 *  - "custom": any pictures you add to public/share-templates/ and list in templates.json.
 * If a photo cannot be loaded (offline, host blocked) the card falls back to its gradient.
 */
export interface CardTemplate {
  id: string;
  name: string;
  kind: 'built-in' | 'photo' | 'custom';
  /** Background gradient, top then bottom; also the fallback behind photos. */
  colors: [string, string];
  /** Text palette: light text on dark backgrounds, dark text on pale ones. */
  tone: 'light' | 'dark';
  accent: string;
  pattern: boolean;
  photoUrl?: string;
  credit?: string;
}

export const builtInTemplates: CardTemplate[] = [
  { id: 'emerald', name: 'Emerald', kind: 'built-in', colors: ['#0d3b2e', '#06241b'], tone: 'light', accent: '#e2b857', pattern: true },
  { id: 'midnight', name: 'Midnight', kind: 'built-in', colors: ['#141a4a', '#060a20'], tone: 'light', accent: '#c9d4ff', pattern: true },
  { id: 'cream', name: 'Cream', kind: 'built-in', colors: ['#fbf5e6', '#efe3c4'], tone: 'dark', accent: '#9a6f12', pattern: true },
  { id: 'dawn', name: 'Dawn', kind: 'built-in', colors: ['#4a3350', '#2b2029'], tone: 'light', accent: '#f0b98f', pattern: true },
  { id: 'sahara', name: 'Sahara', kind: 'built-in', colors: ['#5a3b1a', '#2a1b0e'], tone: 'light', accent: '#f0b45a', pattern: true },
];

export const photoTemplates: CardTemplate[] = scenes.map((scene) => ({
  id: `photo-${scene.id}`,
  name: scene.name,
  kind: 'photo',
  colors: [scene.swatch[1], scene.swatch[0]],
  tone: 'light',
  accent: scene.swatch[2],
  pattern: false,
  photoUrl: wallpaperUrl(scene, 1920),
  credit: `Photo: ${scene.photographer} / Pexels`,
}));

interface ManifestEntry {
  id?: unknown;
  name?: unknown;
  file?: unknown;
  tone?: unknown;
  accent?: unknown;
  credit?: unknown;
}

const SAFE_FILE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,80}\.(jpe?g|png|webp)$/i;
const SAFE_COLOR = /^#[0-9a-f]{6}$/i;

/** Reads /share-templates/templates.json (optional). Bad entries are skipped, never trusted. */
export async function loadCustomTemplates(): Promise<CardTemplate[]> {
  try {
    const response = await fetch('/share-templates/templates.json');
    if (!response.ok) return [];
    const list: unknown = await response.json();
    if (!Array.isArray(list)) return [];
    const out: CardTemplate[] = [];
    for (const entry of list as ManifestEntry[]) {
      if (
        !entry ||
        typeof entry.id !== 'string' ||
        typeof entry.name !== 'string' ||
        typeof entry.file !== 'string' ||
        !SAFE_FILE.test(entry.file)
      )
        continue;
      out.push({
        id: `custom-${entry.id.replace(/[^\w-]/g, '')}`,
        name: entry.name.slice(0, 30),
        kind: 'custom',
        colors: ['#1a2a28', '#0a1412'],
        tone: entry.tone === 'dark' ? 'dark' : 'light',
        accent:
          typeof entry.accent === 'string' && SAFE_COLOR.test(entry.accent)
            ? entry.accent
            : '#e2b857',
        pattern: false,
        photoUrl: `/share-templates/${entry.file}`,
        credit: typeof entry.credit === 'string' ? entry.credit.slice(0, 120) : undefined,
      });
    }
    return out;
  } catch {
    return [];
  }
}
