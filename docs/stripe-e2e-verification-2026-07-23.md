# E2E-verifieringskvitto: Stripe och permanent Premium

- Datum: 2026-07-23
- Verifierad Git-commit: `851382a` (`Disable Managed Payments for Premium checkout`)
- Miljö: separat Stripe-sandbox, Clerk Development och InstaPods staging mot befintligt Supabase-projekt

Det här dokumentet är ett tekniskt kvitto på den fullständiga sandboxkontroll som genomfördes för Vaktskolans engångsköp av Premium. Det beskriver observerade resultat, kvarlämnade testresurser och hur testet kan upprepas. Det innehåller avsiktligt inga API-nycklar, webhook-hemligheter, lösenord eller kompletta autentiseringsuppgifter.

## Resultat i korthet

Hela applikationskedjan verifierades utan en riktig debitering:

```text
Basic-konto
  -> servergenererad Stripe Checkout
  -> betald testsession, 399 SEK
  -> signerad checkout.session.completed-webhook
  -> Premium i Supabase och Clerk
  -> Premium-upplåsning i gränssnittet
  -> full sandboxåterbetalning
  -> signerad charge.refunded-webhook
  -> Basic återställd och Premium åter låst
```

Även webhook-signaturkontroll, idempotens, test/live-separation och produktionens grundhälsa verifierades. Testet kan inte bevisa att en verklig kortutgivare kommer att godkänna en viss kunds köp eller att en utbetalning når bankkontot, men Vaktskolans egen betalnings-, webhook-, databas-, Clerk- och behörighetskedja fungerade från början till slut.

## Isolerad testmiljö

### Stripe sandbox

Följande testresurser skapades:

- Produkt: `Vaktskolan Premium – permanent tillgång`.
- Engångspris: 39900 öre SEK, alltså 399 kr.
- Inkluderande skattebeteende och tax category för digitalt tillhandahållna tjänster.
- Produktmetadata: `membership=premium`, `access=permanent` och `application=vaktskolan`.
- En separat restricted test key enligt minsta privilegium:
  - Charges and Refunds: Read
  - Customers: Write
  - Payment Intents: Write
  - Products: Read
  - Prices: Read
  - Checkout Sessions: Write
- En testwebhook till `https://vaktskolan-staging.nbg1-5.instapods.app/api/stripe/webhook`.
- Webhook-event:
  - `checkout.session.completed`
  - `checkout.session.async_payment_succeeded`
  - `checkout.session.async_payment_failed`
  - `checkout.session.expired`
  - `charge.refunded`
  - `charge.dispute.created`
  - `charge.dispute.closed`

Stripe använde sandboxläge (`livemode=false`) och den då aktuella standardversionen `2026-06-24.dahlia`. En tillfällig dubblett av webhookdestinationen togs bort; endast den verifierbara testdestinationen behölls.

### Clerk Development

- Vaktskolans befintliga Clerk Development-instans återanvändes.
- Clerk-integrationen för Supabase aktiverades så att utvecklings-JWT får den Supabase-roll som krävs.
- Ett syntetiskt testkonto skapades: `vaktskolan.e2e.20260723+clerk_test@example.com`.
- Testkontots aktiva session återkallades efter testet.
- Tillfälligt testlösenord och andra autentiseringsuppgifter kasserades och finns inte i repot.
- Produktionsinstansen och dess användare förblev separerade från utvecklingsinstansen.

### Supabase

Det befintliga Supabase-projektet återanvändes. Det är säkert för detta flöde eftersom billingtabellerna separerar sandbox- och produktionsrader med `livemode`.

Följande Clerk issuer finns efter testet parallellt med produktions-issuer:

- Produktion: `https://clerk.vaktskolan.se`
- Development: `https://main-caribou-31.clerk.accounts.dev`

Ingen separat betald Supabase-instans skapades. Alla testköp, testentitlements och testevents skrevs med `livemode=false`.

### InstaPods staging

- Separat pod: `vaktskolan-staging`.
- Adress: `https://vaktskolan-staging.nbg1-5.instapods.app`.
- Branch/commit under testet: `main` på `851382a`.
- Miljön använde Clerk Development, Stripe sandbox och stagingorigin men samma Supabase-projekt.
- `APP_ENV=staging`, `SITE_URL` och Clerk authorized party pekade på stagingadressen.
- Podden stoppades efter testet för att undvika fortsatt kostnad.
- Testet förbrukade 0,10 USD av befintliga InstaPods-krediter. Visad beräknad faktura efter stopp var 0,00 USD.
- Produktionspodden `vaktskolan` var fortsatt igång under hela testet.

Stagingens hemligheter ligger i hostingens secret store och ska inte kopieras till dokumentation eller Git.

## Genomförd acceptanskontroll

| Kontroll | Observerat resultat |
| --- | --- |
| Basic före köp | Kontot laddade plattformen som Basic. VU2 visade Premium-lås och uppgraderings-CTA. |
| Premium-modal | Visade 399 kr, engångsbetalning och permanent tillgång. |
| Stripe Checkout | Stripe-hostad Checkout öppnades tydligt i sandboxläge. |
| Betalning | Testsessionsstatus blev `complete`, `payment_status=paid`, `amount_total=39900`, `currency=sek`, `mode=payment` och `livemode=false`. |
| Kontokoppling | Checkouts client reference matchade Clerk-testanvändaren. Metadata beskrev `premium` och permanent tillgång. |
| Supabase-köp | `billing_purchases` fick ett betalt köp på 39900 öre SEK med `livemode=false`. |
| Supabase-entitlement | `membership_entitlements` blev `tier=premium`, `source=stripe`, utan återkallelsetid och med korrekt Payment Intent-koppling. |
| Clerk-spegel | `publicMetadata.membershipTier=premium` och `premiumAccess=true`; privata Stripe-referenser matchade köpet. |
| Webhookjournal | `checkout.session.completed` markerades processad utan `last_error`. |
| UI efter köp | Premium-låset försvann. Vyn visade i stället den separata progressionsgrinden `Slutför VU1 först`, vilket bekräftade att medlemskapslåset var upplåst. |
| Replay/idempotens | Samma genuina Stripe-event signerades om och skickades igen. API:t svarade HTTP 200 med `received=true` och `duplicate=true`; inget dubbelt köp skapades. |
| Felaktig signatur | En request med ogiltig signatur avvisades med HTTP 400 och `Invalid Stripe signature.` |
| Full återbetalning | En full sandboxrefund på 399 kr lyckades och `charge.refunded` behandlades utan fel. |
| Supabase efter refund | Köpet blev `refunded`; entitlement återgick till `tier=basic`, `source=basic` och fick `revoked_at`. |
| Clerk efter refund | `membershipTier=basic`, `premiumAccess=false` och privata Stripe-köpreferenser togs bort. |
| UI efter refund | En riktig sidomladdning visade åter `Lås upp med Premium`. |
| Test/live-isolering | Alla verifierade billingrader och Stripe-events hade `livemode=false`. |

## Produktionskontroller efter testet

Efter återbetalningen och stängningen av staging kontrollerades:

- `https://vaktskolan.se/` svarade HTTP 200.
- `/api/clerk/config` svarade HTTP 200 med `ok=true`, live publishable key-typ och `https://clerk.vaktskolan.se` som frontend API.
- `/api/supabase/health` svarade HTTP 200 med `ok=true`.
- Produktionspodden fortsatte vara igång.
- Inga testresurser eller testköp blandades ihop med produktionsrader.

## Automatiska tester och repository-status

`npm test` passerade efter implementationen och omfattade:

- TypeScript typecheck.
- ESLint.
- innehålls- och releasevalidering.
- plattformsgrindar.
- emblemtester.
- Stripe billing-tester.

Själva E2E-verifieringen krävde ingen kodändring. Repot låg kvar på commit `851382a`; endast de sedan tidigare otrackade katalogerna `output/` och `tmp/` lämnades orörda.

## Kvarlämnade resurser

Följande finns kvar för reproducerbarhet:

- Stripe sandboxprodukt, engångspris, restricted test key och testwebhook.
- Clerk Development-testkontot, men utan aktiv session och utan sparade inloggningsuppgifter.
- Supabasekopplingen för Clerk Development issuer.
- InstaPods-podden `vaktskolan-staging`, stoppad.
- Sandboxens köp-, webhook- och refundrader med `livemode=false` som revisionsspår.

Radera inte resurserna av misstag när produktionsresurser städas. Test- och liveobjekt ska alltid identifieras med Stripe mode, Clerk-instans och databasens `livemode`.

## Så upprepas testet

1. Starta `vaktskolan-staging` i InstaPods och vänta tills deploymenten är frisk.
2. Kontrollera att staging fortfarande använder Clerk Development, Stripe sandbox och stagingadressen som `SITE_URL`/authorized party. Läs aldrig ut hemligheter till loggar.
3. Skapa helst ett nytt syntetiskt Clerk Development-konto.
4. Verifiera Basic och ett synligt Premium-lås före köp.
5. Starta Premiumköpet från appen och använd Stripes standardtestkort `4242 4242 4242 4242`, ett framtida utgångsdatum och valfri giltig CVC.
6. Kontrollera att Checkouts belopp är exakt 399 kr och att sidan uttryckligen visar sandbox/testläge.
7. Vänta på den signerade webhooken; verifiera därefter Premium i `membership_entitlements`, `billing_purchases`, `stripe_webhook_events`, Clerk-metadata och UI.
8. Om idempotens kontrolleras, återspela exakt samma event med en ny giltig Stripe-signatur och förvänta `duplicate=true`.
9. Gör en full sandboxrefund och verifiera Basic i databas, Clerk och en hårt omladdad frontend.
10. Återkalla testsessionen och stoppa stagingpodden igen.
11. Kör produktionens tre read-only-kontroller: startsida, Clerk config och Supabase health.

Använd aldrig testkort i live mode och gör aldrig ett riktigt 399-kronorsköp för den här regressionstesten.

## Säkerhetsnotering och öppet driftarbete

Inga hemligheter har lagts i detta kvitto. En scan av Git-spårade filer efter Stripe secret/restricted keys och webhook signing secrets gav ingen träff när kvittot skapades.

Flera autentiseringsuppgifter har däremot tidigare delats i chattar under projektets setup, bland annat Stripe-nycklar. De ska betraktas som exponerade även om de inte finns i Git:

1. Skapa ersättningsnycklar med minsta möjliga behörighet, separat för test och live.
2. Uppdatera InstaPods secret store atomärt.
3. Genomför en read-only hälsokontroll och ett sandboxköp.
4. Återkalla de gamla nycklarna först när ersättningen är verifierad.
5. Kontrollera Stripe Workbench/loggar efter okänd aktivitet.

Rotera inte en aktiv produktionsnyckel utan att samtidigt uppdatera driftmiljön; det skulle stoppa nya Checkout-sessioner.
