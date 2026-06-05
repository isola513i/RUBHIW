"use client";

import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CartProvider } from "@/components/CartProvider";
import { LanguageProvider } from "@/lib/i18n";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <CartProvider>
        {children}
        <Toaster
          position="top-center"
          containerStyle={{
            top: "calc(env(safe-area-inset-top) + 78px)",
            zIndex: 70,
          }}
          toastOptions={{
            duration: 2600,
          }}
        />
        <Analytics />
        <SpeedInsights />
      </CartProvider>
    </LanguageProvider>
  );
}
