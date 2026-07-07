-- Quiz Portal question bank schema for Vaktskolan.
-- Run this in Supabase SQL Editor, or apply it later with the Supabase CLI.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.quiz_collections (
  id text primary key,
  label text not null,
  description text not null default '',
  question_kind text not null
    check (question_kind in ('multiple_choice', 'flashcard', 'scenario', 'mixed')),
  course_id text
    check (course_id in ('vu1', 'vu2', 'general') or course_id is null),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.quiz_collections is
  'Quiz Portal collections. These rows are the Postgres equivalent of the old MongoDB collection buckets.';

comment on column public.quiz_collections.id is
  'Stable collection key used by the app, for example vu1_quiz or scenario_quiz.';

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  collection_id text not null references public.quiz_collections(id)
    on update cascade
    on delete restrict,
  external_id text,
  question_kind text not null
    check (question_kind in ('multiple_choice', 'flashcard', 'scenario')),
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  course_id text
    check (course_id in ('vu1', 'vu2', 'general') or course_id is null),
  module_number integer check (module_number is null or module_number > 0),
  title text,
  prompt text not null default '',
  scenario_context text,
  answer_text text,
  explanation text,
  difficulty smallint check (difficulty is null or difficulty between 1 and 5),
  tags text[] not null default '{}',
  source text,
  source_reference text,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.quiz_questions is
  'Empty question bank table for all Quiz Portal collections.';

comment on column public.quiz_questions.prompt is
  'Question text. For flashcards this is the front side.';

comment on column public.quiz_questions.answer_text is
  'Flashcard back side, short answer text, or fallback answer when options are not used.';

comment on column public.quiz_questions.external_id is
  'Stable source id for idempotent imports, for example scenario:1.';

create table if not exists public.quiz_answer_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.quiz_questions(id)
    on update cascade
    on delete cascade,
  label text not null,
  option_text text not null,
  is_correct boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (question_id, label)
);

comment on table public.quiz_answer_options is
  'Answer options for multiple choice, scenario quiz, and final exam questions.';

create unique index if not exists quiz_answer_options_one_correct_per_question
  on public.quiz_answer_options (question_id)
  where is_correct;

create index if not exists quiz_collections_sort_order_idx
  on public.quiz_collections (sort_order);

create index if not exists quiz_questions_collection_status_idx
  on public.quiz_questions (collection_id, status, sort_order);

create unique index if not exists quiz_questions_collection_external_id_idx
  on public.quiz_questions (collection_id, external_id);

create index if not exists quiz_questions_course_module_idx
  on public.quiz_questions (course_id, module_number)
  where module_number is not null;

create index if not exists quiz_questions_tags_idx
  on public.quiz_questions using gin (tags);

create index if not exists quiz_questions_metadata_idx
  on public.quiz_questions using gin (metadata);

create index if not exists quiz_answer_options_question_sort_idx
  on public.quiz_answer_options (question_id, sort_order);

create or replace function public.set_quiz_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists quiz_collections_set_updated_at on public.quiz_collections;
create trigger quiz_collections_set_updated_at
  before update on public.quiz_collections
  for each row
  execute function public.set_quiz_updated_at();

drop trigger if exists quiz_questions_set_updated_at on public.quiz_questions;
create trigger quiz_questions_set_updated_at
  before update on public.quiz_questions
  for each row
  execute function public.set_quiz_updated_at();

drop trigger if exists quiz_answer_options_set_updated_at on public.quiz_answer_options;
create trigger quiz_answer_options_set_updated_at
  before update on public.quiz_answer_options
  for each row
  execute function public.set_quiz_updated_at();

insert into public.quiz_collections (
  id,
  label,
  description,
  question_kind,
  course_id,
  sort_order
) values
  (
    'vu1_quiz',
    'VU1 quiz',
    'Frågor för VU1-modulen i Quiz Portal.',
    'multiple_choice',
    'vu1',
    10
  ),
  (
    'vu2_quiz',
    'VU2 quiz',
    'Frågor för VU2-modulen i Quiz Portal.',
    'multiple_choice',
    'vu2',
    20
  ),
  (
    'flashcards',
    'Flashcards',
    'Korta frågekort för lagrum, begrepp och repetition.',
    'flashcard',
    'general',
    30
  ),
  (
    'vanlig_quiz',
    'Vanlig quiz',
    'Allmänna quizfrågor om bevakning, säkerhet, brand och yrkesrollen.',
    'multiple_choice',
    'general',
    40
  ),
  (
    'scenario_quiz',
    'Scenario quiz',
    'Situationsbaserade frågor där eleven väljer lämplig åtgärd.',
    'scenario',
    'general',
    50
  ),
  (
    'slutprovet',
    'Slutprovet',
    'Frågebank för slutprovet.',
    'mixed',
    null,
    60
  )
on conflict (id) do update set
  label = excluded.label,
  description = excluded.description,
  question_kind = excluded.question_kind,
  course_id = excluded.course_id,
  sort_order = excluded.sort_order,
  is_active = true,
  updated_at = now();

alter table public.quiz_collections enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_answer_options enable row level security;

grant select on table public.quiz_collections to anon, authenticated;
grant select on table public.quiz_questions to anon, authenticated;
grant select on table public.quiz_answer_options to anon, authenticated;

grant select, insert, update, delete on table public.quiz_collections to service_role;
grant select, insert, update, delete on table public.quiz_questions to service_role;
grant select, insert, update, delete on table public.quiz_answer_options to service_role;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'quiz_collections'
      and policyname = 'Published quiz collections are readable'
  ) then
    execute 'create policy "Published quiz collections are readable"
      on public.quiz_collections
      for select
      to anon, authenticated
      using (is_active)';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'quiz_questions'
      and policyname = 'Published quiz questions are readable'
  ) then
    execute 'create policy "Published quiz questions are readable"
      on public.quiz_questions
      for select
      to anon, authenticated
      using (
        status = ''published''
        and exists (
          select 1
          from public.quiz_collections collections
          where collections.id = quiz_questions.collection_id
            and collections.is_active
        )
      )';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'quiz_answer_options'
      and policyname = 'Published quiz answer options are readable'
  ) then
    execute 'create policy "Published quiz answer options are readable"
      on public.quiz_answer_options
      for select
      to anon, authenticated
      using (
        exists (
          select 1
          from public.quiz_questions questions
          join public.quiz_collections collections
            on collections.id = questions.collection_id
          where questions.id = quiz_answer_options.question_id
            and questions.status = ''published''
            and collections.is_active
        )
      )';
  end if;
end;
$$;
