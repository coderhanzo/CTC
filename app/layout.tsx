import type { Metadata } from "next";
import "./globals.css";

import { brandFullName } from "@/src/lib/brand";

export const metadata: Metadata = {
  title: `${brandFullName} | Decode Your Style`,
  description:
    "Premium CTC streetwear drops for the ones who move different.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;700;900&family=JetBrains+Mono:wght@400;500;700&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&family=Playfair+Display:wght@700;900&display=swap"
        />
        {children}
      </body>
    </html>
  );
}
