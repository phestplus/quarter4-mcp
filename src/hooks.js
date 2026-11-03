// Hook library: opening lines for posts, grouped by campaign phase. Each niche adds its own
// lines on top. A deck deals hooks without repeating inside one plan, and skips lines whose
// placeholders cannot be filled honestly (no discount, no event). Placeholders:
// {product} {discount} {event} {brand}. No invented scarcity: counts and stock claims are
// never written into a hook.

const BY_PHASE = {
  tease: [
    'Something is coming for {event}. Guess what it is.',
    'We cannot show you yet. Here is a clue.',
    'Save this post. You will want it on {event}.',
    'Turn on notifications. {event} starts here.',
    'The {product} drop we have been planning all year.',
    'If you have been waiting to buy {product}, wait a few more days.',
    'One question before {event}: which {product} do you want first?',
    'Zoom in. That is all we can show for now.',
    'Our biggest {event} yet. Details soon.',
    'Comment the {product} you want on sale and we will read every one.',
    'Do not buy {product} until you see what we have planned.',
    'A small preview for the people who always ask first.',
    'Mark the date. You will thank yourself later.',
    'We have been working on this for months.',
    'Hint: it is the one you keep asking about.',
    'Your {event} wishlist is about to get easier.',
    'Tell a friend who has been waiting for this.',
    'The countdown starts now.',
    'Guess the price. Wrong answers only.',
    'Not live yet. Here is how to be first.',
    'You are going to want to see this.',
    'Something special is coming to {brand}.',
  ],
  'warm-up': [
    'Ranking our best {product} before {event}.',
    '3 things to check before you buy {product} this {event}.',
    'Make your {event} list now. Here is where to start.',
    'Which one would you pick? Vote in the comments.',
    'What {discount} off actually looks like on our best sellers.',
    'The {product} our customers reorder most.',
    'Mistakes people make buying {product} on sale.',
    'How to choose {product} without regretting it.',
    'Everything you need to know before {event}.',
    'Real price now, sale price on {event}. Mark your calendar.',
    'Our honest guide to {product}: what is worth it and what is not.',
    'Save this before {event}: how to shop smart.',
    'The questions to ask before you pay for {product}.',
    'Here is what is included in our {event} offer.',
    'From our studio to your door: how an order works.',
    'Gift idea for someone who has everything: {product}.',
    'Budget, mid, treat yourself: {product} at every level.',
    'What we would buy if we were you.',
    'Three reasons people choose {brand}.',
    'Plan your {event} order in 60 seconds.',
    'Pick one: which would you take home?',
    'Week to go. Here is your shortlist.',
  ],
  'early-access': [
    'You are on the list, so you shop first.',
    'Early access is open. The public gets it tomorrow.',
    'First pick goes to the people who signed up.',
    'This link is only for our list. Please do not share it yet.',
    'You asked for first access. Here it is.',
  ],
  launch: [
    'It is live. {discount} off {product}.',
    '{event} is here. Everything you saved is on sale.',
    'The wait is over: {product} at {discount} off.',
    'Your {event} shopping starts and ends here.',
    'Stop scrolling. This is the deal you were waiting for.',
    'Prices dropped. Tap before you forget.',
    '{discount} off and free advice on what to pick.',
    'Same {product}, better price, while the sale runs.',
    'If it was in your cart, now is the time.',
    'Our {event} prices are live. Link in bio.',
    'Pay less for the {product} you already wanted.',
    'The {event} price on {product} is here.',
  ],
  'last-chance': [
    'Last call for {discount} off.',
    'Final hours of {event} prices.',
    'Soon this goes back to full price.',
    'Still thinking? Here is why people bought.',
    'The sale ends soon. Check the countdown.',
    'Last chance to get {product} at this price.',
    'Before it ends: our most picked {product}.',
    'If you missed it, this is your reminder.',
  ],
  'thank-you': [
    'Thank you for an incredible {event}.',
    'You made this our best {event} yet.',
    'Your orders are on the way. Here is what happens next.',
    'Show us how you are wearing it. We share our favourites.',
    'How to care for your new {product}.',
    'We read every message. Here is what you told us.',
  ],
  evergreen: [
    'Things nobody tells you about {product}.',
    'How we make our {product}, start to finish.',
    'Answering your most asked question about {product}.',
    'A day at {brand}.',
    'What our customers say after a month.',
    'Behind the scenes of one order.',
    'The small detail that makes a big difference.',
    'Myth or fact: the {product} edition.',
    'Before and after, no filters.',
    'Save this for the next time you shop for {product}.',
    'Three ways to use one {product}.',
    'Why we do it this way, even when it costs more.',
    'Our team picks their favourite {product}.',
    'You asked, we answered: sizes, prices, delivery.',
  ],
};

// Lines that only make sense when a physical product is bought (carts, orders, wearing, unboxing).
const PHYSICAL_ONLY = new Set([
  'If it was in your cart, now is the time.', '{discount} off and free advice on what to pick.', 'Which one would you pick? Vote in the comments.',
  'Budget, mid, treat yourself: {product} at every level.', 'Gift idea for someone who has everything: {product}.', 'From our studio to your door: how an order works.',
  'Ranking our best {product} before {event}.', 'Your orders are on the way. Here is what happens next.', 'Show us how you are wearing it. We share our favourites.',
  'How to care for your new {product}.', 'Behind the scenes of one order.', 'Three ways to use one {product}.', 'Before and after, no filters.',
  'Pick one: which would you take home?', 'Week to go. Here is your shortlist.', 'What we would buy if we were you.',
  '{event} is here. Everything you saved is on sale.', 'Your {event} shopping starts and ends here.', 'Prices dropped. Tap before you forget.',
  'What {discount} off actually looks like on our best sellers.', 'The {product} our customers reorder most.', 'Mistakes people make buying {product} on sale.',
  'You are on the list, so you shop first.', 'The {product} drop we have been planning all year.', 'If you have been waiting to buy {product}, wait a few more days.',
]);

// Lines written for apps, subscriptions, courses and services (no carts, no shipping).
const NON_PHYSICAL = {
  tease: ['Something new is coming to {brand} members.', 'Our best price on {product} is close. Turn on notifications.'],
  'warm-up': ['What you actually get with {product}, in one minute.', 'Free vs paid: the honest difference.', 'Who {product} is for, and who it is not for.', 'What changes in your first week.'],
  'early-access': ['You are on the list, so you get the offer first.'],
  launch: ['{discount} off {product}, from today.', 'The {event} offer on {product} is live.', 'Start today and pay less for the whole year.'],
  'last-chance': ['The {event} price on {product} ends soon.', 'Last days to start at this price.'],
  'thank-you': ['Welcome to everyone who joined this week.', 'Getting started: three things to try first.'],
  evergreen: ['What our members say after a month.', 'One feature people miss.', 'A question we hear every week, answered.'],
};

const NEAR = { tease: ['warm-up'], 'warm-up': ['tease'], 'early-access': ['launch'], 'last-chance': ['launch'], launch: ['last-chance'], 'thank-you': [] };
const phaseOf = (p) => (BY_PHASE[p] ? p : p === 'observance' ? null : 'evergreen');

/**
 * A deck of hooks for one plan. next(phase) returns a filled hook never used before in this deck
 * (falls back to other phases, then allows repeats only when everything is used).
 * @param {{ nicheHooks?: string[], product: string, discount?: string|null, event?: string|null, brand?: string, seed?: number }} o
 */
export function hookDeck({ nicheHooks = [], product, discount = null, brand = 'us', seed = 0, offerType = 'physical' }) {
  const used = new Set();
  let repeats = 0;
  const usable = (t, event) => (!t.includes('{discount}') || discount) && (!t.includes('{event}') || event);
  const fill = (t, event) => t.replaceAll('{product}', product).replaceAll('{discount}', discount ?? '').replaceAll('{event}', event ?? '').replaceAll('{brand}', brand).replaceAll('{date}', event ?? 'this week');
  // Niche lines are strongest, so they are mixed into every phase.
  const pool = (phase) => {
    // Niche lines can carry specific claims ("our 5 best pairs"), so they only open teaser, warm-up and
    // everyday posts; launch and last-call posts use the general lines, which make no claims.
    const own = ['tease', 'warm-up', 'evergreen'].includes(phase) ? nicheHooks.map((t, i) => ({ t, k: `n${i}` })) : [];
    const physical = offerType === 'physical';
    const base = (BY_PHASE[phase] ?? []).filter((t) => physical || !PHYSICAL_ONLY.has(t));
    const gen = [...(physical ? [] : NON_PHYSICAL[phase] ?? []), ...base].map((t, i) => ({ t, k: `${phase}${i}` }));
    const mixed = [];
    for (let i = 0; i < Math.max(own.length, gen.length); i++) { if (gen[i]) mixed.push(gen[i]); if (own[i] && i % 2 === 0) mixed.push(own[i]); }
    return mixed.concat(own.filter((_, i) => i % 2 === 1));
  };
  return {
    next(phase, event = null) {
      // Same phase first, then a phase with the same tone, then neutral evergreen lines.
      // Never a teaser on launch day.
      const ph0 = phaseOf(phase) ?? 'evergreen';
      const order = [...new Set([ph0, ...(NEAR[ph0] ?? []), 'evergreen'])];
      for (const ph of order) {
        const list = pool(ph);
        for (let i = 0; i < list.length; i++) {
          const h = list[(i + seed) % list.length];
          if (!used.has(h.k) && usable(h.t, event)) { used.add(h.k); return fill(h.t, event); }
        }
      }
      const any = pool(ph0).filter((h) => usable(h.t, event));
      return any.length ? fill(any[(repeats++ + seed) % any.length].t, event) : null;
    },
    size: () => used.size,
  };
}

/** All hooks that fit a phase, filled (for briefs). */
export function hooksFor({ nicheHooks = [], phase = 'evergreen', product, discount = null, event = null, brand = 'us', limit = 10, offerType = 'physical' }) {
  const deck = hookDeck({ nicheHooks, product, discount, brand, offerType });
  const out = [];
  for (let i = 0; i < limit; i++) { const h = deck.next(phase, event); if (!h || out.includes(h)) break; out.push(h); }
  return out;
}

export const HOOK_COUNT = Object.values(BY_PHASE).reduce((a, l) => a + l.length, 0);
