// MCP cloud tools against the real Quarter4 Cloud worker running locally (skipped when the
// sibling quarter4-cloud project is not checked out next to this one).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer as createHttp } from 'node:http';
import { existsSync } from 'node:fs';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../src/server.js';

const workerPath = new URL('../../quarter4-cloud/src/worker.js', import.meta.url);
const skip = !existsSync(workerPath) && 'quarter4-cloud not present';

test('publish, measure and upgrade through MCP tools', { skip, timeout: 30000 }, async () => {
  const { default: worker } = await import(workerPath.href);
  const { MemoryStore, MemoryBucket } = await import(new URL('../../quarter4-cloud/src/store.js', import.meta.url).href);
  const env = { store: new MemoryStore(), PAGES: new MemoryBucket(), DEV: '1', APP_HOST: 'q4.erasstack.com', ROOT_DOMAIN: 'erasstack.com', PAGE_PREFIX: 'q4-', KEY_PEPPER: 'p', FLW_SECRET_KEY: 'k', FLW_PLAN_PRO_NGN: '1' };

  // Local HTTP server that routes by Host header, like Cloudflare would.
  const realFetch = globalThis.fetch;
  const http = createHttp(async (req, res) => {
    const chunks = []; for await (const c of req) chunks.push(c);
    const host = req.headers['x-host'] ?? 'q4.erasstack.com';
    const r = await worker.fetch(new Request(`https://${host}${req.url}`, { method: req.method, headers: req.headers, body: chunks.length ? Buffer.concat(chunks) : undefined }), env, { waitUntil() {} });
    res.writeHead(r.status, Object.fromEntries(r.headers)); res.end(Buffer.from(await r.arrayBuffer()));
  });
  await new Promise((r) => http.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${http.address().port}`;
  // Flutterwave is faked; everything else goes to the local worker.
  globalThis.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input.url;
    if (url.startsWith('https://api.flutterwave.com/v3/payments')) return Response.json({ status: 'success', data: { link: 'https://checkout.flutterwave.com/pay/x' } });
    return realFetch(input, init);
  };
  process.env.QUARTER4_API_URL = base;
  delete process.env.QUARTER4_API_KEY;

  const server = createServer({ allowFileWrites: false });
  const client = new Client({ name: 't', version: '0' });
  const [a, b] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(a), client.connect(b)]);
  const call = async (name, args) => { const r = await client.callTool({ name, arguments: args }); return { err: r.isError, text: r.content[0].text, data: (() => { try { return JSON.parse(r.content[0].text); } catch { return null; } })() }; };

  try {
    const noKey = await call('publish_page', { brand: 'Kora Kicks', html: '<html><body>x</body></html>' });
    assert.equal(noKey.err, true);
    assert.match(noKey.text, /cloud_account/);

    const s = await call('cloud_account', { action: 'signup', email: 'ada@korakicks.com' });
    assert.match(s.data.apiKey, /^q4_/);
    process.env.QUARTER4_API_KEY = s.data.apiKey;

    const p = await call('publish_page', { brand: 'Kora Kicks', path: 'black-friday', page: { product: 'sneakers', discountPercent: 25, ctaUrl: 'https://wa.me/2348031234567', products: [{ name: 'Runner One', price: '₦63,000' }], autoImages: false } });
    assert.ok(!p.err, p.text);
    assert.equal(p.data.url, 'https://q4-korakicks.erasstack.com/black-friday');

    // A visitor taps "Order on WhatsApp" for Runner One.
    await realFetch(`${base}/__q4/e`, { method: 'POST', headers: { 'x-host': 'q4-korakicks.erasstack.com' }, body: JSON.stringify({ t: 'whatsapp', l: 'Runner One', p: '/black-friday' }) });
    const ask = await call('content_kit', { brand: 'Kora Kicks', product: 'sneakers', discountPercent: 30, ctaUrl: 'https://wa.me/2348031234567', products: [{ name: 'Court Low', price: '₦56,000' }], autoImages: false });
    assert.equal(ask.data.needsAnswer, true, 'asks about photos before making anything');
    assert.match(ask.data.askUser[0].question, /Court Low/);
    const kit = await call('content_kit', { brand: 'Kora Kicks', product: 'sneakers', theme: 'black-friday', discountPercent: 30, price: '₦63,000', originalPrice: '₦90,000', products: [{ name: 'Runner One', price: '₦63,000', image: 'https://images.pexels.com/photos/1/a.jpeg' }, { name: 'Court Low', price: '₦56,000' }], autoImages: false, productPhotos: 'none' });
    assert.ok(!kit.err, kit.text);
    assert.match(kit.data.url, /^https:\/\/q4-korakicks\.erasstack\.com\/k\/[a-f0-9]{12}$/);
    assert.ok(kit.data.posts.length >= 6);
    assert.equal(new Set(kit.data.posts.map((p) => p.hook)).size, kit.data.posts.length, 'each post opens differently');
    const kitPage = await (await realFetch(`${base}/k/${kit.data.url.split('/k/')[1]}`, { headers: { 'x-host': 'q4-korakicks.erasstack.com' } })).text();
    assert.match(kitPage, /\/__q4\/img\/[a-f0-9]{12}\/0/, 'photos go through the kit relay');
    assert.match(kitPage, /data-share/);

    const st = await call('page_stats', {});
    // Real order taps decide which product the plan pushes.
    const plan = await call('content_plan', { brand: 'Kora Kicks', niche: 'sneakers', product: 'sneakers', platforms: ['instagram'], regions: ['NG'], startDate: '2026-11-03', endDate: '2026-11-30', offer: '30% off' });
    assert.ok(!plan.err, plan.text);
    assert.equal(plan.data.salesSignals.topProducts[0].name, 'Runner One');
    assert.ok(plan.data.slots.some((s) => s.feature === 'Runner One'));
    // Brand profile: saved once, reused by the kit.
    const saved = await call('brand_profile', { action: 'save', profile: { voice: 'short and confident', ctaUrl: 'https://wa.me/2348031234567', brandColor: '#e11d48', products: [{ name: 'Runner One', price: '₦63,000' }] } });
    assert.equal(saved.data.profile.voice, 'short and confident');
    assert.equal(saved.data.note, undefined, 'colours are saved and used on every plan');
    const k2 = await call('content_kit', { brand: 'Kora Kicks', autoImages: false, productPhotos: 'none' });
    assert.ok(!k2.err, k2.text);
    assert.ok(k2.data.notes.some((n) => /saved brand profile: .*products/.test(n)));
    assert.ok(!k2.data.notes.some((n) => /part of Pro/.test(n)), 'brand colours are not paywalled (only the logo is Pro)');
    assert.equal(st.data.pages[0].byItem['Runner One'], 1);

    const up = await call('cloud_account', { action: 'upgrade', plan: 'pro', currency: 'NGN' });
    assert.match(up.data.url, /checkout\.flutterwave\.com/);
    const dom = await call('connect_domain', { hostname: 'sale.korakicks.com' });
    assert.equal(dom.err, true, 'custom domain needs Pro');
    assert.match(dom.text, /Pro/);
  } finally {
    await client.close(); await server.close();
    http.close(); globalThis.fetch = realFetch;
    delete process.env.QUARTER4_API_KEY; delete process.env.QUARTER4_API_URL;
  }
});

test('connect: browser approval saves the key locally, then publishing works', { skip, timeout: 30000 }, async () => {
  const { default: worker } = await import(workerPath.href);
  const { MemoryStore, MemoryBucket } = await import(new URL('../../quarter4-cloud/src/store.js', import.meta.url).href);
  const { mkdtempSync, readFileSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const env = { store: new MemoryStore(), PAGES: new MemoryBucket(), DEV: '1', APP_HOST: 'q4.erasstack.com', ROOT_DOMAIN: 'erasstack.com', PAGE_PREFIX: 'q4-', KEY_PEPPER: 'p' };
  const http = createHttp(async (req, res) => {
    const chunks = []; for await (const c of req) chunks.push(c);
    const r = await worker.fetch(new Request(`https://q4.erasstack.com${req.url}`, { method: req.method, headers: req.headers, body: chunks.length ? Buffer.concat(chunks) : undefined }), env, { waitUntil() {} });
    res.writeHead(r.status, Object.fromEntries(r.headers)); res.end(Buffer.from(await r.arrayBuffer()));
  });
  await new Promise((r) => http.listen(0, '127.0.0.1', r));
  process.env.QUARTER4_API_URL = `http://127.0.0.1:${http.address().port}`;
  process.env.QUARTER4_HOME = mkdtempSync(join(tmpdir(), 'q4home-'));
  delete process.env.QUARTER4_API_KEY;

  const server = createServer({ allowFileWrites: true });
  const client = new Client({ name: 'claude-code', version: '0' });
  const [a, b] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(a), client.connect(b)]);
  const call = async (name, args) => { const r = await client.callTool({ name, arguments: args }); return { err: r.isError, text: r.content[0].text, data: (() => { try { return JSON.parse(r.content[0].text); } catch { return null; } })() }; };
  try {
    const noKey = await call('publish_page', { brand: 'Ola', html: '<html><body>x</body></html>' });
    assert.match(noKey.text, /action "connect"/);
    const c1 = await call('cloud_account', { action: 'connect' });
    assert.equal(c1.data.connected, false);
    assert.match(c1.data.code, /^[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    assert.match(c1.data.url, /\/connect\?code=/);
    const row = env.store.connects[0];
    assert.equal(row.client, 'claude-code', 'the approval page names the AI app');
    assert.equal((await call('cloud_account', { action: 'connect' })).data.waiting, true);

    // The user approves in the browser (simulated at the store level; the page flow is tested in the cloud repo).
    const acct = await env.store.createAccount('ola@shop.ng');
    await env.store.approveConnect(row.userCode, acct.id);
    const c2 = await call('cloud_account', { action: 'connect' });
    assert.equal(c2.data.connected, true);
    assert.equal(c2.data.email, 'ola@shop.ng');
    const saved = JSON.parse(readFileSync(join(process.env.QUARTER4_HOME, 'credentials.json'), 'utf8'));
    assert.match(saved.apiKey, /^q4_/);

    // A fresh server process picks the saved key up: no env var, no restart dance.
    const server2 = createServer({ allowFileWrites: true });
    const client2 = new Client({ name: 't2', version: '0' });
    const [a2, b2] = InMemoryTransport.createLinkedPair();
    await Promise.all([server2.connect(a2), client2.connect(b2)]);
    const st = await client2.callTool({ name: 'cloud_account', arguments: { action: 'status' } });
    assert.ok(!st.isError, st.content[0].text);
    assert.equal(JSON.parse(st.content[0].text).email, 'ola@shop.ng');
    await client2.close();

    const hosted = createServer({ allowFileWrites: false });
    const client3 = new Client({ name: 't3', version: '0' });
    const [a3, b3] = InMemoryTransport.createLinkedPair();
    await Promise.all([hosted.connect(a3), client3.connect(b3)]);
    const h = await client3.callTool({ name: 'cloud_account', arguments: { action: 'connect' } });
    assert.match(h.content[0].text, /hosted Quarter4 server cannot store a key/);
    await client3.close();
  } finally {
    await client.close(); http.close();
    delete process.env.QUARTER4_API_URL; delete process.env.QUARTER4_HOME;
  }
});
