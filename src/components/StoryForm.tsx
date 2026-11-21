import type { FormEvent } from 'react';
import {
  Compass,
  Heart,
  Loader2,
  Minus,
  Moon,
  PawPrint,
  Plus,
  Rocket,
  Sparkles,
  Wand2,
} from 'lucide-react';
import {
  CHARACTER_IDEAS,
  GENRE_OPTIONS,
  LANGUAGE_OPTIONS,
  LENGTH_OPTIONS,
  MORAL_PRESETS,
  type Genre,
  type StoryLanguage,
  type StoryLength,
} from '../types/story';

export interface StoryFormState {
  childName: string;
  childAge: number;
  genre: Genre;
  characters: string;
  moralPreset: string;
  customMoral: string;
  length: StoryLength;
  language: StoryLanguage;
}

interface StoryFormProps {
  form: StoryFormState;
  isLoading: boolean;
  validationError: string | null;
  onChange: <K extends keyof StoryFormState>(key: K, value: StoryFormState[K]) => void;
  onSubmit: (e: FormEvent) => void;
}

const GENRE_ICONS: Record<Genre, typeof Sparkles> = {
  Fantasy: Wand2,
  Bedtime: Moon,
  Adventure: Compass,
  Friendship: Heart,
  Animals: PawPrint,
  Space: Rocket,
};

export const CUSTOM_MORAL_VALUE = '__CUSTOM__';

export function StoryForm({
  form,
  isLoading,
  validationError,
  onChange,
  onSubmit,
}: StoryFormProps) {
  const handleAddCharacterIdea = (idea: string) => {
    const current = form.characters.trim();
    if (!current) {
      onChange('characters', idea);
      return;
    }
    if (current.toLowerCase().includes(idea.toLowerCase())) {
      return;
    }
    onChange('characters', `${current}, ${idea}`);
  };

  const adjustAge = (delta: number) => {
    const nextAge = Math.min(16, Math.max(1, form.childAge + delta));
    onChange('childAge', nextAge);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="storybook-card rounded-[28px] p-6 sm:p-8"
      noValidate
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-[#241C3B]">
          Create Your Story
        </h2>
        <p className="mt-1 text-sm text-[#5C5476]">
          Pick a name, world, friends, and lesson to weave a one-of-a-kind tale.
        </p>
      </div>

      {/* 1. Child's Name & Age */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
        <div className="sm:col-span-7">
          <label
            htmlFor="child-name"
            className="mb-1.5 block text-sm font-semibold text-[#2E244D]"
          >
            Child&apos;s Name
          </label>
          <input
            id="child-name"
            type="text"
            value={form.childName}
            onChange={(e) => onChange('childName', e.target.value)}
            placeholder="e.g., Aarav, Maya, Kabir"
            maxLength={60}
            required
            className="min-h-[46px] w-full rounded-2xl border border-[#DDD5F8] bg-[#FCFBF9] px-4 py-2.5 text-[15px] text-[#241C3B] placeholder:text-[#968EAF] transition-colors focus:border-[#6D4AFF] focus:bg-white focus:outline-none focus:ring-3 focus:ring-[#6D4AFF]/15"
          />
        </div>

        <div className="sm:col-span-5">
          <label
            htmlFor="child-age"
            className="mb-1.5 block text-sm font-semibold text-[#2E244D]"
          >
            Age (years)
          </label>
          <div className="flex min-h-[46px] items-center rounded-2xl border border-[#DDD5F8] bg-[#FCFBF9] px-1.5 transition-colors focus-within:border-[#6D4AFF] focus-within:bg-white focus-within:ring-3 focus-within:ring-[#6D4AFF]/15">
            <button
              type="button"
              onClick={() => adjustAge(-1)}
              disabled={form.childAge <= 1}
              aria-label="Decrease age"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#5C5476] transition-colors hover:bg-[#EFEAFF] hover:text-[#4F32C8] disabled:opacity-40"
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <input
              id="child-age"
              type="number"
              min={1}
              max={16}
              value={form.childAge}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (!Number.isNaN(val)) {
                  onChange('childAge', Math.min(16, Math.max(1, val)));
                }
              }}
              className="w-full bg-transparent text-center text-[15px] font-semibold tabular-nums text-[#241C3B] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => adjustAge(1)}
              disabled={form.childAge >= 16}
              aria-label="Increase age"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#5C5476] transition-colors hover:bg-[#EFEAFF] hover:text-[#4F32C8] disabled:opacity-40"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <hr className="my-6 border-[#EFE9FC]" />

      {/* 2. Story Genre */}
      <div>
        <span className="mb-2.5 block text-sm font-semibold text-[#2E244D]">
          Story Genre
        </span>
        <div
          role="radiogroup"
          aria-label="Story genre"
          className="grid grid-cols-2 gap-2.5 sm:grid-cols-3"
        >
          {GENRE_OPTIONS.map((item) => {
            const Icon = GENRE_ICONS[item.id];
            const isSelected = form.genre === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onChange('genre', item.id)}
                className={`group flex min-h-[54px] items-center gap-2.5 rounded-2xl border px-3.5 py-2.5 text-left transition-all focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#6D4AFF]/30 ${
                  isSelected
                    ? 'border-[#6D4AFF] bg-[#F2ECFF] text-[#3B219B] shadow-[0_3px_0_rgba(109,74,255,0.2)]'
                    : 'border-[#E6DFF8] bg-[#FCFBF9] text-[#3F365E] hover:border-[#C7B7FA] hover:bg-[#F8F5FF]'
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    isSelected
                      ? 'bg-[#6D4AFF] text-white'
                      : 'bg-[#EBF4FF] text-[#2878B5] group-hover:bg-[#E7DFFF] group-hover:text-[#5C3BE0]'
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="truncate text-sm font-semibold whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <hr className="my-6 border-[#EFE9FC]" />

      {/* 3. Characters */}
      <div>
        <label
          htmlFor="story-characters"
          className="mb-1.5 block text-sm font-semibold text-[#2E244D]"
        >
          Story Characters
        </label>
        <input
          id="story-characters"
          type="text"
          value={form.characters}
          onChange={(e) => onChange('characters', e.target.value)}
          placeholder="e.g., a curious fox, a tiny bluebird, and a friendly cloud"
          maxLength={240}
          className="min-h-[46px] w-full rounded-2xl border border-[#DDD5F8] bg-[#FCFBF9] px-4 py-2.5 text-[15px] text-[#241C3B] placeholder:text-[#968EAF] transition-colors focus:border-[#6D4AFF] focus:bg-white focus:outline-none focus:ring-3 focus:ring-[#6D4AFF]/15"
        />
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-medium text-[#756C91]">
            Quick add:
          </span>
          {CHARACTER_IDEAS.map((idea) => (
            <button
              key={idea}
              type="button"
              onClick={() => handleAddCharacterIdea(idea)}
              className="rounded-lg bg-[#EEF6FF] px-2.5 py-1 text-xs font-medium text-[#1E5D94] transition-colors hover:bg-[#DCEEFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] whitespace-nowrap shrink-0"
            >
              + {idea}
            </button>
          ))}
        </div>
      </div>

      <hr className="my-6 border-[#EFE9FC]" />

      {/* 4. Moral or Lesson */}
      <div>
        <label
          htmlFor="story-moral"
          className="mb-1.5 block text-sm font-semibold text-[#2E244D]"
        >
          Moral or Lesson
        </label>
        <select
          id="story-moral"
          value={form.moralPreset}
          onChange={(e) => onChange('moralPreset', e.target.value)}
          className="min-h-[46px] w-full rounded-2xl border border-[#DDD5F8] bg-[#FCFBF9] px-4 py-2.5 text-[15px] text-[#241C3B] transition-colors focus:border-[#6D4AFF] focus:bg-white focus:outline-none focus:ring-3 focus:ring-[#6D4AFF]/15"
        >
          {MORAL_PRESETS.map((preset) => (
            <option key={preset} value={preset}>
              {preset}
            </option>
          ))}
          <option value={CUSTOM_MORAL_VALUE}>Write my own custom moral...</option>
        </select>

        {form.moralPreset === CUSTOM_MORAL_VALUE && (
          <input
            type="text"
            aria-label="Custom moral or lesson"
            value={form.customMoral}
            onChange={(e) => onChange('customMoral', e.target.value)}
            placeholder="e.g., Sharing toys makes playtime twice as fun"
            maxLength={180}
            className="mt-2.5 min-h-[46px] w-full rounded-2xl border border-[#DDD5F8] bg-white px-4 py-2.5 text-[15px] text-[#241C3B] placeholder:text-[#968EAF] transition-colors focus:border-[#6D4AFF] focus:outline-none focus:ring-3 focus:ring-[#6D4AFF]/15"
          />
        )}
      </div>

      <hr className="my-6 border-[#EFE9FC]" />

      {/* 5. Story Length & 6. Language */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <span className="mb-2 block text-sm font-semibold text-[#2E244D]">
            Story Length
          </span>
          <div
            role="radiogroup"
            aria-label="Story length"
            className="grid grid-cols-3 gap-1.5 rounded-2xl bg-[#F4F0FD] p-1.5"
          >
            {LENGTH_OPTIONS.map((opt) => {
              const active = form.length === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onChange('length', opt.id)}
                  className={`flex min-h-[42px] flex-col items-center justify-center rounded-xl px-2 py-1.5 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6D4AFF] whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-white text-[#3B219B] shadow-sm'
                      : 'text-[#5C5476] hover:text-[#241C3B]'
                  }`}
                >
                  <span className="text-xs font-bold leading-tight">{opt.label}</span>
                  <span className="text-[11px] text-[#7D749A] tabular-nums">
                    {opt.detail}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <span className="mb-2 block text-sm font-semibold text-[#2E244D]">
            Language
          </span>
          <div
            role="radiogroup"
            aria-label="Story language"
            className="grid grid-cols-3 gap-1.5 rounded-2xl bg-[#EAF5FF] p-1.5"
          >
            {LANGUAGE_OPTIONS.map((opt) => {
              const active = form.language === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onChange('language', opt.id)}
                  className={`flex min-h-[42px] flex-col items-center justify-center rounded-xl px-2 py-1.5 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-white text-[#0B5587] shadow-sm'
                      : 'text-[#4B647D] hover:text-[#1D354D]'
                  }`}
                >
                  <span className="text-xs font-bold leading-tight">{opt.label}</span>
                  <span className="text-[11px] opacity-80">{opt.native}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {validationError && (
        <div
          role="alert"
          className="mt-5 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm font-medium text-[#991B1B]"
        >
          {validationError}
        </div>
      )}

      {/* 7. Generate Story CTA */}
      <button
        type="submit"
        disabled={isLoading}
        className="clay-button-primary mt-6 flex min-h-[54px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl px-6 py-3.5 text-base font-bold text-white disabled:cursor-not-allowed disabled:opacity-70 whitespace-nowrap"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            <span>Writing Your Story...</span>
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" aria-hidden="true" />
            <span>Generate Story</span>
          </>
        )}
      </button>
    </form>
  );
}
