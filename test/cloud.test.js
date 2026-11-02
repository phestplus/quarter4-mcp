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
    const st = await call('page_stats', {});
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
