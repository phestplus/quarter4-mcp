// Illustrations without Figma (report §12). The illustration spec (style tokens + scene) is the contract:
// level 2 hands a ready prompt to the host AI's own image tool; level 3 (Pro, later) sends the same
// prompt to a server-side model; level 4 is the brand's own art. Every level shares the recipe below,
// which is the one that produced the illustrations the field test accepted.

/** Scene templates per niche: what each illustration shows. People are described concretely. */
export const SCENES = {
  apps: [
    { id: 'connect-by-phone', moment: 'two people, apart, each smiling at their phone, joined by a thin line in the accent colour', crop: 'mid-thigh', aspect: '5:4' },
    { id: 'using-at-home', moment: 'a person relaxed on a sofa at home, using the app on their phone, calm and focused', crop: 'full figure', aspect: '4:5' },
    { id: 'milestone', moment: 'two people sharing a small happy moment while looking at one phone together', crop: 'waist up', aspect: '1:1' },
  ],
  software: [
    { id: 'focused-work', moment: 'a person at a clean desk with a laptop, calm and focused, a plant nearby', crop: 'waist up', aspect: '5:4' },
    { id: 'team-together', moment: 'two colleagues pointing at one laptop screen, pleased with the result', crop: 'waist up', aspect: '5:4' },
  ],
  courses: [
    { id: 'learning', moment: 'a person learning at a table with a laptop and a notebook, engaged and curious', crop: 'waist up', aspect: '5:4' },
    { id: 'breakthrough', moment: 'a person smiling with quiet pride after finishing a lesson', crop: 'waist up', aspect: '1:1' },
  ],
  fitness: [
    { id: 'training-together', moment: 'two training partners mid-workout, encouraging each other', crop: 'full figure', aspect: '4:5' },
    { id: 'after-session', moment: 'a person resting after a session with a water bottle, satisfied', crop: 'full figure', aspect: '4:5' },
  ],
  food: [
    { id: 'sharing-a-meal', moment: 'friends sharing a meal at a table, laughing, plates being passed', crop: 'waist up', aspect: '5:4' },
    { id: 'first-bite', moment: 'a person enjoying the first bite of a dish', crop: 'waist up', aspect: '1:1' },
  ],
  services: [
    { id: 'client-and-pro', moment: 'a client and a professional talking warmly across a small table', crop: 'waist up', aspect: '5:4' },
    { id: 'job-done', moment: 'a happy client seeing the finished result', crop: 'waist up', aspect: '1:1' },
  ],
  fashion: [{ id: 'getting-ready', moment: 'a person getting ready in front of a mirror, confident', crop: 'full figure', aspect: '4:5' }],
  beauty: [{ id: 'self-care', moment: 'a person doing a calm self-care routine at a vanity', crop: 'waist up', aspect: '4:5' }],
  footwear: [{ id: 'stepping-out', moment: 'a person stepping out of the door in fresh sneakers, mid-stride', crop: 'full figure', aspect: '4:5' }],
  kids: [{ id: 'family-play', moment: 'a parent and child playing together on the floor, joyful', crop: 'full figure', aspect: '5:4' }],
  general: [
    { id: 'happy-customer', moment: 'a happy customer using the product at home', crop: 'waist up', aspect: '4:5' },
    { id: 'together', moment: 'two people sharing a good moment together', crop: 'waist up', aspect: '5:4' },
  ],
};

/** Three style options a seller can pick once (stored in brand_profile.illustration.style). */
export const STYLES = {
  'flat-editorial': 'Premium modern editorial illustration, flat vector style with subtle soft grain texture, realistic human proportions and expressive friendly faces, same style as a warm lifestyle brand campaign.',
  'soft-line': 'Refined minimal line illustration with soft flat colour fills, elegant thin outlines, natural proportions and gentle expressions, calm and airy, like a premium wellness brand.',
  'textured-gouache': 'Warm hand-painted gouache illustration with visible soft brush texture, natural proportions, expressive faces, rich but restrained colour, like a premium magazine feature.',
};

const ASPECT_SIZE = { '1:1': '1024x1024', '4:5': '1024x1280', '5:4': '1280x1024', '9:16': '1024x1792', '16:9': '1792x1024' };

/**
 * Build the illustration prompt from the brand profile and a scene (the accepted recipe).
 * @param {object} p { palette: {bg, text, accent, accent2, ...}, style, avoid: [], audience: { region, ageRange }, reference }
 * @param {object} scene { moment, people?, mood?, crop?, aspect? }
 */
export function promptFor(p, scene) {
  const pal = Object.entries(p.palette ?? {}).filter(([, v]) => /^#[0-9a-f]{6}$/i.test(v ?? ''));
  const bg = p.palette?.bg ?? '#F5F1EA';
  const people = scene.people ?? (p.audience?.region ? `people who look like the brand's audience in ${p.audience.region}${p.audience.ageRange ? `, aged ${p.audience.ageRange}` : ''}, natural hair and everyday modern clothing` : 'a diverse mix of people, natural hair and everyday modern clothing');
  const avoid = ['text', 'letters', 'logos', 'watermark', 'hearts', 'frames', 'borders', ...(p.avoid ?? [])];
  return [
    STYLES[p.style] ?? STYLES['flat-editorial'],
    `Scene: ${scene.moment}. People: ${people}; outfits in the brand colours.`,
    `Mood: ${scene.mood ?? 'calm, warm, hopeful'}.`,
    pal.length ? `Colour palette strictly: ${pal.map(([k, v]) => `${v} (${k})`).join(', ')}.` : 'Colour palette: soft, warm and restrained.',
    `Background: one flat solid plain ${bg} colour filling the whole image, no scenery, no shadows on the background, no frame, no border.`,
    `No ${[...new Set(avoid)].join(', no ')}.`,
    `Crop: ${scene.crop ?? 'waist up'}, generous empty space around the figures.`,
    p.reference ? `Match the illustration style, line weight and colour treatment of the reference image exactly.` : '',
  ].filter(Boolean).join('\n');
}

/** Everything the host AI needs to generate the scenes itself (level 2 handoff). */
export function handoff(profile, scenes, nicheId) {
  const list = (scenes?.length ? scenes : SCENES[nicheId] ?? SCENES.general).slice(0, 6);
  return list.map((s) => ({
    scene: s.id ?? 'custom',
    aspect: s.aspect ?? '4:5',
    size: ASPECT_SIZE[s.aspect ?? '4:5'] ?? '1024x1280',
    prompt: promptFor(profile, s),
  }));
}

/** Acceptance checks the AI (or a vision model) should run before using a generated image. */
export const ACCEPTANCE = [
  'Faces and hands look natural (no extra or missing fingers, no distorted features).',
  'Colours stay within the brand palette.',
  'No text, letters, logos or watermarks anywhere in the image.',
  'The people fit the brand\'s audience.',
  'The background is one flat colour (so it cuts out cleanly).',
];
