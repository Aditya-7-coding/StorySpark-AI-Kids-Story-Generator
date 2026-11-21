import { useEffect, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  Check,
  Copy,
  Download,
  FileText,
  RefreshCw,
  Star,
  Volume2,
  VolumeX,
  Wand2,
} from 'lucide-react';
import {
  HERO_ILLUSTRATION,
  LANGUAGE_OPTIONS,
  buildSafeFilename,
  formatStoryAsPlainText,
  formatStoryAsPrintableHtml,
  getGenreOption,
  type GeneratedStory,
  type Genre,
  type StoryLanguage,
  type StoryLength,
} from '../types/story';
import { StoryIllustration } from './StoryIllustration';

interface StoryReaderProps {
  story: GeneratedStory | null;
  isLoading: boolean;
  error: string | null;
  pendingMeta: {
    childName: string;
    genre: Genre;
    length: StoryLength;
    language: StoryLanguage;
  };
  onRegenerate: () => void;
  onRetry: () => void;
  onFillExampleInputs: () => void;
}

type FontScale = 'normal' | 'large' | 'xlarge';

const FONT_SCALE_CLASSES: Record<FontScale, string> = {
  normal: 'text-[16px] leading-[1.85]',
  large: 'text-[18px] leading-[1.9]',
  xlarge: 'text-[20px] leading-[1.95]',
};

export function StoryReader({
  story,
  isLoading,
  error,
  pendingMeta,
  onRegenerate,
  onRetry,
  onFillExampleInputs,
}: StoryReaderProps) {
  const [copied, setCopied] = useState(false);
  const [downloadedLabel, setDownloadedLabel] = useState<string | null>(null);
  const [fontScale, setFontScale] = useState<FontScale>('large');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const supportsSpeech =
    typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    setCopied(false);
    setDownloadedLabel(null);
    if (supportsSpeech) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [story, supportsSpeech]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCopyStory = async () => {
    if (!story) return;
    const text = formatStoryAsPlainText(story);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
    }
    window.setTimeout(() => setCopied(false), 2400);
  };

  const triggerBlobDownload = (content: string, mimeType: string, filename: string, label: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDownloadedLabel(label);
    window.setTimeout(() => setDownloadedLabel(null), 2400);
  };

  const handleDownloadTxt = () => {
    if (!story) return;
    // Include UTF-8 BOM so Hindi and Marathi Devanagari text opens cleanly on all devices.
    const content = `\uFEFF${formatStoryAsPlainText(story)}`;
    triggerBlobDownload(
      content,
      'text/plain;charset=utf-8',
      buildSafeFilename(story.title, 'txt'),
      'Saved .txt'
    );
  };

  const handleDownloadPrintable = () => {
    if (!story) return;
    const html = formatStoryAsPrintableHtml(story);
    triggerBlobDownload(
      html,
      'text/html;charset=utf-8',
      buildSafeFilename(story.title, 'html'),
      'Saved storybook'
    );
  };

  const handleToggleSpeech = () => {
    if (!story || !supportsSpeech) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const langMeta = LANGUAGE_OPTIONS.find((l) => l.id === story.meta.language);
    const fullText = [
      story.title,
      story.subtitle,
      ...story.paragraphs,
      `${story.moralTitle}. ${story.moralLesson}`,
    ]
      .filter(Boolean)
      .join('. ');

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = langMeta?.speechLang ?? 'en-US';
    utterance.rate = 0.94;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Loading State
  if (isLoading) {
    const genreInfo = getGenreOption(pendingMeta.genre);
    return (
      <section
        aria-live="polite"
        aria-busy="true"
        className="storybook-page flex min-h-[560px] flex-col justify-between overflow-hidden rounded-[28px] p-6 sm:p-10"
      >
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="animate-float-slow mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#EFE8FF] via-[#E1F3FF] to-[#FFF4D1] shadow-sm">
            <BookOpen className="h-9 w-9 text-[#6D4AFF]" aria-hidden="true" />
          </div>
          <h3 className="text-2xl font-bold text-[#241C3B]">
            Opening a brand-new storybook...
          </h3>
          <p className="mt-2 max-w-md text-[15px] text-[#5C5476]">
            Gemini AI is crafting a {pendingMeta.length.toLowerCase()}{' '}
            {genreInfo.label.toLowerCase()} story
            {pendingMeta.childName.trim()
              ? ` for ${pendingMeta.childName.trim()}`
              : ''}{' '}
            in {pendingMeta.language}.
          </p>

          <div className="mt-8 w-full max-w-lg space-y-3">
            <div className="h-4 w-3/4 mx-auto rounded-full bg-[#EFE9FC] animate-pulse" />
            <div className="h-3.5 w-full rounded-full bg-[#F4F0FD] animate-pulse" />
            <div className="h-3.5 w-11/12 rounded-full bg-[#EEF6FF] animate-pulse" />
            <div className="h-3.5 w-4/5 rounded-full bg-[#F4F0FD] animate-pulse" />
            <div className="h-3.5 w-5/6 rounded-full bg-[#FFF4DC] animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  // Error State
  if (error) {
    return (
      <section
        role="alert"
        className="storybook-page flex min-h-[480px] flex-col items-center justify-center rounded-[28px] p-8 text-center"
      >
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FEF2F2] text-[#DC2626]">
          <AlertCircle className="h-7 w-7" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-bold text-[#241C3B]">
          Story couldn&apos;t be generated right now
        </h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-[#5C5476]">
          {error}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="clay-button-primary mt-6 inline-flex min-h-[46px] cursor-pointer items-center gap-2 rounded-2xl px-6 py-2.5 text-sm font-bold text-white whitespace-nowrap"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          <span>Try Again</span>
        </button>
      </section>
    );
  }

  // Empty / Ready State
  if (!story) {
    return (
      <section className="storybook-page flex min-h-[560px] flex-col overflow-hidden rounded-[28px]">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#EFEAFF]">
          <StoryIllustration
            src={HERO_ILLUSTRATION.src}
            alt={HERO_ILLUSTRATION.alt}
            fallbackTitle="Your Magical Storybook Awaits"
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white via-white/40 to-transparent" />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-10 pt-4 text-center sm:px-10">
          <h3 className="max-w-lg text-balance text-2xl font-bold tracking-tight text-[#241C3B] sm:text-[28px]">
            Your personalized story will appear right here
          </h3>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[#5C5476]">
            Enter your child&apos;s name, choose a genre, add fun characters, and
            pick a gentle moral. StorySpark AI uses Gemini AI to write an
            original story in English, Hindi, or Marathi.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onFillExampleInputs}
              className="clay-button-secondary inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold text-[#4B2ED4] whitespace-nowrap"
            >
              <Wand2 className="h-4 w-4" aria-hidden="true" />
              <span>Try an Idea Prompt</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Generated Story Display
  const genreInfo = getGenreOption(story.meta.genre);
  const isDevanagari =
    story.meta.language === 'Hindi' || story.meta.language === 'Marathi';

  return (
    <article className="storybook-page overflow-hidden rounded-[28px]">
      {/* Storybook Scene Header Illustration */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#EFEAFF]">
        <StoryIllustration
          src={genreInfo.imageSrc}
          alt={genreInfo.imageAlt}
          fallbackTitle={story.title}
          fallbackGradient={genreInfo.fallbackGradient}
          className="h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/35 to-transparent" />
      </div>

      <div className="px-6 pb-8 pt-2 sm:px-10 sm:pb-10">
        {/* Clean Unboxed Metadata Row & Reading Utilities */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFE9FC] pb-4">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-[#6B6285]">
            <span className="font-semibold text-[#5A3AE0]">{story.meta.genre}</span>
            <span aria-hidden="true">·</span>
            <span>{story.meta.language}</span>
            <span aria-hidden="true">·</span>
            <span>
              For {story.meta.childName}, Age {story.meta.childAge}
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {story.readingTimeMinutes} min read
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Font size selector */}
            <div
              role="group"
              aria-label="Text size"
              className="flex items-center rounded-xl bg-[#F4F0FD] p-0.5"
            >
              {(['normal', 'large', 'xlarge'] as FontScale[]).map((size, idx) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setFontScale(size)}
                  aria-pressed={fontScale === size}
                  aria-label={`Set text size ${size}`}
                  className={`min-h-[32px] min-w-[32px] cursor-pointer rounded-lg px-2 text-xs font-bold transition-colors ${
                    fontScale === size
                      ? 'bg-white text-[#4B2ED4] shadow-xs'
                      : 'text-[#6A6185] hover:text-[#241C3B]'
                  }`}
                >
                  {idx === 0 ? 'A-' : idx === 1 ? 'A' : 'A+'}
                </button>
              ))}
            </div>

            {supportsSpeech && (
              <button
                type="button"
                onClick={handleToggleSpeech}
                className="clay-button-secondary inline-flex min-h-[34px] cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-[#3D2E6B] whitespace-nowrap shrink-0"
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="h-3.5 w-3.5 text-[#DC2626]" aria-hidden="true" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3.5 w-3.5 text-[#6D4AFF]" aria-hidden="true" />
                    <span>Read Aloud</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Title & Cozy Subtitle */}
        <header className="mt-6">
          <h2 className="text-balance text-2xl font-extrabold leading-tight tracking-tight text-[#241C3B] sm:text-4xl">
            {story.title}
          </h2>
          {story.subtitle && (
            <p className="mt-2.5 text-base leading-relaxed text-[#5C5476]">
              {story.subtitle}
            </p>
          )}
        </header>

        {/* Story Paragraphs */}
        <div
          lang={
            story.meta.language === 'Hindi'
              ? 'hi'
              : story.meta.language === 'Marathi'
                ? 'mr'
                : 'en'
          }
          className={`mt-7 max-w-[65ch] space-y-5 text-[#2B2344] ${FONT_SCALE_CLASSES[fontScale]} ${
            isDevanagari ? 'leading-[2.0]' : ''
          }`}
        >
          {story.paragraphs.map((paragraph, index) => (
            <p key={index} className="whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Gentle Storybook Ending Divider */}
        <div
          className="my-8 flex items-center justify-center gap-3 text-[#C8B9F6]"
          aria-hidden="true"
        >
          <span className="h-px w-16 bg-[#E9E1FC]" />
          <Star className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
          <span className="h-px w-16 bg-[#E9E1FC]" />
        </div>

        {/* Moral Keepsake Highlight */}
        <aside className="rounded-2xl border border-[#F3DFAD] bg-[#FFF8E4] p-5 sm:p-6">
          <div className="flex items-start gap-3.5">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFE9AF] text-[#9A6200]">
              <Star className="h-5 w-5 fill-current" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#8A5600]">
                {story.moralTitle}
              </h3>
              <p className="mt-1 text-[16px] leading-relaxed font-medium text-[#3D2A05]">
                {story.moralLesson}
              </p>
            </div>
          </div>
        </aside>

        {/* Action Buttons Bar: Regenerate, Copy, Download */}
        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-[#EFE9FC] pt-6">
          <button
            type="button"
            onClick={onRegenerate}
            className="clay-button-primary inline-flex min-h-[46px] cursor-pointer items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold text-white whitespace-nowrap shrink-0"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            <span>Regenerate Story</span>
          </button>

          <button
            type="button"
            onClick={handleCopyStory}
            className="clay-button-secondary inline-flex min-h-[46px] cursor-pointer items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold text-[#2E244D] whitespace-nowrap shrink-0"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-[#15803D]" aria-hidden="true" />
                <span className="text-[#15803D]">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-[#6D4AFF]" aria-hidden="true" />
                <span>Copy Story</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadTxt}
            className="clay-button-secondary inline-flex min-h-[46px] cursor-pointer items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold text-[#2E244D] whitespace-nowrap shrink-0"
          >
            <Download className="h-4 w-4 text-[#0284C7]" aria-hidden="true" />
            <span>
              {downloadedLabel === 'Saved .txt' ? 'Downloaded!' : 'Download Story'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPrintable}
            className="clay-button-secondary inline-flex min-h-[46px] cursor-pointer items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-[#5C5476] whitespace-nowrap shrink-0"
          >
            <FileText className="h-4 w-4 text-[#6D4AFF]" aria-hidden="true" />
            <span>
              {downloadedLabel === 'Saved storybook'
                ? 'Saved Book!'
                : 'Printable Book'}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}
