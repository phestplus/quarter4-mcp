// Signature scenes: one art-directed concept per holiday instead of a recoloured
// template. Each scene returns { fonts, particles, css, body, js } and reuses the
// shared countdown hooks: [data-u="d|h|m|s"], [data-cd-mini], [data-cta], [data-ended].

const p2 = (n) => String(n).padStart(2, '0');

function barcode(seed) {
  let x = seed || 1;
  let pos = 0;
  const bars = [];
  for (let i = 0; i < 46; i++) {
    x = (x * 1103515245 + 12345) & 0x7fffffff;
    const w = 1 + (x % 3);
    if (i % 2 === 0) bars.push(`<rect x="${pos}" y="0" width="${w}" height="40"/>`);
    pos += w + 1;
  }
  return `<svg class="barcode" viewBox="0 0 ${pos} 40" preserveAspectRatio="none" aria-hidden="true">${bars.join('')}</svg>`;
}

function money(price, original) {
  const num = (v) => Number(String(v ?? '').replace(/[^0-9.]/g, ''));
  const sym = (v) => (String(v ?? '').match(/^[^\d]*/) ?? [''])[0];
  const now = num(price), was = num(original);
  if (!now || !was || was <= now || sym(price) !== sym(original)) return null;
  const save = was - now;
  return `${sym(price)}${Number.isInteger(save) ? save : save.toFixed(2)}`;
}

// Pendulum physics shared by the price tag and ornaments.
const SWING_JS = `
function swing(el,o){o=o||{};var a=o.a0||0,v=0,last=performance.now(),k=o.k||.010,damp=o.damp||.03;
el.addEventListener('pointermove',function(e){v+=(e.movementX||0)*(o.push||.0007)});
addEventListener('scroll',function(){v+=(o.scroll||.0004)*(Math.random()-.5)*8},{passive:true});
(function f(now){var dt=Math.min(40,now-last)/16;last=now;v+=(-k*a-damp*v)*dt;a+=v*dt;el.style.transform='rotate('+a+'rad)';requestAnimationFrame(f)})(last);
setInterval(function(){v+=(Math.random()-.5)*(o.idle||.006)},2600)}`;

export const SCENES = {
  // ---------------------------------------------------------------- Black Friday
  'black-friday': ({ esc, c, o, t, discount, deadlineMs, deadlineLabel, btn, year, terms }) => {
    const save = money(o.price, o.originalPrice);
    const rows = c.features.slice(0, 4).map((f) => `<div class="r"><span>${esc(f.title)}</span><i></i><span>✓</span></div>`).join('');
    const priceRows = o.price
      ? `${o.originalPrice ? `<div class="r"><span>Regular price</span><i></i><span>${esc(o.originalPrice)}</span></div>` : ''}${save ? `<div class="r hi"><span>Black Friday</span><i></i><span>-${esc(save)}</span></div>` : ''}<div class="r total"><span>Total</span><i></i><span>${esc(o.price)}</span></div>`
      : `<div class="r total"><span>Discount</span><i></i><span>${discount ? `${discount}% off` : esc(c.offer ?? 'Applied')}</span></div>`;
    return {
      fonts: ['Anton', 'IBM Plex Mono', 'Inter'],
      particles: 'none',
      body: `
<header class="bf">
  <div class="wrap bf-grid">
    <h1 class="bf-type" aria-label="${esc(c.headline)}"><span class="l1">Black</span><span class="l2">Friday</span><span class="l3">${year}</span></h1>
    <div class="hang" aria-hidden="true"><svg class="string" viewBox="0 0 10 120"><path d="M5 0 V120"/></svg>
      <div class="tag" data-swing><span class="hole"></span><span class="t-brand">${esc(o.brand)}</span><span class="t-big">${discount ? `-${discount}<small>%</small>` : esc(c.offer ?? 'SALE')}</span><span class="t-sm">${deadlineLabel ? `Ends ${esc(deadlineLabel.split(',')[0])}` : 'Limited time'}</span></div>
    </div>
  </div>
  <div class="wrap bf-deal">
    <div>
      <p class="kick">${esc(c.headline)}</p>
      <p class="lede">${esc(c.subheadline)}</p>
    </div>
    <div class="deal">
      ${o.price ? `<div class="prices"><span class="now">${esc(o.price)}<svg class="circle" viewBox="0 0 200 90" preserveAspectRatio="none" aria-hidden="true"><path d="M20 50 C 15 15, 175 5, 185 40 S 60 95, 25 60"/></svg></span>${o.originalPrice ? `<span class="was"><span class="sr">Was </span>${esc(o.originalPrice)}<svg class="strike" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true"><path d="M2 14 C 30 6, 60 16, 98 4"/></svg></span>` : ''}</div>` : ''}
      ${deadlineMs ? `<p class="mono-cd" data-cd>Ends in <b data-u="d">00</b>d <b data-u="h">00</b>h <b data-u="m">00</b>m <b data-u="s">00</b>s</p>` : ''}
      ${btn(c.ctaText, 'bf-btn')}
    </div>
  </div>
  <div class="bf-tape" aria-hidden="true"><div class="track">${Array(8).fill(`<span>${esc((c.offer ?? 'Black Friday').toUpperCase())}</span><span>✕</span><span>BLACK FRIDAY ${year}</span><span>✕</span>`).join('')}</div></div>
</header>
<section class="bf-receipt wrap">
  <div class="rc-copy">
    <h2>Your receipt,<br>before you even check out.</h2>
    <p>${esc(save ? `That is ${save} back in your pocket.` : c.subheadline)}</p>
    ${c.faq.map((x) => `<details><summary>${esc(x.q)}</summary><p>${esc(x.a)}</p></details>`).join('')}
  </div>
  <div class="receipt" data-print>
    <div class="rc-head"><b>${esc(o.brand.toUpperCase())}</b><span>BLACK FRIDAY ${year}</span><span>${esc(c.product.toUpperCase())}</span></div>
    <div class="cut"></div>
    ${rows}
    <div class="cut"></div>
    ${priceRows}
    <div class="cut"></div>
    ${deadlineLabel ? `<div class="r"><span>Valid until</span><i></i><span>${esc(deadlineLabel)}</span></div>` : ''}
    ${barcode(o.brand.length * 7919 + year)}
    <p class="thanks">*** THANK YOU ***</p>
  </div>
</section>
<section class="bf-final wrap">
  <p class="huge" aria-hidden="true">${discount ? `${discount}% OFF` : 'SALE'}</p>
  ${btn(c.ctaText, 'bf-btn lg')}
  <p class="ended" data-ended hidden>This offer has ended. Thank you for the love.</p>
</section>`,
      css: `
body{background:#0a0a0a;color:#f5f3ee}
.bf{position:relative;overflow:hidden;padding-top:24px}
.bf-grid{position:relative;display:grid;min-height:min(78vh,760px);align-items:center}
.bf-type{margin:0;font:400 clamp(96px,22vw,330px)/.88 'Anton',Impact,sans-serif;text-transform:uppercase;letter-spacing:-.01em;display:flex;flex-direction:column}
.bf-type span{display:block;animation:slam .8s cubic-bezier(.2,.9,.2,1.1) both}
.bf-type .l1{animation-delay:.1s}.bf-type .l2{animation-delay:.25s;color:transparent;-webkit-text-stroke:2px #f5f3ee}.bf-type .l3{animation-delay:.4s;color:#facc15;font-size:.38em;line-height:1;margin-top:.15em}
@keyframes slam{0%{transform:scale(1.5) translateY(-10%);opacity:0;filter:blur(12px)}70%{transform:scale(.98);opacity:1;filter:none}100%{transform:none}}
.hang{position:absolute;right:4%;top:-24px;display:flex;flex-direction:column;align-items:center;transform-origin:top center}
.string{width:10px;height:clamp(80px,14vw,140px)}.string path{stroke:#d6d3d1;stroke-width:1.5;fill:none}
.tag{position:relative;margin-top:-6px;width:clamp(180px,24vw,280px);aspect-ratio:3/4.4;background:#facc15;color:#0a0a0a;border-radius:18px 18px 22px 22px;clip-path:polygon(50% 0,100% 16%,100% 100%,0 100%,0 16%);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:56px 18px 24px;transform-origin:50% -60px;box-shadow:0 30px 60px -20px rgba(250,204,21,.45);will-change:transform}
.tag .hole{position:absolute;top:22px;width:22px;height:22px;border-radius:50%;background:#0a0a0a;box-shadow:inset 0 2px 4px rgba(0,0,0,.6)}
.t-brand{font:600 13px 'IBM Plex Mono',monospace;letter-spacing:.14em;text-transform:uppercase}
.t-big{font:400 clamp(72px,10vw,120px)/.85 'Anton',sans-serif;letter-spacing:-.02em}.t-big small{font-size:.5em}
.t-sm{font:600 12px 'IBM Plex Mono',monospace;letter-spacing:.1em;text-transform:uppercase;border-top:2px dashed #0a0a0a;padding-top:10px}
.bf-deal{display:grid;gap:32px;padding:32px 0 56px;border-top:2px solid #f5f3ee}
@media(min-width:900px){.bf-deal{grid-template-columns:1.2fr 1fr;align-items:end}}
.kick{font:400 clamp(32px,4vw,52px)/1 'Anton',sans-serif;text-transform:uppercase;margin:0 0 14px}
.lede{color:#a8a29e;font-size:19px;margin:0;max-width:30em}
.deal{display:flex;flex-direction:column;gap:18px;align-items:flex-start}
.prices{display:flex;align-items:baseline;gap:22px}
.now{position:relative;font:400 clamp(56px,7vw,88px)/1 'Anton',sans-serif;color:#facc15}
.was{position:relative;font:500 28px 'IBM Plex Mono',monospace;color:#a8a29e}
.circle,.strike{position:absolute;pointer-events:none;overflow:visible}
.circle{inset:-18% -16%;width:132%;height:136%}.strike{left:-6%;top:30%;width:112%;height:50%}
.circle path,.strike path{fill:none;stroke:#ef4444;stroke-width:4;stroke-linecap:round;stroke-dasharray:600;stroke-dashoffset:600;animation:draw 1.1s cubic-bezier(.6,0,.2,1) forwards}
.strike path{stroke-width:5;stroke-dasharray:140;stroke-dashoffset:140;animation-delay:.9s}.circle path{animation-delay:1.4s}
@keyframes draw{to{stroke-dashoffset:0}}
.mono-cd{font:500 18px 'IBM Plex Mono',monospace;margin:0;letter-spacing:.04em}.mono-cd b{color:#facc15;font-weight:600}
.btn.bf-btn{border-radius:0;background:#facc15;color:#0a0a0a;font:400 22px/1 'Anton',sans-serif;letter-spacing:.06em;text-transform:uppercase;box-shadow:8px 8px 0 #f5f3ee;min-height:64px}
.btn.bf-btn:hover{transform:translate(-3px,-3px);box-shadow:11px 11px 0 #f5f3ee}
.btn.bf-btn::after{display:none}
.bf-tape{background:#facc15;color:#0a0a0a;transform:rotate(-2deg) scale(1.05);margin:24px 0 0;padding:14px 0;overflow:hidden;white-space:nowrap}
.bf-tape .track{display:inline-flex;gap:24px;font:400 26px/1 'Anton',sans-serif;letter-spacing:.06em;animation:mq 30s linear infinite}
.bf-receipt{display:grid;gap:56px;padding:120px 0 40px;align-items:start}
@media(min-width:900px){.bf-receipt{grid-template-columns:1fr 420px}}
.rc-copy h2{font:400 clamp(40px,5vw,72px)/.95 'Anton',sans-serif;text-transform:uppercase;margin:0 0 20px}
.rc-copy>p{color:#a8a29e;font-size:19px;margin:0 0 32px}
.rc-copy details{border-top:1px solid #292524;padding:18px 0}.rc-copy summary{cursor:pointer;font:600 17px 'IBM Plex Mono',monospace;list-style:none}.rc-copy summary::before{content:'+ ';color:#facc15}.rc-copy details[open] summary::before{content:'- '}.rc-copy details p{color:#a8a29e;margin:10px 0 0}
.receipt{background:#f4f1ea;color:#1c1917;font:500 14px/1.5 'IBM Plex Mono',monospace;padding:30px 28px 46px;box-shadow:0 40px 80px -30px rgba(0,0,0,.8);transform:rotate(1.5deg);-webkit-mask:linear-gradient(#000 0 0) top/100% calc(100% - 14px) no-repeat,conic-gradient(from -45deg at bottom,#0000,#000 1deg 89deg,#0000 90deg) bottom/20px 14px repeat-x;mask:linear-gradient(#000 0 0) top/100% calc(100% - 14px) no-repeat,conic-gradient(from -45deg at bottom,#0000,#000 1deg 89deg,#0000 90deg) bottom/20px 14px repeat-x}
.receipt[data-print]{clip-path:inset(0 0 100% 0)}.receipt.in{animation:print 2.6s steps(26) forwards}
@keyframes print{to{clip-path:inset(0 0 0 0)}}
.rc-head{display:flex;flex-direction:column;align-items:center;gap:2px;text-align:center}.rc-head b{font-size:20px;letter-spacing:.12em}
.cut{border-top:2px dashed #1c1917;margin:16px 0;opacity:.6}
.r{display:flex;gap:8px;align-items:baseline;margin:6px 0}.r i{flex:1;border-bottom:2px dotted #a8a29e;transform:translateY(-4px)}
.r.hi{color:#b91c1c;font-weight:700}.r.total{font-size:20px;font-weight:700}
.barcode{display:block;width:100%;height:56px;margin:22px 0 8px;fill:#1c1917}
.thanks{text-align:center;margin:0;letter-spacing:.2em}
.bf-final{text-align:center;padding:120px 0 40px;display:flex;flex-direction:column;align-items:center;gap:30px}
.huge{margin:0;font:400 clamp(90px,20vw,280px)/.8 'Anton',sans-serif;color:transparent;-webkit-text-stroke:2px #facc15}
summary{display:block}
@media(max-width:700px){.hang{position:relative;right:auto;top:auto;margin:10px auto 0}.bf-grid{min-height:auto}}`,
      js: SWING_JS + `
var tag=document.querySelector('[data-swing]');if(tag&&fx)swing(tag.parentNode,{a0:.5,k:.012,damp:.022,push:.0012});
var rc=document.querySelector('[data-print]');if(rc){if(reduce||!('IntersectionObserver' in window))rc.style.clipPath='none';else new IntersectionObserver(function(es,ob){es.forEach(function(e){if(e.isIntersecting){rc.classList.add('in');ob.disconnect()}})},{threshold:.15}).observe(rc.parentNode)}`,
    };
  },

  // ---------------------------------------------------------------- Christmas
  christmas: ({ esc, c, o, discount, deadlineMs, deadlineLabel, btn }) => {
    const palette = [['#b91c1c', '#7f1d1d'], ['#e8b04b', '#a16207'], ['#f5f5f4', '#a8a29e'], ['#166534', '#052e16'], ['#be123c', '#4c0519']];
    const orn = [
      { x: 6, len: 120, r: 46, p: 0 }, { x: 18, len: 220, r: 34, p: 1 }, { x: 31, len: 80, r: 40, p: 3 },
      { x: 69, len: 90, r: 38, p: 4 }, { x: 82, len: 200, r: 48, p: 2 }, { x: 94, len: 110, r: 32, p: 0 },
    ];
    const bauble = (id, r, [c1, c2], inner = '') => `<svg viewBox="-60 -70 120 130" width="${r * 2.4}" aria-hidden="true">
<defs><radialGradient id="g${id}" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".18" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient></defs>
<rect x="-10" y="-62" width="20" height="14" rx="3" fill="#d4a94a"/><circle cx="0" cy="-66" r="6" fill="none" stroke="#d4a94a" stroke-width="2"/>
<circle r="50" fill="url(#g${id})"/><ellipse cx="-18" cy="-22" rx="12" ry="7" fill="#fff" opacity=".45" transform="rotate(-35 -18 -22)"/>${inner}</svg>`;
    const hanging = orn.map((b, i) => `<div class="orn" style="left:${b.x}%;--len:${b.len}px" data-orn><span class="str"></span>${bauble(i, b.r, palette[b.p])}</div>`).join('');
    const hero = `<div class="orn hero-orn" data-orn><span class="str"></span>${bauble('h', 120, ['#c81e1e', '#5c0a0a'], `<text y="6" text-anchor="middle" font-family="Fraunces,serif" font-size="${discount ? 34 : 18}" font-style="italic" fill="#f8e7c0">${discount ? `${discount}%` : esc((c.offer ?? 'Gift').slice(0, 10))}</text><text y="28" text-anchor="middle" font-family="Inter,sans-serif" font-size="8" letter-spacing="3" fill="#f8e7c0">${discount ? 'OFF' : ''}</text>`)}</div>`;
    return {
      fonts: ['Fraunces', 'Inter', 'Caveat'],
      particles: 'snow',
      body: `
<header class="xm">
  <div class="ceiling" aria-hidden="true">${hanging}</div>
  <div class="wrap xm-in">
    ${hero}
    <p class="xm-eyebrow" data-reveal>${esc(o.brand)} · Holiday ${new Date().getFullYear()}</p>
    <h1 class="kin">${c.headline.split(/\s+/).map((w, i) => `<span class="w" style="--i:${i}"><span>${esc(w)}</span></span>`).join(' ')}</h1>
    <p class="sub" data-reveal>${esc(c.subheadline)}</p>
    ${o.price ? `<p class="xm-price" data-reveal><span>${esc(o.price)}</span>${o.originalPrice ? `<s><span class="sr">Was </span>${esc(o.originalPrice)}</s>` : ''}</p>` : ''}
    ${deadlineMs ? `<div class="xm-cd" data-cd data-reveal>${['Days', 'Hours', 'Minutes', 'Seconds'].map((u) => `<div><b data-u="${u[0].toLowerCase()}">00</b><span>${u}</span></div>`).join('<i></i>')}</div>` : ''}
    <div data-reveal>${btn(c.ctaText, 'foil')}</div>
    ${deadlineLabel ? `<p class="fine" data-reveal>Order before <time data-deadline-label>${esc(deadlineLabel)}</time>.</p>` : ''}
  </div>
</header>
<section class="xm-gift wrap">
  <div class="gtag" data-reveal>
    <span class="ghole" aria-hidden="true"></span>
    <p class="hand">To: someone special<br>From: ${esc(o.brand)}</p>
    <ul>${c.features.map((f) => `<li><b>${esc(f.title)}</b><span>${esc(f.text)}</span></li>`).join('')}</ul>
  </div>
  <div class="xm-faq">
    <h2 data-reveal>Good to know</h2>
    ${c.faq.map((x) => `<details data-reveal><summary>${esc(x.q)}</summary><p>${esc(x.a)}</p></details>`).join('')}
    <div data-reveal style="margin-top:36px">${btn(c.ctaText, 'foil')}</div>
    <p class="ended" data-ended hidden>This offer has ended. Merry Christmas from all of us.</p>
  </div>
</section>`,
      css: `
body{background:radial-gradient(120% 80% at 50% 0%,#1d3a2a 0%,#0c1a13 55%,#07110c 100%) fixed;color:#fbf6ee}
.xm{position:relative;min-height:100vh;overflow:hidden;padding-bottom:80px}
.ceiling{position:absolute;inset:0 0 auto 0;height:420px;pointer-events:none}
.orn{position:absolute;top:0;display:flex;flex-direction:column;align-items:center;transform-origin:top center;pointer-events:auto;will-change:transform}
.orn .str{display:block;width:1.5px;height:var(--len);background:linear-gradient(#d4a94a,#8a6a28)}
.orn svg{margin-top:-4px;filter:drop-shadow(0 18px 24px rgba(0,0,0,.45))}
.xm-in{position:relative;display:flex;flex-direction:column;align-items:center;text-align:center;padding-top:20px}
.hero-orn{position:relative;--len:110px;margin-bottom:10px}
.hero-orn svg{width:min(300px,62vw);height:auto}
.xm-eyebrow{font:500 13px Inter,sans-serif;letter-spacing:.28em;text-transform:uppercase;color:#e8b04b;margin:8px 0 18px}
.xm h1{font:400 clamp(48px,8vw,112px)/.95 'Fraunces',serif;font-style:italic;letter-spacing:-.02em;margin:0 0 22px;max-width:12em}
.xm .sub{color:#d6cdbd;max-width:32em;margin-inline:auto}
.xm-price{font:400 48px/1 'Fraunces',serif;margin:0 0 26px;display:flex;gap:16px;align-items:baseline;justify-content:center}.xm-price s{font-size:24px;color:#a8a29e}
.xm-cd{display:flex;align-items:center;gap:clamp(10px,3vw,28px);margin:0 0 34px}
.xm-cd i{width:1px;height:46px;background:rgba(232,176,75,.35)}
.xm-cd b{display:block;font:400 clamp(40px,6vw,64px)/1 'Fraunces',serif;font-variant-numeric:tabular-nums;color:#f8e7c0}
.xm-cd span{font:500 11px Inter,sans-serif;letter-spacing:.22em;text-transform:uppercase;color:#a8a29e}
.btn.foil{background:linear-gradient(110deg,#a16207,#e8b04b 30%,#fff1c1 45%,#e8b04b 60%,#a16207);background-size:250% 100%;color:#2a1a04;border-radius:999px;animation:foil 4s linear infinite;box-shadow:0 14px 40px -12px rgba(232,176,75,.6)}
.btn.foil::after{display:none}@keyframes foil{to{background-position:-250% 0}}
.xm-gift{display:grid;gap:64px;padding:100px 0 60px;align-items:start;position:relative}
@media(min-width:960px){.xm-gift{grid-template-columns:460px 1fr}}
.gtag{position:relative;background:#f6ecd8;color:#2a1f14;padding:64px 40px 40px;clip-path:polygon(0 18%,22% 0,78% 0,100% 18%,100% 100%,0 100%);border-radius:0 0 18px 18px;transform:rotate(-3deg);box-shadow:0 40px 70px -30px rgba(0,0,0,.7);background-image:repeating-linear-gradient(0deg,transparent 0 31px,rgba(42,31,20,.08) 31px 32px)}
.ghole{position:absolute;top:28px;left:50%;width:22px;height:22px;margin-left:-11px;border-radius:50%;background:#0c1a13;box-shadow:0 0 0 5px #d4a94a}
.hand{font:600 30px/1.2 'Caveat',cursive;margin:12px 0 24px;color:#7f1d1d}
.gtag ul{list-style:none;margin:0;padding:0;display:grid;gap:16px}
.gtag li{display:flex;flex-direction:column;padding-left:30px;position:relative}.gtag li::before{content:'✓';position:absolute;left:0;top:0;color:#166534;font-weight:800}
.gtag li b{font:600 20px/1.3 'Fraunces',serif}.gtag li span{color:#57534e;font-size:16px}
.xm-faq h2{font:400 clamp(36px,4.6vw,60px)/1 'Fraunces',serif;font-style:italic;margin:0 0 24px}
.xm-faq details{border-top:1px solid rgba(232,176,75,.25);padding:20px 0}.xm-faq summary{display:block;cursor:pointer;list-style:none;font:500 19px Inter,sans-serif}.xm-faq summary::after{content:'+';float:right;color:#e8b04b}.xm-faq details[open] summary::after{content:'×'}.xm-faq details p{color:#d6cdbd;margin:10px 0 0}
@media(max-width:700px){.orn:nth-child(2),.orn:nth-child(5){display:none}}`,
      js: SWING_JS + `
if(fx)Array.prototype.forEach.call(document.querySelectorAll('[data-orn]'),function(el,i){swing(el,{a0:(i%2?.12:-.12),k:.006+i*.0012,damp:.012,push:.0016,idle:.01})});`,
    };
  },

  // ---------------------------------------------------------------- Cyber Monday
  'cyber-monday': ({ esc, c, o, discount, deadlineMs, deadlineLabel, btn }) => {
    const big = discount ? `${discount}% OFF` : (c.offer ?? 'CYBER DEAL').toUpperCase();
    const lines = [
      `<span class="pr">$</span> ./cyber-monday --brand "${esc(o.brand)}"`,
      `<span class="ok">&gt;</span> loading deals.......... <span class="ok">done</span>`,
      `<span class="ok">&gt;</span> product: <span class="hl">${esc(c.product)}</span>`,
      discount ? `<span class="ok">&gt;</span> discount: <span class="hl">${discount}%</span>` : `<span class="ok">&gt;</span> offer: <span class="hl">${esc(c.offer ?? 'online only')}</span>`,
      o.price ? `<span class="ok">&gt;</span> price: <span class="hl">${esc(o.price)}</span>${o.originalPrice ? ` <span class="dim">(was ${esc(o.originalPrice)})</span>` : ''}` : null,
      deadlineLabel ? `<span class="ok">&gt;</span> valid_until: <span class="hl">${esc(deadlineLabel)}</span>` : null,
      `<span class="pr">$</span> <span class="cursor"></span>`,
    ].filter(Boolean);
    return {
      fonts: ['Space Grotesk', 'JetBrains Mono'],
      particles: 'none',
      body: `
<header class="cy">
  <div class="wrap cy-in">
    <div class="term" data-reveal>
      <div class="bar3"><i></i><i></i><i></i><span>cyber_monday.sh</span></div>
      <pre class="screen">${lines.map((l, i) => `<span class="ln" style="--n:${i}">${l}</span>`).join('')}</pre>
    </div>
    <h1 class="glitch" data-text="${esc(big)}">${esc(big)}</h1>
    <p class="cy-sub" data-reveal>${esc(c.headline)} ${esc(c.subheadline)}</p>
    ${deadlineMs ? `<div class="flaps" data-cd data-reveal>${['d', 'h', 'm', 's'].map((u) => `<div><b data-u="${u}">00</b><span>${u}</span></div>`).join('<em>:</em>')}</div>` : ''}
    <div data-reveal>${btn(`${c.ctaText}`, 'cy-btn')}</div>
  </div>
</header>
<section class="wrap cy-log">
  <h2 data-reveal>&gt; why_${esc(o.brand.toLowerCase().replace(/[^a-z0-9]+/g, '_'))}</h2>
  <ul>${c.features.map((f, i) => `<li data-reveal style="--d:${i}"><span class="okb">[ OK ]</span><b>${esc(f.title)}</b><span class="dim">${esc(f.text)}</span></li>`).join('')}</ul>
  ${c.faq.length ? `<h2 data-reveal style="margin-top:72px">&gt; faq</h2>${c.faq.map((x) => `<details data-reveal><summary>? ${esc(x.q)}</summary><p>&gt; ${esc(x.a)}</p></details>`).join('')}` : ''}
  <div class="cy-final" data-reveal>${btn(c.ctaText, 'cy-btn lg')}<p class="ended" data-ended hidden>&gt; offer expired. thanks for shopping.</p></div>
</section>`,
      css: `
body{background:#03040b;color:#d7e3ff;font-family:'Space Grotesk',sans-serif}
body::after{content:'';position:fixed;inset:0;pointer-events:none;z-index:50;background:repeating-linear-gradient(0deg,rgba(0,0,0,.22) 0 1px,transparent 1px 3px);mix-blend-mode:multiply}
.cy{position:relative;min-height:100vh;display:flex;align-items:center;padding:60px 0 80px}
.cy::before{content:'';position:absolute;left:-50%;right:-50%;bottom:-6vh;height:60vh;background-image:linear-gradient(#22d3ee 1px,transparent 1px),linear-gradient(90deg,#22d3ee 1px,transparent 1px);background-size:56px 56px;transform:perspective(420px) rotateX(72deg);transform-origin:bottom;opacity:.28;-webkit-mask-image:linear-gradient(to top,#000,transparent 80%);mask-image:linear-gradient(to top,#000,transparent 80%);animation:floor 2.4s linear infinite;z-index:-1}
.cy::after{content:'';position:absolute;left:50%;top:58%;width:70vmin;height:70vmin;translate:-50% -50%;border-radius:50%;background:radial-gradient(circle,#8b5cf6 0%,transparent 65%);opacity:.35;filter:blur(30px);z-index:-1}
.cy-in{display:flex;flex-direction:column;align-items:center;text-align:center;gap:28px}
.term{width:min(680px,100%);text-align:left;background:rgba(6,10,24,.85);border:1px solid rgba(34,211,238,.35);border-radius:14px;box-shadow:0 0 0 1px rgba(139,92,246,.2),0 30px 80px -20px rgba(34,211,238,.35);overflow:hidden}
.bar3{display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid rgba(34,211,238,.2);font:500 12px 'JetBrains Mono',monospace;color:#64748b}
.bar3 i{width:11px;height:11px;border-radius:50%;background:#ef4444}.bar3 i:nth-child(2){background:#eab308}.bar3 i:nth-child(3){background:#22c55e}.bar3 span{margin-left:8px}
.screen{margin:0;padding:18px 20px 22px;font:500 clamp(13px,1.6vw,15px)/1.75 'JetBrains Mono',monospace;white-space:pre-wrap;color:#cbd5e1}
.ln{display:block;opacity:0;animation:lnin .01s forwards;animation-delay:calc(var(--n) * .42s + .2s);clip-path:inset(0 100% 0 0)}
.ln{animation:lnin .38s steps(28) forwards;animation-delay:calc(var(--n) * .42s + .2s)}
@keyframes lnin{0%{opacity:1;clip-path:inset(0 100% 0 0)}100%{opacity:1;clip-path:inset(0 0 0 0)}}
.pr{color:#a78bfa}.ok{color:#22d3ee}.hl{color:#f0abfc}.dim{color:#64748b}
.cursor{display:inline-block;width:9px;height:1.1em;background:#22d3ee;vertical-align:-3px;animation:blink 1s steps(1) infinite}@keyframes blink{50%{opacity:0}}
.glitch{position:relative;margin:0;font:700 clamp(64px,13vw,190px)/.9 'Space Grotesk',sans-serif;letter-spacing:-.04em;color:#f8fafc;text-shadow:0 0 30px rgba(34,211,238,.45)}
.glitch::before,.glitch::after{content:attr(data-text);position:absolute;inset:0;pointer-events:none}
.glitch::before{color:#22d3ee;transform:translate(-4px,0);clip-path:inset(10% 0 55% 0);animation:gl1 2.8s infinite steps(1);mix-blend-mode:screen}
.glitch::after{color:#f0abfc;transform:translate(4px,0);clip-path:inset(60% 0 8% 0);animation:gl2 2.3s infinite steps(1);mix-blend-mode:screen}
@keyframes gl1{0%,82%{clip-path:inset(10% 0 55% 0);transform:translate(-4px,0)}84%{clip-path:inset(40% 0 30% 0);transform:translate(-10px,2px)}88%{clip-path:inset(70% 0 5% 0);transform:translate(6px,-2px)}92%,100%{clip-path:inset(10% 0 55% 0);transform:translate(-4px,0)}}
@keyframes gl2{0%,76%{clip-path:inset(60% 0 8% 0);transform:translate(4px,0)}79%{clip-path:inset(20% 0 60% 0);transform:translate(10px,-1px)}83%{clip-path:inset(5% 0 80% 0);transform:translate(-6px,1px)}88%,100%{clip-path:inset(60% 0 8% 0);transform:translate(4px,0)}}
.cy-sub{max-width:34em;margin:0;color:#94a3b8;font-size:19px}
.flaps{display:flex;align-items:center;gap:10px;perspective:600px}
.flaps em{font:700 32px 'JetBrains Mono',monospace;color:#22d3ee;font-style:normal}
.flaps div{position:relative;background:linear-gradient(#0f172a 50%,#0b1222 50%);border:1px solid rgba(34,211,238,.3);border-radius:10px;padding:12px 14px 8px;min-width:84px}
.flaps div::after{content:'';position:absolute;left:0;right:0;top:50%;height:1px;background:#03040b}
.flaps b{display:block;font:700 44px/1 'JetBrains Mono',monospace;color:#e0f2fe;font-variant-numeric:tabular-nums;transform-origin:50% 100%}
.flaps b.tick{animation:flipdown .5s cubic-bezier(.3,.7,.3,1)}@keyframes flipdown{0%{transform:rotateX(-90deg);opacity:.4}100%{transform:none;opacity:1}}
.flaps span{display:block;font:500 11px 'JetBrains Mono',monospace;color:#64748b;text-transform:uppercase;margin-top:6px}
.btn.cy-btn{border-radius:10px;background:#22d3ee;color:#03121a;font:700 18px 'JetBrains Mono',monospace;box-shadow:0 0 0 1px #22d3ee,0 0 40px -6px #22d3ee}
.btn.cy-btn span::before{content:'$ ';opacity:.6}
.cy-log{padding:100px 0 40px;max-width:900px}
.cy-log h2{font:600 clamp(26px,3vw,36px) 'JetBrains Mono',monospace;color:#22d3ee;margin:0 0 24px}
.cy-log ul{list-style:none;margin:0;padding:0;font-family:'JetBrains Mono',monospace}
.cy-log li{display:grid;grid-template-columns:auto 1fr;column-gap:16px;padding:18px 0;border-bottom:1px dashed rgba(148,163,184,.25)}
.cy-log li .dim{grid-column:2;font-size:15px}
.okb{color:#22c55e;font-weight:700}.cy-log li b{font-size:18px;color:#f1f5f9}
.cy-log details{border-bottom:1px dashed rgba(148,163,184,.25);padding:16px 0;font-family:'JetBrains Mono',monospace}.cy-log summary{display:block;cursor:pointer;list-style:none;color:#f1f5f9}.cy-log details p{color:#94a3b8;margin:10px 0 0}
.cy-final{text-align:center;padding:90px 0 20px}`,
      js: '',
    };
  },

  // ---------------------------------------------------------------- New Year
  'new-year': ({ esc, c, o, discount, deadlineMs, deadlineLabel, btn, year }) => ({
    fonts: ['Playfair Display', 'Inter'],
    particles: 'fireworks',
    body: `
<header class="ny">
  <div class="yr" aria-hidden="true">${year + 1}</div>
  <div class="wrap ny-in">
    <p class="ny-eyebrow" data-reveal>${esc(o.brand)} presents</p>
    <h1 class="kin">${c.headline.split(/\s+/).map((w, i) => `<span class="w" style="--i:${i}"><span>${esc(w)}</span></span>`).join(' ')}</h1>
    ${deadlineMs ? `<div class="clock" data-cd data-reveal aria-label="Time left">${['d', 'h', 'm', 's'].map((u, i) => `<div class="fl"><b data-u="${u}">00</b><span>${['Days', 'Hours', 'Min', 'Sec'][i]}</span></div>`).join('')}</div>` : ''}
    <p class="sub" data-reveal>${esc(c.subheadline)}</p>
    <div data-reveal>${btn(c.ctaText, 'gold')}</div>
    ${deadlineLabel ? `<p class="fine" data-reveal>Ends <time data-deadline-label>${esc(deadlineLabel)}</time></p>` : ''}
  </div>
</header>
<section class="wrap ny-res">
  <h2 data-reveal>Your ${year + 1} resolutions,<br><em>sorted.</em></h2>
  <ol>${c.features.map((f, i) => `<li data-reveal style="--d:${i}"><span class="no">No. ${i + 1}</span><div><b>${esc(f.title)}</b><p>${esc(f.text)}</p></div></li>`).join('')}</ol>
  ${c.faq.map((x) => `<details data-reveal><summary>${esc(x.q)}</summary><p>${esc(x.a)}</p></details>`).join('')}
  <div class="ny-final" data-reveal>${btn(c.ctaText, 'gold lg')}<p class="ended" data-ended hidden>This offer has ended. Happy New Year!</p></div>
</section>`,
    css: `
body{background:radial-gradient(100% 70% at 50% 0%,#1a1530 0%,#07070d 60%) fixed;color:#f5f1e6}
.ny{position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden;padding:60px 0}
.yr{position:absolute;left:50%;top:50%;translate:-50% -50%;font:900 clamp(200px,42vw,640px)/1 'Playfair Display',serif;color:transparent;-webkit-text-stroke:1px rgba(230,195,106,.22);letter-spacing:-.04em;white-space:nowrap;pointer-events:none;background:linear-gradient(110deg,transparent 40%,rgba(230,195,106,.18) 50%,transparent 60%);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;animation:foil 7s linear infinite}
@keyframes foil{to{background-position:-300% 0}}
.ny-in{position:relative;display:flex;flex-direction:column;align-items:center;text-align:center}
.ny-eyebrow{font:500 13px Inter,sans-serif;letter-spacing:.32em;text-transform:uppercase;color:#e6c36a;margin:0 0 18px}
.ny h1{font:400 clamp(48px,8vw,116px)/.95 'Playfair Display',serif;font-style:italic;margin:0 0 40px;max-width:11em}
.ny h1 .w>span{background:linear-gradient(180deg,#fff7dc,#e6c36a 70%,#a07c2c);-webkit-background-clip:text;background-clip:text;color:transparent;padding-right:.08em}
.clock{display:flex;gap:clamp(8px,2vw,18px);margin:0 0 34px;perspective:800px}
.fl{position:relative;width:clamp(70px,13vw,128px);padding:clamp(14px,2vw,22px) 0 12px;border-radius:14px;background:linear-gradient(#1b1a26 50%,#14131d 50%);box-shadow:0 20px 40px -12px rgba(0,0,0,.8),inset 0 1px 0 rgba(255,255,255,.06)}
.fl::after{content:'';position:absolute;left:0;right:0;top:calc(50% - 8px);height:2px;background:#07070d}
.fl b{display:block;font:700 clamp(40px,7vw,80px)/1 'Playfair Display',serif;color:#f5e3ad;font-variant-numeric:tabular-nums;transform-origin:50% 60%}
.fl b.tick{animation:flip .6s cubic-bezier(.3,.7,.3,1)}@keyframes flip{0%{transform:rotateX(90deg);opacity:.3}100%{transform:none;opacity:1}}
.fl span{display:block;margin-top:8px;font:500 11px Inter,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#8d8aa0}
.ny .sub{color:#c9c4d6;max-width:32em;margin:0 auto 18px}
.ny-off{font:400 22px Inter,sans-serif;margin:0 0 28px;color:#c9c4d6}.ny-off span{font:700 40px 'Playfair Display',serif;color:#e6c36a;margin-right:6px}
.btn.gold{background:linear-gradient(110deg,#8a6a1f,#e6c36a 30%,#fff3c4 45%,#e6c36a 60%,#8a6a1f);background-size:250% 100%;color:#1a1204;animation:foil 4s linear infinite;box-shadow:0 16px 50px -14px rgba(230,195,106,.7)}
.btn.gold::after{display:none}
.ny-res{padding:110px 0 40px;max-width:900px}
.ny-res h2{font:400 clamp(40px,5vw,72px)/1 'Playfair Display',serif;margin:0 0 40px}.ny-res h2 em{color:#e6c36a}
.ny-res ol{list-style:none;margin:0 0 40px;padding:0}
.ny-res li{display:grid;grid-template-columns:120px 1fr;gap:24px;padding:30px 0;border-top:1px solid rgba(230,195,106,.2)}
.no{font:italic 400 28px 'Playfair Display',serif;color:#e6c36a}
.ny-res li b{font:600 22px Inter,sans-serif}.ny-res li p{margin:6px 0 0;color:#aaa6b8}
.ny-res details{border-top:1px solid rgba(230,195,106,.2);padding:20px 0}.ny-res summary{display:block;cursor:pointer;list-style:none;font-weight:600;font-size:18px}.ny-res details p{color:#aaa6b8;margin:10px 0 0}
.ny-final{text-align:center;padding:80px 0 20px}
@media(max-width:600px){.ny-res li{grid-template-columns:1fr;gap:6px}}`,
    js: `
var cta=document.querySelectorAll('[data-cta]');Array.prototype.forEach.call(cta,function(b){b.addEventListener('pointerenter',function(){if(window.__burst){var r=b.getBoundingClientRect();window.__burst(r.left+r.width/2,r.top)}})});`,
  }),
};

export const SCENE_THEMES = Object.keys(SCENES);
