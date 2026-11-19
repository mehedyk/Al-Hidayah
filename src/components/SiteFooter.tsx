import { reportUrl } from '../lib/app-context';
import { Icon, LogoMark } from './Icon';

const exploreLinks = [
  { href: '/', label: 'Home' },
  { href: '/quran/', label: 'From the Qur’an' },
  { href: '/hadith/', label: 'From the Hadith' },
  { href: '/categories/', label: 'For a Better Life' },
];

const personalLinks = [
  { href: '/daily/', label: 'Daily Reminder' },
  { href: '/prayer/', label: 'Prayer Times' },
  { href: '/favorites/', label: 'Favorites' },
  { href: '/settings/', label: 'Settings' },
];

export function SiteFooter({ reference }: { reference?: string }) {
  return (
    <footer class="site-footer">
      <picture class="site-footer__media" aria-hidden="true">
        <source media="(max-width: 767px)" srcset="/images/hero-mobile.webp" />
        <img src="/images/hero-desktop.webp" alt="" loading="lazy" decoding="async" />
      </picture>
      <div class="site-footer__inner shell">
        <div class="site-footer__grid">
          <div class="site-footer__brand">
            <a class="brand" href="/" aria-label="Al-Hidayah home">
              <LogoMark size={64} />
              <span>
                <strong>Al-Hidayah</strong>
                <small>Qur’an · Hadith · Reminder</small>
              </span>
            </a>
            <p class="site-footer__blurb">
              A few calm minutes each day, with Arabic, English, Bangla, and a source you can check.
            </p>
            <ul class="site-footer__principles">
              <li>
                <Icon name="check" size={17} /> Frozen, verified sources
              </li>
              <li>
                <Icon name="heart" size={17} /> Private on your device
              </li>
              <li>
                <Icon name="info" size={17} /> No ads, accounts, or trackers
              </li>
            </ul>
          </div>

          <nav class="site-footer__column" aria-labelledby="footer-explore">
            <h2 id="footer-explore">Explore</h2>
            <ul>
              {exploreLinks.map((link) => (
                <li>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <nav class="site-footer__column" aria-labelledby="footer-your-space">
            <h2 id="footer-your-space">Your Space</h2>
            <ul>
              {personalLinks.map((link) => (
                <li>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <nav class="site-footer__column" aria-labelledby="footer-trust">
            <h2 id="footer-trust">Trust</h2>
            <ul>
              <li>
                <a href="/about/">About Al-Hidayah</a>
              </li>
              <li>
                <a href="/about/">Sources and integrity</a>
              </li>
              <li>
                <a href={reportUrl} target="_blank" rel="noreferrer">
                  Report a content error
                </a>
              </li>
            </ul>
          </nav>

          <div class="site-footer__reminder">
            <p class="eyebrow">One reminder at a time</p>
            <h2>A quieter way to reconnect.</h2>
            <p>No noise, no feed, and nothing between you and the words.</p>
            <a href="/daily/">
              Today’s reminder <Icon name="arrow" size={17} />
            </a>
          </div>
        </div>

        <div class="site-footer__bottom">
          <p>A reminder tool, not a replacement for qualified scholarship.</p>
          <span>{reference ?? 'Free · Private · No advertising'}</span>
        </div>
      </div>
    </footer>
  );
}
