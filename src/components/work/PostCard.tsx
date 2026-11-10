"use client";

import { formatDate, pad } from "@/lib/format";
import { categoryLabel, commentCount, type Post } from "@/lib/types";
import Media from "./Media";

const ACCENTS = ["red", "blue", "green", "orange"] as const;

export default function PostCard({
  post,
  index,
  number,
  liked,
  onOpen,
  onLike,
}: {
  post: Post;
  index: number;
  number: number;
  liked: boolean;
  onOpen: () => void;
  onLike: () => void;
}) {
  const accent = ACCENTS[index % ACCENTS.length];
  // Keep extreme ratios from wrecking the rhythm of the columns.
  const ratio = Math.min(Math.max(post.aspect_ratio, 0.6), 1.8);
  const tilt = index % 3 === 0 ? "-0.6deg" : index % 3 === 1 ? "0.5deg" : "0deg";

  return (
    <li className={`card card--${accent}`} style={{ "--tilt": tilt } as React.CSSProperties}>
      <button
        type="button"
        className="card__open"
        onClick={onOpen}
        aria-label={`Open ${post.title}`}
      >
        <div className="card__media" style={{ aspectRatio: String(ratio) }}>
          <Media post={post} priority={index < 3} />
          <span className="card__num">№ {pad(number)}</span>
          {post.media_type === "video" && (
            <span className="card__play" aria-hidden="true">
              ▶
            </span>
          )}
        </div>
        <div className="card__body">
          <span className="tag">{categoryLabel(post.category)}</span>
          <h2 className="card__title">{post.title}</h2>
          {post.caption && <p className="card__caption">{post.caption}</p>}
          <p className="caption card__date">{formatDate(post.published_at)}</p>
        </div>
      </button>
      <div className="card__bar">
        <button
          type="button"
          className="card__like"
          aria-pressed={liked}
          aria-label={`${liked ? "Unlike" : "Like"} ${post.title}. ${post.like_count} likes`}
          onClick={onLike}
        >
          <span aria-hidden="true">{liked ? "♥" : "♡"}</span> {post.like_count}
        </button>
        <button type="button" className="card__comments" onClick={onOpen}>
          <span aria-hidden="true">✎</span> {commentCount(post)}
          <span className="sr-only"> comments</span>
        </button>
      </div>
    </li>
  );
}
