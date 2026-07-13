import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Toaster } from "sonner";
import ogImage from "../../public/img/og.png";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "HowsWork - Dashboard",
  description:
    "Identify and manage psychosocial risks through regular team check-ins, anonymous reporting, and an automated risk register.",
  icons: {
    icon: [
      { url: "/img/icon.svg", media: "(prefers-color-scheme: light)" },
      { url: "/img/icon-dark.svg", media: "(prefers-color-scheme: dark)" },
    ],
  },
  metadataBase: new URL("https://admin.howswork.app"),
  openGraph: {
    images: [
      {
        url: ogImage.src,
      },
    ],
  },
  robots: {
    index: false,
    follow: false,
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
      className={`${inter.variable} h-full bg-white antialiased scheme-light lg:bg-zinc-100 dark:bg-zinc-900 dark:scheme-dark dark:lg:bg-zinc-950`}
    >
      <body>
        {children}
        <Toaster theme="system" duration={5000} richColors />
      </body>

      <GoogleAnalytics gaId="G-LPJ370JJP6" />
    </html>
  );
}
