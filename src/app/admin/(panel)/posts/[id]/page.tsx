import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostEditor from "@/components/admin/PostEditor";
import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/lib/types";

export const metadata: Metadata = { title: "Edit post" };

export default async function EditPostPage({ params }: PageProps<"/admin/posts/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  if (!supabase) notFound();

  const { data } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  return <PostEditor post={data as Post} />;
}
