import type { Metadata } from "next";
import { AppProviders } from "@/components/AppProviders";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rubhiw.vercel.app";
const siteName = "RUBHIW";
const siteDescription = "RUBHIW แคตตาล็อกสินค้านำเข้าเกาหลี พรีออเดอร์สกินแคร์ เมคอัพ และขนม พร้อมติดตามสถานะคำสั่งซื้อ";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon_io/favicon.ico" },
      { url: "/favicon_io/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon_io/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/favicon_io/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/favicon_io/site.webmanifest",
  openGraph: {
    description: siteDescription,
    images: [
      {
        alt: "RUBHIW Korean preorder catalog",
        height: 630,
        url: "/image/hero01.png",
        width: 1200,
      },
    ],
    locale: "th_TH",
    siteName,
    title: siteName,
    type: "website",
    url: "/",
  },
  robots: {
    follow: true,
    index: true,
  },
  twitter: {
    card: "summary_large_image",
    description: siteDescription,
    images: ["/image/hero01.png"],
    title: siteName,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
