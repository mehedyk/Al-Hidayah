import { useEffect, useState } from 'preact/hooks';
import { localDateKey } from '../lib/daily/dailyItem';
import { items } from '../lib/data';
import { dailyReminderId, shortReferenceFromId } from '../lib/reminders';
import { resolveItem } from '../lib/quranLibrary';
import type { Item } from '../lib/types';
import { useApp } from '../lib/app-context';
import { Icon } from './Icon';
import { ReminderCard } from './ReminderCard';

export function DailyPage() {
  const { settings, updateSettings, notify } = useApp();
  const today = new Date();
  const [item, setItem] = useState<Item>(items[0]);
  const [failed, setFailed] = useState(false);
  const previous = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - index - 1);
    return { date, id: dailyReminderId(date, settings.reminderSource) };
  });

  useEffect(() => {
    let active = true;
    setFailed(false);
    void resolveItem(dailyReminderId(new Date(), settings.reminderSource))
      .then((found) => {
        if (active && found) setItem(found);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [settings.reminderSource]);

  const toggleDaily = async () => {
    if (settings.dailyEnabled) {
      updateSettings({ dailyEnabled: false });
      return;
    }
    if (!('Notification' in window)) {
      notify(
        'This browser does not support notifications. You can still open the Daily Reminder page each day.',
      );
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      notify(
        'Notification permission was not granted. You can enable it later in your browser settings.',
      );
      return;
    }
    updateSettings({ dailyEnabled: true });
    notify(`Daily reminders are on for ${settings.dailyTime} while Al-Hidayah is open.`);
  };

  return (
    <div class="daily-page">
      <div class="daily-date-block">
        <span>{today.toLocaleDateString('en-GB', { weekday: 'long' })}</span>
        <p>
          {today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} ·{' '}
          {localDateKey(today)}
        </p>
      </div>
      {failed && (
        <p class="inline-notice" role="status">
          Today’s verse could not be loaded. Check your connection and reload.
        </p>
      )}
      <ReminderCard key={item.id} item={item} title="Your daily reminder" />
      <section class="daily-controls">
        <div>
          <h2>A quiet nudge, at your time</h2>
          <p>
            Notifications are optional and are delivered while Al-Hidayah is open. No account or
            server is involved.
          </p>
        </div>
        <label class="switch-row">
          <span>Remind me daily</span>
          <input
            type="checkbox"
            role="switch"
            checked={settings.dailyEnabled}
            onChange={() => void toggleDaily()}
          />
        </label>
        <label class="field">
          <span>Reminder time</span>
          <input
            type="time"
            value={settings.dailyTime}
            onChange={(event) => updateSettings({ dailyTime: event.currentTarget.value })}
          />
        </label>
      </section>
      <section class="previous-days">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Catch up</p>
            <h2>Yesterday and the days before</h2>
          </div>
        </div>
        {previous.map(({ date, id }) => (
          <a href={`/?item=${id}`}>
            <span>
              {date.toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}
            </span>
            <strong>{shortReferenceFromId(id)}</strong>
            <Icon name="chevron" />
          </a>
        ))}
      </section>
    </div>
  );
}
