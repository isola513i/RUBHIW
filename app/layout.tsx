import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import { AppProviders } from "@/components/AppProviders";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rubhiw.vercel.app";

const prompt = Prompt({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-prompt",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "RUBHIW",
  description: "RUBHIW mobile-first catalog for Korean imported goods and pre-orders.",
  applicationName: "RUBHIW",
  icons: {
    icon: [
      { url: "/favicon_io/favicon.ico" },
      { url: "/favicon_io/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon_io/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/favicon_io/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/favicon_io/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${prompt.variable} font-sans antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
