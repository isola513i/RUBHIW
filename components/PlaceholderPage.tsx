type PlaceholderPageProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PlaceholderPage({ eyebrow, title, description }: PlaceholderPageProps) {
  return (
    <main className="mx-auto min-h-screen max-w-md px-5 py-10">
      <div className="rounded-[28px] border border-beige/60 bg-cream/90 p-7 shadow-soft">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-medium leading-tight text-ink">{title}</h1>
        <p className="mt-4 max-w-sm text-base leading-7 text-muted">{description}</p>
        <a
          className="mt-8 inline-flex rounded-full bg-blue px-5 py-3 text-sm font-medium text-ink"
          href="/"
        >
          Back to home
        </a>
      </div>
    </main>
  );
}
