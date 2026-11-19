import type { PrayerDay } from './types';

export const cities: Record<string, { latitude: number; longitude: number }> = {
  Dhaka: { latitude: 23.8103, longitude: 90.4125 },
  Chattogram: { latitude: 22.3569, longitude: 91.7832 },
  Sylhet: { latitude: 24.8949, longitude: 91.8687 },
  Khulna: { latitude: 22.8456, longitude: 89.5403 },
  Rajshahi: { latitude: 24.3745, longitude: 88.6042 },
};

const CACHE_KEY = 'al-hidayah:prayer:v1';
const prayerNames = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

export async function fetchPrayerTimes(
  city: string,
  method: number,
  coordinates?: GeolocationCoordinates,
): Promise<PrayerDay> {
  const location = cities[city] ?? cities.Dhaka;
  const latitude = coordinates?.latitude ?? location.latitude;
  const longitude = coordinates?.longitude ?? location.longitude;
  const now = new Date();
  const date = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
  const url = new URL(`https://api.aladhan.com/v1/timings/${date}`);
  url.searchParams.set('latitude', String(latitude));
  url.searchParams.set('longitude', String(longitude));
  url.searchParams.set('method', String(method));
  const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error('The prayer-time service could not be reached.');
  const value: unknown = await response.json();
  const timings = (value as { data?: { timings?: Record<string, unknown> } }).data?.timings;
  if (!timings) throw new Error('The prayer-time response was incomplete.');
  const clean = Object.fromEntries(
    prayerNames.map((name) => {
      const time = timings[name];
      if (typeof time !== 'string' || !/^\d{2}:\d{2}/.test(time))
        throw new Error(`Missing ${name} time.`);
      return [name, time.slice(0, 5)];
    }),
  ) as PrayerDay['timings'];
  const result: PrayerDay = {
    date,
    fetchedAt: now.toISOString(),
    city: coordinates ? 'Current location' : city,
    timings: clean,
  };
  localStorage.setItem(CACHE_KEY, JSON.stringify(result));
  return result;
}

export function cachedPrayerTimes(): PrayerDay | null {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null');
    if (!value || typeof value !== 'object') return null;
    const day = value as PrayerDay;
    return typeof day.date === 'string' && typeof day.fetchedAt === 'string' && day.timings
      ? day
      : null;
  } catch {
    return null;
  }
}

export function nextPrayer(day: PrayerDay, now = new Date()): { name: string; time: string } {
  const current = now.getHours() * 60 + now.getMinutes();
  for (const name of prayerNames) {
    if (name === 'Sunrise') continue;
    const [hours, minutes] = day.timings[name].split(':').map(Number);
    if (hours * 60 + minutes > current) return { name, time: day.timings[name] };
  }
  return { name: 'Fajr', time: day.timings.Fajr };
}
