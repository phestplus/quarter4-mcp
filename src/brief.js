import { getEvent } from './calendar.js';
import { today } from './dates.js';
import { classifyNiche, NICHES, phaseAngles } from './niches.js';
import { normalizePlatforms, parseOffer } from './normalize.js';
import { PLATFORMS } from './specs.js';
import { hooksFor } from './hooks.js';
import { VERBS, displayNameOf, offerTypeOf } from './offer.js';

// Rules that keep promotional content legal and platform-safe. Not legal advice.
const COMPLIANCE = {
  always: [
    'State offer terms clearly: what is discounted, start/end date and time zone, exclusions.',
    'Only show a "was" price you actually charged recently (UK CMA, EU Omnibus Directive 30-day rule, US FTC pricing guides).',
    'Countdowns and "only X left" claims must be true. Fake scarcity is banned under consumer protection law (FTC, UK DMCC Act 2024, EU UCPD).',
    'Add alt text to images and captions/subtitles to video.',
  ],
  sponsored: [
    'Disclose paid partnerships, gifted products and affiliate links clearly at the start: "#ad", "Paid partnership", or the platform\'s branded-content label (FTC Endorsement Guides, UK ASA/CAP, EU national rules).',
  ],
  giveaway: [
    'Publish giveaway rules: eligibility, deadline, how the winner is picked, prize value. Many US states and other countries ban "purchase required" lotteries.',
    'Follow each platform\'s promotion rules (e.g. Meta: release the platform from liability and do not ask people to tag friends in their own timeline).',
  ],
  ai: [
    'Label AI-generated realistic images or video where the platform requires it (Meta "AI info", TikTok AI-generated label, YouTube altered/synthetic content disclosure).',
    'Do not generate images of real people, trademarks or copyrighted characters you have no rights to.',
  ],
  music: [
    'Use licensed music. Business accounts on TikTok/Instagram should use the commercial music libraries.',
  ],
};

const VIDEO_STRUCTURES = {
  15: [['0-2s', 'Hook: bold claim, question or visual surprise'], ['2-10s', 'Show the product/result in use'], ['10-15s', 'Offer + CTA on screen and spoken']],
  30: [['0-3s', 'Hook'], ['3-12s', 'Problem or desire'], ['12-24s', 'Product as the answer: demo, before/after, proof'], ['24-30s', 'Offer, deadline, CTA']],
  60: [['0-3s', 'Hook'], ['3-15s', 'Story setup / problem'], ['15-40s', 'Demo or 3 key points'], ['40-52s', 'Social proof (review, result)'], ['52-60s', 'Offer, deadline, CTA']],
};

const IMAGE_TOOL_SIZES = {
  midjourney: (aspect) => `append --ar ${aspect}`,
  'gpt-image': (aspect) => {
    const [w, h] = aspect.split(':').map(Number);
    return w === h ? 'size 1024x1024' : w > h ? 'size 1536x1024 (then crop)' : 'size 1024x1536 (then crop)';
  },
  imagen: (aspect) => `aspectRatio "${aspect}"`,
  flux: (aspect) => `aspect_ratio "${aspect}"`,
};

const ASSET_TYPES = ['post', 'image', 'video', 'carousel', 'story', 'email'];

/**
 * @param {object} o
 * @param {string} o.platform
 * @param {string} [o.format]
 * @param {string} o.assetType one of ASSET_TYPES
 * @param {string} o.brand
 * @param {string} [o.niche] free text, e.g. "sneakers in lagos"
 * @param {string} [o.product]
 * @param {string} [o.offer]
 * @param {string} [o.eventId]
 * @param {string} [o.phase]
 * @param {string} [o.tone]
 * @param {number} [o.videoSeconds] 15 | 30 | 60
 * @param {boolean} [o.sponsored]
 * @param {boolean} [o.giveaway]
 * @param {boolean} [o.aiGenerated]
 */
export function buildBrief(o) {
  const p = PLATFORMS[normalizePlatforms(o.platform ?? '').values[0]];
  if (!p) throw new Error(`Unknown platform "${o.platform}". Known: ${Object.keys(PLATFORMS).join(', ')}`);
  if (!ASSET_TYPES.includes(o.assetType)) throw new Error(`assetType must be one of ${ASSET_TYPES.join(', ')}`);

  const formatId = o.format && p.formats[o.format] ? o.format : pickFormat(p, o.assetType);
  const format = p.formats[formatId];
  const ref = today();
  const ev = o.eventId ? getEvent(o.eventId, Number(ref.slice(0, 4)), ref) : null;
  if (o.eventId && !ev) throw new Error(`Unknown eventId "${o.eventId}"`);
  const cls = classifyNiche(`${o.niche ?? ''} ${o.product ?? ''}`);
  const nicheId = NICHES[o.nicheId] ? o.nicheId : cls.id;
  const niche = NICHES[nicheId];
  const product = o.product || cls.matched[0] || 'the product';
  const offer = parseOffer(o.offer);

  const offerType = o.offerType ?? offerTypeOf(nicheId, `${o.niche ?? ''} ${o.product ?? ''}`);
  const name = displayNameOf({ brand: o.brand, displayName: o.displayName }, o.product ?? o.brand);
  const verbs = VERBS[offerType] ?? VERBS.physical;
  const RETAIL_ANGLE = /stock|doorbuster|gift guide|in-store|pickup|bundle|by budget|unboxing/i;
  const evAngles = ev ? ev.angles.filter((x) => offerType === 'physical' || !RETAIL_ANGLE.test(x)) : [];
  const offerShort = offer?.type === 'percent' ? `${offer.value}% off` : o.offer ?? null;
  const ends = ev ? `ends ${ev.name}` : null;
  const firstWords = (t, n) => String(t).replace(/[.!?]+$/, '').split(/\s+/).slice(0, n).join(' ');
  const scriptAngles = () => (brief.context.angles.length ? brief.context.angles : phaseAngles(nicheId, ev ? 'launch' : 'warm-up', name));
  const up = (t) => (t ? `${String(t)[0].toUpperCase()}${String(t).slice(1)}` : t);
  const brief = {
    platform: p.name,
    format: formatId,
    specs: { ...format, caption: p.caption, hashtags: p.hashtags },
    context: {
      brand: o.brand, product: o.product ?? null, offer: o.offer ?? null, tone: o.tone ?? 'warm, confident, specific',
      event: ev ? { name: ev.name, date: ev.date, daysUntil: ev.daysUntil, angles: evAngles, hashtags: ev.hashtags } : null,
      offerType, name,
      phase: o.phase ?? null,
      niche: niche.label,
      angles: o.phase ? phaseAngles(nicheId, o.phase, product) : [],
    },
    copy: {
      hooks: hooksFor({ offerType: offerTypeOf(nicheId, `${o.niche ?? ''} ${o.product ?? ''}`), nicheHooks: niche.hooks, phase: o.phase ?? (ev ? 'launch' : 'evergreen'), product: displayNameOf({ brand: o.brand, displayName: o.displayName }, o.product ?? o.brand), discount: offer?.type === 'percent' ? `${offer.value}%` : null, event: ev?.name ?? null, brand: o.brand ?? 'us', limit: 10 }),
      structure: ['Hook (first line / first 2 seconds)', 'Value or proof', 'Offer with real terms', 'One clear CTA'],
      captionLimit: p.caption,
    },
    checklist: [...COMPLIANCE.always, ...niche.compliance,
      ...(o.sponsored ? COMPLIANCE.sponsored : []),
      ...(o.giveaway ? COMPLIANCE.giveaway : []),
      ...(o.aiGenerated ? COMPLIANCE.ai : []),
      ...(o.assetType === 'video' || formatId.includes('reel') || formatId === 'video' ? COMPLIANCE.music : [])],
  };

  if (['image', 'post', 'carousel', 'story'].includes(o.assetType) && format.aspect) {
    brief.imagePrompt = {
      template: `${name}, ${ev ? `${ev.name} mood, ` : ''}${(niche.shots[0] ?? 'in everyday use').toLowerCase()}, soft natural light, clean editorial photography, negative space at the top for headline text, ${o.brandStyle?.palette ? `colour palette ${Object.values(o.brandStyle.palette).filter(Boolean).join(' ')}` : 'brand colours'}, no text, no logos, no watermark`,
      sizeByTool: Object.fromEntries(Object.entries(IMAGE_TOOL_SIZES).map(([tool, fn]) => [tool, fn(format.aspect)])),
      tips: ['Add headline text in your design tool, not in the generated image (AI text is unreliable).', 'Generate 4 variants and A/B test the top 2.'],
    };
  }
  if (o.assetType === 'carousel') {
    brief.carousel = { slides: ['1: Hook headline', '2-N: one idea per slide, max ~20 words', 'Last: offer + CTA'], maxItems: format.maxItems ?? null };
  }
  if (o.assetType === 'video' || o.assetType === 'story') {
    const secs = [15, 30, 60].includes(o.videoSeconds) ? o.videoSeconds : 30;
    brief.video = {
      seconds: secs,
      beats: VIDEO_STRUCTURES[secs].map(([t, beat], i, all) => {
        const hook = brief.copy.hooks[0] ?? `${name}.`;
        const last = i === all.length - 1;
        const proof = /^social proof/i.test(beat);
        return {
          time: t, beat,
          shot: last ? 'End card: logo or wordmark, the offer and the link' : niche.shots[i % niche.shots.length],
          onScreenText: i === 0 ? firstWords(hook, 6) : last ? up([offerShort, ends].filter(Boolean).join(' · ')) || verbs.cta : proof ? 'From a real customer' : up(firstWords(scriptAngles()[i - 1] ?? evAngles[i - 1] ?? name, 6)),
          voiceover: i === 0 ? hook : last ? `${offerShort ? `${up(offerShort)}${ev ? ` for ${ev.name}` : ''}. ` : ''}${verbs.ig}` : proof ? null : `${up(scriptAngles()[i - 1] ?? evAngles[i - 1] ?? `Here is what ${name} does for you`)}.`,
          ...(proof ? { note: 'Use a real customer quote or result, with their permission. Never write one.' } : {}),
        };
      }),
      voice: o.tone ?? 'warm, confident, specific',
      shotList: [...niche.shots, 'End card with the offer and deadline'],
      safeZone: format.safeZone ?? null,
      tips: ['Burn in captions; most people watch muted.', 'Film vertical 4K so you can crop for 4:5 too.'],
    };
  }
  if (o.assetType === 'email') {
    const items = (o.products ?? []).filter((x) => x?.name).slice(0, 3);
    brief.email = {
      subject: `${offerShort ? `${offerShort[0].toUpperCase()}${offerShort.slice(1)} ${name}` : name}${ev ? ` for ${ev.name}` : ''}`.slice(0, 50),
      preheader: offerShort && ev ? `${up(evAngles[0] ?? 'Our offer')}, until ${ev.name}.` : `What is new at ${o.brand}.`,
      voice: o.tone ?? 'warm, confident, specific',
      sections: [
        `Hero: ${name}${offerShort ? `, ${offerShort}` : ''} (live text headline, not text in an image)`,
        offerShort ? 'The offer and its real terms (renewal price and how to cancel for subscriptions)' : 'One clear story or update',
        items.length ? `${offerType === 'subscription' ? 'Plans' : 'Products'}: ${items.map((x) => x.name).join(', ')}` : offerType === 'subscription' ? 'What is included, plan by plan (only the plans you sell)' : 'The products in this offer (only real ones)',
        `Button: ${verbs.cta}`,
        'Footer with unsubscribe link and your business address',
      ],
    };
  }
  return brief;
}

function pickFormat(p, assetType) {
  const ids = Object.keys(p.formats);
  const want = { video: ['reel', 'video', 'short', 'video-pin'], story: ['story', 'reel', 'video'], carousel: ['carousel', 'document-carousel', 'photo-carousel'], email: ['hero-image'] }[assetType] ?? ['feed-image', 'pin', 'hero-image'];
  return want.find((w) => ids.includes(w)) ?? ids[0];
}

export { ASSET_TYPES };
