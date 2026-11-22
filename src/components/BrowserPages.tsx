import { useEffect, useState } from 'preact/hooks';
import { formatShortReference } from '../lib/data';
import {
  loadSurah,
  quranJuz,
  quranSurahs,
  readLastPosition,
  saveLastPosition,
  quranVerseCount,
  searchQuran,
  type QuranSearchResult,
  type QuranShard,
} from '../lib/quranLibrary';
import { useApp } from '../lib/app-context';
import type { Item } from '../lib/types';
import { useT } from '../lib/useT';
import { recitation } from '../lib/audio/recitation';
import { HadiNudge } from './HadiNudge';
import { VerseAudioButton, useRecitation } from './Audio';
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
        Browse the complete Qur’an <Icon name="arrow" />
      </a>
    </div>
  );
}

function QuranVerse({ item }: { item: Item }) {
  const { settings, favoriteIds, toggleFavorite, openShare } = useApp();
  const t = useT();
  const playback = useRecitation();
  const saved = favoriteIds.has(item.id);
  if (item.ref.kind !== 'quran') return null;
  const ayah = item.ref.ayah;
  const current =
    playback.status !== 'idle' &&
    playback.position?.surah === item.ref.surah &&
    playback.position.ayah === ayah;

  return (
    <article class={`quran-ayah ${current ? 'is-playing' : ''}`} id={`ayah-${ayah}`} aria-labelledby={`ayah-${ayah}-reference`}>
      <div class="quran-ayah__number" aria-hidden="true">
        {ayah}
      </div>
      <p class="quran-ayah__arabic" lang="ar" dir="rtl">
        {item.ar}
      </p>
      {settings.showEnglish && (
        <p class="quran-ayah__english" lang="en">
          {item.en}
        </p>
      )}
      {settings.showBangla && (
        <p class="quran-ayah__bangla" lang="bn">
          {item.bn}
        </p>
      )}
      <div class="quran-ayah__footer">
        <span id={`ayah-${ayah}-reference`}>{formatShortReference(item)}</span>
        <div>
          <a
            class="text-button"
            href={item.contextUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Read ${item.ref.surahName} ${item.ref.surah}:${ayah} in context`}
          >
            Context <Icon name="arrow" size={15} />
          </a>
          <VerseAudioButton surah={item.ref.surah} ayah={ayah} />
          <button
            class={`text-button ${saved ? 'is-saved' : ''}`}
            type="button"
            onClick={() => toggleFavorite(item)}
            aria-pressed={saved}
          >
            <Icon name="heart" size={17} filled={saved} /> {saved ? t('card.saved') : t('card.save')}
          </button>
          <button class="text-button" type="button" onClick={() => openShare(item)}>
            <Icon name="share" size={17} /> {t('card.share')}
          </button>
        </div>
      </div>
    </article>
  );
}

function SearchResults({
  results,
  busy,
  error,
  query,
  onOpen,
}: {
  results: QuranSearchResult[];
  busy: boolean;
  error: string;
  query: string;
  onOpen: (surah: number, ayah: number) => void;
}) {
  if (query.trim().length < 2) {
    return <p class="quiet-panel">Enter at least two characters to search the complete Quran.</p>;
  }
  if (busy) return <p class="quiet-panel">Searching all {quranVerseCount.toLocaleString()} verses…</p>;
  if (error) return <p class="inline-notice">{error}</p>;
  if (results.length === 0) {
    return (
      <div class="empty-state">
        <Icon name="search" size={30} />
        <h2>No matching verses</h2>
        <p>Try another English or Bangla word, a surah name, or a reference such as 94:6.</p>
      </div>
    );
  }
  return (
    <section class="quran-search-results" aria-label="Quran search results">
      <p class="quran-search-count" role="status">
        {results.length.toLocaleString()} {results.length === 1 ? 'match' : 'matches'}
        {results.length > 60 ? ' · showing the first 60' : ''}
      </p>
      <div>
        {results.slice(0, 60).map((result) => (
          <a
            class="quran-search-result"
            href={`/quran/?surah=${result.surah}&ayah=${result.ayah}`}
            key={result.id}
            onClick={(event) => {
              event.preventDefault();
              onOpen(result.surah, result.ayah);
            }}
          >
            <span>Qur’an · {result.surahName} {result.surah}:{result.ayah}</span>
            <p lang="en">{result.en}</p>
            <p lang="bn">{result.bn}</p>
            <Icon name="arrow" />
          </a>
        ))}
      </div>
    </section>
  );
}

function QuranBrowser() {
  const t = useT();
  const playback = useRecitation();
  const [query, setQuery] = useState('');
  const [selectedNumber, setSelectedNumber] = useState(1);
  const [targetAyah, setTargetAyah] = useState<number>();
  const [shard, setShard] = useState<QuranShard>();
  const [readerError, setReaderError] = useState('');
  const [results, setResults] = useState<QuranSearchResult[]>([]);
  const [searchBusy, setSearchBusy] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [lastRead, setLastRead] = useState<{ surah: number; ayah: number }>();
  const [jumpValue, setJumpValue] = useState('');

  useEffect(() => {
    setLastRead(readLastPosition());
  }, []);

  const navigate = (surah: number, ayah?: number) => {
    saveLastPosition(surah, ayah ?? 1);
    setLastRead({ surah, ayah: ayah ?? 1 });
    setJumpValue('');
    setQuery('');
    setSelectedNumber(surah);
    setTargetAyah(ayah);
    const suffix = ayah ? `&ayah=${ayah}` : '';
    window.history.pushState({}, '', `/quran/?surah=${surah}${suffix}`);
  };

  useEffect(() => {
    const readLocation = () => {
      const params = new URLSearchParams(window.location.search);
      const requested = Number(params.get('surah') ?? '1');
      const surah = quranSurahs[requested - 1] ? requested : 1;
      const requestedAyah = Number(params.get('ayah') ?? '0');
      setSelectedNumber(surah);
      setTargetAyah(
        requestedAyah >= 1 && requestedAyah <= quranSurahs[surah - 1].numberOfAyahs
          ? requestedAyah
          : undefined,
      );
    };
    readLocation();
    window.addEventListener('popstate', readLocation);
    return () => window.removeEventListener('popstate', readLocation);
  }, []);

  useEffect(() => {
    let active = true;
    setReaderError('');
    setShard(undefined);
    void loadSurah(selectedNumber)
      .then((value) => {
        if (active) setShard(value);
      })
      .catch((error: unknown) => {
        if (active)
          setReaderError(
            error instanceof Error ? error.message : 'This surah could not be loaded. Try again.',
          );
      });
    return () => {
      active = false;
    };
  }, [selectedNumber]);

  useEffect(() => {
    if (!shard || !targetAyah) return;
    const frame = requestAnimationFrame(() => {
      document.getElementById(`ayah-${targetAyah}`)?.scrollIntoView({ block: 'center' });
    });
    return () => cancelAnimationFrame(frame);
  }, [shard, targetAyah]);

  useEffect(() => {
    let active = true;
    if (query.trim().length < 2) {
      setResults([]);
      setSearchBusy(false);
      setSearchError('');
      return () => {
        active = false;
      };
    }
    setSearchBusy(true);
    setSearchError('');
    const timer = setTimeout(() => {
      void searchQuran(query)
        .then((matches) => {
          if (active) setResults(matches);
        })
        .catch((error: unknown) => {
          if (active)
            setSearchError(error instanceof Error ? error.message : 'Search could not be loaded.');
        })
        .finally(() => {
          if (active) setSearchBusy(false);
        });
    }, 180);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  const playingSurah = playback.status === 'idle' ? undefined : playback.position?.surah;
  const playingAyah = playback.status === 'idle' ? undefined : playback.position?.ayah;
  useEffect(() => {
    if (!playingSurah || !playingAyah) return;
    if (playingSurah !== selectedNumber) {
      navigate(playingSurah, playingAyah);
      return;
    }
    document.getElementById(`ayah-${playingAyah}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    // `navigate` and `selectedNumber` are intentionally read at call time: the effect must run only
    // when playback moves to a new verse, not whenever the reader re-renders.
  }, [playingSurah, playingAyah]);

  const summary = quranSurahs[selectedNumber - 1];
  return (
    <div class="browser-page quran-browser">
      <div class="browser-toolbar">
        <label class="search-field">
          <Icon name="search" />
          <span class="sr-only">Search the complete Quran in English and Bangla</span>
          <input
            type="search"
            value={query}
            onInput={(event) => setQuery(event.currentTarget.value)}
            placeholder={t('reader.search')}
          />
        </label>
        <span>114 surahs · {quranVerseCount.toLocaleString()} verses</span>
      </div>

      {query.trim() ? (
        <SearchResults
          results={results}
          busy={searchBusy}
          error={searchError}
          query={query}
          onOpen={navigate}
        />
      ) : (
        <div class="quran-reader">
          <div class="quran-reader__toolbar">
            <label class="field">
              <span>{t('reader.surah')}</span>
              <select
                value={selectedNumber}
                onChange={(event) => navigate(Number(event.currentTarget.value))}
              >
                {quranSurahs.map((surah) => (
                  <option value={surah.number} key={surah.number}>
                    {surah.number}. {surah.englishName} · {surah.numberOfAyahs} verses
                  </option>
                ))}
              </select>
            </label>
            <label class="field">
              <span>{t('reader.juz')}</span>
              <select
                value=""
                onChange={(event) => {
                  const juz = quranJuz[Number(event.currentTarget.value) - 1];
                  if (juz) navigate(juz.surah, juz.ayah);
                }}
              >
                <option value="" disabled>
                  Jump to a juz…
                </option>
                {quranJuz.map((juz) => (
                  <option value={juz.number} key={juz.number}>
                    Juz {juz.number} · {quranSurahs[juz.surah - 1].englishName} {juz.surah}:{juz.ayah}
                  </option>
                ))}
              </select>
            </label>
            <form
              class="quran-jump"
              onSubmit={(event) => {
                event.preventDefault();
                const number = Number(jumpValue);
                if (Number.isInteger(number) && number >= 1 && number <= summary.numberOfAyahs) {
                  navigate(selectedNumber, number);
                }
              }}
            >
              <label class="field">
                <span>Go to ayah (1–{summary.numberOfAyahs})</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={summary.numberOfAyahs}
                  value={jumpValue}
                  onInput={(event) => setJumpValue(event.currentTarget.value)}
                />
              </label>
              <button class="button button--ghost" type="submit">
                {t('reader.go')}
              </button>
            </form>
            <div class="quran-reader__navigation">
              <button
                class="button button--ghost"
                type="button"
                disabled={selectedNumber === 1}
                onClick={() => navigate(selectedNumber - 1)}
              >
                {t('reader.prev')}
              </button>
              <button
                class="button button--ghost"
                type="button"
                disabled={selectedNumber === 114}
                onClick={() => navigate(selectedNumber + 1)}
              >
                {t('reader.next')}
              </button>
            </div>
          </div>
          <HadiNudge variant="banner" />

          {lastRead &&
            (lastRead.surah !== selectedNumber || lastRead.ayah !== (targetAyah ?? 1)) && (
              <div class="continue-card">
                <span>
                  <Icon name="bookmark" size={18} duo /> Continue where you left off:{' '}
                  <strong>
                    {quranSurahs[lastRead.surah - 1].englishName} {lastRead.surah}:{lastRead.ayah}
                  </strong>
                </span>
                <button
                  class="button button--secondary"
                  type="button"
                  onClick={() => navigate(lastRead.surah, lastRead.ayah)}
                >
                  {t('reader.continue')} <Icon name="arrow" size={16} />
                </button>
              </div>
            )}

          {readerError && (
            <div class="inline-notice">
              <p>{readerError}</p>
              <button
                class="text-button"
                type="button"
                onClick={() => {
                  setReaderError('');
                  setSelectedNumber(selectedNumber);
                  void loadSurah(selectedNumber).then(setShard).catch((error: unknown) => {
                    setReaderError(error instanceof Error ? error.message : 'Try again.');
                  });
                }}
              >
                Try again
              </button>
            </div>
          )}
          {!shard && !readerError && <p class="quiet-panel">Loading {summary.englishName}…</p>}
          {shard && (
            <>
              <header class="quran-surah-heading">
                <p class="eyebrow">Surah {shard.number} · {shard.numberOfAyahs} verses</p>
                <h2>{shard.englishName}</h2>
                <p>{shard.englishNameTranslation}</p>
                <p class="quran-surah-heading__arabic" lang="ar" dir="rtl">
                  {shard.name}
                </p>
                <button
                  class="button button--primary"
                  type="button"
                  onClick={() => void recitation.play({ surah: shard.number, ayah: 1 })}
                >
                  <Icon name="headphones" /> {t('reader.playSurah')}
                </button>
              </header>
              <div class="quran-ayah-list">
                {shard.items.map((item) => (
                  <QuranVerse item={item} key={item.id} />
                ))}
              </div>
              <nav class="quran-reader__end" aria-label="Surah navigation">
                {selectedNumber > 1 && (
                  <button class="button button--ghost" type="button" onClick={() => navigate(selectedNumber - 1)}>
                    Previous surah
                  </button>
                )}
                {selectedNumber < 114 && (
                  <button class="button button--secondary" type="button" onClick={() => navigate(selectedNumber + 1)}>
                    Next surah <Icon name="arrow" size={17} />
                  </button>
                )}
              </nav>
            </>
          )}
        </div>
      )}
      <p class="data-note">
        Search covers English, Bangla, surah names, and exact references. Arabic is displayed only
        from the untouched frozen source shards.
      </p>
    </div>
  );
}

export function BrowserPage({ kind }: { kind: 'quran' | 'hadith' }) {
  return kind === 'hadith' ? <ReviewGate kind="hadith" /> : <QuranBrowser />;
}

export function CategoriesPage() {
  return <ReviewGate kind="categories" />;
}
