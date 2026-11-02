import { readFile, writeFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { buildBrief, ASSET_TYPES } from './brief.js';
import { EVENT_IDS, listEvents } from './calendar.js';
import { cloud } from './cloud.js';
import { findImages } from './images.js';
import { upcomingHolidays, whatsOn } from './live.js';
import { NICHES, classifyNiche } from './niches.js';
import { MOOD_QUERIES } from './start.js';
import { findEventsInText, normalizePlatforms, normalizeRegions } from './normalize.js';
import { startCampaign } from './start.js';
import { CATEGORIES, REGIONS } from './events.js';
import { toCSV, toICS, toMarkdown } from './export.js';
import { buildLanding, describeLanding, LAYOUTS, THEMES } from './landing.js';
import { buildPlan } from './plan.js';
import { getSpecs, PLATFORM_IDS } from './specs.js';

export const VERSION = '0.3.0';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD');
// Loose inputs: real users write "ig, tik tok", "Lagos", "black friday". Normalised in the engine.
const list = z.union([z.array(z.string()), z.string()]);
const platformList = list.describe(`Platforms, any spelling: ${PLATFORM_IDS.join(', ')} (also "ig", "tik tok", "newsletter", "status")`);
const regionList = list.describe('Countries, cities or codes, e.g. "Nigeria", "Lagos", "US", "UK", "worldwide"');
const eventRef = (id) => (EVENT_IDS.includes(id) ? id : findEventsInText(id ?? '')[0] ?? id);

const json = (data) => ({ content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] });
const fail = (err) => ({ isError: true, content: [{ type: 'text', text: `Error: ${err.message}` }] });
const wrap = (fn) => async (args) => { try { return await fn(args); } catch (e) { return fail(e); } };

/** @param {{ allowFileWrites?: boolean }} opts */
export function createServer({ allowFileWrites = false } = {}) {
  const server = new McpServer({ name: 'quarter4', version: VERSION });

  async function maybeWrite(outputPath, content, allowed) {
    if (!outputPath) return null;
    if (!allowFileWrites) throw new Error('outputPath is only supported when the server runs locally (stdio). Copy the returned content instead.');
    const ext = extname(outputPath).toLowerCase();
    if (!allowed.includes(ext)) throw new Error(`outputPath must end with ${allowed.join(' or ')}`);
    const full = resolve(outputPath);
    await writeFile(full, content, 'utf8');
    return full;
  }

  server.registerTool('event_calendar', {
    title: 'Holiday, shopping and events calendar',
    description: 'List holidays, shopping days, religious and cultural events and observances for any date range and region, with exact dates, days until each, when to start promoting, content angles and hashtags. Defaults to the next 90 days. Use this before planning any campaign.',
    inputSchema: {
      year: z.number().int().min(2024).max(2030).optional().describe('Season year; default current year'),
      from: date.optional().describe('Start date inclusive; default today'),
      to: date.optional().describe('End date inclusive; default 90 days from start'),
      regions: regionList.optional(),
      categories: z.array(z.enum(CATEGORIES)).optional(),
      minImpact: z.enum(['low', 'medium', 'high']).optional(),
      includePast: z.boolean().optional().describe('Include events that already ended; default false'),
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  }, wrap(async (a) => {
    const places = a.regions ? normalizeRegions(a.regions) : null;
    const events = listEvents({ ...a, regions: places?.values });
    if (places?.unknown.length) return json({ count: events.length, events, unknownPlaces: places.unknown, note: `Could not place: ${places.unknown.join(', ')}. Showing events for the rest (worldwide if none).` });
    return json({ count: events.length, events, note: 'Lunar-calendar dates (Diwali, Dhanteras, Hanukkah) are verified for 2026-2028. Hanukkah begins at sundown.' });
  }));

  server.registerTool('content_plan', {
    title: 'Build a content plan',
    description: 'Generate a day-by-day content calendar per platform for the coming weeks. Niche-aware (angles, hooks and shots fit the product), audience-aware (events ranked by relevance to the regions) and cadence-aware (email and WhatsApp capped to avoid unsubscribes). Each slot is tied to a campaign phase (tease, warm-up, early-access, launch, last-chance, thank-you) for the most important upcoming event, or an evergreen pillar on quiet days. Observances like Remembrance Day get no-sales guidance. Returns slots you then fill with captions and assets.',
    inputSchema: {
      brand: z.string().min(1),
      niche: z.string().min(1).describe('What they sell, in their words, e.g. "sneakers in Lagos", "online fitness coaching"'),
      product: z.string().optional(),
      platforms: platformList,
      regions: regionList.optional(),
      startDate: date.optional().describe('Default today'),
      endDate: date.optional().describe('Default 60 days from start'),
      postsPerWeek: z.number().int().min(1).max(7).optional().describe('Per platform; default 4'),
      focusEvents: z.array(z.string()).optional().describe('Events to campaign around, ids or names ("black friday", "eid", "valentines")'),
      offer: z.string().optional().describe('Written any way: "30% off", "N5k off", "BOGO", "free delivery"'),
      sellsProducts: z.boolean().optional().describe('false for creators who only publish content; default true'),
      format: z.enum(['json', 'markdown']).optional().describe('Default json'),
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  }, wrap(async (a) => {
    const plan = buildPlan(a);
    return a.format === 'markdown' ? { content: [{ type: 'text', text: toMarkdown(plan) }] } : json(plan);
  }));

  server.registerTool('platform_specs', {
    title: 'Platform content specs',
    description: 'Image/video sizes, aspect ratios, length limits, caption limits, safe zones, posting cadence and tips for Instagram, TikTok, YouTube, LinkedIn, X, Facebook, Pinterest, Threads, WhatsApp and email.',
    inputSchema: { platforms: platformList.optional().describe('Default: all') },
    annotations: { readOnlyHint: true, openWorldHint: false },
  }, wrap(async (a) => json(getSpecs(a.platforms ? normalizePlatforms(a.platforms).values : undefined))));

  server.registerTool('asset_brief', {
    title: 'Content asset brief',
    description: 'Create a production brief for one post, image, carousel, story, video or email: exact specs, hook formulas, structure, image-generation prompt with the right size per tool (Midjourney, GPT Image, Imagen, Flux), video beat sheet and shot list, and a compliance checklist (ad disclosure, pricing, giveaways, AI labels, music).',
    inputSchema: {
      platform: z.string().describe('Any spelling: instagram/ig, tiktok, whatsapp, email...'),
      assetType: z.enum(ASSET_TYPES),
      niche: z.string().optional().describe('What they sell, in their words; tailors hooks, shots and compliance'),
      format: z.string().optional().describe('Platform format id from platform_specs, e.g. "reel", "carousel"'),
      brand: z.string().min(1),
      product: z.string().optional(),
      offer: z.string().optional(),
      eventId: z.string().optional().describe('Event id or name, e.g. "black-friday", "valentines", "eid"'),
      phase: z.enum(['tease', 'warm-up', 'early-access', 'launch', 'last-chance', 'thank-you']).optional(),
      tone: z.string().optional(),
      videoSeconds: z.union([z.literal(15), z.literal(30), z.literal(60)]).optional(),
      sponsored: z.boolean().optional().describe('Paid partnership, gifted or affiliate'),
      giveaway: z.boolean().optional(),
      aiGenerated: z.boolean().optional().describe('Asset will use AI-generated imagery/video'),
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  }, wrap(async (a) => json(buildBrief({ ...a, eventId: a.eventId ? eventRef(a.eventId) : undefined }))));

  server.registerTool('landing_page', {
    title: 'Sales landing page',
    description: `Generate a premium, ready-to-deploy sales page (one HTML file) built around what the user sells. Works from minimal input (brand + product): the copy is written from the facts given and never invents reviews, guarantees or prices.
An art director picks the page structure from the niche: cinematic full-bleed scenes for cars, gadgets and fitness; a split showcase (sticky photos beside scrolling story) for fashion, home, food and services; a product stage (product spins and zooms with scroll, stickers pop) for shoes, beauty, jewellery and kids; editorial for courses, software and digital products. Motion is scroll-linked (pinned scenes, scrubbed zoom, horizontal galleries, text that fills as you scroll), not timed fades. Fonts, navigation, buttons and countdown style vary per brand (re-roll with variant).
Media: pass the seller's own photos (images, productImage), a turntable video (videoUrl, scrubbed by scroll) or a 3D model (modelUrl, .glb, rotates with scroll and can be dragged). With no media, free mood photos are fetched automatically (autoImages).
A holiday theme (${Object.keys(THEMES).join(', ')}) adds its palette and name; with layout "signature" and no product, the art-directed holiday scenes are used instead.
Includes an honest countdown, sticky mobile CTA, SEO/Open Graph tags, Product/Offer structured data and photo credits. Deploy to Netlify Drop, Vercel, GitHub Pages or Cloudflare Pages.`,
    inputSchema: {
      brand: z.string().min(1),
      product: z.string().optional().describe('What is on sale, in plain words: "sneakers", "ankara dresses", "used cars", "online course"'),
      niche: z.string().optional().describe('Optional extra context about the business, in the user\'s words'),
      theme: z.enum(Object.keys(THEMES)).optional().describe('Holiday accent'),
      eventName: z.string().optional().describe('Event label when no theme fits, e.g. "Eid", "Mother\'s Day"'),
      layout: z.enum(LAYOUTS).optional().describe('Default: director when the product is known; "signature" forces the holiday scene'),
      archetype: z.enum(['cinematic', 'split', 'stage', 'editorial']).optional().describe('Override the art director'),
      variant: z.number().int().min(0).max(99).optional().describe('Re-roll fonts, nav, buttons and countdown style'),
      images: z.array(z.union([z.string(), z.object({ url: z.string(), alt: z.string().optional(), attribution: z.string().optional() })])).max(8).optional().describe('Photos, best first. Use the seller\'s own product photos when possible'),
      productImage: z.string().optional().describe('Product photo, ideally a cut-out PNG on transparent background'),
      products: z.array(z.object({ name: z.string(), price: z.string().optional(), originalPrice: z.string().optional(), image: z.string().optional(), note: z.string().optional(), url: z.string().optional() })).max(12).optional().describe('Items on sale; shown as a product grid. With a WhatsApp ctaUrl each card opens a prefilled order chat'),
      videoUrl: z.string().optional().describe('Short turntable/walkaround video (mp4); scroll scrubs through it'),
      modelUrl: z.string().optional().describe('3D model (.glb); rotates with scroll'),
      autoImages: z.boolean().optional().describe('Fetch free mood photos when no media is given (default true)'),
      offer: z.string().optional().describe('e.g. "40% off everything"'),
      discountPercent: z.number().min(1).max(99).optional(),
      price: z.string().optional(),
      originalPrice: z.string().optional().describe('Only a price you actually charged recently'),
      currency: z.string().length(3).optional(),
      ctaText: z.string().optional(),
      ctaUrl: z.string().optional().describe('Checkout, WhatsApp (https://wa.me/...) or product link. If omitted the button links to "#"'),
      deadline: z.string().optional().describe('ISO 8601 with offset, e.g. 2026-11-30T23:59:00-05:00'),
      timeZone: z.string().optional().describe('IANA zone for the printed deadline, e.g. Africa/Lagos'),
      headline: z.string().optional(),
      subheadline: z.string().optional(),
      imageUrl: z.string().optional(),
      imageAlt: z.string().optional(),
      features: z.array(z.object({ title: z.string(), text: z.string() })).max(6).optional(),
      testimonials: z.array(z.object({ quote: z.string(), name: z.string(), detail: z.string().optional() })).max(3).optional().describe('Real customer quotes only, with permission'),
      faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
      terms: z.string().optional(),
      brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
      pageUrl: z.string().optional(),
      effects: z.boolean().optional().describe('false turns off particles and 3D motion'),
      outputPath: z.string().optional().describe('Local mode only: write the HTML here (.html)'),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
  }, wrap(async (a) => {
    const notes = [];
    const hasMedia = a.images?.length || a.productImage || a.videoUrl || a.modelUrl || a.imageUrl;
    if (!hasMedia && a.autoImages !== false && a.layout !== 'signature') {
      const nicheId = classifyNiche(`${a.niche ?? ''} ${a.product ?? ''}`).id;
      const query = MOOD_QUERIES[nicheId]?.[0] ?? `${a.product ?? 'shopping'} lifestyle`;
      const found = await Promise.race([findImages(query, { orientation: 'landscape', count: 4 }).catch(() => null), new Promise((r) => setTimeout(() => r(null), 8000))]);
      if (found?.images.length) {
        a = { ...a, images: found.images.map((im) => ({ url: im.url, alt: im.alt, attribution: im.attribution })) };
        notes.push(`Added ${found.images.length} free mood photos for "${query}" (${found.providersTried.join(', ')}). Check them before publishing; replace with your own product photos for the best result.`);
        if (!found.providersTried.some((p) => p === 'pexels' || p === 'unsplash')) notes.push('For studio-quality photos set PEXELS_API_KEY or UNSPLASH_ACCESS_KEY (both free).');
      } else notes.push('No photos found in time; the page uses typography. Add images, productImage, videoUrl or modelUrl for a richer page.');
    }
    const html = buildLanding(a);
    const summary = describeLanding(a);
    if (!a.ctaUrl) notes.push('The button links to "#". Add ctaUrl (checkout, product page or https://wa.me/<number>) before publishing.');
    if (!a.deadline) notes.push('No deadline given, so there is no countdown.');
    const written = await maybeWrite(a.outputPath, html, ['.html', '.htm']);
    const head = `${JSON.stringify({ ...summary, notes }, null, 2)}\n`;
    return { content: [{ type: 'text', text: written ? `Landing page written to ${written} (${html.length} bytes).\n${head}` : `${head}\n${html}` }] };
  }));

  server.registerTool('export_plan', {
    title: 'Export content plan',
    description: 'Export a content plan from content_plan as CSV (Google Sheets, Notion, Airtable), ICS (Google/Apple/Outlook calendar) or Markdown. Pass the same arguments you used for content_plan.',
    inputSchema: {
      brand: z.string().min(1),
      niche: z.string().min(1),
      product: z.string().optional(),
      platforms: platformList,
      regions: regionList.optional(),
      startDate: date.optional(),
      endDate: date.optional(),
      postsPerWeek: z.number().int().min(1).max(7).optional(),
      focusEvents: z.array(z.string()).optional(),
      offer: z.string().optional(),
      sellsProducts: z.boolean().optional(),
      as: z.enum(['csv', 'ics', 'markdown']),
      outputPath: z.string().optional().describe('Local mode only: write the file here'),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  }, wrap(async (a) => {
    const plan = buildPlan(a);
    const out = a.as === 'csv' ? toCSV(plan.slots) : a.as === 'ics' ? toICS(plan.slots, `${a.brand} content plan`) : toMarkdown(plan);
    const written = await maybeWrite(a.outputPath, out, { csv: ['.csv'], ics: ['.ics'], markdown: ['.md'] }[a.as]);
    return { content: [{ type: 'text', text: written ? `Wrote ${plan.slots.length} slots to ${written}.` : out }] };
  }));

  server.registerTool('start_campaign', {
    title: 'Start here: understand the request',
    description: 'Call this FIRST with whatever the user wrote, even if vague or misspelled ("i sell sneakers in lagos, need bf content for ig"). Returns what was understood (niche, product, platforms, regions, currency, offer, deadline), the assumptions made, at most 3 blocking questions, the events that matter for this audience ranked by relevance, what to post right now, compliance notes for the niche, the landing page direction, and prefilled arguments for the next tool calls. Questions are never blocking: ask them in one short message and continue with the defaults shown.',
    inputSchema: {
      description: z.string().min(1).describe("The user's request in their own words"),
      brand: z.string().optional(),
      product: z.string().optional(),
      platforms: platformList.optional(),
      regions: regionList.optional(),
      offer: z.string().optional(),
      deadline: z.string().optional().describe('Any form: "Nov 30", "30/11", "black friday"'),
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
      live: z.boolean().optional().describe('Include official public holidays from live data (default true)'),
  }, wrap(async (a) => {
    const r = startCampaign(a);
    if (a.live !== false && r.understood.countries.length) {
      // Live official holidays for the named countries; never block on a slow source.
      const live = await Promise.race([
        upcomingHolidays(r.understood.countries, { days: 90 }),
        new Promise((res) => setTimeout(() => res({ holidays: [], errors: ['live holidays timed out'] }), 7000)),
      ]);
      r.publicHolidays = live.holidays.map((h) => ({ date: h.date, name: h.name, country: h.countryName, daysUntil: h.daysUntil }));
      if (live.errors.length) r.liveDataNotes = live.errors;
    }
    return json(r);
  }));

  server.registerTool('whats_on', {
    title: "What's happening now",
    description: 'Live data for content ideas: today\'s top searches per country (Google Trends), official public holidays coming up (100+ countries), and what the world is reading (Wikipedia). Flags sensitive topics that brands must not use for promotion and marks trends that fit the niche. Use it to make posts timely, plan around public holidays, and spot trends worth a quick story or reel.',
    inputSchema: {
      places: regionList.describe('Countries, cities or continents, e.g. "Nigeria, UK", "West Africa", "Dubai"'),
      niche: z.string().optional().describe('What they sell, to mark trends that fit'),
      days: z.number().int().min(7).max(180).optional().describe('Holiday look-ahead in days (default 60)'),
    },
    annotations: { readOnlyHint: true, openWorldHint: true },
  }, wrap(async (a) => {
    const { countries, unknown } = normalizeRegions(a.places);
    const n = a.niche ? NICHES[classifyNiche(a.niche).id] : null;
    const r = await whatsOn({ countries, days: a.days, keywords: n ? [...n.keywords, ...a.niche.toLowerCase().split(/\W+/).filter((w) => w.length > 3)] : [] });
    return json({ countries, ...(unknown.length ? { unknownPlaces: unknown } : {}), ...r });
  }));

  server.registerTool('find_images', {
    title: 'Find free, licensed photos',
    description: "Search commercially usable photos for pages and posts. Uses Pexels or Unsplash when PEXELS_API_KEY or UNSPLASH_ACCESS_KEY is set (best quality), otherwise Wikimedia Commons and Openverse. Each result has its licence, author and an attribution line. Photos that likely show other brands' logos are removed by default. Use stock photos for mood and backgrounds; the product itself should be the seller's own photo.",
    inputSchema: {
      query: z.string().min(2).describe('Describe the scene, e.g. "sneakers on wet street at night"'),
      orientation: z.enum(['landscape', 'portrait', 'squarish']).optional(),
      count: z.number().int().min(1).max(20).optional(),
      allowBrands: z.boolean().optional(),
    },
    annotations: { readOnlyHint: true, openWorldHint: true },
  }, wrap(async (a) => json(await findImages(a.query, a))));

  // ---- Quarter4 Cloud: publish, measure, own domain, billing ----
  server.registerTool('publish_page', {
    title: 'Publish a page online',
    description: 'Put a sales page online and get a shareable link, e.g. https://q4-korakicks.erasstack.com/black-friday. Pass the HTML from landing_page, a local file path (local mode), or "page" with landing_page arguments to build and publish in one step. Free plan: 1 site, 3 live pages, small badge. Pro adds the user\'s own domain and removes the badge. Needs QUARTER4_API_KEY (get one free with cloud_account action "signup").',
    inputSchema: {
      brand: z.string().min(1).describe('Brand name; becomes the address q4-<brand>.erasstack.com'),
      path: z.string().optional().describe('Page path, e.g. "black-friday"; empty for the home page'),
      html: z.string().optional(),
      file: z.string().optional().describe('Local mode: path to an .html file'),
      page: z.record(z.string(), z.any()).optional().describe('landing_page arguments to build and publish in one call'),
      title: z.string().optional(),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
  }, wrap(async (a) => {
    let pageHtml = a.html;
    if (!pageHtml && a.file) {
      if (!allowFileWrites) throw new Error('file is only supported when the server runs locally. Pass html instead.');
      pageHtml = await readFile(a.file, 'utf8');
    }
    if (!pageHtml && a.page) pageHtml = buildLanding({ brand: a.brand, ...a.page });
    if (!pageHtml) throw new Error('Send html, file or page.');
    const r = await cloud.publish({ brand: a.brand, path: a.path, html: pageHtml, title: a.title });
    return json({ ...r, share: `Share this link on WhatsApp, Instagram bio and Status: ${r.url}` });
  }));

  server.registerTool('page_stats', {
    title: 'Page results',
    description: 'Views, WhatsApp order clicks and button clicks for published pages, broken down per product (e.g. "Runner One: 48 WhatsApp clicks"). Use it to tell the user what is selling and what to push next.',
    inputSchema: { days: z.number().int().min(1).max(365).optional().describe('Look-back window, default 30 (free plan keeps 7)') },
    annotations: { readOnlyHint: true, openWorldHint: true },
  }, wrap(async (a) => json(await cloud.stats(a.days ?? 30))));

  server.registerTool('connect_domain', {
    title: 'Connect your own domain',
    description: 'Pro: serve published pages on the user\'s own domain (e.g. sale.korakicks.com) with automatic HTTPS. Returns the one DNS record to add. Call again with check: true to see if it is live.',
    inputSchema: { hostname: z.string().min(4), check: z.boolean().optional(), site: z.string().optional().describe('Which brand site, if more than one') },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
  }, wrap(async (a) => json(a.check ? await cloud.domainStatus(a.hostname) : await cloud.connectDomain(a.hostname, a.site))));

  server.registerTool('cloud_account', {
    title: 'Quarter4 account and plans',
    description: 'Quarter4 Cloud account. action "signup" emails a free API key to the given email. "status" shows plan, limits and published sites. "upgrade" returns a secure Flutterwave checkout link for Pro (NGN 9,900 or USD 9 a month) or Business (NGN 39,000 or USD 39 a month). Never ask for card details in chat; always send the link.',
    inputSchema: {
      action: z.enum(['signup', 'status', 'upgrade', 'pages']),
      email: z.string().optional(),
      plan: z.enum(['pro', 'business']).optional(),
      currency: z.enum(['NGN', 'USD']).optional(),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
  }, wrap(async (a) => {
    if (a.action === 'signup') { if (!a.email) throw new Error('Send the user\'s email.'); return json(await cloud.signup(a.email)); }
    if (a.action === 'status') return json(await cloud.me());
    if (a.action === 'pages') return json(await cloud.pages());
    const r = await cloud.checkout(a.plan ?? 'pro', a.currency ?? 'NGN');
    return json({ ...r, note: 'Send this link to the user. Payment happens on Flutterwave\'s secure page; the plan activates as soon as the payment is verified.' });
  }));

  // Prompts: reusable workflows for clients without skills (ChatGPT, Claude Desktop).
  server.registerPrompt('q4-campaign', {
    title: 'Plan my campaign',
    description: 'Campaign for the coming weeks: key dates, content plan, posts and a landing page.',
    argsSchema: { brand: z.string(), niche: z.string(), platforms: z.string().describe('comma-separated'), region: z.string().optional() },
  }, ({ brand, niche, platforms, region }) => ({
    messages: [{ role: 'user', content: { type: 'text', text:
`Plan a campaign for ${brand} (${niche}) on ${platforms}${region ? ` for ${region}` : ''}.
1. Call start_campaign with my request, then event_calendar for upcoming events in my region and pick the 3-5 that matter most for this niche. Explain why in one line each.
2. Ask me for my main offer, price, real previous price, and deadline if I haven't given them.
3. Call content_plan, then show the plan as a table grouped by week.
4. For the next 7 days of slots, write ready-to-post captions (within each platform's limits) and call asset_brief for each visual.
5. Offer to build a landing page with landing_page and export the plan with export_plan.
Keep every claim about prices, scarcity and deadlines true; flag anything that needs ad disclosure.` } }],
  }));

  server.registerPrompt('q4-video-script', {
    title: 'Short video script',
    description: 'Short-form video script with hook, beats, shot list and captions for an event or sale.',
    argsSchema: { brand: z.string(), product: z.string(), event: z.string().describe('event id, e.g. black-friday'), platform: z.string() },
  }, ({ brand, product, event, platform: p }) => ({
    messages: [{ role: 'user', content: { type: 'text', text:
`Write a 30-second ${p} video script for ${brand}'s ${product} for ${event}.
Call asset_brief (assetType "video", videoSeconds 30, eventId "${event}") first and follow its specs, safe zone and checklist.
Give: 3 hook options, the beat sheet with shot / on-screen text / voiceover per beat, a caption with hashtags, and the music/disclosure notes.` } }],
  }));

  return server;
}
