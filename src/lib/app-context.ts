import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import type { Item, Settings } from './types';

export interface AppContextValue {
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  favoriteIds: ReadonlySet<string>;
  toggleFavorite: (item: Item) => Promise<void>;
  refreshFavorites: () => Promise<void>;
  openShare: (item: Item) => void;
  notify: (message: string) => void;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const value = useContext(AppContext);
  if (!value) throw new Error('Application context is unavailable.');
  return value;
}

export const reportUrl =
  'https://github.com/mehedyk/Al-Hidayah/issues/new?template=content-error.yml';
