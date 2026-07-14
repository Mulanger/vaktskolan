-- Account-bound learning progress for Clerk-authenticated Vaktskolan students.
-- Clerk must be enabled as a Supabase Third-Party Auth provider so auth.jwt()
-- contains the signed Clerk session token and its `sub` user id.

create table if not exists public.student_learning_progress (
  user_id text primary key default (auth.jwt() ->> 'sub'),
  completed_pages jsonb not null default '[]'::jsonb
    check (jsonb_typeof(completed_pages) = 'array'),
  quiz_answers jsonb not null default '{}'::jsonb
    check (jsonb_typeof(quiz_answers) = 'object'),
  quiz_submissions jsonb not null default '{}'::jsonb
    check (jsonb_typeof(quiz_submissions) = 'object'),
  final_exams jsonb not null default '{}'::jsonb
    check (jsonb_typeof(final_exams) = 'object'),
  schema_version integer not null default 1 check (schema_version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.student_learning_progress is
  'One RLS-protected learning-progress snapshot per authenticated Clerk user.';

comment on column public.student_learning_progress.completed_pages is
  'Stable course/module/lesson/page ids completed by deliberately moving forward with Nästa.';

create or replace function public.set_student_learning_progress_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists student_learning_progress_set_updated_at
  on public.student_learning_progress;
create trigger student_learning_progress_set_updated_at
  before update on public.student_learning_progress
  for each row
  execute function public.set_student_learning_progress_updated_at();

alter table public.student_learning_progress enable row level security;

revoke all on table public.student_learning_progress from anon;
grant select, insert, update, delete on table public.student_learning_progress to authenticated;
grant select, insert, update, delete on table public.student_learning_progress to service_role;

drop policy if exists "Students can read their own learning progress"
  on public.student_learning_progress;
create policy "Students can read their own learning progress"
  on public.student_learning_progress
  for select
  to authenticated
  using (user_id = (select auth.jwt() ->> 'sub'));

drop policy if exists "Students can create their own learning progress"
  on public.student_learning_progress;
create policy "Students can create their own learning progress"
  on public.student_learning_progress
  for insert
  to authenticated
  with check (user_id = (select auth.jwt() ->> 'sub'));

drop policy if exists "Students can update their own learning progress"
  on public.student_learning_progress;
create policy "Students can update their own learning progress"
  on public.student_learning_progress
  for update
  to authenticated
  using (user_id = (select auth.jwt() ->> 'sub'))
  with check (user_id = (select auth.jwt() ->> 'sub'));

drop policy if exists "Students can delete their own learning progress"
  on public.student_learning_progress;
create policy "Students can delete their own learning progress"
  on public.student_learning_progress
  for delete
  to authenticated
  using (user_id = (select auth.jwt() ->> 'sub'));
