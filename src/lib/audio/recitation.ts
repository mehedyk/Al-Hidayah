/**
 * Verse-by-verse Qur'an recitation, streamed from EveryAyah (https://everyayah.com), a free
 * service that hosts one MP3 per ayah: /data/<reciter>/<SSS><AAA>.mp3. Nothing is bundled or
 * re-hosted here. The host is allow-listed in the CSP (`media-src`).
 *
 * Reciter folder names are the service's own. To add one, append a row to `reciters`.
 */
import { quranSurahs } from '../quranLibrary';

export const AUDIO_HOST = 'https://everyayah.com';

export const reciters = [
  { id: 'Alafasy_128kbps', name: 'Mishary Rashid Alafasy' },
  { id: 'Abdurrahmaan_As-Sudais_192kbps', name: 'Abdur-Rahman As-Sudais' },
  { id: 'Abdul_Basit_Murattal_192kbps', name: 'Abdul Basit (Murattal)' },
  { id: 'Husary_128kbps', name: 'Mahmoud Khalil Al-Husary' },
  { id: 'Minshawy_Murattal_128kbps', name: 'Mohamed Siddiq Al-Minshawi' },
  { id: 'Abu_Bakr_Ash-Shaatree_128kbps', name: 'Abu Bakr Ash-Shaatri' },
  { id: 'Saood_ash-Shuraym_128kbps', name: 'Saud Ash-Shuraim' },
] as const;

export function audioUrl(reciter: string, surah: number, ayah: number): string {
  const pad = (value: number, width: number) => String(value).padStart(width, '0');
  return `${AUDIO_HOST}/data/${reciter}/${pad(surah, 3)}${pad(ayah, 3)}.mp3`;
}

export interface Position {
  surah: number;
  ayah: number;
}

/** The verse after this one, rolling into the next surah; undefined after 114:6. */
export function nextPosition({ surah, ayah }: Position): Position | undefined {
  const summary = quranSurahs[surah - 1];
  if (!summary) return undefined;
  if (ayah < summary.numberOfAyahs) return { surah, ayah: ayah + 1 };
  return surah < 114 ? { surah: surah + 1, ayah: 1 } : undefined;
}

export function previousPosition({ surah, ayah }: Position): Position | undefined {
  if (ayah > 1) return { surah, ayah: ayah - 1 };
  if (surah === 1) return undefined;
  return { surah: surah - 1, ayah: quranSurahs[surah - 2].numberOfAyahs };
}

export interface PlayerState {
  status: 'idle' | 'loading' | 'playing' | 'paused' | 'error';
  position?: Position;
  rate: number;
  error?: string;
}

type Listener = (state: PlayerState) => void;

/** One shared player, so only one recitation ever plays and every button reflects it. */
class RecitationPlayer {
  private audio?: HTMLAudioElement;
  private preload?: HTMLAudioElement;
  private listeners = new Set<Listener>();
  private reciter: string = reciters[0].id;
  private auto = true;
  state: PlayerState = { status: 'idle', rate: 1 };

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private emit(patch: Partial<PlayerState>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((listener) => listener(this.state));
  }

  configure(reciter: string, autoAdvance: boolean) {
    const changed = reciter !== this.reciter;
    this.reciter = reciter;
    this.auto = autoAdvance;
    if (changed && this.state.position && this.state.status !== 'idle') {
      void this.play(this.state.position);
    }
  }

  private element(): HTMLAudioElement {
    if (this.audio) return this.audio;
    const audio = new Audio();
    audio.preload = 'auto';
    audio.addEventListener('playing', () => this.emit({ status: 'playing', error: undefined }));
    audio.addEventListener('pause', () => {
      if (!audio.ended && this.state.status === 'playing') this.emit({ status: 'paused' });
    });
    audio.addEventListener('waiting', () => {
      if (this.state.status === 'playing') this.emit({ status: 'loading' });
    });
    audio.addEventListener('ended', () => {
      const next = this.state.position && nextPosition(this.state.position);
      if (this.auto && next) void this.play(next);
      else this.emit({ status: 'idle' });
    });
    audio.addEventListener('error', () =>
      this.emit({
        status: 'error',
        error: 'The recitation could not be loaded. Check your connection and try again.',
      }),
    );
    this.audio = audio;
    return audio;
  }

  async play(position: Position): Promise<void> {
    const audio = this.element();
    audio.src = audioUrl(this.reciter, position.surah, position.ayah);
    audio.playbackRate = this.state.rate;
    this.emit({ status: 'loading', position, error: undefined });
    try {
      await audio.play();
    } catch (error) {
      // A newer play() call interrupting this one is normal, not a failure.
      if (error instanceof DOMException && error.name === 'AbortError') return;
      this.emit({
        status: 'error',
        error: 'The recitation could not start. Check your connection and try again.',
      });
      return;
    }
    const next = nextPosition(position);
    if (next && this.auto) {
      this.preload ??= new Audio();
      this.preload.preload = 'auto';
      this.preload.src = audioUrl(this.reciter, next.surah, next.ayah);
    }
  }

  pause() {
    this.audio?.pause();
  }

  async resume() {
    if (this.audio && this.state.position && this.state.status === 'paused') {
      await this.audio.play().catch(() => undefined);
    } else if (this.state.position) {
      await this.play(this.state.position);
    }
  }

  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.removeAttribute('src');
      this.audio.load();
    }
    this.emit({ status: 'idle', position: undefined, error: undefined });
  }

  step(direction: 1 | -1) {
    const current = this.state.position;
    if (!current) return;
    const target = direction === 1 ? nextPosition(current) : previousPosition(current);
    if (target) void this.play(target);
  }

  setRate(rate: number) {
    if (this.audio) this.audio.playbackRate = rate;
    this.emit({ rate });
  }
}

export const recitation = new RecitationPlayer();
