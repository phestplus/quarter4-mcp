---
name: plan
description: Build a dated content calendar for any month or season (Valentine's, Ramadan and Eid, Mother's Day, Easter, back to school, Black Friday, Christmas and more) for a brand or creator, with campaign phases, niche-specific angles, hooks and shots per platform, exported to CSV, ICS or Markdown. Use when the user asks for a content plan, content calendar, posting schedule, or what to post this month or season.
---

# Content plan

## 1. Context

If you have not already, call `start_campaign` with the user's words. Use its `nextCalls[0].args` as the starting point. Do not ask for anything it marked with a default; mention the defaults instead.

## 2. Build

Call `content_plan`. Inputs can be loose: platforms like "ig, tik tok, status", places like "Lagos, London" or "West Africa", events by name ("black friday", "eid", "valentines"), offers written any way.

Read `interpreted.notes`: it lists events left out as low relevance. Tell the user in one line and offer to add them.

## 3. Present

A table grouped by week:

| Date | Platform | Format | Event · phase | Angle | Hook |

Then, in two lines: the phases (tease → warm-up → early access → launch → last chance → thank you) and the cadence per platform from `cadence`.

## 4. Export

Offer `export_plan` with the same arguments:
- `csv` for Google Sheets, Notion or Airtable
- `ics` for Google, Apple or Outlook calendar
- `markdown` for a doc

Pass `outputPath` when running locally; otherwise give the content in a code block.

## Rules

- Never guess dates; use the tools.
- Shipping cutoffs are approximate: tell the user to confirm with their carrier.
- Mention the niche `compliance` notes once.
