import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALLOWED_GENRES = [
  'Fantasy',
  'Bedtime',
  'Adventure',
  'Friendship',
  'Animals',
  'Space',
] as const;

const ALLOWED_LENGTHS = ['Short', 'Medium', 'Long'] as const;
const ALLOWED_LANGUAGES = ['English', 'Hindi', 'Marathi'] as const;

type Genre = (typeof ALLOWED_GENRES)[number];
type StoryLength = (typeof ALLOWED_LENGTHS)[number];
type StoryLanguage = (typeof ALLOWED_LANGUAGES)[number];

interface GenerateStoryPayload {
  childName?: unknown;
  childAge?: unknown;
  genre?: unknown;
  characters?: unknown;
  moral?: unknown;
  length?: unknown;
  language?: unknown;
  variationNonce?: unknown;
  previousTitle?: unknown;
}

interface GeneratedStoryResponse {
  title: string;
  subtitle: string;
  paragraphs: string[];
  moralTitle: string;
  moralLesson: string;
  readingTimeMinutes: number;
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('MISSING_API_KEY');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function getAgeVocabularyGuide(age: number): string {
  if (age <= 4) {
    return 'Use very simple, musical, gentle words, cozy sensory images, short comforting sentences, and a warm soothing rhythm suitable for toddlers and preschoolers.';
  }
  if (age <= 7) {
    return 'Use playful, clear vocabulary, expressive friendly dialogue, gentle humor, and imaginative scenes easy for early readers and read-aloud storytime.';
  }
  if (age <= 10) {
    return 'Use vivid, engaging storytelling with relatable emotions, clever problem-solving, friendly curiosity, and accessible elementary-school vocabulary.';
  }
  return 'Use rich yet friendly middle-grade storytelling with inspiring choices, thoughtful character growth, and clear, wholesome adventure.';
}

function getLengthGuide(length: StoryLength): {
  paragraphs: string;
  words: string;
  minutes: number;
} {
  if (length === 'Short') {
    return { paragraphs: '4 to 5', words: '170 to 230', minutes: 2 };
  }
  if (length === 'Long') {
    return { paragraphs: '9 to 11', words: '500 to 640', minutes: 5 };
  }
  return { paragraphs: '6 to 8', words: '320 to 420', minutes: 3 };
}

function getLanguageGuide(language: StoryLanguage): {
  instruction: string;
  defaultMoralTitle: string;
} {
  if (language === 'Hindi') {
    return {
      instruction:
        'Write the ENTIRE response (title, subtitle, all story paragraphs, moralTitle, and moralLesson) in warm, natural, child-friendly Hindi using Devanagari script (सरल और मधुर हिन्दी). Do not mix English words unless it is the child name.',
      defaultMoralTitle: 'कहानी की सीख',
    };
  }
  if (language === 'Marathi') {
    return {
      instruction:
        'Write the ENTIRE response (title, subtitle, all story paragraphs, moralTitle, and moralLesson) in warm, natural, child-friendly Marathi using Devanagari script (सोपी, गोड आणि सुंदर मराठी). Do not mix English words unless it is the child name.',
      defaultMoralTitle: 'गोष्टीचे तात्पर्य',
    };
  }
  return {
    instruction:
      'Write the ENTIRE response (title, subtitle, all story paragraphs, moralTitle, and moralLesson) in warm, joyful, simple English suitable for children.',
    defaultMoralTitle: 'Moral of the Story',
  };
}

function sanitizeText(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLen);
}

async function generateWithRetry<T>(fn: () => Promise<T>, maxAttempts = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const msg = error instanceof Error ? error.message : String(error);
      const isNonRetryable =
        msg.includes('MISSING_API_KEY') ||
        msg.includes('API_KEY_INVALID') ||
        msg.includes('PERMISSION_DENIED') ||
        msg.includes('400') ||
        msg.includes('403') ||
        msg.includes('404');
      if (isNonRetryable || attempt === maxAttempts) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 650 * attempt));
    }
  }
  throw lastError;
}

async function createServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/api/stories/generate', async (req, res) => {
    try {
      const body = (req.body ?? {}) as GenerateStoryPayload;

      const childName = sanitizeText(body.childName, 60);
      const parsedAge = Number(body.childAge);
      const genre = sanitizeText(body.genre, 30) as Genre;
      const characters = sanitizeText(body.characters, 240);
      const moral = sanitizeText(body.moral, 180);
      const length = sanitizeText(body.length, 20) as StoryLength;
      const language = sanitizeText(body.language, 20) as StoryLanguage;
      const previousTitle = sanitizeText(body.previousTitle, 120);
      const variationNonce = sanitizeText(
        body.variationNonce != null ? String(body.variationNonce) : '',
        40
      );

      if (!childName) {
        return res.status(400).json({
          error: "Please enter the child's name to personalize the story.",
        });
      }

      if (!Number.isFinite(parsedAge) || parsedAge < 1 || parsedAge > 16) {
        return res.status(400).json({
          error: "Please enter a valid child's age between 1 and 16 years.",
        });
      }

      if (!ALLOWED_GENRES.includes(genre)) {
        return res.status(400).json({
          error: 'Please choose one of the supported story genres.',
        });
      }

      if (!ALLOWED_LENGTHS.includes(length)) {
        return res.status(400).json({
          error: 'Please choose Short, Medium, or Long for the story length.',
        });
      }

      if (!ALLOWED_LANGUAGES.includes(language)) {
        return res.status(400).json({
          error: 'Please choose English, Hindi, or Marathi as the language.',
        });
      }

      if (!moral) {
        return res.status(400).json({
          error: 'Please select or enter a moral or lesson for the story.',
        });
      }

      const age = Math.round(parsedAge);
      const lengthGuide = getLengthGuide(length);
      const languageGuide = getLanguageGuide(language);
      const ageGuide = getAgeVocabularyGuide(age);

      const ai = getGeminiClient();

      const systemInstruction = [
        'You are StorySpark AI, a beloved children’s storybook author who writes warm, wholesome, creative, age-appropriate moral stories for kids and families.',
        'Safety and Tone Rules:',
        '- Keep every story 100% safe, uplifting, gentle, and comforting—no violence, scary monsters, bullying without kind resolution, or sad/harsh endings.',
        '- Weave the requested child’s name naturally into the story as the main hero or special friend.',
        '- Include all requested characters meaningfully and delightfully.',
        '- Let the moral shine organically through the characters’ kind choices and a gentle concluding moment—never sound preachy.',
        '- Format the story into clean, well-paced paragraphs without markdown asterisks, bullet symbols, or numbering inside the paragraph text.',
        languageGuide.instruction,
      ].join('\n');

      const promptLines = [
        `Create an original children's story with these details:`,
        `- Child's Name: ${childName}`,
        `- Child's Age: ${age} years old`,
        `- Genre: ${genre}`,
        `- Characters to Include: ${
          characters || 'A friendly talking animal companion and a gentle magical guide'
        }`,
        `- Moral / Lesson: ${moral}`,
        `- Target Length: ${length} (${lengthGuide.paragraphs} paragraphs, roughly ${lengthGuide.words} words)`,
        `- Language: ${language}`,
        `- Vocabulary & Style Guidance: ${ageGuide}`,
        `- Suggested localized moral heading: ${languageGuide.defaultMoralTitle}`,
      ];

      if (previousTitle) {
        promptLines.push(
          `- Fresh Variation Requirement: Create a completely NEW plot, setting, and title that is different from "${previousTitle}". (Creative spark ID: ${variationNonce || Date.now()})`
        );
      }

      const response = await generateWithRetry(() =>
        ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: promptLines.join('\n'),
          config: {
            systemInstruction,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              required: [
                'title',
                'subtitle',
                'paragraphs',
                'moralTitle',
                'moralLesson',
                'readingTimeMinutes',
              ],
              properties: {
                title: {
                  type: Type.STRING,
                  description: 'An attractive, whimsical storybook title in the chosen language.',
                },
                subtitle: {
                  type: Type.STRING,
                  description:
                    'A short, cozy 1-sentence storybook opener or tagline in the chosen language.',
                },
                paragraphs: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description:
                    'Well-formatted story paragraphs in the chosen language with clear beginning, middle, and heartwarming ending.',
                },
                moralTitle: {
                  type: Type.STRING,
                  description:
                    'Localized label for the moral section (e.g., "Moral of the Story", "कहानी की सीख", or "गोष्टीचे तात्पर्य").',
                },
                moralLesson: {
                  type: Type.STRING,
                  description:
                    'A warm, clear 1-2 sentence takeaway explaining the story moral for a child in the chosen language.',
                },
                readingTimeMinutes: {
                  type: Type.INTEGER,
                  description: 'Estimated read-aloud duration in minutes (between 1 and 10).',
                },
              },
            },
          },
        })
      );

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        return res.status(502).json({
          error: 'Gemini returned an empty response. Please try generating your story again.',
        });
      }

      let parsed: Partial<GeneratedStoryResponse>;
      try {
        parsed = JSON.parse(rawText) as Partial<GeneratedStoryResponse>;
      } catch {
        return res.status(502).json({
          error: 'Could not format the generated story cleanly. Please click Regenerate Story.',
        });
      }

      const paragraphs = Array.isArray(parsed.paragraphs)
        ? parsed.paragraphs
            .map((p) => (typeof p === 'string' ? p.trim() : ''))
            .filter(Boolean)
        : [];

      if (!parsed.title || paragraphs.length === 0) {
        return res.status(502).json({
          error: 'The story came back incomplete. Please try generating again.',
        });
      }

      const story: GeneratedStoryResponse = {
        title: parsed.title.trim(),
        subtitle:
          typeof parsed.subtitle === 'string' ? parsed.subtitle.trim() : '',
        paragraphs,
        moralTitle:
          typeof parsed.moralTitle === 'string' && parsed.moralTitle.trim()
            ? parsed.moralTitle.trim()
            : languageGuide.defaultMoralTitle,
        moralLesson:
          typeof parsed.moralLesson === 'string' && parsed.moralLesson.trim()
            ? parsed.moralLesson.trim()
            : moral,
        readingTimeMinutes:
          typeof parsed.readingTimeMinutes === 'number' &&
          parsed.readingTimeMinutes >= 1 &&
          parsed.readingTimeMinutes <= 15
            ? Math.round(parsed.readingTimeMinutes)
            : lengthGuide.minutes,
      };

      return res.json({ story });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Story generation error:', message);

      if (message.includes('MISSING_API_KEY')) {
        return res.status(503).json({
          error:
            'Gemini API key is not configured yet. Please set GEMINI_API_KEY in Settings > Secrets (or your local .env file) and restart the server.',
        });
      }
      if (message.includes('PERMISSION_DENIED') || message.includes('API_KEY_INVALID') || message.includes('403')) {
        return res.status(403).json({
          error:
            'Your Gemini API key could not be verified. Please check your GEMINI_API_KEY in Settings > Secrets.',
        });
      }
      if (message.includes('RESOURCE_EXHAUSTED') || message.includes('429')) {
        return res.status(429).json({
          error:
            'The storytelling magic is busy right now (rate limit reached). Please wait a moment and try again.',
        });
      }

      return res.status(500).json({
        error:
          'Something went wrong while crafting the story with Gemini AI. Please try again in a moment.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found. Run npm run build first.');
      }
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`StorySpark AI server listening on http://0.0.0.0:${port}`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start StorySpark AI server:', err);
  process.exit(1);
});
