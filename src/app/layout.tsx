import type { Metadata } from "next";
import { Geist } from "next/font/google";

import "./globals.css";
import AppChrome from "@/components/AppChrome";
import ProfileThemeSync from "@/components/ProfileThemeSync";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "LokoAI | Build Apps in Minutes with AI",
  description: "LokoAI is an AI-powered platform that lets you build fully functional apps using natural language. No coding required.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={cn("font-sans", geist.variable)}
    >
      <body className="bg-background text-foreground antialiased transition-colors duration-300">

        <ThemeProvider defaultTheme="dark">
          <AuthProvider>
            <ProfileThemeSync />
            <AppChrome>{children}</AppChrome>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
