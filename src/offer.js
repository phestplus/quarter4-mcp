// What kind of thing is being sold decides the verbs. "Shop now" and "add to cart" are right for
// sneakers and wrong for a subscription app, a course or a booked service.
//   physical      ships or is collected      (shop, order)
//   subscription  apps, SaaS, memberships    (start your plan, upgrade)
//   course        courses, cohorts           (enrol)
//   service       booked or delivered work   (book)
//   digital       one-off downloads          (get it)
import { NICHES } from './niches.js';

const BY_NICHE = { apps: 'subscription', software: 'subscription', courses: 'course', digital: 'digital', services: 'service', fitness: 'service' };

export function offerTypeOf(nicheId, text = '') {
  const t = String(text).toLowerCase();
  if (/\b(subscription|subscribe|membership|premium plan|yearly plan|monthly plan|annual plan|app\b|saas)/.test(t)) return 'subscription';
  if (/\b(course|cohort|class|bootcamp|masterclass|enrol)/.test(t)) return 'course';
  if (/\b(booking|appointment|session|consultation|service)\b/.test(t)) return 'service';
  return BY_NICHE[nicheId] ?? (NICHES[nicheId]?.kind === 'digital' ? 'digital' : 'physical');
}

export const VERBS = {
  physical: { cta: 'Shop now', order: 'Order', grid: 'Shop the sale', wa: 'Reply to this message to order.', ig: 'Shop through the link in our bio.', igWa: 'Tap the link in our bio to order on WhatsApp.', link: 'Order here' },
  subscription: { cta: 'Start your plan', order: 'Choose this plan', grid: 'Choose your plan', wa: 'Reply and we will send you the link.', ig: 'Start your plan from the link in our bio.', igWa: 'Tap the link in our bio to get started.', link: 'Start here' },
  course: { cta: 'Enrol now', order: 'Enrol', grid: 'Choose your plan', wa: 'Reply and we will send you the enrolment link.', ig: 'Enrol through the link in our bio.', igWa: 'Tap the link in our bio to enrol.', link: 'Enrol here' },
  service: { cta: 'Book now', order: 'Book', grid: 'Pick a package', wa: 'Reply to book your slot.', ig: 'Book through the link in our bio.', igWa: 'Tap the link in our bio to book on WhatsApp.', link: 'Book here' },
  digital: { cta: 'Get it now', order: 'Get it', grid: 'Pick yours', wa: 'Reply and we will send you the link.', ig: 'Get it from the link in our bio.', igWa: 'Tap the link in our bio to get it.', link: 'Get it here' },
};

/** Phase calls to action per offer type (content plans). */
export const PHASE_CTA = {
  physical: { tease: 'Join the waitlist / turn on notifications', 'warm-up': 'Save this post / add to wishlist', 'early-access': 'Get early access (link in bio / email)', launch: 'Shop now', 'last-chance': 'Ends soon. Shop now', 'thank-you': 'Share your purchase / leave a review' },
  subscription: { tease: 'Turn on notifications', 'warm-up': 'Save this post / try the free version', 'early-access': 'Get the offer first (link in bio / email)', launch: 'Start your plan', 'last-chance': 'Ends soon. Start your plan', 'thank-you': 'Tell us how it is going / leave a review' },
  course: { tease: 'Join the waitlist', 'warm-up': 'Save this post / watch the free lesson', 'early-access': 'Enrol early (link in bio / email)', launch: 'Enrol now', 'last-chance': 'Enrolment closes soon', 'thank-you': 'Share your progress / leave a review' },
  service: { tease: 'Turn on notifications', 'warm-up': 'Save this post / ask us a question', 'early-access': 'Book early (link in bio)', launch: 'Book now', 'last-chance': 'Last slots at this price. Book now', 'thank-you': 'Share your experience / leave a review' },
  digital: { tease: 'Turn on notifications', 'warm-up': 'Save this post / see a preview', 'early-access': 'Get early access (link in bio / email)', launch: 'Get it now', 'last-chance': 'Ends soon. Get it now', 'thank-you': 'Share what you made / leave a review' },
};

/**
 * A short, readable name for copy. Raw input like "relationship app yearly plans" is never printed as a
 * heading: long product phrases fall back to the brand (or the seller's own displayName).
 */
export function displayNameOf(o, product) {
  if (o.displayName) return o.displayName;
  const p = String(product ?? '').trim();
  return p && p.split(/\s+/).length <= 3 ? p : o.brand;
}
