/**
 * Calm sounds: real recordings, looped and mixed in the browser.
 *
 * The recordings are NOT synthesised. You add them as ordinary files under public/sounds/ (see
 * public/sounds/README.md for the exact names, where to get licensed ones, and how to credit
 * them). A layer only appears in the mixer if its file exists, so the mixer never shows a control
 * that cannot play. Files are streamed (not decoded into memory), so long recordings are fine.
 */
export type LayerId = 'rain' | 'thunderstorm' | 'wind' | 'stream' | 'waves' | 'birds' | 'crickets';

export interface LayerInfo {
  id: LayerId;
  name: string;
  hint: string;
}

export const layerCatalog: LayerInfo[] = [
  { id: 'rain', name: 'Rain', hint: 'Steady rainfall' },
  { id: 'thunderstorm', name: 'Thunderstorm', hint: 'Rain with distant thunder' },
  { id: 'wind', name: 'Wind', hint: 'A slow breeze' },
  { id: 'stream', name: 'Stream', hint: 'Running water' },
  { id: 'waves', name: 'Ocean waves', hint: 'Surf rolling in' },
  { id: 'birds', name: 'Morning birds', hint: 'Birdsong' },
  { id: 'crickets', name: 'Night crickets', hint: 'A warm evening hush' },
];

export const soundUrl = (id: string): string => `/sounds/${id}.mp3`;
export const AMBIENCE_404_URL = soundUrl('ambience-404');

export interface Mix {
  master: number;
  levels: Record<string, number>;
}

export const emptyMix: Mix = { master: 0.7, levels: {} };

export const presets: Array<{ name: string; mix: Mix }> = [
  { name: 'Rainy window', mix: { master: 0.7, levels: { rain: 0.7, wind: 0.2 } } },
  { name: 'Thunderstorm', mix: { master: 0.7, levels: { thunderstorm: 0.8 } } },
  { name: 'Forest morning', mix: { master: 0.7, levels: { birds: 0.5, stream: 0.4, wind: 0.2 } } },
  { name: 'Shoreline', mix: { master: 0.7, levels: { waves: 0.7, wind: 0.3, birds: 0.15 } } },
  { name: 'Quiet night', mix: { master: 0.6, levels: { crickets: 0.5, wind: 0.25, stream: 0.2 } } },
];

const KEY = 'al-hidayah:sound-mix:v2';
const PLAYING_KEY = 'al-hidayah:sound-playing';

export function sanitizeMix(value: unknown): Mix {
  const mix: Mix = { master: emptyMix.master, levels: {} };
  if (!value || typeof value !== 'object') return mix;
  const source = value as { master?: unknown; levels?: Record<string, unknown> };
  const clamp = (n: unknown, fallback: number) =>
    typeof n === 'number' && Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : fallback;
  mix.master = clamp(source.master, mix.master);
  for (const { id } of layerCatalog) mix.levels[id] = clamp(source.levels?.[id], 0);
  return mix;
}

export function loadMix(): Mix {
  try {
    return sanitizeMix(JSON.parse(localStorage.getItem(KEY) ?? 'null'));
  } catch {
    return sanitizeMix(null);
  }
}

export function saveMix(mix: Mix): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(mix));
  } catch {
    // Storage may be blocked; the mix simply will not be remembered.
  }
}

/** Remembers, for this tab only, that sounds were playing, so another page can offer to resume. */
export function rememberPlaying(playing: boolean): void {
  try {
    if (playing) sessionStorage.setItem(PLAYING_KEY, '1');
    else sessionStorage.removeItem(PLAYING_KEY);
  } catch {
    // Not critical.
  }
}

export function wasPlaying(): boolean {
  try {
    return sessionStorage.getItem(PLAYING_KEY) === '1';
  } catch {
    return false;
  }
}

/** Which layers have a real recording installed. */
export async function discoverLayers(): Promise<LayerInfo[]> {
  const found = await Promise.all(
    layerCatalog.map(async (layer) => {
      try {
        const response = await fetch(soundUrl(layer.id), { method: 'HEAD' });
        const type = response.headers.get('content-type') ?? '';
        return response.ok && /audio|octet-stream|mpeg/i.test(type) ? layer : undefined;
      } catch {
        return undefined;
      }
    }),
  );
  return found.filter((layer): layer is LayerInfo => layer !== undefined);
}

export interface SoundCredit {
  title: string;
  author?: string;
  license?: string;
  url?: string;
}

/** Optional public/sounds/credits.json: { "rain": { "title": "...", "author": "...", ... } } */
export async function loadCredits(): Promise<Record<string, SoundCredit>> {
  try {
    const response = await fetch('/sounds/credits.json');
    if (!response.ok) return {};
    const value: unknown = await response.json();
    if (!value || typeof value !== 'object') return {};
    const out: Record<string, SoundCredit> = {};
    for (const [id, entry] of Object.entries(value as Record<string, unknown>)) {
      if (!entry || typeof entry !== 'object') continue;
      const credit = entry as Record<string, unknown>;
      if (typeof credit.title !== 'string') continue;
      out[id] = {
        title: credit.title.slice(0, 120),
        author: typeof credit.author === 'string' ? credit.author.slice(0, 80) : undefined,
        license: typeof credit.license === 'string' ? credit.license.slice(0, 80) : undefined,
        url:
          typeof credit.url === 'string' && /^https:\/\//.test(credit.url) ? credit.url : undefined,
      };
    }
    return out;
  } catch {
    return {};
  }
}

interface Running {
  element: HTMLAudioElement;
  gain: GainNode;
}

class AmbientMixer {
  private context?: AudioContext;
  private master?: GainNode;
  private running = new Map<string, Running>();
  private timer?: ReturnType<typeof setTimeout>;
  private muteReasons = new Set<string>();
  mix: Mix = sanitizeMix(null);

  private ctx(): AudioContext {
    if (!this.context) {
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.connect(this.context.destination);
      this.applyMaster();
    }
    return this.context;
  }

  private applyMaster() {
    if (!this.context || !this.master) return;
    const target = this.muteReasons.size > 0 ? 0 : this.mix.master;
    this.master.gain.setTargetAtTime(target, this.context.currentTime, 0.25);
  }

  /** Silence the mix for a named reason (for example "ambience"); restored when the reason ends. */
  setMuted(reason: string, muted: boolean) {
    if (muted) this.muteReasons.add(reason);
    else this.muteReasons.delete(reason);
    this.applyMaster();
  }

  get muted(): boolean {
    return this.muteReasons.size > 0;
  }

  private start(id: string): Running {
    const context = this.ctx();
    const element = new Audio(soundUrl(id));
    element.loop = true;
    element.preload = 'auto';
    const gain = context.createGain();
    gain.gain.value = 0;
    // Routed through Web Audio so volume works on iOS too (element.volume is read-only there).
    context.createMediaElementSource(element).connect(gain).connect(this.master as GainNode);
    void element.play();
    return { element, gain };
  }

  /** Apply a mix: starts layers that became audible, fades and pauses ones set to zero. */
  async apply(mix: Mix, available: readonly string[]): Promise<void> {
    this.mix = mix;
    const wanted = available.filter((id) => (mix.levels[id] ?? 0) > 0);
    if (wanted.length === 0 && !this.context) return;
    const context = this.ctx();
    if (context.state === 'suspended') await context.resume();
    this.applyMaster();
    for (const id of available) {
      const level = mix.levels[id] ?? 0;
      const existing = this.running.get(id);
      if (level > 0) {
        const entry = existing ?? this.start(id);
        if (!existing) this.running.set(id, entry);
        else if (entry.element.paused) void entry.element.play();
        entry.gain.gain.setTargetAtTime(level, context.currentTime, 0.35);
      } else if (existing) {
        existing.gain.gain.setTargetAtTime(0, context.currentTime, 0.2);
        const element = existing.element;
        setTimeout(() => {
          if ((this.mix.levels[id] ?? 0) === 0) element.pause();
        }, 900);
      }
    }
  }

  get active(): boolean {
    return [...this.running.values()].some((entry) => !entry.element.paused);
  }

  async stopAll(available: readonly string[]): Promise<void> {
    await this.apply({ master: this.mix.master, levels: {} }, available);
  }

  /** Fade everything out after `minutes`; pass 0 to cancel. */
  sleepIn(minutes: number, available: readonly string[], onDone: () => void): void {
    clearTimeout(this.timer);
    if (minutes <= 0) return;
    this.timer = setTimeout(() => {
      void this.stopAll(available).then(onDone);
    }, minutes * 60_000);
  }
}

export const ambient = new AmbientMixer();
