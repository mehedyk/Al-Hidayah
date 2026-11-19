import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { AppContext } from '../lib/app-context';
import { loadSettings, saveSettings } from '../lib/settings';
import { getItem, items, formatReference } from '../lib/data';
import { dailyItemId, localDateKey } from '../lib/daily/dailyItem';
import { listFavorites, removeFavorite, saveFavorite } from '../lib/storage/favorites';
import type { Item, Route, Settings } from '../lib/types';
import { Header, MobileNavigation } from './Header';
import { HomePage } from './HomePage';
import { BrowserPage, CategoriesPage } from './BrowserPages';
import { PrayerWidget } from './PrayerWidget';
import { DailyPage } from './DailyPage';
import { FavoritesPage } from './FavoritesPage';
import { AboutPage } from './AboutPage';
import { SettingsPage } from './SettingsPage';
import { ShareStudio } from './ShareStudio';
import { SiteFooter } from './SiteFooter';

const pageCopy: Record<
  Exclude<Route, 'home'>,
  { eyebrow: string; title: string; description: string }
> = {
  quran: {
    eyebrow: 'Read and reflect',
    title: 'From the Qur’an',
    description:
      'Read all 114 surahs and 6,236 verses in Arabic, English, and Bangla, with exact references and whole-library search.',
  },
  hadith: {
    eyebrow: 'Authenticity before access',
    title: 'From the Hadith',
    description: 'Sahih al-Bukhari and Sahih Muslim only, with complete references and grading.',
  },
  categories: {
    eyebrow: 'For a better life',
    title: 'Guidance by theme',
    description: 'A future collection of human-reviewed categories, never generated automatically.',
  },
  daily: {
    eyebrow: 'One day at a time',
    title: 'Daily Reminder',
    description: 'The same reviewed reminder for the same local calendar date, on every device.',
  },
  prayer: {
    eyebrow: 'A rhythm for the day',
    title: 'Prayer Times',
    description: 'Live times with a private location request and an offline cached fallback.',
  },
  favorites: {
    eyebrow: 'Your private collection',
    title: 'Favorites',
    description: 'Saved reminders live on this device. Export them whenever you like.',
  },
  about: {
    eyebrow: 'Purpose, sources, and care',
    title: 'About Al-Hidayah',
    description: 'The experience exists to serve the words—not the other way around.',
  },
  settings: {
    eyebrow: 'Make it yours',
    title: 'Settings',
    description: 'Comfortable reading, prayer preferences, and local data controls.',
  },
};

export function App({ route }: { route: Route }) {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [settingsReady, setSettingsReady] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<ReadonlySet<string>>(new Set());
  const [shareItem, setShareItem] = useState<Item | null>(null);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const notify = useCallback((message: string) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 4500);
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((current) => ({ ...current, ...patch }));
  }, []);

  const refreshFavorites = useCallback(async () => {
    try {
      setFavoriteIds(new Set((await listFavorites()).map((record) => record.id)));
    } catch {
      notify(
        'Favorites could not be read on this device. Your browser may have blocked local storage.',
      );
    }
  }, [notify]);

  useEffect(() => {
    void refreshFavorites();
  }, [refreshFavorites]);

  useEffect(() => {
    setSettings(loadSettings());
    setSettingsReady(true);
  }, []);

  useEffect(() => {
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = settings.theme === 'dark' || (settings.theme === 'system' && systemDark.matches);
      document.documentElement.dataset.theme = dark ? 'dark' : 'light';
      document.documentElement.dataset.textSize = settings.textSize;
      document.documentElement.dataset.motion = settings.reducedMotion ? 'reduced' : 'full';
      document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
      if (settingsReady) saveSettings(settings);
    };
    apply();
    systemDark.addEventListener('change', apply);
    return () => systemDark.removeEventListener('change', apply);
  }, [settings, settingsReady]);

  useEffect(() => {
    if (import.meta.env.PROD && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        document.documentElement.dataset.offlineReady = 'false';
      });
    }
  }, []);

  useEffect(() => {
    if (
      !settings.dailyEnabled ||
      !('Notification' in window) ||
      Notification.permission !== 'granted'
    )
      return;
    const check = () => {
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const key = `al-hidayah:notified:${localDateKey(now)}`;
      if (time !== settings.dailyTime || localStorage.getItem(key)) return;
      const item = getItem(dailyItemId(now, items)) ?? items[0];
      void new Notification('Today’s Al-Hidayah reminder', {
        body: `${item.en}\n${formatReference(item)}`,
      });
      localStorage.setItem(key, 'shown');
    };
    check();
    const timer = setInterval(check, 20_000);
    return () => clearInterval(timer);
  }, [settings.dailyEnabled, settings.dailyTime]);

  const toggleFavorite = useCallback(
    async (item: Item) => {
      try {
        if (favoriteIds.has(item.id)) {
          await removeFavorite(item.id);
          setFavoriteIds((current) => new Set([...current].filter((id) => id !== item.id)));
          notify('Removed from favorites.');
        } else {
          await saveFavorite(item.id);
          setFavoriteIds((current) => new Set([...current, item.id]));
          notify('Saved on this device.');
        }
      } catch {
        notify('Favorites could not be updated. Check this browser’s local-storage permissions.');
      }
    },
    [favoriteIds, notify],
  );

  const context = {
    settings,
    updateSettings,
    favoriteIds,
    toggleFavorite,
    refreshFavorites,
    openShare: setShareItem,
    notify,
  };
  let page: preact.ComponentChild;
  switch (route) {
    case 'home':
      page = <HomePage />;
      break;
    case 'quran':
      page = <BrowserPage kind="quran" />;
      break;
    case 'hadith':
      page = <BrowserPage kind="hadith" />;
      break;
    case 'categories':
      page = <CategoriesPage />;
      break;
    case 'daily':
      page = <DailyPage />;
      break;
    case 'prayer':
      page = <PrayerWidget full />;
      break;
    case 'favorites':
      page = <FavoritesPage />;
      break;
    case 'about':
      page = <AboutPage />;
      break;
    case 'settings':
      page = <SettingsPage />;
      break;
  }

  return (
    <AppContext.Provider value={context}>
      <a class="skip-link" href="#main-content">
        Skip to reminder
      </a>
      <div id="main-content">
        {route === 'home' ? (
          page
        ) : (
          <div class="internal-page">
            <Header route={route} />
            <main class="internal-main shell">
              <header class="page-title">
                <p class="eyebrow">{pageCopy[route].eyebrow}</p>
                <h1>{pageCopy[route].title}</h1>
                <p>{pageCopy[route].description}</p>
              </header>
              {page}
            </main>
            <SiteFooter />
          </div>
        )}
      </div>
      <MobileNavigation route={route} />
      {shareItem && <ShareStudio item={shareItem} onClose={() => setShareItem(null)} />}
      <div class={`toast ${toast ? 'toast--visible' : ''}`} role="status" aria-live="polite">
        {toast}
      </div>
    </AppContext.Provider>
  );
}
