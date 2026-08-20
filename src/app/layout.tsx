import type { Metadata } from "next";
import localFont from "next/font/local";

import { SiteHeader } from "@/components/layout/site-header";

import "./globals.css";

const agenia = localFont({
  src: "../assets/fonts/Agenia-Bold.ttf",
  variable: "--font-agenia",
  display: "swap",
  weight: "700",
});

const otflagSans = localFont({
  src: "../assets/fonts/otflag-sans/OtflagSans-Medium.otf",
  variable: "--font-otflag",
  display: "swap",
  weight: "500",
});

export const metadata: Metadata = {
  title: {
    default: "ProFootball Match Center",
    template: "%s | ProFootball",
  },
  description: "Live football scores, match events, statistics, and chat.",
};

const themeScript = `
  try {
    const savedTheme = localStorage.getItem("profootball-theme");
    const theme = savedTheme === "light" || savedTheme === "dark"
      ? savedTheme
      : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch (_) {}
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${agenia.variable} ${otflagSans.variable} antialiased`}>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
