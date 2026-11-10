// Client-side helpers for reading a chosen file before upload.

export const MAX_BYTES = 50 * 1024 * 1024; // matches the bucket limit in schema.sql
export const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

export type MediaInfo = {
  kind: "image" | "video";
  aspectRatio: number;
  poster: Blob | null;
};

export function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type))
    return "Unsupported file type. Use JPG, PNG, WebP, GIF, AVIF, MP4, WebM or MOV.";
  if (file.size > MAX_BYTES) return "File is too large. The limit is 50 MB.";
  return null;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image"));
    img.src = url;
  });
}

function loadVideoFrame(url: string): Promise<{ video: HTMLVideoElement }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.onerror = () => reject(new Error("video"));
    video.onloadeddata = () => {
      video.onseeked = () => resolve({ video });
      video.currentTime = Math.min(1, (video.duration || 2) / 2);
    };
    video.src = url;
  });
}

/** Reads dimensions and, for video, grabs a poster frame. */
export async function inspectMedia(file: File): Promise<MediaInfo> {
  const url = URL.createObjectURL(file);
  try {
    if (file.type.startsWith("image/")) {
      const img = await loadImage(url);
      return {
        kind: "image",
        aspectRatio: img.naturalWidth / img.naturalHeight || 1,
        poster: null,
      };
    }

    const { video } = await loadVideoFrame(url);
    const ratio = video.videoWidth / video.videoHeight || 16 / 9;
    let poster: Blob | null = null;
    try {
      const w = Math.min(video.videoWidth, 1280);
      const h = Math.round(w / ratio);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")?.drawImage(video, 0, 0, w, h);
      poster = await new Promise<Blob | null>((res) =>
        canvas.toBlob((b) => res(b), "image/jpeg", 0.82),
      );
    } catch {
      // Poster is optional; the player falls back to the first frame.
    }
    return { kind: "video", aspectRatio: ratio, poster };
  } finally {
    URL.revokeObjectURL(url);
  }
}
