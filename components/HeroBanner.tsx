"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const slides = [
  {
    id: "cargo-drop",
    eyebrow: "New cargo round",
    title: "Pre-order Korean care, makeup, and snacks.",
    cta: "Shop now",
    imageSrc: "/image/hero01.png",
    imageAlt: "RUBHIW Korean skincare hero",
  },
  {
    id: "fresh-arrival",
    eyebrow: "Fresh arrival",
    title: "Discover curated Korean skincare for daily routines.",
    cta: "Shop now",
    imageSrc: "/image/hero.png",
    imageAlt: "RUBHIW Korean beauty collection",
  },
];

export function HeroBanner() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSlide((currentSlide) => (currentSlide + 1) % slides.length);
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <section className="mt-3">
      <div className="relative overflow-hidden rounded-[24px] border border-beige/50 bg-[#F7EFE4] shadow-soft">
        <div className="relative aspect-[16/10] w-full sm:aspect-[16/9]">
          {slides.map((slide, index) => {
            const isActive = index === activeSlide;

            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-500 ${isActive ? "opacity-100" : "pointer-events-none opacity-0"}`}
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
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-[rgba(74,67,59,0.32)] to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 pb-10">
                  <div className="max-w-[14rem]">
                    <p className="text-sm font-medium text-[#F6EEE4]">{slide.eyebrow}</p>
                    <h2 className="mt-2 text-[1.45rem] font-semibold leading-tight text-white">{slide.title}</h2>
                    <button className="mt-5 rounded-2xl bg-cream/95 px-5 py-3 text-sm font-semibold text-[#5A5249] shadow-soft">
                      {slide.cta}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                className={`block rounded-full transition-all ${index === activeSlide ? "h-1.5 w-4 bg-white" : "h-1.5 w-1.5 bg-white/50"}`}
                aria-label={`Go to hero slide ${index + 1}`}
                aria-pressed={index === activeSlide}
                onClick={() => setActiveSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
