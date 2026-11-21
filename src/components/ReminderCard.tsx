import { useLayoutEffect, useRef } from 'preact/hooks';
import { formatReference, formatShortReference } from '../lib/data';
import { useApp } from '../lib/app-context';
import type { Item } from '../lib/types';
import { Icon, Ornament } from './Icon';

export function ReminderCard({
  item,
  onNew,
  compact = false,
  busy = false,
  title = 'Today’s reminder',
}: {
  item: Item;
  onNew?: () => void;
  busy?: boolean;
  compact?: boolean;
  title?: string;
}) {
  const { settings, favoriteIds, toggleFavorite, openShare } = useApp();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const saved = favoriteIds.has(item.id);
  const words = item.ar.split(' ');
  const arabic = useRef<HTMLParagraphElement>(null);
  // Longer verses get a smaller Arabic size so the buttons stay reachable (never truncated).
  const length =
    words.length <= 12 ? 'short' : words.length <= 30 ? 'medium' : words.length <= 60 ? 'long' : 'xlong';

  // Set per-word delays through the CSS object model. An inline style="" attribute would be
  // blocked by the strict Content-Security-Policy (style-src 'self'); this is allowed.
  useLayoutEffect(() => {
    // Scale the stagger so even the longest verse (2:282, ~130 words) finishes revealing in
    // about 2.5 seconds instead of crawling word by word for 20.
    const nodes = arabic.current?.querySelectorAll<HTMLElement>('.arabic-word');
    const scale = Math.min(1, 14 / Math.max(1, nodes?.length ?? 1));
    nodes?.forEach((word, index) => {
      word.style.setProperty('--word-index', String(index * scale));
    });
  }, [item.id]);

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
      <p class="arabic" lang="ar" dir="rtl" ref={arabic} data-length={length}>
        {words.map((word, index) => (
          <span class="arabic-word">
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
          <div class="context-links">
            {item.ref.kind === 'quran' && (
              <a class="context-link" href={`/quran/?surah=${item.ref.surah}&ayah=${item.ref.ayah}`}>
                Open in the Qur’an reader <Icon name="book" size={15} />
              </a>
            )}
            <a class="context-link" href={item.contextUrl} target="_blank" rel="noreferrer">
              Read in context <Icon name="external" size={15} />
            </a>
          </div>
          <div class="reminder-actions">
            {onNew && (
              <button
                class="button button--primary"
                type="button"
                disabled={busy}
                aria-busy={busy}
                onClick={() => {
                  onNew();
                  requestAnimationFrame(() => headingRef.current?.focus());
                }}
              >
                <Icon name="shuffle" />
                {busy ? 'Loading…' : 'Get New Reminder'}
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
