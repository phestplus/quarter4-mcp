# Changelog

## 0.4.0 (unreleased)

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
