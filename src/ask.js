// When to ask the seller a question. One rule for every AI client:
//   Ask only when the answer would otherwise have to be invented (prices, product photos, the order
//   link), or when a missing detail would make the result wrong for them (deadline for a countdown,
//   currency). Ask everything in ONE message, at most 3 questions, most important first.
//   Never ask about things with a sensible default: platforms, sizes, number of posts, colours,
//   fonts, tone, which events (the calendar decides), hashtags. State those as assumptions instead.

const RANK = { photos: 1, price: 2, link: 3, deadline: 4, currency: 5 };

/**
 * @param {'kit'|'page'} task
 * @param {object} o tool arguments (products, price, offer, discountPercent, ctaUrl, deadline, images)
 * @returns {{ askUser: {field: string, question: string, why: string}[], assumed: string[] }}
 */
export function questionsFor(task, o) {
  const q = [];
  const assumed = [];
  const products = (o.products ?? []).filter((p) => p?.name);
  const noPhoto = products.filter((p) => !p.image || p.representative);
  const stand = noPhoto.length && noPhoto.every((p) => p.representative);
  if (noPhoto.length) {
    q.push({ field: 'photos', question: `Send a photo of ${noPhoto.length === 1 ? noPhoto[0].name : `each product (${noPhoto.slice(0, 4).map((p) => p.name).join(', ')}${noPhoto.length > 4 ? ', ...' : ''})`}. A clear phone photo on a plain background is perfect.`, why: stand ? 'The kit is ready now with representative photos (tagged as such). Your own photos look more trustworthy and sell better.' : 'Without a photo these posts cannot be shared.' });
  } else if (!products.length && !o.images?.length && task === 'kit') {
    assumed.push('No product photos given, so offer posts use matching licensed photos or bold type. Add product photos to feature specific items.');
  }
  const hasPrice = o.price || o.discountPercent || /\d/.test(o.offer ?? '') || products.some((p) => p.price);
  if (!hasPrice) q.push({ field: 'price', question: 'What is the offer and the real prices? (e.g. "30% off, now ₦63,000, was ₦90,000"). Say "no discount" if there is none.', why: 'Prices and discounts are never made up.' });
  if (!o.ctaUrl && !o.pageUrl) q.push({ field: 'link', question: 'Where should buyers order? Your WhatsApp number or a checkout link.', why: 'Every post and button needs a real place to buy.' });
  if (!o.deadline && (o.discountPercent || /off|%|sale/i.test(o.offer ?? ''))) assumed.push('No end date given, so there is no countdown and no "ends" line. Tell me the end date to add one.');
  if (o.price && !/[₦$€£¥₹]|ngn|usd|ghs|kes|zar|eur|gbp|cedi|naira|rand|shilling/i.test(String(o.price))) q.push({ field: 'currency', question: 'Which currency are these prices in?', why: 'Prices must show the right currency.' });
  assumed.push('Sizes, layouts, colours and hashtags were chosen for you; ask for changes any time.');
  return { askUser: q.sort((a, b) => RANK[a.field] - RANK[b.field]).slice(0, 3), assumed };
}

export const ASK_RULE = 'If askUser is not empty, ask the user these questions in one short message before sharing or publishing (keep their wording simple), then call the tool again with the answers. Do not ask about anything in "assumed".';
