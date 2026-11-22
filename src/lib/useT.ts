import { useContext } from 'preact/hooks';
import { AppContext, useApp } from './app-context';
import { translate, type TextKey } from './i18n';
import type { UiLanguage } from './types';

export function useT(): (key: TextKey) => string {
  const { settings } = useApp();
  return (key) => translate(key, settings.uiLanguage);
}

/** Like useT, but safe on statically rendered pages that have no app context (English then). */
export function useOptionalT(): (key: TextKey) => string {
  const language: UiLanguage = useContext(AppContext)?.settings.uiLanguage ?? 'en';
  return (key) => translate(key, language);
}
