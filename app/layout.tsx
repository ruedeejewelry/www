import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Thai, Noto_Serif_Thai } from "next/font/google";
import { SITE } from "@/lib/site";
import "./globals.css";

/*
  Two families, three weights total — the ceiling set by the performance budget
  (CLAUDE-storefront.md §7). Sans carries 400 and 600 (body and prices), serif
  carries 500 (headings). Thai subset only; the full Thai set is far heavier
  than a Latin one.
*/
const plexThai = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "600"],
  variable: "--font-plex-thai",
  display: "swap",
});

const serifThai = Noto_Serif_Thai({
  subsets: ["thai", "latin"],
  weight: ["500"],
  variable: "--font-serif-thai",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Ruedee Jewelry — เพชร พลอยแท้ จากตลาดพลอยจันทบุรี",
    template: "%s — Ruedee Jewelry",
  },
  description:
    "เพชร พลอยแท้ จากตลาดพลอยจันทบุรี ในราคาต้นน้ำ คุณแม่ออกแบบเอง ช่างมือดีของบ้านเป็นคนทำ ทุกชิ้นมีชิ้นเดียว ทักไลน์ถามได้ทุกชิ้น",
  openGraph: {
    type: "website",
    locale: "th_TH",
    siteName: SITE.name,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#faf8f4",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className={`${plexThai.variable} ${serifThai.variable}`}>
      <body>{children}</body>
    </html>
  );
}
