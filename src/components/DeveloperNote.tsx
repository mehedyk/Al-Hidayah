import { DEVELOPER_URL } from '../lib/links';
import { useOptionalT } from '../lib/useT';
import { Icon } from './Icon';

/** A dignified, plain note: the developer is looking for work. */
export function DeveloperNote({ variant = 'card' }: { variant?: 'card' | 'line' }) {
  const t = useOptionalT();
  if (variant === 'line') {
    return (
      <p class="developer-line">
        <Icon name="briefcase" size={15} />
        <span>{t('dev.short')}</span>
        <a href={DEVELOPER_URL} target="_blank" rel="noopener noreferrer">
          {t('dev.cta')}
        </a>
      </p>
    );
  }
  return (
    <aside class="developer-note" id="developer" aria-labelledby="developer-title">
      <Icon name="briefcase" size={22} duo />
      <div>
        <h2 id="developer-title">{t('dev.title')}</h2>
        <p>{t('dev.body')}</p>
        <a class="button button--secondary" href={DEVELOPER_URL} target="_blank" rel="noopener noreferrer">
          {t('dev.cta')} <Icon name="external" size={15} />
        </a>
      </div>
    </aside>
  );
}
