"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";
import { CATEGORIES, type Post } from "@/lib/types";
import { getVisitorId } from "@/lib/visitor";
import PostCard from "./PostCard";
import PostModal from "./PostModal";

type Filter = "all" | (typeof CATEGORIES)[number]["value"];

export default function Feed({
  initialPosts,
  loadFailed,
  initialOpenId,
}: {
  initialPosts: Post[];
  loadFailed: boolean;
  initialOpenId: string | null;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(initialOpenId);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [likeError, setLikeError] = useState<string | null>(null);

  // Which posts has this browser already liked?
  useEffect(() => {
    if (!hasSupabaseEnv) return;
    createClient()
      .rpc("my_liked_posts", { p_visitor: getVisitorId() })
      .then(({ data }) => {
        if (Array.isArray(data)) setLiked(new Set(data as string[]));
      });
  }, []);

  const open = useCallback((id: string) => {
    setOpenId(id);
    window.history.replaceState(null, "", `/work?post=${id}`);
  }, []);
  const close = useCallback(() => {
    setOpenId(null);
    window.history.replaceState(null, "", "/work");
  }, []);

  const toggleLike = useCallback(
    async (id: string) => {
      setLikeError(null);
      const { data, error } = await createClient().rpc("toggle_like", {
        p_post: id,
        p_visitor: getVisitorId(),
      });
      const row = Array.isArray(data) ? data[0] : null;
      if (error || !row) {
        setLikeError("Couldn't save that like. Try again in a moment.");
        return;
      }
      setLiked((prev) => {
        const next = new Set(prev);
        if (row.liked) next.add(id);
        else next.delete(id);
        return next;
      });
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, like_count: row.total } : p)),
      );
    },
    [],
  );

  const bumpComments = useCallback((id: string, delta: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              comments: [{ count: Math.max((p.comments?.[0]?.count ?? 0) + delta, 0) }],
            }
          : p,
      ),
    );
  }, []);

  const visible = useMemo(
    () => (filter === "all" ? posts : posts.filter((p) => p.category === filter)),
    [posts, filter],
  );
  const numbering = useMemo(
    () => new Map(posts.map((p, i) => [p.id, posts.length - i])),
    [posts],
  );
  const openPost = posts.find((p) => p.id === openId) ?? null;

  if (loadFailed) {
    return (
      <div className="state" role="alert">
        <h2 className="state__title">The archive is offline</h2>
        <p className="body-copy">
          {hasSupabaseEnv
            ? "Something went wrong loading the posts. Please refresh in a moment."
            : "The database isn't connected yet. Add the Supabase keys to .env.local and restart (see the README)."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="filters" role="group" aria-label="Filter by category">
        {[{ value: "all", label: "All" }, ...CATEGORIES].map((c) => {
          const active = filter === c.value;
          return (
            <button
              key={c.value}
              type="button"
              className="filters__btn"
              aria-pressed={active}
              onClick={() => setFilter(c.value as Filter)}
            >
              {c.label}
              <span className="filters__count">
                {c.value === "all"
                  ? posts.length
                  : posts.filter((p) => p.category === c.value).length}
              </span>
            </button>
          );
        })}
      </div>

      {likeError && (
        <p className="form-error" role="alert">
          {likeError}
        </p>
      )}

      {posts.length === 0 ? (
        <div className="state">
          <h2 className="state__title">Nothing here yet</h2>
          <p className="body-copy">
            The archive is still empty. The first drop is on its way, check
            back soon.
          </p>
        </div>
      ) : visible.length === 0 ? (
        <div className="state">
          <h2 className="state__title">Nothing in this pile</h2>
          <p className="body-copy">No posts in this category yet.</p>
          <button
            type="button"
            className="btn btn--small"
            style={{ marginTop: 16 }}
            onClick={() => setFilter("all")}
          >
            Show everything
          </button>
        </div>
      ) : (
        <ul className="masonry">
          {visible.map((post, i) => (
            <PostCard
              key={post.id}
              post={post}
              index={i}
              number={numbering.get(post.id) ?? 0}
              liked={liked.has(post.id)}
              onOpen={() => open(post.id)}
              onLike={() => toggleLike(post.id)}
            />
          ))}
        </ul>
      )}

      {openPost && (
        <PostModal
          key={openPost.id}
          post={openPost}
          liked={liked.has(openPost.id)}
          onLike={() => toggleLike(openPost.id)}
          onCommentDelta={(d) => bumpComments(openPost.id, d)}
          onClose={close}
        />
      )}
    </>
  );
}
