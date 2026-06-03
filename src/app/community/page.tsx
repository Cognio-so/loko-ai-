import { AccountPageShell } from "@/components/AccountPageShell";
import { createSupabaseServerClient } from "@/lib/supabase";
import CommunityClient from "./CommunityClient";

export default async function CommunityPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("community_posts")
    .select("id,title,content,category,author_id,votes,created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <AccountPageShell
      eyebrow="Community"
      title="Community Hub"
      description="Explore user showcases, AI projects, templates, workflows, discussions, feature requests, and roadmap voting."
    >
      <CommunityClient initialPosts={data ?? []} />
    </AccountPageShell>
  );
}
