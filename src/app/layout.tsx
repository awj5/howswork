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
  title: "HowsWork - Dashboard",
  description:
    "HowsWork is the anonymous inbox for psychological safety, helping employees speak up safely and giving employers real-time insights into psychosocial risks and workplace safety compliance.",
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
