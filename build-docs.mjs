// Refreshes the GitHub Pages site: injects real tool output into docs/index.html
// (upcoming events, the year strip, a start_campaign result) and regenerates the
// holiday example pages with the landing_page generator itself.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { listEvents } from './src/calendar.js';
import { buildLanding } from './src/landing.js';
import { startCampaign } from './src/start.js';

const year = Number(process.argv[2] ?? new Date().getFullYear());
const today = new Date().toISOString().slice(0, 10);
// Moments that matter to most sellers worldwide (the site is global).
const GLOBAL_BIG = new Set(['valentines', 'mothers-day', 'mothering-sunday', 'easter', 'eid-al-fitr', 'eid-al-adha', 'fathers-day', 'back-to-school', 'black-friday', 'cyber-monday', 'christmas', 'boxing-day', 'lunar-new-year', 'diwali', 'us-independence', 'memorial-day']);
const big = (e) => GLOBAL_BIG.has(e.id);

const upcoming = listEvents({ referenceDate: today, minImpact: 'medium' })
  .filter((e) => e.salesAppropriate && e.id !== 'shipping-cutoff')
  .map((e) => ({ name: e.name, date: e.date, big: ['black-friday', 'cyber-monday', 'christmas', 'valentines', 'mothers-day', 'easter', 'fathers-day', 'back-to-school', 'eid-al-fitr', 'lunar-new-year'].includes(e.id) }));

// One representative year (Jan to Dec of the coming year once we are past October).
const stripYear = new Date().getMonth() >= 9 ? year + 1 : year;
const strip = listEvents({ year: stripYear, referenceDate: `${stripYear}-01-01`, minImpact: 'medium' })
  .filter((e) => e.salesAppropriate && e.date.startsWith(String(stripYear)) && !['shipping-cutoff', 'green-monday'].includes(e.id))
  .map((e) => ({ name: e.name.replace(/\s*\(.*?\)/g, ''), date: e.date, big: big(e) }));

const request = 'i sell sneakers in lagos, need bf content for ig and whatsapp status, 25 percent off';
const s = startCampaign({ description: request, today });
const START = { request, understood: s.understood, events: s.events, questions: s.questions };

const inject = (html, tag, value) => html.replace(new RegExp(`/\\*${tag}\\*/[\\[{][^\\n]*?[\\]}];`), `/*${tag}*/${JSON.stringify(value).replace(/</g, '\\u003c')};`);
const indexPath = 'docs/index.html';
let html = readFileSync(indexPath, 'utf8');
html = inject(html, 'EVENTS', upcoming);
html = inject(html, 'YEAR', strip);
html = inject(html, 'START', START);
writeFileSync(indexPath, html);

mkdirSync('docs/examples', { recursive: true });
// Holiday scenes, from minimal input. Product pages (product-*.html) are built with real media separately.
const examples = {
  'black-friday': { theme: 'black-friday', layout: 'signature', brand: 'ShipFast Academy', product: 'the SaaS course', price: '$179', originalPrice: '$299', ctaUrl: 'https://example.com/checkout', deadline: `${year}-11-30T23:59:00-05:00`, timeZone: 'America/New_York', terms: 'Example page, not a real offer.' },
  christmas: { theme: 'christmas', layout: 'signature', brand: 'Glow Lab', product: 'skincare gift sets', discountPercent: 25, ctaUrl: 'https://example.com/gifts', deadline: `${year}-12-17T23:59:00-05:00`, timeZone: 'America/New_York', terms: 'Example page, not a real offer.' },
  'cyber-monday': { theme: 'cyber-monday', layout: 'signature', brand: 'Pixel Forge', product: 'UI kits', offer: '50% off everything', ctaUrl: 'https://example.com/kits', deadline: `${year}-11-30T23:59:00-08:00`, timeZone: 'America/Los_Angeles', terms: 'Example page, not a real offer.' },
  'new-year': { theme: 'new-year', layout: 'signature', brand: 'Strong Start', product: 'coaching memberships', discountPercent: 30, ctaUrl: 'https://example.com/join', deadline: `${year}-12-31T23:59:00Z`, terms: 'Example page, not a real offer.' },
};
for (const [name, o] of Object.entries(examples)) writeFileSync(`docs/examples/${name}.html`, buildLanding(o));
console.log(`docs: ${upcoming.length} upcoming, ${strip.length} in ${stripYear} strip, start sample ok, ${Object.keys(examples).length} holiday examples`);
