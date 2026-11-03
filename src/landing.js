import { archetypeFor, renderDirector } from './director.js';
import { classifyNiche } from './niches.js';
import { SCENES } from './scenes.js';
// Sales landing page generator. One self-contained HTML file with a premium look:
// four distinct layouts, 3D tilt offer card, holiday particle effects, aurora/grid
// backgrounds, kinetic type, marquees and scroll reveals. Works from minimal input
// (brand + product + theme) and writes its own copy. It never invents reviews,
// guarantees or prices. All motion respects prefers-reduced-motion.

// Google Fonts axis specs; single-weight display faces must not request extra weights.
const FONT_AXES = { Anton: '', 'Bebas Neue': '', 'Archivo Black': '', 'DM Serif Display': '', Caveat: ':wght@600', Fraunces: ':ital,wght@0,400;0,600;1,400', 'Playfair Display': ':ital,wght@0,400;0,700;0,900;1,400' };

export const LAYOUTS = ['director', 'signature', 'aurora', 'editorial', 'poster', 'bento'];

const EVENT_NAMES = { 'black-friday': 'Black Friday', 'cyber-monday': 'Cyber Monday', christmas: 'Christmas', diwali: 'Diwali', hanukkah: 'Hanukkah', halloween: 'Halloween', thanksgiving: 'Thanksgiving', 'boxing-day': 'Boxing Day', 'new-year': 'New Year' };

export const THEMES = {
  'black-friday': { layout: 'poster', bg: '#08080a', surface: '#121216', text: '#f7f7f5', muted: '#a1a1aa', accent: '#facc15', accent2: '#fb923c', accentText: '#0a0a0a', border: 'rgba(255,255,255,.10)', glow: ['#facc15', '#f97316', '#3f3f46'], display: 'Anton', body: 'Inter', particles: 'dust', ornament: '✦', eyebrow: 'Black Friday', cta: 'Shop the sale' },
  'cyber-monday': { layout: 'bento', bg: '#05060f', surface: '#0d1124', text: '#e8efff', muted: '#8b9ac0', accent: '#22d3ee', accent2: '#a78bfa', accentText: '#03121a', border: 'rgba(148,163,255,.16)', glow: ['#22d3ee', '#8b5cf6', '#2563eb'], display: 'Space Grotesk', body: 'Space Grotesk', particles: 'dust', ornament: '◆', eyebrow: 'Cyber Monday', cta: 'Claim the deal', floor: true },
  christmas: { layout: 'editorial', bg: '#0f1f17', surface: '#16291f', text: '#fbf6ee', muted: '#c9bfae', accent: '#e8b04b', accent2: '#c2410c', accentText: '#1a1206', border: 'rgba(232,176,75,.20)', glow: ['#b91c1c', '#e8b04b', '#166534'], display: 'Fraunces', body: 'Inter', particles: 'snow', ornament: '❄', eyebrow: 'Holiday Edit', cta: 'Shop gifts' },
  diwali: { layout: 'aurora', bg: '#140a24', surface: '#1f1238', text: '#fff7e6', muted: '#dcc7a1', accent: '#fbbf24', accent2: '#f472b6', accentText: '#1a0d00', border: 'rgba(251,191,36,.20)', glow: ['#f59e0b', '#db2777', '#7c3aed'], display: 'Playfair Display', body: 'Poppins', particles: 'embers', ornament: '✺', eyebrow: 'Diwali Festive Offer', cta: 'Shop the edit' },
  hanukkah: { layout: 'editorial', bg: '#0b1530', surface: '#122046', text: '#f3f6ff', muted: '#a9b6d6', accent: '#93c5fd', accent2: '#fde68a', accentText: '#0b1530', border: 'rgba(147,197,253,.20)', glow: ['#2563eb', '#93c5fd', '#fde68a'], display: 'Fraunces', body: 'Inter', particles: 'stars', ornament: '✡', eyebrow: 'Hanukkah Gifts', cta: 'Find a gift' },
  halloween: { layout: 'poster', bg: '#0c0806', surface: '#1a110b', text: '#fff1e2', muted: '#c8a98c', accent: '#fb6a10', accent2: '#a3e635', accentText: '#120800', border: 'rgba(251,106,16,.20)', glow: ['#ea580c', '#7c2d12', '#4d7c0f'], display: 'Bebas Neue', body: 'Inter', particles: 'embers', ornament: '✶', eyebrow: 'Halloween Deal', cta: 'Get the treat' },
  thanksgiving: { layout: 'editorial', bg: '#1c120b', surface: '#2a1b10', text: '#fdf3e6', muted: '#d6bfa3', accent: '#f59e0b', accent2: '#b45309', accentText: '#1c120b', border: 'rgba(245,158,11,.20)', glow: ['#b45309', '#f59e0b', '#7f1d1d'], display: 'DM Serif Display', body: 'DM Sans', particles: 'leaves', ornament: '❋', eyebrow: 'Thanksgiving', cta: 'Shop the thank-you sale' },
  'boxing-day': { layout: 'bento', bg: '#0b0b0d', surface: '#15151a', text: '#fafafa', muted: '#a1a1aa', accent: '#ef4444', accent2: '#f97316', accentText: '#ffffff', border: 'rgba(255,255,255,.10)', glow: ['#ef4444', '#f97316', '#27272a'], display: 'Archivo Black', body: 'Archivo', particles: 'dust', ornament: '★', eyebrow: 'Boxing Day Sale', cta: 'Shop the sale' },
  'new-year': { layout: 'aurora', bg: '#07070d', surface: '#11111c', text: '#f5f1e6', muted: '#aaa6b8', accent: '#e6c36a', accent2: '#c4b5fd', accentText: '#0b0904', border: 'rgba(230,195,106,.20)', glow: ['#e6c36a', '#6d28d9', '#0ea5e9'], display: 'Playfair Display', body: 'Inter', particles: 'confetti', ornament: '✧', eyebrow: 'New Year Offer', cta: 'Start the year right', floor: true },
  default: { layout: 'aurora', bg: '#0a0a12', surface: '#131322', text: '#f4f4f8', muted: '#a3a3b8', accent: '#8b5cf6', accent2: '#22d3ee', accentText: '#ffffff', border: 'rgba(255,255,255,.10)', glow: ['#8b5cf6', '#22d3ee', '#ec4899'], display: 'Plus Jakarta Sans', body: 'Plus Jakarta Sans', particles: 'dust', ornament: '✦', eyebrow: 'Limited-time offer', cta: 'Get the offer' },
};

const HEADLINES = {
  'black-friday': ['The biggest drop of the year.', '{Product}. Lowest price of the year.', 'Black Friday is here. So is our best price.'],
  'cyber-monday': ['Cyber Monday. Online only.', 'Last call on {product}.', 'One day. Our best online deal.'],
  christmas: ['Gifts they will actually love.', 'Wrap up something special.', '{Product}, ready to gift.'],
  diwali: ['Light up the festive season.', 'Celebrate Diwali with {product}.', 'A festive edit, made to shine.'],
  hanukkah: ['Eight nights of thoughtful gifts.', 'Something bright for every night.', 'Gifts worth lighting up for.'],
  halloween: ['Scary good deals.', 'All treat. No tricks.', 'Deals so good they are frightening.'],
  thanksgiving: ['Grateful for you. Here is a thank-you.', 'A thank-you sale for our community.', 'Thankful for you. Save on {product}.'],
  'boxing-day': ['Boxing Day. Everything must go.', 'The after-Christmas sale is on.', 'Unwrap even more savings.'],
  'new-year': ['New year. Best price.', 'Start the year with {product}.', 'Ring in the new year with our best offer.'],
  default: ['Our best offer of the season.', '{Product}, at a special price.', 'Limited time. Real savings.'],
};

const GIFT_THEMES = new Set(['christmas', 'diwali', 'hanukkah', 'thanksgiving']);

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
// House style: no em or en dashes in generated copy.
const tidy = (s) => (s == null ? s : String(s).replace(/\s*[\u2014\u2013]\s*/g, ', ').replace(/,\s*,/g, ','));

function safeUrl(u, fallback = '#') {
  if (!u) return fallback;
  const s = String(u).trim();
  return /^(https?:\/\/|mailto:|\/|#|\.\/)/i.test(s) ? s : fallback;
}

const hex = (c) => (typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c) ? c : null);

export function readableOn(bgHex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(bgHex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return (L + 0.05) / 0.05 > 1.05 / (L + 0.05) ? '#111111' : '#ffffff';
}

function hash(s) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return Math.abs(h);
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export function discountOf(o) {
  if (o.discountPercent) return Math.round(o.discountPercent);
  const m = /(\d{1,2})\s*%/.exec(o.offer ?? '');
  if (m) return Number(m[1]);
  const num = (v) => Number(String(v ?? '').replace(/[^0-9.]/g, ''));
  const now = num(o.price), was = num(o.originalPrice);
  return now && was && was > now ? Math.round((1 - now / was) * 100) : null;
}

function fmtDeadline(ms, tz) {
  try {
    return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: tz, timeZoneName: 'short' }).format(ms);
  } catch {
    return new Date(ms).toUTCString().replace(':00 GMT', ' UTC');
  }
}

// Turn minimal input into complete, truthful copy.
function writeCopy(o, themeKey, t, discount, deadlineLabel) {
  const product = tidy(o.product) || 'everything';
  const pick = (arr) => arr[hash(`${o.brand}|${product}|${themeKey}`) % arr.length];
  const fill = (s) => s.replace('{Product}', cap(product)).replace('{product}', product);
  const offer = tidy(o.offer) || (discount ? `${discount}% off ${product === 'everything' ? 'everything' : product}` : null);

  const headline = tidy(o.headline) || fill(pick(HEADLINES[themeKey] ?? HEADLINES.default));
  const subheadline = tidy(o.subheadline) || [
    offer ? `${cap(offer)}${o.price ? `, now ${o.price}` : ''}.` : `${cap(product)} from ${o.brand}.`,
    deadlineLabel ? `Ends ${deadlineLabel}.` : 'For a limited time only.',
    GIFT_THEMES.has(themeKey) ? 'Made for gifting, and for treating yourself.' : '',
  ].filter(Boolean).join(' ');

  const features = (o.features?.length ? o.features : [
    offer ? { title: cap(offer), text: `Our best saving on ${product} this season.` } : { title: cap(product), text: `The ${product} people come back to ${o.brand} for.` },
    deadlineLabel ? { title: 'Ends on time, every time', text: `The countdown is live. When it hits zero on ${deadlineLabel}, the offer is gone.` } : { title: 'While it lasts', text: 'This offer is only here for the season.' },
    GIFT_THEMES.has(themeKey) ? { title: 'Ready to gift', text: `An easy win for everyone on your list.` } : { title: `Made by ${o.brand}`, text: 'Built with care, down to the details.' },
  ]).slice(0, 6).map((f) => ({ title: tidy(f.title), text: tidy(f.text) }));

  const faq = (o.faq?.length ? o.faq : [
    ...(deadlineLabel ? [{ q: 'When does the offer end?', a: `${deadlineLabel}. The countdown on this page shows the exact time left in your time zone.` }] : []),
    ...(o.terms ? [{ q: 'What is included?', a: o.terms }] : []),
  ]).map((x) => ({ q: tidy(x.q), a: tidy(x.a) }));

  const marquee = [offer ?? t.eyebrow, t.eyebrow, deadlineLabel ? `Ends ${deadlineLabel.split(',').slice(0, 2).join(',')}` : 'Limited time', cap(product)].map(tidy);
  return { product, offer, headline, subheadline, features, faq, marquee, ctaText: tidy(o.ctaText) || t.cta };
}

// Split the headline into words for the kinetic reveal.
const kinetic = (text) => esc(text).split(/\s+/).map((w, i) => `<span class="w" style="--i:${i}"><span>${w}</span></span>`).join(' ');

/**
 * @param {object} o
 * @param {string} o.brand                       required
 * @param {string} [o.product]                   what you sell, e.g. "skincare gift sets"
 * @param {string} [o.theme]                     key of THEMES
 * @param {string} [o.layout]                    aurora | editorial | poster | bento (default: theme's)
 * @param {string} [o.headline] [o.subheadline]  written for you when omitted
 * @param {string} [o.offer]                     e.g. "40% off everything"
 * @param {number} [o.discountPercent]
 * @param {string} [o.price] [o.originalPrice] [o.currency]
 * @param {string} [o.ctaText] [o.ctaUrl]
 * @param {string} [o.deadline]                  ISO 8601 with offset
 * @param {string} [o.timeZone]                  IANA zone for the printed deadline, e.g. "America/New_York"
 * @param {string} [o.imageUrl] [o.imageAlt]
 * @param {{title:string,text:string}[]} [o.features]
 * @param {{quote:string,name:string,detail?:string}[]} [o.testimonials]  real quotes only
 * @param {{q:string,a:string}[]} [o.faq]
 * @param {string} [o.terms]
 * @param {string} [o.brandColor]
 * @param {string} [o.pageUrl]
 * @param {boolean} [o.effects]                  false disables particles and 3D motion
 */
export function buildLanding(o) {
  if (!o.brand) throw new Error('brand is required');
  const themeKey = THEMES[o.theme] ? o.theme : 'default';
  const t = { ...THEMES[themeKey] };
  const custom = hex(o.brandColor);
  if (custom) { t.accent = custom; t.accentText = readableOn(custom); t.glow = [custom, t.glow[1], t.glow[2]]; }
  const scene = SCENES[themeKey];
  let layout = LAYOUTS.includes(o.layout) ? o.layout : scene ? 'signature' : t.layout;
  if (layout === 'signature' && !scene) layout = t.layout;
  const effects = o.effects !== false;

  let deadlineMs = null;
  if (o.deadline) {
    deadlineMs = Date.parse(o.deadline);
    if (Number.isNaN(deadlineMs)) throw new Error('deadline must be ISO 8601, e.g. 2026-11-30T23:59:00-05:00');
    if (!/(Z|[+-]\d{2}:?\d{2})$/.test(o.deadline)) throw new Error('deadline must include a time zone offset (e.g. -05:00 or Z) so the countdown is correct for every visitor');
  }
  const deadlineLabel = deadlineMs ? fmtDeadline(deadlineMs, o.timeZone) : null;
  const discount = discountOf(o);
  const c = writeCopy(o, themeKey, t, discount, deadlineLabel);
  const cta = safeUrl(o.ctaUrl);
  const terms = tidy(o.terms);
  const testimonials = (o.testimonials ?? []).slice(0, 3).map((r) => ({ quote: tidy(r.quote), name: tidy(r.name), detail: tidy(r.detail) }));
  const title = `${c.headline} | ${o.brand}`;
  const year = Number((deadlineMs ? new Date(deadlineMs) : new Date()).toISOString().slice(0, 4));
  const fontList = [t.display, t.body];
  const img = o.imageUrl ? safeUrl(o.imageUrl, null) : null;

  const jsonLd = o.price ? {
    '@context': 'https://schema.org', '@type': 'Product', name: c.headline, brand: { '@type': 'Brand', name: o.brand },
    ...(img ? { image: img } : {}), description: c.subheadline,
    offers: { '@type': 'Offer', price: String(o.price).replace(/[^0-9.]/g, ''), priceCurrency: o.currency ?? 'USD', url: cta,
      availability: 'https://schema.org/InStock', ...(deadlineMs ? { priceValidUntil: new Date(deadlineMs).toISOString().slice(0, 10) } : {}) },
  } : null;

  const jsonLdTag = jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>` : '';

  // Product-led page (art director) whenever we know what is sold or have product media.
  // Holiday-only pages (no niche, no media) keep the signature holiday scenes.
  const cls = classifyNiche(`${o.niche ?? ''} ${o.product ?? ''}`);
  const legacy = ['signature', 'aurora', 'editorial', 'poster', 'bento'].includes(o.layout);
  const hasMedia = Boolean(o.images?.length || o.productImage || o.videoUrl || o.modelUrl);
  if (o.layout === 'director' || (!legacy && (cls.id !== 'general' || hasMedia))) {
    const dt = THEMES[o.theme] ? { ...t } : { ...t, bg: '#0b0b0c', surface: '#161618', text: '#f5f5f4', muted: '#a8a29e', accent: custom ?? '#f5f5f4', accentText: custom ? t.accentText : '#0b0b0c', accent2: '#78716c', border: 'rgba(255,255,255,.12)', eyebrow: 'Limited time' };
    return renderDirector({ esc, c, o, t: dt, discount, deadlineMs, deadlineLabel, cta, terms, year, title, jsonLd: jsonLdTag, hash, nicheId: cls.id, eventName: THEMES[o.theme] ? EVENT_NAMES[o.theme] : (o.eventName ?? null) });
  }

  // ---------- reusable fragments ----------
  const btn = (label, cls = '') => `<a class="btn ${cls}" href="${esc(cta)}" data-cta><span>${esc(label)}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></a>`;
  const priceBlock = o.price ? `<div class="price" data-reveal><span class="now">${esc(o.price)}</span>${o.originalPrice ? `<s class="was"><span class="sr">Was </span>${esc(o.originalPrice)}</s>` : ''}${discount ? `<span class="save">Save ${discount}%</span>` : ''}</div>` : '';
  const countdown = deadlineMs ? `<div class="cd" data-cd aria-label="Time left on this offer" data-reveal>${['Days', 'Hours', 'Mins', 'Secs'].map((u) => `<div><b data-u="${u[0].toLowerCase()}">00</b><span>${u}</span></div>`).join('')}</div>` : '';
  const fine = `<p class="fine" data-reveal>${deadlineLabel ? `Offer ends <time datetime="${new Date(deadlineMs).toISOString()}" data-deadline-label>${esc(deadlineLabel)}</time>. ` : ''}${terms ? '<a href="#terms">Terms apply.</a>' : ''}</p>`;
  const bigOffer = discount ? `<span class="big">${discount}<sup>%</sup></span><span class="off">OFF</span>` : `<span class="big sm">${esc(c.offer ?? t.eyebrow)}</span>`;
  const card3d = (extra = '') => `<div class="stage ${extra}" data-reveal><div class="card3d" data-tilt>
<div class="face">${img ? `<img src="${esc(img)}" alt="${esc(o.imageAlt ?? c.product)}" class="cimg" fetchpriority="high">` : ''}
<div class="ctop"><span class="mono">${esc(o.brand.slice(0, 1))}</span><span>${esc(t.eyebrow)}</span></div>
<div class="cmid">${bigOffer}</div>
<div class="cbot"><span>${esc(cap(c.product))}</span>${deadlineMs ? '<span class="pill">Ends in <b data-cd-mini>00:00:00</b></span>' : `<span class="pill">${esc(t.ornament)} Limited</span>`}</div>
<div class="sheen"></div></div><div class="shadow"></div></div></div>`;
  const marquee = (cls = '') => {
    const items = c.marquee.map((m) => `<span>${esc(m)}</span><i>${esc(t.ornament)}</i>`).join('');
    return `<div class="marquee ${cls}" aria-hidden="true"><div class="track">${items}${items}${items}${items}</div></div>`;
  };
  const badge = `<div class="badge" aria-hidden="true"><svg viewBox="0 0 200 200"><defs><path id="bp" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0"/></defs><text><textPath href="#bp">${esc(`${c.offer ?? t.eyebrow} ${t.ornament} ${t.eyebrow} ${t.ornament} `.toUpperCase())}</textPath></text></svg><span>${esc(t.ornament)}</span></div>`;
  const kicker = `<span class="eyebrow" data-reveal><i></i>${esc(t.eyebrow)}</span>`;
  const h1 = `<h1 class="kin">${kinetic(c.headline)}</h1>`;
  const sub = `<p class="sub" data-reveal>${esc(c.subheadline)}</p>`;

  const featuresHtml = layout === 'editorial'
    ? `<ol class="numbered">${c.features.map((f, i) => `<li data-reveal style="--d:${i}"><span class="n">${String(i + 1).padStart(2, '0')}</span><div><h3>${esc(f.title)}</h3><p>${esc(f.text)}</p></div></li>`).join('')}</ol>`
    : `<div class="tiles">${c.features.map((f, i) => `<article class="tile spot" data-reveal style="--d:${i}"><span class="ti">${esc(t.ornament)}</span><h3>${esc(f.title)}</h3><p>${esc(f.text)}</p></article>`).join('')}</div>`;

  const sections = `
${c.features.length ? `<section class="sec" aria-labelledby="f-h"><h2 id="f-h" data-reveal>Why ${esc(o.brand)}</h2>${featuresHtml}</section>` : ''}
${testimonials.length ? `<section class="sec" aria-labelledby="t-h"><h2 id="t-h" data-reveal>Loved by customers</h2><div class="tiles">${testimonials.map((r, i) => `<figure class="tile quote spot" data-reveal style="--d:${i}"><blockquote>${esc(r.quote)}</blockquote><figcaption><b>${esc(r.name)}</b>${r.detail ? `<span>${esc(r.detail)}</span>` : ''}</figcaption></figure>`).join('')}</div></section>` : ''}
${c.faq.length ? `<section class="sec narrow" aria-labelledby="q-h"><h2 id="q-h" data-reveal>Questions</h2>${c.faq.map((x) => `<details data-reveal><summary>${esc(x.q)}<i aria-hidden="true"></i></summary><p>${esc(x.a)}</p></details>`).join('')}</section>` : ''}
<section class="final" data-reveal><div class="glow" aria-hidden="true"></div><span class="eyebrow"><i></i>${esc(t.eyebrow)}</span><h2>${esc(c.offer ? cap(c.offer) : c.headline)}</h2>${deadlineMs ? '<p class="sub">Ends in <b data-cd-mini>00:00:00</b></p>' : ''}${btn(c.ctaText, 'lg')}<p class="ended" data-ended hidden>This offer has ended. Thank you for the love.</p></section>`;

  let hero;
  if (layout === 'poster') {
    hero = `<header class="hero poster">${marquee('tilt a')}${marquee('tilt b rev')}
<div class="wrap pgrid"><div class="ptext">${kicker}${h1}${sub}${priceBlock}${countdown}<div class="ctas" data-reveal>${btn(c.ctaText)}</div>${fine}</div>
<div class="pvis">${badge}${card3d()}</div></div></header>`;
  } else if (layout === 'editorial') {
    hero = `<header class="hero editorial"><div class="wrap egrid"><div class="etext">${kicker}${h1}${sub}${priceBlock}${countdown}<div class="ctas" data-reveal>${btn(c.ctaText)}</div>${fine}</div>
<div class="evis"><div class="ghost g1" aria-hidden="true"></div><div class="ghost g2" aria-hidden="true"></div>${card3d()}</div></div></header>${marquee()}`;
  } else if (layout === 'bento') {
    hero = `<header class="hero bento"><div class="wrap bgrid">
<div class="b b-head spot">${kicker}${h1}${sub}<div class="ctas" data-reveal>${btn(c.ctaText)}</div></div>
<div class="b b-card spot">${card3d('flat')}</div>
<div class="b b-cd spot">${deadlineMs ? `<span class="lbl">Time left</span>${countdown}` : `<span class="lbl">Offer</span><p class="bigline">${esc(c.offer ?? t.eyebrow)}</p>`}</div>
<div class="b b-price spot">${o.price ? `<span class="lbl">Today</span>${priceBlock}` : `<span class="lbl">${esc(t.eyebrow)}</span><p class="bigline">${esc(cap(c.product))}</p>`}${fine}</div>
</div></header>${marquee()}`;
  } else {
    hero = `<header class="hero aurora-h"><div class="wrap center">${kicker}${h1}${sub}${priceBlock}${countdown}<div class="ctas" data-reveal>${btn(c.ctaText)}</div>${fine}${card3d('wide')}</div></header>${marquee()}`;
  }

  const sc = layout === 'signature' ? scene({ esc, c, o, t, discount, deadlineMs, deadlineLabel, btn, year, terms }) : null;
  if (sc) { t.particles = sc.particles; fontList.splice(0, 2, ...sc.fonts); }
  const fontsHref = [...new Set(fontList)].map((f) => `family=${f.replace(/ /g, '+')}${FONT_AXES[f] ?? ':wght@400;500;600;700'}`).join('&');

  const css = `
:root{--bg:${t.bg};--surface:${t.surface};--text:${t.text};--muted:${t.muted};--accent:${t.accent};--accent2:${t.accent2};--accent-text:${t.accentText};--border:${t.border};--g1:${t.glow[0]};--g2:${t.glow[1]};--g3:${t.glow[2]};--display:'${t.display}',Georgia,serif;--body:'${t.body}',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;--r:22px;--ease:cubic-bezier(.2,.7,.2,1)}
*{box-sizing:border-box}html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--text);font:400 17px/1.6 var(--body);-webkit-font-smoothing:antialiased;overflow-x:hidden}
a{color:inherit}img{max-width:100%;display:block}.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.wrap{width:min(1180px,100% - 40px);margin-inline:auto}
/* background layers */
.bgfx{position:fixed;inset:0;z-index:-2;overflow:hidden;pointer-events:none}
.blob{position:absolute;width:52vmax;height:52vmax;border-radius:50%;filter:blur(90px);opacity:.38;mix-blend-mode:screen;animation:drift 22s var(--ease) infinite alternate}
.blob.b1{background:var(--g1);top:-22vmax;left:-12vmax}.blob.b2{background:var(--g2);top:10vmax;right:-20vmax;animation-duration:28s;animation-delay:-6s}.blob.b3{background:var(--g3);bottom:-28vmax;left:18vmax;animation-duration:34s;animation-delay:-12s;opacity:.3}
@keyframes drift{0%{transform:translate(0,0) scale(1)}50%{transform:translate(6vmax,4vmax) scale(1.15)}100%{transform:translate(-4vmax,8vmax) scale(.92)}}
.floor{position:absolute;left:-50%;right:-50%;bottom:-10vh;height:70vh;background-image:linear-gradient(var(--accent) 1px,transparent 1px),linear-gradient(90deg,var(--accent) 1px,transparent 1px);background-size:60px 60px;transform:perspective(500px) rotateX(70deg);transform-origin:bottom;opacity:.16;mask-image:linear-gradient(to top,#000 10%,transparent 85%);-webkit-mask-image:linear-gradient(to top,#000 10%,transparent 85%);animation:floor 3s linear infinite}
@keyframes floor{to{background-position:0 60px}}
.grain{position:fixed;inset:-50%;z-index:-1;pointer-events:none;opacity:.07;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");animation:grain 1.2s steps(6) infinite}
@keyframes grain{0%{transform:translate(0,0)}33%{transform:translate(-3%,2%)}66%{transform:translate(2%,-3%)}100%{transform:translate(0,0)}}
canvas#fx{position:fixed;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none}
/* top bar + nav */
.bar{position:relative;z-index:2;text-align:center;font-weight:600;font-size:14px;padding:10px 16px;background:linear-gradient(90deg,var(--accent),var(--accent2));color:var(--accent-text);letter-spacing:.01em}
.bar b{font-variant-numeric:tabular-nums}
nav.top{position:sticky;top:0;z-index:20;backdrop-filter:blur(14px) saturate(140%);-webkit-backdrop-filter:blur(14px) saturate(140%);background:color-mix(in srgb,var(--bg) 62%,transparent);border-bottom:1px solid var(--border)}
nav.top .wrap{display:flex;align-items:center;justify-content:space-between;height:66px}
.logo{display:flex;align-items:center;gap:10px;font:700 19px/1 var(--body);text-decoration:none;letter-spacing:-.01em}
.logo .m{width:32px;height:32px;border-radius:10px;display:grid;place-items:center;background:linear-gradient(135deg,var(--accent),var(--accent2));color:var(--accent-text);font:800 16px/1 var(--display)}
/* type */
.eyebrow{display:inline-flex;align-items:center;gap:10px;font-size:13px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);margin-bottom:22px}
.eyebrow i{width:28px;height:2px;background:currentColor;border-radius:2px}
h1{font:400 clamp(44px,7.4vw,104px)/.95 var(--display);letter-spacing:-.02em;margin:0 0 24px;text-wrap:balance}
.kin .w{display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.08em}
.kin .w>span{display:inline-block;transform:translateY(105%);filter:blur(8px);opacity:0;animation:rise .9s var(--ease) forwards;animation-delay:calc(var(--i) * 70ms + 150ms)}
@keyframes rise{to{transform:none;filter:none;opacity:1}}
.sub{font-size:clamp(18px,2vw,21px);color:var(--muted);margin:0 0 28px;max-width:36em;text-wrap:pretty}
h2{font:400 clamp(34px,4.6vw,60px)/1.02 var(--display);letter-spacing:-.015em;margin:0 0 36px;text-wrap:balance}
/* price + countdown */
.price{display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;margin-bottom:24px}
.price .now{font:400 clamp(40px,5vw,56px)/1 var(--display)}.price .was{color:var(--muted);font-size:20px}
.save{font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;padding:6px 12px;border-radius:999px;background:color-mix(in srgb,var(--accent) 16%,transparent);color:var(--accent);border:1px solid color-mix(in srgb,var(--accent) 40%,transparent)}
.cd{display:flex;gap:10px;margin:0 0 30px}
.cd div{min-width:76px;padding:12px 8px 10px;text-align:center;border-radius:16px;background:color-mix(in srgb,var(--surface) 80%,transparent);border:1px solid var(--border);backdrop-filter:blur(8px)}
.cd b{display:block;font:400 32px/1 var(--display);font-variant-numeric:tabular-nums;transition:transform .3s var(--ease)}
.cd b.tick{animation:tick .45s var(--ease)}@keyframes tick{0%{transform:translateY(-30%);opacity:.2}100%{transform:none;opacity:1}}
.cd span{display:block;margin-top:6px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
/* buttons */
.ctas{display:flex;gap:12px;flex-wrap:wrap}
.btn{position:relative;isolation:isolate;overflow:hidden;display:inline-flex;align-items:center;gap:12px;min-height:56px;padding:0 30px;border-radius:999px;background:linear-gradient(135deg,var(--accent),color-mix(in srgb,var(--accent) 70%,var(--accent2)));color:var(--accent-text);font-weight:700;font-size:17px;text-decoration:none;box-shadow:0 10px 40px -10px var(--accent),inset 0 1px 0 rgba(255,255,255,.35);transition:transform .25s var(--ease),box-shadow .25s var(--ease)}
.btn svg{width:20px;height:20px;transition:transform .25s var(--ease)}
.btn::after{content:'';position:absolute;inset:0;z-index:-1;background:linear-gradient(110deg,transparent 30%,rgba(255,255,255,.55) 50%,transparent 70%);transform:translateX(-120%);animation:shine 3.2s var(--ease) infinite 1.2s}
@keyframes shine{0%,60%{transform:translateX(-120%)}100%{transform:translateX(120%)}}
.btn:hover{transform:translateY(-2px);box-shadow:0 16px 50px -10px var(--accent),inset 0 1px 0 rgba(255,255,255,.35)}.btn:hover svg{transform:translateX(4px)}
.btn:focus-visible,summary:focus-visible{outline:3px solid var(--text);outline-offset:4px}
.btn.lg{min-height:64px;padding:0 38px;font-size:19px}
.btn[aria-disabled=true]{opacity:.45;pointer-events:none;filter:grayscale(1)}
.fine{font-size:14px;color:var(--muted);margin:16px 0 0}
/* 3D offer card */
.stage{perspective:1200px;display:grid;place-items:center;position:relative}
.card3d{position:relative;width:min(420px,86vw);aspect-ratio:4/5;transform-style:preserve-3d;transition:transform .5s var(--ease);animation:float 7s ease-in-out infinite}
.stage.wide .card3d{width:min(560px,90vw);aspect-ratio:16/10;margin-top:64px}
.stage.flat .card3d{width:100%;aspect-ratio:auto;min-height:340px;animation:none}
@keyframes float{0%,100%{translate:0 0}50%{translate:0 -14px}}
.face{position:absolute;inset:0;border-radius:28px;overflow:hidden;padding:28px;display:flex;flex-direction:column;justify-content:space-between;background:radial-gradient(120% 90% at 0% 0%,color-mix(in srgb,var(--g1) 55%,transparent),transparent 60%),radial-gradient(100% 80% at 100% 100%,color-mix(in srgb,var(--g2) 50%,transparent),transparent 60%),linear-gradient(160deg,color-mix(in srgb,var(--surface) 92%,#fff 8%),var(--surface));border:1px solid color-mix(in srgb,var(--accent) 35%,transparent);box-shadow:0 40px 80px -30px rgba(0,0,0,.7),inset 0 1px 0 rgba(255,255,255,.18);transform:translateZ(0)}
.stage.flat .face{position:relative;min-height:340px}
.cimg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.55;mix-blend-mode:luminosity}
.ctop,.cbot{position:relative;display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:13px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;transform:translateZ(40px)}
.cbot{letter-spacing:.04em;text-transform:none;font-size:15px;flex-wrap:wrap}
.mono{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:var(--accent);color:var(--accent-text);font:400 20px/1 var(--display);letter-spacing:0}
.cmid{position:relative;display:flex;align-items:flex-end;gap:12px;transform:translateZ(70px)}
.big{font:400 clamp(96px,16vw,180px)/.82 var(--display);letter-spacing:-.04em;background:linear-gradient(180deg,var(--text),color-mix(in srgb,var(--accent) 80%,var(--text)));-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 10px 30px color-mix(in srgb,var(--accent) 40%,transparent))}
.big sup{font-size:.42em;vertical-align:top;position:relative;top:.12em}
.big.sm{font-size:clamp(44px,6vw,72px);line-height:1}
.off{font:400 clamp(28px,4vw,44px)/1 var(--display);color:var(--accent);margin-bottom:.3em;letter-spacing:.06em}
.pill{display:inline-flex;gap:6px;align-items:center;padding:7px 12px;border-radius:999px;background:rgba(0,0,0,.28);border:1px solid var(--border);font-size:13px;backdrop-filter:blur(6px)}
.pill b{font-variant-numeric:tabular-nums}
.sheen{position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:radial-gradient(circle at var(--mx,30%) var(--my,20%),rgba(255,255,255,.28),transparent 45%),linear-gradient(115deg,transparent 35%,color-mix(in srgb,var(--accent2) 30%,transparent) 48%,color-mix(in srgb,var(--accent) 25%,transparent) 52%,transparent 65%);background-size:100% 100%,250% 250%;background-position:0 0,var(--sx,0%) 0;mix-blend-mode:overlay;opacity:.9}
.shadow{position:absolute;left:10%;right:10%;bottom:-40px;height:40px;background:radial-gradient(closest-side,rgba(0,0,0,.55),transparent);filter:blur(10px);transform:translateZ(-60px)}
/* marquee */
.marquee{overflow:hidden;border-block:1px solid var(--border);background:color-mix(in srgb,var(--surface) 70%,transparent);padding:16px 0;white-space:nowrap}
.marquee .track{display:inline-flex;gap:28px;align-items:center;animation:mq 38s linear infinite;font:400 clamp(20px,2.4vw,28px)/1 var(--display);text-transform:uppercase;letter-spacing:.04em}
.marquee i{font-style:normal;color:var(--accent)}
.marquee.rev .track{animation-direction:reverse}
@keyframes mq{to{transform:translateX(-50%)}}
/* sections */
main{position:relative}
.sec{width:min(1180px,100% - 40px);margin-inline:auto;padding:110px 0 40px}
.sec.narrow{max-width:820px}
.tiles{display:grid;gap:18px}@media(min-width:780px){.tiles{grid-template-columns:repeat(3,1fr)}}
.tile{position:relative;padding:30px;border-radius:var(--r);background:color-mix(in srgb,var(--surface) 82%,transparent);border:1px solid var(--border);backdrop-filter:blur(10px);overflow:hidden;transition:transform .35s var(--ease),border-color .35s}
.tile:hover{transform:translateY(-4px);border-color:color-mix(in srgb,var(--accent) 45%,transparent)}
.tile h3{margin:14px 0 8px;font-size:21px;line-height:1.25}.tile p{margin:0;color:var(--muted)}
.ti{font-size:22px;color:var(--accent)}
.spot::before{content:'';position:absolute;inset:0;pointer-events:none;background:radial-gradient(420px circle at var(--x,-100px) var(--y,-100px),color-mix(in srgb,var(--accent) 16%,transparent),transparent 60%);transition:opacity .3s}
.quote blockquote{margin:0;font:400 22px/1.4 var(--display)}.quote figcaption{margin-top:18px;display:flex;flex-direction:column;font-size:15px}.quote figcaption span{color:var(--muted)}
.numbered{list-style:none;margin:0;padding:0;display:grid;gap:4px}
.numbered li{display:grid;grid-template-columns:100px 1fr;gap:24px;align-items:baseline;padding:28px 0;border-top:1px solid var(--border)}
.numbered .n{font:400 64px/1 var(--display);color:transparent;-webkit-text-stroke:1.5px var(--accent)}
.numbered h3{margin:0 0 8px;font-size:24px}.numbered p{margin:0;color:var(--muted);max-width:40em}
@media(max-width:600px){.numbered li{grid-template-columns:64px 1fr;gap:14px}.numbered .n{font-size:44px}}
details{border-bottom:1px solid var(--border);padding:22px 0}
summary{cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;gap:20px;font-size:19px;font-weight:600}
summary::-webkit-details-marker{display:none}
summary i{position:relative;flex:none;width:30px;height:30px;border-radius:50%;border:1px solid var(--border)}
summary i::before,summary i::after{content:'';position:absolute;left:50%;top:50%;width:12px;height:2px;background:var(--accent);translate:-50% -50%;transition:transform .3s var(--ease)}
summary i::after{transform:rotate(90deg)}details[open] summary i::after{transform:rotate(0)}
details p{color:var(--muted);margin:14px 0 0;max-width:46em}
.final{position:relative;text-align:center;width:min(1180px,100% - 40px);margin:110px auto 0;padding:96px 24px;border-radius:36px;overflow:hidden;border:1px solid var(--border);background:color-mix(in srgb,var(--surface) 75%,transparent)}
.final .glow{position:absolute;inset:-40%;z-index:-1;background:conic-gradient(from 0deg,var(--g1),var(--g2),var(--g3),var(--g1));filter:blur(80px);opacity:.35;animation:spin 18s linear infinite}
@keyframes spin{to{transform:rotate(1turn)}}
.final h2{max-width:14em;margin-inline:auto}.final .sub{margin-inline:auto}
.ended{margin-top:18px;color:var(--muted)}
footer.legal{width:min(1180px,100% - 40px);margin:0 auto;padding:56px 0 130px;font-size:14px;color:var(--muted)}
/* layout: aurora */
.aurora-h{padding:clamp(56px,9vw,120px) 0 80px}.center{text-align:center;display:flex;flex-direction:column;align-items:center}
.center .sub{margin-inline:auto}.center .cd,.center .price,.center .ctas{justify-content:center}
/* layout: editorial */
.editorial{padding:clamp(48px,7vw,100px) 0 100px}
.egrid{display:grid;gap:56px;align-items:center}@media(min-width:980px){.egrid{grid-template-columns:1.1fr .9fr}}
.editorial h1{font-style:italic}
.evis{position:relative;min-height:520px;display:grid;place-items:center}
.ghost{position:absolute;width:min(380px,76vw);aspect-ratio:4/5;border-radius:28px;border:1px solid var(--border);background:linear-gradient(160deg,color-mix(in srgb,var(--g1) 30%,var(--surface)),var(--surface));opacity:.55}
.ghost.g1{transform:rotate(-9deg) translate(-40px,20px)}.ghost.g2{transform:rotate(7deg) translate(46px,-10px);background:linear-gradient(160deg,color-mix(in srgb,var(--g2) 30%,var(--surface)),var(--surface))}
/* layout: poster */
.poster{position:relative;padding:0 0 100px;overflow:hidden}
.marquee.tilt{position:relative;z-index:1;border:0;padding:18px 0}
.marquee.tilt.a{transform:rotate(-3deg) scale(1.06);margin-top:40px;background:var(--accent);color:var(--accent-text)}
.marquee.tilt.a i{color:var(--accent-text)}
.marquee.tilt.b{transform:rotate(2.2deg) scale(1.06);margin-top:-30px;background:var(--surface);border-block:1px solid var(--border)}
.pgrid{display:grid;gap:40px;align-items:center;padding-top:72px}@media(min-width:980px){.pgrid{grid-template-columns:1.15fr .85fr}}
.poster h1{font-size:clamp(64px,10.5vw,168px);line-height:.86;text-transform:uppercase;letter-spacing:-.01em}
.poster h1 .w:nth-child(even)>span{color:transparent;-webkit-text-stroke:2px var(--text)}
.pvis{position:relative;display:grid;place-items:center;min-height:500px}
.badge{position:absolute;top:-10px;right:0;z-index:3;width:150px;height:150px;display:grid;place-items:center;border-radius:50%;background:var(--accent2);color:var(--accent-text);box-shadow:0 20px 50px -15px var(--accent2)}
.badge svg{position:absolute;inset:0;width:100%;height:100%;animation:spin 14s linear infinite}
.badge text{font:700 15.5px var(--body);letter-spacing:3px;fill:currentColor}.badge span{font-size:34px}
/* layout: bento */
.bento{padding:40px 0 80px}
.bgrid{display:grid;gap:16px}
@media(min-width:900px){.bgrid{grid-template-columns:repeat(6,1fr);grid-auto-rows:minmax(150px,auto)}.b-head{grid-column:span 4;grid-row:span 2}.b-card{grid-column:span 2;grid-row:span 3}.b-cd{grid-column:span 2}.b-price{grid-column:span 2}}
.b{position:relative;border-radius:28px;padding:32px;background:color-mix(in srgb,var(--surface) 80%,transparent);border:1px solid var(--border);backdrop-filter:blur(12px);overflow:hidden}
.b-head h1{font-size:clamp(44px,6vw,88px)}
.b-card{padding:14px;display:flex}.b-card .stage{flex:1}.b-card .face{border-radius:20px}
.b .cd{margin:0;flex-wrap:wrap}.b .cd div{min-width:64px}.b .price{margin:0}
.lbl{display:block;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin-bottom:14px}
.bigline{font:400 clamp(28px,3vw,40px)/1.05 var(--display);margin:0}
/* sticky mobile CTA */
.sticky{position:fixed;left:12px;right:12px;bottom:12px;z-index:30;padding:10px 10px 10px 18px;border-radius:999px;display:flex;gap:12px;align-items:center;justify-content:space-between;background:color-mix(in srgb,var(--surface) 85%,transparent);backdrop-filter:blur(16px);border:1px solid var(--border);box-shadow:0 20px 40px -10px rgba(0,0,0,.6);transform:translateY(140%);transition:transform .4s var(--ease)}
.sticky.show{transform:none}.sticky .btn{min-height:46px;padding:0 20px;font-size:15px}.sticky small{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
@media(min-width:900px){.sticky{display:none}footer.legal{padding-bottom:56px}}
/* reveal */
[data-reveal]{opacity:0;transform:translateY(28px);transition:opacity .9s var(--ease),transform .9s var(--ease);transition-delay:calc(var(--d,0) * 90ms)}
[data-reveal].in{opacity:1;transform:none}
@media(max-width:600px){.cd div{min-width:0;flex:1}.badge{width:110px;height:110px}.badge text{font-size:12px}.evis,.pvis{min-height:420px}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}.kin .w>span{transform:none;filter:none;opacity:1}[data-reveal]{opacity:1;transform:none}}
.no-fx .card3d{animation:none}
`;

  const js = `
(function(){
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,fx=${effects ? 'true' : 'false'}&&!reduce;
var $=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
if(!fx)document.documentElement.classList.add('no-fx');
/* reveal on scroll */
if('IntersectionObserver' in window&&!reduce){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -40px 0px'});$$('[data-reveal]').forEach(function(el){io.observe(el)})}else{$$('[data-reveal]').forEach(function(el){el.classList.add('in')})}
/* 3D tilt + sheen */
if(fx&&matchMedia('(hover:hover)').matches){$$('[data-tilt]').forEach(function(card){var st=card.parentNode;st.addEventListener('pointermove',function(e){var r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;card.style.transform='rotateY('+((x-.5)*22)+'deg) rotateX('+((.5-y)*18)+'deg)';card.style.setProperty('--mx',x*100+'%');card.style.setProperty('--my',y*100+'%');card.style.setProperty('--sx',x*100+'%')});st.addEventListener('pointerleave',function(){card.style.transform=''})})}
else if(fx){var t0=Date.now();(function sway(){$$('[data-tilt]').forEach(function(c){var t=(Date.now()-t0)/1000;c.style.transform='rotateY('+Math.sin(t*.6)*10+'deg) rotateX('+Math.cos(t*.5)*6+'deg)';c.style.setProperty('--sx',(50+Math.sin(t*.6)*50)+'%')});requestAnimationFrame(sway)})()}
/* spotlight */
$$('.spot').forEach(function(el){el.addEventListener('pointermove',function(e){var r=el.getBoundingClientRect();el.style.setProperty('--x',e.clientX-r.left+'px');el.style.setProperty('--y',e.clientY-r.top+'px')})});
/* sticky CTA */
var sticky=$('[data-sticky]');addEventListener('scroll',function(){sticky.classList.toggle('show',scrollY>600)},{passive:true});
${sc ? sc.js : ''}
${deadlineMs ? `/* countdown */
var end=${deadlineMs},p=function(n){return String(n).padStart(2,'0')},prev={};
var lbl=$('[data-deadline-label]');try{if(lbl)lbl.textContent=new Date(end).toLocaleString(undefined,{weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'})}catch(e){}
function tick(){var ms=end-Date.now();if(ms<=0){$$('[data-cd]').forEach(function(c){c.hidden=true});var bar=$('[data-bar]');if(bar)bar.textContent='This offer has ended';$$('[data-cd-mini]').forEach(function(m){m.textContent='Ended'});$$('[data-cta]').forEach(function(a){a.setAttribute('aria-disabled','true');a.removeAttribute('href')});var en=$('[data-ended]');if(en)en.hidden=false;return}
var v={d:Math.floor(ms/864e5),h:Math.floor(ms%864e5/36e5),m:Math.floor(ms%36e5/6e4),s:Math.floor(ms%6e4/1e3)};
['d','h','m','s'].forEach(function(k){$$('[data-u="'+k+'"]').forEach(function(b){var t=p(v[k]);if(b.textContent!==t){b.textContent=t;if(!reduce){b.classList.remove('tick');void b.offsetWidth;b.classList.add('tick')}}})});
var mini=(v.d?v.d+'d ':'')+p(v.h)+':'+p(v.m)+':'+p(v.s);$$('[data-cd-mini]').forEach(function(m){m.textContent=mini});setTimeout(tick,1000)}
tick();` : ''}
/* particles */
var kind='${t.particles}';if(!fx||kind==='none'||!$('#fx'))return;var cv=$('#fx'),ctx=cv.getContext('2d'),W,H,DPR=Math.min(devicePixelRatio||1,2),P=[],cols=['${t.accent}','${t.accent2}','${t.glow[0]}','${t.text}'];
function size(){W=cv.width=innerWidth*DPR;H=cv.height=innerHeight*DPR}size();addEventListener('resize',size);
var N=Math.round(Math.min(140,innerWidth*innerHeight/(kind==='stars'?9000:14000)));
function R(a,b){return a+Math.random()*(b-a)}
function make(init){var o={x:R(0,W),y:init?R(0,H):(kind==='embers'?H+10:-10),r:R(1,3)*DPR,a:R(.3,.9),ph:R(0,6.28),c:cols[Math.floor(R(0,cols.length))]};
if(kind==='snow'){o.vy=R(.3,1.1)*DPR;o.vx=R(-.2,.2)*DPR;o.r=R(1,3.4)*DPR;o.c='#ffffff'}
else if(kind==='embers'){o.vy=-R(.3,1.2)*DPR;o.vx=R(-.25,.25)*DPR;o.r=R(.8,2.4)*DPR;o.c=cols[Math.floor(R(0,2))]}
else if(kind==='confetti'){o.vy=R(.6,1.6)*DPR;o.vx=R(-.4,.4)*DPR;o.w=R(4,9)*DPR;o.h=R(8,14)*DPR;o.rot=R(0,6.28);o.vr=R(-.05,.05)}
else if(kind==='leaves'){o.vy=R(.4,1)*DPR;o.vx=R(-.3,.3)*DPR;o.w=R(6,11)*DPR;o.h=o.w*.55;o.rot=R(0,6.28);o.vr=R(-.02,.02);o.c=['#b45309','#d97706','#92400e','#ca8a04'][Math.floor(R(0,4))]}
else if(kind==='stars'){o.vy=0;o.vx=0;o.r=R(.5,1.8)*DPR}
else{o.vy=R(-.15,.15)*DPR;o.vx=R(-.15,.15)*DPR;o.r=R(.6,1.8)*DPR}return o}
if(kind==='fireworks'){var S=[],B=[],gold=['#e6c36a','#fff3c4','#c4b5fd','#f0abfc','#7dd3fc'];
window.__burst=function(x,y){var cx=x*DPR,cy=y*DPR,col=gold[Math.floor(R(0,gold.length))],n=70;for(var i=0;i<n;i++){var a=i/n*6.283,sp=R(1.5,4.6)*DPR;S.push({x:cx,y:cy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,l:1,c:Math.random()<.25?'#fff':col})}};
function auto(){if(!document.hidden)window.__burst(R(.15,.85)*innerWidth,R(.12,.45)*innerHeight);setTimeout(auto,R(900,1900))}setTimeout(auto,600);
for(var j=0;j<40;j++)B.push({x:R(0,W),y:R(0,H),r:R(1,3)*DPR,v:R(.3,.9)*DPR,ph:R(0,6.28)});
(function fw(){ctx.globalCompositeOperation='destination-out';ctx.fillStyle='rgba(0,0,0,.22)';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='lighter';var t=Date.now()/1000;
for(var i=S.length-1;i>=0;i--){var s=S[i];s.vx*=.985;s.vy=s.vy*.985+.045*DPR;s.x+=s.vx;s.y+=s.vy;s.l-=.012;if(s.l<=0){S.splice(i,1);continue}ctx.globalAlpha=s.l;ctx.fillStyle=s.c;ctx.beginPath();ctx.arc(s.x,s.y,1.6*DPR,0,6.28);ctx.fill()}
ctx.strokeStyle='#e6c36a';for(var k=0;k<B.length;k++){var b=B[k];b.y-=b.v;b.x+=Math.sin(t*2+b.ph)*.3;if(b.y<-10){b.y=H+10;b.x=R(0,W)}ctx.globalAlpha=.35;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,6.28);ctx.stroke()}
requestAnimationFrame(fw)})();return}
for(var i=0;i<N;i++)P.push(make(true));
var run=true;document.addEventListener('visibilitychange',function(){run=!document.hidden;if(run)loop()});
function loop(){if(!run)return;ctx.clearRect(0,0,W,H);var t=Date.now()/1000;
ctx.globalCompositeOperation=(kind==='embers'||kind==='dust'||kind==='stars')?'lighter':'source-over';
for(var i=0;i<P.length;i++){var o=P[i];o.x+=o.vx+(kind==='snow'||kind==='leaves'?Math.sin(t+o.ph)*.35*DPR:0);o.y+=o.vy;
if(o.y>H+20||o.y<-20||o.x<-20||o.x>W+20){if(kind==='dust'){o.x=R(0,W);o.y=R(0,H)}else P[i]=make(false);continue}
var al=kind==='stars'||kind==='dust'?o.a*(.5+.5*Math.sin(t*2+o.ph)):kind==='embers'?o.a*(.6+.4*Math.sin(t*6+o.ph)):o.a;ctx.globalAlpha=al;ctx.fillStyle=o.c;
if(o.w){o.rot+=o.vr;ctx.save();ctx.translate(o.x,o.y);ctx.rotate(o.rot);if(kind==='leaves'){ctx.beginPath();ctx.ellipse(0,0,o.w,o.h,0,0,6.28);ctx.fill()}else{ctx.scale(1,Math.cos(t*3+o.ph));ctx.fillRect(-o.w/2,-o.h/2,o.w,o.h)}ctx.restore()}
else{ctx.beginPath();ctx.arc(o.x,o.y,o.r,0,6.28);ctx.fill();if(kind==='embers'){ctx.globalAlpha=al*.25;ctx.beginPath();ctx.arc(o.x,o.y,o.r*3.5,0,6.28);ctx.fill()}}}
requestAnimationFrame(loop)}loop();
})();`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(c.subheadline)}">
<meta name="theme-color" content="${t.bg}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(c.subheadline)}">
<meta property="og:type" content="website">
${img ? `<meta property="og:image" content="${esc(img)}">\n<meta name="twitter:card" content="summary_large_image">` : '<meta name="twitter:card" content="summary">'}
${o.pageUrl ? `<link rel="canonical" href="${esc(safeUrl(o.pageUrl))}">` : ''}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?${fontsHref}&display=swap" rel="stylesheet">
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>` : ''}
<style>${css}${sc ? sc.css : ''}</style>
</head>
<body class="layout-${layout} theme-${themeKey}">
${sc ? '' : `<div class="bgfx" aria-hidden="true"><div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div>${t.floor ? '<div class="floor"></div>' : ''}</div>`}
<div class="grain" aria-hidden="true"></div>
${effects && t.particles !== 'none' ? '<canvas id="fx" aria-hidden="true"></canvas>' : ''}
${deadlineMs ? `<div class="bar" role="status" data-bar>${esc(c.offer ? cap(c.offer) : t.eyebrow)} ends in <b data-cd-mini>00:00:00</b></div>` : c.offer ? `<div class="bar">${esc(cap(c.offer))}</div>` : ''}
<nav class="top"><div class="wrap"><a class="logo" href="#"><span class="m">${esc(o.brand.slice(0, 1).toUpperCase())}</span>${esc(o.brand)}</a>${btn(c.ctaText).replace('class="btn ', 'style="min-height:44px;padding:0 20px;font-size:15px" class="btn ')}</div></nav>
<main>
${sc ? sc.body : `${hero}
${sections}`}
</main>
<footer class="legal">${terms ? `<p id="terms"><strong>Offer terms.</strong> ${esc(terms)}</p>` : ''}<p>© ${new Date().getFullYear()} ${esc(o.brand)}</p></footer>
<div class="sticky" data-sticky><small>${esc(c.offer ? cap(c.offer) : o.brand)}</small>${btn(c.ctaText)}</div>
<script>${js}</script>
</body>
</html>
`;
}

// Copy the page generated, so the assistant can show and refine it.
export function describeLanding(o) {
  const themeKey = THEMES[o.theme] ? o.theme : 'default';
  const t = THEMES[themeKey];
  const discount = discountOf(o);
  const deadlineMs = o.deadline ? Date.parse(o.deadline) : null;
  const c = writeCopy(o, themeKey, t, discount, deadlineMs ? fmtDeadline(deadlineMs, o.timeZone) : null);
  const cls = classifyNiche(`${o.niche ?? ''} ${o.product ?? ''}`);
  const legacy = ['signature', 'aurora', 'editorial', 'poster', 'bento'].includes(o.layout);
  const hasMedia = Boolean(o.images?.length || o.productImage || o.videoUrl || o.modelUrl);
  let layout = LAYOUTS.includes(o.layout) ? o.layout : SCENES[themeKey] ? 'signature' : t.layout;
  if (layout === 'signature' && !SCENES[themeKey]) layout = t.layout;
  if (o.layout === 'director' || (!legacy && (cls.id !== 'general' || hasMedia))) layout = `director:${archetypeFor(cls.id)}`;
  return { theme: themeKey, layout, effects: o.effects !== false ? t.particles : 'off', headline: c.headline, subheadline: c.subheadline, ctaText: c.ctaText, features: c.features, faq: c.faq };
}
