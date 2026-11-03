// Niche profiles: what to say, show and avoid for each kind of business.
// kind: physical (ships a product) | digital (downloads, software, courses) | service (booked, local or remote)
// phases: angle ideas per campaign phase. {product} is filled with the user's product.
// eventFit: multiplier on event relevance for this niche (default 1).
// archetype: landing page direction for the art director.
// No em or en dashes in any copy here.

const PHASE_KEYS = ['tease', 'warm-up', 'early-access', 'launch', 'last-chance', 'thank-you'];

export const NICHES = {
  footwear: {
    label: 'Footwear and sneakers', kind: 'physical', archetype: 'stage',
    keywords: ['sneaker', 'sneakers', 'shoe', 'shoes', 'kicks', 'trainers', 'boots', 'heels', 'sandals', 'slides', 'footwear', 'loafers'],
    phases: {
      tease: ['Mystery box: show the box, hide the pair', 'Close-up of the sole and stitching, no name yet', 'Countdown with a silhouette of the shoe'],
      'warm-up': ['Rank your best-sellers before the price drops', 'Fit check: same pair styled 3 ways', 'Size guide: how {product} fit compared to other brands'],
      'early-access': ['Subscribers pick first: show sizes still in stock', 'Unboxing for the early list'],
      launch: ['Pair on foot, walking out the door, price on screen', 'Real price vs sale price for 5 pairs', 'Restock or sold-out updates (only real numbers)'],
      'last-chance': ['Final hours: sizes left per pair (real counts)', 'One-shot reel: lace up, step out, timer'],
      'thank-you': ['Customer fit pics (with permission)', 'Care guide: keep {product} clean'],
    },
    hooks: ['Do not buy sneakers this week.', 'Ranking our 5 best pairs before they drop in price.', 'POV: you waited and got the pair at {discount} off.', 'The pair everyone asks about in the comments.', 'Same shoe, 3 fits, one price this week.'],
    shots: ['Box slam and lid pop', 'Outsole and stitching macro', 'Lace-up in one take', 'On-foot walk, low angle', 'Three outfits with the same pair', 'Size and fit comparison on foot'],
    proof: ['fit pics from customers', 'size feedback', 'restock speed'],
    compliance: ['State the sizes and colours included in the sale.'],
    eventFit: { halloween: 0.6, 'singles-day': 1.2, 'black-friday': 1.2, 'cyber-monday': 1.1, christmas: 1.1, 'boxing-day': 1.2, dhanteras: 0.3 },
  },
  fashion: {
    label: 'Fashion and apparel', kind: 'physical', archetype: 'split',
    keywords: ['dress', 'dresses', 'fashion', 'clothing', 'clothes', 'apparel', 'outfit', 'outfits', 'streetwear', 'hoodie', 'hoodies', 'jeans', 'tops', 'shirts', 'ankara', 'abaya', 'kaftan', 'agbada', 'lingerie', 'swimwear', 'boutique', 'thrift', 'wear'],
    phases: {
      tease: ['Fabric close-up and colour swatch of the new drop', 'Silhouette shot with the date', 'Behind the scenes at the fitting'],
      'warm-up': ['Lookbook: 5 outfits for the season\'s events', 'How to style {product} for work, dinner and a party', 'Size inclusive try-on across body types'],
      'early-access': ['VIP list sees the full collection first', 'Pre-order with delivery date'],
      launch: ['Runway walk reel with the price on screen', 'Outfit under a set budget', 'Bundle: top + bottom at one price'],
      'last-chance': ['Last sizes in the best-seller (real counts)', 'Party season outfit, last day to order for delivery'],
      'thank-you': ['Customer outfit repost (with permission)', 'Care and styling tips'],
    },
    hooks: ['The dress that sold out last season is back.', 'One outfit, three events.', 'Stop scrolling if you still have nothing to wear for December.', 'Styling {product} for every body.', 'Wedding guest outfit under budget.'],
    shots: ['Fabric movement in slow motion', 'Walk toward camera, full length', 'Mirror try-on, 3 sizes', 'Flat lay of the full outfit', 'Detail: buttons, seams, print'],
    proof: ['try-on photos from customers', 'size feedback', 'repeat buyers'],
    compliance: ['Show real colours; note if colours vary by screen.', 'State the return or exchange policy you actually offer.'],
    eventFit: { halloween: 0.8, 'new-years-eve': 1.4, christmas: 1.2, diwali: 1.1, 'singles-day': 1.1 },
  },
  beauty: {
    label: 'Beauty and skincare', kind: 'physical', archetype: 'stage',
    keywords: ['skincare', 'skin care', 'beauty', 'makeup', 'make-up', 'cosmetics', 'serum', 'lipstick', 'lip gloss', 'perfume', 'fragrance', 'haircare', 'hair care', 'wigs', 'wig', 'nails', 'lashes', 'shea', 'body butter', 'soap'],
    phases: {
      tease: ['Texture shot, no label', 'Ingredient reveal one per day', 'Gift set being packed'],
      'warm-up': ['Routine: morning and night with {product}', 'Which set for which skin type', 'Gift guide by budget'],
      'early-access': ['List members get the gift sets first', 'Sample with every early order (if true)'],
      launch: ['Set contents and price side by side', 'Unboxing the gift set', 'Bundle saving shown in real numbers'],
      'last-chance': ['Last day to order for delivery before the holiday', 'Final sets left (real counts)'],
      'thank-you': ['Customer routines (with permission)', 'How to store and use the set'],
    },
    hooks: ['What is actually inside our best-selling gift set.', 'The 3-step routine people keep reordering.', 'Gift ideas for someone whose skin type you do not know.', 'Texture check.', 'Packing 100 gift sets, here is how.'],
    shots: ['Texture swatch on skin', 'Pump and pour macro', 'Gift box packing', 'Before and after lighting test (no edited results)', 'Shelf flat lay'],
    proof: ['reviews with permission', 'ingredient list', 'repeat orders'],
    compliance: ['No medical or cure claims; cosmetic claims only.', 'Before and after content must be unedited and typical; disclose filters.'],
    eventFit: { christmas: 1.3, 'black-friday': 1.2, diwali: 1.2, 'singles-day': 1.1 },
  },
  jewelry: {
    label: 'Jewellery and accessories', kind: 'physical', archetype: 'stage',
    keywords: ['jewelry', 'jewellery', 'necklace', 'ring', 'rings', 'earrings', 'bracelet', 'watch', 'watches', 'gold', 'beads', 'accessories', 'bags', 'handbag', 'handbags', 'sunglasses'],
    phases: {
      tease: ['Sparkle macro shot in the dark', 'The box, ribbon and card', 'Hand model, piece hidden'],
      'warm-up': ['Gift guide by person and budget', 'How to layer {product}', 'Materials explained in 15 seconds'],
      'early-access': ['Engraving or personalisation slots for the early list'],
      launch: ['On-body shots with price', 'Gift-ready packaging reveal'],
      'last-chance': ['Last day for personalised orders to arrive in time'],
      'thank-you': ['Gift reactions (with permission)', 'Care guide'],
    },
    hooks: ['The gift that gets opened first.', 'How to pick a ring size without asking.', 'Layering 3 necklaces the right way.', 'What {discount} off looks like on real gold.'],
    shots: ['Macro sparkle with a moving light', 'Hand and neck close-ups', 'Gift box opening', 'Scale shot next to a coin'],
    proof: ['gift reactions', 'material certificates if you have them'],
    compliance: ['State metal and purity accurately (e.g. gold plated vs solid gold).'],
    eventFit: { dhanteras: 2.0, diwali: 1.5, christmas: 1.3, 'new-years-eve': 1.2 },
  },
  electronics: {
    label: 'Electronics and gadgets', kind: 'physical', archetype: 'cinematic',
    keywords: ['phone', 'phones', 'laptop', 'laptops', 'gadget', 'gadgets', 'electronics', 'headphones', 'earbuds', 'speaker', 'tv', 'camera', 'console', 'gaming', 'accessories for phones', 'chargers', 'smartwatch'],
    phases: {
      tease: ['Product silhouette with one spec', 'Sound or light test teaser'],
      'warm-up': ['Which model is right for you (comparison)', 'Real-world test: battery, sound, speed', 'Bundle builder'],
      'early-access': ['Early list gets the lowest-stock models first'],
      launch: ['Price comparison: regular vs sale', 'Unboxing and setup in 30 seconds'],
      'last-chance': ['Last call before prices go back', 'Stock left per model (real counts)'],
      'thank-you': ['Setup tips', 'Customer setups (with permission)'],
    },
    hooks: ['Do not buy a {product} before watching this.', 'Is the cheaper model actually worse?', 'Battery test, no cuts.', 'The bundle that saves the most this week.'],
    shots: ['Unboxing top-down', 'Spec on screen over product', 'Real use test with timer', 'Side by side comparison'],
    proof: ['test results', 'warranty', 'reviews with permission'],
    compliance: ['Specs and test results must be accurate; state warranty terms.', 'Refurbished or used items must be labelled clearly.'],
    eventFit: { 'black-friday': 1.4, 'cyber-monday': 1.4, christmas: 1.2, 'singles-day': 1.2 },
  },
  automotive: {
    label: 'Cars and automotive', kind: 'physical', ships: false, archetype: 'cinematic',
    keywords: ['car', 'cars', 'vehicle', 'vehicles', 'auto', 'automotive', 'dealership', 'dealer', 'suv', 'truck', 'tyres', 'tires', 'car parts', 'motorcycle', 'bike', 'ev', 'tokunbo'],
    phases: {
      tease: ['Headlights on in the dark, no badge', 'Engine start sound', 'Walkaround silhouette'],
      'warm-up': ['Walkaround: 5 features in 30 seconds', 'Which model fits your life', 'Cost of ownership explained'],
      'early-access': ['Book a test drive before the sale opens'],
      launch: ['Sale price and finance example (with required disclosures)', 'Delivery or handover moment'],
      'last-chance': ['Last day of the offer; units available (real counts)'],
      'thank-you': ['Handover photos (with permission)', 'Service and care tips'],
    },
    hooks: ['Watch this before you visit any dealer.', '5 features nobody shows you in a test drive.', 'What this month\'s offer really costs per month.', 'Night drive, no music, just the engine.'],
    shots: ['Slow push-in on headlights', 'Drone or wide tracking shot', 'Interior details', 'Engine start close-up', 'Handover with keys'],
    proof: ['handover photos', 'service history', 'inspection reports'],
    compliance: ['Finance offers must show APR, term, deposit and total cost where required by law.', 'State mileage, condition and history accurately for used vehicles.'],
    eventFit: { 'black-friday': 1.2, 'new-year': 1.2, 'new-years-eve': 1.1, christmas: 0.9, 'super-saturday': 0.3, 'green-monday': 0.4, hanukkah: 0.3, halloween: 0.4, 'singles-day': 0.3 },
  },
  home: {
    label: 'Home, furniture and decor', kind: 'physical', archetype: 'split',
    keywords: ['furniture', 'sofa', 'chairs', 'chair', 'decor', 'home decor', 'interior', 'candles', 'bedding', 'kitchen', 'cookware', 'rugs', 'lighting', 'lamps', 'plants'],
    phases: {
      tease: ['Room before the reveal', 'Material and texture close-ups'],
      'warm-up': ['Room makeover under a budget', 'Hosting setup for the holidays', 'Gift guide for the home'],
      'early-access': ['Early list gets delivery slots before the holidays'],
      launch: ['Room reveal with prices tagged', 'Bundle a full corner'],
      'last-chance': ['Last day to order for delivery before the holidays'],
      'thank-you': ['Customer rooms (with permission)'],
    },
    hooks: ['This room cost less than you think.', 'Hosting this year? Start here.', 'One change that makes a room feel finished.'],
    shots: ['Slow pan across the room', 'Texture macro', 'Before and after split', 'Lights on at dusk'],
    proof: ['customer rooms', 'delivery times'],
    compliance: ['State delivery times and assembly honestly.'],
    eventFit: { thanksgiving: 1.2, 'us-thanksgiving': 1.2, christmas: 1.3, diwali: 1.3, hanukkah: 1.1 },
  },
  food: {
    label: 'Food, drinks and restaurants', kind: 'physical', ships: false, archetype: 'split',
    keywords: ['food', 'restaurant', 'cafe', 'bakery', 'cakes', 'cake', 'chops', 'small chops', 'catering', 'drinks', 'wine', 'coffee', 'tea', 'snacks', 'chocolate', 'meal', 'meals', 'jollof', 'pastries', 'hampers', 'hamper'],
    phases: {
      tease: ['Steam and sizzle close-up', 'Hamper being packed'],
      'warm-up': ['Holiday menu reveal', 'Party pack sizes and who they feed', 'Behind the kitchen'],
      'early-access': ['Pre-order slots for the holidays'],
      launch: ['Hamper or menu with price', 'Order cutoff for delivery'],
      'last-chance': ['Last pre-order slots (real counts)'],
      'thank-you': ['Customer tables (with permission)'],
    },
    hooks: ['How many people does this actually feed?', 'Packing 50 hampers before sunrise.', 'The holiday tray everyone asks for.'],
    shots: ['Pour and steam macro', 'Overhead table spread', 'Hands packing a hamper', 'Cut-through shot'],
    proof: ['repeat orders', 'event photos'],
    compliance: ['List allergens.', 'Alcohol: follow local age and advertising rules.'],
    eventFit: { 'us-thanksgiving': 1.4, christmas: 1.4, diwali: 1.3, 'new-years-eve': 1.3, hanukkah: 1.2, halloween: 1.1 },
  },
  fitness: {
    label: 'Fitness, coaching and wellness', kind: 'service', archetype: 'cinematic',
    keywords: ['fitness', 'gym', 'coach', 'coaching', 'personal trainer', 'training', 'workout', 'yoga', 'pilates', 'wellness', 'nutrition', 'weight loss', 'meal plan', 'therapy', 'mindset'],
    phases: {
      tease: ['The goal you will set in January, start now', 'Client progress (with consent, typical results)'],
      'warm-up': ['3 habits that survive the holidays', 'What a week in the program looks like', 'Myths about holiday weight'],
      'early-access': ['Founding member spots for January'],
      launch: ['Program price and what is included', 'Start date and spots available (real)'],
      'last-chance': ['Enrolment closes tonight'],
      'thank-you': ['Welcome to the program', 'First-week tips'],
    },
    hooks: ['Start January in December.', 'What I would do if I had 20 minutes a day.', 'Stop waiting for Monday.', 'A week inside the program.'],
    shots: ['Workout in one take', 'Coach talking to camera', 'Progress tracker on screen', 'Morning routine'],
    proof: ['client stories with consent', 'program details'],
    compliance: ['Results claims must be typical and substantiated; no guaranteed weight loss.', 'Health advice: recommend consulting a professional where relevant.'],
    eventFit: { 'new-year': 1.8, 'new-years-eve': 1.4, 'black-friday': 1.1, 'cyber-monday': 1.1, halloween: 0.5 },
  },
  courses: {
    label: 'Courses and education', kind: 'digital', archetype: 'editorial',
    keywords: ['course', 'courses', 'class', 'classes', 'academy', 'bootcamp', 'tutoring', 'masterclass', 'cohort', 'lessons', 'training program', 'workshop', 'ebook', 'e-book'],
    phases: {
      tease: ['What students built this year', 'The question every student asks first'],
      'warm-up': ['Free mini lesson from the course', 'Curriculum walkthrough', 'Who this is not for'],
      'early-access': ['Waitlist gets the lowest price first'],
      launch: ['What is inside and the price', 'Student results (typical, with consent)'],
      'last-chance': ['Enrolment at this price ends tonight'],
      'thank-you': ['Welcome and how to start', 'First lesson shout-outs'],
    },
    hooks: ['I would learn this first if I started today.', 'The lesson students rewatch most.', 'What you can build in 30 days.', 'Who should not buy this course.'],
    shots: ['Screen recording of a lesson', 'Teacher to camera', 'Student work montage', 'Curriculum scroll'],
    proof: ['student projects', 'completion rates', 'testimonials with consent'],
    compliance: ['Income or job claims must be typical and substantiated.'],
    eventFit: { 'cyber-monday': 1.5, 'black-friday': 1.3, 'new-year': 1.5, christmas: 0.8 },
  },
  apps: {
    label: 'Consumer apps and subscriptions', kind: 'digital', archetype: 'editorial',
    keywords: ['mobile app', 'dating app', 'relationship app', 'marriage app', 'couples app', 'wellness app', 'meditation app', 'fitness app', 'finance app', 'budgeting app', 'savings app', 'premium plan', 'yearly plan', 'monthly plan', 'subscription', 'membership', 'relationship', 'marriage', 'couples', 'dating', 'meditation', 'budgeting'],
    phases: {
      tease: ['One screen from the app, no words', 'A question your users ask themselves (no answer yet)'],
      'warm-up': ['What changes in the first week of using it', 'Free vs paid: what you actually get', 'A real user story (with permission)'],
      'early-access': ['Existing members get the offer first'],
      launch: ['The yearly price, the monthly equivalent and what is included', 'Screen recording of the main feature'],
      'last-chance': ['The offer ends at the stated time (with time zone)'],
      'thank-you': ['Getting started tips for new members', 'What we are building next'],
    },
    hooks: ['The 5 minutes a day that changed how we talk to each other.', 'What you get with Premium, in one screen.', 'Free or Premium? Here is the honest difference.', 'A small habit, kept for a year.'],
    shots: ['Phone screen recording with a finger tap', 'Real people using the app at home (with consent)', 'Feature close-up on a phone mockup', 'Founder or team to camera'],
    proof: ['user stories with permission', 'app store rating (real, with date)', 'member count (real)'],
    compliance: ['State the renewal price, billing period and how to cancel for any discounted subscription.', 'Make sure the app or checkout actually charges the advertised sale price before you publish.', 'Wellness, relationship or finance claims must be general and honest; no guaranteed outcomes.'],
    eventFit: { 'black-friday': 1.3, 'cyber-monday': 1.4, 'new-year': 1.5, valentines: 1.6, christmas: 0.8, halloween: 0.4 },
  },
  software: {
    label: 'Software and SaaS', kind: 'digital', archetype: 'editorial',
    keywords: ['saas', 'software', 'tool', 'platform', 'plugin', 'subscription software', 'api', 'startup', 'b2b', 'crm', 'dashboard'],
    phases: {
      tease: ['Feature teaser: one screen, no words', 'Changelog highlights of the year'],
      'warm-up': ['Workflow demo in 30 seconds', 'Customer use case', 'Plan comparison'],
      'early-access': ['Existing users get the deal first'],
      launch: ['Annual plan price and what you save', 'Live demo'],
      'last-chance': ['Deal ends tonight at midnight (time zone)'],
      'thank-you': ['Onboarding tips', 'Year in review'],
    },
    hooks: ['We shipped 40 features this year. These 3 matter.', 'The workflow that saves our users an hour a week.', 'Annual plan math, explained.'],
    shots: ['Screen recording with zoom', 'Founder to camera', 'Before and after workflow'],
    proof: ['customer logos with permission', 'usage stats', 'case studies'],
    compliance: ['State renewal price and cancellation terms for discounted subscriptions.'],
    eventFit: { 'cyber-monday': 1.6, 'black-friday': 1.3, 'new-year': 1.2, christmas: 0.6, halloween: 0.5 },
  },
  digital: {
    label: 'Digital products and templates', kind: 'digital', archetype: 'editorial',
    keywords: ['template', 'templates', 'presets', 'preset', 'notion', 'canva', 'printables', 'digital product', 'digital products', 'ui kit', 'ui kits', 'fonts', 'stock', 'beats', 'music', 'ebook'],
    phases: {
      tease: ['Sneak peek of the new pack', 'What buyers made with it'],
      'warm-up': ['Before and after using {product}', 'Speed run: build something with it'],
      'early-access': ['Email list gets the bundle first'],
      launch: ['Bundle contents and price', 'Instant download demo'],
      'last-chance': ['Bundle price ends tonight'],
      'thank-you': ['How to get the most from the pack'],
    },
    hooks: ['Everything in this bundle, in 20 seconds.', 'I made this in 5 minutes with one template.', 'Before and after.'],
    shots: ['Screen recording speed run', 'Before and after slider', 'Contents scroll'],
    proof: ['buyer showcases', 'download counts'],
    compliance: ['State the licence (personal vs commercial use).'],
    eventFit: { 'cyber-monday': 1.6, 'black-friday': 1.3 },
  },
  services: {
    label: 'Local and professional services', kind: 'service', archetype: 'split',
    keywords: ['salon', 'barber', 'spa', 'massage', 'photography', 'photographer', 'cleaning', 'consulting', 'agency', 'design services', 'event planner', 'events', 'makeup artist', 'tailor', 'laundry', 'repair', 'clinic', 'dental'],
    phases: {
      tease: ['Behind the scenes of a booked-out day', 'Before and after (with consent)'],
      'warm-up': ['What is included in each package', 'How booking works', 'Holiday availability'],
      'early-access': ['Regulars book holiday slots first'],
      launch: ['Package prices and open slots (real)', 'Gift vouchers'],
      'last-chance': ['Last holiday slots (real counts)', 'Gift vouchers for late shoppers'],
      'thank-you': ['Client results (with consent)', 'Rebook reminder'],
    },
    hooks: ['Our December calendar is filling. Here is what is left.', 'What a full session looks like.', 'The gift voucher that never gets regifted.'],
    shots: ['Time-lapse of a session', 'Before and after', 'Team at work', 'Booking screen'],
    proof: ['client results with consent', 'reviews with permission'],
    compliance: ['Before and after content must be real and unedited.', 'State voucher expiry terms.'],
    eventFit: { christmas: 1.3, 'new-years-eve': 1.3, 'black-friday': 1.0 },
  },
  kids: {
    label: 'Kids, toys and baby', kind: 'physical', archetype: 'stage',
    keywords: ['toys', 'toy', 'kids', 'baby', 'children', 'nursery', 'games', 'puzzles', 'books for kids'],
    phases: {
      tease: ['Wrapped toy shake test', 'Unboxing teaser'],
      'warm-up': ['Gift guide by age', 'What it teaches', 'Safety and age ratings explained'],
      'early-access': ['Early list gets the best-sellers first'],
      launch: ['Toy in play with price', 'Bundle by age'],
      'last-chance': ['Last day to order for delivery before Christmas'],
      'thank-you': ['Holiday morning reactions (with permission)'],
    },
    hooks: ['Gift ideas by age, sorted.', 'The toy kids play with after the box.', 'Parent test: does it survive a week?'],
    shots: ['Play in action', 'Age label close-up', 'Gift wrap'],
    proof: ['parent reviews with permission', 'safety certifications'],
    compliance: ['Show age ratings and safety certifications; follow rules on advertising to children.'],
    eventFit: { christmas: 1.6, halloween: 1.2, hanukkah: 1.2, 'black-friday': 1.2 },
  },
  general: {
    label: 'General business', kind: 'physical', archetype: 'editorial',
    keywords: [],
    phases: {
      tease: ['Behind the scenes of preparing the sale', 'Teaser of the best-seller'],
      'warm-up': ['Why customers choose {product}', 'Gift guide by budget', 'Answer the top 3 questions'],
      'early-access': ['Email or WhatsApp list gets the deal first'],
      launch: ['The offer, the price and how to buy', 'Best-sellers with real prices'],
      'last-chance': ['Offer ends tonight'],
      'thank-you': ['Thank you to customers', 'Customer stories (with permission)'],
    },
    hooks: ['Wait before you buy {product} anywhere else.', 'Our sale prices start {date}.', 'The 3 questions everyone asks us.'],
    shots: ['Product close-up', 'Founder to camera', 'Packing orders', 'Customer using the product'],
    proof: ['reviews with permission', 'repeat customers'],
    compliance: [],
    eventFit: {},
  },
};

export const NICHE_IDS = Object.keys(NICHES);

// Shipping deadlines only matter to businesses that post parcels.
export const SHIPPING_EVENTS = ['shipping-cutoff', 'super-saturday', 'green-monday'];
export const shipsByPost = (niche) => niche.kind === 'physical' && niche.ships !== false;

/** Classify free text into a niche. Returns { id, confidence, matched }. */
export function classifyNiche(text = '') {
  const t = ` ${String(text).toLowerCase().replace(/[^a-z0-9\s-]/g, ' ')} `;
  let best = { id: 'general', score: 0, matched: [] };
  for (const [id, n] of Object.entries(NICHES)) {
    // Keep the form the user wrote ("sneakers", not "sneaker").
    const matched = n.keywords.flatMap((k) => (t.includes(` ${k}s `) ? [`${k}s`] : t.includes(` ${k} `) ? [k] : []));
    const score = matched.reduce((s, k) => s + (k.includes(' ') ? 2 : 1), 0);
    if (score > best.score) best = { id, score, matched };
  }
  return { id: best.id, confidence: best.score >= 2 ? 'high' : best.score === 1 ? 'medium' : 'low', matched: best.matched };
}

export function nicheProfile(idOrText) {
  return NICHES[idOrText] ?? NICHES[classifyNiche(idOrText).id];
}

export function phaseAngles(niche, phase, product) {
  const list = (NICHES[niche] ?? NICHES.general).phases[phase] ?? NICHES.general.phases[phase] ?? [];
  return list.map((a) => a.replace('{product}', product || 'your product'));
}

export { PHASE_KEYS };
