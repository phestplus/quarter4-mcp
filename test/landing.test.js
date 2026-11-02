import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildLanding, describeLanding, THEMES, LAYOUTS } from '../src/landing.js';
import { buildBrief } from '../src/brief.js';

const base = { brand: 'Glow Lab', headline: 'Black Friday skincare sale', ctaText: 'Shop the sale', ctaUrl: 'https://example.com/shop', theme: 'black-friday' };

test('escapes user content (no HTML injection)', () => {
  const html = buildLanding({ ...base, headline: '<script>alert(1)</script>', features: [{ title: '<img onerror=x>', text: '"quoted"' }] });
  assert.ok(!html.includes('<script>alert(1)'));
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.ok(!html.includes('<img onerror'));
});

test('rejects unsafe URLs', () => {
  const html = buildLanding({ ...base, ctaUrl: 'javascript:alert(1)' });
  assert.ok(!html.includes('javascript:'));
});

test('deadline needs a time zone and drives the countdown', () => {
  assert.throws(() => buildLanding({ ...base, deadline: '2026-11-30T23:59:00' }), /time zone/);
  const html = buildLanding({ ...base, deadline: '2026-11-30T23:59:00-05:00' });
  assert.match(html, /data-cd/);
  assert.match(html, /This offer has ended/);
  assert.match(html, new RegExp(String(Date.parse('2026-11-30T23:59:00-05:00'))));
});

test('structured data only when a price is given, and is not breakable', () => {
  assert.ok(!buildLanding(base).includes('application/ld+json'));
  const html = buildLanding({ ...base, price: '$59', originalPrice: '$99', currency: 'USD', headline: '</script><b>x' });
  const ld = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1];
  const data = JSON.parse(ld);
  assert.equal(data.offers.price, '59');
  assert.equal(data.offers.priceCurrency, 'USD');
});

test('custom brand colour picks readable button text', () => {
  assert.match(buildLanding({ ...base, brandColor: '#ffeb3b' }), /--accent-text:#111111/);
  assert.match(buildLanding({ ...base, brandColor: '#1e3a8a' }), /--accent-text:#ffffff/);
});

test('every theme and layout renders without em or en dashes', () => {
  for (const theme of Object.keys(THEMES)) {
    for (const layout of [undefined, ...LAYOUTS]) {
      const html = buildLanding({ ...base, theme, layout, price: '$59', originalPrice: '$99', deadline: '2026-11-30T23:59:00-05:00', faq: [{ q: 'Is it good — really?', a: 'Yes – very.' }] });
      assert.match(html, /<\/html>/, `${theme}/${layout}`);
      assert.ok(!/[—–]/.test(html), `dash in ${theme}/${layout}`);
    }
  }
});

test('works from minimal input and writes truthful copy', () => {
  const html = buildLanding({ brand: 'Glow Lab', product: 'skincare gift sets', theme: 'christmas', discountPercent: 25 });
  assert.match(html, /Glow Lab/);
  assert.match(html, /25%/);
  const d = describeLanding({ brand: 'Glow Lab', product: 'skincare gift sets', theme: 'christmas', discountPercent: 25 });
  assert.ok(d.headline.length > 5);
  assert.equal(d.layout, 'director:stage', 'skincare gets the product stage');
  // never invents social proof or guarantees
  assert.ok(!/refund|guarantee|review|stars?/i.test(JSON.stringify(d)));
  assert.ok(!html.includes('<figure class="tile quote'));
});

test('signature scenes are distinct pages, not recolours', () => {
  const sig = { 'black-friday': 'data-swing', christmas: 'data-orn', 'cyber-monday': 'class="term"', 'new-year': 'class="clock"' };
  for (const [theme, marker] of Object.entries(sig)) {
    const html = buildLanding({ brand: 'X', product: 'things', theme, discountPercent: 30, deadline: '2026-12-31T23:59:00Z' });
    assert.ok(html.includes(marker), theme);
    for (const [other, m2] of Object.entries(sig)) if (other !== theme) assert.ok(!html.includes(m2), `${theme} contains ${other}`);
  }
});

test('Black Friday receipt computes real savings', () => {
  const html = buildLanding({ brand: 'X', product: 'course', theme: 'black-friday', layout: 'signature', price: '$179', originalPrice: '$299' });
  assert.match(html, /-\$120/);
  assert.match(html, /\$120 back in your pocket/);
});

test('asset brief adds the right compliance items', () => {
  const b = buildBrief({ platform: 'instagram', assetType: 'video', brand: 'Glow Lab', eventId: 'black-friday', sponsored: true, aiGenerated: true, videoSeconds: 15 });
  assert.equal(b.format, 'reel');
  assert.equal(b.video.beats.length, 3);
  const text = b.checklist.join(' ');
  assert.match(text, /#ad/);
  assert.match(text, /AI-generated/);
  assert.match(text, /licensed music/i);
});

test('image brief gives per-tool sizes', () => {
  const b = buildBrief({ platform: 'pinterest', assetType: 'image', brand: 'Glow Lab' });
  assert.equal(b.specs.aspect, '2:3');
  assert.equal(b.imagePrompt.sizeByTool.midjourney, 'append --ar 2:3');
  assert.match(b.imagePrompt.sizeByTool['gpt-image'], /1024x1536/);
});

test('art director: archetype follows the product, chrome varies by brand', () => {
  const page = (o) => buildLanding({ ctaUrl: 'https://x.y', deadline: '2026-11-30T23:59:00-05:00', discountPercent: 30, ...o });
  assert.match(page({ brand: 'Drive', product: 'used cars' }), /class="a-cinematic/);
  assert.match(page({ brand: 'Ada', product: 'ankara dresses' }), /class="a-split/);
  assert.match(page({ brand: 'Kora', product: 'sneakers' }), /class="a-stage/);
  assert.match(page({ brand: 'Learn', product: 'online course' }), /class="a-editorial/);
  // Different brands in the same niche get different nav/button/font combinations.
  const sig = (h) => [/class="a-\w+ n-(\w+) bt-(\w+)"/.exec(h).slice(1).join('/'), /family=([^:&]+)/.exec(h)[1]].join('|');
  const brands = ['Kora', 'Stride', 'Lagos Kicks', 'Sole Mate', 'Fresh Pairs', 'Kickz', 'Run It', 'Heat'];
  const looks = new Set(brands.map((b) => sig(page({ brand: b, product: 'sneakers' }))));
  assert.ok(looks.size >= 5, `only ${looks.size} distinct looks for ${brands.length} brands`);
  // variant re-rolls the look for the same brand
  assert.notEqual(sig(page({ brand: 'Kora', product: 'sneakers', variant: 1 })), sig(page({ brand: 'Kora', product: 'sneakers', variant: 2 })));
});

test('art director: scroll-linked scenes, media and credits', () => {
  const html = buildLanding({ brand: 'Drive', product: 'used cars', ctaUrl: 'https://x.y', images: [{ url: 'https://example.com/a.jpg', attribution: 'Photo by A on Pexels' }, { url: 'https://example.com/b.jpg' }, { url: 'https://example.com/c.jpg' }] });
  assert.match(html, /data-scene/);
  assert.match(html, /data-fx="scale:1\.35>1/, 'hero image is scrubbed by scroll');
  assert.match(html, /data-track/, 'horizontal gallery for 2+ extra images');
  assert.match(html, /Photo by A on Pexels/, 'attribution is printed');
  const vid = buildLanding({ brand: 'Kora', product: 'sneakers', videoUrl: 'https://example.com/spin.mp4' });
  assert.match(vid, /data-scrub/);
  const glb = buildLanding({ brand: 'Kora', product: 'sneakers', modelUrl: 'https://example.com/shoe.glb' });
  assert.match(glb, /model-viewer@3\.5\.0/);
  assert.ok(!/javascript:/.test(buildLanding({ brand: 'x', product: 'sneakers', images: ['javascript:alert(1)'] })));
});
