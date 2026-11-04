// Brand tokens: the brand's own look drives every page and kit. Events (Black Friday, Christmas...)
// only add a label and an accent ribbon on top; they never replace the brand's palette or fonts.
//
// brand = {
//   mode: 'light' | 'dark',
//   palette: { bg, surface, text, muted, accent, accent2, border },   // any subset, hex colours
//   fontDisplay, fontBody,                                             // Google Fonts family names
// }
import { readableOn } from './landing.js';

const HEX = /^#[0-9a-f]{6}$/i;
const FONT = /^[A-Za-z0-9 ]{2,40}$/;
const hex = (c) => (typeof c === 'string' && HEX.test(c) ? c.toLowerCase() : null);

const luminance = (c) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const isLight = (c) => luminance(c) > 0.45;
export const contrast = (a, b) => { const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

const mix = (a, b, t) => `#${[1, 3, 5].map((i) => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t).toString(16).padStart(2, '0')).join('')}`;

const BASES = {
  light: { bg: '#faf8f5', surface: '#ffffff', text: '#1c1917', muted: '#6b6560', border: 'rgba(28,25,23,.12)' },
  dark: { bg: '#0b0b0c', surface: '#161618', text: '#f5f5f4', muted: '#a8a29e', border: 'rgba(255,255,255,.12)' },
};

/** True when the caller gave any brand look (palette, mode or fonts). */
export function hasBrandLook(b) {
  return Boolean(b && (b.mode || b.fontDisplay || b.fontBody || Object.values(b.palette ?? {}).some(hex)));
}

/**
 * Merge brand tokens into a theme. Missing pieces are derived so text always stays readable:
 * mode comes from the background, muted text from text + background, accent text from the accent.
 * @param {object} t base theme (event or default)
 * @param {object} b brand tokens
 */
export function brandTheme(t, b = {}) {
  const p = b.palette ?? {};
  const bg0 = hex(p.bg);
  const mode = b.mode === 'light' || b.mode === 'dark' ? b.mode : bg0 ? (isLight(bg0) ? 'light' : 'dark') : (t.bg && isLight(t.bg) ? 'light' : 'dark');
  const base = BASES[mode];
  const bg = bg0 ?? base.bg;
  let text = hex(p.text) ?? base.text;
  if (contrast(text, bg) < 4.5) text = isLight(bg) ? '#1c1917' : '#f5f5f4';
  const surface = hex(p.surface) ?? (mode === 'light' ? (bg === '#ffffff' ? '#f6f4f1' : '#ffffff') : mix(bg, '#ffffff', 0.06));
  let muted = hex(p.muted) ?? mix(text, bg, 0.42);
  if (contrast(muted, bg) < 3) muted = mix(text, bg, 0.3);
  const accent = hex(p.accent) ?? hex(b.brandColor) ?? t.accent;
  const accent2 = hex(p.accent2) ?? mix(accent, bg, 0.55);
  const out = {
    ...t,
    mode, bg, surface, text, muted, accent, accent2,
    accentText: readableOn(accent),
    border: typeof p.border === 'string' && p.border.length < 40 ? p.border : (mode === 'light' ? 'rgba(28,25,23,.12)' : 'rgba(255,255,255,.12)'),
    glow: [accent, accent2, mix(accent, bg, 0.8)],
  };
  if (FONT.test(b.fontDisplay ?? '') || FONT.test(b.fontBody ?? '')) out.fontsFromBrand = true;
  if (FONT.test(b.fontDisplay ?? '')) out.display = b.fontDisplay;
  if (FONT.test(b.fontBody ?? '')) out.body = b.fontBody;
  if (out.display && !FONT.test(b.fontDisplay ?? '') && FONT.test(b.fontBody ?? '')) out.display = b.fontBody;
  return out;
}

/** Pull brand tokens from tool arguments (flat or nested) so every tool accepts the same shape. */
export function brandTokens(o = {}) {
  const b = o.brandStyle ?? {};
  return {
    mode: b.mode ?? o.mode,
    palette: { ...(o.palette ?? {}), ...(b.palette ?? {}) },
    fontDisplay: b.fontDisplay ?? o.fontDisplay,
    fontBody: b.fontBody ?? o.fontBody,
    brandColor: o.brandColor,
  };
}

const escHtml = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/**
 * The brand's name as a wordmark: never re-cased by CSS. brandStyle.wordmark =
 * { text, case: 'lower'|'upper'|'as-is', weight, letterSpacing, highlight: [{ from, to, color }] } or { svg }.
 */
export function wordmarkHtml(o = {}) {
  const w = o.brandStyle?.wordmark ?? o.wordmark ?? null;
  if (w?.svg && /^\s*<svg[\s>]/i.test(w.svg) && !/<script|on\w+=/i.test(w.svg)) return `<span class="wm wm-svg" role="img" aria-label="${escHtml(o.brand)}">${w.svg}</span>`;
  let text = String(w?.text ?? o.brand ?? '');
  if (w?.case === 'lower') text = text.toLowerCase();
  else if (w?.case === 'upper') text = text.toUpperCase();
  const style = [w?.weight ? `font-weight:${Number(w.weight) || 700}` : '', w?.letterSpacing ? `letter-spacing:${String(w.letterSpacing).replace(/[^0-9.\-a-z]/gi, '')}` : ''].filter(Boolean).join(';');
  const marks = (Array.isArray(w?.highlight) ? w.highlight : []).filter((h) => Number.isInteger(h.from) && Number.isInteger(h.to) && h.to > h.from).sort((a, b) => a.from - b.from);
  let html = '';
  let at = 0;
  for (const h of marks) {
    if (h.from < at) continue;
    const color = /^#[0-9a-f]{6}$/i.test(h.color ?? '') ? h.color : 'var(--ac)';
    html += escHtml(text.slice(at, h.from)) + `<span style="color:${color}">${escHtml(text.slice(h.from, h.to))}</span>`;
    at = h.to;
  }
  html += escHtml(text.slice(at));
  return `<span class="wm" style="text-transform:none${style ? `;${style}` : ''}">${html}</span>`;
}
