import { useEffect, useRef, useState } from 'preact/hooks';
import { AMBIENCE_404_URL, ambient } from '../lib/audio/ambient';
import { translate } from '../lib/i18n';
import { FOOTER_VIDEO_RATE } from '../lib/media';
import { loadSettings } from '../lib/settings';
import type { UiLanguage } from '../lib/types';
import { Icon, LogoMark } from './Icon';

/** Every page of the site, so a lost visitor can reach any of them from here. */
const allPages = [
  { href: '/', label: 'Home' },
  { href: '/quran/', label: 'From the Qur’an' },
  { href: '/hadith/', label: 'From the Hadith' },
  { href: '/categories/', label: 'For a Better Life' },
  { href: '/daily/', label: 'Daily Reminder' },
  { href: '/prayer/', label: 'Prayer Times' },
  { href: '/favorites/', label: 'Favorites' },
  { href: '/about/', label: 'About' },
  { href: '/settings/', label: 'Settings' },
];

type AmbienceState = 'checking' | 'playing' | 'paused' | 'blocked' | 'unavailable';

/**
 * The 404 page. The background film plays in slow motion (still looping). A real nature recording
 * (birds, a light breeze, flowing water) plays softly if the browser allows autoplay, otherwise
 * a clear button starts it. While it plays, the calm-sounds mix is muted; it returns on leaving.
 */
export function NotFoundContent() {
  const [language, setLanguage] = useState<UiLanguage>('en');
  const [state, setState] = useState<AmbienceState>('checking');
  const audio = useRef<HTMLAudioElement>();
  const t = (key: Parameters<typeof translate>[0]) => translate(key, language);

  useEffect(() => {
    setLanguage(loadSettings().uiLanguage);

    const video = document.querySelector<HTMLVideoElement>('.footer-bg');
    const slow = () => {
      if (video) video.playbackRate = FOOTER_VIDEO_RATE;
    };
    slow();
    video?.addEventListener('loadedmetadata', slow);
    video?.addEventListener('play', slow);

    const element = new Audio(AMBIENCE_404_URL);
    element.loop = true;
    element.volume = 0.6;
    audio.current = element;
    ambient.setMuted('ambience', true);
    element.addEventListener('error', () => setState('unavailable'));
    element.addEventListener('playing', () => setState('playing'));
    element.addEventListener('pause', () => setState((s) => (s === 'playing' ? 'paused' : s)));
    element.play().catch((error: unknown) => {
      // Autoplay with sound is usually refused until the visitor interacts: offer the button.
      if (error instanceof DOMException && error.name === 'NotAllowedError') setState('blocked');
    });

    return () => {
      video?.removeEventListener('loadedmetadata', slow);
      video?.removeEventListener('play', slow);
      element.pause();
      ambient.setMuted('ambience', false);
    };
  }, []);

  const toggle = () => {
    const element = audio.current;
    if (!element) return;
    if (state === 'playing') element.pause();
    else void element.play().catch(() => setState('unavailable'));
  };

  return (
    <main id="main-content" class="not-found">
      <LogoMark size={88} />
      <p class="eyebrow">{t('nf.eyebrow')}</p>
      <h1>{t('nf.title')}</h1>
      <p>{t('nf.body')}</p>
      <div class="not-found__actions">
        <a class="button button--primary" href="/">
          {t('nf.home')}
        </a>
        <a class="button button--secondary" href="/quran/">
          {t('nf.quran')}
        </a>
      </div>
      <nav class="not-found__links" aria-label={t('nf.links')}>
        <p class="not-found__links-title">{t('nf.links')}</p>
        <ul>
          {allPages.map((page) => (
            <li>
              <a href={page.href}>{page.label}</a>
            </li>
          ))}
        </ul>
      </nav>
      {state !== 'unavailable' && state !== 'checking' && (
        <div class="not-found__ambience">
          <button class="button button--ghost" type="button" onClick={toggle} aria-pressed={state === 'playing'}>
            <Icon name={state === 'playing' ? 'volume' : 'volumeOff'} size={18} />
            {state === 'playing' ? t('nf.pause') : t('nf.play')}
          </button>
          <p>{t('nf.ambience')}</p>
          <p class="not-found__mixnote">{t('nf.mixnote')}</p>
        </div>
      )}
    </main>
  );
}
