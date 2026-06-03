"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpenText,
  Home,
  LifeBuoy,
  LogOut,
  Palette,
  Settings,
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

  return (
    <Avatar
      size={size === "lg" ? "lg" : "default"}
      className={`${size === "lg" ? "h-12 w-12" : "h-10 w-10"} border border-white/70 shadow-lg shadow-slate-950/10 transition-transform duration-200 group-hover/menu:scale-105`}
    >
      {avatar && !avatarFailed ? (
        <AvatarImage
          src={avatar}
          alt={`${name} profile image`}
          referrerPolicy="no-referrer"
          onError={() => setAvatarFailed(true)}
        />
      ) : null}
      <AvatarFallback className="bg-slate-950 text-sm font-black text-white">
        {initials}
      </AvatarFallback>
      <AvatarBadge className="right-0 bottom-0 h-3.5 w-3.5 border-2 border-white bg-emerald-500 ring-0" />
    </Avatar>
  );
}

const menuItems = [
  { href: "/profile", label: "Profile", icon: UserCircle },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/appearance", label: "Appearance", icon: Palette },
  { href: "/support", label: "Support", icon: LifeBuoy },
  { href: "/documentation", label: "Documentation", icon: BookOpenText },
  { href: "/community", label: "Community", icon: Users },
  { href: "/dashboard", label: "Home", icon: Home },
];

export default function UserMenu({ variant = "avatar" }: UserMenuProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile: storedProfile, signOut } = useAuth();
  const fallbackProfile = getUserProfile(user);
  const profile = {
    ...fallbackProfile,
    avatar: storedProfile?.avatar_url || fallbackProfile.avatar,
    name: storedProfile?.username || fallbackProfile.name,
  };

  if (!user) return null;

  const trigger =
    variant === "sidebar" ? (
      <button
        type="button"
        className="group/menu flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left shadow-sm ring-1 ring-border/60 transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-500/10"
      >
        <MenuAvatar avatar={profile.avatar} name={profile.name} initials={profile.initials} size="md" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-foreground">{profile.name}</span>
          <span className="block truncate text-[11px] text-muted-foreground">{profile.email}</span>
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
      <DropdownMenuContent align="end" sideOffset={10} className="w-80 overflow-hidden rounded-3xl border border-border bg-popover/95 p-0 text-popover-foreground shadow-[0_28px_90px_rgba(15,23,42,0.22)] backdrop-blur-2xl">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="p-2"
          >
            <DropdownMenuLabel className="p-3">
              <div className="flex items-center gap-3">
                <MenuAvatar avatar={profile.avatar} name={profile.name} initials={profile.initials} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-foreground">{profile.name}</p>
                  <p className="truncate text-xs font-medium text-muted-foreground">{profile.email}</p>
                  <p className="mt-1 inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-300">
                    Google account connected
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />

            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <DropdownMenuItem
                  key={item.href}
                  asChild={item.href !== "/dashboard"}
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
