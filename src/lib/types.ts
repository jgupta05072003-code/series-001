export const CATEGORIES = [
  { value: "graphic-design", label: "Graphic Design" },
  { value: "photography", label: "Photography" },
  { value: "video", label: "Video" },
  { value: "experiments", label: "Experiments" },
] as const;

export type Category = (typeof CATEGORIES)[number]["value"];

export const categoryLabel = (value: string) =>
  CATEGORIES.find((c) => c.value === value)?.label ?? value;

export type Post = {
  id: string;
  title: string;
  caption: string;
  description: string;
  category: Category;
  media_type: "image" | "video";
  media_url: string;
  media_path: string | null;
  poster_url: string | null;
  poster_path: string | null;
  aspect_ratio: number;
  status: "draft" | "published";
  published_at: string;
  like_count: number;
  created_at: string;
  updated_at: string;
  // PostgREST embedded aggregate: comments(count)
  comments?: { count: number }[];
};

export type PostComment = {
  id: string;
  post_id: string;
  author_name: string;
  body: string;
  is_hidden: boolean;
  created_at: string;
};

export const commentCount = (post: Pick<Post, "comments">) =>
  post.comments?.[0]?.count ?? 0;

export const POST_SELECT = "*, comments(count)";
