"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, Lock, Palette, Save, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme, type Theme } from "@/components/ThemeProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const themeOptions: Array<{ value: Theme; label: string }> = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "midnight", label: "Midnight" },
  { value: "blue-neon", label: "Blue Neon" },
  { value: "purple-ai", label: "Purple AI" },
  { value: "glass", label: "Glassmorphism" },
];

export default function SettingsClient() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const { user, profile, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const [username, setUsername] = useState(profile?.username ?? "");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [productUpdates, setProductUpdates] = useState(true);
  const [privateProfile, setPrivateProfile] = useState(false);
  const [dataSharing, setDataSharing] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    setUsername(profile?.username ?? "");
  }, [profile?.username]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profile_settings")
      .select("email_notifications,product_updates,private_profile,data_sharing")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setEmailNotifications(Boolean(data.email_notifications));
        setProductUpdates(Boolean(data.product_updates));
        setPrivateProfile(Boolean(data.private_profile));
        setDataSharing(Boolean(data.data_sharing));
      });
  }, [supabase, user]);

  const saveSettings = async () => {
    if (!user) {
      setStatus("Sign in to persist settings.");
      return;
    }

    await updateProfile({ username: username.trim() || profile?.username || "Account", theme });
    await supabase.from("profile_settings").upsert(
      {
        user_id: user.id,
        email_notifications: emailNotifications,
        product_updates: productUpdates,
        private_profile: privateProfile,
        data_sharing: dataSharing,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
    setStatus("Settings saved.");
    window.setTimeout(() => setStatus(""), 1800);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Tabs defaultValue="theme" className="gap-6">
          <TabsList className="flex w-full flex-wrap">
            <TabsTrigger value="theme" className="gap-2"><Palette className="h-4 w-4" /> Theme Settings</TabsTrigger>
            <TabsTrigger value="account" className="gap-2"><UserCog className="h-4 w-4" /> Account Settings</TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4" /> Notification Settings</TabsTrigger>
            <TabsTrigger value="privacy" className="gap-2"><Lock className="h-4 w-4" /> Privacy Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="theme">
            <CardHeader className="px-0">
              <CardTitle>Theme Settings</CardTitle>
            </CardHeader>
            <div className="grid gap-3 md:grid-cols-3">
              {themeOptions.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setTheme(item.value)}
                  className={`rounded-2xl border p-4 text-left text-sm font-semibold transition hover:border-sky-300 ${theme === item.value ? "border-sky-400 bg-sky-500/10 text-sky-600 dark:text-sky-200" : "border-border bg-muted/40"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="account" className="space-y-4">
            <CardHeader className="px-0">
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <Input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Username" />
            <Input value={user?.email ?? ""} disabled placeholder="Email" />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-3">
            <CardHeader className="px-0">
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <ToggleRow label="Email notifications" checked={emailNotifications} onChange={setEmailNotifications} />
            <ToggleRow label="Product updates" checked={productUpdates} onChange={setProductUpdates} />
          </TabsContent>

          <TabsContent value="privacy" className="space-y-3">
            <CardHeader className="px-0">
              <CardTitle>Privacy Settings</CardTitle>
            </CardHeader>
            <ToggleRow label="Private profile" checked={privateProfile} onChange={setPrivateProfile} />
            <ToggleRow label="Share usage data to improve LokoAI" checked={dataSharing} onChange={setDataSharing} />
          </TabsContent>

          <div className="flex items-center justify-between border-t border-border pt-5">
            <span className="text-sm font-semibold text-muted-foreground">{status}</span>
            <Button onClick={() => void saveSettings()} size="lg">
              <Save className="h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center justify-between rounded-2xl border border-border bg-muted/40 p-4 text-sm font-semibold">
      {label}
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 accent-sky-500" />
    </label>
  );
}
