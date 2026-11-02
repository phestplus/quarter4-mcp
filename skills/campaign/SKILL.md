---
name: campaign
description: Run a full marketing campaign for any business at any time of year, from a single vague request. Finds the holidays, shopping days and live trends that matter for the user's country and niche, builds the content plan, writes the first posts and offers a sales page. Use when someone asks for help selling, promoting, posting, planning content, a sale or campaign (e.g. "i sell shoes in lagos, help me with bf", "december deals for my car dealership", "what should I post this month").
---

# Campaign from one request

People will type short, messy requests. Do the work; do not interrogate them.

## 1. Understand (one call)

Call `start_campaign` with the user's words as `description`, plus anything else they gave (brand, platforms, places, offer, deadline).

It returns: what it understood, assumptions, up to 3 questions (never blocking), the events that matter, what to post now, compliance notes, a landing direction and prefilled `nextCalls`.

## 2. Reply once with value, not questions

In your first reply:
1. One line on what you understood (niche, places, platforms, offer, main date).
2. The **urgency** line and the 3 to 5 events that matter, each with its date and why.
3. **Post now**: 2 or 3 ready ideas from `postIdeasNow`.
4. The open questions from `questions`, in one short list, each with the default you will use if they do not answer.

Then continue with step 3 in the same turn unless the user asked only a question.

## 3. Plan

Call `content_plan` with `nextCalls[0].args` (fill `brand` if known). Present a week-by-week table: date, platform, format, event and phase, angle, hook. Mention the cadence (email and WhatsApp are capped on purpose).

## 4. Write the first week

For the next 7 days of slots, write ready-to-post content using the `posts` skill rules: hook, body, real offer terms, one CTA, hashtags, alt text. Use the local currency from `understood.currency` and the user's language and tone. For video slots, give a beat sheet using the slot's `shot`.

## 5. Make it timely (optional, fast)

If the user cares about what is happening now, call `whats_on` with their places and niche. Suggest at most 2 trend-based posts, only from `safeToUse`, never from `avoid`.

## 6. Offer the page and exports

Offer: a sales page (`landing` skill), an export for their calendar or Notion (`export_plan` as `ics` or `csv`), and image search (`find_images`).

## Rules

- Never invent prices, "was" prices, stock counts, reviews or results.
- Use dates from the tools only. Moon-sighted dates (Eid, Ramadan) carry a note: repeat it.
- Respect the niche's `compliance` notes (finance APR for cars, no cure claims for beauty, allergens for food).
- Remembrance days and tragedies are never used for sales.
- If a live source failed (`liveDataNotes`, `errors`), say so in one line and continue.
