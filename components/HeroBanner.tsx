import Image from "next/image";

const slides = [
  {
    id: "cargo-drop",
    eyebrow: "New cargo round",
    title: "Pre-order Korean care, makeup, and snacks.",
    cta: "Shop now",
    imageSrc: "/image/hero01.png",
    imageAlt: "RUBHIW hero collection",
  },
];

export function HeroBanner() {
  return (
    <section className="mt-3">
      <div className="relative overflow-hidden rounded-[24px] border border-beige/50 bg-[#F7EFE4] shadow-soft">
        <div className="relative aspect-[16/10] w-full sm:aspect-[16/9]">
          <Image
            priority
            fill
            sizes="(max-width: 768px) 100vw, 420px"
            src={slides[0].imageSrc}
            alt={slides[0].imageAlt}
            className="object-cover object-right-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-[rgba(74,67,59,0.32)] to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 pb-10">
            <div className="max-w-[14rem]">
              <p className="text-sm font-medium text-[#F6EEE4]">{slides[0].eyebrow}</p>
              <h2 className="mt-2 text-[1.45rem] font-semibold leading-tight text-white">{slides[0].title}</h2>
              <button className="mt-5 rounded-2xl bg-cream/95 px-5 py-3 text-sm font-semibold text-[#5A5249] shadow-soft">
                {slides[0].cta}
              </button>
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
            {slides.map((slide, index) => (
              <span
                key={slide.id}
                className={`block rounded-full transition-all ${index === 0 ? "h-1.5 w-4 bg-white" : "h-1.5 w-1.5 bg-white/50"}`}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
