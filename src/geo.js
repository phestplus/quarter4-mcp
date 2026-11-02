// Places: countries (ISO 3166-1 alpha-2), their common names, major cities and
// continent/sub-region, so "Lagos", "West Africa", "the Gulf" or "Europe" all resolve.
// `region` links a country to the curated event regions (US, UK, NG, ...) when one exists.

// [iso2, name, aliases/cities, continent, subregion, region?]
const C = [
  // Africa
  ['NG', 'Nigeria', 'naija lagos abuja ibadan kano port harcourt enugu benin city kaduna owerri uyo calabar warri abeokuta', 'africa', 'west africa', 'NG'],
  ['GH', 'Ghana', 'accra kumasi takoradi tamale', 'africa', 'west africa'],
  ['SN', 'Senegal', 'dakar', 'africa', 'west africa'],
  ['CI', "Côte d'Ivoire", "ivory coast cote d'ivoire abidjan", 'africa', 'west africa'],
  ['CM', 'Cameroon', 'douala yaounde', 'africa', 'central africa'],
  ['KE', 'Kenya', 'nairobi mombasa kisumu', 'africa', 'east africa'],
  ['UG', 'Uganda', 'kampala', 'africa', 'east africa'],
  ['TZ', 'Tanzania', 'dar es salaam dodoma zanzibar', 'africa', 'east africa'],
  ['RW', 'Rwanda', 'kigali', 'africa', 'east africa'],
  ['ET', 'Ethiopia', 'addis ababa', 'africa', 'east africa'],
  ['ZA', 'South Africa', 'johannesburg joburg cape town durban pretoria', 'africa', 'southern africa'],
  ['ZW', 'Zimbabwe', 'harare bulawayo', 'africa', 'southern africa'],
  ['ZM', 'Zambia', 'lusaka', 'africa', 'southern africa'],
  ['BW', 'Botswana', 'gaborone', 'africa', 'southern africa'],
  ['NA', 'Namibia', 'windhoek', 'africa', 'southern africa'],
  ['EG', 'Egypt', 'cairo alexandria', 'africa', 'north africa'],
  ['MA', 'Morocco', 'casablanca rabat marrakesh marrakech', 'africa', 'north africa'],
  ['TN', 'Tunisia', 'tunis', 'africa', 'north africa'],
  ['DZ', 'Algeria', 'algiers', 'africa', 'north africa'],
  // Middle East
  ['AE', 'United Arab Emirates', 'uae dubai abu dhabi sharjah emirates', 'asia', 'middle east', 'ME'],
  ['SA', 'Saudi Arabia', 'ksa riyadh jeddah mecca', 'asia', 'middle east', 'ME'],
  ['QA', 'Qatar', 'doha', 'asia', 'middle east', 'ME'],
  ['KW', 'Kuwait', 'kuwait city', 'asia', 'middle east', 'ME'],
  ['BH', 'Bahrain', 'manama', 'asia', 'middle east', 'ME'],
  ['OM', 'Oman', 'muscat', 'asia', 'middle east', 'ME'],
  ['JO', 'Jordan', 'amman', 'asia', 'middle east'],
  ['LB', 'Lebanon', 'beirut', 'asia', 'middle east'],
  ['IL', 'Israel', 'tel aviv jerusalem', 'asia', 'middle east'],
  ['TR', 'Turkey', 'turkiye istanbul ankara izmir', 'asia', 'middle east'],
  // Asia
  ['IN', 'India', 'mumbai delhi new delhi bangalore bengaluru chennai hyderabad kolkata pune ahmedabad', 'asia', 'south asia', 'IN'],
  ['PK', 'Pakistan', 'karachi lahore islamabad', 'asia', 'south asia'],
  ['BD', 'Bangladesh', 'dhaka', 'asia', 'south asia'],
  ['LK', 'Sri Lanka', 'colombo', 'asia', 'south asia'],
  ['CN', 'China', 'shanghai beijing shenzhen guangzhou', 'asia', 'east asia', 'CN'],
  ['HK', 'Hong Kong', 'hk', 'asia', 'east asia'],
  ['TW', 'Taiwan', 'taipei', 'asia', 'east asia'],
  ['JP', 'Japan', 'tokyo osaka kyoto', 'asia', 'east asia'],
  ['KR', 'South Korea', 'korea seoul busan', 'asia', 'east asia'],
  ['SG', 'Singapore', 'sg', 'asia', 'southeast asia'],
  ['MY', 'Malaysia', 'kuala lumpur kl', 'asia', 'southeast asia'],
  ['ID', 'Indonesia', 'jakarta bali surabaya', 'asia', 'southeast asia'],
  ['PH', 'Philippines', 'manila cebu', 'asia', 'southeast asia'],
  ['TH', 'Thailand', 'bangkok phuket', 'asia', 'southeast asia'],
  ['VN', 'Vietnam', 'hanoi ho chi minh saigon', 'asia', 'southeast asia'],
  // Europe
  ['GB', 'United Kingdom', 'uk u.k. britain great britain england scotland wales northern ireland london manchester birmingham leeds glasgow liverpool edinburgh bristol', 'europe', 'northern europe', 'UK'],
  ['IE', 'Ireland', 'dublin cork', 'europe', 'northern europe', 'EU'],
  ['FR', 'France', 'paris lyon marseille', 'europe', 'western europe', 'EU'],
  ['DE', 'Germany', 'berlin munich hamburg frankfurt cologne', 'europe', 'western europe', 'EU'],
  ['NL', 'Netherlands', 'holland amsterdam rotterdam', 'europe', 'western europe', 'EU'],
  ['BE', 'Belgium', 'brussels antwerp', 'europe', 'western europe', 'EU'],
  ['CH', 'Switzerland', 'zurich geneva', 'europe', 'western europe'],
  ['AT', 'Austria', 'vienna', 'europe', 'western europe', 'EU'],
  ['ES', 'Spain', 'madrid barcelona valencia', 'europe', 'southern europe', 'EU'],
  ['PT', 'Portugal', 'lisbon porto', 'europe', 'southern europe', 'EU'],
  ['IT', 'Italy', 'rome milan naples', 'europe', 'southern europe', 'EU'],
  ['GR', 'Greece', 'athens', 'europe', 'southern europe', 'EU'],
  ['SE', 'Sweden', 'stockholm', 'europe', 'northern europe', 'EU'],
  ['NO', 'Norway', 'oslo', 'europe', 'northern europe'],
  ['DK', 'Denmark', 'copenhagen', 'europe', 'northern europe', 'EU'],
  ['FI', 'Finland', 'helsinki', 'europe', 'northern europe', 'EU'],
  ['PL', 'Poland', 'warsaw krakow', 'europe', 'eastern europe', 'EU'],
  ['CZ', 'Czechia', 'czech republic prague', 'europe', 'eastern europe', 'EU'],
  ['RO', 'Romania', 'bucharest', 'europe', 'eastern europe', 'EU'],
  ['UA', 'Ukraine', 'kyiv kiev', 'europe', 'eastern europe'],
  // Americas
  ['US', 'United States', 'us u.s. usa america united states of america new york nyc los angeles la chicago houston dallas atlanta miami texas california florida seattle boston washington dc', 'north america', 'north america', 'US'],
  ['CA', 'Canada', 'toronto vancouver montreal calgary ottawa', 'north america', 'north america', 'CA'],
  ['MX', 'Mexico', 'méxico mexico city guadalajara monterrey', 'north america', 'central america', 'MX'],
  ['JM', 'Jamaica', 'kingston', 'north america', 'caribbean'],
  ['TT', 'Trinidad and Tobago', 'trinidad port of spain', 'north america', 'caribbean'],
  ['BR', 'Brazil', 'sao paulo são paulo rio de janeiro rio', 'south america', 'south america'],
  ['AR', 'Argentina', 'buenos aires', 'south america', 'south america'],
  ['CO', 'Colombia', 'bogota medellin', 'south america', 'south america'],
  ['CL', 'Chile', 'santiago', 'south america', 'south america'],
  ['PE', 'Peru', 'lima', 'south america', 'south america'],
  // Oceania
  ['AU', 'Australia', 'sydney melbourne brisbane perth adelaide', 'oceania', 'oceania', 'AU'],
  ['NZ', 'New Zealand', 'auckland wellington', 'oceania', 'oceania'],
];

export const COUNTRIES = C.map(([iso, name, aliases, continent, subregion, region]) => ({ iso, name, aliases, continent, subregion, region: region ?? null }));
const byIso = new Map(COUNTRIES.map((c) => [c.iso, c]));

// Lookup phrases: country names, multi-word aliases (matched whole), then single words.
const PHRASES = COUNTRIES.map((c) => [c.name.toLowerCase(), c.iso]);
const MULTI = ['port harcourt', 'benin city', 'ivory coast', "cote d'ivoire", 'dar es salaam', 'addis ababa', 'cape town', 'abu dhabi', 'saudi arabia', 'tel aviv', 'new delhi', 'ho chi minh', 'kuala lumpur', 'great britain', 'northern ireland', 'united kingdom', 'czech republic', 'new york', 'los angeles', 'united states', 'united states of america', 'washington dc', 'mexico city', 'port of spain', 'sao paulo', 'são paulo', 'rio de janeiro', 'buenos aires', 'new zealand', 'south africa', 'south korea', 'hong kong', 'sri lanka', 'kuwait city', 'trinidad and tobago', 'united arab emirates'];
for (const c of COUNTRIES) {
  let rest = ` ${c.aliases} `;
  for (const m of MULTI) if (rest.includes(` ${m} `)) { PHRASES.push([m, c.iso]); rest = rest.replace(` ${m} `, ' '); }
  for (const w of rest.trim().split(/\s+/).filter(Boolean)) PHRASES.push([w, c.iso]);
}
// Longest phrases first so "new york" wins over "york".
PHRASES.sort((a, b) => b[0].length - a[0].length);

export const CONTINENTS = {
  africa: 'africa', 'west africa': 'west africa', 'east africa': 'east africa', 'southern africa': 'southern africa', 'north africa': 'north africa', 'central africa': 'central africa',
  europe: 'europe', 'western europe': 'western europe', 'eastern europe': 'eastern europe', 'northern europe': 'northern europe', 'southern europe': 'southern europe', scandinavia: 'northern europe',
  asia: 'asia', 'south asia': 'south asia', 'east asia': 'east asia', 'southeast asia': 'southeast asia', 'south east asia': 'southeast asia',
  'middle east': 'middle east', gulf: 'middle east', 'the gulf': 'middle east', gcc: 'middle east', mena: 'middle east',
  'north america': 'north america', 'latin america': 'south america', latam: 'south america', 'south america': 'south america', caribbean: 'caribbean', americas: 'americas',
  oceania: 'oceania', 'australia and new zealand': 'oceania', anz: 'oceania',
};

/** Countries in a continent or sub-region name. */
export function countriesIn(area) {
  const a = CONTINENTS[String(area).toLowerCase().trim()];
  if (!a) return [];
  if (a === 'americas') return COUNTRIES.filter((c) => c.continent === 'north america' || c.continent === 'south america').map((c) => c.iso);
  return COUNTRIES.filter((c) => c.continent === a || c.subregion === a).map((c) => c.iso);
}

/**
 * Find places in free text. Two-letter codes count only when written in capitals ("UK", "NG")
 * so words like "in", "us", "la" do not trigger false matches.
 * @returns {{ countries: string[], areas: string[] }}
 */
export function findPlaces(text) {
  const raw = ` ${String(text ?? '')} `;
  let t = ` ${String(text ?? '').toLowerCase().replace(/[^a-z0-9.'À-ɏ\s]/g, ' ').replace(/\s+/g, ' ')} `;
  const countries = [];
  const areas = [];
  for (const area of Object.keys(CONTINENTS).sort((a, b) => b.length - a.length)) {
    if (t.includes(` ${area} `)) { areas.push(area); t = t.replace(` ${area} `, ' '); for (const iso of countriesIn(area)) if (!countries.includes(iso)) countries.push(iso); }
  }
  for (const [phrase, iso] of PHRASES) {
    if (phrase.length <= 3) {
      // short aliases: require upper case in the original text (UK, US, KSA, UAE, NYC)
      if (new RegExp(`[^A-Za-z]${phrase.toUpperCase().replace(/\./g, '\\.')}[^A-Za-z]`).test(raw) && !countries.includes(iso)) countries.push(iso);
    } else if (t.includes(` ${phrase} `) && !countries.includes(iso)) {
      countries.push(iso);
    }
  }
  return { countries, areas };
}

/** Resolve one token (code, name, city, continent) to ISO codes. */
export function resolvePlace(token) {
  const s = String(token ?? '').trim();
  if (!s) return [];
  const up = s.toUpperCase();
  if (up === 'UK') return ['GB'];
  if (up === 'EU') return COUNTRIES.filter((c) => c.region === 'EU').map((c) => c.iso);
  if (byIso.has(up)) return [up];
  const area = countriesIn(s);
  if (area.length) return area;
  const { countries } = findPlaces(s.length <= 3 ? s.toUpperCase() : s);
  return countries;
}

export const country = (iso) => byIso.get(iso) ?? null;

/** Curated event regions (US, UK, NG, EU, ...) for a list of ISO countries. */
export function regionsFor(isos) {
  return [...new Set(isos.map((i) => byIso.get(i)?.region).filter(Boolean))];
}
