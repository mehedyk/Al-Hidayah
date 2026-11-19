import type { CSSProperties } from 'preact';
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { toPng } from 'html-to-image';
import { formatReference } from '../lib/data';
import { reminderText } from '../lib/share/shareText';
import { useApp } from '../lib/app-context';
import type { Item } from '../lib/types';
import { Icon, LogoMark, Ornament } from './Icon';

type Format = 'post' | 'story' | 'square';
type ShareTheme = 'emerald' | 'midnight' | 'cream';

const dimensions: Record<Format, { width: number; height: number; label: string }> = {
  post: { width: 540, height: 675, label: 'Post · 4:5' },
  story: { width: 540, height: 960, label: 'Story · 9:16' },
  square: { width: 540, height: 540, label: 'Square · 1:1' },
};

export function ShareStudio({ item, onClose }: { item: Item; onClose: () => void }) {
  const { settings, notify } = useApp();
  const dialog = useRef<HTMLDialogElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const artwork = useRef<HTMLDivElement>(null);
  const [format, setFormat] = useState<Format>('post');
  const [theme, setTheme] = useState<ShareTheme>('emerald');
  const [showEnglish, setShowEnglish] = useState(settings.showEnglish);
  const [showBangla, setShowBangla] = useState(settings.showBangla);
  const [previewScale, setPreviewScale] = useState(0.7);
  const [fontScale, setFontScale] = useState(1);
  const [fontsReady, setFontsReady] = useState(false);
  const [overflow, setOverflow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [canShareFiles, setCanShareFiles] = useState(false);
  const size = dimensions[format];
  const text = reminderText(item, showEnglish, showBangla);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    element.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setCanShareFiles(
      typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [new File([''], 'check.png', { type: 'image/png' })] }),
    );
    return () => {
      document.body.style.overflow = previous;
      element.close();
    };
  }, []);

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const resize = () => {
      const availableWidth = Math.max(element.clientWidth - 24, 220);
      const availableHeight = Math.max(element.clientHeight - 24, 320);
      setPreviewScale(Math.min(availableWidth / size.width, availableHeight / size.height, 1));
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();
    return () => observer.disconnect();
  }, [size.width, size.height]);

  useEffect(() => {
    let active = true;
    void document.fonts.ready.then(() => {
      if (active) setFontsReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useLayoutEffect(() => {
    const element = artwork.current;
    const frame = element?.querySelector('.share-frame');
    if (!element || !frame) return;
    const doesOverflow =
      frame.scrollHeight > frame.clientHeight + 2 || frame.scrollWidth > frame.clientWidth + 2;
    setOverflow(doesOverflow && fontScale <= 0.72 && format === 'story');
    if (doesOverflow && fontScale > 0.72) {
      setFontScale((value) => Math.max(0.72, value - 0.04));
    } else if (doesOverflow && format !== 'story') {
      setFormat('story');
      setFontScale(0.82);
      notify('The layout moved to Story so every word remains visible.');
    }
  }, [item, format, showEnglish, showBangla, fontScale, fontsReady, notify]);

  const renderImage = async (): Promise<string> => {
    if (overflow)
      throw new Error('This reminder needs a taller custom layout before it can be exported.');
    const element = artwork.current;
    if (!element) throw new Error('The preview is not ready.');
    await document.fonts.ready;
    await Promise.all([
      document.fonts.load('400 32px "Amiri Quran"'),
      document.fonts.load('400 20px "Noto Serif Bengali"'),
      document.fonts.load('400 20px "Cormorant Garamond"'),
    ]);
    const options = {
      width: size.width,
      height: size.height,
      cacheBust: false,
      style: { transform: 'none', margin: '0' },
    };
    await toPng(element, { ...options, pixelRatio: 0.25 });
    return toPng(element, { ...options, pixelRatio: 1080 / size.width });
  };

  const download = async () => {
    setBusy(true);
    try {
      const dataUrl = await renderImage();
      const link = document.createElement('a');
      link.download = `al-hidayah-${item.id.replaceAll(':', '-')}-${format}.png`;
      link.href = dataUrl;
      link.click();
      notify('Image saved.');
    } catch (error) {
      notify(
        error instanceof Error ? error.message : 'The image could not be saved. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    if (!canShareFiles) return;
    setBusy(true);
    try {
      const dataUrl = await renderImage();
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `al-hidayah-${item.id.replaceAll(':', '-')}.png`, {
        type: 'image/png',
      });
      if (!navigator.canShare({ files: [file] }))
        throw new Error('This browser cannot share images directly. Download the image instead.');
      await navigator.share({ files: [file], text, title: formatReference(item) });
      notify('Ready to send.');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      notify(
        error instanceof Error
          ? error.message
          : 'Sharing was unavailable. Download the image instead.',
      );
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      notify('Reminder and reference copied.');
    } catch {
      notify('Copy was blocked by the browser. Select the reminder text on the page instead.');
    }
  };

  return (
    <dialog ref={dialog} class="share-dialog" aria-labelledby="share-title" onCancel={onClose}>
      <div class="share-header">
        <div>
          <p class="eyebrow">Share Studio</p>
          <h2 id="share-title">Share this reminder</h2>
        </div>
        <button class="icon-button" type="button" onClick={onClose} aria-label="Close Share Studio">
          <Icon name="close" />
        </button>
      </div>
      <div class="share-layout">
        <div class="share-preview" ref={stage}>
          <div class="share-preview-label">
            <span>Live preview</span>
            <small>
              {size.width * 2} × {size.height * 2} PNG
            </small>
          </div>
          <div
            class="share-canvas-positioner"
            style={{
              width: `${size.width * previewScale}px`,
              height: `${size.height * previewScale}px`,
            }}
          >
            <div
              ref={artwork}
              class={`share-artwork share-artwork--${theme}`}
              style={
                {
                  width: `${size.width}px`,
                  height: `${size.height}px`,
                  transform: `scale(${previewScale})`,
                  '--share-font-scale': fontScale,
                } as CSSProperties
              }
            >
              <div class="share-frame">
                <Ornament />
                <p class="share-kicker">A reminder for the heart</p>
                <div class="share-artwork-body">
                  <p class="share-arabic" lang="ar" dir="rtl">
                    {item.ar}
                  </p>
                  {showEnglish && (
                    <p class="share-english" lang="en">
                      {item.en}
                    </p>
                  )}
                  {showBangla && (
                    <p class="share-bangla" lang="bn">
                      {item.bn}
                    </p>
                  )}
                </div>
                <p class="share-reference">{formatReference(item)}</p>
                <div class="share-brand">
                  <LogoMark size={30} />
                  <span>Al-Hidayah</span>
                </div>
              </div>
            </div>
          </div>
          {overflow && (
            <p class="inline-notice" role="alert">
              This reminder needs a taller custom layout. Export is paused so no text can be cut.
            </p>
          )}
        </div>
        <div class="share-options">
          <fieldset>
            <legend>Format</legend>
            <div class="segmented-control">
              {Object.entries(dimensions).map(([value, option]) => (
                <button
                  type="button"
                  class={format === value ? 'selected' : ''}
                  onClick={() => {
                    setFormat(value as Format);
                    setFontScale(1);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Theme</legend>
            <div class="theme-swatches">
              {(['emerald', 'midnight', 'cream'] as const).map((value) => (
                <button
                  type="button"
                  class={`theme-swatch theme-swatch--${value} ${theme === value ? 'selected' : ''}`}
                  onClick={() => setTheme(value)}
                  aria-label={`${value} artwork theme`}
                  aria-pressed={theme === value}
                >
                  <span>{value}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Languages</legend>
            <label class="check-row">
              <input type="checkbox" checked disabled /> Arabic <small>Always included</small>
            </label>
            <label class="check-row">
              <input
                type="checkbox"
                checked={showEnglish}
                onChange={(event) => setShowEnglish(event.currentTarget.checked)}
              />{' '}
              English
            </label>
            <label class="check-row">
              <input
                type="checkbox"
                checked={showBangla}
                onChange={(event) => setShowBangla(event.currentTarget.checked)}
              />{' '}
              <span lang="bn">বাংলা</span>
            </label>
          </fieldset>
          <p class="share-reference-rule">
            <Icon name="check" size={16} /> The exact reference is always included.
          </p>
          <div class="share-buttons">
            <button
              class="button button--primary"
              type="button"
              disabled={busy || overflow}
              onClick={() => void download()}
            >
              <Icon name="download" />
              {busy ? 'Preparing…' : 'Download image'}
            </button>
            {canShareFiles && (
              <button
                class="button button--secondary"
                type="button"
                disabled={busy || overflow}
                onClick={() => void share()}
              >
                <Icon name="share" />
                Send as message
              </button>
            )}
            <button class="button button--ghost" type="button" onClick={() => void copy()}>
              <Icon name="copy" />
              Copy text
            </button>
          </div>
          {!canShareFiles && (
            <div class="share-fallback">
              <p>
                This browser cannot attach images to a share sheet. Download the image, then attach
                it in your messaging app.
              </p>
              <a
                class="button button--secondary"
                href={`https://wa.me/?text=${encodeURIComponent(text)}`}
                target="_blank"
                rel="noreferrer"
              >
                Open WhatsApp
              </a>
              <a
                class="button button--ghost"
                href="https://www.messenger.com/"
                target="_blank"
                rel="noreferrer"
              >
                Open Messenger
              </a>
              <small>
                Copy the text first for Messenger. Instagram also needs the downloaded image
                attached by hand.
              </small>
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}
