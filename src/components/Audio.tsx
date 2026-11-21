import { useEffect, useState } from 'preact/hooks';
import { useApp } from '../lib/app-context';
import { useT } from '../lib/useT';
import { quranSurahs } from '../lib/quranLibrary';
import { recitation, reciters, type PlayerState } from '../lib/audio/recitation';
import { Icon } from './Icon';

export function useRecitation(): PlayerState {
  const { settings } = useApp();
  const [state, setState] = useState<PlayerState>(recitation.state);
  useEffect(() => recitation.subscribe(setState), []);
  useEffect(() => {
    recitation.configure(settings.reciter, settings.autoAdvance);
  }, [settings.reciter, settings.autoAdvance]);
  return state;
}

/** Play, pause or resume one verse. */
export function VerseAudioButton({ surah, ayah }: { surah: number; ayah: number }) {
  const state = useRecitation();
  const t = useT();
  const here = state.position?.surah === surah && state.position.ayah === ayah;
  const playing = here && (state.status === 'playing' || state.status === 'loading');
  return (
    <button
      class={`text-button ${here ? 'is-playing' : ''}`}
      type="button"
      aria-pressed={playing}
      aria-label={`${playing ? t('player.pause') : t('reader.listen')} ${surah}:${ayah}`}
      onClick={() => {
        if (here && playing) recitation.pause();
        else if (here && state.status === 'paused') void recitation.resume();
        else void recitation.play({ surah, ayah });
      }}
    >
      <Icon name={playing ? 'pause' : 'play'} size={17} /> {playing ? t('player.pause') : t('reader.listen')}
    </button>
  );
}

/** A bar that stays at the bottom while a recitation is active. */
export function AudioDock() {
  const state = useRecitation();
  const { settings, updateSettings } = useApp();
  const t = useT();
  if (!state.position || state.status === 'idle') return null;
  const { surah, ayah } = state.position;
  const summary = quranSurahs[surah - 1];
  const busy = state.status === 'loading';
  const playing = state.status === 'playing' || busy;
  return (
    <section class="audio-dock" aria-label="Recitation player">
      <div class="audio-dock__now">
        <Icon name="headphones" size={20} duo />
        <span>
          <strong>
            {summary.englishName} {surah}:{ayah}
          </strong>
          <small>
            {reciters.find((reciter) => reciter.id === settings.reciter)?.name ?? settings.reciter}
          </small>
        </span>
      </div>
      <div class="audio-dock__controls">
        <button class="icon-button" type="button" aria-label="Previous verse" onClick={() => recitation.step(-1)}>
          <Icon name="skipBack" size={18} />
        </button>
        <button
          class="icon-button icon-button--primary"
          type="button"
          aria-label={playing ? t('player.pause') : t('player.play')}
          onClick={() => (playing ? recitation.pause() : void recitation.resume())}
        >
          <Icon name={playing ? 'pause' : 'play'} size={20} />
        </button>
        <button class="icon-button" type="button" aria-label="Next verse" onClick={() => recitation.step(1)}>
          <Icon name="skipForward" size={18} />
        </button>
        <button class="icon-button" type="button" aria-label={t('player.stop')} onClick={() => recitation.stop()}>
          <Icon name="stop" size={17} />
        </button>
      </div>
      <div class="audio-dock__options">
        <label>
          <span class="sr-only">Reciter</span>
          <select
            value={settings.reciter}
            onChange={(event) => updateSettings({ reciter: event.currentTarget.value })}
          >
            {reciters.map((reciter) => (
              <option value={reciter.id} key={reciter.id}>
                {reciter.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span class="sr-only">Speed</span>
          <select
            value={state.rate}
            onChange={(event) => recitation.setRate(Number(event.currentTarget.value))}
          >
            {[0.75, 1, 1.25, 1.5].map((rate) => (
              <option value={rate} key={rate}>
                {rate}×
              </option>
            ))}
          </select>
        </label>
        <label class="audio-dock__auto">
          <input
            type="checkbox"
            checked={settings.autoAdvance}
            onChange={(event) => updateSettings({ autoAdvance: event.currentTarget.checked })}
          />
          Continue
        </label>
      </div>
      {state.error && (
        <p class="audio-dock__error" role="alert">
          {state.error}
        </p>
      )}
    </section>
  );
}
