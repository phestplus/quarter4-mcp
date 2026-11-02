import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPlan } from '../src/plan.js';
import { toCSV, toICS, toMarkdown } from '../src/export.js';

const base = { brand: 'Glow Lab', niche: 'skincare', platforms: ['instagram'], regions: ['US', 'UK'], startDate: '2026-11-12', endDate: '2026-12-31', postsPerWeek: 3 };

test('Black Friday owns the run-up and launches on the day', () => {
  const p = buildPlan(base);
  const on = (d) => p.slots.find((s) => s.date === d);
  assert.equal(on('2026-11-13').eventId, 'black-friday');
  assert.equal(on('2026-11-20').eventId, 'black-friday');
  assert.equal(on('2026-11-27').phase, 'launch');
  assert.equal(on('2026-11-27').eventId, 'black-friday');
  assert.equal(on('2026-11-30').eventId, 'cyber-monday');
  assert.equal(on('2026-12-25').eventId, 'christmas');
});

test('launch days are always posted even off the regular schedule', () => {
  const p = buildPlan({ ...base, postsPerWeek: 1 }); // only Wednesdays normally
  const dates = p.slots.map((s) => s.date);
  for (const d of ['2026-11-27', '2026-11-30', '2026-12-25']) assert.ok(dates.includes(d), d);
});

test('observances get no-sales slots for sellers; campaigns on the same day carry a caution', () => {
  const p = buildPlan({ ...base, startDate: '2026-11-01', endDate: '2026-11-15' });
  const rs = p.slots.find((s) => s.date === '2026-11-08');
  assert.ok(rs.caution || rs.kind === 'observance');
  assert.ok(p.observances.some((o) => o.name === 'Remembrance Day'));
  assert.ok(!p.eventsCovered.some((e) => e.id === 'remembrance-day'));
});

test('one slot per platform per posting day', () => {
  const p = buildPlan({ ...base, platforms: ['instagram', 'tiktok', 'email'] });
  const keys = p.slots.map((s) => `${s.date}|${s.platform}`);
  assert.equal(new Set(keys).size, keys.length);
  assert.ok(p.slots.every((s) => s.size || s.platform === 'x'));
});

test('validates input', () => {
  assert.throws(() => buildPlan({ ...base, platforms: ['myspace'] }), /Unknown platform/);
  assert.throws(() => buildPlan({ ...base, endDate: '2026-11-01' }), /before startDate/);
});

test('CSV escapes quotes and neutralizes formulas', () => {
  const csv = toCSV([{ date: '2026-11-27', weekday: 'Friday', platform: 'x', format: 'thread', angle: '=HYPERLINK("http://evil")', cta: 'Say "hi", now', status: 'idea' }]);
  assert.match(csv, /'=HYPERLINK/);
  assert.match(csv, /"Say ""hi"", now"/);
});

test('ICS is valid-looking and folds long lines', () => {
  const p = buildPlan(base);
  const ics = toICS(p.slots, 'Test');
  assert.match(ics, /^BEGIN:VCALENDAR\r\n/);
  assert.match(ics, /END:VCALENDAR\r\n$/);
  assert.equal((ics.match(/BEGIN:VEVENT/g) || []).length, p.slots.length);
  for (const line of ics.split('\r\n')) assert.ok(Buffer.byteLength(line) <= 75, `line too long: ${line}`);
});

test('markdown export includes key dates and table', () => {
  const md = toMarkdown(buildPlan(base));
  assert.match(md, /# Q4 content plan: Glow Lab/);
  assert.match(md, /\*\*Black Friday\*\*: 2026-11-27/);
  assert.match(md, /\| Date \| Day \|/);
});
