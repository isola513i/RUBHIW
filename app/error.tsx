"use client";

import Link from "next/link";
import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app] client error boundary", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-cream px-5 py-[calc(env(safe-area-inset-top)+2rem)] text-ink md:max-w-3xl md:px-8">
      <div className="mt-16 rounded-[28px] border border-beige/55 bg-[#FDFBF7] px-5 py-7 shadow-soft">
        <p className="text-sm font-semibold text-muted">RUBHIW</p>
        <h1 className="mt-3 text-[2rem] font-semibold leading-tight tracking-normal">โหลดหน้านี้ไม่สำเร็จ</h1>
        <p className="mt-3 text-[15px] font-medium leading-7 text-muted">
          กรุณาลองใหม่อีกครั้ง หากยังพบปัญหาให้กลับไปหน้าแรกแล้วเปิดหน้านี้ใหม่
        </p>
        <div className="mt-7 grid gap-3">
          <button
            type="button"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-cream transition-transform duration-200 ease-[var(--ease-out-ui)] active:scale-[0.98]"
            onClick={reset}
          >
            <RotateCcw className="h-4 w-4" strokeWidth={2.3} />
            ลองใหม่
          </button>
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-beige/70 bg-cream px-5 py-3 text-sm font-semibold text-ink transition-transform duration-200 ease-[var(--ease-out-ui)] active:scale-[0.98]"
            href="/"
          >
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    </main>
  );
}
