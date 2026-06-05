import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Andrea D'Attero — Full-Stack Software Engineer",
  description:
    "Full-stack software engineer based in Zurich, Switzerland. Building high-performance, production-grade software — from trading platforms at UBS to developer tools for the modern web.",
  keywords: [
    "software engineer",
    "full-stack",
    "React",
    "Next.js",
    "TypeScript",
    "Zurich",
    "Switzerland",
  ],
  authors: [{ name: "Andrea D'Attero", url: "https://datteroandrea.me" }],
  creator: "Andrea D'Attero",
  metadataBase: new URL("https://datteroandrea.me"),
  openGraph: {
    title: "Andrea D'Attero — Full-Stack Software Engineer",
    description:
      "Full-stack software engineer based in Zurich, Switzerland. Building high-performance, production-grade software.",
    url: "https://datteroandrea.me",
    siteName: "Andrea D'Attero",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Andrea D'Attero — Full-Stack Software Engineer",
    description:
      "Full-stack software engineer based in Zurich, Switzerland. Building high-performance, production-grade software.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const themeScript = `(function(){try{var t=localStorage.getItem("theme")||( window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=t;}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
