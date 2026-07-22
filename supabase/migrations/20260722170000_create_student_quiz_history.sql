-- Append-only quiz history for Clerk-authenticated Vaktskolan students.
-- This migration is additive: it does not alter quiz_questions,
-- student_learning_progress, or any existing course-progress data.

create table if not exists public.student_quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default (auth.jwt() ->> 'sub'),
  source_type text not null
    check (source_type in ('module_quiz', 'portal_vu1', 'portal_vu2', 'portal_scenario')),
  source_ref text not null,
  collection_id text references public.quiz_collections(id)
    on update cascade
    on delete set null,
  course_id text not null
    check (course_id in ('vu1', 'vu2', 'general')),
  module_number integer check (module_number is null or module_number > 0),
  question_count integer not null default 0 check (question_count >= 0),
  correct_count integer not null default 0 check (correct_count >= 0),
  completed boolean not null default false,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, source_type, source_ref),
  check (correct_count <= question_count)
);

comment on table public.student_quiz_attempts is
  'Append-only quiz sessions from module quizzes and the VU1, VU2, and scenario banks in Quizportalen.';

comment on column public.student_quiz_attempts.source_ref is
  'Stable client-generated session reference used to make writes idempotent without changing existing quiz data.';

create table if not exists public.student_quiz_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.student_quiz_attempts(id)
    on update cascade
    on delete cascade,
  user_id text not null default (auth.jwt() ->> 'sub'),
  question_id uuid references public.quiz_questions(id)
    on update cascade
    on delete set null,
  question_key text not null,
  source_type text not null
    check (source_type in ('module_quiz', 'portal_vu1', 'portal_vu2', 'portal_scenario')),
  course_id text not null
    check (course_id in ('vu1', 'vu2', 'general')),
  module_number integer check (module_number is null or module_number > 0),
  topic_keys text[] not null default '{}',
  topic_labels text[] not null default '{}',
  context_key text,
  context_label text,
  selected_answer text,
  correct_answer text,
  is_correct boolean not null,
  timed_out boolean not null default false,
  answered_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (attempt_id, question_key)
);

comment on table public.student_quiz_answers is
  'One immutable graded answer per question and attempt. Topic snapshots power accuracy and repetition recommendations.';

comment on column public.student_quiz_answers.topic_keys is
  'Stable knowledge-area keys. Scenario context is stored separately so a location such as butik is not mistaken for the tested skill.';

create index if not exists student_quiz_attempts_user_started_idx
  on public.student_quiz_attempts (user_id, started_at desc);

create index if not exists student_quiz_attempts_user_source_idx
  on public.student_quiz_attempts (user_id, source_type, started_at desc);

create index if not exists student_quiz_answers_user_answered_idx
  on public.student_quiz_answers (user_id, answered_at desc);

create index if not exists student_quiz_answers_attempt_idx
  on public.student_quiz_answers (attempt_id);

create index if not exists student_quiz_answers_topics_idx
  on public.student_quiz_answers using gin (topic_keys);

create or replace function public.set_student_quiz_attempt_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists student_quiz_attempts_set_updated_at
  on public.student_quiz_attempts;
create trigger student_quiz_attempts_set_updated_at
  before update on public.student_quiz_attempts
  for each row
  execute function public.set_student_quiz_attempt_updated_at();

alter table public.student_quiz_attempts enable row level security;
alter table public.student_quiz_answers enable row level security;

revoke all on table public.student_quiz_attempts from anon;
revoke all on table public.student_quiz_answers from anon;
grant select, insert, update, delete on table public.student_quiz_attempts to authenticated;
grant select, insert, update, delete on table public.student_quiz_answers to authenticated;
grant select, insert, update, delete on table public.student_quiz_attempts to service_role;
grant select, insert, update, delete on table public.student_quiz_answers to service_role;

drop policy if exists "Students can read their own quiz attempts"
  on public.student_quiz_attempts;
create policy "Students can read their own quiz attempts"
  on public.student_quiz_attempts
  for select
  to authenticated
  using (user_id = (select auth.jwt() ->> 'sub'));

drop policy if exists "Students can create their own quiz attempts"
  on public.student_quiz_attempts;
create policy "Students can create their own quiz attempts"
  on public.student_quiz_attempts
  for insert
  to authenticated
  with check (user_id = (select auth.jwt() ->> 'sub'));

drop policy if exists "Students can update their own quiz attempts"
  on public.student_quiz_attempts;
create policy "Students can update their own quiz attempts"
  on public.student_quiz_attempts
  for update
  to authenticated
  using (user_id = (select auth.jwt() ->> 'sub'))
  with check (user_id = (select auth.jwt() ->> 'sub'));

drop policy if exists "Students can delete their own quiz attempts"
  on public.student_quiz_attempts;
create policy "Students can delete their own quiz attempts"
  on public.student_quiz_attempts
  for delete
  to authenticated
  using (user_id = (select auth.jwt() ->> 'sub'));

drop policy if exists "Students can read their own quiz answers"
  on public.student_quiz_answers;
create policy "Students can read their own quiz answers"
  on public.student_quiz_answers
  for select
  to authenticated
  using (user_id = (select auth.jwt() ->> 'sub'));

drop policy if exists "Students can create answers for their own attempts"
  on public.student_quiz_answers;
create policy "Students can create answers for their own attempts"
  on public.student_quiz_answers
  for insert
  to authenticated
  with check (
    user_id = (select auth.jwt() ->> 'sub')
    and exists (
      select 1
      from public.student_quiz_attempts attempts
      where attempts.id = attempt_id
        and attempts.user_id = (select auth.jwt() ->> 'sub')
    )
  );

drop policy if exists "Students can update answers for their own attempts"
  on public.student_quiz_answers;
create policy "Students can update answers for their own attempts"
  on public.student_quiz_answers
  for update
  to authenticated
  using (user_id = (select auth.jwt() ->> 'sub'))
  with check (
    user_id = (select auth.jwt() ->> 'sub')
    and exists (
      select 1
      from public.student_quiz_attempts attempts
      where attempts.id = attempt_id
        and attempts.user_id = (select auth.jwt() ->> 'sub')
    )
  );

drop policy if exists "Students can delete their own quiz answers"
  on public.student_quiz_answers;
create policy "Students can delete their own quiz answers"
  on public.student_quiz_answers
  for delete
  to authenticated
  using (user_id = (select auth.jwt() ->> 'sub'));
