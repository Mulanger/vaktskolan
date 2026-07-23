# Driftsättning quizbalansering – status 2026-07-23

## Klart och verifierat (filer i repot)

| Steg | Resultat |
|------|----------|
| **1. `utbildning.md`** | 228 frågor uppdaterade (VU1 154 + VU2 74). Endast de fyra `A)`–`D)`-raderna och förklaringen efter `**Rätt svar: X.**` ändrade. `**Fråga N.**`-nummer och rätt-svar-bokstäver bevarade tecken för tecken (verifierat i git-diff: 0 rörda Fråga-rubriker). UTF-8 utan BOM, LF. |
| **2. `vu1quiz.json` / `vu2quiz.json`** | `questions`-arrayen ersatt med balanserad data. `meta.version` → `1.1`, `generated` → `2026-07-23`. `modules` och alla `id` oförändrade. |
| **3. Scenario-seed och Supabase** | Seeden regenererad från `quiz-balans/data/scenariobank_300_fixed.json` med `--status published`. Produktionsimporterna kördes som upsert. REST verifierade 154/74/300 publicerade frågor och 616/296/1200 alternativ; innehållet matchar källbankerna exakt och fråge-/alternativ-ID:n bevarades. |
| **4. Cache-bump** | `app.js` markdown-fetch och `index.html` CSS/JS-query → `?v=20260723-quiz-balans`. Release-manifest regenererat: `2026-07-23-quiz-balans.2`. |
| **5. Regressionsvakt** | `scripts/test-quiz-balance.mjs` skapad + inkopplad i `prebuild` och `test` efter `test:platform-guards`. Vakten kontrollerar även exakta bankstorlekar och unika id:n, utöver alternativ, rätt svar och längdbalans. |
| **6. Verifiering** | Den riktiga `app.js`-parsern gav 12/7 moduler, 94/44 modulquizfrågor och slutprovspooler 154/74. Elevtabellernas radantal var oförändrade efter importen. `agent.md` är uppdaterad med ett daterat kvitto. |

Balansmått på ny data (gräns: ratio ≤ 1,35, max 40 % strikt längst): **VU1** ratio 1,20 / 20,1 % · **VU2** 1,07 / 21,6 % · **scenario** 1,15 / 26,3 %. (Gammal data låg på ratio 4,5–8,9 och 88–97 % längst.)

## Körda produktionskommandon

### Supabase-import – upsert, aldrig delete+insert

```powershell
cd D:\vaktskolan

# Scenario: balanserat innehåll + publicerat (upsert på scenario:<id> / label)
node scripts/import-scenario-quiz.mjs --input quiz-balans/data/scenariobank_300_fixed.json --status published

# VU1/VU2 (+ flashcards): balanserat innehåll, publicerat (upsert på (collection_id,external_id) / (question_id,label))
npm run import:quiz-portal
```

### REST-verifiering – anon-nyckel, read-only

Observerat: `vu1_quiz=154`, `vu2_quiz=74`, `scenario_quiz=300` publicerade; svarsalternativ `616/296/1200`. Fråge- och alternativ-ID-fingeravtrycken var identiska före och efter upsert. Databasens texter, förklaringar och rättmarkeringar matchade de tre godkända källbankerna.

```powershell
node -e "const fs=require('fs');const e=Object.fromEntries(fs.readFileSync('.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim()]}));const b=e.SUPABASE_URL.replace(/\/+$/,'')+'/rest/v1';const k=e.SUPABASE_PUBLISHABLE_KEY;(async()=>{for(const c of ['vu1_quiz','vu2_quiz','scenario_quiz']){const r=await fetch(b+'/quiz_questions?select=id&status=eq.published&collection_id=eq.'+c,{headers:{apikey:k,Authorization:'Bearer '+k,Prefer:'count=exact'}});console.log(c, r.headers.get('content-range'));}})();"
```

`content-range` visar `.../<antal>` sist – t.ex. `0-153/154`.

### Full testsvit + build

```powershell
npm test        # typecheck, lint, validate:content, validate:release, platform-guards, quiz-balance, emblems, billing
```

### Browsertest

- Öppna plattformen, kör ett VU1-modulquiz och ett Quizportal-pass (VU1, VU2, scenario): nya alternativtexter syns, rätt svar rättas rätt, förklaringar visas.
- Svara **fel** på en portalfråga → kontrollera att den dyker upp i "Att repetera" och går att öppna (bekräftar att frågenycklarna överlevde upsert).
- Starta ett VU1-slutprov → 30 frågor dras utan fel.

## Viktigt att känna till

1. Den tidigare agentens varning om trunkerade `app.js`, `index.html` och `styles.css` kom från en osynkad Linux-mount. I den auktoritativa Windows-arbetskopian är filsluten kompletta; `styles.css` är byte-identisk med `main`, medan `app.js` och `index.html` endast har de avsedda cacheversionsändringarna.
2. Scenariofrågorna är nu uttryckligen publicerade enligt produktägarens driftsättningsinstruktion. Alla 300 är läsbara med publishable/anon-nyckeln.
3. Importskripten berör bara `quiz_questions`, `quiz_answer_options` och collectionstatus. Kontroll före/efter visade oförändrade radantal i alla fyra berörda `student_*`/progress-tabeller.
4. `.env`-nycklar har inte loggats eller committats.
```
