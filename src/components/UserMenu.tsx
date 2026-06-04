"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpenText,
  Check,
  ChevronRight,
  Home,
  LifeBuoy,
  LogOut,
  Monitor,
  Moon,
  Palette,
  Settings,
  Sparkles,
  Sun,
  UserCircle,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme, type Theme } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";

type UserMenuProps = {
  variant?: "avatar" | "sidebar";
};

function getUserProfile(user: ReturnType<typeof useAuth>["user"]) {
  const metadata = user?.user_metadata ?? {};
  const avatar =
    typeof metadata.avatar_url === "string" && metadata.avatar_url
      ? metadata.avatar_url
      : typeof metadata.picture === "string" && metadata.picture
        ? metadata.picture
        : "";
  const name =
    typeof metadata.full_name === "string" && metadata.full_name
      ? metadata.full_name
      : typeof metadata.name === "string" && metadata.name
        ? metadata.name
        : user?.email?.split("@")[0] || "User";
  const email = user?.email || "No email connected";
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

  return { avatar, name, email, initials };
}

function getCleanDisplayName(value: string, email: string) {
  const source = value || email.split("@")[0] || "Aryan";
  const cleaned = source
    .replace(/thealgohype/gi, "")
    .replace(/[_\-.]+/g, " ")
    .trim();
  const firstName = cleaned.split(/\s+/)[0] || "Aryan";
  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
}

function MenuAvatar({
  avatar,
  name,
  initials,
  size = "lg",
}: {
  avatar: string;
  name: string;
  initials: string;
  size?: "md" | "lg";
}) {
  const [avatarFailed, setAvatarFailed] = React.useState(false);

  React.useEffect(() => {
    setAvatarFailed(false);
  }, [avatar]);

  return (
    <Avatar
      size={size === "lg" ? "lg" : "default"}
      className={`${size === "lg" ? "h-14 w-14" : "h-11 w-11"} border-2 border-white shadow-xl shadow-slate-950/12 transition-transform duration-200 group-hover/menu:scale-105 dark:border-white/15`}
    >
      {avatar && !avatarFailed ? (
        <AvatarImage
          src={avatar}
          alt={`${name} profile image`}
          referrerPolicy="no-referrer"
          onError={() => setAvatarFailed(true)}
        />
      ) : null}
      <AvatarFallback className="bg-gradient-to-br from-slate-950 to-blue-950 text-sm font-black text-white">
        {initials}
      </AvatarFallback>
      <AvatarBadge className="right-0 bottom-0 h-3.5 w-3.5 border-2 border-white bg-emerald-500 ring-0 dark:border-slate-950" />
    </Avatar>
  );
}

const menuItems = [
  { href: "/profile", label: "Profile", icon: UserCircle },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/support", label: "Support", icon: LifeBuoy },
  { href: "/documentation", label: "Documentation", icon: BookOpenText },
  { href: "/community", label: "Community", icon: Users },
  { href: "/dashboard", label: "Home", icon: Home },
];

const themeChoices: Array<{ value: Theme; label: string; icon: typeof Sun }> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "midnight", label: "Midnight", icon: Moon },
  { value: "blue-neon", label: "Blue Neon", icon: Sparkles },
  { value: "purple-ai", label: "Purple AI", icon: Sparkles },
  { value: "glass", label: "Glass", icon: Palette },
];

const backgroundChoices: Array<{ value: Theme; label: string; className: string }> = [
  {
    value: "blue-neon",
    label: "Aurora blue",
    className: "bg-[radial-gradient(circle_at_10%_15%,#ffffff_0_10%,transparent_18%),linear-gradient(135deg,#38bdf8_0%,#2563eb_45%,#fde68a_100%)]",
  },
  {
    value: "purple-ai",
    label: "Rose violet",
    className: "bg-[radial-gradient(circle_at_80%_15%,#fef3c7_0_8%,transparent_20%),linear-gradient(135deg,#f472b6_0%,#a78bfa_52%,#67e8f9_100%)]",
  },
  {
    value: "glass",
    label: "Glass mist",
    className: "bg-[radial-gradient(circle_at_20%_80%,#67e8f9_0_14%,transparent_34%),radial-gradient(circle_at_80%_10%,#f0abfc_0_14%,transparent_36%),linear-gradient(135deg,#ffffff_0%,#e0f2fe_45%,#faf5ff_100%)]",
  },
];

export default function UserMenu({ variant = "avatar" }: UserMenuProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, profile: storedProfile, signOut, updateProfile } = useAuth();
  const [activePanel, setActivePanel] = React.useState<"menu" | "appearance">("menu");
  const fallbackProfile = getUserProfile(user);
  const displayName = getCleanDisplayName(storedProfile?.username || fallbackProfile.name, fallbackProfile.email);
  const displayInitials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || fallbackProfile.initials;
  const profile = {
    ...fallbackProfile,
    avatar: storedProfile?.avatar_url || fallbackProfile.avatar || "",
    name: displayName,
    initials: displayInitials,
  };

  if (!user) return null;

  const chooseTheme = async (nextTheme: Theme) => {
    setTheme(nextTheme);
    await updateProfile({ theme: nextTheme });
  };

  const chooseSystemTheme = () => {
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? true;
    setTheme(prefersDark ? "dark" : "light");
  };

  const trigger =
    variant === "sidebar" ? (
      <button
        type="button"
        className="group/menu flex w-full items-center gap-3 rounded-[22px] border border-sky-200/80 bg-white/95 p-3 text-left shadow-[0_14px_34px_rgba(14,165,233,0.12)] ring-1 ring-sky-100 transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-[0_18px_48px_rgba(14,165,233,0.2)] dark:border-sky-400/20 dark:bg-slate-950/90 dark:ring-sky-400/10"
      >
        <MenuAvatar avatar={profile.avatar} name={profile.name} initials={profile.initials} size="md" />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-black text-slate-950 dark:text-white">{profile.name}</span>
            <span className="rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-2.5 py-1 text-[10px] font-black uppercase text-white shadow-sm shadow-blue-500/20">
              Admin
            </span>
          </span>
          <span className="block truncate text-[11px] text-muted-foreground">{profile.email}</span>
          <span className="mt-1 inline-flex rounded-full bg-gradient-to-r from-fuchsia-600 via-violet-600 to-blue-600 px-2.5 py-1 text-[9px] font-black uppercase text-white shadow-sm shadow-violet-500/20">
            Premium Loko
          </span>
        </span>
      </button>
    ) : (
      <button type="button" className="group/menu rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/20">
        <MenuAvatar avatar={profile.avatar} name={profile.name} initials={profile.initials} size="md" />
      </button>
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        onCloseAutoFocus={() => setActivePanel("menu")}
        className={`${activePanel === "appearance" ? "w-[560px]" : "w-80"} overflow-hidden rounded-3xl border border-border bg-popover/95 p-0 text-popover-foreground shadow-[0_28px_90px_rgba(15,23,42,0.22)] backdrop-blur-2xl`}
      >
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 p-2 transition-all"
          >
            <DropdownMenuLabel className="p-3">
              <div className="flex items-center gap-3">
                <MenuAvatar avatar={profile.avatar} name={profile.name} initials={profile.initials} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-foreground">{profile.name}</p>
                  <p className="truncate text-xs font-medium text-muted-foreground">{profile.email}</p>
                  <p className="mt-1 inline-flex rounded-full bg-gradient-to-r from-fuchsia-600 via-violet-600 to-blue-600 px-2.5 py-1 text-[10px] font-black uppercase text-white">
                    Premium Loko Admin
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />

            <div className={activePanel === "appearance" ? "grid grid-cols-[200px_1fr] gap-2" : ""}>
              <div>
                <DropdownMenuItem
                  onPointerMove={() => setActivePanel("appearance")}
                  onSelect={(event) => {
                    event.preventDefault();
                    setActivePanel("appearance");
                  }}
                  className={`cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    activePanel === "appearance"
                      ? "bg-sky-500/10 text-sky-600 dark:text-sky-200"
                      : "text-foreground/80 focus:bg-accent focus:text-accent-foreground"
                  }`}
                >
                  <Palette className="h-4 w-4" />
                  Appearance
                  <ChevronRight className="ml-auto h-4 w-4" />
                </DropdownMenuItem>

                {menuItems.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem
                      key={item.href}
                      asChild={item.href !== "/dashboard"}
                      onPointerMove={() => setActivePanel("menu")}
                      onClick={
                        item.href === "/dashboard"
                          ? () => {
                              if (pathname === "/dashboard") window.scrollTo({ top: 0, behavior: "smooth" });
                              else router.push("/dashboard");
                            }
                          : undefined
                      }
                      className={`cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? "bg-sky-500/10 text-sky-600 dark:text-sky-200"
                          : "text-foreground/80 focus:bg-accent focus:text-accent-foreground"
                      }`}
                    >
                      {item.href === "/dashboard" ? (
                        <>
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </>
                      ) : (
                        <Link href={item.href} className="flex items-center gap-2.5">
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </div>

              {activePanel === "appearance" ? (
                <div className="rounded-2xl border border-border bg-background/85 p-4 shadow-inner">
                  <p className="text-xs font-black text-foreground/80">Background</p>
                  <div className="mt-3 flex gap-3">
                    {backgroundChoices.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => void chooseTheme(item.value)}
                        className={`h-14 flex-1 rounded-xl border-2 shadow-sm transition hover:-translate-y-0.5 ${
                          theme === item.value ? "border-sky-500 ring-4 ring-sky-500/15" : "border-border hover:border-sky-300"
                        } ${item.className}`}
                        aria-label={item.label}
                      />
                    ))}
                  </div>

                  <div className="my-4 h-px bg-border" />
                  <p className="text-xs font-black text-foreground/80">Theme</p>
                  <div className="mt-2 space-y-1">
                    {themeChoices.map((item) => {
                      const Icon = item.icon;
                      const isActive = theme === item.value;
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => void chooseTheme(item.value)}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                            isActive ? "bg-sky-500/10 text-sky-600 dark:text-sky-200" : "text-foreground hover:bg-accent"
                          }`}
                        >
                          <Icon className="h-4 w-4 opacity-75" />
                          {item.label}
                          {isActive ? <Check className="ml-auto h-4 w-4" /> : null}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={chooseSystemTheme}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-foreground transition hover:bg-accent"
                    >
                      <Monitor className="h-4 w-4 opacity-75" />
                      System
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              onClick={() => void signOut()}
              className="cursor-pointer rounded-xl px-3 py-2.5 text-red-600 focus:bg-red-50 focus:text-red-700 dark:text-red-300 dark:focus:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </motion.div>
        </AnimatePresence>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
