import { useEffect, useState } from 'preact/hooks';
import { useApp } from '../lib/app-context';
import { fetchPrayerTimes, cachedPrayerTimes, nextPrayer } from '../lib/prayer';
import type { PrayerDay } from '../lib/types';
import { Icon } from './Icon';

export function PrayerWidget({ full = false }: { full?: boolean }) {
  const { settings } = useApp();
  const [day, setDay] = useState<PrayerDay | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (coordinates?: GeolocationCoordinates) => {
    setLoading(true);
    setError('');
    try {
      setDay(await fetchPrayerTimes(settings.city, settings.prayerMethod, coordinates));
    } catch {
      setDay(cachedPrayerTimes());
      setError('Live times are unavailable. Showing the last saved times, if available.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setDay(cachedPrayerTimes());
    void load();
  }, [settings.city, settings.prayerMethod]);

  const locate = () => {
    if (!navigator.geolocation) {
      setError('This browser does not provide location. Choose a city in Settings instead.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => void load(position.coords),
      () => setError('Location permission was not granted. Choose a city in Settings instead.'),
      { timeout: 10_000 },
    );
  };

  const next = day ? nextPrayer(day) : null;
  const entries = day ? Object.entries(day.timings) : [];

  return (
    <section
      class={`prayer-widget ${full ? 'prayer-widget--full' : ''}`}
      aria-labelledby={full ? 'prayer-title' : 'home-prayer-title'}
    >
      <div class="section-heading prayer-heading">
        <div>
          <p class="eyebrow">A rhythm for the day</p>
          <h2 id={full ? 'prayer-title' : 'home-prayer-title'}>Prayer times</h2>
        </div>
        <div class="prayer-location">
          <Icon name="location" size={17} />
          {settings.city}
          <button class="text-button" type="button" onClick={locate}>
            Use my location
          </button>
        </div>
      </div>
      {loading && !day && <p class="quiet-panel">Getting today’s prayer times…</p>}
      {day && (
        <>
          <div class="prayer-grid">
            {entries.map(([name, time]) => (
              <div class={`prayer-time ${next?.name === name ? 'next' : ''}`}>
                <span>{name}</span>
                <strong>{time}</strong>
                {next?.name === name && <small>Next prayer</small>}
              </div>
            ))}
          </div>
          <p class="data-note">
            Times for {day.city} · {day.date} · Karachi calculation by default. Fetched{' '}
            {new Date(day.fetchedAt).toLocaleDateString()}.
          </p>
        </>
      )}
      {error && (
        <p class="inline-notice" role="status">
          {error}{' '}
          {!day && (
            <button class="text-button" type="button" onClick={() => void load()}>
              Try again
            </button>
          )}
        </p>
      )}
      <p class="privacy-note">
        Your location is used only for this request. It is never sent to Al-Hidayah or stored on a
        server.
      </p>
    </section>
  );
}
