"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { slugify } from "@/lib/format";
import { inspectMedia, validateFile, type MediaInfo } from "@/lib/media";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, type Category, type Post } from "@/lib/types";

const today = () => new Date().toISOString().slice(0, 10);

export default function PostEditor({ post }: { post?: Post }) {
  const router = useRouter();
  const editing = Boolean(post);

  const [title, setTitle] = useState(post?.title ?? "");
  const [caption, setCaption] = useState(post?.caption ?? "");
  const [description, setDescription] = useState(post?.description ?? "");
  const [category, setCategory] = useState<Category>(post?.category ?? "graphic-design");
  const [date, setDate] = useState(post ? post.published_at.slice(0, 10) : today());

  const [file, setFile] = useState<File | null>(null);
  const [info, setInfo] = useState<MediaInfo | null>(null);
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  const [busy, setBusy] = useState<null | "draft" | "published">(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const problem = validateFile(f);
    if (problem) {
      setError(problem);
      e.target.value = "";
      return;
    }
    setError(null);
    try {
      setInfo(await inspectMedia(f));
      setFile(f);
    } catch {
      setError("That file couldn't be read. Try exporting it again.");
      e.target.value = "";
    }
  }

  async function save(status: "draft" | "published") {
    if (!title.trim()) return setError("Give the post a title.");
    if (!file && !post) return setError("Choose an image or video to upload.");

    setBusy(status);
    setError(null);
    const supabase = createClient();
    const uploaded: string[] = [];

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Your session expired. Sign in again.");

      let media: Partial<Post> = {};
      if (file && info) {
        const stamp = Date.now();
        const base = `${user.id}/${stamp}-${slugify(title)}`;
        const ext = (file.name.split(".").pop() || "bin").toLowerCase();

        const mediaPath = `${base}.${ext}`;
        const up = await supabase.storage
          .from("media")
          .upload(mediaPath, file, { contentType: file.type, cacheControl: "31536000" });
        if (up.error) throw new Error("Upload failed: " + up.error.message);
        uploaded.push(mediaPath);

        let posterPath: string | null = null;
        if (info.kind === "video" && info.poster) {
          posterPath = `${base}-poster.jpg`;
          const pu = await supabase.storage
            .from("media")
            .upload(posterPath, info.poster, { contentType: "image/jpeg", cacheControl: "31536000" });
          if (pu.error) posterPath = null; // poster is optional
          else uploaded.push(posterPath);
        }

        media = {
          media_type: info.kind,
          media_path: mediaPath,
          media_url: supabase.storage.from("media").getPublicUrl(mediaPath).data.publicUrl,
          poster_path: posterPath,
          poster_url: posterPath
            ? supabase.storage.from("media").getPublicUrl(posterPath).data.publicUrl
            : null,
          aspect_ratio: Number(info.aspectRatio.toFixed(4)),
        };
      }

      const payload = {
        title: title.trim(),
        caption: caption.trim(),
        description: description.trim(),
        category,
        status,
        published_at: new Date(`${date}T12:00:00Z`).toISOString(),
        ...media,
      };

      const { error: dbError } = post
        ? await supabase.from("posts").update(payload).eq("id", post.id)
        : await supabase.from("posts").insert(payload);
      if (dbError) throw new Error(dbError.message);

      // Replaced media: the old files are now orphaned, so remove them.
      if (post && file) {
        const old = [post.media_path, post.poster_path].filter(Boolean) as string[];
        if (old.length) await supabase.storage.from("media").remove(old);
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      // Don't leave uploaded files behind if the post itself didn't save.
      if (uploaded.length) await supabase.storage.from("media").remove(uploaded);
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(null);
    }
  }

  const showingNew = Boolean(previewUrl && info);
  const kind = showingNew ? info!.kind : post?.media_type;
  const src = showingNew ? previewUrl! : post?.media_url;

  return (
    <form
      className="editor"
      onSubmit={(e) => {
        e.preventDefault();
        save(post?.status ?? "draft");
      }}
    >
      <h1 className="display admin__h1">{editing ? "Edit post" : "New post"}</h1>

      <div className="editor__grid">
        <div className="editor__fields">
          <label className="field">
            <span className="field__label">Title</span>
            <input
              className="input"
              value={title}
              maxLength={120}
              required
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <label className="field">
            <span className="field__label">Caption</span>
            <input
              className="input"
              value={caption}
              maxLength={280}
              onChange={(e) => setCaption(e.target.value)}
            />
            <span className="field__hint">One line shown on the card. {caption.length}/280</span>
          </label>

          <label className="field">
            <span className="field__label">Description</span>
            <textarea
              className="input"
              rows={6}
              value={description}
              maxLength={5000}
              onChange={(e) => setDescription(e.target.value)}
            />
            <span className="field__hint">The story, tools, process. Shown in the detail view.</span>
          </label>

          <div className="editor__row">
            <label className="field">
              <span className="field__label">Category</span>
              <select
                className="input"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field__label">Date</span>
              <input
                className="input"
                type="date"
                value={date}
                required
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="editor__media">
          <span className="field__label">Media</span>
          <div className="editor__preview" style={{ aspectRatio: kind ? undefined : "4 / 3" }}>
            {src && kind === "image" && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt="Preview" />
            )}
            {src && kind === "video" && (
              <video
                key={src}
                src={src}
                controls
                muted
                playsInline
                poster={!showingNew ? (post?.poster_url ?? undefined) : undefined}
              />
            )}
            {!src && <p className="note">Preview appears here</p>}
          </div>
          <label className="field">
            <span className="btn btn--light btn--small" style={{ justifySelf: "start" }}>
              {src ? "Replace file" : "Choose file"}
            </span>
            <input
              className="sr-only"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm,video/quicktime"
              onChange={onPick}
            />
            <span className="field__hint">
              JPG, PNG, WebP, GIF, AVIF, MP4, WebM or MOV · up to 50 MB
              {file ? ` · ${file.name}` : ""}
            </span>
          </label>
        </div>
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="editor__actions">
        <button
          type="button"
          className="btn btn--light"
          disabled={busy !== null}
          onClick={() => save("draft")}
        >
          {busy === "draft" ? "Saving…" : "Save as draft"}
        </button>
        <button
          type="button"
          className="btn btn--red"
          disabled={busy !== null}
          onClick={() => save("published")}
        >
          {busy === "published" ? "Publishing…" : editing && post?.status === "published" ? "Save changes" : "Publish"}
        </button>
        <button
          type="button"
          className="btn btn--small btn--light"
          disabled={busy !== null}
          onClick={() => router.push("/admin")}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
