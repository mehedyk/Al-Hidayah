import { useMemo, useState } from 'preact/hooks';
import { items, formatShortReference } from '../lib/data';
import { useApp } from '../lib/app-context';
import { Icon, Ornament } from './Icon';

export function ReviewGate({ kind }: { kind: 'hadith' | 'categories' }) {
  return (
    <div class="review-gate">
      <Ornament />
      <span class="review-gate-icon">
        <Icon name={kind === 'hadith' ? 'mosque' : 'leaf'} size={34} />
      </span>
      <p class="eyebrow">Human review comes first</p>
      <h2>
        {kind === 'hadith'
          ? 'The Hadith collection is being prepared.'
          : 'Categories will grow from reviewed guidance.'}
      </h2>
      <p>
        {kind === 'hadith'
          ? 'Version 1 will include only Sahih al-Bukhari and Sahih Muslim records with Arabic, English, Bangla, numbering, and grading intact. No unreviewed Hadith has been added to this initial pool.'
          : 'Category names and assignments are religious-content decisions. They remain empty until a qualified reviewer supplies the reviewed file; Al-Hidayah does not generate them automatically.'}
      </p>
      <span class="review-status">
        <Icon name="clock" size={17} /> Awaiting qualified human review
      </span>
      <a class="button button--secondary" href="/quran/">
        Browse the approved Qur’an reminders <Icon name="arrow" />
      </a>
    </div>
  );
}

export function BrowserPage({ kind }: { kind: 'quran' | 'hadith' }) {
  const { favoriteIds, toggleFavorite } = useApp();
  const [query, setQuery] = useState('');
  const sourceItems = useMemo(() => items.filter((item) => item.ref.kind === kind), [kind]);
  const filtered = sourceItems.filter((item) =>
    `${item.en} ${item.bn}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  );

  if (kind === 'hadith' && sourceItems.length === 0) return <ReviewGate kind="hadith" />;

  return (
    <div class="browser-page">
      <div class="browser-toolbar">
        <label class="search-field">
          <Icon name="search" />
          <span class="sr-only">Search English and Bangla translations</span>
          <input
            type="search"
            value={query}
            onInput={(event) => setQuery(event.currentTarget.value)}
            placeholder="Search translations…"
          />
        </label>
        <span>
          {filtered.length} reviewed {filtered.length === 1 ? 'reminder' : 'reminders'}
        </span>
      </div>
      <div class="reminder-list">
        {filtered.map((item) => {
          const saved = favoriteIds.has(item.id);
          return (
            <article class="reminder-row">
              <a class="reminder-row-main" href={`/?item=${encodeURIComponent(item.id)}`}>
                <p class="row-arabic" lang="ar" dir="rtl">
                  {item.ar}
                </p>
                <div>
                  <p lang="en">{item.en}</p>
                  <span>{formatShortReference(item)}</span>
                </div>
                <Icon name="arrow" />
              </a>
              <button
                class={`icon-button ${saved ? 'is-saved' : ''}`}
                type="button"
                onClick={() => toggleFavorite(item)}
                aria-label={saved ? 'Remove from favorites' : 'Save to favorites'}
                aria-pressed={saved}
              >
                <Icon name="heart" filled={saved} />
              </button>
            </article>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <div class="empty-state">
          <Icon name="search" size={30} />
          <h2>No matching reminders</h2>
          <p>Try a different word in English or Bangla.</p>
          <button class="text-button" type="button" onClick={() => setQuery('')}>
            Clear search
          </button>
        </div>
      )}
      <p class="data-note">
        Search matches translations only. Arabic source text is never rewritten for search.
      </p>
    </div>
  );
}

export function CategoriesPage() {
  return <ReviewGate kind="categories" />;
}
