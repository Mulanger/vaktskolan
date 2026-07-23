# UPPDRAG: Driftsätt de balanserade quizbankerna i Vaktskolan

## Bakgrund

Alla 528 quizfrågor (VU1 154, VU2 74, scenario 300) har skrivits om för att eliminera "längdläckage" — rätt svar var tidigare nästan alltid det längsta alternativet, vilket gjorde quizen gissningsbara. Omskrivningen är klar och godkänd av produktägaren. **Endast svarsalternativens texter och förklaringstexterna har ändrats.** Frågetexter, id:n, `correct`-bokstav, `correctIndex`, ordning och antal är oförändrade. Din uppgift är att föra ut ändringarna i hela datakedjan och lägga till en regressionsvakt.

## Källfiler (färdiga, godkända)

I `D:\vaktskolan\quiz-balans\data\`:

- `vu1_fixed.json` — komplett ersättning för `vu1quiz.json` (154 frågor, samma schema)
- `vu2_fixed.json` — komplett ersättning för `vu2quiz.json` (74 frågor, samma schema)
- `scenariobank_300_fixed.json` — komplett scenariobank (300 frågor, samma schema som JSON-payloaden i seed-SQL:en)

Granskningsfiler med före/efter per fråga finns i `D:\vaktskolan\quiz-balans\*.md` som referens. Läs även `agent.md` i repo-roten innan du börjar — särskilt avsnitten om quizhistorik, Quizportalen och kända gotchas.

## Orubbliga invarianter

1. **Ändra aldrig** frågetext, `id`, `correct`, `correctIndex`, alternativens ordning, moduletillhörighet eller frågornas ordning/numrering. Endast `options`-texter och `explanation` skiljer sig från nuläget.
2. Antalen måste bestå exakt: 154 / 74 / 300, alltid 4 alternativ med exakt 1 rätt. `buildQuizPortalQuiz()` i `app.js` kastar annars fel och portalen slutar fungera.
3. Supabase-uppdateringar ska ske som **upsert på befintliga nycklar** (`external_id` för portal-bankerna), aldrig delete + insert. Elevernas repetitionskö refererar `portal:<radens-id>` och modulnycklar `module:vu1:M:N` — bevarade id:n och bevarad frågenumrering i `utbildning.md` är det som håller elevdata levande.
4. Rör inte tabellerna `student_*` och inga elevdata.
5. `.env` innehåller riktiga nycklar — logga/committa dem aldrig.

## Steg 1: Uppdatera `utbildning.md` (källan för VU1/VU2)

`utbildning.md` innehåller samma 228 frågor (VU1: modulquiz i modul 1–11 + sluttestbank i modul 12; VU2: modulquiz i modul 1–6 + sluttestbank i modul 7). Formatet per fråga:

```
**Fråga N.** Frågetext?
A) Alternativ A
B) Alternativ B
C) Alternativ C
D) Alternativ D
**Rätt svar: X.** Förklaring.
```

För varje fråga i `vu1_fixed.json`/`vu2_fixed.json`: hitta motsvarande fråga i `utbildning.md` (matcha på modul + frågetext — frågetexterna är oförändrade och unika), ersätt de fyra alternativraderna med de nya texterna (A–D i JSON-fältet `options` ordning) och ersätt förklaringen efter `**Rätt svar: X.**` med nya `explanation`. Bokstaven X är oförändrad. Skriv ett script för detta i stället för att handredigera — verifiera efteråt att exakt 228 frågor uppdaterats och att `**Rätt svar:`-raderna är oförändrade.

Behåll UTF-8 utan BOM. Parsern kräver exakt `A)`-format och `**Rätt svar: X.**` — bevara formatet tecken för tecken.

## Steg 2: Ersätt JSON-bankerna i repo-roten

Ersätt `questions`-arrayen i `D:\vaktskolan\vu1quiz.json` med innehållet i `vu1_fixed.json` och motsvarande för `vu2quiz.json`. Behåll/uppdatera `meta` (bumpa gärna `version` till 1.1 och `generated`-datum). Kopiorna i `public/legacy-platform/` regenereras av `scripts/prepare-public-assets.mjs` vid build — rör dem inte manuellt.

## Steg 3: Uppdatera Supabase

1. **VU1/VU2:** kör `npm run import:quiz-portal`. Scriptet upsertar `quiz_questions` på `(collection_id, external_id)` och `quiz_answer_options` på `(question_id, label)` — id:n bevaras.
2. **Scenario:** använd `scripts/import-scenario-quiz.mjs` med `quiz-balans/data/scenariobank_300_fixed.json` som input (kontrollera scriptets in-parametrar; det ska upserta på samma sätt). Regenerera därefter seed-filen så att repo och databas stämmer överens: `node scripts/generate-scenario-quiz-seed.mjs --input quiz-balans/data/scenariobank_300_fixed.json --output supabase/seeds/20260705143000_seed_scenario_quiz_300.sql --status published`.
3. Verifiera via REST (anon-nyckel, read-only) att antalet publicerade frågor per collection fortfarande är exakt vu1_quiz=154, vu2_quiz=74, scenario_quiz=300, och att svarsalternativen är 616/296/1200.

## Steg 4: Cache-bump

Enligt `agent.md`: bumpa markdown-fetchens query string i `app.js` (`utbildning.md?v=...` → nytt datum) samt CSS/JS query strings i `index.html` om `app.js` ändrats. Kör `npm run content:manifest` om release-manifestet valideras mot `utbildning.md`-innehållet (kontrollera `validate:release`).

## Steg 5: Regressionsvakt `test:quiz-balance`

Skapa `scripts/test-quiz-balance.mjs` som läser `vu1quiz.json`, `vu2quiz.json` och scenario-seedens JSON-payload och **failar** (exit 1) om något av följande gäller:

- Någon fråga har ≠ 4 alternativ eller ≠ 1 rätt svar.
- Någon fråga har ratio > 1,35 mellan rätt svarets teckenlängd och längsta felsvarets.
- Andelen frågor per bank där rätt svar är strikt längst överstiger 40 % (nuläge: 20–26 %, slump = 25 %).

Lägg till `"test:quiz-balance": "node scripts/test-quiz-balance.mjs"` i `package.json` och kedja in det i `prebuild` och `test` (samma mönster som `test:platform-guards`). Verifiera att det passerar på nuvarande data och att det failar om du temporärt saboterar en fråga.

## Steg 6: Verifiering (obligatorisk)

1. `node --check app.js` och `npm test` (kör hela sviten inkl. typecheck, lint, validate:content, validate:release, platform-guards).
2. Browsertest: öppna plattformen, kör ett VU1-modulquiz och ett Quizportal-pass (VU1, VU2, scenario) — nya alternativtexter ska synas, rätt svar ska rättas korrekt, förklaringarna ska visas.
3. Repetitionsflödet: svara fel på en portalfråga → kontrollera att den dyker upp i "Att repetera" och går att öppna (bekräftar att frågenycklarna överlevde).
4. Slutprov: starta ett VU1-slutprov och kontrollera att 30 frågor dras utan fel.
5. Uppdatera `agent.md` med ett daterat avsnitt som beskriver quizbalanseringen, de nya invarianten (längdband ≤1,35, max 40 % längst) och att `test:quiz-balance` nu ingår i prebuild.

## Kända fällor

- Om `utbildning.md`-parsningen går sönder laddar dashboarden men moduler blir tomma — testa i browser, inte bara syntax.
- Scenario-seedens JSON ligger mellan `$vakt_scenario_json$`-markörer — bevara markörerna exakt vid regenerering.
- Svenska tecken kan bli mojibake i PowerShell-output; filerna ska ändå vara UTF-8.
- Om REST-verifieringen ger `PGRST205` för historiktabellerna är det ett känt, separat ärende (migrationerna för quizhistorik) — blanda inte ihop det med den här uppgiften.
