'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface SectionCard {
  title: string;
  description: string;
  image: string;
  link: string;
  buttonText: string;
}

interface MobileCardCarouselProps {
  sections: SectionCard[];
}

const MAROON = '#5c1a1a';

export default function MobileCardCarousel({ sections }: MobileCardCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Auto-advance
  useEffect(() => {
    if (isPaused || sections.length <= 1) return;
    const id = setInterval(() => {
      setCurrentIndex(i => (i + 1) % sections.length);
    }, 4500);
    return () => clearInterval(id);
  }, [isPaused, sections.length]);

  const goTo = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 8000);
  }, []);

  const goPrev = useCallback(() => goTo(currentIndex === 0 ? sections.length - 1 : currentIndex - 1), [currentIndex, sections.length, goTo]);
  const goNext = useCallback(() => goTo((currentIndex + 1) % sections.length), [currentIndex, sections.length, goTo]);

  // Touch/swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Only treat as horizontal swipe if mostly horizontal
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const section = sections[currentIndex];

  return (
    <div
      className="md:hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md">
        {/* Prev / Next arrows */}
        {sections.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
              aria-label="Previous"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
              aria-label="Next"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Slide counter badge */}
        <div className="absolute top-3 right-3 z-10 bg-black/50 text-white text-xs font-medium px-2 py-0.5 rounded-full">
          {currentIndex + 1}/{sections.length}
        </div>

        <Link href={section.link} className="block group">
          {/* Image */}
          <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
            <Image
              key={section.image}
              src={section.image}
              alt={section.title}
              fill
              className="object-cover transition-transform duration-500 group-active:scale-105"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>

          {/* Text */}
          <div className="p-4">
            <h3 className="text-lg font-bold mb-1.5 text-gray-900 dark:text-white">
              {section.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3 line-clamp-2">
              {section.description}
            </p>
            <span
              className="inline-flex items-center text-sm font-semibold gap-1"
              style={{ color: MAROON }}
            >
              {section.buttonText}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </Link>
      </div>

      {/* Dot navigation */}
      {sections.length > 1 && (
        <div className="flex justify-center mt-3 gap-2">
          {sections.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === currentIndex ? 'true' : 'false'}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: i === currentIndex ? 24 : 8,
                backgroundColor: i === currentIndex ? MAROON : '#d1d5db',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
