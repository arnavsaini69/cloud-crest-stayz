import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  Star,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Pause,
  Play,
  Quote,
} from 'lucide-react';
import type { GuestReview, RatingBreakdown } from '../data/stays';

interface TestimonialsCarouselProps {
  stayName: string;
  rating: number;
  reviewsCount: number;
  ratingBreakdown?: RatingBreakdown;
  reviews: GuestReview[];
}

export const TestimonialsCarousel: React.FC<TestimonialsCarouselProps> = ({
  stayName,
  rating,
  reviewsCount,
  ratingBreakdown,
  reviews,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const pointerStartX = useRef<number | null>(null);

  // Reset to first review whenever switching to a different stay
  useEffect(() => {
    setActiveIndex(0);
    setDirection(1);
    setIsAutoPlaying(false);
  }, [stayName]);

  const total = reviews.length;

  const goToIndex = useCallback(
    (nextIdx: number) => {
      if (total <= 1) return;
      const normalized = ((nextIdx % total) + total) % total;
      if (normalized === activeIndex) return;
      setDirection(nextIdx > activeIndex || (activeIndex === total - 1 && normalized === 0) ? 1 : -1);
      setActiveIndex(normalized);
    },
    [activeIndex, total]
  );

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (!isAutoPlaying || isHovered || shouldReduceMotion || total <= 1) {
      return;
    }
    const timer = window.setInterval(() => {
      handleNext();
    }, 6000);
    return () => window.clearInterval(timer);
  }, [isAutoPlaying, isHovered, shouldReduceMotion, total, handleNext]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerStartX.current = e.clientX;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerStartX.current === null) return;
    const deltaX = e.clientX - pointerStartX.current;
    pointerStartX.current = null;
    if (Math.abs(deltaX) > 48) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  if (total === 0) {
    return (
      <section
        aria-label={`Guest reviews for ${stayName}`}
        className="border-t border-stone-800 pt-8"
      >
        <h3 className="font-serif text-2xl font-semibold text-stone-100">
          Guest Voices
        </h3>
        <p className="mt-2 text-sm text-stone-400">
          No guest reviews recorded for this sanctuary yet. Reserve your stay to leave the inaugural review.
        </p>
      </section>
    );
  }

  const currentReview = reviews[activeIndex] ?? reviews[0];
  const slideOffset = shouldReduceMotion ? 0 : direction * 24;

  const formatCounter = (num: number) => String(num).padStart(2, '0');

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label={`Guest reviews for ${stayName}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="border-t border-stone-800 pt-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 rounded-xl"
    >
      {/* Header & Aggregate Rating Summary */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-medium tracking-wider text-amber-400 mb-1.5">
            Verified Guest Impressions
          </p>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-100 tracking-tight">
              <span className="tabular-nums">{rating.toFixed(2)}</span>
            </h3>
            <div className="flex items-center gap-1" aria-label={`Rated ${rating} out of 5 stars`}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-stone-700'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-stone-400 tabular-nums">
              <span aria-hidden="true">·</span> {reviewsCount} verified stays
            </span>
          </div>

          {/* Unboxed category scores with typographic separators */}
          {ratingBreakdown && (
            <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-stone-400 tabular-nums">
              <span>Views {ratingBreakdown.views.toFixed(2)}</span>
              <span aria-hidden="true">·</span>
              <span>Cleanliness {ratingBreakdown.cleanliness.toFixed(2)}</span>
              <span aria-hidden="true">·</span>
              <span>Comfort {ratingBreakdown.comfort.toFixed(2)}</span>
              <span aria-hidden="true">·</span>
              <span>Hospitality {ratingBreakdown.hospitality.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Carousel Pagination & Playback Controls */}
        {total > 1 && (
          <div className="flex items-center gap-2 shrink-0">
            <span
              className="text-xs font-medium text-stone-400 tabular-nums mr-1 select-none"
              aria-live="polite"
            >
              {formatCounter(activeIndex + 1)} / {formatCounter(total)}
            </span>

            <button
              type="button"
              onClick={() => setIsAutoPlaying((prev) => !prev)}
              aria-label={isAutoPlaying ? 'Pause review slideshow' : 'Auto-play reviews'}
              title={isAutoPlaying ? 'Pause slideshow' : 'Auto-play reviews'}
              className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-lg border border-stone-800 bg-stone-900/80 text-stone-400 hover:text-stone-100 hover:border-stone-700 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              {isAutoPlaying ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous guest review"
              className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-lg border border-stone-800 bg-stone-900/80 text-stone-300 hover:text-amber-300 hover:border-amber-500/40 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next guest review"
              className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-lg border border-stone-800 bg-stone-900/80 text-stone-300 hover:text-amber-300 hover:border-amber-500/40 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Active Review Slide */}
      <div
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className="relative overflow-hidden rounded-xl border border-stone-800 bg-stone-900/50 touch-pan-y select-text"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.article
            key={currentReview.id}
            initial={{ opacity: 0, x: slideOffset }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -slideOffset }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.2,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="p-6 sm:p-7"
          >
            {/* Review Rating & Unboxed Stay Context */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-stone-800/80">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5" aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        star <= Math.round(currentReview.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-stone-700'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-amber-300 tabular-nums">
                  {currentReview.rating.toFixed(1)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-400">
                <span className="text-stone-300 font-medium">{currentReview.highlight}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">
                  {currentReview.nightsStayed} nights in {currentReview.stayDate}
                </span>
              </div>
            </div>

            {/* Testimonial Prose */}
            <blockquote className="mt-5 relative">
              <Quote
                aria-hidden="true"
                className="w-5 h-5 text-amber-500/40 mb-2.5"
              />
              <p className="text-[15px] sm:text-base text-stone-200 leading-relaxed tracking-[0.01em]">
                {currentReview.quote}
              </p>
            </blockquote>

            {/* Attributable Guest Footer */}
            <footer className="mt-6 pt-4 border-t border-stone-800/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  aria-hidden="true"
                  className="w-10 h-10 rounded-full bg-stone-950 border border-stone-700 flex items-center justify-center font-serif text-sm font-semibold text-amber-300 shrink-0"
                >
                  {currentReview.guestInitials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-stone-100">
                    {currentReview.guestName}
                  </div>
                  <div className="text-xs text-stone-400">
                    {currentReview.guestRole} <span aria-hidden="true">·</span> {currentReview.guestCity}
                  </div>
                </div>
              </div>

              {currentReview.verifiedStay && (
                <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Verified Guest</span>
                </div>
              )}
            </footer>
          </motion.article>
        </AnimatePresence>
      </div>

      {/* Step Indicators & Direct Guest Quick-Select */}
      {total > 1 && (
        <div
          className="mt-4 flex flex-wrap items-center justify-between gap-3"
          aria-label="Choose a guest review"
        >
          <div className="flex items-center gap-1.5" role="tablist" aria-label="Review slides">
            {reviews.map((rev, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={rev.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Review ${idx + 1} by ${rev.guestName}`}
                  onClick={() => goToIndex(idx)}
                  className="min-h-[40px] px-1 flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
                >
                  <span
                    className={`block h-1.5 rounded-full transition-all duration-200 ${
                      isActive
                        ? 'w-7 bg-amber-400'
                        : 'w-2 bg-stone-700 hover:bg-stone-500'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <span className="text-xs text-stone-500 hidden sm:inline">
            Swipe or use arrow keys to browse reviews
          </span>
        </div>
      )}
    </section>
  );
};
