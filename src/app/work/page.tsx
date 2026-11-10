import type { Metadata } from "next";
import Feed from "@/components/work/Feed";
import { createClient } from "@/lib/supabase/server";
import { POST_SELECT, type Post } from "@/lib/types";
import "@/styles/work.css";

export const metadata: Metadata = {
  title: "Work",
  description:
    "The SERIES 001 visual archive: graphic design, photography, video and experiments by Chaitanya Gupta.",
};

async function loadPosts(): Promise<{ posts: Post[]; error: boolean }> {
  const supabase = await createClient();
  if (!supabase) return { posts: [], error: true };

  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) return { posts: [], error: true };
  return { posts: (data ?? []) as Post[], error: false };
}

export default async function WorkPage({ searchParams }: PageProps<"/work">) {
  const { post } = await searchParams;
  const { posts, error } = await loadPosts();
  const initialOpenId = typeof post === "string" ? post : null;

  return (
    <div className="work page">
      <header className="work__head">
        <p className="eyebrow">Section 03 / The visual archive</p>
        <h1 className="display work__title">
          The <span>archive</span>
        </h1>
        <p className="body-copy work__sub">
          Posters, photographs, edits, typography and things that don&apos;t
          have a name yet. Tap anything to open it up, leave a like, say
          something.
        </p>
      </header>
      <Feed initialPosts={posts} loadFailed={error} initialOpenId={initialOpenId} />
    </div>
  );
}
