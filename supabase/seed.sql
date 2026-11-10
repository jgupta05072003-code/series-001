-- OPTIONAL sample content so the Work page isn't empty on day one.
-- The images are abstract shapes served from /public/samples.
-- Remove them any time from the admin dashboard, or run:
--   delete from public.posts where media_url like '/samples/%';
insert into public.posts (title, caption, description, category, media_type, media_url, aspect_ratio, status, published_at)
values
  ('SAMPLE / BLOCK PARTY', 'Squares, circles and one very loud triangle.',
   'A first pass at building a poster only out of primitive shapes. Sample content: delete me.',
   'graphic-design', 'image', '/samples/sample-1.svg', 0.8, 'published', now() - interval '6 days'),
  ('SAMPLE / TARGET PRACTICE', 'Concentric everything.',
   'Testing how much tension a few rings can hold. Sample content: delete me.',
   'experiments', 'image', '/samples/sample-2.svg', 1, 'published', now() - interval '5 days'),
  ('SAMPLE / STRIPE THEORY', 'Tall, stripey, unbothered.',
   'Vertical rhythm study in the SERIES 001 palette. Sample content: delete me.',
   'graphic-design', 'image', '/samples/sample-3.svg', 0.6, 'published', now() - interval '4 days'),
  ('SAMPLE / HORIZON', 'Wide frame, flat sun.',
   'A landscape composition to check how wide posts behave in the grid. Sample content: delete me.',
   'photography', 'image', '/samples/sample-4.svg', 1.5, 'published', now() - interval '3 days'),
  ('SAMPLE / DOT MATRIX', 'Grid, but make it chaotic.',
   'Halftone-ish dots, one rule broken. Sample content: delete me.',
   'experiments', 'image', '/samples/sample-5.svg', 1, 'published', now() - interval '2 days'),
  ('SAMPLE / STARBURST', 'Pop art, minus the pop.',
   'A sticker-style burst on a flat field. Sample content: delete me.',
   'graphic-design', 'image', '/samples/sample-6.svg', 0.75, 'published', now() - interval '1 day');
