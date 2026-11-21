import { useState } from 'react';
import { BookOpen, Cloud, Star } from 'lucide-react';

interface StoryIllustrationProps {
  src: string;
  alt: string;
  fallbackTitle: string;
  fallbackGradient?: string;
  className?: string;
}

export function StoryIllustration({
  src,
  alt,
  fallbackTitle,
  fallbackGradient = 'from-[#E9E1FF] via-[#D8EEFF] to-[#FFF6DE]',
  className = '',
}: StoryIllustrationProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br ${fallbackGradient} text-[#3D2E6B] ${className}`}
      >
        <Cloud className="absolute -left-4 top-4 h-16 w-16 text-white/60" aria-hidden="true" />
        <Cloud className="absolute -right-3 bottom-5 h-20 w-20 text-white/55" aria-hidden="true" />
        <Star className="absolute right-10 top-6 h-5 w-5 text-[#F59E0B]/70" aria-hidden="true" />
        <div className="relative z-10 flex flex-col items-center gap-2 px-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
            <BookOpen className="h-6 w-6 text-[#6D4AFF]" aria-hidden="true" />
          </div>
          <span className="text-sm font-semibold">{fallbackTitle}</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
