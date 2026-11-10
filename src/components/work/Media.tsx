"use client";

import Image from "next/image";
import { useRef } from "react";
import type { Post } from "@/lib/types";

type Props = {
  post: Pick<Post, "title" | "media_type" | "media_url" | "poster_url">;
  sizes?: string;
  priority?: boolean;
  /** Full video controls (modal) vs. silent hover preview (feed). */
  controls?: boolean;
};

const isSvg = (url: string) => /\.svg($|\?)/i.test(url);

export default function Media({
  post,
  sizes = "(min-width: 1100px) 33vw, (min-width: 700px) 50vw, 100vw",
  priority,
  controls,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  if (post.media_type === "video") {
    return (
      <video
        ref={videoRef}
        className="media media--video"
        src={post.media_url}
        poster={post.poster_url ?? undefined}
        controls={controls}
        muted={!controls}
        loop={!controls}
        playsInline
        preload="metadata"
        aria-label={post.title}
        onMouseEnter={() => !controls && videoRef.current?.play().catch(() => {})}
        onMouseLeave={() => {
          if (controls || !videoRef.current) return;
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }}
      />
    );
  }

  return (
    <Image
      className="media media--image"
      src={post.media_url}
      alt={post.title}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={isSvg(post.media_url)}
    />
  );
}
