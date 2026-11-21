import { formatReference } from '../data';
import type { Item } from '../types';
import type { CardTemplate } from './templates';

export type CardFormat = 'post' | 'story' | 'square';

export const cardSizes: Record<CardFormat, { width: number; height: number; label: string }> = {
  post: { width: 1080, height: 1350, label: 'Post · 4:5' },
  story: { width: 1080, height: 1920, label: 'Story · 9:16' },
  square: { width: 1080, height: 1080, label: 'Square · 1:1' },
};

export interface CardOptions {
  item: Item;
  format: CardFormat;
  template: CardTemplate;
  showEnglish: boolean;
  showBangla: boolean;
}

export interface CardResult {
  /** The photo was drawn (false means a gradient was used instead). */
  photo: boolean;
  /** Even at the smallest size the text does not fit this format. */
  overflow: boolean;
}

const ARABIC = '"Amiri Quran", "Amiri", serif';
const LATIN = '"Cormorant Garamond", Georgia, serif';
const BANGLA = '"Kalpurush", "Noto Serif Bengali", serif';
const UI = 'Inter, sans-serif';

const imageCache = new Map<string, Promise<HTMLImageElement | undefined>>();

function loadImage(url: string): Promise<HTMLImageElement | undefined> {
  let cached = imageCache.get(url);
  if (!cached) {
    cached = new Promise((resolve) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => resolve(image);
      image.onerror = () => resolve(undefined);
      image.src = url;
    });
    imageCache.set(url, cached);
  }
  return cached;
}

export async function ensureCardFonts(): Promise<void> {
  await Promise.all([
    document.fonts.load('400 48px "Amiri Quran"', 'بسم الله'),
    document.fonts.load('400 30px "Cormorant Garamond"'),
    document.fonts.load('italic 400 30px "Cormorant Garamond"'),
    document.fonts.load('400 28px "Noto Serif Bengali"', 'বাংলা'),
    document.fonts.load('400 28px "Kalpurush"', 'বাংলা'),
    document.fonts.load('500 22px Inter'),
  ]).catch(() => undefined);
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawLattice(ctx: CanvasRenderingContext2D, w: number, h: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.09;
  ctx.lineWidth = 1.5;
  const cell = 120;
  for (let y = 0; y < h + cell; y += cell) {
    for (let x = 0; x < w + cell; x += cell) {
      const cx = x + (((y / cell) % 2) * cell) / 2;
      ctx.beginPath();
      for (let k = 0; k < 16; k += 1) {
        const r = k % 2 === 0 ? cell * 0.42 : cell * 0.2;
        const a = (Math.PI / 8) * k - Math.PI / 2;
        const px = cx + Math.cos(a) * r;
        const py = y + Math.sin(a) * r;
        if (k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }
  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Paints the whole card onto `canvas` (sized to the chosen format). */
export async function renderCard(
  canvas: HTMLCanvasElement,
  { item, format, template, showEnglish, showBangla }: CardOptions,
): Promise<CardResult> {
  const { width, height } = cardSizes[format];
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('This browser cannot draw the card.');

  await ensureCardFonts();

  // Background: gradient first, then the photo over it if one loads.
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, template.colors[0]);
  gradient.addColorStop(1, template.colors[1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  let photo = false;
  if (template.photoUrl) {
    const image = await loadImage(template.photoUrl);
    if (image) {
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
      const dw = image.naturalWidth * scale;
      const dh = image.naturalHeight * scale;
      ctx.drawImage(image, (width - dw) / 2, (height - dh) / 2, dw, dh);
      photo = true;
    }
  }
  const light = template.tone === 'light';
  if (photo) {
    const veil = ctx.createLinearGradient(0, 0, 0, height);
    veil.addColorStop(0, light ? 'rgba(2,12,10,0.55)' : 'rgba(255,250,240,0.55)');
    veil.addColorStop(1, light ? 'rgba(2,12,10,0.8)' : 'rgba(255,250,240,0.8)');
    ctx.fillStyle = veil;
    ctx.fillRect(0, 0, width, height);
  } else if (template.pattern) {
    drawLattice(ctx, width, height, template.accent);
  }

  const ink = light ? '#f6efdc' : '#1f2a24';
  const soft = light ? 'rgba(246,239,220,0.82)' : 'rgba(31,42,36,0.82)';
  const margin = 96;
  const maxWidth = width - margin * 2;
  const top = 150;
  const bottom = height - 150;
  const available = bottom - top;

  const reference = formatReference(item);
  let result: CardResult;
  type Block = { font: string; lines: string[]; lineHeight: number; color: string; dir: 'rtl' | 'ltr'; gap: number };
  let blocks: Block[] = [];
  let used = 0;

  for (let scale = 1; scale >= 0.3; scale -= 0.04) {
    const make = (
      text: string,
      font: string,
      size: number,
      lh: number,
      color: string,
      dir: 'rtl' | 'ltr',
      gap: number,
    ): Block => {
      ctx.font = `${font.replace('{s}', `${Math.round(size * scale)}px`)}`;
      ctx.direction = dir;
      return {
        font: ctx.font,
        lines: wrap(ctx, text, maxWidth),
        lineHeight: Math.round(size * scale * lh),
        color,
        dir,
        gap: Math.round(gap * scale),
      };
    };
    blocks = [make(item.ar, `400 {s} ${ARABIC}`, 86, 1.9, ink, 'rtl', 44)];
    if (showEnglish) blocks.push(make(item.en, `italic 400 {s} ${LATIN}`, 48, 1.38, soft, 'ltr', 36));
    if (showBangla) blocks.push(make(item.bn, `400 {s} ${BANGLA}`, 38, 1.6, soft, 'ltr', 36));
    blocks.push(make(reference, `500 {s} ${UI}`, 28, 1.4, template.accent, 'ltr', 0));
    used = blocks.reduce((sum, block) => sum + block.lines.length * block.lineHeight + block.gap, 0);
    if (used <= available) break;
  }
  result = { photo, overflow: used > available };

  // Readable panel behind text on photos.
  const startY = top + Math.max(0, (available - used) / 2);
  if (photo) {
    ctx.fillStyle = light ? 'rgba(2,12,10,0.38)' : 'rgba(255,250,240,0.5)';
    roundRect(ctx, margin - 40, startY - 50, maxWidth + 80, used + 70, 36);
    ctx.fill();
  }

  // Kicker and ornament
  ctx.direction = 'ltr';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = template.accent;
  ctx.font = `600 26px ${UI}`;
  ctx.fillText('A REMINDER FOR THE HEART', width / 2, 96);
  ctx.strokeStyle = template.accent;
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 70, 122);
  ctx.lineTo(width / 2 + 70, 122);
  ctx.stroke();
  ctx.globalAlpha = 1;

  let y = startY;
  for (const block of blocks) {
    ctx.font = block.font;
    ctx.direction = block.dir;
    ctx.textAlign = 'center';
    ctx.fillStyle = block.color;
    for (const line of block.lines) {
      y += block.lineHeight;
      ctx.fillText(line, width / 2, y - block.lineHeight * 0.28);
    }
    y += block.gap;
  }

  // Brand and credit
  ctx.direction = 'ltr';
  ctx.textAlign = 'center';
  ctx.fillStyle = template.accent;
  ctx.font = `600 30px ${LATIN}`;
  ctx.fillText('Al-Hidayah', width / 2, height - 84);
  if (template.credit) {
    ctx.fillStyle = soft;
    ctx.globalAlpha = 0.7;
    ctx.font = `400 16px ${UI}`;
    ctx.fillText(template.credit, width / 2, height - 48);
    ctx.globalAlpha = 1;
  }
  return result;
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('The image could not be created.'))),
      'image/png',
    );
  });
}
