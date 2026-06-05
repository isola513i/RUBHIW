"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

type PlaceholderPageProps = {
  pageKey: "products" | "search" | "track" | "profile";
};

export function PlaceholderPage({ pageKey }: PlaceholderPageProps) {
  const { t } = useI18n();
  const content = t.placeholders[pageKey];

  return (
    <main className="mx-auto min-h-screen max-w-md px-5 py-10">
      <div className="rounded-[28px] border border-beige/60 bg-cream/90 p-7 shadow-soft">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">{content.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-medium leading-tight text-ink">{content.title}</h1>
        <p className="mt-4 max-w-sm text-base leading-7 text-muted">{content.description}</p>
        <Link
          className="mt-8 inline-flex min-h-11 rounded-full bg-blue px-5 py-3 text-sm font-medium text-ink"
          href="/"
        >
          {t.backToHome}
        </Link>
      </div>
    </main>
  );
}
