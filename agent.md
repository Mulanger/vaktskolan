# Agent Handoff - Vaktskolan

Senast uppdaterad: 2026-07-23.

Det här dokumentet beskriver appen i `D:\vaktskolan`: hur dashboarden och landing page fungerar, hur utbildningsmaterialet är uppbyggt, vilka lokala beslut som redan är tagna, och var framtida ändringar bör göras.

## Aktuell drift och publik arkitektur (2026-07-10)

- Produktion hostas i InstaPods-podden `vaktskolan` som en Node.js-app. Vercel används inte.
- Den publika webbplatsen är migrerad till Next.js App Router i repots rot. `npm run build` bygger och `npm start` startar Next på `0.0.0.0` samt den `PORT` som hostingmiljön tilldelar.
- Den ursprungliga landningssidans visuella design i `landing/index.html` är byggkälla för Next-startsidan via `lib/original-landing.ts`. Den ska inte ersättas med en ny design utan uttryckligt godkännande.
- Den gamla dashboarden och auth-sidan paketeras av `scripts/prepare-public-assets.mjs` och nås via `/plattform` respektive `/login`. De är `noindex`.
- InstaPods Env ska minst innehålla `APP_ENV=production`, `SITE_URL=https://vaktskolan.se`, Clerk production-värdena i `.env.example` samt Supabase-värdena.
- Clerk i produktion får inte använda `pk_test` eller `*.clerk.accounts.dev`. `CLERK_PUBLISHABLE_KEY`/`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` ska vara `pk_live...` och `CLERK_FRONTEND_API_URL` ska vara `https://clerk.vaktskolan.se`.
- Endast canonical-hostnamnet får indexeras. Lokala adresser, poddomäner och preview-hostar får `X-Robots-Tag: noindex` av `proxy.ts`.
- Deploymentinstruktioner och lanseringsgrind finns i `docs/seo-launch-checklist.md`.

Avsnitten nedan beskriver i stor utsträckning legacy-plattformens interna funktioner. Påståenden om att root-sajten saknar byggsystem eller npm-dependencies är historiska och ska inte användas för den publika Next-ytan.

Den publika toppnavigationen använder etiketterna `Plattformen`, `Wiki` och `Väktaryrket`; `Plattformen` länkar till den publika produktvisningen på `/plattformen` och `Wiki` länkar fortsatt till SEO-/guidehubben på `/studieteknik`. Övriga publika sidor läser länkarna från `lib/site.ts`. Startsidan återanvänder den äldre headern i `landing/index.html`, så dess desktop- och mobilmeny måste hållas i samma ordning och med samma etiketter. Inloggning ligger separat från de tre huvudlänkarna.

Den publika sidan `/plattformen` byggs i `app/(public)/plattformen/page.tsx` och använder den gemensamma `SiteHeader`/`SiteFooter` från root-layouten. Den ska inte få en separat showcase-header. Produktbilderna ligger i `public/site-assets/platform-showcase/`, sidan är indexerbar och finns uttryckligen i `app/sitemap.ts`. Den privata elevplattformen ligger fortsatt på `/plattform`; blanda inte ihop de två adresserna.

Prissidan ligger på `/priser` i `app/(public)/priser/page.tsx` och använder samma gemensamma `SiteHeader`/`SiteFooter` som övriga publika undersidor. `Priser` ska inte läggas i huvudnavigationen; vägen till sidan ligger i footern på både Next-sidorna och den extraherade landningssidan i `landing/index.html`. Paketkorten heter `Basic` och `Premium`. CTA-länkarna har `data-pricing-plan` för en framtida premium-overlay. Basic går till vanlig registrering medan Premium bevarar uppgraderingsavsikten genom Clerk-inloggningen. Stripe Checkout avbryts till `/priser?checkout=cancelled`; sidan visar då att ingen betalning genomfördes. Trygghetsbudskapen under paketen ska vara en horisontell rad på desktop och en fullbreddslista på mobil, inte tre ihoppressade textkolumner. På desktop är heron och korten avsiktligt kompakta så att hela Premiumkortet inklusive CTA ryms i en vanlig laptopviewport även när avbrottsstatusen visas; Premiumförmånerna ligger därför i två läsbara kolumner från 900 px och uppåt. Mobilen behåller en enda kolumn.

Lönekollens uppskattade löneintervall använder `.salary-check-range`, `.salary-check-range-end` och `.salary-check-approx`. Beloppen får bara brytas mellan hela intervallhalvor; `ca` ska ligga kompakt på korrekt optisk baslinje och intervallet ska ha en sammanhängande skärmläsartext via `.sr-only`. Behåll cacheversionerna för `styles.css` och `app.js` i `index.html` synkade när detta ändras.

Medlemskapssystemet finns i `app/api/membership/`, `app/api/stripe/`, `lib/stripe-server.ts`, `lib/clerk-session.ts`, `lib/clerk-membership.ts` och `lib/billing-store.ts`; full setup och testflöde beskrivs i `docs/stripe-integration.md`. Basic är kostnadsfritt och ger hela VU1 modul 1 samt livstidsgränser per Clerk-konto på 10 VU1-frågor, 10 scenariofrågor och 10 flashcard-vändningar. Premium kostar 399 SEK som engångsbetalning och ger permanent tillgång. Clerk-JWT verifieras server-side mot JWKS och Supabase-migrationen `20260722210000_create_stripe_billing.sql` lagrar entitlement, köp och atomiska usage-events. Stripe-webhooks är source of truth för köp; en Checkout-redirect får aldrig ensam ge Premium-access. Webhooken synkar även `membershipTier`/`premiumAccess` till Clerk-metadata, men databasen och medlemskaps-API:t är auktoritativa för åtkomst. Stripe- och Clerk-hemligheter ska bara finnas i `.env`/hostingens secret store.

Det kompletta Stripe-sandboxflödet verifierades 2026-07-23 mot commit `851382a`: Basic före köp, Checkout på 399 SEK, signerad webhook, Premium i Supabase/Clerk/UI, replay-idempotens, avvisad ogiltig signatur, full refund och återgång till Basic. Det daterade kvittot och instruktionerna för att upprepa testet finns i `docs/stripe-e2e-verification-2026-07-23.md`. Stagingpodden heter `vaktskolan-staging`, ligger på `https://vaktskolan-staging.nbg1-5.instapods.app` och lämnades stoppad efter testet. Starta den endast under tester och stoppa den igen efteråt.

Startsidan har ingen separat `Öva nu`-knapp i mobilheadern. Mobilens quizväg är den befintliga `Gratis Quiz`-knappen i heron; ta inte tillbaka en konkurrerande header-CTA utan ett nytt uttryckligt produktbeslut.

Wiki-/guidesidornas mobiltypografi har ett gemensamt skydd i `app/globals.css` för långa svenska sammansättningar. Rubriker, ingresser, guidenavigation, källor, relaterade länkar och quiztexter använder `overflow-wrap: anywhere` där innehållet annars kan bredda sidan; rubriker använder även svensk automatisk avstavning. Tabeller och eventuell preformaterad text får egen horisontell scroll i stället för att skapa overflow för hela dokumentet. Ta inte bort dessa regler när en enskild guide justeras.

## Guidequiz på desktop och mobil (2026-07-22)

`components/guide-quiz-panel.tsx` ansvarar för det tre frågor långa snabbquizet som följer med de publika guidesidorna. Frågeprogressen sparas lokalt och ska överleva navigering mellan guider. Rätt/fel visas inte efter varje svar; eleven måste svara på samtliga tre frågor innan resultatet och svarsförklaringen visas.

- Desktop (`min-width: 901px`) behåller den sticky quizpanelen i guidens högra spalt.
- Mobil (`max-width: 900px`) följer designalternativ 1B från `D:\Quiz overlay design alternativ.zip`: efter besökarens första scroll väntar sidan två sekunder innan ett kompakt vitt `Testa dig själv`-kort visas längst ned i läsvyn. Kortet låter besökaren välja ett svar direkt.
- Ett svar i mobilkortet öppnar quizet som en bottenpanel på samma läsposition. Panelen har dimmad bakgrund, segmenterad progress, stängknapp, Escape-stöd, låst bakgrundsscroll och stängs även vid klick utanför.
- Alla faktiska svarsalternativ ska alltid visas, ett fullbreddsalternativ per rad.
- När artikelns ordinarie inline-quiz kommer in i viewporten döljs det fasta mobilkortet så att två quizytor inte konkurrerar visuellt.
- Mobilhändelser mäts separat som `guide_quiz_mobile_teaser_reveal`, `guide_quiz_mobile_teaser_answer` och `guide_quiz_mobile_teaser_open`. De befintliga fråge-, resultat- och CTA-händelserna används fortsatt inne i quizflödet.

Stilarna finns i `app/globals.css` under guidequizets mobilregler. Ändra inte desktopens högerspalt när mobilvarianten justeras, och återinför inte omedelbar rätt/fel-feedback utan ett nytt uttryckligt produktbeslut.

## Elevspecifik quizhistorik och dashboard-KPI:er (2026-07-22)

Quizhistoriken är byggd som ett additivt lager. Den ändrar eller raderar inte `quiz_questions`, `quiz_answer_options`, `utbildning.md`, elevens befintliga `student_learning_progress` eller de gamla `answers`/`quizSubmissions`-nycklarna. Befintliga frågor och progressionsdata fortsätter därför att fungera som tidigare.

### Databas och driftsättning

Migrationen `supabase/migrations/20260722170000_create_student_quiz_history.sql` skapar:

- `student_quiz_attempts`: ett försök/session från modulquiz eller Quizportalen.
- `student_quiz_answers`: ett bedömt svar per fråga och försök, inklusive kunskapsområdena som gällde när eleven svarade.

Migrationen `supabase/migrations/20260722183000_create_student_quiz_review_items.sql`:

- utökar historiktabellernas `source_type` med `review`, så repetitionspass kan följas utan att blandas ihop med ordinarie quiz,
- skapar `student_quiz_review_items`, som lagrar en elevspecifik repetitionsstatus per stabil `question_key`, och
- lägger till RLS, index och idempotent unik nyckel på `(user_id, question_key)`.

Alla tre tabellerna använder elevens Clerk-id (`auth.jwt() ->> 'sub'`) som `user_id`. RLS tillåter bara den autentiserade eleven att läsa och skriva sina egna försök, svar och repetitionsposter. Klientgenererade UUID:n och unika nycklar gör synken idempotent; samma lokala data kan skickas igen utan att skapa dubbletter.

Migrationerna är additiva men måste köras i ordning i Supabase innan historiken och repetitionskön kan följa eleven mellan enheter. Om tabellerna ännu inte finns fortsätter appen fungera och lagrar historiken lokalt. Detta är en avsiktlig mjuk fallback, inte ett skäl att skjuta upp migrationerna i produktion.

Status 2026-07-22: en read-only REST-kontroll mot molnprojektet gav `PGRST205` för historiktabellerna, alltså var den första migrationen ännu inte applicerad där när kontrollen gjordes. Repot har varken Supabase CLI/`psql` eller databasens connection string. Kör först `20260722170000_create_student_quiz_history.sql` och sedan `20260722183000_create_student_quiz_review_items.sql` i Supabase SQL Editor (eller via projektets normala migrationsflöde) före produktionsdeploy. Verifiera därefter att alla tre tabellerna svarar via REST.

### Lokal lagring och synk

`app.js` använder `vakt-quiz-history-v1` i `localStorage` med `{ ownerId, attempts, answers, reviewItems }`. Högst 200 försök och 500 svar hålls lokalt. Repetitionsposterna är ett aktuellt tillstånd per fråga och kapas inte av historikgränsen. Historiken rensas om en annan Clerk-användare tar över samma webbläsare, så elevdata blandas inte mellan konton.

Viktiga funktioner i `app.js`:

- `initializeQuizHistory()`: hämtar och slår ihop lokal/molnlagrad historik efter den ordinarie progressionssynken.
- `recordQuizAttempt()`, `recordQuizAnswer()` och `updateQuizAttempt()`: append/upsert av nya händelser.
- `syncQuizHistoryToSupabase()`: skickar osynkade försök före svar och repetitionsposter; nätverksfel lämnar datan lokalt för senare försök.
- `recordModuleQuizAttempt()`: registrerar ett färdigt modulquiz utan att ändra dess gamla progressionsformat.
- `startQuizPortalHistoryAttempt()`, `recordQuizPortalAnswer()` och `completeQuizPortalHistoryAttempt()`: registrerar VU1-, VU2- och scenarioquiz. Timeout räknas som fel och sparas med `timed_out=true`.
- `getLegacyModuleQuizAnswerEvents()`: gör redan inskickade modulquiz i det gamla progressionsformatet synliga i statistiken. Om motsvarande historikförsök redan finns undviks dubbelräkning.
- `applyQuizReviewOutcome()`: uppdaterar frågans beständiga repetitionsstatus efter varje bedömt svar.
- `backfillQuizReviewItems()`: gör tidigare felbesvarade frågor tillgängliga i kön efter uppgraderingen utan att skriva om gamla svar.
- `getQuizReviewQueue()`: delar repetitionsposterna i `due`, `waiting` och `mastered`; både dashboarden och Quizportalen använder samma beräkning.

Flashcards, slutprov och själva repetitionspassen ingår inte i quizträffsäkerheten. Därmed kan en elev inte höja träffsäkerheten artificiellt genom att svara på samma repetitionsfråga flera gånger. Slutprov har egna regler och ska inte blandas med träningsquiz.

### Kunskapsområden och "Att repetera"

VU1/VU2-frågor från modulquiz och Quizportalen grupperas fortsatt som `kurs + modul`, exempelvis `vu1:module:3`. Scenariofrågor använder sina ämnestaggar, exempelvis `scenario:envarsgripande`. Scenarioets miljö (`butik`, `sjukhus` osv.), nivå och frågekälla sparas som kontext men räknas inte som själva kunskapsområdet. Metadata följer med repetitionsposten och kan senare användas för filtrering eller rekommendationer.

`Att repetera` är frågebaserad, inte längre en statistisk tröskel per område:

1. Ett felaktigt svar i modulquiz, VU1, VU2 eller scenarioquiz lägger frågan i `due` omedelbart. Ett nytt fel återställer alltid frågan till detta läge.
2. Första rätta svaret inne i `Att repetera` flyttar frågan till `waiting` med `due_at` exakt 24 timmar senare.
3. När de 24 timmarna har gått blir frågan automatiskt tillgänglig igen. Nästa rätta svar markerar den som `mastered` och tar bort den från den aktiva kön.
4. Ett rätt svar i ett vanligt quiz tar inte bort en repetitionspost; bekräftelsen ska ske i det lugna repetitionsläget.

Quizportalens orange kort `Att repetera` visar antalet frågor som är redo nu. Ett pass innehåller högst 15 aktuella frågor, använder samma fråga/resultat-komponenter som övriga quiz men saknar nedräkning. Om inget är redo visar statusvyn hur många frågor som väntar och när nästa blir tillgänglig.

### Dashboardens fyra nyckeltal

`renderHome()` visar en sammanhängande rad med fyra elevspecifika värden på desktop och ett 2×2-rutnät på mobil:

1. `Kursframsteg`: procent för elevens aktuella/fortsättningskurs, inte en missvisande blandning av en ännu låst VU2-kurs.
2. `Moduler klara`: avklarade innehållsmoduler i samma aktuella kurs.
3. `Quizträffsäkerhet`: andelen rätt bland elevens senaste 100 bedömda träningssvar från modulquiz och Quizportalen. Undertexten visar exakt antal rätt och totalt antal svar.
4. `Att repetera`: antal personliga repetitionsfrågor som är redo just nu. När kön är tom men frågor väntar visas i undertexten hur många som är schemalagda; annars visas `Du är ikapp`.

`getStudentQuizMetrics()` är den centrala beräkningen. Ändra KPI-definitionerna där och uppdatera detta avsnitt samtidigt; duplicera inte beräkningarna direkt i HTML-renderingen.

### Verifiering

Kontrollerat 2026-07-22:

- `node --check app.js`
- `npm run lint`
- `npm run typecheck`
- `npm run test:platform-guards`
- browsertest på 1280×720: fyra lika breda kolumner utan overflow.
- browsertest på 390×844: fyra kort i 2×2 utan horisontell overflow.
- ett felaktigt Quizportal-svar skapade omedelbart `1 fråga` i dashboarden och på Quizportalens repetitionskort.
- repetitionskortet öppnade samma fråga utan timer; första rätta svaret ändrade den till schemalagd i 24 timmar och dashboarden återgick till `0 frågor`.

Efter framtida ändringar bör även ett modulquiz, ett VU1/VU2-portalquiz, ett scenarioquiz, timeout, den andra 24-timmarsbekräftelsen och kontobyte testas. Frågebankernas importer ska inte modifieras för att lagra elevresultat; elevresultat hör endast hemma i historik- och repetitionstabellerna.

## Kort Sammanfattning

Vaktskolan består av tre separata statiska ytor:

- Dashboard/lärplattform: `index.html`, `styles.css`, `app.js`, `utbildning.md`.
- Auth-sida: `login.html`, `auth.css`, `auth.js`, `authProvider.js`.
- Landing page: `landing/index.html` med servern `landing/server.mjs` och bilder i `landing/assets/`.

Dashboarden är en HTML/CSS/JavaScript-app utan byggsystem. Den läser `utbildning.md` via `fetch()`, parsar Markdown till VU1- och VU2-kurser, renderar kurshubb, lektioner, modulquiz och slutprov. Den sparar fortfarande elevens lokala status i `localStorage`, men har nu en förberedd Supabase API-koppling för kommande databaslagring och en Clerk-auth gate när `CLERK_PUBLISHABLE_KEY` är satt.

Landing page är också statisk. Den använder Tailwind CDN och inline JavaScript i `landing/index.html`.

## Filkarta

```text
D:\vaktskolan
├── index.html                  # Dashboardens HTML-skelett
├── styles.css                  # Dashboardens layout, responsivitet och komponentstilar
├── app.js                      # All dashboardlogik
├── server.mjs                  # Root-server för dashboard + Supabase config/health endpoints
├── supabaseApi.js              # Browser-wrapper för Supabase REST API
├── authProvider.js             # Browser-wrapper som laddar auth-leverantören från publishable key
├── clerkAuth.js                # Äldre wrapperfil, inte länkad från aktiv HTML
├── login.html                  # Portaldesignad login/signup-sida
├── auth.css                    # Auth-sidans stilar
├── auth.js                     # Auth-sidans mount och redirectlogik
├── package.json                # Minimal Node-konfiguration för hosting, npm start och npm build
├── package-lock.json           # Låsfil för npm install utan externa dependencies
├── docs
│   └── supabase-quiz-schema.md # Kort schema- och verifieringsnotis för Quiz Portal
├── scripts
│   ├── generate-scenario-quiz-seed.mjs # Skapar SQL-seed från scenario-JSON
│   └── import-scenario-quiz.mjs        # REST-import till Supabase efter att tabellerna finns
├── supabase
│   ├── migrations
│   │   └── 20260705133000_create_quiz_collections.sql # Quiz Portal-tabeller
│   └── seeds
│       └── 20260705143000_seed_scenario_quiz_300.sql  # 300 scenariofrågor för scenario_quiz
├── .env                        # Lokala Supabase-nycklar, ska inte committas
├── .env.example                # Mall för miljövariabler utan riktiga nycklar
├── .gitignore                  # Ignorerar .env och lokalt brus
├── utbildning.md               # Källmaterial för VU1 och VU2
├── v_ktarskolan_e_learning.html # Äldre/friare referensfil, inte aktiv dashboard
├── landing
│   ├── index.html              # Aktiv landing page
│   ├── server.mjs              # Enkel statisk Node-server för landing page
│   ├── styles.css              # Finns, men är inte länkad från aktiv landing/index.html
│   ├── script.js               # Finns, men är inte länkad från aktiv landing/index.html
│   └── assets                  # Landing-bilder och logotyper
└── agent.md                    # Denna handoff
```

Projektet har nu en minimal `package.json` för Node-hosting, men fortfarande inget bundler-flöde och inga npm-dependencies.

Supabase-kopplingen består av:

- `.env`: lokal miljöfil med Supabase URL, publishable key, server-only secret key och JWKS URL.
- `.env.local`: stöds också av `server.mjs`, främst för hostingplattformar som skriver env-värden dit.
- `.env.example`: mall utan riktiga nycklar.
- `.gitignore`: ser till att lokala `.env`-filer inte följer med till GitHub.
- `server.mjs`: root-server för dashboarden, statiska filer och Supabase config/health-endpoints.
- `supabaseApi.js`: liten browser-wrapper för Supabase REST API. Den hämtar publik config från servern, använder bara publishable key i webbläsaren och exponerar `window.vaktskolanSupabase`.

Clerk-kopplingen består av:

- `.env`: ska innehålla `CLERK_PUBLISHABLE_KEY` för att aktivera auth.
- `.env.example`: innehåller placeholder för `CLERK_PUBLISHABLE_KEY`.
- `server.mjs`: exponerar `GET /api/clerk/config`, som bara skickar publishable key och auth-URL:er till browsern.
- `authProvider.js`: hämtar config, härleder auth-leverantörens frontend-domän från publishable key och laddar klientbiblioteket via CDN.
- `login.html`, `auth.css`, `auth.js`: portaldesignad login/signup-yta som monterar SignIn eller SignUp utan att visa leverantörsnamn eller konfigurationsdetaljer för kunden.

## Körning Lokalt

Dashboarden behöver köras via HTTP eftersom `app.js` hämtar `utbildning.md` med `fetch()`.

Rekommenderad körning är nu root-servern, eftersom den också läser `.env` och exponerar Supabase-config till webbläsaren utan att läcka secret key:

```powershell
cd D:\vaktskolan
node server.mjs
```

Alternativt, samma server via npm-scriptet som används av hostingplattformar:

```powershell
npm start
```

Dashboard URL:

```text
http://127.0.0.1:5173
```

Login/signup URL:

```text
http://127.0.0.1:5173/login.html?mode=sign-in&redirect_url=/platform
```

Publik startsida/landing:

```text
http://127.0.0.1:5173/
```

Dashboard/lärplattform efter inloggning:

```text
http://127.0.0.1:5173/platform
```

Om port `5173` är upptagen:

```powershell
$env:PORT=5183; node server.mjs
```

Supabase health check:

```text
http://127.0.0.1:5173/api/supabase/health
```

Clerk config check:

```text
http://127.0.0.1:5173/api/clerk/config
```

Om `CLERK_PUBLISHABLE_KEY` saknas returnerar endpointen `ok: false`. Då fortsätter dashboarden vara åtkomlig för lokal utveckling. När nyckeln finns redirectas utloggade användare från dashboarden till `login.html`.

Den gamla statiska körningen fungerar fortfarande för lokal UI-testning, men Supabase-kopplingen initieras inte då eftersom `/api/supabase/config` saknas:

```powershell
cd D:\vaktskolan
python -m http.server 5173 --bind 127.0.0.1
```

Landing page:

```powershell
cd D:\vaktskolan\landing
node server.mjs
```

Landing URL:

```text
http://127.0.0.1:5174
```

Om porten är upptagen:

```powershell
$env:PORT=5175; node server.mjs
```

Snabb syntaxkontroll för dashboardens JavaScript:

```powershell
cd D:\vaktskolan
node --check app.js
node --check authProvider.js
node --check auth.js
```

## Externa Beroenden

Dashboardens `index.html` laddar:

- Google Fonts: Inter
- Lucide icons via `https://unpkg.com/lucide@latest`
- Auth-leverantörens klientbibliotek via projektets egen `authProvider.js` när `CLERK_PUBLISHABLE_KEY` är konfigurerad.
- `supabaseApi.js`, som använder projektets egen `/api/supabase/config` och Supabase Data REST API. Ingen Supabase secret key skickas till browsern.

Landing page laddar:

- Google Fonts: Inter
- Tailwind via `https://cdn.tailwindcss.com`

Det betyder att båda ytorna kan se annorlunda ut eller sakna ikoner/stilar om nätet är blockerat.

## Dashboardens HTML-Struktur

`index.html` innehåller en fast app-shell:

- `#courseSidebar`: vänster navigering med Hem, VU1, VU2 och Quiz.
- `#moduleListWrap` / `#moduleList`: modullista i vänsterspalten när relevant.
- `.topbar`: mobil/tablet-toppbar. Desktop-topbaren är avsiktligt dold.
- `#homePanel`: hemvyn.
- `#courseHub`: kurshubb för både VU1 och VU2.
- `#quizOverviewPanel`: samlad quiz- och slutprovsöversikt.
- `#moduleHeroTitle`, `#moduleHeroMeta`, `#moduleInfoPanel`: modulheader ovanför lektionskort.
- `#readerPanel`: lektionsläsaren.
- `#quizPanel`: modulquiz.
- `#finalExamPanel`: slutprov.
- `#contextSidebar`: höger sidopanel med aktuell modul och progress.
- `#quizResetModal`: modal för att nollställa quizhistorik.
- `#toast`: korta statusmeddelanden.

Hemvyn renderas dynamiskt av `renderHome()` i `app.js`. Den bygger:

- snabbstatistik för VU1+VU2,
- `Fortsätt där du slutade` med rätt kurs/modul/sida,
- kurskort för VU1 och VU2,
- snabbväg till Quiz Portal.

Hemvyn använder `getHomeData()`, `getCourseHomeOverview()`, `withCourseContext()` och befintliga progresshelpers. `Fortsätt`-knappen använder `data-home-continue-course/module/lesson/page` och aktiverar rätt kurs innan `goTo()` körs. Kurskortens knappar använder befintliga `data-open-course` och `data-open-vu2`. Quiz-snabbvägen använder befintliga `data-show-quiz`.

Hemvyn är uppdaterad efter designalternativ `1b` från `D:\Modern siddesign uppdatering.zip`: desktop hem döljer den gamla vänstersidomenyn och använder en skarp toppmeny, medan mobil hem använder kompakt topp med profilinitialer och en fast bottenmeny. Den globala desktop-topbaren med gamla meta/quiz-knappar ska fortsatt vara dold.

Första gången eleven kommer till Hem, innan någon progress/quiz finns, ska rubriken vara `Välkommen, Sven`. När progress finns ska rubriken vara `Välkommen tillbaka, Sven`.

VU2-kortet i `Dina kurser` styrs av den centrala kurslåsningsflaggan `ENFORCE_COURSE_LOCKS`. Under implementation är flaggan `false`, så VU2 är öppet för snabb testnavigation. När flaggan sätts till `true` ska VU2 låsas överallt tills VU1:s innehållsmoduler är klara.

Aktuella cachebusting-parametrar i `index.html`:

```html
<link rel="stylesheet" href="styles.css?v=20260722-quiz-insights">
<script src="authProvider.js?v=20260706-light-auth"></script>
<script src="supabaseApi.js?v=20260705-supabase"></script>
<script src="app.js?v=20260722-quiz-insights"></script>
```

När CSS eller JS ändras bör versionssträngarna uppdateras så webbläsaren inte visar gammal kod.

## Dashboardens JavaScript

All dashboardlogik ligger i `app.js`. Det finns ingen framework-runtime.

Viktiga konstanter:

```js
const STORAGE_VERSION = "vu2-course-split-2026-07-04";
const UNLOCK_MODULE_NAVIGATION = true;
const FINAL_EXAM_SIZE = 30;
const FINAL_EXAM_LOCK_MS = 24 * 60 * 60 * 1000;
const FINAL_EXAM_PASS_PERCENT = 80;
```

`UNLOCK_MODULE_NAVIGATION = true` betyder att eleven just nu kan hoppa mellan moduler. Användaren har sagt att appen senare ska låsas till steg-för-steg-flöde. När det ska införas är första steget att sätta denna konstant till `false` och testa:

- nästa modul låses tills föregående är klar,
- slutprov låses tills alla innehållsmoduler är klara,
- hubbens låsta statusar är begripliga,
- direktlänkar/sparad position inte tar eleven till låst innehåll.

`STORAGE_VERSION` används för att rensa äldre lokal state. Om lagringsformat ändras, eller om gamla testdata ger konstigt beteende, bumpa denna version.

## Supabase API-Koppling

`server.mjs` läser `.env` vid start och exponerar två lokala endpoints:

- `GET /api/supabase/config`: skickar bara `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` och `SUPABASE_JWKS_URL` till browsern.
- `GET /api/supabase/health`: kontrollerar att Supabase Data REST API svarar via `/rest/v1/`. Servern kan använda `SUPABASE_SECRET_KEY` för den här kontrollen, men nyckeln skickas aldrig till frontend.

`supabaseApi.js` skapar `window.vaktskolanSupabase` med:

```js
window.vaktskolanSupabase.ready
window.vaktskolanSupabase.healthCheck()
window.vaktskolanSupabase.select(table, query)
window.vaktskolanSupabase.insert(table, rows, options)
window.vaktskolanSupabase.upsert(table, rows, options)
window.vaktskolanSupabase.request(path, options)
window.vaktskolanSupabase.setAccessToken(token)
```

`app.js` anropar `initializeSupabaseConnection()` för health check, `initializeProgressSync()` för den obligatoriska kursprogressionen och `initializeQuizHistory()` för quizhistoriken. Den ordinarie kursprogressionen måste kunna synkas för en autentiserad elev; quizhistoriken har däremot lokal fallback och blockerar inte kursen vid ett tillfälligt fel.

Datamodeller och RLS finns nu för både `student_learning_progress` och quizhistorik. Se migrationerna `20260714143000_create_student_learning_progress.sql` och `20260722170000_create_student_quiz_history.sql`. Frågebanken är fortsatt separat från elevens resultatdata.

## Clerk Authentication

Clerk är implementerat via vanilla JavaScript, inte via `clerk init`, eftersom projektet saknar bundler och Next/React/Vite-runtime. Aktiv HTML laddar den neutrala wrappern `authProvider.js`; `clerkAuth.js` finns kvar som äldre wrapperfil men är inte länkad från aktiv HTML.

Root-servern exponerar:

- `GET /api/clerk/config`: returnerar `ok`, `publishableKey`, `signInUrl`, `signUpUrl`, `afterSignInUrl` och `afterSignUpUrl`.

`authProvider.js` hämtar configen, härleder frontend-domänen från publishable key, laddar klientbiblioteket via CDN och exponerar:

```js
window.vaktskolanAuthProvider.ready
window.vaktskolanAuthProvider.getConfig()
window.vaktskolanAuthProvider.getError()
window.vaktskolanAuthProvider.isConfigured()
```

Auth-sidan finns som `login.html`. Root-servern routar även `/login`, `/sign-in` och `/sign-up` till `login.html`. `auth.js` använder query-parametern `mode=sign-in|sign-up` och monterar sign in eller sign up. Efter lyckad auth går användaren till `redirect_url`, normalt `/platform` i produktion.

Viktigt UX-beslut: auth-sidan ska inte visa `Clerk`, `CLERK_PUBLISHABLE_KEY`, miljövariabler eller leverantörskonfiguration för kunder. Om auth inte är tillgänglig ska UI:t visa neutral copy, exempelvis `Inloggningen är inte tillgänglig just nu`.

Dashboarden laddar `authProvider.js` före `app.js`. `init()` kör `requireAuthenticatedUser()` innan kursmaterialet hämtas. Om Clerk inte är konfigurerat (`ok: false`) fortsätter lokal utveckling som tidigare. Om Clerk är konfigurerat och användaren är utloggad redirectas användaren till:

```text
/login.html?mode=sign-in&redirect_url=/platform
```

När användaren är inloggad uppdateras profilblocket i vänsterspalten med användarens namn och en user-menu från auth-leverantören.

Status 2026-07-07: Dashboarden startar med `body.app-booting` och en neutral `#appBootScreen`. Den statiska HTML-shellens standardlektion är dold tills auth-check, kursmaterial och sparad plats har laddats och rätt vy har renderats. `revealPlatform()` i `app.js` tar bort boot-läget efter första render eller vid laddfel. Cache-bust: `styles.css?v=20260707-boot-gate` och `app.js?v=20260707-boot-gate`.

Clerk-komponenterna laddas med svensk localization via `@clerk/localizations` och `svSE` i `authProvider.js`. Det gör inloggning, signup, user-menu och monterade Clerk-kontokomponenter svenska i appen. Clerk-hostade Account Portal-sidor kan fortfarande visa engelska texter om de öppnas utanför den monterade appvyn.

Status 2026-07-07: `auth.js` har robustare mount-logik för Clerk-formuläret. Sign in/sign up monteras i en separat `data-auth-clerk-root`, mounten kontrolleras efter render, och sidan försöker montera om formuläret om containern blir tom vid hash-/historiknavigering eller fokusbyte. `login.html` cache-bustar detta med `auth.js?v=20260707-mobile-auth` och `auth.css?v=20260707-mobile-auth`. Mobilvyn använder en egen toppbar, maskot, dynamisk mobilrubrik och kompakt Clerk-layout; skapa-konto-copy ska vara `Skapa ett konto.` med `konto.` blått och undertiteln `Innan du börjar behöver du skapa ett konto.`

Status 2026-07-10: Den statiska Clerk test-fallbacken är borttagen ur `authProvider.js`. Login kräver `/api/clerk/config`; i produktion returnerar endpointen inte `ok: true` om publishable key saknas eller börjar med `pk_test_`. Production ska använda custom frontend API `https://clerk.vaktskolan.se` och JWKS `https://clerk.vaktskolan.se/.well-known/jwks.json`. Node-servern accepterar även `CLERK_PUBLISHABLE_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_FRONTEND_API_URL`, `CLERK_BACKEND_API_URL` och `CLERK_JWKS_URL` från `.env`. Clerk secret key ska inte sparas i projektfiler och används inte av frontendflödet.

### Quiz Portal-Schema

En migrationsfil för frågebanken finns i:

```text
supabase/migrations/20260705133000_create_quiz_collections.sql
```

Den skapar:

- `quiz_collections`: containers för Quiz Portalens frågeområden.
- `quiz_questions`: gemensam, tom frågebank för alla collections.
- `quiz_answer_options`: svarsalternativ för multiple choice, scenarioquiz och slutprov.

Seedade collection-rader:

- `vu1_quiz`
- `vu2_quiz`
- `flashcards`
- `vanlig_quiz`
- `scenario_quiz`
- `slutprovet`

`quiz_questions` och `quiz_answer_options` startar tomma. RLS är aktivt. Publicerade frågor kan läsas från frontend, men det finns inga client-side write policies. Frågor ska fyllas via Supabase Dashboard/SQL Editor eller ett framtida server-side adminflöde.

Status 2026-07-05: migrationen är körd i Supabase-molndatabasen via Postgres pooler-anslutning. Supabase CLI och `psql` saknas fortfarande lokalt, men `pg` installerades till `.agents/node-tools/` för att kunna köra SQL från Node. Connection string/lösenord är inte sparat i projektfiler.

Säkerhetsnotis: databaslösenordet delades i chatten under setupen. Det är inte sparat i projektfiler, men bör roteras i Supabase Dashboard när databasjobbet är klart.

### Scenariofrågor

JSON-filen `D:\vaktarskolan_scenariobank_300.json` har mappats till `scenario_quiz`.

Förberedda filer:

- `scripts/generate-scenario-quiz-seed.mjs`: validerar JSON och genererar SQL-seed.
- `scripts/import-scenario-quiz.mjs`: importerar via Supabase REST API när tabellerna finns.
- `supabase/seeds/20260705143000_seed_scenario_quiz_300.sql`: färdig seedfil för SQL Editor.

Seed/import skapar:

- 300 `quiz_questions` med `collection_id = 'scenario_quiz'`.
- 1200 `quiz_answer_options`.
- `external_id = 'scenario:<id>'` för idempotent import.
- `status = 'draft'` som standard eftersom JSON-filens metadata säger att innehållet ska juridikgranskas före publicering.

Körordning i Supabase SQL Editor:

1. `supabase/migrations/20260705133000_create_quiz_collections.sql`
2. `supabase/seeds/20260705143000_seed_scenario_quiz_300.sql`

Alternativ REST-import efter att schema-migrationen körts:

```powershell
node scripts/import-scenario-quiz.mjs
```

Vill man importera som publicerade frågor:

```powershell
node scripts/import-scenario-quiz.mjs --status published
```

Status 2026-07-05: importen är körd i Supabase-molndatabasen. Verifierat resultat: 6 collections, 300 `scenario_quiz`-frågor, 1200 svarsalternativ, och varje scenariofråga har 4 alternativ med exakt 1 rätt svar. Frågorna ligger som `draft`.

## State Och LocalStorage

Dashboarden sparar lokalt i webbläsaren. Nycklar:

```js
vakt-storage-version
vakt-visited-pages
vakt-quiz-answers
vakt-scenario-progress
vakt-final-exam
vakt-current-location
```

`state` innehåller bland annat:

- `courses`: `{ vu1: [], vu2: [] }`
- `courseId`: aktiv kurs, `"vu1"` eller `"vu2"`
- `modules`: aktiva kursens moduler
- `moduleIndex`, `lessonIndex`, `pageIndex`
- `mode`: aktuell vy
- `answers`: modulquizsvar, separerat per kurs och modul
- `finalExams`: slutprovsstate per kurs
- `finalExamPools`: frågepooler per kurs
- `visited`: set med besökta sidor

Quizsvar sparas per kurs och modul via:

```js
answerKey(moduleIndex, courseId) // `${courseId}:${moduleIndex}`
```

Besökta sidor sparas per kurs via:

```js
pageId(moduleIndex, lessonIndex, pageIndex, courseId)
```

Det är viktigt att nya state-nycklar också sparas/återställs via rätt helper så VU1 och VU2 inte blandas ihop.

## Utbildningsformatet

`utbildning.md` är den enda datakällan för dashboardens kursmaterial.

Formatet som parsern förväntar sig:

```markdown
## Modul 1: Modulnamn

*Motsvarar ...*

**Du lär dig:** ...

### 1.1 Lektionstitel

#### Sida 1: Sidtitel

Brödtext...

> **Kom ihåg:** Nyckelruta.

### Quiz

**Fråga 1.** Frågetext?
A) Alternativ A
B) Alternativ B
C) Alternativ C
D) Alternativ D
**Rätt svar: A.** Förklaring.
```

Parsern tolkar:

- `##` med `Modul n` som modul.
- `###` som lektion, utom `### Quiz` som startar quizparser.
- `####` som sida.
- `*Motsvarar...*` som modulens metadata/tidsuppskattning.
- `**Du lär dig:**` som modulens måltext.
- `> **Kom ihåg:**` renderas som framlyft key box.
- Quiz måste använda A-D-format och `**Rätt svar: X.**`.

VU2 börjar vid rubriken:

```markdown
# Del 2: VU2 – Väktargrundutbildning del 2
```

Allt före den rubriken parsas som VU1. Allt efter parsas som VU2.

## Kursinnehåll

Aktuellt material i `utbildning.md`:

- VU1: Modul 1-11 som innehållsmoduler och Modul 12 som sluttest/frågebank.
- VU2: Modul 1-6 som innehållsmoduler och Modul 7 som sluttest/frågebank.
- VU1 modulquiz: 94 frågor.
- VU1 sluttestbank: 60 frågor.
- VU2 modulquiz: 44 frågor.
- VU2 sluttestbank: 30 frågor.

Appens slutprovsfrågepool kombinerar sluttestbanken med modulquizfrågorna och deduplicerar på frågetext:

- VU1 pool: 60 + 94 = 154 möjliga frågor före dedupe.
- VU2 pool: 30 + 44 = 74 möjliga frågor före dedupe.

Varje slutprov drar `FINAL_EXAM_SIZE` frågor, just nu 30.

## Parser Och Datamodell

Viktigaste parserfunktioner:

- `parseCourses(markdown)`: bygger `{ vu1, vu2 }`.
- `parseFinalExamBank(modules)`: läser sluttest/frågebank-modulen.
- `buildFinalExamPool(modules)`: kombinerar sluttestbank och modulquiz.
- `renderBlocks(lines)`: konverterar Markdown-liknande sidtext till HTML.

Modulobjekt ser i praktiken ut så här:

```js
{
  courseId,
  rawTitle,
  title,
  meta,
  objective,
  intro,
  lessons: [
    {
      title,
      pages: [{ title, body }]
    }
  ],
  quiz: [
    {
      number,
      question,
      options: [{ letter, text }],
      correct,
      explanation
    }
  ]
}
```

Slutprovsfrågor får dessutom:

- `id`
- `source`
- `sourceTitle`
- `origin`, exempelvis `"Slutprov"` eller `"Träningsfråga"`

## Vyer Och Lägen

`state.mode` styr huvudvyn:

- `"home"`: startsida.
- `"hub"`: VU1-hubb.
- `"vu2"`: VU2-hubb.
- `"lesson"`: lektionsläsare.
- `"module-milestone"`: modulstart-/milstolpesida innan en innehållsmodul öppnas.
- `"quiz"`: modulquiz.
- `"quiz-overview"`: samlad quizöversikt.
- `"final-exam-portal"`: egen slutprovsportal via vänsternavigeringen med VU1/VU2-status och start/fortsätt/visa resultat.
- `"final-exam"`: slutprov eller slutprovsresultat.

Viktiga vyfunktioner:

- `showHome()`
- `showCourseHub()` för VU1
- `showVu2()` för VU2
- `showQuizOverview()`
- `showFinalExamPortal()`
- `showFinalExam()`
- `renderCourseHub()`
- `showModuleMilestone()`
- `renderModuleMilestone()`
- `renderReader()`
- `renderQuiz()`
- `renderFinalExam()`

`restoreSavedLocation()` försöker återställa senast sparad plats från `localStorage`.

## Navigation

Status 2026-07-10: Lektionsläsaren har en dedikerad mobilvy under `560px`, baserad på den bifogade kompakta lektionsreferensen men med Vaktskolans befintliga färger. Den globala topbaren döljs under lektionsläsning, modulheadern har en chevron som fäller ut modulmål, progress, tidsomfattning och lektionslista, den gamla horisontella steppern ersätts visuellt med `Steg X av Y` och progresslinje, uppskattad lästid visas under sidrubriken och Föregående/Nästa ligger i en fast nederkant. Desktop, modulstart och quizläge är oförändrade.

Status 2026-07-10: `Kom ihåg`-rutan i den dedikerade mobila lektionsvyn är komprimerad med mindre ikon, padding, mellanrum och text så att mer av notisen ryms ovanför den fasta lektionsnavigationen. Desktopstilen är oförändrad.

Status 2026-07-10: Lektionssidornas tidigare breda desktop-stepper är ersatt av samma kompakta `Steg X av Y`-indikator och turkosa progresslinje som mobilvyn använder. Indikatorn renderas gemensamt för desktop och mobil och fylls proportionellt när eleven går mellan sidor.

Vänsternavigering:

- Hem går till `showHome()`.
- VU1 går till `showCourseHub()`.
- VU2 går till `showVu2()`.
- Quiz går till `showQuizOverview()`.
- Slutprov går till `showFinalExamPortal()`.

Lektionsnavigation:

- `goTo(moduleIndex, lessonIndex, pageIndex, mode)`
- `goRelative(direction)`
- `getModuleResumePosition(moduleIndex)`
- `getLastAccessiblePosition()`

Sidindikatorerna högst upp i en lektion är avsiktligt inte klickbara. De är indikatorer för var eleven är, inte genvägar. Om någon ser `data-page` på gamla strukturer ska man vara försiktig: den aktiva steppern i `renderReader()` renderar `div.page-tab`, inte knappar.

Föregående-knappen på första sidan är avsiktligt dold med `visibility: hidden`, `disabled`, `aria-hidden` och `tabIndex=-1`. Den reserverar layoutbredd så Nästa-knappen ligger stabilt till höger.

## Modulstart Och Milstolpe

Innan varje innehållsmodul visas `module-milestone-panel`. Första modulen i en kurs ska kallas `Modulstart`; senare moduler ska kallas `Milstolpe nådd`. Slutprovs-/frågebanksmoduler ska inte använda den här panelen.

Panelen använder den nya modulöversiktsdesignen från `D:\modul_versikt.html`: vit panel med blå-turkos topplinje, status-pill, stor modulrubrik, måltext, en ljus `Innehåll i denna modul`-box, statistikrad och blå primärknapp.

Modulstart-/milstolpevyn använder `body.module-milestone-mode` för att ge just den vyn bredare arbetsyta. På desktop är `module-milestone-panel` bredare än lektionsläsaren och innehållslistan kan delas i två kolumner. Övriga vyer ska inte ärva den breddningen.

Knapp/status på modulstarten är progressbaserad via `getModuleActionState()`:

- Ej påbörjad modul: `Starta modul`.
- Påbörjad men inte klar modul: `Fortsätt modul`.
- Klar modul: `Repetera modul`.

`renderModuleMilestone()` fyller innehållsboxen från `module.lessons`. Numrerade lektioner delas upp i ett litet nummermärke och ren titel; sammanfattningslektionen visas som separat rad med flaggikon och streckad avdelare. Statistikfältet `Ämnen` fortsätter räkna `allPages(module).length`, alltså ämnessidor, inte antal lektioner i innehållsboxen.

## Progress Och Låsning

Modulprogress bygger på besökta sidor. Viktiga funktioner:

- `isPageVisited()`
- `hasVisitedAnyPage()`
- `isModuleComplete()`
- `isModuleUnlocked()`
- `isPageUnlocked()`
- `getModuleProgress()`
- `getCourseProgress()`
- `getContentModuleItems()`
- `getContentModuleStats()`
- `areContentModulesComplete()`
- `canStartFinalExam()`
- `canAccessFinalExam()`
- `isCourseUnlocked(courseId)`

`ENFORCE_COURSE_LOCKS = false` just nu, så VU2 är öppet under implementation. När flaggan sätts till `true` ska `isCourseUnlocked("vu2")` kräva att VU1:s innehållsmoduler är klara. Använd den centrala funktionen i nya flöden i stället för separata VU2-specialfall.

Kurshubben räknar innehållsmoduler, inte slutprovmodulen, i "Moduler klara". Det var en tidigare bug där slutprovet kunde visas som `Klar · 7/7`; det är ändrat. Slutprovets hubbstatus ska vara:

- `Låst`
- `Redo`
- `Fortsätt prov`
- `Inlämnat`

`Ämnen klara` i VU1/VU2-hubben visar antal besökta ämnessidor av totalt antal ämnessidor. Slutprovets frågebankssidor ska inte räknas som vanliga ämnen i hubbprogressen.

## Slutprov

Slutprov finns för både VU1 och VU2.

Status 2026-07-22: Slutprovsportalen använder omdesignen från `D:\Slutprovs-sida omdesign.zip` i huvudarbetsytan: mörkt regelblock, dynamiska VU1/VU2-kort, faktisk kursprogress, frågepool och provstatus. Designunderlagets specialbyggda vänsterspalt med `Tillgängliga prov` är uttryckligen inte implementerad. Portalen behåller Vaktskolans ordinarie sidopanel och döljer den vanliga modulistan med `hideModuleList()`. Texten använder fortsatt plattformens befintliga Inter-font; prototypens Plus Jakarta Sans ska inte importeras.

Viktiga funktioner:

- `getFinalExamQuestions()`
- `getFinalExamAnsweredCount()`
- `getFinalExamScore()`
- `getFinalExamResult()`
- `getFinalExamLockInfo()`
- `getFinalExamPortalOverview(courseId)`
- `renderFinalExamPortal()`
- `pickFinalExamQuestions()`
- `startFinalExam()`
- `ensureFinalExamIntegrity()`
- `renderFinalExamInlineCta()`
- `renderFinalExamSummary(result)`
- `renderFinalExam()`
- `goFinalExamRelative(direction)`
- `goFinalExamQuestion(index)`
- `submitFinalExam()`

Regler:

- 30 slumpade frågor per prov.
- 80% krävs för godkänt.
- Efter inlämning låses nytt prov i 24 timmar.
- Ett aktivt prov kan återupptas.
- Ett inlämnat prov visar sammanfattning/resultat.
- Resultatvyn ska inte visa `Föregående`, `Nästa` eller `Lämna in`.
- Resultatvyn ska visa en tydlig `Klar`-knapp längst ned till höger som går tillbaka till rätt hubb.
- Den gamla `Till quiz`-knappen i slutprovet är borttagen och ska inte återinföras.
- Frågemetaraden som liknade `MODUL 6 · DROGER TRÄNINGSFRÅGA` är borttagen från slutprovsfrågor eftersom samma information redan finns högre upp.

## Modulquiz Och Scenarioquiz

Status 2026-07-10: Quiz Portalens startvy använder hela desktoparbetsytan från `1280px`. Panelen kan växa till `1320px`, introytan blir en kompakt tvåkolumnskomposition och de fem modulerna visas på en enda rad. Detta gör att rubrik, intro och samtliga modulkort ryms utan vertikal scroll i en vanlig bred desktopviewport. Under `1280px` behålls responsiv radbrytning, och mobilens listlayout under `940px` är oförändrad.

Modulquiz fungerar per modul och kurs. Svar sparas i `state.answers` med kurs-prefix.

Viktiga funktioner:

- `renderQuiz()`
- `showQuiz()`
- `returnToLesson()`
- `getQuizSummary()`
- `resetQuizHistory()`

När ett modulquiz är klart och nästa modul är slutprov ska call-to-action säga `Till slutprov`, inte `Nästa modul`.

Quiz Portal (`showQuizOverview()` / `renderQuizOverview()`) är ombyggd från `D:\v_ktarquiz_portalen.tsx`, men utan filens topp-header/logodel. Den aktiva portalen renderas i `#quizPortal` och har:

- Ljus introduktionsyta för `QuizPortalen` med vit panel, tunn kant, diskret skugga och mjuk blå dekorform i övre högra hörnet.
- Modulkort för VU1 Quiz, VU2 Quiz, Flashcards, Vanlig Quiz och Scenario Quiz.
- Demoquizmotor med fråga, alternativ, svarskontroll, förklaring, nästa fråga och resultatvy.
- Flashcardsmotor med vändbara kort och föregående/nästa.

Viktigt: Quiz Portal-frågorna och flashcardsen i `quizPortalDemoQuizzes` och `quizPortalDemoFlashcards` är uttryckligen demo-/placeholderdata från TSX-filen. De ska inte blandas ihop med riktiga modulquiz i `utbildning.md` eller slutprovsfrågebanken. UI:t märker detta med `Demo`/`Demo quiz`.

`quizScenarios` finns fortfarande kvar i `app.js` som äldre placeholderdata för reset-/bakåtkompatibilitet, men används inte av den nya Quiz Portal-vyn.

## UX-Beslut Som Ska Bevaras

Följande beteenden är avsiktliga och kommer från användarens senaste beslut:

- Desktop-topbaren med rubrik/meta och `Starta quiz` ska inte visas.
- På tablet/mobil finns toppbaren kvar som kompakt meny med ikonknappar.
- Höger sidopanel ska inte visas på startsidan.
- Höger sidopanel ska inte visas på quizöversikten.
- Lektionssidornas toppindikatorer ska inte vara klickbara.
- Text i sidindikatorer ska få radbrytas och inte klippas av.
- Föregående-knappen ska inte visas på första sidan i en modul.
- Slutprovsresultat ska inte visa de gamla provknapparna efter inlämning.
- Slutprovsresultat ska ha `Klar` längst ned till höger tillbaka till hubben.
- Slutprovsmodulen ska inte räknas som en vanlig färdig modul i hubbstatistik.
- Mobilens VU2-flik ska använda samma `shield-check`-ikon och samma låsta gråton på Hem, VU1, Quiz och Slutprov. Alla fyra tabbar märks med `data-mobile-course="vu2"` och låsstatus synkas centralt av `renderNavigationLocks()`; återinför inte separata VU2-ikoner per vy.

## CSS Och Responsivitet

Status 2026-07-10: Modulkorten i vänsterspalten reserverar en konsekvent två-raders titel- och korthöjd, så progressringarna ligger kvar på samma lodräta rutnät när användaren växlar mellan VU1 och VU2. Progressringen behåller alltid geometrin `42x42px` vid `top/right: 10px`; färdig status byter bara till grön fyllning och checkmark, inte storlek eller position.

Viktiga CSS-kopplingar:

- `body.home-mode`: gör appen tvåspaltig och döljer högerpanelen.
- `body.quiz-overview-mode`: döljer högerpanelen och justerar innehållet.
- `body.module-milestone-mode`: breddar bara modulstart-/milstolpevyn.
- `.topbar`: dold på desktop, synlig i responsiva breakpoints.
- `.context-sidebar`: högerpanel.
- `.page-tabs`, `.page-tab`, `.stepper-rail`: lektionssidornas indikator.
- `.reader-footer`: nederknappar i lektioner.
- `.final-exam-footer`: nederknappar i slutprov, döljs på resultat.
- `[hidden] { display: none !important; }`: viktigt eftersom vissa komponentklasser annars kan vinna över `hidden`.
- `.hub-module-row.is-locked`, `.module-card.is-locked`: låsta moduler.
- `.module-card.is-complete`: färdiga moduler; progressringen visar checkmark i stället för trång `100%`-text.

Om text klipps av i UI, kontrollera först:

- `white-space`
- `overflow`
- fast höjd
- flex/grid `min-width: 0`
- responsiva breakpoints runt 768/1024/1220px

## Landing Page

Aktiv landing page är `landing/index.html`.

Status 2026-07-10: Sektionen `#utbildningar` använder designalternativ `1a` från `D:\Mobile adaptation proposals (1).zip` på mobil (`max-width: 639px`). Mobilvyn har kompakta, horisontellt scrollbara snabbflikar för `VU1`, `VU2`, `Slutprov` och `Yrke`, sticky flikrad under läsning samt en aktiv modulpanel i taget. Desktop behåller den befintliga breda flikraden och tvåkolumnslayouten. `switchStudyTab()` synkroniserar aktiv panel, ARIA-state, roving `tabindex` och centrerar vald mobilflik; piltangenter samt Home/End stöds för tangentbordsnavigation.

Den innehåller:

- Header/nav.
- Hero med `landing/assets/guard-figure.png`.
- Sektion `#utbildningar` med tabs för VU1, VU2, quiz och väktaryrket.
- Sektion `#quiz-demo` med trefrågors interaktiv demo.
- Sektion `#funktioner`.
- Footer.

Interaktivitet ligger inline i `landing/index.html`:

- `switchTab(tabId)`
- `scrollToDemo()`
- `selectOption(questionNum, optionChar, isCorrect)`
- `nextQuestion()`
- `resetQuiz()`
- `window.onload = function() { switchTab("vu1"); }`

Viktigt: `landing/styles.css` och `landing/script.js` finns men är inte länkade från `landing/index.html` just nu. Om landingdesignen ändras måste man först avgöra om ändringen ska göras i inline CSS/JS i `landing/index.html` eller om filerna ska kopplas in.

`landing/server.mjs` är en minimal statisk server:

- default port `5174`,
- `PORT` kan sättas via env,
- fallback till `index.html`,
- `Cache-Control: no-store`,
- path traversal-skydd med `normalize()` och root-check.

Navigation från landing till dashboard:

- Root-URL `/` visar landing page, inte dashboarden. Detta undviker att dashboarden flashar innan auth-redirect.
- Headerknappen `Logga in` i `landing/index.html` går till `/login.html?mode=sign-in&redirect_url=/platform`.
- Root-servern `server.mjs` mappar `/login`, `/sign-in` och `/sign-up` till `login.html`.
- Efter lyckad auth går användaren vidare till dashboarden.
- Root-servern `server.mjs` mappar `/platform` till dashboardens `index.html`.
- När hela projektet körs via root-servern kan landing även öppnas på `/landing/`; root-servern mappar också `/landing` och `/landing/` till `landing/index.html`.

## Init-Flöde

Dashboardens `init()` gör:

1. Binder alla event via `bindEvents()`.
2. Startar en icke-blockerande Supabase health check via `initializeSupabaseConnection()`.
3. Hämtar `utbildning.md?v=20260704-vu2`.
4. Kör `parseCourses(markdown)`.
5. Bygger final exam pools för VU1 och VU2.
6. Aktiverar VU1, verifierar slutprovsstate.
7. Aktiverar VU2, verifierar slutprovsstate.
8. Aktiverar VU1 igen.
9. Återställer sparad vy via `restoreSavedLocation()`.
10. Renderar rätt initialvy.

Om `utbildning.md` ändras kraftigt kan dashboarden fortfarande ladda men vissa delar bli tomma om rubrikformatet inte matchar parsern.

## Event-Hantering

`bindEvents()` använder central click delegation på `document`.

Viktiga data-attribut:

- `[data-open-home]`
- `[data-open-course]`
- `[data-open-vu2]`
- `[data-show-quiz]`
- `[data-hub-module]`
- `[data-next-module]`
- `[data-return-lesson]`
- `[data-final-result-done]`
- `[data-start-final-exam]`
- `[data-resume-final-exam]`
- `[data-final-question-index]`
- `[data-final-answer]`
- `[data-question][data-answer]`
- `[data-open-quiz-reset]`
- `[data-confirm-quiz-reset]`
- `[data-cancel-quiz-reset]`

Tangentbord:

- Escape stänger quizreset-modal och drawers.
- ArrowRight/ArrowLeft navigerar i lektioner.
- ArrowRight/ArrowLeft navigerar mellan slutprovsfrågor.

## Cache Och Versionshantering

Det finns tre versionsställen att tänka på:

1. CSS query string i `index.html`.
2. JS query string i `index.html`.
3. Markdown fetch query i `app.js`.

Aktuellt:

```js
fetch("utbildning.md?v=20260704-vu2")
```

Om gammal UI visas efter ändring, uppdatera query strings och hårdladda webbläsaren.

Om gammal elevstate ger konstigt resultat, bumpa:

```js
STORAGE_VERSION
```

eller rensa relevanta `localStorage`-nycklar i devtools.

## Verifieringschecklista

Efter ändringar i dashboarden:

```powershell
cd D:\vaktskolan
node --check app.js
node --check authProvider.js
node --check auth.js
node --check supabaseApi.js
node --check server.mjs
```

För Supabase-kopplingen, starta `node server.mjs` och kontrollera `http://127.0.0.1:5173/api/supabase/health`.

För Clerk-kopplingen, starta `node server.mjs` och kontrollera `http://127.0.0.1:5173/api/clerk/config`. `ok: true` kräver att `CLERK_PUBLISHABLE_KEY` finns i `.env`. Öppna sedan `/login.html?mode=sign-in&redirect_url=/platform`.

Efter att Quiz Portal-migrationen körts i Supabase SQL Editor:

```js
await window.vaktskolanSupabase.select("quiz_collections", {
  select: "id,label,question_kind,course_id,sort_order",
  order: "sort_order.asc",
});
```

Det ska returnera sex collection-rader.

Efter att scenario-seeden körts:

```js
await window.vaktskolanSupabase.select("quiz_questions", {
  select: "id,external_id,title,status",
  collection_id: "eq.scenario_quiz",
  order: "sort_order.asc",
});
```

Det ska returnera 300 scenariofrågor om de är `published`. Om de ligger som `draft`, kontrollera via Supabase Dashboard eller server-side secret key.

Manuell kontroll i browser:

- Hem visar inte höger sidopanel.
- Hem visar snabbstatistik, fortsättbanner, VU1/VU2-kort och Quiz Portal-snabbväg.
- Hem visar `Välkommen, Sven` första gången och `Välkommen tillbaka, Sven` efter progress.
- Hem: VU2-kortet är öppet när `ENFORCE_COURSE_LOCKS = false`; när flaggan är `true` ska kortet vara låst tills VU1 är avklarad.
- Hem: `Fortsätt` går till rätt modulstart/lektion via sparad progress.
- Hem: VU1/VU2-kort öppnar respektive kurshubb.
- Hem: Quiz Portal-snabbvägen öppnar rätt vy.
- Slutprov i vänstermenyn öppnar egen portal med VU1/VU2-status.
- Slutprovsportalen startar eller återupptar prov för rätt kurs.
- VU1-hubb visar innehållsmoduler och slutprov med korrekt status.
- VU2-hubb visar innehållsmoduler och slutprov med korrekt status.
- Första sidan i en modul saknar synlig Föregående-knapp.
- Sidindikatorerna går inte att klicka för att hoppa runt.
- Lång text i sidindikatorer klipps inte.
- Modulquiz sparar svar per kurs.
- Slutprov kan startas, besvaras, lämnas in och visa resultat.
- Efter inlämnat slutprov syns `Klar`, inte `Föregående/Nästa/Lämna in`.
- `Klar` återvänder till rätt hubb, VU1 eller VU2.
- Quiz Portal visar `QuizPortalen`, demo-modulkort, demoquiz och flashcards utan den gamla slutprovskortlayouten.
- Landing `Logga in` öppnar `/login.html?mode=sign-in&redirect_url=/platform`.
- Auth-sidan visar sign in när `mode=sign-in` och sign up när `mode=sign-up`, utan kundsynlig leverantörstext.
- Med `CLERK_PUBLISHABLE_KEY` satt redirectas utloggade användare från dashboarden till `login.html`.
- Efter inloggning visar vänsterprofilen användarens namn och user-menu.

Efter ändringar i landing page:

- Headerlänkar scrollar till rätt sektion.
- `Logga in` går till auth-sidan och vidare till dashboarden efter inloggning.
- Tabs under `#utbildningar` växlar korrekt.
- Quizdemot går igenom fråga 1-3 och visar resultat.
- Hero-bilden laddar från `landing/assets/guard-figure.png`.
- Responsiv layout fungerar på mobilbredd.

## Kända Gotchas

- PowerShell-terminalen kan visa svenska tecken som mojibake i kommandooutput. Filerna är ändå avsedda som UTF-8.
- Det verkar inte finnas ett fungerande Git-repo i arbetsmappen, trots att `.git` kan finnas. Tidigare `git status` har rapporterat att det inte är ett repo.
- Appen har inget testpaket. Verifiering är syntaxcheck + manuell browserkontroll.
- Dashboarden är stateful via `localStorage`; gamla lokala svar kan påverka hur hubbar och prov ser ut.
- Supabase-kopplingen lagrar den samlade kursprogressionen i `student_learning_progress` och quizförsök/svar i de två quizhistoriktabellerna. Frågebanken och elevresultaten ska hållas separata.
- Quiz Portal-schema finns som SQL-migration och är redan körd i Supabase-projektet.
- Scenariofrågorna finns som SQL-seed och REST-importskript, och seed/import är redan körd i Supabase-projektet.
- `.env` innehåller riktiga nycklar och är ignorerad av `.gitignore`. Dela inte secret key till frontend eller GitHub.
- Clerk-auth använder publishable key i browsern via `/api/clerk/config`. `authProvider.js` har ingen statisk publishable fallback; Node/Next-servern läser publishable key från env och blockerar `pk_test_` i produktion. Clerk secret key får aldrig skickas till browsern eller sparas i projektfiler.
- Clerk secret key delades i chatten 2026-07-05 och bör roteras i Clerk Dashboard.
- Databaslösenordet bör roteras i Supabase Dashboard eftersom det delades i chatten under setupen.
- Slutprovsmodulen finns i `utbildning.md` som en modul för att parsern ska kunna läsa frågebanken, men i UI ska den behandlas som slutprov, inte som vanlig modul.
- `UNLOCK_MODULE_NAVIGATION` är fortfarande `true`; låst steg-för-steg-flöde är framtida arbete.
- `ENFORCE_COURSE_LOCKS` är fortfarande `false`; VU2 är medvetet öppet under implementation men kan låsas centralt senare.
- Landing page har separata CSS/JS-filer som inte används av den aktiva sidan.

## Rekommenderad Arbetsgång För Framtida Ändringar

1. Läs relevant del av `app.js` innan ändring. Funktionerna är tätt kopplade till varandra.
2. Ändra smått och följ befintligt mönster.
3. Om ändringen påverkar VU1, kontrollera VU2 också.
4. Om ändringen påverkar kursstate, kontrollera `localStorage`-nycklarna och om `STORAGE_VERSION` ska bumpas.
5. Om ändringen påverkar progression, kontrollera både hubbstatistik och höger sidopanel.
6. Om ändringen påverkar slutprov, kontrollera aktivt prov, inlämnat prov och 24h-lås.
7. Uppdatera cache query strings i `index.html` när CSS/JS ändrats.
8. Kör `node --check app.js`.
9. Verifiera visuellt i browser på desktop och smal viewport.

## Framtida Låst Modulflöde

Användaren har sagt att utbildningen senare ska gå steg för steg och att man inte ska kunna hoppa till moduler man inte nått.

Förberedda funktioner finns redan:

- `isModuleUnlocked(moduleIndex)`
- `isPageUnlocked(moduleIndex, lessonIndex, pageIndex)`
- `canStartFinalExam()`
- `canAccessFinalExam()`
- låsta CSS-klasser i modullistor och hubb

Trolig implementation:

1. Sätt `UNLOCK_MODULE_NAVIGATION = false`.
2. Sätt `ENFORCE_COURSE_LOCKS = true` när VU2 ska låsas överallt tills VU1 är klar.
3. Säkerställ att första modulen alltid är öppen.
4. Säkerställ att nästa modul öppnas först när föregående modul är komplett.
5. Avgör om "komplett modul" ska kräva bara lästa sidor eller även genomfört quiz.
6. Säkerställ att slutprov låses tills alla innehållsmoduler är kompletta.
7. Säkerställ att sparad position inte kan återställa eleven till en låst modul.
8. Säkerställ att hubbens `Fortsätt` går till senaste tillåtna plats.

`isModuleComplete()` kräver både besökta sidor och godkänt modulquiz (80 procent) för vanliga innehållsmoduler. Slutprovsmodulen styrs separat av godkänt slutprov.

## Senaste Implementerade Beslut

Det här har nyligen ändrats och bör inte råka rullas tillbaka:

- VU2 implementerad från `utbildning.md` på samma sätt som VU1.
- Appen hämtar `utbildning.md`, inte äldre namngiven kopia.
- Kursstate, quizsvar och slutprov separeras per VU1/VU2.
- Slutprov har inte längre `Till quiz` längst ned.
- Slutprov visar inte längre den extra raden med modul/origin ovanför frågan.
- Långa sidindikatorlabels får radbrytas.
- Desktop-topbar och toppens `Starta quiz` är dolda.
- Högerpanelen är dold på hemvyn.
- Slutprovsresultat visar `Klar` längst ned till höger.
- Hubben visar inte längre slutprov som `Klar · 7/7`.
- Föregående-knappen syns inte på första lektionssidan.
- Sidindikatorerna är inte längre klickbara.
- Färdiga moduler i vänsterspalten visar checkmark i progressringen i stället för `100%`.
- Quiz Portal är ombyggd till `QuizPortalen` med demoquiz/flashcards från `D:\v_ktarquiz_portalen.tsx`; TSX-filens header/logodel är avsiktligt inte implementerad. Introytan använder den ljusa vita paneldesignen med blå dekorform.
- Modulstart-/milstolpesidan använder nya modulöversiktsdesignen från `D:\modul_versikt.html` med innehållslista från `module.lessons` och `Ämnen` som antal ämnessidor.
- Supabase-grundkoppling är tillagd: `.env`, `.env.example`, `.gitignore`, `server.mjs`, `supabaseApi.js`, scriptinclude i `index.html` och icke-blockerande init i `app.js`.
- Quiz Portal-databasschema är förberett i `supabase/migrations/20260705133000_create_quiz_collections.sql` med collections för VU1 quiz, VU2 quiz, Flashcards, Vanlig quiz, Scenario quiz och Slutprovet.
- Scenariofrågebanken `D:\vaktarskolan_scenariobank_300.json` är validerad och mappad till `scenario_quiz` via `supabase/seeds/20260705143000_seed_scenario_quiz_300.sql` och `scripts/import-scenario-quiz.mjs`.
- Supabase-molndatabasen är uppdaterad med Quiz Portal-tabeller och 300 scenariofrågor i `scenario_quiz`.
- Landing-sidans `Logga in` går nu till `login.html?mode=sign-in&redirect_url=/platform` när projektet körs via root-servern.
- Hemfliken är byggd från `D:\hem_dashboard.html`-referensen med data-driven progress, fortsättlogik, kurskort och snabbvägar.
- Hemfliken visar nu första-besök-rubrik. VU2-låsning styrs centralt av `ENFORCE_COURSE_LOCKS`, som är `false` under implementation.
- Modulstart-/milstolpesidan är breddad på desktop via `body.module-milestone-mode`, bredare `module-milestone-panel` och tvåkolumnslista för modulens innehåll.
- Slutprov i vänstermenyn har en egen portal med VU1/VU2-status, kursrätt start/fortsätt/visa-resultat och inga beroenden till gamla `finalExam*`-kort-ID:n.
- `localStorage`-läsning validerar nu array/object-form för visited, answers, finalExams och sparad location. Korrupt sparad plats faller tillbaka till Hem.
- Clerk-auth är tillagd via vanilla JS-wrappern `authProvider.js`: `login.html` monterar sign in/sign up, landingens `Logga in` går till `login.html?mode=sign-in&redirect_url=/platform`, och dashboarden redirectar utloggade användare när `CLERK_PUBLISHABLE_KEY` är konfigurerad. Auth-sidan använder portaldesignen från `D:\v_ktarskolan_portal_redesign.html` utan kundsynlig Clerk-/miljövariabelcopy.
- Clerk-auth laddar svensk localization (`svSE`) i `authProvider.js`, och `index.html`/`login.html` cache-bustar den versionen med `authProvider.js?v=20260705-sv-localization`.
- Landing-sidans mobilhero följer den bifogade agentdesignens responsiva struktur: statisk mobilheader, max 480px canvas, fullbreddsrubrik, brödtext och väktarillustration i tvåkolumnsgrid samt 78px CTA-kort. `Gratis Quiz` ersätter CTA-korten med ett större, lättläst trefrågorsquiz som använder hela den tillgängliga mobilbredden, och `Tillbaka till valen` återställer knapparna. Quizpanelen är även förstorad på desktop med större text, minst 48–52px höga svarsalternativ och blå nästa-knapp.
- Hero-quizet får inte ligga bakom en vertikal overflow-mask. `main` på landningssidan ska inte ha `overflow-hidden`; quizlogiken använder `keepHeroQuizInView()` efter svar/nästa för att hålla feedback och `Nästa fråga` synliga.
- Hero-quizets resultatskärm är visuellt uppdaterad från `D:\quiz_result.tsx`: modern toppheader med tillbaka/resultatbadge/progress, färgtema per score och ikoncirkel. Storlek och placering ska följa den större responsiva hero-quizpanelen och får inte krympas tillbaka till den äldre 320px-mobilbredden.
