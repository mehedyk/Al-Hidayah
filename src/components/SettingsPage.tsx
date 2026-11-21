import { cities } from '../lib/prayer';
import { clearFavorites } from '../lib/storage/favorites';
import { defaultSettings } from '../lib/settings';
import { reportUrl, useApp } from '../lib/app-context';
import { scenes, wallpaperUrl } from '../lib/scenes';
import { Icon } from './Icon';

export function SettingsPage() {
  const { settings, updateSettings, notify, refreshFavorites } = useApp();

  const clearData = async () => {
    if (!window.confirm('Clear favorites and restore all settings on this device?')) return;
    await clearFavorites();
    localStorage.clear();
    updateSettings(defaultSettings);
    await refreshFavorites();
    notify('Local favorites and settings cleared.');
  };

  return (
    <div class="settings-page">
      <section class="settings-group">
        <div class="settings-group-heading">
          <Icon name="sun" />
          <div>
            <h2>Reading experience</h2>
            <p>Make the interface comfortable for you.</p>
          </div>
        </div>
        <fieldset class="scene-picker">
          <legend>Scene</legend>
          <p class="scene-picker__hint">
            Real photography behind every page. Pair any scene with dark or light.
          </p>
          <div class="scene-grid">
            {scenes.map((scene) => (
              <label class={`scene-card ${settings.scene === scene.id ? 'is-active' : ''}`}>
                <input
                  type="radio"
                  name="scene"
                  value={scene.id}
                  checked={settings.scene === scene.id}
                  onChange={() => updateSettings({ scene: scene.id })}
                />
                <img
                  src={wallpaperUrl(scene, 400)}
                  alt=""
                  width="400"
                  height="260"
                  loading="lazy"
                  decoding="async"
                  onError={(event) => {
                    // If the photo host is unreachable, show the plain card instead of a broken icon.
                    event.currentTarget.style.visibility = 'hidden';
                  }}
                />
                <span class="scene-card__text">
                  <strong>{scene.name}</strong>
                  <small>{scene.mood}</small>
                </span>
                {settings.scene === scene.id && <Icon name="check" size={18} />}
              </label>
            ))}
          </div>
          <a class="text-link" href="/about/#credits">
            Photo credits <Icon name="arrow" size={16} />
          </a>
        </fieldset>
        <label class="field">
          <span>Theme</span>
          <select
            value={settings.theme}
            onChange={(event) =>
              updateSettings({ theme: event.currentTarget.value as typeof settings.theme })
            }
          >
            <option value="dark">Dark emerald</option>
            <option value="light">Light cream</option>
            <option value="system">Match device</option>
          </select>
        </label>
        <label class="field">
          <span>Text size</span>
          <select
            value={settings.textSize}
            onChange={(event) =>
              updateSettings({ textSize: event.currentTarget.value as typeof settings.textSize })
            }
          >
            <option value="small">Small</option>
            <option value="default">Default</option>
            <option value="large">Large</option>
            <option value="extra-large">Extra large</option>
          </select>
        </label>
        <label class="switch-row">
          <span>
            Reduce motion<small>Also follows your device preference</small>
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={settings.reducedMotion}
            onChange={(event) => updateSettings({ reducedMotion: event.currentTarget.checked })}
          />
        </label>
      </section>
      <section class="settings-group">
        <div class="settings-group-heading">
          <Icon name="book" />
          <div>
            <h2>Languages</h2>
            <p>Arabic is always shown. References are always included.</p>
          </div>
        </div>
        <label class="check-row">
          <input type="checkbox" checked disabled /> Arabic <small>Source text</small>
        </label>
        <label class="switch-row">
          <span>English translation</span>
          <input
            type="checkbox"
            role="switch"
            checked={settings.showEnglish}
            onChange={(event) => updateSettings({ showEnglish: event.currentTarget.checked })}
          />
        </label>
        <label class="switch-row">
          <span>Bangla translation</span>
          <input
            type="checkbox"
            role="switch"
            checked={settings.showBangla}
            onChange={(event) => updateSettings({ showBangla: event.currentTarget.checked })}
          />
        </label>
        <p class="inline-notice">
          The Bangla interface language will be enabled after fluent human translation and a
          second-person review. No machine-generated Bangla interface copy is shipped.
        </p>
      </section>
      <section class="settings-group">
        <div class="settings-group-heading">
          <Icon name="clock" />
          <div>
            <h2>Prayer times</h2>
            <p>Dhaka and the Karachi calculation method are the defaults.</p>
          </div>
        </div>
        <label class="field">
          <span>City</span>
          <select
            value={settings.city}
            onChange={(event) => updateSettings({ city: event.currentTarget.value })}
          >
            {Object.keys(cities).map((city) => (
              <option value={city}>{city}</option>
            ))}
          </select>
        </label>
        <label class="field">
          <span>Calculation method</span>
          <select
            value={settings.prayerMethod}
            onChange={(event) =>
              updateSettings({ prayerMethod: Number(event.currentTarget.value) })
            }
          >
            <option value={1}>University of Islamic Sciences, Karachi</option>
            <option value={3}>Muslim World League</option>
            <option value={2}>Islamic Society of North America</option>
            <option value={4}>Umm al-Qura University, Makkah</option>
          </select>
        </label>
        <a class="text-link" href="/prayer/">
          Open prayer times <Icon name="arrow" size={16} />
        </a>
      </section>
      <section class="settings-group">
        <div class="settings-group-heading">
          <Icon name="calendar" />
          <div>
            <h2>Daily reminder</h2>
            <p>Optional notifications while Al-Hidayah is open.</p>
          </div>
        </div>
        <label class="field">
          <span>Where reminders come from</span>
          <select
            value={settings.reminderSource}
            onChange={(event) =>
              updateSettings({
                reminderSource: event.currentTarget.value as typeof settings.reminderSource,
              })
            }
          >
            <option value="quran">The entire Qur’an (6,236 verses)</option>
            <option value="reviewed">Only the owner-reviewed set</option>
          </select>
        </label>
        <label class="field">
          <span>Preferred time</span>
          <input
            type="time"
            value={settings.dailyTime}
            onChange={(event) => updateSettings({ dailyTime: event.currentTarget.value })}
          />
        </label>
        <a class="text-link" href="/daily/">
          Manage daily notifications <Icon name="arrow" size={16} />
        </a>
      </section>
      <section class="settings-group">
        <div class="settings-group-heading">
          <Icon name="settings" />
          <div>
            <h2>Data and support</h2>
            <p>Your favorites and settings never leave this device unless you export them.</p>
          </div>
        </div>
        <a class="text-link" href="/favorites/">
          Export or import favorites <Icon name="arrow" size={16} />
        </a>
        <a class="text-link" href={reportUrl} target="_blank" rel="noreferrer">
          Report a content error <Icon name="arrow" size={16} />
        </a>
        <button class="button button--ghost danger" type="button" onClick={() => void clearData()}>
          <Icon name="trash" />
          Clear local data
        </button>
      </section>
    </div>
  );
}
