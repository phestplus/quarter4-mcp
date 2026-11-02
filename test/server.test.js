import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../src/server.js';

async function connect(opts) {
  const server = createServer(opts);
  const client = new Client({ name: 'test', version: '0' });
  const [a, b] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(a), client.connect(b)]);
  return { client, close: () => Promise.all([client.close(), server.close()]) };
}

test('lists all tools and prompts', async () => {
  const { client, close } = await connect();
  const tools = (await client.listTools()).tools.map((t) => t.name).sort();
  assert.deepEqual(tools, ['asset_brief', 'cloud_account', 'connect_domain', 'content_plan', 'event_calendar', 'export_plan', 'find_images', 'landing_page', 'page_stats', 'platform_specs', 'publish_page', 'start_campaign', 'whats_on']);
  const prompts = (await client.listPrompts()).prompts.map((p) => p.name).sort();
  assert.deepEqual(prompts, ['q4-campaign', 'q4-video-script']);
  await close();
});

test('event_calendar returns events', async () => {
  const { client, close } = await connect();
  const r = await client.callTool({ name: 'event_calendar', arguments: { year: 2026, regions: ['US'], minImpact: 'high', includePast: true } });
  const data = JSON.parse(r.content[0].text);
  assert.ok(data.events.some((e) => e.id === 'black-friday' && e.date === '2026-11-27'));
  await close();
});

test('unknown places are reported, not fatal', async () => {
  const { client, close } = await connect();
  const r = await client.callTool({ name: 'event_calendar', arguments: { regions: ['MARS'] } });
  assert.ok(!r.isError);
  assert.deepEqual(JSON.parse(r.content[0].text).unknownPlaces, ['mars']);
  const bad = await client.callTool({ name: 'event_calendar', arguments: { from: '2026-13-01' } });
  assert.equal(bad.isError, true, 'malformed dates are still rejected');
  await close();
});

test('file writes are refused in remote mode', async () => {
  const { client, close } = await connect({ allowFileWrites: false });
  const r = await client.callTool({ name: 'landing_page', arguments: { brand: 'a', headline: 'b', ctaText: 'c', ctaUrl: 'https://x.y', outputPath: 'x.html', autoImages: false } });
  assert.equal(r.isError, true);
  assert.match(r.content[0].text, /only supported when the server runs locally/);
  await close();
});

test('export_plan returns ICS', async () => {
  const { client, close } = await connect();
  const r = await client.callTool({ name: 'export_plan', arguments: { brand: 'Glow', niche: 'skincare', platforms: ['instagram'], startDate: '2026-11-20', endDate: '2026-11-30', as: 'ics' } });
  assert.match(r.content[0].text, /BEGIN:VCALENDAR/);
  await close();
});

test('loose input: platforms, places and event names in plain words', async () => {
  const { client, close } = await connect();
  const r = await client.callTool({ name: 'content_plan', arguments: { brand: 'Kora', niche: 'sneakers', platforms: 'ig, tik tok and whatsapp', regions: 'Lagos', startDate: '2026-11-02', endDate: '2026-12-02', focusEvents: ['black friday'] } });
  assert.ok(!r.isError, r.content[0].text);
  const plan = JSON.parse(r.content[0].text);
  assert.deepEqual(plan.interpreted.platforms, ['instagram', 'tiktok', 'whatsapp']);
  assert.deepEqual(plan.interpreted.regions, ['NG']);
  assert.ok(plan.eventsCovered.some((e) => e.id === 'black-friday'));
  await close();
});

test('start_campaign understands a messy request without live data', async () => {
  const { client, close } = await connect();
  const r = await client.callTool({ name: 'start_campaign', arguments: { description: 'i sell sneakers in lagos, need bf content for ig and whatsapp, 30 percent off', live: false } });
  const d = JSON.parse(r.content[0].text);
  assert.equal(d.understood.niche.id, 'footwear');
  assert.equal(d.understood.offer.value, 30);
  assert.equal(d.understood.currency, 'NGN');
  assert.ok(d.questions.every((q) => q.blocking === false));
  assert.equal(d.canProceed, true);
  await close();
});
