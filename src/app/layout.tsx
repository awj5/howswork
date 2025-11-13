import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MoodCheck",
  description: "Psychological safety. Made human.",
  icons: {
    icon: [
      { url: "/img/logo-icon.png", media: "(prefers-color-scheme: light)" },
      { url: "/img/logo-icon-dark.png", media: "(prefers-color-scheme: dark)" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} bg-white antialiased lg:bg-zinc-100 dark:bg-zinc-900 dark:lg:bg-zinc-950`}
    >
      <body>
        {children}
        <Toaster theme="system" />
      </body>
    </html>
  );
}
