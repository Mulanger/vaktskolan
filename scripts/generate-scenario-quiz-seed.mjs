import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const DEFAULT_INPUT = "D:/vaktarskolan_scenariobank_300.json";
const DEFAULT_OUTPUT = "supabase/seeds/20260705143000_seed_scenario_quiz_300.sql";
const JSON_TAG = "$vakt_scenario_json$";

function parseArgs(argv) {
  const args = {
    input: DEFAULT_INPUT,
    output: DEFAULT_OUTPUT,
    status: "draft",
  };

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--input") args.input = argv[++index];
    else if (arg === "--output") args.output = argv[++index];
    else if (arg === "--status") args.status = argv[++index];
  }

  if (!["draft", "published", "archived"].includes(args.status)) {
    throw new Error("--status must be one of draft, published, or archived.");
  }

  return args;
}

function assertScenarioBank(data) {
  if (!Array.isArray(data.scenarios)) {
    throw new Error("Expected JSON to contain a scenarios array.");
  }

  if (data.scenarios.length !== 300) {
    throw new Error(`Expected 300 scenarios, got ${data.scenarios.length}.`);
  }

  const ids = new Set();
  data.scenarios.forEach((scenario, index) => {
    const id = Number(scenario.id);
    if (!Number.isInteger(id)) throw new Error(`Scenario at index ${index} is missing a numeric id.`);
    if (ids.has(id)) throw new Error(`Duplicate scenario id: ${id}.`);
    ids.add(id);

    if (!Array.isArray(scenario.options) || scenario.options.length !== 4) {
      throw new Error(`Scenario ${id} must have exactly four options.`);
    }

    if (!Number.isInteger(scenario.correctIndex) || scenario.correctIndex < 0 || scenario.correctIndex > 3) {
      throw new Error(`Scenario ${id} has invalid correctIndex.`);
    }
  });
}

function sqlQuote(value) {
  return String(value).replaceAll("'", "''");
}

function buildSql(jsonText, status) {
  if (jsonText.includes(JSON_TAG)) {
    throw new Error(`Input JSON cannot contain the SQL dollar quote tag ${JSON_TAG}.`);
  }

  return `-- Seed the scenario_quiz collection with the 300-question scenario bank.
-- Generated from D:/vaktarskolan_scenariobank_300.json.
-- Questions are inserted as ${status}. Change --status to published only after review.

begin;

drop table if exists vakt_scenario_seed_payload;

create temp table vakt_scenario_seed_payload (
  data jsonb not null
) on commit drop;

insert into vakt_scenario_seed_payload (data) values (
${JSON_TAG}
${jsonText}
${JSON_TAG}::jsonb
);

insert into public.quiz_collections (
  id,
  label,
  description,
  question_kind,
  course_id,
  sort_order
) values (
  'scenario_quiz',
  'Scenario quiz',
  'Situationsbaserade frågor där eleven väljer lämplig åtgärd.',
  'scenario',
  'general',
  50
) on conflict (id) do update set
  label = excluded.label,
  description = excluded.description,
  question_kind = excluded.question_kind,
  course_id = excluded.course_id,
  sort_order = excluded.sort_order,
  is_active = true,
  updated_at = now();

with payload as (
  select data from vakt_scenario_seed_payload
),
scenarios as (
  select scenario.value as item
  from payload
  cross join jsonb_array_elements(payload.data -> 'scenarios') with ordinality as scenario(value, ordinality)
)
insert into public.quiz_questions (
  collection_id,
  external_id,
  question_kind,
  status,
  course_id,
  title,
  prompt,
  scenario_context,
  explanation,
  tags,
  source,
  source_reference,
  sort_order,
  metadata
)
select
  'scenario_quiz',
  'scenario:' || (item ->> 'id'),
  'scenario',
  '${sqlQuote(status)}',
  'general',
  item ->> 'title',
  item ->> 'scenario',
  item ->> 'categoryLabel',
  item ->> 'explanation',
  array(
    select distinct tag
    from (
      select jsonb_array_elements_text(coalesce(item -> 'tags', '[]'::jsonb)) as tag
      union all select item ->> 'category'
      union all select item ->> 'level'
      union all select item ->> 'source'
    ) tags
    where tag is not null and tag <> ''
    order by tag
  ),
  item ->> 'source',
  'scenario:' || (item ->> 'id'),
  (item ->> 'id')::integer,
  jsonb_strip_nulls(jsonb_build_object(
    'original_id', (item ->> 'id')::integer,
    'category', item ->> 'category',
    'category_label', item ->> 'categoryLabel',
    'level', item ->> 'level',
    'source', item ->> 'source',
    'correct', item ->> 'correct',
    'correct_index', (item ->> 'correctIndex')::integer,
    'bank_name', payload.data -> 'meta' ->> 'name',
    'bank_version', payload.data -> 'meta' ->> 'version',
    'generated', payload.data -> 'meta' ->> 'generated'
  ))
from scenarios
cross join payload
on conflict (collection_id, external_id) do update set
  question_kind = excluded.question_kind,
  status = excluded.status,
  course_id = excluded.course_id,
  title = excluded.title,
  prompt = excluded.prompt,
  scenario_context = excluded.scenario_context,
  explanation = excluded.explanation,
  tags = excluded.tags,
  source = excluded.source,
  source_reference = excluded.source_reference,
  sort_order = excluded.sort_order,
  metadata = excluded.metadata,
  updated_at = now();

with payload as (
  select data from vakt_scenario_seed_payload
),
scenarios as (
  select scenario.value as item
  from payload
  cross join jsonb_array_elements(payload.data -> 'scenarios') with ordinality as scenario(value, ordinality)
),
options as (
  select
    questions.id as question_id,
    chr(64 + option.ordinality::integer) as label,
    option.value #>> '{}' as option_text,
    (option.ordinality::integer - 1) = (scenarios.item ->> 'correctIndex')::integer as is_correct,
    option.ordinality::integer as sort_order
  from scenarios
  join public.quiz_questions questions
    on questions.collection_id = 'scenario_quiz'
    and questions.external_id = 'scenario:' || (scenarios.item ->> 'id')
  cross join jsonb_array_elements(scenarios.item -> 'options') with ordinality as option(value, ordinality)
)
insert into public.quiz_answer_options (
  question_id,
  label,
  option_text,
  is_correct,
  sort_order
)
select
  question_id,
  label,
  option_text,
  is_correct,
  sort_order
from options
on conflict (question_id, label) do update set
  option_text = excluded.option_text,
  is_correct = excluded.is_correct,
  sort_order = excluded.sort_order,
  updated_at = now();

commit;
`;
}

const args = parseArgs(process.argv);
const inputPath = resolve(args.input);
const outputPath = resolve(args.output);
const jsonText = readFileSync(inputPath, "utf8");
const data = JSON.parse(jsonText);

assertScenarioBank(data);
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, buildSql(JSON.stringify(data, null, 2), args.status), "utf8");

console.log(`Wrote ${outputPath}`);
