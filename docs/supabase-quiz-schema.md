# Supabase Quiz-Schema

Projektet har en databasmigration för Quiz Portalens frågebank:

```text
supabase/migrations/20260705133000_create_quiz_collections.sql
```

Kör den i Supabase Dashboard SQL Editor för projektet `gyaqbvelqwavvvmqboxa`, eller applicera den senare med Supabase CLI när projektet är länkat.

Status 2026-07-05: migrationen är körd i Supabase-molndatabasen via Postgres pooler-anslutning.

## Vad Den Skapar

Schemat använder Postgres-tabeller i stället för en tabell per MongoDB-liknande collection:

- `quiz_collections`: de sex collection-buckets som Quiz Portal behöver.
- `quiz_questions`: den gemensamma, tomma frågebanken.
- `quiz_answer_options`: svarsalternativ för multiple choice, scenarioquiz och slutprov.

Seedade collection-rader:

- `vu1_quiz`
- `vu2_quiz`
- `flashcards`
- `vanlig_quiz`
- `scenario_quiz`
- `slutprovet`

Collections finns, men `quiz_questions` och `quiz_answer_options` startar tomma.

## Säkerhet

RLS är aktiverat på alla tre tabeller.

Anonyma och autentiserade klienter kan bara läsa aktiva collections och publicerade frågor/svarsalternativ. Det finns inga client-side write policies. Inserts och updates ska göras via Supabase Dashboard, SQL Editor eller ett framtida server-side adminflöde som använder secret key.

## Snabb Verifiering

Efter att migrationen har körts, öppna appen via `node server.mjs` och kör detta i webbläsarens console:

```js
await window.vaktskolanSupabase.select("quiz_collections", {
  select: "id,label,question_kind,course_id,sort_order",
  order: "sort_order.asc",
});
```

Det ska returnera de sex collection-raderna.

## Import Av Scenariofrågor

Scenariofrågorna från `D:/vaktarskolan_scenariobank_300.json` är förberedda för `scenario_quiz`.

Status 2026-07-05: seed/import är körd i Supabase-molndatabasen.

Kör först schema-migrationen:

```text
supabase/migrations/20260705133000_create_quiz_collections.sql
```

Kör sedan seedfilen i Supabase SQL Editor:

```text
supabase/seeds/20260705143000_seed_scenario_quiz_300.sql
```

Seedfilen lägger in:

- 300 rader i `quiz_questions`
- 1200 rader i `quiz_answer_options`
- `collection_id = 'scenario_quiz'`
- `status = 'draft'`

`draft` är valt eftersom JSON-filens metadata säger att innehållet ska juridikgranskas före publicering. Efter granskning kan frågorna publiceras med SQL:

```sql
update public.quiz_questions
set status = 'published'
where collection_id = 'scenario_quiz';
```

Det finns även ett REST-importskript som kan köras efter att tabellerna finns i Supabase:

```powershell
node scripts/import-scenario-quiz.mjs
```

Vill du importera direkt som publicerat material:

```powershell
node scripts/import-scenario-quiz.mjs --status published
```
