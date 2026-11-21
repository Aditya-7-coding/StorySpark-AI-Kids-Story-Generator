export type Genre =
  | 'Fantasy'
  | 'Bedtime'
  | 'Adventure'
  | 'Friendship'
  | 'Animals'
  | 'Space';

export type StoryLength = 'Short' | 'Medium' | 'Long';

export type StoryLanguage = 'English' | 'Hindi' | 'Marathi';

export interface StoryRequest {
  childName: string;
  childAge: number;
  genre: Genre;
  characters: string;
  moral: string;
  length: StoryLength;
  language: StoryLanguage;
  variationNonce?: string;
  previousTitle?: string;
}

export interface GeneratedStory {
  title: string;
  subtitle: string;
  paragraphs: string[];
  moralTitle: string;
  moralLesson: string;
  readingTimeMinutes: number;
  meta: {
    childName: string;
    childAge: number;
    genre: Genre;
    characters: string;
    moral: string;
    length: StoryLength;
    language: StoryLanguage;
  };
}

export interface GenreOption {
  id: Genre;
  label: string;
  blurb: string;
  imageSrc: string;
  imageAlt: string;
  fallbackGradient: string;
}

export const HERO_ILLUSTRATION = {
  src: '/src/assets/images/hero_storybook_world_1795287690076.jpg',
  alt: 'An open magical cream storybook resting on fluffy clouds with golden stars floating into a pastel purple and sky blue sky',
};

export const GENRE_OPTIONS: GenreOption[] = [
  {
    id: 'Fantasy',
    label: 'Fantasy',
    blurb: 'Cloud castles & gentle magic',
    imageSrc: '/src/assets/images/scene_fantasy_adventure_1795287689410.jpg',
    imageAlt: 'Pastel purple fairytale tower on a floating island among fluffy cream clouds and golden stars',
    fallbackGradient: 'from-[#E8DFFF] via-[#D9ECFF] to-[#FFF6DF]',
  },
  {
    id: 'Bedtime',
    label: 'Bedtime',
    blurb: 'Cozy moons & sleepy stars',
    imageSrc: '/src/assets/images/scene_bedtime_dreamland_1795287689898.jpg',
    imageAlt: 'Smiling golden crescent moon resting in fluffy cream clouds with warm glowing paper lanterns',
    fallbackGradient: 'from-[#DDD6FE] via-[#C7D2FE] to-[#FEF3C7]',
  },
  {
    id: 'Adventure',
    label: 'Adventure',
    blurb: 'Hot air balloons & discovery',
    imageSrc: '/src/assets/images/scene_fantasy_adventure_1795287689410.jpg',
    imageAlt: 'Wooden hot air balloon gliding across sky blue clouds toward a magical island tower',
    fallbackGradient: 'from-[#D4F0FF] via-[#E9E1FF] to-[#FFF4D8]',
  },
  {
    id: 'Friendship',
    label: 'Friendship',
    blurb: 'Kindness, picnics & teamwork',
    imageSrc: '/src/assets/images/scene_animals_friendship_1795287690274.jpg',
    imageAlt: 'Friendly fox, cream bunny, and little bluebird reading a storybook together on a sunny flower meadow',
    fallbackGradient: 'from-[#E2F2FF] via-[#F1E8FF] to-[#FFF6D6]',
  },
  {
    id: 'Animals',
    label: 'Animals',
    blurb: 'Woodland pals & meadow tales',
    imageSrc: '/src/assets/images/scene_animals_friendship_1795287690274.jpg',
    imageAlt: 'Cute plush fox, bunny, and bluebird enjoying a sunny meadow story picnic under pastel clouds',
    fallbackGradient: 'from-[#DFF4EA] via-[#E5F2FF] to-[#FFF7E0]',
  },
  {
    id: 'Space',
    label: 'Space',
    blurb: 'Friendly rockets & ringed planets',
    imageSrc: '/src/assets/images/scene_space_wonder_1795287689419.jpg',
    imageAlt: 'Pastel lavender and cream toy rocket gliding past sky blue ringed planets and glowing stars',
    fallbackGradient: 'from-[#D8D3FF] via-[#CBE8FF] to-[#FFF2D2]',
  },
];

export const MORAL_PRESETS: string[] = [
  'Kindness and sharing make everyone happier',
  'Always tell the truth, even when it feels hard',
  'Being brave means trying even when you feel shy',
  'True friends help and listen to each other',
  'Patience and practice help us grow',
  'Taking care of animals and nature matters',
  'Being thankful brings joy to every day',
  'Everyone has a special talent to be proud of',
];

export const CHARACTER_IDEAS: string[] = [
  'a curious little fox',
  'a friendly baby dragon',
  'a sleepy cloud',
  'a clever little owl',
  'a cheerful robot',
  'a gentle star',
];

export const LENGTH_OPTIONS: { id: StoryLength; label: string; detail: string }[] = [
  { id: 'Short', label: 'Short', detail: '~2 min' },
  { id: 'Medium', label: 'Medium', detail: '~3 min' },
  { id: 'Long', label: 'Long', detail: '~5 min' },
];

export const LANGUAGE_OPTIONS: { id: StoryLanguage; label: string; native: string; speechLang: string }[] = [
  { id: 'English', label: 'English', native: 'English', speechLang: 'en-US' },
  { id: 'Hindi', label: 'Hindi', native: 'हिन्दी', speechLang: 'hi-IN' },
  { id: 'Marathi', label: 'Marathi', native: 'मराठी', speechLang: 'mr-IN' },
];

export function getGenreOption(genre: Genre): GenreOption {
  return GENRE_OPTIONS.find((item) => item.id === genre) ?? GENRE_OPTIONS[0];
}

export function formatStoryAsPlainText(story: GeneratedStory): string {
  const divider = '─'.repeat(44);
  const lines = [
    story.title,
    story.subtitle ? story.subtitle : '',
    divider,
    `For: ${story.meta.childName} (Age ${story.meta.childAge})`,
    `Genre: ${story.meta.genre} | Language: ${story.meta.language} | Length: ${story.meta.length}`,
    divider,
    '',
    ...story.paragraphs.flatMap((paragraph) => [paragraph, '']),
    divider,
    `${story.moralTitle}:`,
    story.moralLesson,
    divider,
    'Created with StorySpark AI',
  ];
  return lines.filter((line, index, arr) => !(line === '' && arr[index - 1] === '')).join('\n');
}

function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function formatStoryAsPrintableHtml(story: GeneratedStory): string {
  const safeTitle = escapeHtml(story.title);
  const safeSubtitle = escapeHtml(story.subtitle);
  const safeMoralTitle = escapeHtml(story.moralTitle);
  const safeMoralLesson = escapeHtml(story.moralLesson);
  const paragraphsHtml = story.paragraphs
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join('\n      ');

  return `<!doctype html>
<html lang="${story.meta.language === 'Hindi' ? 'hi' : story.meta.language === 'Marathi' ? 'mr' : 'en'}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle} — StorySpark AI</title>
  <style>
    body {
      margin: 0;
      padding: 40px 20px;
      background: #FFFBF2;
      color: #241C3B;
      font-family: "Plus Jakarta Sans", "Noto Sans Devanagari", system-ui, -apple-system, sans-serif;
      line-height: 1.85;
    }
    .book {
      max-width: 720px;
      margin: 0 auto;
      background: #FFFFFF;
      border: 1px solid #E7DFFF;
      border-radius: 28px;
      padding: 44px 48px;
      box-shadow: 0 18px 40px -18px rgba(74, 52, 138, 0.16);
    }
    .meta {
      font-size: 13px;
      color: #6B6285;
      margin-bottom: 12px;
    }
    h1 {
      margin: 0 0 10px 0;
      font-size: 32px;
      line-height: 1.25;
      color: #241C3B;
    }
    .subtitle {
      margin: 0 0 28px 0;
      font-size: 16px;
      color: #5C5476;
    }
    p {
      margin: 0 0 18px 0;
      font-size: 18px;
    }
    .moral {
      margin-top: 32px;
      padding: 20px 24px;
      border-radius: 20px;
      background: #FFF7E2;
      border: 1px solid #F3DFAD;
    }
    .moral-title {
      font-weight: 700;
      font-size: 14px;
      color: #8A5A00;
      margin-bottom: 6px;
    }
    .moral-body {
      margin: 0;
      font-size: 16px;
      color: #3D2B07;
    }
    .footer {
      margin-top: 28px;
      font-size: 12px;
      color: #7D7596;
      text-align: center;
    }
    @media print {
      body { background: #FFFFFF; padding: 0; }
      .book { box-shadow: none; border: none; padding: 24px; }
    }
  </style>
</head>
<body>
  <article class="book">
    <div class="meta">${escapeHtml(story.meta.genre)} &middot; ${escapeHtml(story.meta.language)} &middot; For ${escapeHtml(story.meta.childName)}, Age ${story.meta.childAge}</div>
    <h1>${safeTitle}</h1>
    ${safeSubtitle ? `<div class="subtitle">${safeSubtitle}</div>` : ''}
    <section>
      ${paragraphsHtml}
    </section>
    <aside class="moral">
      <div class="moral-title">${safeMoralTitle}</div>
      <p class="moral-body">${safeMoralLesson}</p>
    </aside>
    <div class="footer">Created with StorySpark AI</div>
  </article>
</body>
</html>`;
}

export function buildSafeFilename(title: string, extension: string): string {
  const cleaned = title
    .toLowerCase()
    .replace(/[^a-z0-9\u0900-\u097f]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return `storyspark-${cleaned || 'story'}.${extension}`;
}
