import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MoodCheck - Employer Dashboard",
  description: "Psychological safety. Made human.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={``}>{children}</body>
    </html>
  );
}
