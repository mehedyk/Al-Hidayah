export const DAILY_PERMUTATION_SEED = 17;

export function localDayNumber(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
}

export function permutedIndex(
  dayNumber: number,
  poolLength: number,
  seed = DAILY_PERMUTATION_SEED,
): number {
  if (!Number.isInteger(poolLength) || poolLength < 1)
    throw new Error('Pool length must be positive.');
  return (((dayNumber + seed) % poolLength) + poolLength) % poolLength;
}

export function dailyItemId<T extends { id: string }>(date: Date, pool: readonly T[]): string {
  if (pool.length === 0) throw new Error('The reviewed reminder pool is empty.');
  return pool[permutedIndex(localDayNumber(date), pool.length)].id;
}

export function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
