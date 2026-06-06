"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

export function HeroBanner() {
  const { t } = useI18n();
  const slides = t.hero;
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reduceMotionQuery.matches) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveSlide((currentSlide) => (currentSlide + 1) % slides.length);
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, [slides.length]);

  return (
    <section className="mt-3">
      <div className="relative overflow-hidden rounded-[22px] border border-beige/50 bg-[#F7EFE4] shadow-soft sm:rounded-[24px]">
        <div className="relative aspect-[16/8.4] w-full sm:aspect-[16/9]">
          {slides.map((slide, index) => {
            const isActive = index === activeSlide;

            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-500 ease-[var(--ease-out-ui)] ${isActive ? "opacity-100" : "pointer-events-none opacity-0"}`}
                aria-hidden={!isActive}
              >
                <Image
                  priority={index === 0}
                  fill
                  sizes="(max-width: 768px) 100vw, 420px"
                  src={slide.imageSrc}
                  alt={slide.imageAlt}
                  className="object-cover object-right-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-ink/65 via-[rgba(74,67,59,0.32)] to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ink/25 to-transparent" />
                <div className="absolute inset-y-0 left-0 flex items-center p-4 sm:p-5">
                  <div className="max-w-[12.5rem] sm:max-w-[14rem]">
                    <p className="text-xs font-medium text-[#F6EEE4] sm:text-sm">{slide.eyebrow}</p>
                    <h2 className="mt-1 text-[1.22rem] font-semibold leading-[1.18] text-cream sm:mt-1.5 sm:text-[1.4rem]">{slide.title}</h2>
                    <button className="mt-3 min-h-11 rounded-2xl bg-cream/95 px-4 py-2.5 text-sm font-semibold text-[#5A5249] shadow-soft transition-transform duration-200 ease-[var(--ease-out-ui)] active:scale-[0.98] sm:mt-4 sm:px-5 sm:py-3">
                      {slide.cta}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-ink/12 px-1.5 py-1 backdrop-blur-[1px]">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                className="grid h-5 w-5 place-items-center rounded-full transition-transform duration-200 ease-[var(--ease-out-ui)] active:scale-[0.92]"
                aria-label={t.heroSlideLabel(index + 1)}
                aria-pressed={index === activeSlide}
                onClick={() => setActiveSlide(index)}
              >
                <span className={`block rounded-full transition-all duration-200 ease-[var(--ease-out-ui)] ${index === activeSlide ? "h-1.5 w-4 bg-cream" : "h-1.5 w-1.5 bg-cream/55"}`} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
