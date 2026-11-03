---
name: posts
description: Write ready-to-publish social posts, captions, threads, WhatsApp broadcasts and promo emails for sales, holidays and events in any season, fitted to the business niche, each platform's limits and the right ad disclosures. Use when the user asks for captions, posts, a thread, a broadcast message, or sale emails.
---

# Posts and captions

## Inputs

Brand, what they sell, platform(s), the event and phase. Work from content_plan slots if they exist. If the request is vague, call `start_campaign` first and proceed with its defaults.

## Steps

1. `platform_specs` for the platforms (limits, cadence, hashtag guidance).
2. `asset_brief` per post with `niche` (the user's words), `eventId` (a name is fine), `phase`, and `sponsored: true` for paid, gifted or affiliate content. Use its `hooks`, `angles` and `checklist`.
3. Write each post:
   - **Hook**: the first line earns the second. Offer 2 or 3 for launch posts.
   - **Body**: one idea, concrete details from what they sell.
   - **Offer**: real terms: amount, what is included, end date and time zone, in the local currency.
   - **CTA**: one action that fits the phase.
   - **Hashtags**: as the platform guidance says.
4. Give the character count against the limit.
5. Add alt text for images and the checklist items that apply.

Want finished graphics, not just text? Call `content_kit` with the same details (and `pageUrl` from `publish_page` if there is a sales page). It returns a link where the seller edits captions, then shares or downloads each post. If the user is connected, details saved with `brand_profile` fill in automatically.

## Format per post

```
📅 2026-11-27 · Instagram · Black Friday · launch
Hook options: ...
Caption (812/2200):
...
Hashtags: ...
Alt text: ...
```

WhatsApp broadcast: under 700 characters, one image, one link, sent only at launch and last chance.
Email: subject under 50 characters, preheader 40 to 100, one button.

## Voice

Match the user's language and how their customers talk (for example Nigerian English, UK English, US English). Keep it specific; no filler like "elevate your style".

## Rules

- Disclose ads and affiliates at the start ("#ad", "Paid partnership").
- Only a "was" price the business really charged; no fake countdowns, stock levels or reviews.
- No sales tie-ins on remembrance days or around tragedies.
