// Art director: builds the page around the product, not the holiday.
// Archetype comes from the niche (cinematic, split, stage); the event is an accent.
// Each brand gets its own type pairing, navigation, buttons and countdown style
// (seeded from the brand name, re-rollable with `variant`), so two sellers never
// get the same page. Motion is scroll-linked: elements are scrubbed by scroll
// position inside pinned scenes, not faded in on a timer.

const PAIRINGS = {
  cinematic: [['Anton', 'Inter'], ['Bebas Neue', 'Inter'], ['Oswald', 'Inter'], ['Archivo Black', 'Archivo'], ['Syne', 'Inter']],
  split: [['Playfair Display', 'Inter'], ['Cormorant Garamond', 'Jost'], ['Fraunces', 'Inter'], ['DM Serif Display', 'DM Sans'], ['Bodoni Moda', 'Manrope']],
  stage: [['Unbounded', 'Inter'], ['Space Grotesk', 'Inter'], ['Syne', 'Manrope'], ['Archivo Black', 'Archivo'], ['Righteous', 'DM Sans']],
  editorial: [['Fraunces', 'Inter'], ['Playfair Display', 'Manrope'], ['DM Serif Display', 'DM Sans'], ['Syne', 'Inter'], ['Space Grotesk', 'Inter']],
};

export const FONT_AXES = {
  Anton: '', 'Bebas Neue': '', 'Archivo Black': '', 'DM Serif Display': ':ital@0;1', Righteous: '', Caveat: ':wght@600',
  Fraunces: ':ital,wght@0,400;0,600;0,800;1,400', 'Playfair Display': ':ital,wght@0,400;0,700;0,900;1,400',
  'Cormorant Garamond': ':ital,wght@0,400;0,600;1,400', 'Bodoni Moda': ':ital,wght@0,400;0,700;1,400',
  Oswald: ':wght@400;600;700', Syne: ':wght@600;700;800', Unbounded: ':wght@500;700;900',
};

const NAVS = ['split', 'center', 'pill', 'side'];
const BUTTONS = ['pill', 'block', 'line', 'disc'];
const CLOCKS = ['inline', 'boxes', 'bar', 'giant', 'flip'];

const NICHE_HEADS = {
  footwear: ['Every pair. {off}.', 'Fresh pairs. Lower prices.', 'Step into {event}.'],
  fashion: ['Dressed for {event}.', 'The edit everyone will ask about.', 'New season. {off}.'],
  beauty: ['Glow, gifted.', 'Your routine, {off}.', 'Skin first. Always.'],
  jewelry: ['Made to be noticed.', 'Gold hour. {off}.', 'The gift they keep.'],
  electronics: ['More power. Less price.', 'Upgrade season is here.', '{off} on the gear you wanted.'],
  automotive: ['The drive you have been waiting for.', 'Your next car. This {event}.', 'Built to move you.'],
  home: ['Make home the best room in town.', 'Hosting season, sorted.', 'Rooms that feel finished.'],
  food: ['Made for the table.', 'Taste the season.', 'Order now. Eat well.'],
  fitness: ['Start before January does.', 'Stronger by spring.', 'Your best season starts now.'],
  courses: ['Learn it this season.', 'The skill that pays you back.', 'Start now. Finish proud.'],
  software: ['Ship more. Pay less.', 'The upgrade your team asked for.', 'Work faster from today.'],
  digital: ['Make it in minutes.', 'Everything you need, one bundle.', 'Create more. Spend less.'],
  services: ['Book the slot before it goes.', 'Look your best this season.', 'Your calendar, sorted.'],
  kids: ['Gifts they will not put down.', 'Play, wrapped.', 'Big smiles. Small prices.'],
  general: ['Our best offer of the season.', 'The moment you waited for.', 'Made for you. Priced for now.'],
};

const NICHE_CTA = { footwear: 'Shop the drop', fashion: 'Shop the edit', beauty: 'Shop the set', jewelry: 'Shop the collection', electronics: 'Shop the deals', automotive: 'Book a test drive', home: 'Shop the room', food: 'Order now', fitness: 'Join now', courses: 'Enroll now', software: 'Start now', digital: 'Get the bundle', services: 'Book now', kids: 'Shop gifts', general: 'Shop now' };

const ARCH_BY_NICHE = { footwear: 'stage', beauty: 'stage', jewelry: 'stage', kids: 'stage', electronics: 'cinematic', automotive: 'cinematic', fitness: 'cinematic', fashion: 'split', home: 'split', food: 'split', services: 'split', courses: 'editorial', software: 'editorial', digital: 'editorial', general: 'cinematic' };

// Holiday themes bring their own palette; only unthemed pages take colour from the photo.
const THEMED = new Set(['Black Friday', 'Cyber Monday', 'Christmas', 'Diwali', 'Hanukkah', 'Halloween', 'Thanksgiving', 'Boxing Day', 'New Year']);

export function archetypeFor(nicheId) { return ARCH_BY_NICHE[nicheId] ?? 'cinematic'; }

/**
 * @param {object} x context from buildLanding: { esc, c, o, t, discount, deadlineMs, deadlineLabel, cta, terms, year, title, jsonLd, img, hash, nicheId, eventName }
 */
export function renderDirector(x) {
  let { c } = x;
  const { esc, o, t, discount, deadlineMs, deadlineLabel, cta, terms, year, title, jsonLd, hash, nicheId, eventName } = x;
  const arch = ['cinematic', 'split', 'stage', 'editorial'].includes(o.archetype) ? o.archetype : archetypeFor(nicheId);
  const seed = hash(`${o.brand}|${c.product}|${o.variant ?? 0}`);
  const pick = (arr, salt) => arr[(seed >> salt) % arr.length];
  const [display, body] = pick(PAIRINGS[arch], 1);
  const nav = pick(NAVS, 4), button = pick(BUTTONS, 7), clock = pick(CLOCKS, 10);
  const images = [...(o.images ?? [])].map((im) => (typeof im === 'string' ? { url: im } : im)).filter((im) => /^https?:\/\/|^\.\/|^\/|^data:image\//.test(im.url ?? ''));
  const hero = o.productImage ? { url: o.productImage, alt: o.imageAlt ?? c.product } : images[0] ?? (o.imageUrl ? { url: o.imageUrl, alt: o.imageAlt } : null);
  const gallery = images.length > 1 ? images.slice(hero === images[0] ? 1 : 0) : [];
  const off = discount ? `${discount}% off` : (c.offer ?? '');
  const heads = NICHE_HEADS[nicheId] ?? NICHE_HEADS.general;
  const headline = o.headline ? c.headline : heads[seed % heads.length].replace('{off}', off ? off.charAt(0).toUpperCase() + off.slice(1) : 'Now on').replace('{event}', eventName ?? 'this season').replace(/\.\s*\./, '.');
  // Type-led hero (no photo, video or 3D): the offer statement is the focal point, so nothing else repeats it.
  const typeLed = !hero && !o.modelUrl && !o.videoUrl;
  const heroHeadline = typeLed && discount && !o.headline ? `${eventName ?? 'The sale'} is here.` : headline;
  const words = (s) => esc(s).split(/\s+/);
  const bg = (im) => (im ? `background-image:url('${esc(im.url).replace(/'/g, '%27')}')` : '');
  const credits = [...(hero ? [hero] : []), ...gallery].filter((im) => im.credit || im.attribution).map((im) => esc(im.credit ?? im.attribution));

  // Button and label speak the niche, not the holiday ("Book a test drive", not "Shop gifts").
  c = { ...c, ctaText: o.ctaText ? c.ctaText : NICHE_CTA[nicheId] ?? c.ctaText };
  const eyebrow = eventName ?? `${o.brand} · ${c.product}`;
  const btn = (label, cls = '') => `<a class="b b-${button} ${cls}" href="${esc(cta)}" data-cta><span>${esc(label)}</span><i aria-hidden="true">→</i></a>`;

  const clockHtml = !deadlineMs ? '' : clock === 'inline'
    ? `<p class="ck ck-inline" data-cd>Ends in <b data-u="d">00</b>d <b data-u="h">00</b>h <b data-u="m">00</b>m <b data-u="s">00</b>s</p>`
    : clock === 'bar'
      ? `<div class="ck ck-bar" data-cd><div class="bt"><span>Time left</span><b><b data-u="d">00</b>d <b data-u="h">00</b>h <b data-u="m">00</b>m <b data-u="s">00</b>s</b></div><div class="bw"><i data-bar></i></div></div>`
      : clock === 'giant'
        ? `<div class="ck ck-giant" data-cd><b data-u="d">00</b><div><span>days left</span><small><b data-u="h">00</b>:<b data-u="m">00</b>:<b data-u="s">00</b></small></div></div>`
      : `<div class="ck ck-${clock}" data-cd>${['d', 'h', 'm', 's'].map((u, i) => `<div><b data-u="${u}">00</b><span>${['Days', 'Hrs', 'Min', 'Sec'][i]}</span></div>`).join('')}</div>`;

  const priceHtml = o.price ? `<p class="pr"><b>${esc(o.price)}</b>${o.originalPrice ? `<s><span class="sr">Was </span>${esc(o.originalPrice)}</s>` : ''}${off ? `<em>${esc(off)}</em>` : ''}</p>` : off ? `<p class="pr"><em>${esc(off)}</em></p>` : '';

  const navHtml = nav === 'center'
    ? `<nav class="nv nv-center"><a href="#" class="lg">${esc(o.brand)}</a></nav>`
    : nav === 'pill'
      ? `<nav class="nv nv-pill"><a href="#" class="lg">${esc(o.brand)}</a><a href="${esc(cta)}" data-cta class="nv-cta">${esc(c.ctaText)}</a></nav>`
      : nav === 'side'
        ? `<nav class="nv nv-side"><a href="#" class="lg">${esc(o.brand)}</a><span>${esc(eventName ? `${eventName} ${year}` : c.product)}</span></nav>`
        : `<nav class="nv nv-split"><a href="#" class="lg">${esc(o.brand)}</a><a href="${esc(cta)}" data-cta class="nv-cta">${esc(c.ctaText)} →</a></nav>`;

  // Product visual: 3D model, scroll-scrubbed video, photo, or typographic fallback.
  const fallback = o.productImage ? { url: o.productImage, alt: o.imageAlt } : images[0] ?? null;
  const productVisual = (cls = '') => o.modelUrl
    ? `<model-viewer class="pv ${cls}" src="${esc(o.modelUrl)}" alt="${esc(o.imageAlt ?? c.product)}" camera-controls disable-zoom interaction-prompt="none" shadow-intensity="1.2" exposure="1.05" environment-image="neutral" data-orbit${fallback ? ` data-fallback="${esc(fallback.url)}"` : ''}>${fallback ? `<img slot="poster" src="${esc(fallback.url)}" alt="${esc(fallback.alt ?? c.product)}" style="width:100%;height:100%;object-fit:contain">` : ''}</model-viewer>`
    : o.videoUrl
      ? `<video class="pv ${cls}" src="${esc(o.videoUrl)}" muted playsinline preload="auto" data-scrub aria-label="${esc(c.product)}"></video>`
      : hero
        ? `<img class="pv ${cls}" src="${esc(hero.url)}" alt="${esc(hero.alt ?? c.product)}">`
        // No photo: the offer itself is the focal point. Products are never drawn or faked.
        : `<div class="pv pv-stmt ${cls}" aria-hidden="true"><span>${esc(discount ? `${discount}%` : (c.product.split(' ').pop() || o.brand).toUpperCase())}</span>${discount ? '<em>off</em>' : ''}</div>`;

  const fill = `<section class="fillsec" data-scene style="--h:220vh"><div class="pin"><p class="fill" data-fill>${words(off && !c.subheadline.toLowerCase().includes(off.toLowerCase()) ? `${c.subheadline} ${off.charAt(0).toUpperCase()}${off.slice(1)} on ${c.product}.` : c.subheadline).map((w) => `<span>${w}</span>`).join(' ')}</p></div></section>`;

  // Products: the real items on sale. On WhatsApp shops each card opens a prefilled chat.
  const products = (o.products ?? []).filter((it) => it && it.name).slice(0, 12);
  const sizeHint = ['footwear', 'fashion'].includes(nicheId) ? ', size __' : '';
  const itemLink = (it) => (/wa\.me/i.test(cta) ? `${cta.split('?')[0]}?text=${encodeURIComponent(`Hi ${o.brand}, I want the ${it.name}${sizeHint}`)}` : it.url ?? cta);
  const pct = (it) => { const n = (v) => Number(String(v ?? '').replace(/[^0-9.]/g, '')); const a = n(it.price), b = n(it.originalPrice); return a && b > a ? Math.round((1 - a / b) * 100) : null; };
  const productsHtml = products.length ? `<section class="pg"><div class="pg-head"><p class="ey">${esc(eyebrow)}</p><h2>${esc(nicheId === 'footwear' ? 'Pick your pair' : nicheId === 'fashion' ? 'Pick your look' : `Shop ${c.product}`)}</h2></div><div class="pg-grid">${products.map((it, i) => `<article class="pc" style="--i:${i}">
${it.image ? `<a class="pc-img" href="${esc(itemLink(it))}" data-cta><img src="${esc(it.image)}" alt="${esc(it.name)}" loading="lazy">${pct(it) ? `<em>-${pct(it)}%</em>` : ''}</a>` : ''}
<div class="pc-body"><h3>${esc(it.name)}</h3>${it.note ? `<p>${esc(it.note)}</p>` : ''}<p class="pc-pr">${it.price ? `<b>${esc(it.price)}</b>` : ''}${it.originalPrice ? `<s>${esc(it.originalPrice)}</s>` : ''}</p><a class="pc-cta" href="${esc(itemLink(it))}" data-cta>${/wa\.me/i.test(cta) ? 'Order on WhatsApp' : esc(c.ctaText)} →</a></div></article>`).join('')}</div></section>` : '';

  const features = c.features.map((f, i) => `<article class="ft" data-depth="${(0.04 * ((i % 3) - 1)).toFixed(2)}"><span class="ftn">${String(i + 1).padStart(2, '0')}</span><h3>${esc(f.title)}</h3><p>${esc(f.text)}</p></article>`).join('');

  const galleryHtml = gallery.length >= 2 ? `<section class="hz" data-scene style="--h:${120 + gallery.length * 60}vh"><div class="pin"><h2 class="hz-h">${esc(c.product)}</h2><div class="track" data-track>${gallery.map((im, i) => `<figure class="card" style="${bg(im)}"><figcaption>${esc(c.features[i % c.features.length]?.title ?? im.alt ?? '')}</figcaption></figure>`).join('')}</div></div></section>` : '';

  // How to order, from the link itself (WhatsApp, Instagram, checkout). Facts only.
  const viaWhatsApp = /wa\.me|whatsapp/i.test(cta);
  const orderAnswer = viaWhatsApp ? 'Tap the button and chat with us on WhatsApp. Send the item and your size or option, and we confirm price and delivery in the chat.'
    : /instagram\.com|ig\.me/i.test(cta) ? 'Tap the button to message us on Instagram and we will take your order there.'
      : cta !== '#' ? 'Tap the button to go straight to checkout.' : null;
  const faqs = [...c.faq.filter((q) => !/how do i (order|buy)/i.test(q.q)), ...(orderAnswer ? [{ q: viaWhatsApp ? 'How do I order on WhatsApp?' : 'How do I order?', a: orderAnswer }] : [])];

  // The ending changes per brand too: poster, coupon ticket, or a giant moving offer line.
  const finStyle = pick(['poster', 'ticket', 'marquee'], 13);
  const bigOff = off ? `${off.charAt(0).toUpperCase()}${off.slice(1)}` : headline;
  const finalHtml = finStyle === 'ticket'
    ? `<section class="fin fin-ticket"><div class="tk"><div class="tk-l"><p class="ey">${esc(eyebrow)}</p><h2>${esc(bigOff)}</h2><p class="lead">${esc(c.product)}${deadlineLabel ? ` · until ${esc(deadlineLabel)}` : ''}</p></div><div class="tk-r">${clockHtml}${btn(c.ctaText, 'big')}<p class="ended" data-ended hidden>This offer has ended. Thank you.</p></div></div></section>`
    : finStyle === 'marquee'
      ? `<section class="fin fin-mq" data-scene style="--h:170vh"><div class="pin"><div class="mq-line" data-fx="x:10vw>-120vw" data-range="0,1">${esc(`${bigOff} · ${c.product} · ${bigOff} · ${c.product} ·`)}</div><div class="fin-in">${clockHtml}${btn(c.ctaText, 'big')}<p class="ended" data-ended hidden>This offer has ended. Thank you.</p></div></div></section>`
      : `<section class="fin" data-scene style="--h:160vh"><div class="pin">${hero ? `<div class="fin-bg" style="${bg(hero)}" data-fx="scale:1.3>1;opacity:0.2>0.55" data-range="0,1"></div>` : ''}<div class="fin-in"><p class="ey">${esc(eyebrow)}</p><h2 data-fx="scale:0.8>1;opacity:0>1" data-range="0,0.6" data-rest="end">${esc(bigOff)}</h2>${clockHtml}${btn(c.ctaText, 'big')}<p class="ended" data-ended hidden>This offer has ended. Thank you.</p></div></div></section>`;

  // Questions: a WhatsApp-style chat when people order on WhatsApp, otherwise columns, swipe cards or an accordion.
  const faqStyle = viaWhatsApp ? 'chat' : pick(['columns', 'cards', 'accordion'], 16);
  const faqHtml = !faqs.length ? '' : faqStyle === 'chat'
    ? `<section class="faq-chat" aria-label="Questions"><div class="chat"><div class="chat-top"><span class="av">${esc(o.brand.slice(0, 1))}</span><div><b>${esc(o.brand)}</b><small>usually replies fast</small></div></div>${faqs.map((q) => `<p class="bub me">${esc(q.q)}</p><p class="bub them">${esc(q.a)}</p>`).join('')}</div></section>`
    : faqStyle === 'columns'
      ? `<section class="faq-cols"><h2>Good to know</h2><dl>${faqs.map((q) => `<div><dt>${esc(q.q)}</dt><dd>${esc(q.a)}</dd></div>`).join('')}</dl></section>`
      : faqStyle === 'cards'
        ? `<section class="faq-cards"><h2>Questions</h2><div class="qc-row">${faqs.map((q, i) => `<article class="qc"><span>Q${i + 1}</span><h3>${esc(q.q)}</h3><p>${esc(q.a)}</p></article>`).join('')}</div></section>`
        : `<section class="faq">${faqs.map((q) => `<details><summary>${esc(q.q)}</summary><p>${esc(q.a)}</p></details>`).join('')}</section>`;

  let main;
  if (arch === 'cinematic') {
    main = `
<section class="hero-c" data-scene data-hero style="--h:260vh"><div class="pin">
  <div class="hc-bg" style="${bg(hero)}" data-fx="scale:1.35>1;y:0>-6vh" data-range="0,1"></div>
  <div class="hc-sweep" data-fx="x:-60vw>60vw;opacity:0.9>0" data-range="0,0.7"></div>
  <div class="hc-shade" data-fx="opacity:0.9>0.6" data-range="0,0.6"></div>
  <h1 class="hc-h" aria-label="${esc(headline)}">${words(headline).map((w, i) => `<span data-fx="scale:1>${(2.6 + (i % 3) * 0.6).toFixed(1)};opacity:1>0;y:0>${i % 2 ? -18 : 14}vh;blur:0>10" data-range="0.05,0.55">${w}</span>`).join(' ')}</h1>
  <div class="hc-deal" data-fx="opacity:0>1;y:12vh>0" data-range="0.45,0.85" data-rest="end"><p class="ey">${esc(eyebrow)} · ${esc(o.brand)}</p>${priceHtml}${clockHtml}${btn(c.ctaText)}</div>
  <div class="hc-scroll" data-fx="opacity:1>0" data-range="0,0.1">Scroll</div>
</div></section>
${productsHtml}
${fill}
${galleryHtml}
<section class="fts fts-c">${features}</section>
${finalHtml}
${faqHtml}`;
  } else if (arch === 'split') {
    const chapters = [
      { h: headline, p: c.subheadline, extra: `${priceHtml}${clockHtml}${btn(c.ctaText)}` },
      ...c.features.map((f) => ({ h: f.title, p: f.text, extra: '' })),
    ];
    const shots = [hero, ...gallery].filter(Boolean);
    main = `
<section class="sp">
  <div class="sp-l">${chapters.map((ch, i) => `<div class="chap" data-chap="${i}"><p class="ey">${i === 0 ? esc(eventName ?? t.eyebrow) : String(i).padStart(2, '0')}</p>${i === 0 ? `<h1>${esc(ch.h)}</h1>` : `<h2>${esc(ch.h)}</h2>`}<p class="lead">${esc(ch.p)}</p>${ch.extra}</div>`).join('')}</div>
  <div class="sp-r"><div class="sp-frame">${shots.length ? shots.map((im, i) => `<div class="shot" data-shot="${i}" style="${bg(im)}" role="img" aria-label="${esc(im.alt ?? c.product)}"></div>`).join('') : productVisual('sp-pv')}<div class="sp-tag">${esc(off || c.product)}</div></div></div>
</section>
${productsHtml}
${fill}
${finalHtml}
${faqHtml}`;
  } else if (arch === 'stage') {
    main = `
<section class="st${typeLed ? ' typeled' : ''}" data-scene data-hero style="--h:300vh"><div class="pin">
  <div class="st-word" aria-hidden="true" data-fx="x:30vw>-80vw" data-range="0,1">${esc(c.product.toUpperCase())} · ${esc(c.product.toUpperCase())} ·</div>
  <div class="st-spot" data-fx="scale:0.9>1.4;opacity:0.7>1" data-range="0,0.6"></div>
  <div class="st-stage"><div class="st-prod" data-fx="${typeLed ? 'y:4vh>-2vh;scale:0.94>1.06' : 'y:4vh>-2vh;rotate:-8>10;scale:0.92>1.12'}" data-range="0,0.7">${productVisual('st-pv')}<div class="st-shadow"></div></div>
  ${typeLed ? '' : ['NEW', off ? off.toUpperCase() : 'LIMITED', eventName ? eventName.toUpperCase() : 'DROP'].map((s, i) => `<span class="stk stk${i}" data-fx="scale:0>1;rotate:${-30 + i * 20}>${-8 + i * 9}" data-range="${(0.1 + i * 0.08).toFixed(2)},${(0.3 + i * 0.08).toFixed(2)}" data-rest="end">${esc(s)}</span>`).join('')}</div>
  <h1 class="st-h" data-fx="y:0>-4vh;scale:1>0.9" data-range="0,0.6">${esc(heroHeadline)}</h1>
  <div class="st-deal" data-fx="opacity:0.0>1;y:8vh>0" data-range="0.15,0.5" data-rest="end">${priceHtml}${clockHtml}${btn(c.ctaText)}</div>
</div></section>
${productsHtml}
${galleryHtml}
${products.length ? '' : `<section class="rows">${c.features.map((f, i) => `<div class="row" data-depth="${(0.03 * (i % 2 ? 1 : -1)).toFixed(2)}"><span>${String(i + 1).padStart(2, '0')}</span><h3>${esc(f.title)}</h3><p>${esc(f.text)}</p></div>`).join('')}</section>`}
${fill}
${finalHtml}
${faqHtml}`;
  } else {
    main = `
<section class="ed">
  <p class="ey">${esc(eyebrow)} · ${esc(o.brand)}</p>
  <h1 class="ed-h">${words(headline).map((w, i) => `<span style="--i:${i}">${w}</span>`).join(' ')}</h1>
  <div class="ed-row"><p class="lead">${esc(c.subheadline)}</p><div>${priceHtml}${clockHtml}${btn(c.ctaText)}</div></div>
  ${hero ? `<div class="ed-img" data-depth="-0.08" style="${bg(hero)}" role="img" aria-label="${esc(hero.alt ?? c.product)}"></div>` : ''}
</section>
${productsHtml}
${fill}
${galleryHtml}
<section class="fts fts-e">${features}</section>
${finalHtml}
${faqHtml}`;
  }

  // SEO: "Brand Event: 30% off product" reads well in search results and share previews.
  const seoTitle = o.headline ? title : `${o.brand}${eventName ? ` ${eventName}` : ''}: ${off ? `${off} ` : ''}${c.product}`.replace(/\s+/g, ' ').trim();
  const ld = [
    { '@context': 'https://schema.org', '@type': 'Organization', name: o.brand, ...(o.pageUrl ? { url: o.pageUrl } : {}) },
    ...(c.faq.length ? [{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: c.faq.map((q) => ({ '@type': 'Question', name: q.q, acceptedAnswer: { '@type': 'Answer', text: q.a } })) }] : []),
  ].map((d) => `<script type="application/ld+json">${JSON.stringify(d).replace(/</g, '\\u003c')}</script>`).join('\n');
  const fontsHref = [...new Set([display, body])].map((f) => `family=${f.replace(/ /g, '+')}${FONT_AXES[f] ?? ':wght@400;500;600;700'}`).join('&');
  const css = buildCss({ t, arch, display, body, button, nav, clock });
  const paletteSrc = !o.brandColor && !THEMED.has(eventName) && hero ? hero.url : null;
  const js = buildJs({ deadlineMs, hasPaletteImg: Boolean(paletteSrc) });

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(seoTitle)}</title>
<meta name="description" content="${esc(c.subheadline)}">
<meta name="theme-color" content="${t.bg}">
<meta property="og:title" content="${esc(seoTitle)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta property="og:description" content="${esc(c.subheadline)}">
<meta property="og:type" content="website">
${hero ? `<meta property="og:image" content="${esc(hero.url)}">\n<meta name="twitter:card" content="summary_large_image">\n<link rel="preload" as="image" href="${esc(hero.url)}">` : '<meta name="twitter:card" content="summary">'}
${o.pageUrl ? `<link rel="canonical" href="${esc(o.pageUrl)}">` : ''}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?${fontsHref}&display=swap" rel="stylesheet">
${o.modelUrl ? '<script type="module" src="https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js"></script>' : ''}
${jsonLd}
${ld}
<style>${css}</style>
</head>
<body class="a-${arch} n-${nav} bt-${button}">
${navHtml}
<main>
${main}
</main>
<footer class="ft-legal">${terms ? `<p id="terms"><b>Offer terms.</b> ${esc(terms)}</p>` : ''}${credits.length ? `<p class="credits">Photos: ${credits.join(' · ')}</p>` : ''}<p>© ${new Date().getFullYear()} ${esc(o.brand)}</p></footer>
<div class="sticky" data-sticky><span>${esc(off || o.brand)}</span>${btn(c.ctaText)}</div>
${paletteSrc ? `<img src="${esc(paletteSrc)}" alt="" crossorigin="anonymous" data-palette hidden>` : ''}
<script>${js}</script>
</body>
</html>
`;
}

function buildCss({ t, arch, display, body }) {
  return `
:root{--bg:${t.bg};--sf:${t.surface};--tx:${t.text};--mu:${t.muted};--ac:${t.accent};--ac2:${t.accent2};--at:${t.accentText};--bd:${t.border};--d:'${display}',Georgia,serif;--b:'${body}',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;--e:cubic-bezier(.2,.7,.2,1)}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--tx);font:400 17px/1.6 var(--b);-webkit-font-smoothing:antialiased;overflow-x:clip}
a{color:inherit}img{max-width:100%;display:block}.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
h1,h2,h3{font-family:var(--d);font-weight:400;letter-spacing:-.02em;margin:0}
.ey{font:600 12px/1 var(--b);letter-spacing:.22em;text-transform:uppercase;color:var(--ac);margin:0 0 18px}
.lead{color:var(--mu);font-size:clamp(17px,1.6vw,20px);max-width:34em}
/* scenes: tall section, pinned stage */
[data-scene]{position:relative;height:var(--h,200vh)}
[data-scene]>.pin{position:sticky;top:0;height:100vh;height:100svh;overflow:hidden}
[data-fx]{will-change:transform,opacity,filter}
/* nav variants */
.nv{position:fixed;z-index:40;display:flex;align-items:center;gap:18px;font-weight:600}
.lg{font:700 20px/1 var(--d);text-decoration:none;letter-spacing:-.01em}
.nv-split{top:0;left:0;right:0;justify-content:space-between;padding:22px clamp(18px,4vw,48px);mix-blend-mode:difference;color:#fff}
.nv-split .nv-cta{text-decoration:none;font-size:15px}
.nv-center{top:22px;left:50%;translate:-50% 0;mix-blend-mode:difference;color:#fff}.nv-center .lg{font-size:24px}
.nv-pill{bottom:22px;left:50%;translate:-50% 0;padding:8px 8px 8px 22px;border-radius:999px;background:color-mix(in srgb,var(--sf) 80%,transparent);backdrop-filter:blur(14px);border:1px solid var(--bd);box-shadow:0 20px 50px -20px rgba(0,0,0,.6)}
.nv-pill .nv-cta{text-decoration:none;background:var(--ac);color:var(--at);padding:10px 18px;border-radius:999px;font-size:14px}
.nv-side{top:0;left:0;bottom:0;width:56px;flex-direction:column;justify-content:space-between;padding:24px 0;border-right:1px solid var(--bd);background:var(--bg)}
.nv-side .lg{writing-mode:vertical-rl;rotate:180deg;font-size:18px}.nv-side span{writing-mode:vertical-rl;rotate:180deg;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--mu)}
body.n-side main,body.n-side .ft-legal{margin-left:56px}
@media(max-width:700px){.nv-side{width:auto;height:auto;bottom:auto;right:0;flex-direction:row;padding:16px 18px;border-right:0;border-bottom:1px solid var(--bd)}.nv-side .lg,.nv-side span{writing-mode:initial;rotate:0deg}body.n-side main,body.n-side .ft-legal{margin-left:0}}
/* button variants */
.b{display:inline-flex;align-items:center;gap:12px;text-decoration:none;font-weight:700;font-size:17px;transition:transform .3s var(--e),background .3s,color .3s}
.b i{font-style:normal;transition:transform .3s var(--e)}.b:hover i{transform:translateX(5px)}
.b:focus-visible{outline:3px solid var(--tx);outline-offset:4px}
.b-pill{padding:18px 30px;border-radius:999px;background:var(--ac);color:var(--at)}.b-pill:hover{transform:translateY(-2px)}
.b-block{padding:20px 30px;background:var(--ac);color:var(--at);box-shadow:6px 6px 0 var(--tx);text-transform:uppercase;letter-spacing:.06em}.b-block:hover{transform:translate(-3px,-3px);box-shadow:9px 9px 0 var(--tx)}
.b-line{padding:10px 0;border-bottom:2px solid var(--ac);font-size:19px;color:var(--tx)}.b-line:hover{color:var(--ac)}
.b-disc{width:132px;height:132px;border-radius:50%;justify-content:center;flex-direction:column;gap:2px;background:var(--ac);color:var(--at);text-align:center;font-size:15px;line-height:1.15;padding:14px}.b-disc:hover{transform:scale(1.06) rotate(-4deg)}
.b.big.b-pill,.b.big.b-block{font-size:20px;padding:22px 38px}
.b[aria-disabled=true]{opacity:.45;pointer-events:none}
/* price + clocks */
.pr{display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;margin:0 0 20px}.pr b{font:400 clamp(40px,5vw,60px)/1 var(--d)}.pr s{color:var(--mu);font-size:20px}
.pr em{font-style:normal;font-weight:700;font-size:13px;letter-spacing:.12em;text-transform:uppercase;padding:6px 12px;border-radius:999px;background:var(--ac);color:var(--at)}
.ck{margin:0 0 26px}.ck b{font-variant-numeric:tabular-nums}
.ck-inline{font-size:18px}.ck-inline b{color:var(--ac);font-size:22px}
.ck-boxes,.ck-flip{display:flex;gap:10px}
.ck-boxes div,.ck-flip div{min-width:70px;padding:12px 8px;text-align:center;border:1px solid var(--bd);border-radius:14px;background:color-mix(in srgb,var(--sf) 70%,transparent)}
.ck-boxes b,.ck-flip b{display:block;font:400 32px/1 var(--d)}.ck-boxes span,.ck-flip span{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--mu)}
.ck-flip div{perspective:400px;background:linear-gradient(var(--sf) 50%,color-mix(in srgb,var(--sf) 80%,#000) 50%)}
.ck-flip b.tick{animation:flp .5s var(--e)}@keyframes flp{from{transform:rotateX(-90deg)}}
.ck-bar{width:min(420px,100%)}.ck-bar .bt{display:flex;justify-content:space-between;gap:12px;font-size:14px;margin-bottom:8px}.ck-bar .bt span{color:var(--mu);text-transform:uppercase;letter-spacing:.14em;font-size:12px}
.ck-bar .bw{height:8px;border-radius:99px;background:color-mix(in srgb,var(--tx) 14%,transparent);overflow:hidden}.ck-bar .bw i{display:block;height:100%;width:100%;border-radius:inherit;background:linear-gradient(90deg,var(--ac),var(--ac2));transform-origin:left;transition:transform 1s linear}
.ck-giant{display:flex;align-items:flex-end;gap:14px}.ck-giant>b{font:400 clamp(72px,9vw,128px)/.8 var(--d);color:var(--ac)}.ck-giant div{display:flex;flex-direction:column;padding-bottom:6px}.ck-giant span{text-transform:uppercase;letter-spacing:.16em;font-size:12px;color:var(--mu)}.ck-giant small{font-size:16px}
/* cinematic */
.hc-bg{position:absolute;inset:-4%;background:radial-gradient(120% 90% at 30% 20%,var(--ac2),transparent 60%),var(--sf);background-size:cover;background-position:center}
.hc-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.35),rgba(0,0,0,.12) 45%,rgba(0,0,0,.55) 85%,var(--bg))}
.hc-sweep{position:absolute;top:-20%;bottom:-20%;width:38vw;background:linear-gradient(100deg,transparent,rgba(255,255,255,.22),transparent);mix-blend-mode:overlay;rotate:12deg}
.hc-h{position:absolute;inset:0;display:flex;flex-wrap:wrap;align-content:center;justify-content:center;gap:0 .25em;padding:0 5vw;text-align:center;font-size:clamp(56px,11vw,190px);line-height:.88;text-transform:uppercase;color:#fff;text-shadow:0 10px 60px rgba(0,0,0,.4)}
.hc-h span{display:inline-block}
.hc-deal{position:absolute;left:clamp(18px,6vw,90px);bottom:clamp(30px,10vh,110px);max-width:560px;opacity:0;color:#fff}
.hc-deal::before{content:'';position:absolute;inset:-28% -40% -30% -30%;z-index:-1;background:radial-gradient(closest-side,rgba(0,0,0,.72),rgba(0,0,0,.4) 60%,transparent);filter:blur(10px)}
.hc-deal .ey{color:#fff}
.hc-scroll{position:absolute;bottom:26px;left:50%;translate:-50% 0;font-size:12px;letter-spacing:.3em;text-transform:uppercase;color:#fff;opacity:.8}
.hc-scroll::after{content:'';display:block;width:1px;height:40px;margin:10px auto 0;background:currentColor;animation:drip 1.6s ease-in-out infinite}
@keyframes drip{0%{transform:scaleY(0);transform-origin:top}50%{transform:scaleY(1);transform-origin:top}51%{transform-origin:bottom}100%{transform:scaleY(0);transform-origin:bottom}}
/* fill text */
.fillsec .pin{display:grid;place-items:center;padding:0 clamp(18px,8vw,140px)}
.fill{font:400 clamp(30px,5vw,72px)/1.12 var(--d);margin:0;max-width:20ch}
.fill span{opacity:.14;transition:opacity .2s linear}
/* horizontal gallery */
.hz .pin{display:flex;flex-direction:column;justify-content:center;gap:28px}
.hz-h{padding:0 clamp(18px,6vw,90px);font-size:clamp(40px,7vw,110px);line-height:.9}
.track{display:flex;gap:22px;padding:0 clamp(18px,6vw,90px);width:max-content}
.card{position:relative;width:min(62vw,560px);aspect-ratio:4/5;border-radius:22px;background-size:cover;background-position:center;background-color:var(--sf);margin:0;overflow:hidden}
.card figcaption{position:absolute;left:18px;bottom:16px;right:18px;padding:12px 16px;border-radius:14px;background:color-mix(in srgb,var(--bg) 70%,transparent);backdrop-filter:blur(10px);font-weight:600}
/* features */
.fts{display:grid;gap:clamp(24px,4vw,60px);padding:clamp(80px,12vw,160px) clamp(18px,6vw,90px)}
@media(min-width:860px){.fts{grid-template-columns:repeat(3,1fr)}}
.ft{border-top:1px solid var(--bd);padding-top:26px}.ftn{font:400 14px/1 var(--b);color:var(--ac);letter-spacing:.2em}.ft h3{font-size:clamp(26px,2.6vw,36px);line-height:1.05;margin:14px 0 10px}.ft p{color:var(--mu);margin:0}
.fts-s .ft{border:1px solid var(--bd);border-radius:26px;padding:30px;background:color-mix(in srgb,var(--sf) 60%,transparent)}
/* product grid */
.pg{padding:clamp(80px,12vw,150px) clamp(18px,6vw,90px)}.pg-head h2{font-size:clamp(44px,7vw,110px);line-height:.9;margin-bottom:40px}
.pg-grid{display:grid;gap:20px;grid-template-columns:repeat(auto-fill,minmax(min(100%,260px),1fr))}
.pc{display:flex;flex-direction:column;border-radius:26px;overflow:hidden;background:var(--sf);border:1px solid var(--bd);transition:transform .4s var(--e),border-color .4s}
.pc:hover{transform:translateY(-6px);border-color:var(--ac)}
.pc-img{position:relative;display:grid;place-items:center;aspect-ratio:1;background:radial-gradient(circle at 50% 60%,color-mix(in srgb,var(--ac) 22%,transparent),transparent 70%)}
.pc-img img{width:82%;height:82%;object-fit:contain;filter:drop-shadow(0 24px 24px rgba(0,0,0,.4));transition:transform .5s var(--e)}
.pc:hover .pc-img img{transform:rotate(-8deg) scale(1.08) translateY(-4%)}
.typeled .st-word{display:none}.typeled .st-deal .pr em{display:none}
.pc-img em{position:absolute;top:14px;left:14px;font-style:normal;font-weight:800;font-size:13px;padding:6px 10px;border-radius:99px;background:var(--ac);color:var(--at)}
.pc-body{padding:20px 22px 24px;display:flex;flex-direction:column;gap:6px;flex:1}.pc-body h3{font-size:24px;line-height:1.1}.pc-body p{margin:0;color:var(--mu);font-size:15px}
.pc-pr{display:flex;gap:10px;align-items:baseline}.pc-pr b{font:400 26px/1 var(--d);color:var(--tx)}.pc-pr s{font-size:15px}
.pc-cta{margin-top:auto;padding-top:12px;font-weight:700;text-decoration:none;color:var(--ac)}
/* numbered rows */
.rows{padding:clamp(80px,12vw,150px) clamp(18px,6vw,90px);display:flex;flex-direction:column}
.row{display:grid;grid-template-columns:auto 1fr;column-gap:clamp(18px,4vw,60px);align-items:baseline;padding:clamp(22px,3vw,40px) 0;border-top:1px solid var(--bd)}
.row span{grid-row:span 2;font:400 clamp(60px,9vw,140px)/.8 var(--d);color:transparent;-webkit-text-stroke:1.5px var(--ac)}
.row h3{font-size:clamp(30px,4vw,64px);line-height:1}.row p{margin:8px 0 0;color:var(--mu);max-width:40em}
.row:hover span{color:var(--ac)}
/* split */
.sp{display:grid}
@media(min-width:960px){.sp{grid-template-columns:1fr 1fr}}
.sp-l{padding:0 clamp(18px,6vw,90px)}
.chap{min-height:100vh;min-height:100svh;display:flex;flex-direction:column;justify-content:center;padding:12vh 0}
.chap h1{font-size:clamp(48px,6.5vw,104px);line-height:.95;margin-bottom:22px;font-style:italic}.chap h2{font-size:clamp(36px,4.5vw,68px);line-height:1;margin-bottom:18px}
.sp-r{position:relative}
.sp-frame{position:sticky;top:0;height:100vh;height:100svh;overflow:hidden}
.shot{position:absolute;inset:0;background-size:cover;background-position:center;clip-path:inset(100% 0 0 0);transform:scale(1.15);transition:clip-path 1.1s var(--e),transform 2.4s var(--e)}
.shot.on{clip-path:inset(0 0 0 0);transform:scale(1)}
.shot[data-shot="0"]{clip-path:inset(0 0 0 0);transform:scale(1)}
.sp-tag{position:absolute;right:24px;bottom:24px;padding:12px 18px;border-radius:999px;background:var(--ac);color:var(--at);font-weight:700;letter-spacing:.04em}
@media(max-width:959px){.sp-r{order:-1}.sp-frame{height:70vh}.chap{min-height:auto;padding:56px 0}}
/* stage */
.st .pin{display:grid;place-items:center}
.st-word{position:absolute;top:50%;left:0;translate:0 -50%;white-space:nowrap;font:400 clamp(120px,24vw,360px)/1 var(--d);color:transparent;-webkit-text-stroke:1.5px color-mix(in srgb,var(--tx) 22%,transparent);pointer-events:none}
.st-spot{position:absolute;width:70vmin;height:70vmin;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--ac) 55%,transparent),transparent 65%);filter:blur(30px)}
.st-prod{position:relative;width:min(64vmin,560px);aspect-ratio:1;display:grid;place-items:center}
.pv{width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 40px 50px rgba(0,0,0,.45))}
model-viewer.pv{--poster-color:transparent;background:transparent}
.pv-stmt{display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:var(--d);font-size:clamp(88px,min(23vw,26vmin),300px);line-height:.82;color:var(--ac);text-align:center;white-space:nowrap}.pv-stmt em{font-style:normal;font-size:.34em;letter-spacing:.06em;text-transform:uppercase;color:var(--tx);margin-top:.1em}
.st-shadow{position:absolute;bottom:4%;left:20%;right:20%;height:24px;border-radius:50%;background:rgba(0,0,0,.5);filter:blur(14px);z-index:-1}
.stk{position:absolute;padding:10px 16px;border-radius:999px;font:800 14px/1 var(--b);letter-spacing:.12em;background:var(--ac);color:var(--at);box-shadow:0 14px 30px -10px rgba(0,0,0,.5)}
.stk0{top:16%;left:14%}.stk1{top:22%;right:12%;background:var(--tx);color:var(--bg)}.stk2{bottom:30%;left:10%;background:var(--ac2);color:var(--at)}
.st-h{position:absolute;top:max(13vh,92px);left:0;right:0;text-align:center;font-size:clamp(40px,6vw,96px);line-height:.95;padding:0 5vw}
.st-deal{position:absolute;bottom:7vh;left:0;right:0;display:flex;flex-direction:column;align-items:center;text-align:center}
.st-deal .pr,.st-deal .ck{justify-content:center}
@media(min-width:1000px){.st-deal{left:auto;right:6vw;bottom:9vh;max-width:380px;align-items:flex-end;text-align:right}.st-deal .pr,.st-deal .ck{justify-content:flex-end}}
/* editorial */
.ed{padding:clamp(110px,16vh,180px) clamp(18px,6vw,90px) 60px}
.ed-h{font-size:clamp(56px,9vw,150px);line-height:.92;max-width:12ch;margin-bottom:40px}
.ed-h span{display:inline-block;animation:edin 1s var(--e) both;animation-delay:calc(var(--i)*80ms)}
@keyframes edin{from{transform:translateY(40%);opacity:0}}
.ed-row{display:grid;gap:40px;align-items:end}@media(min-width:900px){.ed-row{grid-template-columns:1fr auto}}
.ed-img{margin-top:70px;height:70vh;border-radius:28px;background-size:cover;background-position:center;background-color:var(--sf)}
/* final + faq + footer */
.fin .pin{display:grid;place-items:center;text-align:center}
.fin-bg{position:absolute;inset:-5%;background-size:cover;background-position:center;opacity:.35}
.fin-in{position:relative;display:flex;flex-direction:column;align-items:center;padding:0 5vw}
.fin h2{font-size:clamp(60px,12vw,200px);line-height:.88;margin-bottom:30px}
.fin .ck-boxes,.fin .ck-flip{justify-content:center}
.ended{color:var(--mu)}
/* ending variants */
.fin-ticket{padding:clamp(80px,12vw,160px) clamp(18px,6vw,90px)}
.tk{display:grid;border-radius:26px;background:var(--ac);color:var(--at);overflow:hidden;position:relative}
@media(min-width:900px){.tk{grid-template-columns:1.4fr 1fr}}
.tk-l{padding:clamp(28px,4vw,56px)}.tk-l h2{font-size:clamp(48px,7vw,110px);line-height:.9;margin:6px 0 14px}.tk-l .ey,.tk-l .lead{color:inherit;opacity:.85}
.tk-r{padding:clamp(28px,4vw,56px);display:flex;flex-direction:column;justify-content:center;gap:10px;border-left:3px dashed color-mix(in srgb,var(--at) 45%,transparent);position:relative;background:color-mix(in srgb,var(--at) 8%,transparent)}
.tk-r::before,.tk-r::after{content:'';position:absolute;left:-17px;width:32px;height:32px;border-radius:50%;background:var(--bg)}.tk-r::before{top:-16px}.tk-r::after{bottom:-16px}
.tk .b-pill,.tk .b-block,.tk .b-disc{background:var(--at);color:var(--ac)}.tk .b-line{color:var(--at);border-color:var(--at)}.tk .ck b,.tk .ck span{color:inherit}
@media(max-width:899px){.tk-r{border-left:0;border-top:3px dashed color-mix(in srgb,var(--at) 45%,transparent)}.tk-r::before,.tk-r::after{display:none}}
.fin-mq .pin{display:flex;flex-direction:column;justify-content:center;gap:40px}
.mq-line{white-space:nowrap;font:400 clamp(90px,16vw,260px)/1 var(--d);color:var(--ac);text-transform:uppercase;letter-spacing:-.02em}
.fin-mq .fin-in{align-items:flex-start;padding:0 clamp(18px,6vw,90px)}
/* question variants */
.faq-chat{padding:clamp(60px,10vw,120px) clamp(18px,6vw,90px);display:grid;place-items:center}
.chat{width:min(520px,100%);border-radius:28px;background:#0b141a;padding:0 0 22px;overflow:hidden;box-shadow:0 30px 70px -30px rgba(0,0,0,.7);font-size:16px;color:#e9edef}
.chat-top{display:flex;gap:12px;align-items:center;padding:14px 18px;background:#202c33;margin-bottom:16px}.chat-top small{display:block;color:#8696a0;font-size:12px}
.av{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:var(--ac);color:var(--at);font-weight:800}
.bub{max-width:82%;margin:6px 16px;padding:9px 12px 10px;border-radius:12px;line-height:1.4}
.bub.me{margin-left:auto;background:#005c4b;border-top-right-radius:4px}.bub.them{background:#202c33;border-top-left-radius:4px}
.faq-cols{padding:clamp(60px,10vw,120px) clamp(18px,6vw,90px)}.faq-cols h2{font-size:clamp(36px,5vw,72px);margin-bottom:34px}
.faq-cols dl{display:grid;gap:30px 60px;margin:0}@media(min-width:860px){.faq-cols dl{grid-template-columns:1fr 1fr}}
.faq-cols dt{font:400 clamp(22px,2vw,28px)/1.2 var(--d);margin-bottom:8px}.faq-cols dd{margin:0;color:var(--mu)}
.faq-cards{padding:clamp(60px,10vw,120px) 0}.faq-cards h2{font-size:clamp(36px,5vw,72px);margin:0 clamp(18px,6vw,90px) 30px}
.qc-row{display:flex;gap:18px;overflow-x:auto;scroll-snap-type:x mandatory;padding:0 clamp(18px,6vw,90px) 10px;scrollbar-width:none}
.qc{flex:0 0 min(80vw,380px);scroll-snap-align:start;border-radius:24px;padding:28px;background:var(--sf);border:1px solid var(--bd)}
.qc span{font-weight:800;color:var(--ac);letter-spacing:.12em;font-size:13px}.qc h3{font-size:24px;margin:12px 0 10px;line-height:1.15}.qc p{margin:0;color:var(--mu)}
.faq{max-width:820px;margin:0 auto;padding:60px clamp(18px,6vw,40px) 40px}
.faq details{border-bottom:1px solid var(--bd);padding:20px 0}.faq summary{cursor:pointer;font-weight:600;font-size:19px;list-style:none}.faq summary::after{content:'+';float:right;color:var(--ac)}.faq details[open] summary::after{content:'−'}.faq p{color:var(--mu)}
.ft-legal{padding:40px clamp(18px,6vw,90px) 130px;font-size:13px;color:var(--mu)}.credits{opacity:.8}
.sticky{position:fixed;left:12px;right:12px;bottom:12px;z-index:50;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:8px 8px 8px 18px;border-radius:999px;background:color-mix(in srgb,var(--sf) 88%,transparent);backdrop-filter:blur(14px);border:1px solid var(--bd);transform:translateY(150%);transition:transform .4s var(--e)}
.sticky.show{transform:none}.sticky .b{padding:12px 18px;font-size:14px;width:auto;height:auto;border-radius:999px;box-shadow:none;flex-direction:row}.sticky span{font-weight:600;font-size:14px}
body.n-pill .sticky{display:none}
@media(min-width:900px){.sticky{display:none}}
.st-stage{display:contents}
/* phones and tablets: the opening section is laid out top to bottom, nothing overlaps */
@media(max-width:899px){
[data-hero]{height:auto!important}[data-hero]>.pin{position:relative;height:auto;min-height:0;overflow:hidden}
.nv-center,.nv-split{position:absolute}.nv-split{mix-blend-mode:normal;color:var(--tx)}
.st .pin{display:flex;flex-direction:column;align-items:center;gap:26px;padding:92px 18px 56px}
.st-word,.st-shadow{display:none}
.st-spot{top:150px;left:50%;translate:-50% 0;width:120vw;height:120vw;max-width:680px;max-height:680px}
.st-h{order:-1;position:relative;top:auto;left:auto;right:auto;padding:0;font-size:clamp(38px,10.5vw,72px);line-height:1}
.st-stage{display:block;position:relative;width:min(80vw,460px);aspect-ratio:1}
.st-prod{width:100%;height:100%}
.stk{padding:8px 13px;font-size:11px;letter-spacing:.1em;z-index:2}
.stk0{top:0;left:-2%}.stk1{top:9%;right:-3%;left:auto}.stk2{bottom:2%;left:2%;top:auto}
.st-deal{position:relative;bottom:auto;left:auto;right:auto;width:100%;max-width:460px}
.hero-c .pin{min-height:100vh;min-height:100svh;display:flex;flex-direction:column;justify-content:flex-end;gap:22px;padding:110px 18px 44px}
.hc-sweep,.hc-scroll{display:none}
.hc-h{position:relative;inset:auto;padding:0;font-size:clamp(46px,13vw,104px);justify-content:flex-start;text-align:left}
.hc-deal{position:relative;left:auto;bottom:auto;opacity:1;max-width:none}
.pr b{font-size:clamp(36px,10vw,52px)}.pr s{font-size:17px}
.b-disc{width:100%;max-width:460px;height:auto;min-height:58px;border-radius:999px;flex-direction:row;gap:10px;padding:16px 24px;font-size:17px}
.st-deal .b,.hc-deal .b-pill,.hc-deal .b-block{width:100%;max-width:460px;justify-content:center}
}
@media(prefers-reduced-motion:reduce){[data-scene]{height:auto!important}[data-scene]>.pin{position:relative;height:auto;min-height:100vh;overflow:visible}.ed-h span{animation:none}.hc-h{position:relative;min-height:60vh}.hc-deal,.st-h,.st-deal{position:relative;inset:auto;opacity:1!important;transform:none!important;margin:24px auto}.fill span{opacity:1}.shot{transition:none}.hc-scroll::after{animation:none}}
`;
}

function buildJs({ deadlineMs, hasPaletteImg }) {
  return `
(function(){
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var compact=matchMedia('(max-width: 899px)');
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
function clamp(v){return v<0?0:v>1?1:v}
function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
/* parse data-fx="scale:1.3>1;y:0>-6vh;rotate:-14>8;opacity:0>1;blur:0>10;x:-60vw>60vw" */
function parse(el){var r=(el.getAttribute('data-range')||'0,1').split(',').map(Number);return{el:el,r:r,rest:el.getAttribute('data-rest'),props:el.getAttribute('data-fx').split(';').filter(Boolean).map(function(s){var kv=s.split(':'),ab=kv[1].split('>');return{k:kv[0].trim(),a:parseFloat(ab[0]),b:parseFloat(ab[1]),u:(ab[1].match(/[a-z%]+$/)||[''])[0]}})}}
function apply(it,p){var t=ease(clamp((p-it.r[0])/((it.r[1]-it.r[0])||1)));var tr={x:0,y:0,s:1,r:0},op=null,bl=0,xu='px',yu='px';
it.props.forEach(function(q){var v=q.a+(q.b-q.a)*t;if(q.k==='x'){tr.x=v;xu=q.u||'px'}else if(q.k==='y'){tr.y=v;yu=q.u||'px'}else if(q.k==='scale')tr.s=v;else if(q.k==='rotate')tr.r=v;else if(q.k==='opacity')op=v;else if(q.k==='blur')bl=v});
it.el.style.transform='translate3d('+tr.x+xu+','+tr.y+yu+',0) scale('+tr.s+') rotate('+tr.r+'deg)';if(op!==null)it.el.style.opacity=op;it.el.style.filter=bl?'blur('+bl+'px)':''}
var scenes=$$('[data-scene]').map(function(s){return{el:s,hero:s.hasAttribute('data-hero'),flat:false,items:$$('[data-fx]',s).map(parse),track:s.querySelector('[data-track]'),fill:$$('[data-fill] span',s),video:s.querySelector('[data-scrub]'),orbit:s.querySelector('[data-orbit]'),p:0,sp:-1}});
var loose=$$('[data-fx]').filter(function(el){return!el.closest('[data-scene]')}).map(parse);
var depth=$$('[data-depth]');
if(reduce){scenes.forEach(function(sc){sc.items.forEach(function(it){apply(it,it.rest==='end'?1:0)})});return startClock()}
function progress(el){var r=el.getBoundingClientRect(),h=r.height-innerHeight;return h>0?clamp(-r.top/h):clamp((innerHeight-r.top)/(innerHeight+r.height))}
var running=false;
function frame(){var moving=false;
scenes.forEach(function(sc){
if(sc.hero&&compact.matches){if(!sc.flat){sc.flat=true;sc.items.forEach(function(it){it.el.style.transform='';it.el.style.opacity='';it.el.style.filter=''})}return}
if(sc.flat){sc.flat=false;sc.sp=-1}
var target=progress(sc.el);sc.p+=(target-sc.p)*0.14;if(Math.abs(target-sc.p)>0.0004)moving=true;else sc.p=target;
if(Math.abs(sc.p-sc.sp)<0.00005)return;sc.sp=sc.p;var p=sc.p;
sc.items.forEach(function(it){apply(it,p)});
if(sc.track){var w=sc.track.scrollWidth-innerWidth+40;sc.track.style.transform='translate3d('+(-Math.max(0,w)*ease(clamp((p-0.08)/0.84)))+'px,0,0)'}
if(sc.fill.length){var n=sc.fill.length;sc.fill.forEach(function(w,i){w.style.opacity=p*n*1.25>i?1:.14})}
if(sc.video&&sc.video.duration){sc.video.currentTime=Math.min(sc.video.duration-0.05,p*sc.video.duration)}
if(sc.orbit){sc.orbit.cameraOrbit=(p*540-60)+'deg 75deg auto'}});
depth.forEach(function(el){var r=el.getBoundingClientRect(),d=parseFloat(el.getAttribute('data-depth'));el.style.transform='translate3d(0,'+((r.top+r.height/2-innerHeight/2)*d)+'px,0)'});
if(moving)requestAnimationFrame(frame);else running=false}
function kick(){if(!running){running=true;requestAnimationFrame(frame)}}
addEventListener('scroll',kick,{passive:true});addEventListener('resize',kick);kick();
/* split showcase: reveal the shot that matches the chapter in view */
var shots=$$('[data-shot]');if(shots.length&&'IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var i=+e.target.getAttribute('data-chap');shots.forEach(function(s){var k=+s.getAttribute('data-shot');s.classList.toggle('on',k<=Math.min(i,shots.length-1))})}})},{threshold:.5});$$('[data-chap]').forEach(function(c){io.observe(c)})}
/* sticky CTA */
var st=document.querySelector('[data-sticky]');addEventListener('scroll',function(){st.classList.toggle('show',scrollY>innerHeight*1.2)},{passive:true});
${hasPaletteImg ? `/* palette from the hero photo when no brand colour is set */
var pimg=document.querySelector('[data-palette]');function pal(){try{var c=document.createElement('canvas'),x=c.getContext('2d');c.width=c.height=24;x.drawImage(pimg,0,0,24,24);var d=x.getImageData(0,0,24,24).data,best=null,bs=-1;for(var i=0;i<d.length;i+=4){var r=d[i],g=d[i+1],b=d[i+2],mx=Math.max(r,g,b),mn=Math.min(r,g,b),s=mx?(mx-mn)/mx:0,score=s*(mx/255);if(score>bs&&mx>80){bs=score;best=[r,g,b]}}if(best&&bs>.25){var L=(0.299*best[0]+0.587*best[1]+0.114*best[2])/255;document.documentElement.style.setProperty('--ac','rgb('+best.join(',')+')');document.documentElement.style.setProperty('--at',L>.6?'#111':'#fff')}}catch(e){}}if(pimg){if(pimg.complete)pal();else pimg.addEventListener('load',pal)}` : ''}
/* 3D: fall back to the photo when WebGL2 is missing or the model fails/stalls */
$$('model-viewer[data-fallback]').forEach(function(mv){var swap=function(){if(mv.loaded)return;var im=new Image();im.src=mv.getAttribute('data-fallback');im.alt=mv.getAttribute('alt')||'';im.className=mv.className;mv.replaceWith(im)};var gl2=!!document.createElement('canvas').getContext('webgl2');if(!gl2)return swap();mv.addEventListener('error',swap);setTimeout(swap,12000)});
startClock();
function startClock(){${deadlineMs ? `var end=${deadlineMs},start=Math.min(${Date.now()},end-864e5),p2=function(n){return String(n).padStart(2,'0')},bar=document.querySelector('[data-bar]');
(function tick(){var ms=end-Date.now();if(ms<=0){$$('[data-cd]').forEach(function(c){c.hidden=true});$$('[data-cta]').forEach(function(a){a.setAttribute('aria-disabled','true');a.removeAttribute('href')});$$('[data-ended]').forEach(function(e){e.hidden=false});return}
var v={d:Math.floor(ms/864e5),h:Math.floor(ms%864e5/36e5),m:Math.floor(ms%36e5/6e4),s:Math.floor(ms%6e4/1e3)};
['d','h','m','s'].forEach(function(k){$$('[data-u="'+k+'"]').forEach(function(b){var t=p2(v[k]);if(b.textContent!==t){b.textContent=t;if(!reduce){b.classList.remove('tick');void b.offsetWidth;b.classList.add('tick')}}})});
if(bar)bar.style.transform='scaleX('+clamp((end-Date.now())/(end-start))+')';setTimeout(tick,1000)})()` : ''}}
})();`;
}
