import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, Gauge, Mail, ShieldCheck, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createSupabaseServerClient, getCurrentUser } from "@/lib/supabase";
import AvatarUploadClient from "./AvatarUploadClient";

function readText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/profile");

  const email = user.email ?? "Signed in user";
  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("username,avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const avatarUrl =
    readText(profile?.avatar_url) ||
    readText(user.user_metadata?.avatar_url) ||
    readText(user.user_metadata?.picture);
  const displayName =
    readText(profile?.username) ||
    readText(user.user_metadata?.full_name) ||
    readText(user.user_metadata?.name) ||
    email.split("@")[0] ||
    "Account";
  const initials = email.charAt(0).toUpperCase();
  const createdAt = user.created_at
    ? new Intl.DateTimeFormat("en", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date(user.created_at))
    : "Recently";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">
            Profile Settings
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
            Manage your profile information.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard">
            <Gauge className="h-4 w-4" />
            Dashboard
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.25fr]">
        <Card className="border-slate-200/80 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-slate-950/80">
          <CardHeader className="text-center">
            <AvatarUploadClient initialAvatar={avatarUrl} displayName={displayName} initials={initials} />
            <div>
              <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
                <span className="rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-3 py-1 text-[10px] font-black uppercase text-white shadow-lg shadow-blue-500/20">
                  Admin
                </span>
                <span className="rounded-full bg-gradient-to-r from-fuchsia-600 via-violet-600 to-blue-600 px-3 py-1 text-[10px] font-black uppercase text-white shadow-lg shadow-violet-500/20">
                  Premium Loko
                </span>
              </div>
              <CardTitle className="text-2xl font-black">{displayName}</CardTitle>
              <CardDescription className="mt-1">{email}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-xs font-bold text-violet-700 dark:text-violet-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified premium account
            </span>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-slate-950/80">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal information and profile details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-slate-200/70 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
              <Mail className="mt-0.5 h-5 w-5 text-sky-500" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Email
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {email}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-slate-200/70 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
              <CalendarDays className="mt-0.5 h-5 w-5 text-sky-500" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Member Since
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {createdAt}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-slate-200/70 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
              <UserCircle className="mt-0.5 h-5 w-5 text-sky-500" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  User ID
                </p>
                <p className="mt-1 break-all font-mono text-xs text-slate-600 dark:text-gray-300">
                  {user.id}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
