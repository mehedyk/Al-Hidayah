import { dailyItemId, localDateKey } from '../lib/daily/dailyItem';
import { getItem, items, formatShortReference } from '../lib/data';
import { useApp } from '../lib/app-context';
import { Icon } from './Icon';
import { ReminderCard } from './ReminderCard';

export function DailyPage() {
  const { settings, updateSettings, notify } = useApp();
  const today = new Date();
  const item = getItem(dailyItemId(today, items)) ?? items[0];
  const previous = Array.from({ length: 5 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - index - 1);
    return { date, item: getItem(dailyItemId(date, items)) ?? items[0] };
  });

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
      <ReminderCard item={item} title="Your daily reminder" />
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
        {previous.map(({ date, item: previousItem }) => (
          <a href={`/?item=${previousItem.id}`}>
            <span>
              {date.toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}
            </span>
            <strong>{formatShortReference(previousItem)}</strong>
            <Icon name="chevron" />
          </a>
        ))}
      </section>
    </div>
  );
}
