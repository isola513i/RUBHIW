import type { Metadata } from "next";
import { AppProviders } from "@/components/AppProviders";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rubhiw.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "RUBHIW",
  description: "RUBHIW แคตตาล็อกสินค้านำเข้าเกาหลีและพรีออเดอร์",
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
    <html lang="th">
      <body className="font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
