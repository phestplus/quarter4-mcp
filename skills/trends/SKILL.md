---
name: trends
description: Find what is happening right now for a country or region (today's top searches, upcoming official public holidays in 100+ countries, what the world is reading) and turn the safe, relevant parts into timely post ideas for the user's business. Use when the user asks what's trending, what to post today, what is happening this week, or about public holidays in a country.
---

# What's on now

## 1. Fetch

Call `whats_on` with `places` (countries, cities or regions in any form) and `niche` (what they sell). It returns:

- `trending`: today's top searches per country, with `sensitive` and `fitsNiche` flags
- `safeToUse` and `avoid`
- `publicHolidays`: official holidays in the look-ahead window (with substitute days, e.g. a Boxing Day moved to Monday)
- `worldReading`: what people are reading about globally
- `errors`: sources that failed; mention them in one line

## 2. Turn into ideas

- Up to 3 trend posts, only from `safeToUse`, preferring `fitsNiche`. For each: why the audience cares, the angle for this brand, format (story or short video is fastest), and post it today.
- Public holidays: opening hours posts, order-by dates, and whether a sale fits the day.
- If nothing fits, say so. A forced trend post hurts the brand.

## Rules

- Never use anything in `avoid` (deaths, crashes, disasters, crime, politics, health scares) for promotion.
- Do not use other brands' trademarks or celebrities' names to sell.
- Trends fade in 24 to 48 hours: favour quick formats.
