import { useEffect, useRef } from 'preact/hooks';
import { FOOTER_POSTER_URL, FOOTER_VIDEO_URL } from '../lib/media';

// `playsinline` must be a lowercase attribute so iOS plays the clip inline instead of fullscreen.
const inline = { playsinline: true } as Record<string, unknown>;

/**
 * The ink-landscape video. It autoplays muted and loops. When it scrolls out of view it is paused
 * to save battery, and it resumes when it returns. Without JavaScript (the 404 page) it simply
 * keeps looping, which is fine for a muted clip.
 */
export function FooterMedia() {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = video.current;
    if (!element || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) void element.play().catch(() => undefined);
        else element.pause();
      },
      { threshold: 0.05 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div class="footer-media" aria-hidden="true">
      <video
        ref={video}
        class="footer-bg"
        autoplay
        muted
        loop
        preload="auto"
        poster={FOOTER_POSTER_URL}
        {...inline}
      >
        <source src={FOOTER_VIDEO_URL} type="video/mp4" />
      </video>
    </div>
  );
}
