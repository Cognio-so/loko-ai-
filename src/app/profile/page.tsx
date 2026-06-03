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
import { getCurrentUser } from "@/lib/supabase";
import AvatarUploadClient from "./AvatarUploadClient";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/profile");

  const email = user.email ?? "Signed in user";
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
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
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-sky-500">
            Account
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 dark:text-white">
            Profile
          </h1>
          <p className="mt-3 text-sm text-slate-500 dark:text-gray-400">
            Review your LokoAI account details and jump back into your workspace.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard">
            <Gauge className="h-4 w-4" />
            Dashboard
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader className="text-center">
            <AvatarUploadClient initialAvatar={avatarUrl} displayName={displayName} initials={initials} />
            <div>
              <CardTitle>{displayName}</CardTitle>
              <CardDescription className="mt-1">{email}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-600 dark:text-sky-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Active account
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>
              These details come from your authenticated Supabase session.
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
