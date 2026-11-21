import { useRef, useState, type FormEvent } from 'react';
import { BookOpen, Cloud, Sparkles, Star } from 'lucide-react';
import {
  CUSTOM_MORAL_VALUE,
  StoryForm,
  type StoryFormState,
} from './components/StoryForm';
import { StoryIllustration } from './components/StoryIllustration';
import { StoryReader } from './components/StoryReader';
import {
  HERO_ILLUSTRATION,
  MORAL_PRESETS,
  type GeneratedStory,
  type StoryRequest,
} from './types/story';

const INITIAL_FORM: StoryFormState = {
  childName: '',
  childAge: 6,
  genre: 'Fantasy',
  characters: '',
  moralPreset: MORAL_PRESETS[0],
  customMoral: '',
  length: 'Medium',
  language: 'English',
};

const SAMPLE_PROMPT_IDEAS: StoryFormState[] = [
  {
    childName: 'Maya',
    childAge: 6,
    genre: 'Space',
    characters: 'a curious little puppy in a tiny space helmet and a glowing star',
    moralPreset: MORAL_PRESETS[2],
    customMoral: '',
    length: 'Medium',
    language: 'English',
  },
  {
    childName: 'Aarav',
    childAge: 7,
    genre: 'Fantasy',
    characters: 'एक नन्हा बादल, एक दयालु उल्लू और जादुई किताब',
    moralPreset: MORAL_PRESETS[0],
    customMoral: '',
    length: 'Short',
    language: 'Hindi',
  },
  {
    childName: 'Ananya',
    childAge: 5,
    genre: 'Animals',
    characters: 'एक चपळ ससा, एक गोड चिमणी आणि एक छोटं कोल्होबा',
    moralPreset: MORAL_PRESETS[3],
    customMoral: '',
    length: 'Medium',
    language: 'Marathi',
  },
];

export default function App() {
  const [form, setForm] = useState<StoryFormState>(INITIAL_FORM);
  const [story, setStory] = useState<GeneratedStory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [ideaIndex, setIdeaIndex] = useState(0);

  const studioRef = useRef<HTMLDivElement | null>(null);
  const readerRef = useRef<HTMLDivElement | null>(null);

  const handleFieldChange = <K extends keyof StoryFormState>(
    key: K,
    value: StoryFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (validationError) setValidationError(null);
  };

  const getEffectiveMoral = (state: StoryFormState): string => {
    if (state.moralPreset === CUSTOM_MORAL_VALUE) {
      return state.customMoral.trim();
    }
    return state.moralPreset.trim();
  };

  const requestStory = async (isRegenerate = false) => {
    const trimmedName = form.childName.trim();
    const effectiveMoral = getEffectiveMoral(form);

    if (!trimmedName) {
      setValidationError("Please enter the child's name before generating a story.");
      return;
    }

    if (!effectiveMoral) {
      setValidationError('Please enter your custom moral or pick one from the list.');
      return;
    }

    setValidationError(null);
    setError(null);
    setIsLoading(true);

    if (window.innerWidth < 1024 && readerRef.current) {
      readerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    const payload: StoryRequest = {
      childName: trimmedName,
      childAge: form.childAge,
      genre: form.genre,
      characters: form.characters.trim(),
      moral: effectiveMoral,
      length: form.length,
      language: form.language,
      ...(isRegenerate
        ? {
            variationNonce: String(Date.now()),
            previousTitle: story?.title,
          }
        : {}),
    };

    try {
      const response = await fetch('/api/stories/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        story?: {
          title: string;
          subtitle: string;
          paragraphs: string[];
          moralTitle: string;
          moralLesson: string;
          readingTimeMinutes: number;
        };
        error?: string;
      };

      if (!response.ok || !data.story) {
        throw new Error(
          data.error || 'Could not generate a story right now. Please try again.'
        );
      }

      setStory({
        ...data.story,
        meta: {
          childName: trimmedName,
          childAge: form.childAge,
          genre: form.genre,
          characters: form.characters.trim(),
          moral: effectiveMoral,
          length: form.length,
          language: form.language,
        },
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'A network error occurred while reaching StorySpark AI.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void requestStory(false);
  };

  const handleResetToNewStory = () => {
    setStory(null);
    setError(null);
    setValidationError(null);
    studioRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const nameInput = document.getElementById('child-name');
    if (nameInput instanceof HTMLInputElement) {
      window.setTimeout(() => nameInput.focus(), 300);
    }
  };

  const handleFillExampleInputs = () => {
    const idea = SAMPLE_PROMPT_IDEAS[ideaIndex % SAMPLE_PROMPT_IDEAS.length];
    setForm(idea);
    setIdeaIndex((prev) => prev + 1);
    setValidationError(null);
    setError(null);
    studioRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="storybook-sky-bg min-h-screen text-[#241C3B]">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 border-b border-[#EAE3FA]/80 bg-[#FFFBF2]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-8 px-5 py-3.5 sm:px-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <a
            href="#top"
            className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-[#241C3B] whitespace-nowrap shrink-0"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C5CFF] to-[#38BDF8] text-white shadow-sm">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>StorySpark AI</span>
          </a>

          {/* Zone 2: Concise single-line navigation links */}
          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-7 text-sm font-semibold text-[#5C5476] md:flex"
          >
            <a
              href="#create-story"
              className="transition-colors hover:text-[#6D4AFF] whitespace-nowrap shrink-0"
            >
              Create Story
            </a>
            <a
              href="#storybook"
              className="transition-colors hover:text-[#6D4AFF] whitespace-nowrap shrink-0"
            >
              Storybook
            </a>
            <a
              href="#how-it-works"
              className="transition-colors hover:text-[#6D4AFF] whitespace-nowrap shrink-0"
            >
              How It Works
            </a>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleResetToNewStory}
              className="clay-button-primary cursor-pointer rounded-xl px-4 py-2 text-xs font-bold text-white sm:text-sm whitespace-nowrap shrink-0"
            >
              New Story
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="mx-auto max-w-[1280px] px-5 pb-20 pt-8 sm:px-8 sm:pt-12">
        {/* Compact Joyful Storybook Hero */}
        <section className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
          <div className="flex flex-col justify-center lg:col-span-6">
            <p className="text-sm font-semibold text-[#5A3AE0]">
              Personalized Bedtime &amp; Moral Stories for Kids
            </p>
            <h1 className="mt-3 max-w-xl text-balance text-4xl font-extrabold leading-[1.12] tracking-tight text-[#241C3B] sm:text-5xl">
              Spark magical stories made just for your child
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-[#5C5476] sm:text-[17px]">
              Turn your child&apos;s name, favorite characters, and a meaningful
              lesson into a warm, age-appropriate storybook in English, Hindi,
              or Marathi—freshly written with Gemini AI.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <a
                href="#create-story"
                className="clay-button-primary inline-flex min-h-[50px] items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white whitespace-nowrap"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                <span>Start Creating</span>
              </a>
              <button
                type="button"
                onClick={handleFillExampleInputs}
                className="clay-button-secondary inline-flex min-h-[50px] cursor-pointer items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-[#3F3170] whitespace-nowrap"
              >
                <span>Load Fun Idea</span>
              </button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-[#6B6285]">
              <span>6 Story Worlds</span>
              <span aria-hidden="true">·</span>
              <span>English, Hindi &amp; Marathi</span>
              <span aria-hidden="true">·</span>
              <span>Copy &amp; Download Ready</span>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="storybook-card relative h-full min-h-[260px] overflow-hidden rounded-[30px] p-2.5">
              <StoryIllustration
                src={HERO_ILLUSTRATION.src}
                alt={HERO_ILLUSTRATION.alt}
                fallbackTitle="StorySpark AI Magical Storybook"
                className="h-full w-full rounded-[22px] object-cover"
              />
            </div>
          </div>
        </section>

        {/* Main Two-Zone Story Studio */}
        <section
          ref={studioRef}
          id="create-story"
          className="mt-14 grid scroll-mt-24 grid-cols-1 items-start gap-8 lg:grid-cols-12"
        >
          <div className="lg:col-span-5">
            <StoryForm
              form={form}
              isLoading={isLoading}
              validationError={validationError}
              onChange={handleFieldChange}
              onSubmit={handleSubmit}
            />
          </div>

          <div ref={readerRef} id="storybook" className="scroll-mt-24 lg:col-span-7">
            <StoryReader
              story={story}
              isLoading={isLoading}
              error={error}
              pendingMeta={{
                childName: form.childName,
                genre: form.genre,
                length: form.length,
                language: form.language,
              }}
              onRegenerate={() => void requestStory(true)}
              onRetry={() => void requestStory(false)}
              onFillExampleInputs={handleFillExampleInputs}
            />
          </div>
        </section>

        {/* Simple Beginner-Friendly Guide */}
        <section
          id="how-it-works"
          className="mt-20 scroll-mt-24 border-t border-[#EAE3FA] pt-14"
        >
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold tracking-tight text-[#241C3B] sm:text-3xl">
              Three easy steps to storytime
            </h2>
            <p className="mt-2 text-[15px] text-[#5C5476]">
              Designed so parents and kids can build cozy tales together in
              seconds.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="storybook-card rounded-3xl p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EFE8FF] text-[#5C3AE0]">
                <Star className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-[#241C3B]">
                01. Personalize the Hero
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5C5476]">
                Type your child&apos;s name and age so Gemini AI naturally tunes
                the vocabulary, pacing, and wonder to match them.
              </p>
            </div>

            <div className="storybook-card rounded-3xl p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E4F4FF] text-[#0369A1]">
                <Cloud className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-[#241C3B]">
                02. Pick World, Moral &amp; Language
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5C5476]">
                Choose from six cheerful genres, add favorite characters, pick a
                gentle lesson, and select English, Hindi, or Marathi.
              </p>
            </div>

            <div className="storybook-card rounded-3xl p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF3D1] text-[#9A6200]">
                <BookOpen className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-[#241C3B]">
                03. Read, Regenerate &amp; Save
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5C5476]">
                Read aloud together, spin a fresh version anytime, copy the text
                in one click, or download a storybook keepsake.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#EAE3FA] bg-[#FFFDF8]">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-3 px-5 py-6 text-xs text-[#6B6285] sm:flex-row sm:px-8">
          <p className="font-semibold text-[#3F365E]">
            StorySpark AI – Story Generator for Kids
          </p>
          <p>Wholesome, age-appropriate stories crafted with Gemini AI</p>
        </div>
      </footer>
    </div>
  );
}
