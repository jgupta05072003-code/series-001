-- Make one account the owner of SERIES 001.
-- 1. Supabase -> Authentication -> Users -> "Add user" (tick "Auto Confirm User").
-- 2. Replace the email below with that user's email and run this in the SQL Editor.
-- 3. Authentication -> Sign In / Providers -> turn OFF "Allow new users to sign up".
insert into public.owners (user_id)
select id from auth.users where email = 'chaitanyaapj@gmail.com'
on conflict do nothing;

-- Check: should return one row.
select o.user_id, u.email from public.owners o join auth.users u on u.id = o.user_id;
