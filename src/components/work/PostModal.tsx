"use client";

import { useEffect, useRef, useState } from "react";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { categoryLabel, commentCount, type Post, type PostComment } from "@/lib/types";
import Media from "./Media";

const NAME_KEY = "series001:commenter";

export default function PostModal({
  post,
  liked,
  onLike,
  onCommentDelta,
  onClose,
}: {
  post: Post;
  liked: boolean;
  onLike: () => void;
  onCommentDelta: (delta: number) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [comments, setComments] = useState<PostComment[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [trap, setTrap] = useState(""); // honeypot: real people leave it empty
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [shareMsg, setShareMsg] = useState("");

  // Native <dialog> gives us focus trapping, Esc and a real modal backdrop.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    // Reading browser storage on mount is a legitimate external sync.
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(localStorage.getItem(NAME_KEY) ?? "");
    } catch {}
  }, []);

  useEffect(() => {
    let cancelled = false; // the modal is keyed by post, so state starts fresh
    createClient()
      .from("comments")
      .select("*")
      .eq("post_id", post.id)
      .eq("is_hidden", false)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setLoadError(true);
        else setComments((data ?? []) as PostComment[]);
      });
    return () => {
      cancelled = true;
    };
  }, [post.id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (trap) return; // bot
    const author = name.trim();
    const text = body.trim();
    if (!author || !text) {
      setFormError("Add your name and a comment.");
      return;
    }
    setSending(true);
    setFormError(null);
    const { data, error } = await createClient()
      .from("comments")
      .insert({ post_id: post.id, author_name: author, body: text })
      .select()
      .single();
    setSending(false);
    if (error || !data) {
      setFormError("Couldn't post that. Please try again.");
      return;
    }
    try {
      localStorage.setItem(NAME_KEY, author);
    } catch {}
    setComments((prev) => [...(prev ?? []), data as PostComment]);
    setBody("");
    onCommentDelta(1);
  }

  async function share() {
    const url = `${window.location.origin}/work?post=${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${post.title} — SERIES 001`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareMsg("Link copied");
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return; // user closed the sheet
      setShareMsg("Copy this link: " + url);
    }
    setTimeout(() => setShareMsg(""), 3000);
  }

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      aria-labelledby="modal-title"
      onClose={onClose}
      onClick={(e) => e.target === dialogRef.current && dialogRef.current?.close()}
    >
      <div className="modal__inner">
        <button
          type="button"
          className="modal__close btn btn--small"
          onClick={() => dialogRef.current?.close()}
        >
          Close ✕
        </button>

        <div
          className="modal__media"
          style={
            post.media_type === "image"
              ? { aspectRatio: String(Math.min(Math.max(post.aspect_ratio, 0.5), 2)) }
              : undefined
          }
        >
          <Media post={post} controls sizes="(min-width: 900px) 60vw, 100vw" />
        </div>

        <div className="modal__info">
          <div className="modal__meta">
            <span className="tag">{categoryLabel(post.category)}</span>
            <span className="caption">{formatDate(post.published_at)}</span>
          </div>
          <h2 id="modal-title" className="modal__title display">
            {post.title}
          </h2>
          {post.caption && <p className="modal__caption">{post.caption}</p>}
          {post.description && <p className="modal__desc">{post.description}</p>}

          <div className="modal__actions">
            <button
              type="button"
              className="btn btn--small"
              aria-pressed={liked}
              onClick={onLike}
            >
              {liked ? "♥ Liked" : "♡ Like"} · {post.like_count}
            </button>
            <button type="button" className="btn btn--small btn--light" onClick={share}>
              Share ↗
            </button>
            <span className="caption" role="status" aria-live="polite">
              {shareMsg}
            </span>
          </div>

          <section className="comments" aria-label="Comments">
            <h3 className="comments__h">
              Comments ({comments ? comments.length : commentCount(post)})
            </h3>

            {loadError ? (
              <p className="form-error" role="alert">
                Couldn&apos;t load comments.
              </p>
            ) : comments === null ? (
              <div className="spinner" role="status" aria-label="Loading comments" />
            ) : comments.length === 0 ? (
              <p className="note">No comments yet. Be the first.</p>
            ) : (
              <ul className="comments__list">
                {comments.map((c) => (
                  <li key={c.id} className="comment">
                    <p className="comment__who">
                      {c.author_name}
                      <span className="caption"> · {formatDate(c.created_at)}</span>
                    </p>
                    <p className="comment__body">{c.body}</p>
                  </li>
                ))}
              </ul>
            )}

            <form className="comments__form" onSubmit={submit}>
              <label className="field">
                <span className="field__label">Name</span>
                <input
                  className="input"
                  value={name}
                  maxLength={40}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="nickname"
                />
              </label>
              <label className="field">
                <span className="field__label">Comment</span>
                <textarea
                  className="input"
                  value={body}
                  maxLength={500}
                  onChange={(e) => setBody(e.target.value)}
                />
                <span className="field__hint">{body.length}/500</span>
              </label>
              {/* Honeypot, hidden from people and assistive tech. */}
              <input
                className="sr-only"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                name="website"
                value={trap}
                onChange={(e) => setTrap(e.target.value)}
              />
              {formError && (
                <p className="form-error" role="alert">
                  {formError}
                </p>
              )}
              <button type="submit" className="btn btn--small" disabled={sending}>
                {sending ? "Posting…" : "Post comment"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </dialog>
  );
}
