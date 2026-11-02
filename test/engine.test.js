import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizePlatforms, normalizeRegions, parseOffer, parseLooseDate, findEventsInText, findCountriesInText } from '../src/normalize.js';
import { classifyNiche } from '../src/niches.js';
import { startCampaign } from '../src/start.js';
import { getEvent, listEvents } from '../src/calendar.js';
import { easter } from '../src/dates.js';
import { buildPlan } from '../src/plan.js';
import { buildBrief } from '../src/brief.js';

test('platform aliases', () => {
  assert.deepEqual(normalizePlatforms('ig, tik tok and newsletter').values, ['instagram', 'tiktok', 'email']);
  assert.deepEqual(normalizePlatforms(['Insta', 'WhatsApp status', 'twitter']).values, ['instagram', 'whatsapp', 'x']);
  assert.deepEqual(normalizePlatforms('myspace').unknown, ['myspace']);
});

test('places: cities, countries, continents, codes', () => {
  assert.deepEqual(normalizeRegions('Lagos and London').countries, ['NG', 'GB']);
  assert.deepEqual(normalizeRegions('Lagos and London').values, ['NG', 'UK']);
  assert.ok(normalizeRegions('West Africa').countries.includes('GH'));
  assert.deepEqual(normalizeRegions('Dubai').values, ['ME']);
  assert.deepEqual(normalizeRegions('worldwide').values, ['global']);
  assert.deepEqual(findCountriesInText('we are in la'), [], 'ambiguous lowercase codes are ignored');
  assert.deepEqual(findCountriesInText('shop in houston texas'), ['US']);
});

test('offers written any way', () => {
  assert.deepEqual(parseOffer('30 percent off everything'), { type: 'percent', value: 30, text: '30 percent off everything' });
  assert.equal(parseOffer('BOGO on all tees').type, 'bogo');
  assert.equal(parseOffer('free delivery in Lagos').type, 'free-shipping');
  assert.equal(parseOffer('N5,000 off').value, 5000);
});

test('loose dates and event names', () => {
  assert.equal(parseLooseDate('Nov 30', { year: 2026 }), '2026-11-30');
  assert.equal(parseLooseDate('30th November', { year: 2026 }), '2026-11-30');
  assert.equal(parseLooseDate('30/11', { year: 2026, regions: ['NG'] }), '2026-11-30');
  assert.equal(parseLooseDate('11/30', { year: 2026, regions: ['US'] }), '2026-11-30');
  assert.equal(parseLooseDate('03/04', { year: 2027, regions: ['US'] }), '2027-03-04', 'US-only audiences read month first');
  assert.equal(parseLooseDate('03/04', { year: 2027, regions: ['UK'] }), '2027-04-03');
  assert.deepEqual(findEventsInText('need bf and xmas content'), ['black-friday', 'christmas']);
});

test('niche classification', () => {
  assert.equal(classifyNiche('i sell sneakers in lagos').id, 'footwear');
  assert.equal(classifyNiche('ankara dresses boutique').id, 'fashion');
  assert.equal(classifyNiche('used cars dealership').id, 'automotive');
  assert.equal(classifyNiche('online course for designers').id, 'courses');
  assert.equal(classifyNiche('pls help me sell more').id, 'general');
});

test('year-round dates', () => {
  assert.deepEqual([2024, 2025, 2026, 2027, 2028].map(easter), ['2024-03-31', '2025-04-20', '2026-04-05', '2027-03-28', '2028-04-16']);
  assert.equal(getEvent('mothering-sunday', 2027, '2027-01-01').date, '2027-03-07');
  assert.equal(getEvent('mothers-day', 2027, '2027-01-01').date, '2027-05-09');
  assert.equal(getEvent('fathers-day', 2027, '2027-01-01').date, '2027-06-20');
  assert.equal(getEvent('memorial-day', 2027, '2027-01-01').date, '2027-05-31');
  assert.equal(getEvent('lunar-new-year', 2027, '2027-01-01').date, '2027-02-06');
  assert.ok(getEvent('eid-al-fitr', 2027, '2027-01-01').note, 'moon-sighted dates carry a note');
  const next90 = listEvents({ referenceDate: '2027-01-20' }).map((e) => e.id);
  assert.ok(next90.includes('valentines') && next90.includes('easter'));
  assert.ok(!next90.includes('black-friday'), 'default window is the next 90 days');
});

test('relevance keeps irrelevant events out', () => {
  const p = buildPlan({ brand: 'Kora', niche: 'sneakers', platforms: 'ig', regions: 'Lagos', startDate: '2026-11-02', endDate: '2026-12-02' });
  const ids = p.eventsCovered.map((e) => e.id);
  assert.ok(ids.includes('black-friday'));
  assert.ok(!ids.includes('diwali') && !ids.includes('dhanteras'));
  assert.ok(p.interpreted.notes.some((n) => /Diwali/.test(n)), 'tells the user what was left out');
});

test('cadence: email and WhatsApp stay low, social posts on every launch', () => {
  const p = buildPlan({ brand: 'Kora', niche: 'sneakers', platforms: 'ig, email, whatsapp', regions: 'Lagos, USA', startDate: '2026-11-02', endDate: '2026-12-06', postsPerWeek: 5 });
  const perWeek = {};
  for (const s of p.slots) { const k = `${s.platform}:${Math.floor((Date.parse(s.date) - Date.parse('2026-11-02')) / 6048e5)}`; perWeek[k] = (perWeek[k] ?? 0) + 1; }
  for (const [k, n] of Object.entries(perWeek)) if (k.startsWith('email')) assert.ok(n <= 3, `${k} = ${n}`);
  const launches = ['2026-11-27', '2026-11-30'];
  for (const d of launches) assert.ok(p.slots.some((s) => s.date === d && s.platform === 'instagram'), d);
});

test('niche-aware angles, hooks and shots', () => {
  const p = buildPlan({ brand: 'Kora', niche: 'sneakers', platforms: 'tiktok', regions: 'Lagos', startDate: '2026-11-10', endDate: '2026-11-30' });
  const text = JSON.stringify(p.slots);
  assert.ok(!/digital products and courses|Screen recording/i.test(text));
  assert.ok(/pair|sole|lace|fit/i.test(text));
  const b = buildBrief({ platform: 'tik tok', assetType: 'video', brand: 'Kora', niche: 'sneakers', eventId: 'black-friday' });
  assert.ok(b.video.shotList.some((s) => /sole|lace|on-foot/i.test(s)));
  const car = buildBrief({ platform: 'facebook', assetType: 'post', brand: 'Drive', niche: 'used cars' });
  assert.ok(car.checklist.some((c) => /APR/.test(c)), 'auto finance disclosure');
});

test('start_campaign: messy prompts, non-blocking questions', () => {
  const a = startCampaign({ description: 'black friday sale for my online course, 50% off, ends nov 30', today: '2026-11-02' });
  assert.equal(a.understood.deadline, '2026-11-30');
  assert.ok(!a.events.some((e) => e.id === 'shipping-cutoff'), 'digital products do not ship');
  const b = startCampaign({ description: 'used cars dealership houston, want to push december deals on facebook', today: '2026-11-02' });
  assert.equal(b.mainEvent.id, 'christmas');
  assert.deepEqual(b.understood.platforms, ['facebook']);
  const c = startCampaign({ description: 'pls help me sell more', today: '2026-11-02' });
  assert.ok(c.questions.length > 0 && c.questions.length <= 3);
  assert.ok(c.questions.every((q) => q.blocking === false && q.defaultUsed));
  assert.equal(c.canProceed, true);
});
