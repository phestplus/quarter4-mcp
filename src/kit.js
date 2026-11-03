// Content kit: ready-to-post graphics with captions on one review page.
// Every graphic is built at its real platform size in HTML/CSS, previewed scaled down, and exported
// to PNG in the browser (html-to-image). No auto-posting: the page offers the phone's share sheet
// (Instagram, TikTok, WhatsApp with the image attached), share links, copy caption and download.
import { THEMES, readableOn, discountOf } from './landing.js';
import { classifyNiche, NICHES } from './niches.js';
import { hookDeck } from './hooks.js';
import { captionsFor } from './captions.js';
import { brandTheme, brandTokens, hasBrandLook } from './brand.js';
import { displayNameOf, offerTypeOf } from './offer.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const hex = (c) => (typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c) ? c : null);

export const KIT_FORMATS = {
  post: { w: 1080, h: 1350, label: 'Instagram / Facebook post (4:5)', platforms: ['instagram', 'facebook'] },
  square: { w: 1080, h: 1080, label: 'Square post (1:1)', platforms: ['instagram', 'facebook', 'linkedin'] },
  story: { w: 1080, h: 1920, label: 'Story, Status, Reels cover (9:16)', platforms: ['instagram', 'whatsapp', 'tiktok'] },
  wide: { w: 1600, h: 900, label: 'X / LinkedIn (16:9)', platforms: ['x', 'linkedin'] },
};

function deadlineText(deadline, timeZone) {
  if (!deadline) return null;
  const d = new Date(deadline);
  if (Number.isNaN(d.getTime())) return null;
  return `Ends ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: timeZone || 'UTC' })}`;
}

/**
 * @param {object} o { brand, product, niche, theme, offer, discountPercent, price, originalPrice, deadline, timeZone,
 *   ctaUrl, pageUrl, products: [{name, price, originalPrice, image}], images: [{url, alt, credit}], logoUrl, brandColor,
 *   posts: [{format, headline, sub, caption, image}] (optional overrides written by the AI), watermark, proxy }
 * @returns {{ html: string, posts: object[], images: string[] }}
 */
export function buildKit(o) {
  if (!o.brand) throw new Error('Send "brand".');
  const nicheId = NICHES[o.nicheId] ? o.nicheId : classifyNiche(`${o.niche ?? ''} ${o.product ?? ''}`).id;
  const niche = NICHES[nicheId];
  const rawProduct = o.product || 'our products';
  const offerType = o.offerType ?? offerTypeOf(nicheId, `${o.niche ?? ''} ${o.product ?? ''}`);
  const product = displayNameOf(o, rawProduct);
  let t = { ...(THEMES[o.theme] ?? THEMES.default) };
  if (hasBrandLook(brandTokens(o))) t = brandTheme(t, brandTokens(o));
  const brandColor = hex(o.brandColor);
  if (brandColor) { t.accent = brandColor; t.accentText = readableOn(brandColor); }
  const off = discountOf(o);
  const offTxt = off ? `${off}% off` : null;
  const ends = deadlineText(o.deadline, o.timeZone);
  const event = THEMES[o.theme] ? t.eyebrow : null;
  const link = o.pageUrl || o.ctaUrl || '';
  const deck = hookDeck({ nicheHooks: niche.hooks, product, discount: off ? `${off}%` : null, brand: o.brand, seed: o.brand.length, offerType });
  const products = (o.products ?? []).filter((p) => p?.name).slice(0, 6);
  const photos = (o.images ?? []).filter((im) => im?.url);
  const imgs = [];
  const img = (url) => { if (!url) return null; if (!imgs.includes(url)) imgs.push(url); return o.proxy ? o.proxy(url, imgs.indexOf(url)) : url; };
  // Hashtags only from short names: a squashed product phrase (#BrandPremiumandFamilyyearlyplans) reads as spam.
  const tag = (t) => { const h = String(t ?? '').replace(/[^a-z0-9]/gi, ''); return h.length > 2 && h.length <= 20 ? `#${h}` : null; };
  const tags = [tag(o.brand), event ? tag(event) : null, product.split(/\s+/).length <= 2 ? tag(product) : null].filter(Boolean);

  const isWhatsApp = /wa\.me|whatsapp/i.test(link);
  const caps = (hook, kind, items, apps) => { const all = captionsFor({ hook, brand: o.brand, product, event, offTxt, ends, link, isWhatsApp, items, tags, kind, offerType }); return Object.fromEntries(apps.map((k) => [k, all[k]])); };


  // Posts: offer, product spotlights, carousel, story, last call, wide card. AI overrides win.
  const posts = [];
  // Truth rule: a product is only ever shown with the seller's own photo of it. Without one the
  // graphic waits for an upload (Share/Download stay off). Mood posts use matched real photos or type.
  const pIdx = (p) => products.indexOf(p);
  const photo = (url, alt, cls, key, representative = false) => `<div class="ph ${cls}${representative ? ' rep' : ''}" data-p="${key}"><img src="${esc(img(url))}" alt="${esc(alt ?? product)}" crossorigin="anonymous" onerror="this.parentNode.classList.add('need');this.remove()"><span class="need-l">Add a photo</span>${representative ? '<span class="rep-l">Representative image</span>' : ''}</div>`;
  const need = (p, cls) => `<div class="np ${cls}" aria-hidden="true"><span>${esc(p.name)}</span></div>`;
  const bigWord = off ? `${off}%` : (product.split(' ').pop() || o.brand).toUpperCase();
  // Condensed display faces run about 0.5em per character; size the statement to the frame width.
  const typo = (cls, frameW) => `<div class="ty ${cls}" aria-hidden="true" style="font-size:${Math.min(560, Math.floor(frameW / (bigWord.length * 0.52)))}px"><span>${esc(bigWord)}</span>${off ? '<em>off</em>' : ''}</div>`;
  const typeLed = !photos.length;
  let moodN = 0;
  const visual = (p, cls = '', frameW = 936) => (p ? (p.image ? photo(p.image, p.name, cls, pIdx(p), p.representative) : need(p, cls)) : photos.length ? photo(photos[moodN % photos.length].url, photos[moodN++ % photos.length].alt, cls, `m${moodN}`) : typo(cls, frameW));
  const priceRow = o.price ? `<p class="g-pr"><b>${esc(o.price)}</b>${o.originalPrice ? `<s>${esc(o.originalPrice)}</s>` : ''}</p>` : '';
  // With a photo, the photo is the focal point and the offer is the headline. Without one, the offer
  // itself is the focal point, so the headline is not repeated: price and end date support it.
  const offerHead = (fallback) => (typeLed && off ? '' : `<h2 class="g-h">${esc(offTxt ? offTxt.toUpperCase() : fallback)}</h2>`);
  const head = (h) => `<div class="g-top"><span class="g-brand">${o.logoUrl ? `<img src="${esc(img(o.logoUrl))}" alt="">` : esc(o.brand)}</span>${event ? `<span class="g-ev">${esc(event)}</span>` : ''}</div>${h}`;
  const wm = '<div class="q4wm">Made with Quarter4</div>';

  const h1 = deck.next('launch', event);
  posts.push({ id: 'offer', format: 'post', title: 'Offer announcement', hook: h1,
    html: head(`<div class="g-mid">${visual(null, 'big', 936)}</div><div class="g-bot">${offerHead(h1)}${priceRow}<p class="g-cta">${esc(ends ?? 'Shop now')}</p></div>`),
    caption: caps(h1, 'offer', o.price ? [{ name: product, price: o.price, originalPrice: o.originalPrice }] : products, ['instagram', 'whatsapp', 'x']) });

  products.slice(0, 3).forEach((p, i) => {
    const h = deck.next('launch', event);
    posts.push({ id: `product-${i + 1}`, format: 'square', title: `Spotlight: ${p.name}`, hook: h,
      html: head(`<div class="g-mid">${visual(p)}</div><div class="g-bot"><h2 class="g-h sm">${esc(p.name)}</h2><p class="g-pr"><b>${esc(p.price ?? '')}</b>${p.originalPrice ? `<s>${esc(p.originalPrice)}</s>` : ''}</p></div>`),
      caption: caps(h, 'product', [p], ['instagram', 'whatsapp', 'x']) });
  });

  if (products.length >= 2) {
    const h = deck.next('warm-up', event);
    const slides = [
      head(`<div class="g-mid"><h2 class="g-h xl">${esc(h)}</h2></div><div class="g-bot"><p class="g-cta">Swipe →</p></div>`),
      ...products.slice(0, 4).map((p, i) => head(`<div class="g-mid">${visual(p)}</div><div class="g-bot"><p class="g-n">${String(i + 1).padStart(2, '0')}</p><h2 class="g-h sm">${esc(p.name)}</h2><p class="g-pr"><b>${esc(p.price ?? '')}</b>${p.originalPrice ? `<s>${esc(p.originalPrice)}</s>` : ''}</p></div>`)),
      head(`<div class="g-mid"><h2 class="g-h xl">${esc(offTxt ? `${offTxt}. ${ends ?? ''}` : 'Which one is yours?')}</h2></div><div class="g-bot"><p class="g-cta">${esc(link ? 'Link in bio' : 'Send us a message')}</p></div>`),
    ];
    posts.push({ id: 'carousel', format: 'post', title: 'Carousel', hook: h, slides, caption: caps(h, 'list', products, ['instagram', 'whatsapp']) });
  }

  const hs = deck.next('launch', event);
  posts.push({ id: 'story', format: 'story', title: 'Story / WhatsApp Status', hook: hs,
    html: head(`<div class="g-mid">${visual(null, 'big', 936)}</div><div class="g-bot">${offerHead(hs)}${priceRow}<p class="g-pill">${esc(link && /wa\.me/.test(link) ? 'Tap to order on WhatsApp' : 'Tap the link to shop')}</p></div>`),
    caption: caps(hs, 'offer', products.length ? products : [{ name: product, price: o.price }], ['whatsapp', 'instagram']) });

  if (ends) {
    const hl = deck.next('last-chance', event);
    posts.push({ id: 'last-call', format: 'story', title: 'Last call', hook: hl,
      html: head(`<div class="g-mid"><h2 class="g-h xl">${esc(hl)}</h2></div><div class="g-bot"><p class="g-pill">${esc(ends)}</p></div>`),
      caption: caps(hl, 'last-call', products, ['whatsapp', 'instagram']) });
  }

  const hw = deck.next('launch', event);
  posts.push({ id: 'wide', format: 'wide', title: 'X / LinkedIn card', hook: hw,
    html: head(`<div class="g-row"><div class="g-col"><h2 class="g-h">${esc(offTxt ? `${offTxt} ${product}` : hw)}</h2>${priceRow}<p class="g-cta">${esc(ends ?? 'Shop now')}</p></div>${visual(null, 'side', 620)}</div>`),
    caption: caps(hw, 'offer', products, ['x', 'linkedin']) });

  // AI-written overrides (headline/caption/image per post id or appended as new text posts).
  for (const ov of o.posts ?? []) {
    const target = posts.find((p) => p.id === ov.id);
    if (target) {
      // The AI's own headline or hook replaces the default hook (and the captions built on it).
      const newHook = ov.hook ?? ov.headline;
      if (newHook) { target.hook = newHook; for (const k of Object.keys(target.caption)) target.caption[k] = target.caption[k].replace(/^[^\n]*/, newHook); }
      if (ov.caption) target.caption = typeof ov.caption === 'string' ? Object.fromEntries(Object.keys(target.caption).map((k) => [k, ov.caption])) : ov.caption;
      continue;
    }
    if (!ov.headline) continue;
    const fmt = KIT_FORMATS[ov.format] ? ov.format : 'post';
    posts.push({ id: `custom-${posts.length}`, format: fmt, title: ov.title ?? 'Post', hook: ov.headline,
      html: head(`<div class="g-mid">${ov.image ? photo(ov.image, ov.headline, 'big') : `<h2 class="g-h xl">${esc(ov.headline)}</h2>`}</div><div class="g-bot">${ov.image ? `<h2 class="g-h sm">${esc(ov.headline)}</h2>` : ''}${ov.sub ? `<p class="g-cta">${esc(ov.sub)}</p>` : ''}</div>`),
      caption: ov.caption ? { instagram: ov.caption, whatsapp: ov.caption } : caps(ov.headline, 'offer', products, ['instagram', 'whatsapp']) });
  }

  const html = page({ o, t, posts, wm, link, product });
  return { html, posts: posts.map(({ id, format, title, hook, caption: c, slides }) => ({ id, format, size: `${KIT_FORMATS[format].w}x${KIT_FORMATS[format].h}`, title, hook, slides: slides?.length ?? 1, caption: c })), images: imgs };
}

function graphic(fmt, inner, wm, key) {
  const f = KIT_FORMATS[fmt];
  return `<div class="fit" style="--w:${f.w};--h:${f.h}"><div class="g g-${fmt}" data-g="${key}" style="width:${f.w}px;height:${f.h}px">${inner}${wm}</div></div>`;
}

function page({ o, t, posts, wm, link, product }) {
  const fonts = [...new Set([t.display, t.body, 'Inter'])].map((f) => `family=${f.replace(/ /g, '+')}:wght@400;600;700;800`).join('&');
  const cards = posts.map((p, i) => {
    const frames = (p.slides ?? [p.html]).map((h, j) => graphic(p.format, h, wm, `${i}-${j}`)).join('');
    const caps = Object.entries(p.caption);
    return `<article class="card" data-post="${i}">
<header><div><h2>${esc(p.title)}</h2><p class="k">${esc(KIT_FORMATS[p.format].label)} · ${KIT_FORMATS[p.format].w}×${KIT_FORMATS[p.format].h}${p.slides ? ` · ${p.slides.length} slides` : ''}</p></div><span class="st" data-st>Ready</span></header>
<div class="frames${p.slides ? ' many' : ''}">${frames}</div>
<div class="cap"><div class="tabs" role="tablist">${caps.map(([k], j) => `<button type="button" role="tab" aria-selected="${j === 0}" data-tab="${k}">${esc({ instagram: 'Instagram', whatsapp: 'WhatsApp', x: 'X', linkedin: 'LinkedIn', facebook: 'Facebook' }[k] ?? k)}</button>`).join('')}</div>
${caps.map(([k, v], j) => `<textarea data-cap="${k}" rows="7" aria-label="Caption for ${esc(k)}"${j ? ' hidden' : ''}>${esc(v)}</textarea>`).join('')}</div>
<div class="acts"><button type="button" class="pri" data-share>Share</button><button type="button" data-dl>Download${p.slides ? ` ${p.slides.length} slides` : ''}</button><button type="button" data-copy>Copy caption</button></div>
<div class="links"><span>Or post to</span><a data-l="wa" target="_blank" rel="noopener">WhatsApp</a><a data-l="x" target="_blank" rel="noopener">X</a><a data-l="fb" target="_blank" rel="noopener">Facebook</a><a data-l="li" target="_blank" rel="noopener">LinkedIn</a><a data-l="tg" target="_blank" rel="noopener">Telegram</a></div>
<p class="msg" data-msg aria-live="polite"></p>
</article>`;
  }).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(o.brand)} content kit</title><meta name="robots" content="noindex,nofollow">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?${fonts}&display=swap" rel="stylesheet" crossorigin="anonymous">
<style>
:root{--bg:${t.bg};--sf:${t.surface};--tx:${t.text};--mu:${t.muted};--ac:${t.accent};--ac2:${t.accent2};--at:${t.accentText};--d:'${t.display}',Impact,sans-serif;--b:'${t.body}',system-ui,sans-serif}
:root{--kbg:${t.bg};--kcard:${t.surface};--kink:${t.text};--kmu:${t.muted};--kline:${t.border ?? 'rgba(127,127,127,.25)'};--kfield:color-mix(in srgb,${t.surface} 85%,${t.bg});--kac:${t.accent};--kact:${t.accentText}}
*{box-sizing:border-box}body{margin:0;background:var(--kbg);color:var(--kink);font:400 16px/1.55 var(--b)}
.bar{position:sticky;top:0;z-index:10;background:color-mix(in srgb,var(--kbg) 88%,transparent);backdrop-filter:blur(12px);border-bottom:1px solid var(--kline)}
.bar-in{max-width:1180px;margin:0 auto;padding:12px 16px;display:flex;align-items:center;gap:16px}.bar-b{font-weight:800;font-size:16px}.bar-c{color:var(--kmu);font-size:14px;flex:1}
.bar-dl{min-height:40px;padding:0 18px;border-radius:999px;border:0;background:var(--kac);color:var(--kact);font:700 14px var(--b);cursor:pointer}
.top{max-width:1180px;margin:0 auto;padding:40px 16px 8px}.eyebrow{margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--kmu)}
.top h1{font:700 clamp(30px,4.4vw,48px)/1.05 var(--d);letter-spacing:-.025em;margin:0 0 12px}.top p{margin:0;color:var(--kmu);max-width:62ch;font-size:17px}.top a{color:var(--kink)}
.grid{max-width:1180px;margin:0 auto;padding:24px 16px 80px;display:grid;gap:20px}@media(min-width:760px){.grid{grid-template-columns:1fr 1fr}}@media(min-width:1100px){.grid{grid-template-columns:1fr 1fr 1fr}}
.card{background:var(--kcard);border:1px solid var(--kline);border-radius:24px;padding:20px;display:flex;flex-direction:column;gap:16px;min-width:0;box-shadow:0 1px 2px rgba(20,19,15,.04)}
.card header{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.card header h2{font:700 18px/1.25 var(--b);margin:0 0 4px}.k{margin:0;color:var(--kmu);font-size:13px}
.st{flex:none;font:700 12px/1 var(--b);padding:7px 10px;border-radius:999px;background:#e7f5ec;color:#17603a}.rep-card .st{background:var(--kcard)2c2;color:#7a5600}
.frames{display:grid;gap:8px}.frames.many{grid-auto-flow:column;grid-auto-columns:82%;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:6px}.frames.many .fit{scroll-snap-align:start}
.fit{position:relative;width:100%;aspect-ratio:var(--w)/var(--h);overflow:hidden;border-radius:12px;background:#ddd}
.fit .g{position:absolute;top:0;left:0;transform-origin:0 0}
.cap textarea{width:100%;border:1px solid var(--kline);border-radius:14px;padding:12px 14px;font:inherit;font-size:15px;line-height:1.55;resize:vertical;background:var(--kfield);color:var(--kink)}
.tabs{display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap}.tabs button{border:1px solid var(--kline);background:var(--kcard);border-radius:999px;padding:5px 12px;font:600 13px var(--b);cursor:pointer}.tabs button[aria-selected=true]{background:var(--kink);color:var(--kbg);border-color:var(--kink)}
.acts{display:grid;grid-template-columns:1fr 1fr;gap:8px}.acts button{min-height:48px;border-radius:14px;border:1px solid var(--kline);background:var(--kcard);font:700 15px var(--b);cursor:pointer;color:var(--kink)}.acts .pri{grid-column:1/-1;background:var(--kac);border-color:var(--kac);color:var(--kact);min-height:52px}
.links{display:flex;flex-wrap:wrap;align-items:center;gap:6px 14px;font-size:14px}.links span{color:var(--kmu)}.links a{color:var(--kink);font-weight:600;text-decoration:none;border-bottom:1px solid var(--kline);cursor:pointer}
.msg{margin:0;min-height:1.4em;font-size:14px;color:var(--kmu)}
.up{display:flex;align-items:center;justify-content:center;min-height:48px;border-radius:14px;border:1px dashed var(--kline);font:700 15px var(--b);cursor:pointer;color:var(--kink)}.up:focus-within{outline:3px solid var(--kac);outline-offset:2px}
button:focus-visible,a:focus-visible,textarea:focus-visible{outline:3px solid var(--kac);outline-offset:2px}
/* graphics */
.g{background:radial-gradient(90% 60% at 50% 40%,color-mix(in srgb,var(--ac) 22%,transparent),transparent 70%),var(--bg);color:var(--tx);font-family:var(--b);display:flex;flex-direction:column;gap:40px;padding:72px;overflow:hidden}
.g-wide{padding:64px 80px}
.g-top{display:flex;justify-content:space-between;align-items:center;gap:20px;font:700 34px/1 var(--b)}.g-brand img{height:64px;width:auto;display:block}
.g-ev{font:700 24px/1 var(--b);letter-spacing:.14em;text-transform:uppercase;padding:14px 22px;border-radius:999px;background:var(--ac);color:var(--at)}
.g-mid{flex:1;display:grid;place-items:center;min-height:0}
.g-bot{display:flex;flex-direction:column;gap:16px}
.g-h{font:400 120px/.92 var(--d);margin:0;text-transform:uppercase;letter-spacing:-.01em}.g-h.sm{font-size:84px}.g-h.xl{font-size:110px;text-align:center;text-transform:none}
.g-story .g-h{font-size:150px}.g-story .g-h.xl{font-size:120px}
.g-pr{display:flex;align-items:baseline;gap:24px;margin:0}.g-pr b{font:400 96px/1 var(--d);color:var(--ac)}.g-pr s{font-size:44px;color:var(--mu)}
.g-cta{margin:0;font:600 38px/1.2 var(--b);color:var(--mu)}.g-n{margin:0;font:700 30px var(--b);color:var(--ac)}
.g-pill{align-self:flex-start;margin:6px 0 0;padding:26px 44px;border-radius:999px;background:var(--ac);color:var(--at);font:800 40px/1 var(--b)}
.ph{position:relative;width:100%;height:100%;border-radius:36px;overflow:hidden;display:grid;place-items:center;background:color-mix(in srgb,var(--tx) 6%,transparent)}.ph img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.rep-l{position:absolute;left:24px;bottom:24px;padding:10px 16px;border-radius:999px;background:rgba(0,0,0,.55);color:#fff;font:600 22px/1 var(--b);letter-spacing:.02em}
.np{width:100%;height:100%;display:flex;align-items:center;justify-content:center;text-align:center;padding:0 24px;font:400 150px/.95 var(--d);text-transform:uppercase;color:var(--tx);letter-spacing:-.01em}.np span{max-width:100%;overflow-wrap:anywhere}
.g:has(.np) .g-bot .g-h{display:none}
.need-l{display:none}.ph.need{border:4px dashed color-mix(in srgb,var(--tx) 35%,transparent);background:color-mix(in srgb,var(--tx) 4%,transparent)}.ph.need .need-l{display:block;text-align:center;font:500 40px/1.3 var(--b);color:var(--mu)}.ph.need .need-l b{color:var(--tx);font-weight:700}
.ty{width:auto;max-width:100%;height:auto;display:inline-flex;flex-direction:column;align-items:center;justify-content:center;font-family:var(--d);line-height:.82;letter-spacing:-.02em;color:var(--ac);text-align:center}.ty span{display:block}.ty em{display:block;font-style:normal;font-size:.34em;letter-spacing:.06em;text-transform:uppercase;color:var(--tx);margin-top:.12em}
.g-row{flex:1;display:grid;grid-template-columns:1.1fr .9fr;gap:56px;align-items:center;padding-top:30px}.g-col{display:flex;flex-direction:column;gap:18px}.g-wide .g-h{font-size:110px}
.g-row .ph,.g-row .ty{height:100%;max-height:640px;width:100%}
.q4wm{display:none;position:absolute;right:28px;bottom:24px;font:600 22px/1 var(--b);color:var(--tx);opacity:.6}
${o.watermark ? '.q4wm{display:block}' : ''}
</style></head><body>
<div class="bar"><div class="bar-in"><b class="bar-b">${esc(o.brand)}</b><span class="bar-c" data-count>${posts.length} posts</span><button type="button" class="bar-dl" data-dlall>Download all</button></div></div>
<div class="top"><p class="eyebrow">Content kit${THEMES[o.theme] ? ` · ${esc(t.eyebrow)}` : ''}</p><h1>${posts.length} posts, ready to share</h1><p>Each post has a caption written for the app. Edit anything, then tap <b>Share</b> on your phone to post to Instagram, TikTok or WhatsApp with the image attached, or download it.${link ? ` Every post links to <a href="${esc(link)}">${esc(link.replace(/^https?:\/\//, ''))}</a>.` : ''}</p></div>
<main class="grid">${cards}</main>
<script src="https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js"></script>
<script>
(function(){
var link=${JSON.stringify(link)};
function fit(){document.querySelectorAll('.fit').forEach(function(f){var g=f.firstElementChild;g.style.transform='scale('+(f.clientWidth/parseFloat(getComputedStyle(f).getPropertyValue('--w')))+')'})}
/* Statement type: measured in the browser and shrunk until it sits inside the frame margins. */
function fitType(){document.querySelectorAll('.ty').forEach(function(t){var fs=parseFloat(t.style.fontSize)||400;var box=t.parentNode;var maxW=box.clientWidth*0.92,maxH=box.clientHeight*0.92;var i=0;while((t.scrollWidth>maxW||t.scrollHeight>maxH)&&fs>60&&i++<80){fs-=8;t.style.fontSize=fs+'px'}})}
function fitAll(){fitType();fit()}
addEventListener('resize',fit);if(document.fonts)document.fonts.ready.then(fitAll);fitAll();
function msg(card,s){card.querySelector('[data-msg]').textContent=s}
function cap(card){var t=card.querySelector('textarea:not([hidden])');return t?t.value:''}
function msg(card,s){card.querySelector('[data-msg]').textContent=s}
function png(g){var w=parseFloat(g.style.width),h=parseFloat(g.style.height);return htmlToImage.toBlob(g,{width:w,height:h,pixelRatio:1,cacheBust:true,style:{transform:'none'}})}
function name(card,j){return (${JSON.stringify(o.brand.replace(/[^a-z0-9]+/gi, '-').toLowerCase())}+'-'+card.querySelector('h2').textContent.replace(/[^a-z0-9]+/gi,'-').toLowerCase()+(j?'-'+(j+1):'')+'.png')}
function files(card){return Promise.all(Array.prototype.map.call(card.querySelectorAll('.g'),function(g,j){return png(g).then(function(b){return new File([b],name(card,j),{type:'image/png'})})}))}
function save(f){var a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=f.name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},1500)}
function refresh(){document.querySelectorAll('.card').forEach(function(c){var st=c.querySelector('[data-st]');var r=c.querySelector('.ph.rep');c.classList.toggle('rep-card',!!r);if(st)st.textContent=r?'Ready · representative photo':'Ready'});var cnt=document.querySelector('[data-count]');if(cnt)cnt.textContent=document.querySelectorAll('.card').length+' posts ready'}
document.addEventListener('click',function(e){if(!e.target.closest('[data-dlall]'))return;var cards=[].slice.call(document.querySelectorAll('.card'));var b=e.target.closest('[data-dlall]');b.textContent='Preparing...';cards.reduce(function(pr,c){return pr.then(function(){return files(c).then(function(fs){fs.forEach(save)})})},Promise.resolve()).then(function(){b.textContent='Download all'},function(){b.textContent='Try again'})});
var KIT=window.Q4_KIT||null;
function setPhoto(key,url,scope){(/^m/.test(key)?scope:document).querySelectorAll('.ph[data-p="'+key+'"]').forEach(function(ph){ph.classList.remove('need');ph.classList.remove('rep');var tag=ph.querySelector('.rep-l');if(tag)tag.remove();var im=ph.querySelector('img')||document.createElement('img');im.removeAttribute('crossorigin');im.src=url;im.alt='';if(!im.parentNode)ph.insertBefore(im,ph.firstChild)});refresh()}
document.querySelectorAll('.card').forEach(function(card){
  card.querySelectorAll('[data-tab]').forEach(function(b){b.addEventListener('click',function(){card.querySelectorAll('[data-tab]').forEach(function(x){x.setAttribute('aria-selected',String(x===b))});card.querySelectorAll('[data-cap]').forEach(function(t){t.hidden=t.getAttribute('data-cap')!==b.getAttribute('data-tab')});links()})});
  function links(){var c=encodeURIComponent(cap(card)),u=encodeURIComponent(link);var m={wa:'https://wa.me/?text='+c,x:'https://twitter.com/intent/tweet?text='+c,fb:link?'https://www.facebook.com/sharer/sharer.php?u='+u:'',li:link?'https://www.linkedin.com/sharing/share-offsite/?url='+u:'',tg:'https://t.me/share/url?url='+u+'&text='+c};card.querySelectorAll('[data-l]').forEach(function(a){var h=m[a.getAttribute('data-l')];if(h){a.href=h;a.hidden=false}else a.hidden=true})}
  links();card.querySelectorAll('textarea').forEach(function(t){t.addEventListener('input',links)});
  card.querySelector('[data-copy]').addEventListener('click',function(){navigator.clipboard.writeText(cap(card)).then(function(){msg(card,'Caption copied.')},function(){msg(card,'Select the caption and copy it.')})});
  card.querySelector('[data-dl]').addEventListener('click',function(){msg(card,'Preparing image...');files(card).then(function(fs){fs.forEach(save);msg(card,fs.length>1?fs.length+' images downloaded.':'Image downloaded.')},function(){msg(card,'Could not create the image. Try again or take a screenshot.')})});
  card.querySelector('[data-share]').addEventListener('click',function(){msg(card,'Preparing...');files(card).then(function(fs){var data={files:fs,text:cap(card)};if(navigator.canShare&&navigator.canShare(data)){return navigator.share(data).then(function(){msg(card,'Shared.')},function(){msg(card,'')})}navigator.clipboard&&navigator.clipboard.writeText(cap(card)).catch(function(){});fs.forEach(save);msg(card,'Your browser cannot share images directly. Images downloaded and caption copied: open the app and post.')},function(){msg(card,'Could not create the image. Try again.')})});
});
if(KIT&&KIT.photos)Object.keys(KIT.photos).forEach(function(k){setPhoto(k,KIT.photos[k],document)});
refresh();
})();
</script></body></html>`;
}
