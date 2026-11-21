import { useEffect, useRef, useState } from 'preact/hooks';
import { formatReference } from '../lib/data';
import { reminderText } from '../lib/share/shareText';
import { useApp } from '../lib/app-context';
import { useT } from '../lib/useT';
import {
  builtInTemplates,
  loadCustomTemplates,
  photoTemplates,
  type CardTemplate,
} from '../lib/share/templates';
import {
  canvasToBlob,
  cardSizes,
  renderCard,
  type CardFormat,
  type CardResult,
} from '../lib/share/renderCard';
import type { Item } from '../lib/types';
import { Icon, type IconName } from './Icon';

function shareTargets(item: Item, text: string): Array<{ name: string; href: string; icon: IconName }> {
  const link = item.contextUrl;
  const encoded = encodeURIComponent;
  const bare = reminderText(item, true, false).replace(`\n\n${link}`, '');
  return [
    { name: 'WhatsApp', href: `https://wa.me/?text=${encoded(text)}`, icon: 'send' },
    {
      name: 'Telegram',
      href: `https://t.me/share/url?url=${encoded(link)}&text=${encoded(bare)}`,
      icon: 'send',
    },
    {
      name: 'X',
      href: `https://twitter.com/intent/tweet?text=${encoded(`${item.en}\n${formatReference(item)}`.slice(0, 250))}&url=${encoded(link)}`,
      icon: 'external',
    },
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encoded(link)}`,
      icon: 'external',
    },
    {
      name: 'Email',
      href: `mailto:?subject=${encoded(formatReference(item))}&body=${encoded(text)}`,
      icon: 'mail',
    },
  ];
}

export function ShareStudio({ item, onClose }: { item: Item; onClose: () => void }) {
  const { settings, notify } = useApp();
  const t = useT();
  const dialog = useRef<HTMLDialogElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [format, setFormat] = useState<CardFormat>('post');
  const [templates, setTemplates] = useState<CardTemplate[]>([...builtInTemplates, ...photoTemplates]);
  const [templateId, setTemplateId] = useState('emerald');
  const [showEnglish, setShowEnglish] = useState(settings.showEnglish);
  const [showBangla, setShowBangla] = useState(settings.showBangla);
  const [result, setResult] = useState<CardResult>();
  const [busy, setBusy] = useState(false);
  const [canShareFiles, setCanShareFiles] = useState(false);
  const template = templates.find((entry) => entry.id === templateId) ?? templates[0];
  const text = reminderText(item, showEnglish, showBangla);
  const size = cardSizes[format];

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    element.showModal();
    // Keep the page behind the dialog still. CSSOM style writes are allowed by the strict CSP.
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
    let active = true;
    void loadCustomTemplates().then((custom) => {
      if (active && custom.length) setTemplates((current) => [...current, ...custom]);
    });
    return () => {
      active = false;
    };
  }, []);

  // The preview is the very canvas that is exported, so what you see is what you get.
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    let active = true;
    void renderCard(element, { item, format, template, showEnglish, showBangla })
      .then((value) => {
        if (active) setResult(value);
      })
      .catch(() => {
        if (active) notify('The preview could not be drawn in this browser.');
      });
    return () => {
      active = false;
    };
  }, [item, format, template, showEnglish, showBangla, notify]);

  const blocked = busy || !result || result.overflow;
  const fileName = `al-hidayah-${item.id.replaceAll(':', '-')}-${format}.png`;

  const getBlob = async (): Promise<Blob> => {
    const element = canvas.current;
    if (!element) throw new Error('The preview is not ready.');
    try {
      return await canvasToBlob(element);
    } catch {
      throw new Error('The image could not be created. Try the Emerald template.');
    }
  };

  const run = async (task: () => Promise<void>) => {
    setBusy(true);
    try {
      await task();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      notify(error instanceof Error ? error.message : 'That did not work. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const download = () =>
    run(async () => {
      const blob = await getBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = fileName;
      link.href = url;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      notify('Image saved.');
    });

  const copyImage = () =>
    run(async () => {
      if (typeof ClipboardItem === 'undefined' || !navigator.clipboard?.write)
        throw new Error('This browser cannot copy images. Use Download image instead.');
      const blob = await getBlob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      notify('Image copied. Paste it into any chat.');
    });

  const nativeShare = () =>
    run(async () => {
      const blob = await getBlob();
      const file = new File([blob], fileName, { type: 'image/png' });
      if (!navigator.canShare({ files: [file] }))
        throw new Error('This browser cannot share images directly. Download the image instead.');
      await navigator.share({ files: [file], text, title: formatReference(item) });
      notify('Ready to send.');
    });

  const copyText = async () => {
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
          <h2 id="share-title">{t('share.title')}</h2>
        </div>
        <button class="icon-button" type="button" onClick={onClose} aria-label="Close Share Studio">
          <Icon name="close" />
        </button>
      </div>
      <div class="share-layout">
        <div class="share-preview">
          <div class="share-preview-label">
            <span>Live preview</span>
            <small>
              {size.width} × {size.height} PNG
            </small>
          </div>
          <canvas
            ref={canvas}
            class="share-canvas"
            width={size.width}
            height={size.height}
            role="img"
            aria-label={`Share card for ${formatReference(item)}`}
          />
          {result?.overflow && (
            <p class="inline-notice" role="alert">
              This verse is too long for this shape. Choose Story, or hide a translation.
            </p>
          )}
          {template.photoUrl && result && !result.photo && (
            <p class="inline-notice" role="status">
              The photo could not be loaded, so a plain background is used instead.
            </p>
          )}
        </div>
        <div class="share-options">
          <fieldset>
            <legend>Format</legend>
            <div class="segmented-control">
              {(Object.entries(cardSizes) as Array<[CardFormat, (typeof cardSizes)[CardFormat]]>).map(
                ([value, option]) => (
                  <button
                    type="button"
                    key={value}
                    class={format === value ? 'selected' : ''}
                    aria-pressed={format === value}
                    onClick={() => setFormat(value)}
                  >
                    {option.label}
                  </button>
                ),
              )}
            </div>
          </fieldset>
          <fieldset>
            <legend>Template</legend>
            <div class="template-grid">
              {templates.map((entry) => (
                <button
                  type="button"
                  key={entry.id}
                  class={`template-chip ${templateId === entry.id ? 'selected' : ''}`}
                  aria-pressed={templateId === entry.id}
                  onClick={() => setTemplateId(entry.id)}
                  title={entry.credit ?? entry.name}
                >
                  <span
                    class="template-chip__swatch"
                    data-colors={`${entry.colors[0]},${entry.colors[1]}`}
                    ref={(node) => {
                      if (node)
                        node.style.background = `linear-gradient(160deg, ${entry.colors[0]}, ${entry.colors[1]})`;
                    }}
                  >
                    {entry.kind !== 'built-in' && <Icon name="image" size={14} />}
                  </span>
                  <span>{entry.name}</span>
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
            <button class="button button--primary" type="button" disabled={blocked} onClick={() => void download()}>
              <Icon name="download" />
              {busy ? 'Preparing…' : 'Download image'}
            </button>
            <button class="button button--secondary" type="button" disabled={blocked} onClick={() => void copyImage()}>
              <Icon name="clipboardImage" />
              Copy image
            </button>
            {canShareFiles && (
              <button class="button button--secondary" type="button" disabled={blocked} onClick={() => void nativeShare()}>
                <Icon name="share" />
                Share…
              </button>
            )}
            <button class="button button--ghost" type="button" onClick={() => void copyText()}>
              <Icon name="copy" />
              Copy text
            </button>
          </div>
          <div class="share-fallback">
            <p>Send the text straight to an app (attach the downloaded image there if you like):</p>
            <div class="share-targets">
              {shareTargets(item, text).map((target) => (
                <a
                  class="button button--ghost"
                  key={target.name}
                  href={target.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name={target.icon} size={16} /> {target.name}
                </a>
              ))}
            </div>
            <small>Instagram and Messenger have no web share link: download the image and attach it.</small>
          </div>
        </div>
      </div>
    </dialog>
  );
}
