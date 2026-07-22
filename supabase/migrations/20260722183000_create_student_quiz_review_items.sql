-- Persistent spaced-repetition queue for Clerk-authenticated Vaktskolan students.
-- This migration is additive and keeps the question banks and existing history intact.

alter table public.student_quiz_attempts
  drop constraint if exists student_quiz_attempts_source_type_check;

alter table public.student_quiz_attempts
  add constraint student_quiz_attempts_source_type_check
  check (source_type in ('module_quiz', 'portal_vu1', 'portal_vu2', 'portal_scenario', 'review'));

alter table public.student_quiz_answers
  drop constraint if exists student_quiz_answers_source_type_check;

alter table public.student_quiz_answers
  add constraint student_quiz_answers_source_type_check
  check (source_type in ('module_quiz', 'portal_vu1', 'portal_vu2', 'portal_scenario', 'review'));

create table if not exists public.student_quiz_review_items (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default (auth.jwt() ->> 'sub'),
  question_id uuid references public.quiz_questions(id)
    on update cascade
    on delete set null,
  question_key text not null,
  origin_source_type text not null
    check (origin_source_type in ('module_quiz', 'portal_vu1', 'portal_vu2', 'portal_scenario')),
  course_id text not null
    check (course_id in ('vu1', 'vu2', 'general')),
  module_number integer check (module_number is null or module_number > 0),
  topic_keys text[] not null default '{}',
  topic_labels text[] not null default '{}',
  context_key text,
  context_label text,
  stage text not null default 'due'
    check (stage in ('due', 'waiting', 'mastered')),
  correct_confirmations integer not null default 0
    check (correct_confirmations between 0 and 2),
  due_at timestamptz,
  last_answer_correct boolean not null default false,
  last_answered_at timestamptz not null default now(),
  mastered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, question_key),
  check (
    (stage = 'due' and correct_confirmations = 0 and due_at is not null and mastered_at is null)
    or (stage = 'waiting' and correct_confirmations = 1 and due_at is not null and mastered_at is null)
    or (stage = 'mastered' and correct_confirmations = 2 and due_at is null and mastered_at is not null)
  )
);

comment on table public.student_quiz_review_items is
  'Current per-question spaced-repetition state. Wrong answers are due immediately; two delayed confirmations master the item.';

comment on column public.student_quiz_review_items.question_key is
  'Stable key shared with student_quiz_answers, including synthetic keys for module questions.';

create index if not exists student_quiz_review_items_user_due_idx
  on public.student_quiz_review_items (user_id, stage, due_at);

create index if not exists student_quiz_review_items_topics_idx
  on public.student_quiz_review_items using gin (topic_keys);

create or replace function public.set_student_quiz_review_item_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists student_quiz_review_items_set_updated_at
  on public.student_quiz_review_items;
create trigger student_quiz_review_items_set_updated_at
  before update on public.student_quiz_review_items
  for each row
  execute function public.set_student_quiz_review_item_updated_at();

alter table public.student_quiz_review_items enable row level security;

revoke all on table public.student_quiz_review_items from anon;
grant select, insert, update, delete on table public.student_quiz_review_items to authenticated;
grant select, insert, update, delete on table public.student_quiz_review_items to service_role;

drop policy if exists "Students can read their own review items"
  on public.student_quiz_review_items;
create policy "Students can read their own review items"
  on public.student_quiz_review_items
  for select
  to authenticated
  using (user_id = (select auth.jwt() ->> 'sub'));

drop policy if exists "Students can create their own review items"
  on public.student_quiz_review_items;
create policy "Students can create their own review items"
  on public.student_quiz_review_items
  for insert
  to authenticated
  with check (user_id = (select auth.jwt() ->> 'sub'));

drop policy if exists "Students can update their own review items"
  on public.student_quiz_review_items;
create policy "Students can update their own review items"
  on public.student_quiz_review_items
  for update
  to authenticated
  using (user_id = (select auth.jwt() ->> 'sub'))
  with check (user_id = (select auth.jwt() ->> 'sub'));

drop policy if exists "Students can delete their own review items"
  on public.student_quiz_review_items;
create policy "Students can delete their own review items"
  on public.student_quiz_review_items
  for delete
  to authenticated
  using (user_id = (select auth.jwt() ->> 'sub'));
