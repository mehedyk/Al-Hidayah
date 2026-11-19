import { useEffect, useState } from 'preact/hooks';
import { dailyItemId } from '../lib/daily/dailyItem';
import { getItem, items, formatReference } from '../lib/data';
import { cryptoRandom, dealNext, emptyBag, type ShuffleBagState } from '../lib/picker/shuffleBag';
import { useApp } from '../lib/app-context';
import { Header } from './Header';
import { Icon, Ornament } from './Icon';
import { PrayerWidget } from './PrayerWidget';
import { ReminderCard } from './ReminderCard';
import { HeroScene } from '../scenes/HeroScene';
import { SiteFooter } from './SiteFooter';

const entries = [
  {
    href: '/quran/',
    icon: 'book' as const,
    title: 'From the Qur’an',
    text: 'Owner-approved reminders with exact references',
  },
  {
    href: '/hadith/',
    icon: 'mosque' as const,
    title: 'From the Hadith',
    text: 'Bukhari and Muslim, after human review',
  },
  {
    href: '/categories/',
    icon: 'leaf' as const,
    title: 'For a Better Life',
    text: 'Reviewed themes for everyday reflection',
  },
  {
    href: '/daily/',
    icon: 'calendar' as const,
    title: 'Daily Reminder',
    text: 'A little stillness, one day at a time',
  },
];

function loadBag(): ShuffleBagState {
  try {
    const value: unknown = JSON.parse(localStorage.getItem('al-hidayah:shuffle:v1') ?? 'null');
    if (!value || typeof value !== 'object') return emptyBag;
    const state = value as ShuffleBagState;
    return Array.isArray(state.bag) && typeof state.position === 'number' ? state : emptyBag;
  } catch {
    return emptyBag;
  }
}

export function HomePage() {
  const { notify, settings } = useApp();
  const [item, setItem] = useState(items[0]);
  const [online, setOnline] = useState(true);
  const [intro, setIntro] = useState(false);

  useEffect(() => {
    if (settings.reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      return;
    try {
      if (sessionStorage.getItem('al-hidayah:intro:v1')) return;
      sessionStorage.setItem('al-hidayah:intro:v1', 'shown');
      setIntro(true);
      const timer = setTimeout(() => setIntro(false), 5000);
      return () => clearTimeout(timer);
    } catch {
      setIntro(false);
    }
  }, [settings.reducedMotion]);

  useEffect(() => {
    if (settings.reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      return;
    let cancelled = false;
    let cleanup = () => {};
    void Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
      .then(([{ gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);
        const context = gsap.context(() => {
          gsap.utils.toArray<HTMLElement>('.reveal-section').forEach((section) => {
            gsap.from(section, {
              opacity: 0,
              y: 28,
              duration: 0.8,
              ease: 'power2.out',
              scrollTrigger: { trigger: section, start: 'top 88%', once: true },
            });
          });
        });
        cleanup = () => context.revert();
      })
      .catch(() => {
        if (!cancelled) document.documentElement.dataset.scrollMotion = 'static';
      });
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [settings.reducedMotion]);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('item');
    setItem(getItem(requested ?? '') ?? getItem(dailyItemId(new Date(), items)) ?? items[0]);
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  const nextReminder = () => {
    try {
      const result = dealNext(
        items.map((entry) => entry.id),
        { ...loadBag(), lastId: item.id },
        cryptoRandom,
      );
      localStorage.setItem('al-hidayah:shuffle:v1', JSON.stringify(result.state));
      setItem(getItem(result.id) ?? items[0]);
    } catch {
      notify('A new reminder could not be loaded. Please try again.');
    }
  };

  return (
    <>
      <section class="hero" aria-label="Daily reminder" data-intro={intro}>
        <picture class="hero-art" aria-hidden="true">
          <source media="(max-width: 767px)" srcset="/images/hero-mobile.webp" />
          <img
            src="/images/hero-desktop.webp"
            alt=""
            width="1792"
            height="1024"
            fetchpriority="high"
          />
        </picture>
        <div class="hero-scrim" aria-hidden="true" />
        <HeroScene />
        <Header route="home" overHero />
        <div class="hero-content">
          <p class="hero-date">
            {new Date().toLocaleDateString('en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
          <ReminderCard key={item.id} item={item} onNew={nextReminder} />
          {!online && (
            <p class="offline-note" role="status">
              You are offline. Reminders still work; prayer times may be out of date.
            </p>
          )}
        </div>
        <div class="entry-grid shell">
          {entries.map((entry) => (
            <a class="entry-card" href={entry.href}>
              <span class="entry-icon">
                <Icon name={entry.icon} size={28} />
              </span>
              <span>
                <strong>{entry.title}</strong>
                <small>{entry.text}</small>
              </span>
              <Icon name="chevron" size={18} />
            </a>
          ))}
        </div>
        <a class="scroll-cue" href="#discover">
          <span>Scroll to discover</span>
          <Icon name="chevron" size={18} />
        </a>
        <span class="hero-faith">
          Powered by Faith <Icon name="heart" size={15} />
        </span>
      </section>

      <main id="discover" class="home-main">
        <section class="intro-section shell reveal-section">
          <div class="intro-copy">
            <p class="eyebrow">Why Al-Hidayah</p>
            <h2>A quieter way to reconnect.</h2>
            <p>
              One reminder. Three languages. A source you can check. No account, no noise, and
              nothing between you and the words.
            </p>
            <a class="text-link" href="/about/">
              How content is verified <Icon name="arrow" size={17} />
            </a>
          </div>
          <div class="principles-grid">
            <div>
              <span>01</span>
              <h3>Read with confidence</h3>
              <p>Every visible reminder comes from the frozen, checksum-verified dataset.</p>
            </div>
            <div>
              <span>02</span>
              <h3>Keep what resonates</h3>
              <p>Save favorites privately on this device and take them with you as JSON.</p>
            </div>
            <div>
              <span>03</span>
              <h3>Share the whole meaning</h3>
              <p>Export considered artwork with translations and the reference always intact.</p>
            </div>
          </div>
        </section>

        <div class="shell reveal-section">
          <PrayerWidget />
        </div>

        <section class="integrity-section shell reveal-section">
          <div class="integrity-art" aria-hidden="true">
            <Ornament />
            <span class="integrity-seal">
              <Icon name="check" size={34} />
            </span>
          </div>
          <div>
            <p class="eyebrow">Trust is a feature</p>
            <h2>Nothing published without a source.</h2>
            <p>
              Arabic is copied verbatim from the frozen Uthmani edition. English uses Saheeh
              International and Bangla uses Muhiuddin Khan. The initial pool contains only the two
              reminders already present in the approved designs.
            </p>
            <div class="integrity-facts">
              <span>
                <strong>6,236</strong> verses aligned
              </span>
              <span>
                <strong>3</strong> editions fingerprinted
              </span>
              <span>
                <strong>0</strong> trackers or accounts
              </span>
            </div>
            <a class="button button--secondary" href="/about/">
              Sources and integrity <Icon name="arrow" />
            </a>
          </div>
        </section>
      </main>
      <SiteFooter reference={formatReference(item)} />
    </>
  );
}
