import { useEffect, useState } from 'preact/hooks';
import {
  ambient,
  discoverLayers,
  emptyMix,
  loadCredits,
  loadMix,
  presets,
  rememberPlaying,
  saveMix,
  wasPlaying,
  type LayerId,
  type LayerInfo,
  type Mix,
  type SoundCredit,
} from '../lib/audio/ambient';
import { useT } from '../lib/useT';
import { Icon, type IconName } from './Icon';

const layerIcons: Record<LayerId, IconName> = {
  rain: 'rain',
  thunderstorm: 'cloudLightning',
  wind: 'wind',
  stream: 'waves',
  waves: 'waves',
  birds: 'sparkles',
  crickets: 'moon',
};

/** A floating panel: mix real nature recordings while reading. Works on every page. */
export function SoundMixer() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [mix, setMix] = useState<Mix>(emptyMix);
  const [layers, setLayers] = useState<LayerInfo[]>();
  const [credits, setCredits] = useState<Record<string, SoundCredit>>({});
  const [playing, setPlaying] = useState(false);
  const [resumable, setResumable] = useState(false);
  const [sleep, setSleep] = useState(0);
  const [note, setNote] = useState('');

  useEffect(() => {
    setMix(loadMix());
    setResumable(wasPlaying());
    void discoverLayers().then(setLayers);
    void loadCredits().then(setCredits);
  }, []);

  const ids = (layers ?? []).map((layer) => layer.id);

  const start = async (next: Mix = mix) => {
    const audible = ids.some((id) => (next.levels[id] ?? 0) > 0);
    const chosen: Mix = audible
      ? next
      : { ...next, levels: { ...next.levels, [ids[0]]: 0.6 } };
    setMix(chosen);
    saveMix(chosen);
    try {
      await ambient.apply(chosen, ids);
      setPlaying(true);
      setResumable(false);
      rememberPlaying(true);
      setNote('');
    } catch {
      setNote('Sound could not start in this browser.');
    }
  };

  const stop = async () => {
    await ambient.stopAll(ids);
    setPlaying(false);
    rememberPlaying(false);
  };

  const update = (next: Mix) => {
    setMix(next);
    saveMix(next);
    if (playing) void ambient.apply(next, ids).catch(() => setNote('Sound could not update.'));
  };

  const none = layers !== undefined && layers.length === 0;
  const usable = presets.filter((preset) =>
    Object.keys(preset.mix.levels).every((id) => ids.includes(id as LayerId)),
  );
  const shownCredits = ids.map((id) => credits[id]).filter((c): c is SoundCredit => !!c);

  return (
    <div class="sound-mixer">
      {resumable && !playing && layers && layers.length > 0 && (
        <button class="chip chip--resume" type="button" onClick={() => void start()}>
          <Icon name="play" size={14} /> Resume calm sounds
        </button>
      )}
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
          {layers === undefined && <p class="quiet-panel">Looking for recordings…</p>}
          {none && (
            <p class="inline-notice" role="status">
              No recordings are installed yet. Add licensed audio files to <code>public/sounds/</code>{' '}
              (names and sources are in the README in that folder) and they will appear here.
            </p>
          )}
          {layers && layers.length > 0 && (
            <>
              {usable.length > 0 && (
                <div class="sound-presets" role="group" aria-label="Presets">
                  {usable.map((preset) => (
                    <button
                      class="chip"
                      type="button"
                      key={preset.name}
                      onClick={() => {
                        const next = { ...preset.mix, levels: { ...preset.mix.levels } };
                        setMix(next);
                        saveMix(next);
                        void start(next);
                      }}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              )}
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
                        value={mix.levels[layer.id] ?? 0}
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
                    ambient.sleepIn(minutes, ids, () => {
                      setPlaying(false);
                      rememberPlaying(false);
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
                  onClick={() => update({ master: mix.master, levels: {} })}
                >
                  Reset
                </button>
              </div>
            </>
          )}
          {note && (
            <p class="inline-notice" role="alert">
              {note}
            </p>
          )}
          {shownCredits.length > 0 && (
            <details class="sound-credit">
              <summary>Sound credits</summary>
              <ul>
                {shownCredits.map((credit) => (
                  <li key={credit.title}>
                    {credit.url ? (
                      <a href={credit.url} target="_blank" rel="noopener noreferrer">
                        {credit.title}
                      </a>
                    ) : (
                      credit.title
                    )}
                    {credit.author ? ` · ${credit.author}` : ''}
                    {credit.license ? ` · ${credit.license}` : ''}
                  </li>
                ))}
              </ul>
            </details>
          )}
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
