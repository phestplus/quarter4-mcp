import { readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { extname, resolve } from 'node:path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { buildBrief, ASSET_TYPES } from './brief.js';
import { EVENT_IDS, listEvents } from './calendar.js';
import { createCloud } from './cloud.js';
import { findImages, matchingImages, typeWords } from './images.js';
import { ASK_RULE, questionsFor } from './ask.js';
import { upcomingHolidays, whatsOn } from './live.js';
import { NICHES, classifyNiche } from './niches.js';
import { MOOD_QUERIES } from './start.js';
import { findEventsInText, normalizePlatforms, normalizeRegions } from './normalize.js';
import { startCampaign } from './start.js';
import { CATEGORIES, REGIONS } from './events.js';
import { toCSV, toICS, toMarkdown } from './export.js';
import { buildLanding, describeLanding, LAYOUTS, THEMES } from './landing.js';
import { buildPlan } from './plan.js';
import { buildKit } from './kit.js';
import { getSpecs, PLATFORM_IDS } from './specs.js';

export const VERSION = '0.4.1';

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
  // Local (stdio) servers can save the key that "connect" receives; the hosted server cannot.
  const cloud = createCloud({ persist: allowFileWrites, client: 'AI app' });
  server.server.oninitialized = () => { const c = server.server.getClientVersion?.(); if (c?.name) cloud.clientName?.(c.name); };

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
      featured: z.array(z.string()).max(5).optional().describe('Products to push, best seller first. When connected to Quarter4 Cloud this is filled from real WhatsApp order taps.'),
      useStats: z.boolean().optional().describe('Use sales page stats to pick featured products (default true when connected)'),
      format: z.enum(['json', 'markdown']).optional().describe('Default json'),
    },
    annotations: { readOnlyHint: true, openWorldHint: true },
  }, wrap(async (a) => {
    let signals;
    if (!a.featured?.length && a.useStats !== false && cloud.hasKey()) {
      const st = await cloud.stats(14).catch(() => null);
      const items = {};
      for (const p of st?.pages ?? []) for (const [k, n] of Object.entries(p.byItem ?? {})) items[k] = (items[k] ?? 0) + n;
      const top = Object.entries(items).sort((x, y) => y[1] - x[1]).slice(0, 3);
      if (top.length) {
        a = { ...a, featured: top.map(([k]) => k) };
        signals = { source: 'Quarter4 page stats, last 14 days', topProducts: top.map(([name, taps]) => ({ name, orderTaps: taps })), tip: `${top[0][0]} gets the most order taps, so selling posts feature it most often.` };
      }
    }
    const plan = { ...buildPlan(a), ...(signals ? { salesSignals: signals } : {}) };
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
    description: 'Put a sales page online and get a shareable link, e.g. https://q4-korakicks.erasstack.com/black-friday. Pass the HTML from landing_page, a local file path (local mode), or "page" with landing_page arguments to build and publish in one step. Free plan: 1 site, 3 live pages, small badge. Pro adds the user\'s own domain and removes the badge. If not connected yet, call cloud_account with action "connect" first (free, one browser approval).',
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
    description: 'Quarter4 Cloud account. "connect" links this AI app to the user account: it returns a link and code the user approves in their browser (new users get a free account); call it again to finish. "status" shows plan, limits and sites. "pages" lists published pages. "dashboard" returns the web dashboard link (views, WhatsApp orders per product, plan). "upgrade" returns a secure Flutterwave card checkout link for Pro or Business, priced in Naira for Nigeria and US Dollars elsewhere. "signup" (fallback) emails a key instead. Never ask for passwords or card details in chat; always send the link.',
    inputSchema: {
      action: z.enum(['connect', 'status', 'pages', 'dashboard', 'upgrade', 'signup']),
      email: z.string().optional(),
      plan: z.enum(['pro', 'business']).optional(),
      currency: z.enum(['NGN', 'USD']).optional(),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
  }, wrap(async (a) => {
    if (a.action === 'connect') return json(await cloud.connect());
    if (a.action === 'dashboard') return json({ url: cloud.dashboardUrl(), note: 'The user signs in with their email; no password.' });
    if (a.action === 'signup') { if (!a.email) throw new Error('Send the user\'s email.'); return json(await cloud.signup(a.email)); }
    if (a.action === 'status') return json(await cloud.me());
    if (a.action === 'pages') return json(await cloud.pages());
    const r = await cloud.checkout(a.plan ?? 'pro', a.currency);
    return json({ ...r, note: 'Send this link to the user. Payment happens on Flutterwave\'s secure page; the plan activates as soon as the payment is verified.' });
  }));

  // Local photo studio: runs scripts/studio_photo.py on the user's machine (free, private, no upload).
  const studioScript = fileURLToPath(new URL('../scripts/studio_photo.py', import.meta.url));
  const runPython = (args) => new Promise((resolveP, reject) => {
    const tryCmd = (cmds) => {
      if (!cmds.length) return reject(new Error('Python 3 was not found. Install it from python.org, then: pip install pillow "rembg[cpu]"'));
      const [cmd, ...pre] = cmds[0];
      const ps = spawn(cmd, [...pre, ...args], { windowsHide: true });
      let out = '', err = '';
      ps.stdout.on('data', (d) => { out += d; });
      ps.stderr.on('data', (d) => { err += d; });
      ps.on('error', () => tryCmd(cmds.slice(1)));
      ps.on('close', (code) => (code === 0 ? resolveP(out) : /No module named 'PIL'/.test(err) ? reject(new Error('Install Pillow first: pip install pillow "rembg[cpu]"')) : reject(new Error(err.split('\n').filter(Boolean).pop() || `studio_photo exited ${code}`))));
    };
    tryCmd(process.platform === 'win32' ? [['py', '-3'], ['python'], ['python3']] : [['python3'], ['python']]);
  });

  server.registerTool('studio_photo', {
    title: 'Studio product photo',
    description: 'Turn a seller\'s phone photo into a clean product shot on their own computer (free, nothing uploaded): fixes colour and sharpness, removes the background (when rembg is installed) and places the product on a studio backdrop in the brand colour or on a full scene photo, with a soft shadow. Use the result as products[].image in content_kit or landing_page. Local only.',
    inputSchema: {
      input: z.string().describe('Path to the photo (or an https URL to download)'),
      outputPath: z.string().optional().describe('Where to save, .jpg or .png (default: next to the input, "-studio.jpg")'),
      background: z.string().optional().describe('Backdrop colour, e.g. "#111111" (default warm light grey)'),
      scene: z.string().optional().describe('Path to a photo to use as the full background instead of a colour'),
      size: z.number().int().min(600).max(3000).optional(),
      keepBackground: z.boolean().optional().describe('Only enhance; do not remove the background'),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  }, wrap(async (a) => {
    if (!allowFileWrites) throw new Error('studio_photo runs on your own computer. Use the local Quarter4 server (npx quarter4-mcp), or ask the assistant to clean up the photo with its own image tools.');
    let input = a.input;
    if (/^https:\/\//.test(input)) {
      const r = await fetch(input, { signal: AbortSignal.timeout(20000) });
      if (!r.ok || !/^image\//.test(r.headers.get('content-type') ?? '')) throw new Error('That link is not an image.');
      input = resolve(`quarter4-photo-${Date.now()}.jpg`);
      await writeFile(input, Buffer.from(await r.arrayBuffer()));
    }
    if (!existsSync(input)) throw new Error(`File not found: ${input}`);
    const out = a.outputPath ?? input.replace(/(\.[a-z0-9]+)?$/i, '-studio.jpg');
    const args = [studioScript, input, out, '--size', String(a.size ?? 1600)];
    if (a.background) args.push('--bg', a.background);
    if (a.scene) args.push('--scene', a.scene);
    if (a.keepBackground) args.push('--keep-bg');
    const line = (await runPython(args)).trim().split('\n').pop();
    return json({ ...JSON.parse(line), next: 'Pass this file as products[].image to content_kit or landing_page.' });
  }));

  server.registerTool('brand_profile', {
    title: 'Saved brand profile',
    description: 'Save or read the seller\'s brand profile in Quarter4 Cloud (needs connect): voice, products with real prices, order link, colours and logo. Saved details fill in content_kit and sales pages automatically, so the seller does not repeat them. Logo and colours on graphics are a Pro feature. Only save prices the seller gave you.',
    inputSchema: {
      action: z.enum(['get', 'save']),
      profile: z.object({
        brand: z.string().optional(), niche: z.string().optional(), voice: z.string().max(300).optional().describe('How the brand talks, e.g. "playful, Lagos slang, short sentences"'),
        ctaUrl: z.string().optional(), logoUrl: z.string().optional(), brandColor: z.string().optional(),
        products: z.array(z.object({ name: z.string(), price: z.string().optional(), originalPrice: z.string().optional(), note: z.string().optional(), image: z.string().optional() })).max(20).optional(),
      }).optional(),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
  }, wrap(async (a) => json(a.action === 'save' ? await cloud.saveBrand(a.profile ?? {}) : await cloud.brand())));

  server.registerTool('content_kit', {
    title: 'Ready-to-post content kit',
    description: `Make finished social graphics with captions for a sale or launch: offer post (4:5), product spotlights (1:1), a carousel, Story/WhatsApp Status (9:16), a last-call story and an X/LinkedIn card (16:9). Returns a review page where the seller edits captions, then taps Share (phone share sheet: Instagram, TikTok, WhatsApp with the image attached), uses share links, copies captions or downloads PNGs. Nothing is posted automatically.
Connected to Quarter4 Cloud: the kit is hosted at a link (Free: 7 days with a small mark; Pro: 90 days, no mark, own logo and colours). Not connected (local): an HTML file is written instead.
Images: the seller's own photos are best (products[].image or images). If you can generate images yourself, generate them and pass their https URLs. Otherwise free licensed photos are found automatically (autoImages). Never invent prices or deadlines; leave them out if unknown.`,
    inputSchema: {
      brand: z.string().min(1),
      product: z.string().optional().describe('What is on sale, e.g. "sneakers"'),
      niche: z.string().optional(),
      theme: z.string().optional().describe(`Event look: ${Object.keys(THEMES).join(', ')}`),
      offer: z.string().optional().describe('e.g. "30% off"'),
      discountPercent: z.number().min(1).max(95).optional(),
      price: z.string().optional(), originalPrice: z.string().optional(),
      deadline: z.string().optional().describe('ISO date-time the offer ends'), timeZone: z.string().optional(),
      ctaUrl: z.string().optional().describe('Checkout, product page or https://wa.me/<number>'),
      pageUrl: z.string().optional().describe('The live sales page link from publish_page, used in captions and share links'),
      products: z.array(z.object({ name: z.string(), price: z.string().optional(), originalPrice: z.string().optional(), note: z.string().optional(), image: z.string().optional() })).max(6).optional(),
      images: z.array(z.object({ url: z.string(), alt: z.string().optional() })).max(6).optional(),
      posts: z.array(z.object({ id: z.string().optional(), format: z.enum(['post', 'square', 'story', 'wide']).optional(), title: z.string().optional(), headline: z.string().optional(), sub: z.string().optional(), caption: z.string().optional(), image: z.string().optional() })).max(12).optional()
        .describe('Your own copy: replace a caption by id (offer, product-1, carousel, story, last-call, wide) or add extra posts with a headline'),
      logoUrl: z.string().optional().describe('Pro: brand logo (https)'),
      brandColor: z.string().optional().describe('Pro: brand colour, e.g. "#e11d48"'),
      autoImages: z.boolean().optional().describe('Find free photos when none are given (default true)'),
      productPhotos: z.enum(['own', 'representative', 'none']).optional().describe('What the seller chose for products without photos: "own" (they are sending photos: pass them as products[].image), "representative" (closest real photo, tagged "Representative image"), "none" (text-led product posts). If you can generate images and the seller wants that, generate them and pass the URLs as products[].image. Ask the seller before choosing.'),
      kitId: z.string().regex(/^[a-f0-9]{12}$/).optional().describe('Update an existing kit at the same link (e.g. after the seller sends new photos)'),
      outputPath: z.string().optional().describe('Local mode: where to write the kit .html'),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
  }, wrap(async (a) => {
    const notes = [];
    let plan = 'free';
    if (cloud.hasKey()) {
      plan = (await cloud.me().catch(() => null))?.plan ?? 'free';
      // Saved brand profile fills anything not given in this request.
      const saved = (await cloud.brand().catch(() => null))?.profile;
      if (saved) {
        const fill = Object.fromEntries(['product', 'niche', 'ctaUrl', 'logoUrl', 'brandColor', 'products'].filter((k) => a[k] === undefined && saved[k] !== undefined).map((k) => [k, saved[k]]));
        if (Object.keys(fill).length) { a = { ...fill, ...a }; notes.push(`Filled from your saved brand profile: ${Object.keys(fill).join(', ')}.`); }
      }
    }
    const paid = plan !== 'free';
    if (!paid && (a.logoUrl || a.brandColor)) { notes.push('Your logo and brand colour on graphics are part of Pro. This kit uses the event look; upgrade with cloud_account action "upgrade".'); a = { ...a, logoUrl: undefined, brandColor: undefined }; }
    // Mood photos must actually show this kind of product (and no other brand). Products themselves are
    // only shown with the seller's photos; kit graphics wait for an upload otherwise.
    // Photos are decided in the chat, before anything is made: if a product has no photo and the
    // seller has not chosen what to do, ask (own photos, representative, generated, or none).
    const missing = (a.products ?? []).filter((p) => !p.image);
    if (missing.length && !a.productPhotos) {
      const names = missing.slice(0, 4).map((p) => p.name).join(', ') + (missing.length > 4 ? ', ...' : '');
      return json({
        needsAnswer: true,
        askUser: [{ field: 'productPhotos', question: `I need a photo for ${names}. Send your photos (phone photos are fine, I can clean them up), or should I use representative photos (tagged as such on the post), create images, or make these posts without photos?`, why: 'Buyers trust real photos; anything else is clearly labelled.' }],
        howToAsk: 'Ask this in one short message. Then call content_kit again with the same details plus productPhotos ("own" with products[].image set, "representative", or "none"). If the seller wants created images and you can generate images, generate them and pass the URLs as products[].image with productPhotos "own". If they send phone photos and studio_photo is available, run it first for a clean product shot.',
      });
    }
    if (a.productPhotos === 'representative' && missing.length) {
      const nicheId = classifyNiche(`${a.niche ?? ''} ${a.product ?? ''}`).id;
      const search = cloud.hasKey() && !process.env.PEXELS_API_KEY && !process.env.UNSPLASH_ACCESS_KEY ? (q, opt) => cloud.images(q, opt) : null;
      const used = new Set();
      const filled = await Promise.all(a.products.map(async (p) => {
        if (p.image) return p;
        const attributes = (p.name.match(/\b(white|black|red|blue|green|pink|brown|grey|gray|gold|silver|leather|suede|denim|silk|linen|low|high|slide|sandal|boot|runner|running)\b/gi) ?? []).join(' ');
        const r = await Promise.race([matchingImages({ nicheId, product: a.product ?? p.name, attributes, orientation: 'squarish', count: 4, search, productShot: true, mustMatch: typeWords(p.name) }).catch(() => null), new Promise((res) => setTimeout(() => res(null), 9000))]);
        const pick = r?.images.find((im) => !used.has(im.url));
        if (!pick) return p;
        used.add(pick.url);
        return { ...p, image: pick.url, representative: true, credit: pick.attribution };
      }));
      const reps = filled.filter((p) => p.representative);
      if (reps.length) notes.push(`${reps.length} product post(s) use a representative photo (tagged on the graphic) because no photo was given: ${reps.map((p) => p.name).join(', ')}. Ask for the seller's own photos to replace them; buyers trust real photos most.`);
      a = { ...a, products: filled };
    }
    if (!a.images?.length && a.autoImages !== false) {
      const nicheId = classifyNiche(`${a.niche ?? ''} ${a.product ?? ''}`).id;
      const attributes = (a.products ?? []).map((p) => p.name).join(' ').match(/\b(white|black|red|blue|green|pink|brown|gold|silver|leather|denim|silk|linen)\b/i)?.[1] ?? '';
      const search = cloud.hasKey() && !process.env.PEXELS_API_KEY && !process.env.UNSPLASH_ACCESS_KEY ? (q, opt) => cloud.images(q, opt) : null;
      const found = await Promise.race([matchingImages({ nicheId, product: a.product ?? '', attributes, orientation: 'squarish', count: 3, search }).catch(() => null), new Promise((r) => setTimeout(() => r(null), 9000))]);
      if (found?.images.length) {
        a = { ...a, images: found.images.map((im) => ({ url: im.url, alt: im.alt })) };
        notes.push(`Offer and story posts use ${found.images.length} licensed photos that match "${found.query}" (checked for the product type, no other brands). Credits: ${found.images.map((im) => im.attribution).filter(Boolean).join('; ')}.`);
      } else notes.push(`No photo clearly matching "${a.product ?? 'the product'}" was found, so offer posts use bold type instead of an unrelated picture.`);
    }
    if (!a.price && !a.products?.length) notes.push('No prices given, so graphics show the offer without prices.');
    const hosted = cloud.hasKey();
    // Local photo files (e.g. from studio_photo): embedded in a local kit, uploaded into a hosted kit.
    const localFiles = [];
    if (allowFileWrites) {
      a = { ...a, products: await Promise.all((a.products ?? []).map(async (p, i) => {
        if (!p.image || /^(https?:|data:)/.test(p.image) || !existsSync(p.image)) return p;
        const buf = await readFile(p.image);
        const type = /\.png$/i.test(p.image) ? 'image/png' : /\.webp$/i.test(p.image) ? 'image/webp' : 'image/jpeg';
        localFiles.push({ key: String(i), buf, type });
        return { ...p, image: hosted ? undefined : `data:${type};base64,${buf.toString('base64')}`, representative: false };
      })) };
    }
    const kit = buildKit({ ...a, watermark: !paid, proxy: hosted ? (url, i) => (/^data:/.test(url) ? url : `/__q4/img/__KIT__/${i}`) : undefined });
    const { askUser, assumed } = questionsFor('kit', a);
    const summary = { posts: kit.posts, notes, ...(askUser.length ? { askUser, howToAsk: ASK_RULE } : {}), assumed };
    if (hosted) {
      const body = { brand: a.brand, html: kit.html, images: kit.images.filter((u) => !/^data:/.test(u)), title: `${a.brand} content kit` };
      const r = a.kitId ? await cloud.updateKit(a.kitId, body) : await cloud.kit(body);
      for (const f of localFiles) {
        const ok = await cloud.kitPhoto(r.id, f.key, f.buf, f.type).then(() => true, () => false);
        if (!ok) notes.push(`Could not upload the photo for product ${Number(f.key) + 1}. Try again with a JPEG or PNG under 4 MB.`);
      }
      return json({ url: r.url, kitId: r.id, ...(a.kitId ? { updated: 'Same link, updated in place.' } : {}), expiresAt: r.expiresAt, watermark: r.watermark, ...summary, share: `Open ${r.url} on your phone and tap Share on each post, or download the images.`, ...(r.note ? { planNote: r.note } : {}) });
    }
    if (!allowFileWrites) throw new Error(`Connect first to get a kit link: ${cloud.dashboardUrl()} (or call cloud_account action "connect" when running locally).`);
    const file = await maybeWrite(a.outputPath ?? `${a.brand.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-content-kit.html`, kit.html, ['.html', '.htm']);
    return json({ file, ...summary, next: 'Open the file in a browser to review, download and share. Call cloud_account action "connect" to get a link you can open on your phone.' });
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
