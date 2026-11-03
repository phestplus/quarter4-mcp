# Changelog

## 0.6.0 (2026-11-03)

- **Designed posts, not boxes:** mood and scene photos fill the whole post (full bleed) with a soft gradient so text stays readable; product photos show the whole product on a clean panel (no cropping); posts without photos lead with the offer in the brand's display font.
- **Vector elements from the brand:** each brand gets one consistent decoration style (rings, dot grid, arc or diagonal lines) drawn in its accent colour; information is designed in: a discount sticker on product posts, an end-date chip with a clock icon, and feature chips with check icons (`features`, up to 3 real facts).
- **Premium review page:** icon actions (download, copy, WhatsApp, X, Facebook, LinkedIn, Telegram), app tabs with icons, a single Share action, a slim sticky header with Download all, all in the brand's colours and fonts.
- **Copy:** story buttons follow the offer type ("Tap the link to start your plan", "Tap to order on WhatsApp"); more retail-only lines are kept away from apps, courses and services.

## 0.5.0 (2026-11-03)

Built from a real field test: Quarter4 now works from the brand's own information instead of fixed templates.

- **Brand look wins:** pages, kit graphics and the kit review page accept `brandStyle` (light or dark mode; palette: bg, surface, text, muted, accent, accent2; heading and body fonts). An event theme only adds its label. Text contrast is checked and corrected. A saved `brand_profile` fills it in automatically. Brand colours and fonts work on every plan; only the logo on graphics is Pro.
- **The right verbs for what is sold:** `offerType` (physical, subscription, course, service, digital) drives calls to action, captions and hooks: "Start your plan" for apps, "Enrol" for courses, "Book" for services. Retail lines ("If it was in your cart", "Reply to this message to order") never reach non-physical offers.
- **New niche:** consumer apps and subscriptions. When Quarter4 is not sure what is sold, it asks instead of guessing (`canProceed: false`).
- **Readable names:** `displayName` (or the brand) is used in copy; long raw product phrases are never pasted into hooks or headings. Eyebrows never repeat the brand.
- **The AI's words win:** `posts[].hook` or `headline` replaces a kit post's default hook and the captions built on it.
- **Kits live through the campaign:** hosted kits stay up until the offer deadline plus a day (up to 60 days).
- **Guardrail:** whenever a discount is set, a reminder to make sure the checkout really charges the advertised price.
- **Fixes:** `productPhotos: "none"` is respected; digital products are asked for screenshots, not product photos; local output folders are created; hashtags are not made from long phrases; `nextCalls` uses the real tool name; the plan's Markdown header no longer says "undefined"; scroll-effect attributes no longer contain a raw ">".

## 0.4.1 (2026-11-03)

- **Better photo matches:** photos are ranked by whether the product is the main subject (first tags), then by requested details such as colour, from a wider pool of results.
- **Representative photos must be the same kind of product:** a "Street Slide" only gets a slide or sandal photo, a boot only a boot; product photos with people as the subject are skipped; ambiguous words ("slide", "heel") no longer match unrelated photos. When nothing fits, the post uses the type-led layout instead of a wrong picture.
- **Broader retry:** very specific searches that find nothing retry once with just the product type.

## 0.4.0 (2026-11-03)

- **Connect without copying keys:** `cloud_account` action `connect` shows a link and code; the user approves in the browser and the key is saved locally. No config edits, no restart.
- **Dashboard link:** `cloud_account` action `dashboard`; `page_stats` results include it.
- **Currency by country:** upgrade links are priced in Naira in Nigeria and US Dollars elsewhere, decided by the server.
- **Phone and tablet layouts:** the opening section of every sales page is laid out top to bottom under 900px (headline, product, price, countdown, full-width button); stickers stay on the product, nothing overlaps; desktop keeps the scroll-linked scene.
- **Content kits:** new `content_kit` tool. Finished graphics at real platform sizes (4:5 post, 1:1 product spotlights, carousel, 9:16 Story/Status, last call, 16:9 card) with captions per app, on a review page with Share (phone share sheet with the image attached), share links, copy caption and PNG download. Hosted at a link when connected (Free 7 days with a small mark, Pro 90 days without); a local HTML file otherwise.
- **Brand profile:** new `brand_profile` tool saves voice, products, order link, logo and colours once; kits reuse them. Logo and colours on graphics are a Pro feature.
- **Sales results drive the plan:** when connected, `content_plan` features the products with the most WhatsApp order taps in selling posts (`featured`, `salesSignals`).
- **Hook library:** 89 phase-aware hooks plus niche lines; no hook repeats within a plan, no discount or event claims when none was given, no unverifiable "lowest price" lines.
- **Photos are decided in the chat:** before making a kit, the assistant asks once whether to use the seller's photos, representative photos (tagged on the graphic), created images, or no photos. Products are never drawn or faked. Mood posts use licensed photos whose description names the product type and shows no other brand, or a type-led design. Photos can be changed any time by asking the assistant; the kit updates at the same link (`kitId`).
- **Studio photos, free and local:** new `studio_photo` tool runs on the seller's computer: fixes colour and sharpness, removes the background (with rembg) and places the product on a studio colour or a full scene photo with a soft shadow.
- **When to ask:** `content_kit` returns `askUser` (at most 3, one message) only for things that would otherwise be invented: product photos, real prices, the order link, and currency. Everything else is a stated assumption.
- **Captions per app:** Instagram, WhatsApp, X (always within 280 characters) and LinkedIn versions written from the seller's facts; "from" prices only when they are the true lowest.
- **Design pass:** one focal point per graphic (photo or offer statement), then price, then end date; statement type measured to fit the frame; even margins; sales page heroes no longer repeat the discount four times.

## 0.3.0 (2026-11-02): first public release

First version published to npm and GitHub Releases.

- **Cloud tools:** `publish_page` (live link at `q4-<brand>.erasstack.com`), `page_stats` (views and WhatsApp order clicks per product), `connect_domain` (Pro, own domain with HTTPS), `cloud_account` (free key by email, plan status, Flutterwave upgrade links).
- **Product grid** on sales pages: items with real and previous prices; on WhatsApp shops each item opens a prefilled order chat.
- **Package:** ships as one self-contained file (`dist/server.mjs`) with no runtime dependencies, so `npx -y quarter4-mcp` starts fast.

## 0.2.0 (internal, not published to npm)

- Year-round calendar (60+ events, January to December), Easter computed, lunar and religious dates from verified tables with moon-sighting notes.
- `start_campaign`: understands loose requests (platform aliases, cities, countries, continents, offers like "N5k off", deadlines like "ends nov 30"); questions never block.
- `whats_on`: live public holidays for 100+ countries (Nager.Date), daily search trends per country (Google Trends), world reading (Wikipedia), with a sensitivity filter.
- 15 niche profiles drive angles, hooks, shot lists, compliance and event relevance; email and WhatsApp cadence caps.
- `find_images`: free licensed photos (Pexels, Unsplash, Wikimedia Commons, Openverse) with attribution and logo filtering.
- Art director for sales pages: cinematic, split showcase, product stage and editorial layouts; scroll-linked motion; video scrubbing and 3D models; per-brand fonts, navigation, buttons, countdown, FAQ and ending styles; SEO title and structured data.
- Six skills for Claude Code and Codex: `campaign`, `plan`, `posts`, `visuals`, `landing`, `trends`.

## 0.1.0 (internal, not published)

- Q4 calendar, content plan, platform specs, asset briefs, holiday landing pages, CSV/ICS export.
