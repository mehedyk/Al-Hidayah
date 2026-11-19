export type IconName =
  | 'home'
  | 'info'
  | 'heart'
  | 'settings'
  | 'refresh'
  | 'share'
  | 'book'
  | 'mosque'
  | 'leaf'
  | 'calendar'
  | 'sun'
  | 'moon'
  | 'arrow'
  | 'download'
  | 'copy'
  | 'close'
  | 'clock'
  | 'location'
  | 'check'
  | 'chevron'
  | 'search'
  | 'upload'
  | 'trash';

const paths: Record<IconName, preact.ComponentChild> = {
  home: (
    <>
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10M9 20v-6h6v6" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6M12 7h.01" />
    </>
  ),
  heart: (
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.5a5.5 5.5 0 0 0 1.1-8.9Z" />
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 7v5h-5" />
      <path d="M4 17v-5h5" />
      <path d="M6.1 8a7 7 0 0 1 11.5-1L20 12M4 12l2.4 5a7 7 0 0 0 11.5-1" />
    </>
  ),
  share: (
    <>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4" />
    </>
  ),
  book: (
    <>
      <path d="M3 5.5A3.5 3.5 0 0 1 6.5 2H11v17H6.5A3.5 3.5 0 0 0 3 22Z" />
      <path d="M21 5.5A3.5 3.5 0 0 0 17.5 2H13v17h4.5A3.5 3.5 0 0 1 21 22Z" />
    </>
  ),
  mosque: (
    <>
      <path d="M3 21h18M5 21V11h14v10M8 11V8m8 3V8M12 3c3 3 4 4 4 6H8c0-2 1-3 4-6Z" />
      <path d="M10 21v-5a2 2 0 0 1 4 0v5M3 8h2m14 0h2" />
    </>
  ),
  leaf: (
    <>
      <path d="M12 22V12" />
      <path d="M12 17C5 17 3 13 3 7c6 0 9 3 9 10ZM12 12c0-6 3-9 9-9 0 6-3 9-9 9Z" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  moon: <path d="M20.8 14.2A9 9 0 0 1 9.8 3.2 9 9 0 1 0 20.8 14.2Z" />,
  arrow: (
    <>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12M7 10l5 5 5-5M4 21h16" />
    </>
  ),
  copy: (
    <>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V4H4v12h4" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  location: (
    <>
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 6 6 6-6 6" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="7" />
      <path d="m16 16 5 5" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V4M7 9l5-5 5 5M4 20h16" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6" />
    </>
  ),
};

export function Icon({
  name,
  size = 20,
  filled = false,
}: {
  name: IconName;
  size?: number;
  filled?: boolean;
}) {
  return (
    <svg
      aria-hidden="true"
      class="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

export function LogoMark({ size = 54 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      class="logo-mark"
    >
      <path
        d="M8 56V29C8 17 19 12 32 3c13 9 24 14 24 26v27H8Z"
        stroke="currentColor"
        stroke-width="2"
      />
      <path
        d="M15 56V31c0-9 7-13 17-20 10 7 17 11 17 20v25"
        stroke="currentColor"
        stroke-width="1"
        opacity=".65"
      />
      <path
        d="M19 50h26M22 50V39h20v11M26 39v-5m12 5v-5M32 21c5 5 7 8 7 12H25c0-4 2-7 7-12Z"
        fill="currentColor"
      />
      <path d="M15 32h3v18h-3zm31 0h3v18h-3zM13 29h5v3h-5zm33 0h5v3h-5z" fill="currentColor" />
    </svg>
  );
}

export function Ornament() {
  return (
    <svg aria-hidden="true" class="ornament" viewBox="0 0 420 52" fill="none">
      <path
        d="M0 36h150c18 0 23-17 36-17 10 0 12-10 24-18 12 8 14 18 24 18 13 0 18 17 36 17h150"
        stroke="currentColor"
      />
      <path
        d="M177 36c8-8 12-20 33-30 21 10 25 22 33 30M196 36l14-17 14 17M210 19v17"
        stroke="currentColor"
        opacity=".7"
      />
      <circle cx="210" cy="36" r="3" fill="currentColor" />
    </svg>
  );
}
