const DATABASE = 'al-hidayah';
const STORE = 'favorites';

export interface FavoriteRecord {
  id: string;
  savedAt: string;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Favorites storage is blocked by another tab.'));
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const database = await openDatabase();
  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = database.transaction(STORE, mode);
      const request = action(transaction.objectStore(STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      transaction.onerror = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}

export async function listFavorites(): Promise<FavoriteRecord[]> {
  const records = await withStore(
    'readonly',
    (store) => store.getAll() as IDBRequest<FavoriteRecord[]>,
  );
  return records.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export async function saveFavorite(id: string): Promise<void> {
  await withStore('readwrite', (store) => store.put({ id, savedAt: new Date().toISOString() }));
}

export async function removeFavorite(id: string): Promise<void> {
  await withStore('readwrite', (store) => store.delete(id));
}

export async function clearFavorites(): Promise<void> {
  await withStore('readwrite', (store) => store.clear());
}

export function parseFavoriteImport(text: string, validIds: ReadonlySet<string>): FavoriteRecord[] {
  const value: unknown = JSON.parse(text);
  if (!value || typeof value !== 'object' || (value as { version?: unknown }).version !== 1) {
    throw new Error('Choose an Al-Hidayah favorites export with version 1.');
  }
  const favorites = (value as { favorites?: unknown }).favorites;
  if (!Array.isArray(favorites)) throw new Error('The favorites list is missing.');
  const seen = new Set<string>();
  return favorites.map((entry: unknown) => {
    if (!entry || typeof entry !== 'object') throw new Error('A favorite record is invalid.');
    const { id, savedAt } = entry as Record<string, unknown>;
    if (typeof id !== 'string' || !validIds.has(id))
      throw new Error('The file contains an unknown reminder id.');
    if (typeof savedAt !== 'string' || !Number.isFinite(Date.parse(savedAt)))
      throw new Error('A saved date is invalid.');
    if (seen.has(id)) throw new Error('The file contains duplicate reminders.');
    seen.add(id);
    return { id, savedAt };
  });
}

export async function importFavorites(records: FavoriteRecord[]): Promise<void> {
  const database = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE, 'readwrite');
      const store = transaction.objectStore(STORE);
      for (const record of records) store.put(record);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}
