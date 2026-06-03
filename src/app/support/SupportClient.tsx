"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bug, CheckCircle, LifeBuoy, Send, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const ticketTypes = [
  { value: "contact", label: "Contact Support", icon: LifeBuoy },
  { value: "bug", label: "Bug Report", icon: Bug },
  { value: "feature", label: "Feature Request", icon: Sparkles },
];

export default function SupportClient() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const { user } = useAuth();
  const [type, setType] = useState("contact");
  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  const submit = async () => {
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) return;
    setIsSubmitting(true);
    const { error } = await supabase.from("support_tickets").insert({
      name: name.trim(),
      email: email.trim(),
      subject: `[${type}] ${subject.trim()}`,
      message: message.trim(),
      status: "open",
    });
    setIsSubmitting(false);

    if (error) {
      setToast("Ticket could not be submitted. Check Supabase setup.");
    } else {
      setName("");
      setEmail(user?.email ?? "");
      setSubject("");
      setMessage("");
      setToast("Support ticket submitted successfully.");
    }
    window.setTimeout(() => setToast(""), 2600);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <CardTitle>Submit a ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={type} onValueChange={setType} className="gap-5">
            <TabsList className="flex w-full flex-wrap">
              {ticketTypes.map((item) => (
                <TabsTrigger key={item.value} value={item.value} className="gap-2">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {ticketTypes.map((item) => (
              <TabsContent key={item.value} value={item.value} className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" />
                  <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" />
                </div>
                <Input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Subject" />
                <Textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Message" />
                <Button onClick={() => void submit()} disabled={isSubmitting || !name || !email || !subject || !message} size="lg">
                  <Send className="h-4 w-4" />
                  {isSubmitting ? "Submitting..." : "Submit Ticket"}
                </Button>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <aside className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Live Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {["AI Chat", "Supabase", "Project Storage", "OpenRouter"].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-xl bg-muted p-3">
                <span className="text-sm font-semibold">{item}</span>
                <Badge className="gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                  <CheckCircle className="h-3 w-3" />
                  Operational
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Knowledge Base</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Check Documentation for setup and workflow guidance.</p>
            <p>2. Include screenshots, browser, and exact steps for bug reports.</p>
            <p>3. Feature requests are tracked for roadmap voting.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ticket System</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl bg-muted p-3 text-sm">
              <p className="font-semibold">Open</p>
              <p className="text-muted-foreground">New submissions enter the open queue.</p>
            </div>
            <div className="rounded-xl bg-muted p-3 text-sm">
              <p className="font-semibold">In Review</p>
              <p className="text-muted-foreground">Support reviews issue details and priority.</p>
            </div>
          </CardContent>
        </Card>
      </aside>

      <AnimatePresence>
        {toast ? (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            className="fixed bottom-6 right-6 z-50 rounded-2xl border border-border bg-popover px-4 py-3 text-sm font-semibold text-popover-foreground shadow-2xl"
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
