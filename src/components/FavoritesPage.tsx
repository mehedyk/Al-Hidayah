import { useRef, useState } from 'preact/hooks';
import { getItem, items, formatShortReference } from '../lib/data';
import { importFavorites, parseFavoriteImport } from '../lib/storage/favorites';
import { useApp } from '../lib/app-context';
import { Icon } from './Icon';

export function FavoritesPage() {
  const { favoriteIds, toggleFavorite, openShare, notify, refreshFavorites } = useApp();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const favorites = [...favoriteIds].map((id) => getItem(id)).filter((item) => item !== undefined);

  const exportFile = () => {
    const records = favorites.map((item) => ({ id: item.id, savedAt: new Date().toISOString() }));
    const blob = new Blob([JSON.stringify({ version: 1, favorites: records }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'al-hidayah-favorites.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify('Favorites exported.');
  };

  const importFile = async (file: File) => {
    setBusy(true);
    try {
      const records = parseFavoriteImport(await file.text(), new Set(items.map((item) => item.id)));
      await importFavorites(records);
      await refreshFavorites();
      notify(`${records.length} favorites imported.`);
    } catch (error) {
      notify(error instanceof Error ? error.message : 'The favorites file could not be imported.');
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  if (favorites.length === 0) {
    return (
      <div class="empty-state empty-state--large">
        <span class="empty-heart">
          <Icon name="heart" size={38} />
        </span>
        <h2>Nothing saved yet.</h2>
        <p>
          Press Save on any reminder and it will appear here. Favorites stay on this device only.
        </p>
        <a class="button button--primary" href="/">
          Find a reminder <Icon name="arrow" />
        </a>
        <button class="button button--ghost" type="button" onClick={() => input.current?.click()}>
          <Icon name="upload" />
          Import favorites
        </button>
        <input
          ref={input}
          class="sr-only"
          type="file"
          accept="application/json,.json"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            if (file) void importFile(file);
          }}
        />
      </div>
    );
  }

  return (
    <div class="favorites-page">
      <div class="favorites-toolbar">
        <p>
          <Icon name="info" size={17} /> Stored on this device only. No account needed.
        </p>
        <div>
          <button class="button button--secondary" type="button" onClick={exportFile}>
            <Icon name="download" />
            Export favorites
          </button>
          <button
            class="button button--ghost"
            type="button"
            disabled={busy}
            onClick={() => input.current?.click()}
          >
            <Icon name="upload" />
            Import favorites
          </button>
          <input
            ref={input}
            class="sr-only"
            type="file"
            accept="application/json,.json"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (file) void importFile(file);
            }}
          />
        </div>
      </div>
      <div class="favorite-grid">
        {favorites.map((item) => (
          <article class="favorite-card">
            <p class="row-arabic" lang="ar" dir="rtl">
              {item.ar}
            </p>
            <p lang="en">{item.en}</p>
            <p class="favorite-bangla" lang="bn">
              {item.bn}
            </p>
            <span class="favorite-reference">{formatShortReference(item)}</span>
            <div>
              <button class="text-button" type="button" onClick={() => openShare(item)}>
                <Icon name="share" size={17} />
                Share
              </button>
              <button class="text-button danger" type="button" onClick={() => toggleFavorite(item)}>
                <Icon name="trash" size={17} />
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
