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

export function Header({ route, overHero = false }: { route: Route; overHero?: boolean }) {
  const { settings, updateSettings } = useApp();
  const t = useT();
  const dark =
    settings.theme === 'dark' ||
    (settings.theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);
  const scene = getScene(settings.scene);
  const nextScene = scenes[(scenes.findIndex((item) => item.id === scene.id) + 1) % scenes.length];
  return (
    <header class={`site-header ${overHero ? 'site-header--hero' : ''}`}>
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
