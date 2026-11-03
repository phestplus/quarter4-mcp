// Captions written for each app's culture, from facts the seller gave only (no invented claims).
//   Instagram: hook line, a short specific middle, the offer, one clear action, 3 to 5 hashtags.
//   WhatsApp: personal and short, like a message from the shop owner; reply-to-order friendly.
//   X: one tight sentence plus the link, always within 280 characters (links count as 23).
//   LinkedIn: plain and professional, no hashtag wall.

import { VERBS } from './offer.js';

const X_LIMIT = 280;
const LINK_LEN = 23;

const xLength = (s) => s.replace(/https?:\/\/\S+/g, 'x'.repeat(LINK_LEN)).length;
const sentence = (s) => (s && !/[.!?]$/.test(s.trim()) ? `${s.trim()}.` : s?.trim());

/**
 * @param {object} c { hook, brand, product, event, offTxt, ends, link, isWhatsApp, items: [{name, price, originalPrice, note}], tags, kind }
 *   kind: 'offer' | 'product' | 'list' | 'last-call'
 */
export function captionsFor(c) {
  const item = c.items?.[0];
  const priceOf = (p) => (p?.price ? `${p.price}${p.originalPrice ? ` (was ${p.originalPrice})` : ''}` : null);
  const offerLine = c.offTxt
    ? `${cap(c.offTxt)}${c.kind === 'product' && item ? '' : ` ${c.product}`}${c.event ? ` this ${c.event}` : ''}.`
    : c.event ? `${c.event} at ${c.brand}.` : null;
  // "From" only for the true lowest price among the items given.
  const num = (v) => Number(String(v ?? '').replace(/[^0-9.]/g, '')) || null;
  const priced = (c.items ?? []).filter((p) => num(p.price));
  const lowest = priced.length > 1 ? priced.reduce((a, b) => (num(b.price) < num(a.price) ? b : a)) : null;
  const generic = item && item.name === c.product;
  const middle = c.kind === 'product' && item
    ? [`${item.name}: ${priceOf(item) ?? 'message us for the price'}.`, item.note ? sentence(item.note) : null].filter(Boolean)
    : c.kind === 'list'
      ? c.items.slice(0, 5).map((p) => `${p.name}${p.price ? `: ${priceOf(p)}` : ''}`)
      : c.kind === 'last-call' ? []
        : lowest ? [`Prices from ${lowest.price}.`]
          : item?.price ? [`${generic ? 'Now' : `${item.name} now`} ${priceOf(item)}.`] : [];
  const endsLine = c.ends ? `Offer ${c.ends.charAt(0).toLowerCase()}${c.ends.slice(1)}.` : null;
  const v = VERBS[c.offerType] ?? VERBS.physical;
  const igAction = c.isWhatsApp ? v.igWa : v.ig;
  const tags = (c.tags ?? []).slice(0, 5).join(' ');

  const body = c.kind === 'product' ? [...middle, offerLine] : [offerLine, ...middle];
  const instagram = [c.hook, '', ...body, endsLine, '', igAction, '', tags].filter((l, i, a) => l !== null && !(l === '' && a[i - 1] === '')).join('\n').trim();

  const waOffer = c.offTxt ? `${c.offTxt} ${c.product}` : null;
  const waGreeting = c.kind === 'last-call'
    ? `Quick reminder from ${c.brand}: ${waOffer ?? 'the sale'} ${c.ends ? c.ends.replace(/^Ends/, 'ends') : 'ends soon'}.`
    : `Hi! ${c.event ? `It's ${c.event} at ${c.brand}` : `New at ${c.brand}`}${waOffer && c.kind !== 'product' ? `: ${waOffer}` : ''}.`;
  const whatsapp = [waGreeting, ...middle, c.kind === 'last-call' ? null : endsLine, c.link ? `${v.link}: ${c.link}` : v.wa].filter(Boolean).join('\n');

  let x = [c.hook, c.offTxt && !c.hook.toLowerCase().includes(c.offTxt.toLowerCase()) ? cap(c.offTxt) + '.' : null, endsLine, c.link].filter(Boolean).join(' ');
  if (c.tags?.[0] && xLength(`${x} ${c.tags[0]}`) <= X_LIMIT) x += ` ${c.tags[0]}`;
  while (xLength(x) > X_LIMIT) x = x.replace(/\s*\S+(?=\s+https?:\/\/|$)/, '');

  const linkedin = [c.hook, '', [offerLine, ...middle, endsLine].filter(Boolean).join(' '), c.link ? `\nDetails: ${c.link}` : null].filter((l) => l !== null).join('\n').trim();

  return { instagram, whatsapp, x, linkedin };
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
export { xLength };
