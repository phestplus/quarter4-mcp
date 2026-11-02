// Platform specs for content creation. Platforms change limits often; every entry
// carries lastReviewed so users know when to re-check. Values are recommended sizes
// that are safe across devices, not every size a platform accepts.

export const SPECS_LAST_REVIEWED = '2026-11-01';

export const PLATFORMS = {
  instagram: {
    name: 'Instagram',
    caption: { maxChars: 2200, visibleBeforeMore: 125 },
    hashtags: 'Use 3-5 specific hashtags; broad tags add little reach.',
    formats: {
      'feed-image': { size: '1080x1350', aspect: '4:5', notes: 'Portrait takes the most feed space. 1080x1080 (1:1) also works.' },
      carousel: { size: '1080x1350', aspect: '4:5', maxItems: 20, notes: 'Slide 1 is the hook; last slide is the CTA.' },
      reel: { size: '1080x1920', aspect: '9:16', maxSeconds: 180, safeZone: 'Keep text out of the bottom ~20% and top ~14% (UI overlays).', notes: 'Hook in the first 1-2 seconds; add on-screen captions.' },
      story: { size: '1080x1920', aspect: '9:16', maxSeconds: 60, safeZone: 'Keep text out of top and bottom 250px.', notes: 'Use link, countdown and poll stickers for campaigns.' },
    },
    tips: ['Countdown sticker on Stories for launch dates', 'Collab posts with partner creators', 'Pin the offer post to your grid during sales'],
  },
  tiktok: {
    name: 'TikTok',
    caption: { maxChars: 4000 },
    hashtags: 'Use 3-5 relevant hashtags plus one trend tag if it truly fits.',
    formats: {
      video: { size: '1080x1920', aspect: '9:16', recommendedSeconds: '15-60', safeZone: 'Keep text out of the right ~15% and bottom ~25% (buttons and caption).', notes: 'Native-looking, face-to-camera content usually beats polished ads.' },
      'photo-carousel': { size: '1080x1920', aspect: '9:16', maxItems: 35, notes: 'Good for gift guides and lists.' },
    },
    tips: ['Use trending sounds from the Commercial Music Library for brand accounts', 'Reply to comments with video', 'Turn on branded content toggle for paid partnerships'],
  },
  youtube: {
    name: 'YouTube',
    caption: { titleMaxChars: 100, descriptionMaxChars: 5000 },
    hashtags: 'Up to 3 hashtags in the description show above the title.',
    formats: {
      video: { size: '1920x1080', aspect: '16:9', notes: 'Chapters help retention and search.' },
      short: { size: '1080x1920', aspect: '9:16', maxSeconds: 180, notes: 'Loopable endings help watch time.' },
      thumbnail: { size: '1280x720', aspect: '16:9', maxFileMB: 2, notes: '3-5 words max, readable at phone size.' },
    },
    tips: ['Publish gift guides 3-4 weeks before the event so search can pick them up', 'Pin a comment with the offer link'],
  },
  linkedin: {
    name: 'LinkedIn',
    caption: { maxChars: 3000, visibleBeforeMore: 210 },
    hashtags: 'Use 0-3 hashtags.',
    formats: {
      'feed-image': { size: '1080x1350', aspect: '4:5', notes: '1200x627 (1.91:1) for landscape link-style images.' },
      'document-carousel': { size: '1080x1350', aspect: '4:5', format: 'PDF', notes: 'High dwell time; 6-10 slides works well.' },
      video: { size: '1080x1350', aspect: '4:5', notes: 'Vertical or 4:5 fills more of the mobile feed. Add captions; most viewers watch muted.' },
    },
    tips: ['Put links in the first comment if reach matters to you more than clicks', 'Founder-voice posts beat brand-voice posts', 'Year-in-review and lessons posts do well in December'],
  },
  x: {
    name: 'X (Twitter)',
    caption: { maxChars: 280, notes: 'Premium accounts can post longer.' },
    hashtags: 'Use 0-2 hashtags.',
    formats: {
      'feed-image': { size: '1600x900', aspect: '16:9', notes: '1080x1350 (4:5) also displays well on mobile.' },
      video: { size: '1920x1080', aspect: '16:9', notes: '1080x1920 vertical also supported.' },
      thread: { notes: 'Hook tweet, 4-8 value tweets, CTA tweet with link.' },
    },
    tips: ['Pin the offer post', 'Quote-post customer reactions'],
  },
  facebook: {
    name: 'Facebook',
    caption: { visibleBeforeMore: 125 },
    hashtags: 'Hashtags matter little; use 0-2.',
    formats: {
      'feed-image': { size: '1080x1350', aspect: '4:5' },
      reel: { size: '1080x1920', aspect: '9:16', safeZone: 'Keep text out of the bottom ~20%.' },
      story: { size: '1080x1920', aspect: '9:16' },
      'event-cover': { size: '1920x1005', aspect: '1.91:1' },
    },
    tips: ['Create a Facebook Event for live sales', 'Share to relevant Groups only where promotion is allowed'],
  },
  pinterest: {
    name: 'Pinterest',
    caption: { titleMaxChars: 100, descriptionMaxChars: 500 },
    hashtags: 'Use descriptive keywords instead of hashtags.',
    formats: {
      pin: { size: '1000x1500', aspect: '2:3', notes: 'Text overlay with the search phrase, e.g. "Gift ideas for dad under $50".' },
      'video-pin': { size: '1080x1920', aspect: '9:16' },
    },
    tips: ['Pinterest users plan early: publish holiday pins 45-60 days ahead', 'Link every pin to a specific landing page'],
  },
  threads: {
    name: 'Threads',
    caption: { maxChars: 500 },
    hashtags: 'One topic tag per post.',
    formats: {
      'feed-image': { size: '1080x1350', aspect: '4:5' },
      video: { size: '1080x1920', aspect: '9:16' },
    },
    tips: ['Conversational questions get replies; reply fast in the first hour'],
  },
  whatsapp: {
    name: 'WhatsApp (Status, Channels, Business broadcast)',
    caption: { statusTextMaxChars: 700, notes: 'Broadcast messages reach only contacts who saved your number.' },
    hashtags: 'Not used.',
    formats: {
      status: { size: '1080x1920', aspect: '9:16', maxSeconds: 60, notes: 'Status disappears after 24 hours; post daily in launch week.' },
      broadcast: { notes: 'Short text + one image + link to catalog or checkout. Max 1 per day; ask before adding people.' },
      catalog: { size: '1080x1080', aspect: '1:1', notes: 'Keep catalog prices and stock in sync with the sale.' },
    },
    tips: ['Use Status for daily countdowns', 'Send the broadcast at launch and last-chance only', 'Pin the sale in your Channel'],
    cadencePerWeek: 4,
  },
  email: {
    name: 'Email newsletter',
    caption: { subjectRecommendedChars: 50, preheaderChars: '40-100' },
    formats: {
      'hero-image': { size: '1200x600', aspect: '2:1', notes: 'Displayed at 600px wide; keep key text live (not inside the image).' },
    },
    cadencePerWeek: 2,
    tips: ['Segment subscribers for early access', 'Send a "last chance" email in the final 6-12 hours', 'Include a plain-text version and an unsubscribe link (CAN-SPAM, GDPR, PECR)'],
  },
};

export const PLATFORM_IDS = Object.keys(PLATFORMS);

export function getSpecs(platformIds) {
  const ids = platformIds?.length ? platformIds : PLATFORM_IDS;
  const out = {};
  for (const id of ids) {
    const p = PLATFORMS[id.toLowerCase()];
    if (!p) throw new Error(`Unknown platform "${id}". Known: ${PLATFORM_IDS.join(', ')}`);
    out[id.toLowerCase()] = p;
  }
  return { lastReviewed: SPECS_LAST_REVIEWED, note: 'Platforms change limits often. Re-check official help pages for paid ads specs.', platforms: out };
}
