"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import {
  categoryLabel,
  commentCount,
  POST_SELECT,
  type Post,
  type PostComment,
} from "@/lib/types";

type AdminComment = PostComment & { posts: { title: string } | null };
type Tab = "posts" | "comments";

async function fetchDashboard() {
  const supabase = createClient();
  const [p, c] = await Promise.all([
    supabase.from("posts").select(POST_SELECT).order("created_at", { ascending: false }),
    supabase.from("comments").select("*, posts(title)").order("created_at", { ascending: false }),
  ]);
  if (p.error || c.error) return null;
  return { posts: p.data as Post[], comments: c.data as unknown as AdminComment[] };
}

// The owner sees hidden comments too, so the embedded count in the posts list
// would include them; the dashboard counts visible ones from the comments tab.
export default function Dashboard() {
  const [tab, setTab] = useState<Tab>("posts");
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [comments, setComments] = useState<AdminComment[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchDashboard().then((res) => {
      if (!alive) return;
      if (!res) return setError("Couldn't load data. Check your connection and refresh.");
      setPosts(res.posts);
      setComments(res.comments);
    });
    return () => {
      alive = false;
    };
  }, []);

  async function setStatus(post: Post, status: Post["status"]) {
    setBusyId(post.id);
    setError(null);
    const { error } = await createClient()
      .from("posts")
      .update({ status })
      .eq("id", post.id);
    setBusyId(null);
    if (error) return setError("Couldn't update that post.");
    setPosts((prev) => prev?.map((p) => (p.id === post.id ? { ...p, status } : p)) ?? null);
  }

  async function deletePost(post: Post) {
    if (!window.confirm(`Delete "${post.title}" permanently? This also removes its comments and media.`))
      return;
    setBusyId(post.id);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    if (error) {
      setBusyId(null);
      return setError("Couldn't delete that post.");
    }
    const paths = [post.media_path, post.poster_path].filter(Boolean) as string[];
    if (paths.length) await supabase.storage.from("media").remove(paths);
    setBusyId(null);
    setPosts((prev) => prev?.filter((p) => p.id !== post.id) ?? null);
    setComments((prev) => prev?.filter((c) => c.post_id !== post.id) ?? null);
  }

  async function toggleHidden(c: AdminComment) {
    setBusyId(c.id);
    const { error } = await createClient()
      .from("comments")
      .update({ is_hidden: !c.is_hidden })
      .eq("id", c.id);
    setBusyId(null);
    if (error) return setError("Couldn't update that comment.");
    setComments((prev) =>
      prev?.map((x) => (x.id === c.id ? { ...x, is_hidden: !c.is_hidden } : x)) ?? null,
    );
  }

  async function deleteComment(c: AdminComment) {
    if (!window.confirm("Delete this comment permanently?")) return;
    setBusyId(c.id);
    const { error } = await createClient().from("comments").delete().eq("id", c.id);
    setBusyId(null);
    if (error) return setError("Couldn't delete that comment.");
    setComments((prev) => prev?.filter((x) => x.id !== c.id) ?? null);
  }

  if (!posts || !comments) {
    return error ? (
      <p className="form-error" role="alert">
        {error}
      </p>
    ) : (
      <div className="spinner" role="status" aria-label="Loading dashboard" />
    );
  }

  const published = posts.filter((p) => p.status === "published");
  const totalLikes = posts.reduce((n, p) => n + p.like_count, 0);
  const visibleComments = comments.filter((c) => !c.is_hidden).length;
  const stats = [
    { label: "Posts", value: posts.length },
    { label: "Published", value: published.length },
    { label: "Drafts", value: posts.length - published.length },
    { label: "Likes", value: totalLikes },
    { label: "Comments", value: visibleComments },
  ];

  return (
    <div className="dash">
      <h1 className="display admin__h1">Dashboard</h1>

      <dl className="stats">
        {stats.map((s) => (
          <div className="stats__item" key={s.label}>
            <dt className="caption">{s.label}</dt>
            <dd className="stats__value">{s.value}</dd>
          </div>
        ))}
      </dl>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="filters" role="group" aria-label="Dashboard sections">
        {(["posts", "comments"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={tab === t}
            className="filters__btn"
            onClick={() => setTab(t)}
          >
            {t}
            <span className="filters__count">
              {t === "posts" ? posts.length : comments.length}
            </span>
          </button>
        ))}
      </div>

      {tab === "posts" &&
        (posts.length === 0 ? (
          <div className="state">
            <h2 className="state__title">No posts yet</h2>
            <p className="body-copy">Upload your first piece to get the archive going.</p>
            <Link className="btn" style={{ marginTop: 16 }} href="/admin/posts/new">
              + New post
            </Link>
          </div>
        ) : (
          <ul className="rows">
            {posts.map((post) => (
              <li className="row" key={post.id}>
                <div className="row__thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.media_type === "video" ? (post.poster_url ?? "") : post.media_url}
                    alt=""
                    width={72}
                    height={72}
                  />
                  {post.media_type === "video" && <span className="row__badge">VID</span>}
                </div>
                <div className="row__main">
                  <p className="row__title">{post.title}</p>
                  <p className="caption">
                    {categoryLabel(post.category)} · {formatDate(post.published_at)}
                  </p>
                  <p className="caption">
                    ♥ {post.like_count} · ✎ {commentCount(post)}
                  </p>
                </div>
                <span className={`tag status status--${post.status}`}>{post.status}</span>
                <div className="row__actions">
                  <Link className="btn btn--small btn--light" href={`/admin/posts/${post.id}`}>
                    Edit
                  </Link>
                  <button
                    type="button"
                    className="btn btn--small"
                    disabled={busyId === post.id}
                    onClick={() =>
                      setStatus(post, post.status === "published" ? "draft" : "published")
                    }
                  >
                    {post.status === "published" ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    type="button"
                    className="btn btn--small btn--red"
                    disabled={busyId === post.id}
                    onClick={() => deletePost(post)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ))}

      {tab === "comments" &&
        (comments.length === 0 ? (
          <div className="state">
            <h2 className="state__title">No comments yet</h2>
            <p className="body-copy">When visitors comment, they&apos;ll show up here.</p>
          </div>
        ) : (
          <ul className="rows">
            {comments.map((c) => (
              <li className={`row row--comment ${c.is_hidden ? "is-hidden" : ""}`} key={c.id}>
                <div className="row__main">
                  <p className="row__title">{c.author_name}</p>
                  <p className="row__body">{c.body}</p>
                  <p className="caption">
                    on “{c.posts?.title ?? "deleted post"}” · {formatDate(c.created_at)}
                  </p>
                </div>
                {c.is_hidden && <span className="tag status status--draft">hidden</span>}
                <div className="row__actions">
                  <button
                    type="button"
                    className="btn btn--small btn--light"
                    disabled={busyId === c.id}
                    onClick={() => toggleHidden(c)}
                  >
                    {c.is_hidden ? "Show" : "Hide"}
                  </button>
                  <button
                    type="button"
                    className="btn btn--small btn--red"
                    disabled={busyId === c.id}
                    onClick={() => deleteComment(c)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ))}
    </div>
  );
}
