import { useApp } from './app-context';
import { translate, type TextKey } from './i18n';

export function useT(): (key: TextKey) => string {
  const { settings } = useApp();
  return (key) => translate(key, settings.uiLanguage);
}
