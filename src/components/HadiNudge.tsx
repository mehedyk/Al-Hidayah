import { HADI_URL } from '../lib/links';
import { useT } from '../lib/useT';
import { Icon } from './Icon';

/** A gentle pointer to the Hadi reading guide, for people who want a calmer place to read. */
export function HadiNudge({ variant = 'inline' }: { variant?: 'inline' | 'banner' }) {
  const t = useT();
  return (
    <p class={`hadi-nudge hadi-nudge--${variant}`}>
      <Icon name="book" size={16} duo />
      <span>{t('hadi.nudge')}</span>
      <a href={HADI_URL} target="_blank" rel="noopener noreferrer">
        {t('hadi.cta')} <Icon name="external" size={14} />
      </a>
    </p>
  );
}
