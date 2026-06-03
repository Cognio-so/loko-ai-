"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  Check,
  FileQuestion,
  Home,
  LifeBuoy,
  LogOut,
  Megaphone,
  MessageCircle,
  Moon,
  Palette,
  ShieldCheck,
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/ThemeProvider";

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

function ExternalItem({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2.5 text-slate-700 focus:bg-sky-50 focus:text-sky-700 dark:text-slate-200 dark:focus:bg-white/10 dark:focus:text-white">
      <a href={href} target="_blank" rel="noreferrer" className="flex items-center gap-2.5">
        {children}
      </a>
    </DropdownMenuItem>
  );
}

export default function UserMenu({ variant = "avatar" }: UserMenuProps) {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const profile = getUserProfile(user);

  if (!user) return null;

  const trigger =
    variant === "sidebar" ? (
      <button
        type="button"
        className="group/menu flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-left shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-500/10 dark:border-white/10 dark:bg-slate-900 dark:ring-white/5"
      >
        <MenuAvatar avatar={profile.avatar} name={profile.name} initials={profile.initials} size="md" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">{profile.name}</span>
          <span className="block truncate text-[11px] text-slate-400">{profile.email}</span>
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
        className="w-80 rounded-3xl border border-slate-200/80 bg-white/95 p-2 text-slate-900 shadow-[0_28px_90px_rgba(15,23,42,0.22)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/95 dark:text-white"
      >
        <DropdownMenuLabel className="p-3">
          <div className="flex items-center gap-3">
            <MenuAvatar avatar={profile.avatar} name={profile.name} initials={profile.initials} />
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-slate-950 dark:text-white">{profile.name}</p>
              <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">{profile.email}</p>
              <p className="mt-1 inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                Google account connected
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/10" />

        <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2.5 focus:bg-sky-50 focus:text-sky-700 dark:focus:bg-white/10">
          <Link href="/profile" className="flex items-center gap-2.5">
            <UserCircle className="h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2.5 focus:bg-sky-50 focus:text-sky-700 dark:focus:bg-white/10">
          <Link href="/settings" className="flex items-center gap-2.5">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer rounded-xl px-3 py-2.5 focus:bg-sky-50 focus:text-sky-700 dark:focus:bg-white/10">
            <Palette className="h-4 w-4" />
            Appearance
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="min-w-44 rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95">
            {[
              { value: "light" as const, label: "Light", icon: Sun },
              { value: "dark" as const, label: "Dark", icon: Moon },
              { value: "system" as const, label: "System", icon: Sparkles },
            ].map((item) => (
              <DropdownMenuItem
                key={item.value}
                onClick={() => setTheme(item.value)}
                className="cursor-pointer rounded-xl px-3 py-2.5 focus:bg-sky-50 focus:text-sky-700 dark:focus:bg-white/10"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {theme === item.value ? <Check className="ml-auto h-4 w-4 text-sky-500" /> : null}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer rounded-xl px-3 py-2.5 focus:bg-sky-50 focus:text-sky-700 dark:focus:bg-white/10">
            <LifeBuoy className="h-4 w-4" />
            Support
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="min-w-48 rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95">
            <ExternalItem href="https://support.google.com"> <LifeBuoy className="h-4 w-4" /> Help Center </ExternalItem>
            <ExternalItem href="https://openrouter.ai/status"> <Megaphone className="h-4 w-4" /> Status </ExternalItem>
            <ExternalItem href="https://supabase.com/support"> <ShieldCheck className="h-4 w-4" /> Report Abuse </ExternalItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer rounded-xl px-3 py-2.5 focus:bg-sky-50 focus:text-sky-700 dark:focus:bg-white/10">
            <BookOpen className="h-4 w-4" />
            Documentation
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="min-w-52 rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95">
            <ExternalItem href="https://nextjs.org/docs"> <BookOpen className="h-4 w-4" /> Documentation </ExternalItem>
            <ExternalItem href="https://platform.openai.com/docs/guides/prompt-engineering"> <FileQuestion className="h-4 w-4" /> Prompts </ExternalItem>
            <ExternalItem href="https://supabase.com/privacy"> <ShieldCheck className="h-4 w-4" /> Terms & Privacy </ExternalItem>
            <ExternalItem href="https://nextjs.org/blog"> <Megaphone className="h-4 w-4" /> Changelog </ExternalItem>
            <ExternalItem href="https://supabase.com/security"> <ShieldCheck className="h-4 w-4" /> Security </ExternalItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2.5 focus:bg-sky-50 focus:text-sky-700 dark:focus:bg-white/10">
          <Link href="/community" className="flex items-center gap-2.5">
            <Users className="h-4 w-4" />
            Community
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2.5 focus:bg-sky-50 focus:text-sky-700 dark:focus:bg-white/10">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Home className="h-4 w-4" />
            Home
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/10" />
        <DropdownMenuItem
          onClick={() => void signOut()}
          className="cursor-pointer rounded-xl px-3 py-2.5 text-red-600 focus:bg-red-50 focus:text-red-700 dark:text-red-300 dark:focus:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
