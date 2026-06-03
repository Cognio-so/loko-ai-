"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { GitPullRequestArrow, MessageSquare, Plus, Search, Sparkles, Star, Workflow } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type CommunityPost = {
  id: string;
  title: string;
  content: string;
  category: string;
  author_id: string | null;
  votes: number | null;
  created_at: string;
};

const categories = ["Overview", "User Showcase", "AI Projects", "Templates", "Workflows", "Discussions", "Feature Requests", "Roadmap Voting"];

export default function CommunityClient({ initialPosts }: { initialPosts: CommunityPost[] }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const { user } = useAuth();
  const [posts, setPosts] = useState(initialPosts);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Overview");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("");

  const filteredPosts = posts.filter((post) => {
    const matchesQuery = `${post.title} ${post.content} ${post.category}`.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === "Overview" || post.category === category;
    return matchesQuery && matchesCategory;
  });

  const stats = [
    { label: "Projects", value: posts.filter((post) => post.category === "AI Projects").length, icon: Sparkles },
    { label: "Workflows", value: posts.filter((post) => post.category === "Workflows").length, icon: Workflow },
    { label: "Requests", value: posts.filter((post) => post.category === "Feature Requests").length, icon: GitPullRequestArrow },
  ];

  const submitPost = async () => {
    if (!title.trim() || !content.trim()) return;
    setStatus("Publishing...");
    const { data, error } = await supabase
      .from("community_posts")
      .insert({
        title: title.trim(),
        content: content.trim(),
        category: category === "Overview" ? "Discussions" : category,
        author_id: user?.id ?? null,
      })
      .select("id,title,content,category,author_id,votes,created_at")
      .single();

    if (error) {
      setStatus("Could not publish. Check Supabase RLS and table setup.");
      return;
    }

    setPosts((current) => [data, ...current]);
    setTitle("");
    setContent("");
    setStatus("Published to community.");
    window.setTimeout(() => setStatus(""), 2200);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-3">
        <Card className="p-2">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`flex h-10 w-full items-center rounded-xl px-3 text-sm font-semibold transition ${
                category === item ? "bg-sky-500/10 text-sky-600 dark:text-sky-200" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {item}
            </button>
          ))}
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Community Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center justify-between rounded-xl bg-muted p-3">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <stat.icon className="h-4 w-4 text-sky-500" />
                  {stat.label}
                </span>
                <span className="font-mono text-sm font-bold">{stat.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </aside>

      <section className="space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects, workflows, discussions, requests..." className="pl-10" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="h-5 w-5 text-sky-500" />
              Share with the community
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" />
            <Textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Project, template, workflow, discussion, or feature request details" />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge variant="outline">{category === "Overview" ? "Discussions" : category}</Badge>
              <div className="flex items-center gap-3">
                {status ? <span className="text-xs font-semibold text-muted-foreground">{status}</span> : null}
                <Button onClick={() => void submitPost()} disabled={!title.trim() || !content.trim()}>Publish</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 xl:grid-cols-2">
          {filteredPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card className="h-full transition hover:-translate-y-1 hover:border-sky-300 hover:shadow-sky-500/10">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-lg">{post.title}</CardTitle>
                    <Badge variant="premium">{post.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-4 text-sm leading-6 text-muted-foreground">{post.content}</p>
                  <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" /> Discussion</span>
                    <span className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5" /> {post.votes ?? 0} votes</span>
                  </div>
                </CardContent>
              </Card>
            </motion.article>
          ))}
        </div>
        {!filteredPosts.length ? <Card className="p-8 text-center text-sm text-muted-foreground">No community posts match your search yet.</Card> : null}
      </section>
    </div>
  );
}
