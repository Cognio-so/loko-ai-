"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sparkles, LayoutGrid, Zap, Users, Rocket, Trophy, Menu, X, Sun, Moon, LogOut, Gauge, Library } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AuthModal from "@/components/AuthModal";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import UserMenu from "@/components/UserMenu";

const navItems = [
  { name: "Home", href: "/", icon: Sparkles },
  { name: "Connect Hub", href: "/integrations", icon: LayoutGrid },
  { name: "Partner Network", href: "/partners", icon: Users },
  { name: "Launch Lab", href: "/launchpad", icon: Rocket },
  { name: "Agent Library", href: "/collection", icon: Library },
  { name: "Growth Hub", href: "/affiliate", icon: Trophy },
  { name: "Plans", href: "/pricing", icon: Zap },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, isLoading, signOut } = useAuth();
  const currentTheme = theme;

  useEffect(() => {
    const routesToPrefetch = [
      ...navItems.map((item) => item.href),
      "/dashboard",
      "/appearance",
      "/community",
      "/documentation",
      "/profile",
      "/projects",
      "/settings",
      "/support",
      "/workspace",
      "/login?next=/dashboard",
    ];

    routesToPrefetch.forEach((href) => {
      router.prefetch(href);
    });
  }, [router]);

  const prefetchRoute = (href: string) => {
    router.prefetch(href);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/75 dark:bg-slate-950/75 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/10 transition-colors duration-300">
      {/* Subtle brand grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.04] pointer-events-none" />
      
      <div className="mx-auto max-w-[1600px] px-3 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between h-16 sm:h-20 items-center gap-3">
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/"
              prefetch
              onMouseEnter={() => prefetchRoute("/")}
              onFocus={() => prefetchRoute("/")}
              className="flex shrink-0 items-center gap-2.5 group"
            >
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 via-violet-500 to-cyan-400 p-0.5 shadow-md shadow-sky-500/20 transition-transform group-hover:scale-105">
                <Sparkles className="h-5 w-5 text-white animate-pulse" />
              </div>
              <span className="whitespace-nowrap text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors">
                Loko<span className="text-sky-500">AI</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav - Beautiful Center Links */}
          <div className="hidden xl:flex min-w-0 items-center justify-center gap-1 mx-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch
                  onMouseEnter={() => prefetchRoute(item.href)}
                  onFocus={() => prefetchRoute(item.href)}
                  className={`relative flex h-12 shrink-0 items-center gap-2 rounded-2xl px-2.5 text-[12.5px] font-bold leading-none transition-all duration-300 group 2xl:px-3.5 ${
                    isActive 
                      ? "text-sky-700 dark:text-sky-300 bg-sky-50 shadow-sm ring-1 ring-sky-100 dark:bg-sky-500/10 dark:ring-sky-400/15" 
                      : "text-slate-600 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white hover:bg-white/80 hover:shadow-sm hover:ring-1 hover:ring-slate-200 dark:hover:bg-white/5 dark:hover:ring-white/10"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 ${
                      isActive
                        ? "border-sky-200 bg-white text-sky-500 shadow-sky-500/10"
                        : "border-slate-200 bg-white/85 text-slate-400 group-hover:border-sky-200 group-hover:text-sky-500 dark:border-white/10 dark:bg-white/5"
                    }`}
                  >
                    <item.icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="whitespace-nowrap">{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="hidden xl:flex shrink-0 items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              type="button"
              aria-label={`Switch to ${currentTheme === "light" ? "dark" : "light"} mode`}
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 transition-all duration-300 flex items-center justify-center group shadow-sm hover:shadow"
            >
              {currentTheme !== "light" ? (
                <Moon className="w-4 h-4 group-hover:rotate-[360deg] transition-transform duration-500 text-sky-400" />
              ) : (
                <Sun className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500 text-amber-500" />
              )}
            </button>

            {!isLoading && user ? (
              <div className="flex items-center gap-4">
                <Link 
                  href="/dashboard" 
                  prefetch
                  onMouseEnter={() => prefetchRoute("/dashboard")}
                  onFocus={() => prefetchRoute("/dashboard")}
                  className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-sky-500/10 dark:text-gray-200"
                >
                  <Gauge className="h-4 w-4 text-sky-500" />
                  Dashboard
                </Link>
                <UserMenu />
              </div>
            ) : (
              <>                {pathname === "/" ? null : (
                  <button
                    type="button"
                    onClick={() => setIsAuthOpen(true)}
                    className="text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950 dark:text-gray-400 dark:hover:text-white"
                  >
                    Log in
                  </button>
                )}
                <Link
                  href="/login?next=/dashboard"
                  prefetch
                  onMouseEnter={() => prefetchRoute("/login?next=/dashboard")}
                  onFocus={() => prefetchRoute("/login?next=/dashboard")}
                  className="relative inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-bold text-slate-950 dark:text-black bg-gradient-to-r from-sky-400 to-cyan-300 hover:from-sky-300 hover:to-cyan-200 transition-all duration-300 shadow-md shadow-sky-500/10 hover:shadow-lg hover:shadow-sky-500/20 active:scale-95"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="xl:hidden flex items-center gap-2 shrink-0">
             <button
                type="button"
                aria-label={`Switch to ${currentTheme === "light" ? "dark" : "light"} mode`}
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className={`p-2 rounded-lg border transition-all duration-300 ${
                  currentTheme !== "light" ? "bg-black border-[#00BFFF] text-white" : "bg-white border-[#00BFFF] text-black"
                }`}
              >
                {currentTheme !== "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
            <button
              type="button"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-500 hover:text-slate-950 dark:text-gray-400 dark:hover:text-white p-2"
            >
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="xl:hidden absolute top-16 sm:top-20 left-0 right-0 glass border-b border-white/10 p-4"
          >
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch
                  onClick={() => setIsOpen(false)}
                  onMouseEnter={() => prefetchRoute(item.href)}
                  onFocus={() => prefetchRoute(item.href)}
                  className={`px-4 py-3 rounded-xl text-base font-medium flex items-center gap-3 ${
                    pathname === item.href
                      ? "bg-sky-500/10 text-slate-950 dark:bg-white/10 dark:text-white"
                      : "text-slate-500 hover:text-slate-950 dark:text-gray-400 dark:hover:text-white hover:bg-sky-500/10 dark:hover:bg-white/5"
                  }`}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-sky-500 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <item.icon className="h-4 w-4" />
                  </span>
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 mt-2 border-t border-white/5 flex flex-col gap-3">
                {!isLoading && user ? (
                  <>
                    <Link
                      href="/dashboard"
                      prefetch
                      onClick={() => setIsOpen(false)}
                      onMouseEnter={() => prefetchRoute("/dashboard")}
                      onFocus={() => prefetchRoute("/dashboard")}
                      className="flex items-center justify-center gap-2 rounded-xl bg-white/5 py-3 font-bold text-slate-700 dark:text-white"
                    >
                      <Gauge className="h-4 w-4 text-sky-500" />
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        void signOut();
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl py-3 font-bold text-red-500"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    {pathname === "/" ? null : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          setIsAuthOpen(true);
                        }}
                        className="w-full py-3 text-center font-medium text-slate-500 dark:text-gray-400"
                      >
                        Log in
                      </button>
                    )}
                    <Link
                      href="/login?next=/dashboard"
                      prefetch
                      onClick={() => setIsOpen(false)}
                      onMouseEnter={() => prefetchRoute("/login?next=/dashboard")}
                      onFocus={() => prefetchRoute("/login?next=/dashboard")}
                      className="flex w-full items-center justify-center rounded-xl brand-btn py-3 font-bold"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </nav>
  );
}
