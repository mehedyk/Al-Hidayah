import { useEffect, useRef, useState } from 'preact/hooks';
import {
  ambient,
  emptyMix,
  layers,
  loadMix,
  presets,
  saveMix,
  type LayerId,
  type Mix,
} from '../lib/audio/ambient';
import { useT } from '../lib/useT';
import { Icon, type IconName } from './Icon';

const layerIcons: Record<LayerId, IconName> = {
  rain: 'rain',
  wind: 'wind',
  stream: 'waves',
  waves: 'waves',
  birds: 'sparkles',
  crickets: 'moon',
};

/** A floating panel: mix calm nature sounds while reading. Works on every page. */
export function SoundMixer() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [mix, setMix] = useState<Mix>(emptyMix);
  const [playing, setPlaying] = useState(false);
  const [sleep, setSleep] = useState(0);
  const [note, setNote] = useState('');
  const ready = useRef(false);

  useEffect(() => {
    setMix(loadMix());
    ready.current = true;
  }, []);

  const update = (next: Mix) => {
    setMix(next);
    saveMix(next);
    if (!playing) return;
    void ambient.apply(next).catch(() => setNote('Sound could not start in this browser.'));
  };

  const start = async (next: Mix = mix) => {
    const audible = layers.some(({ id }) => next.levels[id] > 0);
    const chosen = audible
      ? next
      : { ...next, levels: { ...next.levels, rain: 0.6 } };
    setMix(chosen);
    saveMix(chosen);
    try {
      await ambient.apply(chosen);
      setPlaying(true);
      setNote('');
    } catch {
      setNote('Sound could not start in this browser.');
    }
  };

  const stop = async () => {
    await ambient.stopAll();
    setPlaying(false);
  };

  return (
    <div class="sound-mixer">
      {open && (
        <section class="sound-panel" aria-label={t('sound.title')}>
          <header>
            <h2>
              <Icon name="headphones" size={18} duo /> {t('sound.title')}
            </h2>
            <button class="icon-button" type="button" aria-label="Close" onClick={() => setOpen(false)}>
              <Icon name="close" size={18} />
            </button>
          </header>
          <div class="sound-presets" role="group" aria-label="Presets">
            {presets.map((preset) => (
              <button
                class="chip"
                type="button"
                key={preset.name}
                onClick={() => {
                  setMix(preset.mix);
                  saveMix(preset.mix);
                  void start(preset.mix);
                }}
              >
                {preset.name}
              </button>
            ))}
          </div>
          <ul class="sound-layers">
            {layers.map((layer) => (
              <li key={layer.id}>
                <label>
                  <span class="sound-layers__name">
                    <Icon name={layerIcons[layer.id]} size={17} /> {layer.name}
                    <small>{layer.hint}</small>
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={mix.levels[layer.id]}
                    aria-label={`${layer.name} volume`}
                    onInput={(event) =>
                      update({
                        ...mix,
                        levels: { ...mix.levels, [layer.id]: Number(event.currentTarget.value) },
                      })
                    }
                  />
                </label>
              </li>
            ))}
          </ul>
          <label class="sound-master">
            <span>Master volume</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={mix.master}
              aria-label="Master volume"
              onInput={(event) => update({ ...mix, master: Number(event.currentTarget.value) })}
            />
          </label>
          <label class="sound-sleep">
            <Icon name="timer" size={16} />
            <span>Sleep timer</span>
            <select
              value={sleep}
              onChange={(event) => {
                const minutes = Number(event.currentTarget.value);
                setSleep(minutes);
                ambient.sleepIn(minutes, () => {
                  setPlaying(false);
                  setSleep(0);
                });
              }}
            >
              <option value={0}>Off</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
            </select>
          </label>
          <div class="sound-actions">
            <button
              class="button button--primary"
              type="button"
              onClick={() => (playing ? void stop() : void start())}
            >
              <Icon name={playing ? 'pause' : 'play'} /> {playing ? 'Stop sounds' : 'Play sounds'}
            </button>
            <button
              class="button button--ghost"
              type="button"
              onClick={() => {
                update({ ...emptyMix, master: mix.master });
              }}
            >
              Reset
            </button>
          </div>
          {note && (
            <p class="inline-notice" role="alert">
              {note}
            </p>
          )}
          <small class="sound-credit">
            Sounds are generated on your device from natural noise. Nothing is downloaded.
          </small>
        </section>
      )}
      <button
        class={`sound-fab ${playing ? 'is-playing' : ''}`}
        type="button"
        aria-expanded={open}
        aria-label={t('sound.open')}
        title={t('sound.open')}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name="music" size={22} />
      </button>
    </div>
  );
}
