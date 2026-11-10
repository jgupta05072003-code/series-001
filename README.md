# SERIES 001

A personal visual archive for Chaitanya Gupta: graphic design, photography, video and experiments. Built as a bold, editorial, Montserrat-only site with a public Instagram-style feed and a private admin dashboard.

**Stack:** Next.js 16 (App Router, TypeScript) · Supabase (Auth, Postgres, Storage, Row Level Security) · plain CSS.

## Pages

| Route | What it is |
| --- | --- |
| `/` | Cover / homepage |
| `/about` | "Who the hell is Chaitanya?", education timeline, Beyond the Frame |
| `/work` | Dynamic masonry feed from the database: filters, detail modal, likes, comments, share (deep links via `?post=<id>`) |
| `/contact` | Email, LinkedIn, editable social links |
| `/admin` | Owner-only control room: upload, edit, drafts, publish, delete, moderate comments, engagement stats |

## Setup

1. `npm install`
2. Create a project at [supabase.com](https://supabase.com).
3. SQL Editor: run `supabase/schema.sql` (tables, RLS policies, storage bucket, like function).
4. Authentication → Users → **Add user** (tick *Auto Confirm User*) with the email/password you'll use to sign in.
5. SQL Editor: run `supabase/owner.sql` (edit the email first). This makes that account the only owner.
6. Authentication → Sign In / Providers → turn **off** "Allow new users to sign up".
7. Copy `.env.example` to `.env.local` and fill in the project URL and the **anon/publishable** key (Settings → API).
8. Optional: run `supabase/seed.sql` for six sample posts (they point at `public/samples`; delete them from the dashboard when you have real work).
9. `npm run dev`, open `http://localhost:3000`, then `/admin`.

### Social links

Set `NEXT_PUBLIC_INSTAGRAM_URL`, `NEXT_PUBLIC_BEHANCE_URL`, `NEXT_PUBLIC_PINTEREST_URL` (or edit `src/lib/site.ts`). Until set, those cards open the platform home page and say "Handle coming soon".

## Security model

- **No secret keys in the app.** Only the public anon key is used; the `service_role` key is never needed.
- **Row Level Security everywhere.** The public can read published posts and visible comments, and add comments to published posts. Only users listed in `public.owners` can create/edit/delete posts, moderate comments, or write to the `media` storage bucket. `owners` has no write policies, so nobody can promote themselves.
- **Three layers on `/admin`:** the proxy redirects signed-out visitors, the admin layout re-checks `is_owner()` on the server, and the database enforces the same rule via RLS.
- **Likes** go through a `security definer` function keyed by an anonymous per-browser id; the `likes` table itself is closed to clients.
- **Comments** have length limits in the database and a honeypot field. There is no rate limiting; if spam appears, hide/delete from the dashboard or add Supabase CAPTCHA / an Edge Function.
- Uploads are limited to 50 MB and image/video MIME types by the bucket itself.

## Project layout

```
src/app/            routes (public pages, admin/(panel) guarded group, sitemap, robots)
src/components/     Nav, Footer, Reveal, Marquee, work/* (feed, card, modal), admin/*
src/lib/            site content, types, Supabase clients, media + format helpers
src/styles/         per-page CSS (design tokens live in app/globals.css)
supabase/           schema.sql, owner.sql, seed.sql
```

Typography: Montserrat only (weights 300–900, plus italic), loaded with `next/font` and a system sans fallback.

## Deploy to Render

1. Push is already on GitHub. In Render: **New → Blueprint**, connect GitHub, pick this repo (`render.yaml` is picked up automatically).
2. Fill in the prompted env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_SITE_URL` (the `https://series-001.onrender.com` URL Render gives you; the social URLs can stay blank).
3. These `NEXT_PUBLIC_*` values are baked in at build time, so after changing one, trigger a new deploy.
4. In Supabase → Authentication → URL Configuration, set the Site URL to the Render URL.

The free plan sleeps after inactivity, so the first visit after a while is slow.
