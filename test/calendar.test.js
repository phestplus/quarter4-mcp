import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listEvents, getEvent } from '../src/calendar.js';
import { nthWeekday } from '../src/dates.js';

const date = (id, year) => getEvent(id, year, `${year}-09-01`).date;

test('US Thanksgiving cluster is computed for several years', () => {
  // Known dates: Thanksgiving is the 4th Thursday of November.
  const expected = { 2025: '2025-11-27', 2026: '2026-11-26', 2027: '2027-11-25', 2028: '2028-11-23' };
  for (const [y, d] of Object.entries(expected)) assert.equal(date('us-thanksgiving', Number(y)), d);
  assert.equal(date('black-friday', 2026), '2026-11-27');
  assert.equal(date('small-business-saturday', 2026), '2026-11-28');
  assert.equal(date('cyber-monday', 2026), '2026-11-30');
  assert.equal(date('giving-tuesday', 2026), '2026-12-01');
});

test('nth weekday rules', () => {
  assert.equal(date('ca-thanksgiving', 2026), '2026-10-12');  // 2nd Monday of October
  assert.equal(date('melbourne-cup', 2026), '2026-11-03');    // 1st Tuesday of November
  assert.equal(date('green-monday', 2026), '2026-12-14');     // 2nd Monday of December
  assert.equal(date('uk-small-business-saturday', 2026), '2026-12-05');
  assert.equal(date('remembrance-sunday', 2026), '2026-11-08');
  assert.equal(nthWeekday(2026, 11, 4, -1), '2026-11-26');    // last Thursday
});

test('Super Saturday is the last Saturday before Christmas', () => {
  assert.equal(date('super-saturday', 2026), '2026-12-19');
  assert.equal(date('super-saturday', 2027), '2027-12-18');
  assert.equal(date('super-saturday', 2021), '2021-12-18'); // Christmas on Saturday → previous Saturday
});

test('lunar holidays use verified tables', () => {
  assert.equal(date('diwali', 2026), '2026-11-08');
  assert.equal(date('diwali', 2027), '2027-10-29');
  assert.equal(date('hanukkah', 2026), '2026-12-04');
  assert.equal(date('hanukkah', 2027), '2027-12-24');
  assert.equal(getEvent('diwali', 2035, '2035-09-01'), null); // unknown years are omitted, not guessed
});

test('New Year belongs to the following calendar year', () => {
  assert.equal(date('new-year', 2026), '2027-01-01');
});

test('year tokens in hashtags are filled', () => {
  const bf = getEvent('black-friday', 2027, '2027-09-01');
  assert.ok(bf.hashtags.includes('#BlackFriday2027'));
  const ng = getEvent('ng-independence', 2026, '2026-09-01');
  assert.ok(ng.hashtags.includes('#NigeriaAt66'));
});

test('region filter keeps global events and drops other regions', () => {
  const ev = listEvents({ year: 2026, regions: ['NG'], referenceDate: '2026-09-01' });
  const ids = ev.map((e) => e.id);
  assert.ok(ids.includes('ng-independence'));
  assert.ok(ids.includes('black-friday'));      // global
  assert.ok(!ids.includes('us-thanksgiving'));  // US only
  assert.ok(!ids.includes('bonfire-night'));    // UK only
});

test('status and past filtering', () => {
  const ev = listEvents({ year: 2026, referenceDate: '2026-11-20' });
  assert.ok(!ev.some((e) => e.id === 'halloween'), 'past events hidden by default');
  const bf = ev.find((e) => e.id === 'black-friday');
  assert.equal(bf.status, 'promo-window');
  assert.equal(bf.daysUntil, 7);
  const all = listEvents({ year: 2026, referenceDate: '2026-11-20', includePast: true });
  assert.equal(all.find((e) => e.id === 'halloween').status, 'past');
});

test('results are sorted by date', () => {
  const ev = listEvents({ year: 2026, referenceDate: '2026-09-01' });
  for (let i = 1; i < ev.length; i++) assert.ok(ev[i - 1].date <= ev[i].date);
});

test('invalid dates throw', () => {
  assert.throws(() => listEvents({ from: '2026-13-01' }), /Invalid date/);
});
