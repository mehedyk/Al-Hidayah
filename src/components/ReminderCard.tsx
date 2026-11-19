import { useRef } from 'preact/hooks';
import { formatReference, formatShortReference } from '../lib/data';
import { useApp } from '../lib/app-context';
import type { Item } from '../lib/types';
import { Icon, Ornament } from './Icon';

export function ReminderCard({
  item,
  onNew,
  compact = false,
  title = 'Today’s reminder',
}: {
  item: Item;
  onNew?: () => void;
  compact?: boolean;
  title?: string;
}) {
  const { settings, favoriteIds, toggleFavorite, openShare } = useApp();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const saved = favoriteIds.has(item.id);
  const words = item.ar.split(' ');

  return (
    <article
      class={`reminder-card ${compact ? 'reminder-card--compact' : ''}`}
      aria-labelledby={`reminder-${item.id}`}
    >
      {!compact && (
        <>
          <Ornament />
          <p class="eyebrow">{title}</p>
        </>
      )}
      <h2 id={`reminder-${item.id}`} ref={headingRef} tabIndex={-1} class="sr-only">
        {formatReference(item)}
      </h2>
      <p class="arabic" lang="ar" dir="rtl">
        {words.map((word, index) => (
          <span class="arabic-word" style={{ '--word-index': index }}>
            {word}
            {index < words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </p>
      {settings.showEnglish && (
        <blockquote class="english-translation" lang="en">
          {item.en}
        </blockquote>
      )}
      <p class="reference" lang="en">
        <span />
        {compact ? formatShortReference(item) : formatReference(item)}
        <span />
      </p>
      {settings.showBangla && (
        <p class="bangla-translation" lang="bn">
          {item.bn}
        </p>
      )}
      {!compact && (
        <>
          <a class="context-link" href={item.contextUrl} target="_blank" rel="noreferrer">
            Read in context <Icon name="arrow" size={15} />
          </a>
          <div class="reminder-actions">
            {onNew && (
              <button
                class="button button--primary"
                type="button"
                onClick={() => {
                  onNew();
                  requestAnimationFrame(() => headingRef.current?.focus());
                }}
              >
                <Icon name="refresh" />
                Get New Reminder
              </button>
            )}
            <button
              class={`button button--secondary ${saved ? 'is-saved' : ''}`}
              type="button"
              onClick={() => toggleFavorite(item)}
              aria-pressed={saved}
            >
              <Icon name="heart" filled={saved} />
              {saved ? 'Saved' : 'Save'}
            </button>
            <button class="button button--ghost" type="button" onClick={() => openShare(item)}>
              <Icon name="share" />
              Share
            </button>
          </div>
        </>
      )}
      <span class="sr-only" aria-live="polite">
        {formatReference(item)}
      </span>
    </article>
  );
}
