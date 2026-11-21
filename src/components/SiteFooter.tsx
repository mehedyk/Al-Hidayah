import { reportUrl } from '../lib/app-context';
import { FooterMedia } from './FooterMedia';
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

/**
 * Full-viewport footer with the ink-landscape video behind the links.
 * `media={false}` renders only the content, for pages (such as the 404) that provide their own
 * video stage around it.
 */
export function SiteFooter({ reference, media = true }: { reference?: string; media?: boolean }) {
  return (
    <footer class={`site-footer ${media ? '' : 'site-footer--bare'}`}>
      {media && <FooterMedia />}
      <div class="footer-inner">
        <div class="footer-grid">
          <div class="footer-brand">
            <a class="brand-lockup" href="/" aria-label="Al-Hidayah home">
              <LogoMark size={64} />
              <span class="brand-name">Al-Hidayah</span>
            </a>
            <p class="brand-blurb">
              A few calm minutes each day, with Arabic, English, Bangla, and a source you can check.
            </p>
            <ul class="contact-list">
              <li>
                <Icon name="check" size={19} /> <span>Frozen, verified sources</span>
              </li>
              <li>
                <Icon name="heart" size={19} /> <span>Private on your device</span>
              </li>
              <li>
                <Icon name="info" size={19} /> <span>No ads, accounts, or trackers</span>
              </li>
            </ul>
          </div>

          <nav class="col" aria-labelledby="footer-explore">
            <h2 class="col-title" id="footer-explore">
              Explore
            </h2>
            <ul class="link-list">
              {exploreLinks.map((link) => (
                <li>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <nav class="col" aria-labelledby="footer-your-space">
            <h2 class="col-title" id="footer-your-space">
              Your Space
            </h2>
            <ul class="link-list">
              {personalLinks.map((link) => (
                <li>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <nav class="col" aria-labelledby="footer-trust">
            <h2 class="col-title" id="footer-trust">
              Trust
            </h2>
            <ul class="link-list">
              <li>
                <a href="/about/">About Al-Hidayah</a>
              </li>
              <li>
                <a href="/about/#sources">Sources and integrity</a>
              </li>
              <li>
                <a href="/about/#credits">Photo and media credits</a>
              </li>
              <li>
                <a href={reportUrl} target="_blank" rel="noreferrer">
                  Report a content error
                </a>
              </li>
            </ul>
          </nav>

          <div class="reminder">
            <h2 class="col-title">One reminder at a time</h2>
            <p>A quieter way to reconnect. No noise, no feed, and nothing between you and the words.</p>
            <a class="subscribe" href="/daily/">
              <span>Today’s reminder</span>
              <b>
                <Icon name="arrow" size={22} />
              </b>
            </a>
          </div>
        </div>

        <div class="footer-bottom">
          <p class="footer-note">
            A reminder tool, not a replacement for qualified scholarship.{' '}
            <span>{reference ?? 'Free · Private · No advertising'}</span>
          </p>
          <nav class="legal" aria-label="Legal and support">
            <a href="/about/">About</a>
            <a href="/about/#credits">Credits</a>
            <a href="/settings/">Settings</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
