import { useEffect, useRef } from 'preact/hooks';
import { useApp } from '../lib/app-context';
import type { Route } from '../lib/types';
import { scenes, getScene } from '../lib/scenes';
import type { TextKey } from '../lib/i18n';
import { useT } from '../lib/useT';
import { Icon, LogoMark } from './Icon';

const navigation: Array<{
  route: Route;
  label: TextKey;
  icon: 'home' | 'quran' | 'heart' | 'settings';
}> = [
  { route: 'home', label: 'nav.home', icon: 'home' },
  { route: 'quran', label: 'nav.quran', icon: 'quran' },
  { route: 'favorites', label: 'nav.favorites', icon: 'heart' },
  { route: 'settings', label: 'nav.settings', icon: 'settings' },
];

const languageLabels = {
  en: ['EN', 'English'],
  bn: ['বাং', 'বাংলা'],
  both: ['EN+বাং', 'English + বাংলা'],
} as const;

function href(route: Route): string {
  return route === 'home' ? '/' : `/${route}/`;
}

/**
 * The header never leaves the screen. As the page scrolls DOWN it condenses (shorter, a little
 * more transparent, tagline hidden) until it reaches a small fixed height. Scrolling UP gives the
 * height back gradually, and it is whole again at the top of the page. The state is one number,
 * `--hdr-p` (0 = full, 1 = condensed); the CSS turns it into height and opacity, with transitions
 * so every change is animated. It is written straight to the element, so scrolling never
 * re-renders the app.
 */
const CONDENSE_OVER = 90; // px scrolled down to go from full height to minimal
const RESTORE_OVER = 260; // px scrolled up to go from minimal back to full ("eventually")

function useCondensingHeader() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let progress = 0;
    let lastY = Math.max(0, window.scrollY);
    let frame = 0;

    const paint = () => {
      frame = 0;
      element.style.setProperty('--hdr-p', progress.toFixed(3));
      element.dataset.scrolled = window.scrollY > 8 ? 'true' : 'false';
    };
    const onScroll = () => {
      const y = Math.max(0, window.scrollY); // iOS rubber-banding reports negative values
      const delta = y - lastY;
      lastY = y;
      if (y <= 4) progress = 0;
      else if (delta > 0) progress = Math.min(1, progress + delta / CONDENSE_OVER);
      else if (delta < 0) progress = Math.max(0, progress + delta / RESTORE_OVER);
      if (!frame) frame = requestAnimationFrame(paint);
    };

    // A reload or back-navigation can land mid-page: start condensed there.
    progress = lastY > 4 ? 1 : 0;
    paint();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return ref;
}

export function Header({ route, overHero = false }: { route: Route; overHero?: boolean }) {
  const { settings, updateSettings } = useApp();
  const t = useT();
  const headerRef = useCondensingHeader();
  const dark =
    settings.theme === 'dark' ||
    (settings.theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);
  const scene = getScene(settings.scene);
  const nextScene = scenes[(scenes.findIndex((item) => item.id === scene.id) + 1) % scenes.length];
  return (
    <>
      {/* The header is fixed, so pages that start with it keep its place in the flow. */}
      {!overHero && <div class="site-header-spacer" aria-hidden="true" />}
      <header
        ref={headerRef}
        class={`site-header ${overHero ? 'site-header--hero' : ''}`}
        data-scrolled="false"
      >
        <a class="brand" href="/" aria-label="Al-Hidayah home">
          <LogoMark />
          <span>
            <strong>Al-Hidayah</strong>
            <small>Qur’an · Hadith · Reminder</small>
          </span>
        </a>
        <nav class="desktop-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <a
              class={route === item.route ? 'active' : ''}
              href={href(item.route)}
              aria-current={route === item.route ? 'page' : undefined}
            >
              <Icon
                name={item.icon}
                size={18}
                filled={item.icon === 'heart' && route === item.route}
              />
              {t(item.label)}
            </a>
          ))}
        </nav>
        <div class="header-actions">
          <button
            class="theme-toggle"
            type="button"
            onClick={() => updateSettings({ theme: dark ? 'light' : 'dark' })}
            aria-label={`Use ${dark ? 'light' : 'dark'} theme`}
          >
            <Icon name="sun" size={18} />
            <span />
            <Icon name="moon" size={17} />
          </button>
          <button
            class="lang-toggle"
            type="button"
            onClick={() =>
              updateSettings({
                uiLanguage:
                  settings.uiLanguage === 'en' ? 'bn' : settings.uiLanguage === 'bn' ? 'both' : 'en',
              })
            }
            aria-label={`${t('lang.button')}: ${languageLabels[settings.uiLanguage][1]}. Change`}
            title={languageLabels[settings.uiLanguage][1]}
          >
            <Icon name="languages" size={18} />
            <span>{languageLabels[settings.uiLanguage][0]}</span>
          </button>
          <button
            class="scene-toggle"
            type="button"
            onClick={() => updateSettings({ scene: nextScene.id })}
            aria-label={`Scene: ${scene.name}. Switch to ${nextScene.name}`}
            title={`Scene: ${scene.name}`}
          >
            <Icon name="palette" size={19} />
          </button>
          <a class="mobile-settings" href="/settings/" aria-label="Settings">
            <Icon name="settings" size={24} />
          </a>
        </div>
      </header>
    </>
  );
}

export function MobileNavigation({ route }: { route: Route }) {
  const t = useT();
  return (
    <nav class="mobile-nav" aria-label="Mobile navigation">
      {navigation.map((item) => (
        <a
          class={route === item.route ? 'active' : ''}
          href={href(item.route)}
          aria-current={route === item.route ? 'page' : undefined}
        >
          <Icon name={item.icon} size={22} filled={item.icon === 'heart' && route === item.route} />
          <span>{t(item.label)}</span>
        </a>
      ))}
    </nav>
  );
}
