"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

const appRoutePrefixes = [
  "/affiliate",
  "/build",
  "/collection",
  "/create",
  "/dashboard",
  "/generate",
  "/integrations",
  "/launchpad",
  "/partners",
  "/pricing",
  "/profile",
  "/projects",
  "/settings",
  "/workspace",
];

function isAppRoute(pathname: string | null) {
  if (!pathname) return false;
  return appRoutePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export default function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideMarketingChrome = isAppRoute(pathname);

  return (
    <>
      {!hideMarketingChrome && <Navbar />}
      <main
        className={cn(
          "min-h-dvh transition-colors duration-300",
          hideMarketingChrome ? "pt-0" : "pt-20"
        )}
      >
        {children}
      </main>
      {!hideMarketingChrome && <Footer />}
    </>
  );
}


