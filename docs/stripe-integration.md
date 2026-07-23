# Permanent Premium och Stripe för Vaktskolan

## Verifierad E2E-status

Ett fullständigt sandboxflöde med Basic, betald Checkout på 399 SEK, signerad webhook, Premium-upplåsning, webhook-replay, ogiltig signatur, full återbetalning och återlåsning verifierades 2026-07-23 mot commit `851382a`.

Det daterade revisionskvittot, inklusive testmiljö, observerade databas-/Clerk-resultat, kvarlämnade resurser och reproduktionssteg, finns i [`docs/stripe-e2e-verification-2026-07-23.md`](stripe-e2e-verification-2026-07-23.md).

## Modell

Vaktskolan har två nivåer:

- `Basic`: kostnadsfritt, hela VU1 modul 1 samt totalt 10 VU1-frågor, 10 scenariofrågor och 10 flashcard-vändningar per Clerk-konto.
- `Premium`: 399 SEK som en engångsbetalning med permanent tillgång till hela plattformen.

Stripe-hosted Checkout används i `payment`-läge. Signerade webhooks är source of truth för Premium; redirecten efter Checkout ger aldrig åtkomst på egen hand. Supabase lagrar entitlement, köp, kundkoppling, livstidskvoter och webhook-replayskydd. Clerk får en synkroniserad metadata-spegel, men medlemskaps-API:t och databasen är auktoritativa.

## Hemligheter

Rotera den Stripe secret key som tidigare delades i chatten. Lägg aldrig nycklar i Git eller browserkod. Konfigurera följande i hostingens secret store och i en ignorerad lokal `.env`:

```dotenv
SITE_URL=https://vaktskolan.se
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...
CLERK_SECRET_KEY=sk_live_...
CLERK_FRONTEND_API_URL=https://clerk.vaktskolan.se
CLERK_JWKS_URL=https://clerk.vaktskolan.se/.well-known/jwks.json
CLERK_AUTHORIZED_PARTIES=https://vaktskolan.se
STRIPE_SECRET_KEY=rk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PREMIUM_PRICE_ID=price_...
STRIPE_AUTOMATIC_TAX=false
```

Checkout är hostad av Stripe och behöver därför ingen publishable key i browsern.

## Supabase

Kör migrationen `supabase/migrations/20260722210000_create_stripe_billing.sql`. Den skapar:

- `billing_customers`: Clerk user till Stripe customer, separat för test/live.
- `membership_entitlements`: auktoritativ Basic/Premium-nivå.
- `billing_purchases`: ett spårbart köp per Checkout Session.
- `membership_usage_events`: deduplicerade Basic-händelser för de tre livstidskvoterna.
- `stripe_webhook_events`: replayskydd och felstatus.
- `consume_membership_usage(...)`: server-only RPC som låser entitlement-raden, kontrollerar kvoten och registrerar användningen atomiskt.

Tabellerna har RLS och saknar klientpolicies. Endast `service_role` får läsa och skriva medlemskapsdata.

## Stripe-produkt i sandbox

1. Lägg en ny, roterad Stripe testnyckel i lokal `.env`.
2. Kör `npm run stripe:setup`.
3. Skriptet skapar eller återanvänder `Vaktskolan Premium – permanent tillgång` och en engångs-Price på 39900 öre SEK med inkluderande tax behavior, så kundpriset stannar på 399 kr.
4. Lägg utskrivet `STRIPE_PREMIUM_PRICE_ID` i `.env`.

Skriptet accepterar avsiktligt bara test-/sandboxnycklar. `STRIPE_PRODUCT_TAX_CODE` är valfri och ska endast anges efter att rätt klassificering har bestämts. Sätt `STRIPE_AUTOMATIC_TAX=true` först när Stripe Tax, produktens tax code och företagets skatteregistreringar är korrekt konfigurerade.

## Webhook

Produktionsendpoint:

```text
https://vaktskolan.se/api/stripe/webhook
```

Prenumerera på:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `checkout.session.expired`
- `charge.refunded`
- `charge.dispute.created`
- `charge.dispute.closed`

Webhooken verifierar signaturen mot requestens råa body och avvisar test/live-mismatch. Ett betalt Checkout-event måste innehålla exakt den konfigurerade engångs-Price som kostar 399 SEK. Betalning ger Premium i Supabase och synkar Clerk `publicMetadata.membershipTier` samt `publicMetadata.premiumAccess`. En full återbetalning eller aktiv/förlorad tvist återkallar åtkomsten om kontot inte har ett annat giltigt köp. En vunnen tvist återställer Premium om debiteringen inte är återbetald.

Lokal webhooktestning kan göras med Stripe CLI:

```powershell
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Lägg den tillfälliga `whsec_...` som CLI:n visar i lokal `.env`.

## API-flöden

- `POST /api/stripe/checkout`: verifierar Clerk-JWT, blockerar redan Premium och skapar en Stripe Checkout Session i `payment`-läge.
- `POST /api/stripe/webhook`: tar endast emot signerade Stripe-events och uppdaterar köp/entitlement.
- `GET /api/membership/status`: returnerar endast det inloggade kontots nivå och tre kvoter.
- `POST /api/membership/consume`: tar en usage-typ och idempotent eventnyckel; Clerk user hämtas alltid från den verifierade sessionen.

Frontend skickar aldrig user-id, pris eller Premium-status som betrodd data. Premium-knappar går via Clerk-inloggningen till `/plattform?upgrade=premium`, varefter servern skapar Checkout.

## Acceptanstest i sandbox

1. Skapa ett nytt Clerk-konto och kontrollera att status är Basic med 10/10/10 kvar.
2. Slutför hela VU1 modul 1. Kontrollera att modul 2 och senare visar ett klickbart Premium-lås.
3. Besvara exakt 10 VU1-frågor och 10 scenariofrågor. Den elfte åtgärden ska nekas server-side och öppna Premium-modalen.
4. Vänd flashcards från framsida till svar exakt 10 gånger. Vändning tillbaka ska inte räknas; den elfte svarsvändningen ska nekas.
5. Köp Premium med ett Stripe-testkort. Kontrollera `billing_customers`, `billing_purchases`, `membership_entitlements` och Clerk-metadata.
6. Kontrollera att hela VU1/VU2, alla quiz, flashcards och slutprov är tillgängliga efter webhookbekräftelsen.
7. Skicka samma webhookevent igen och bekräfta att replay inte skapar dubbla köp eller felaktiga kvoter.
8. Gör en full teståterbetalning och kontrollera att kontot återgår till Basic utan att tidigare usage-events nollställs.
9. Testa två samtidiga browserflikar på den sista Basic-kvoten; endast en åtgärd ska tillåtas.

## Live-sättning

Skapa motsvarande produkt/Price i live mode, konfigurera en separat live-webhook och en ny live restricted key. Konfigurera kvitton, betalningsmetoder, skatter och juridisk köpinformation i Stripe Dashboard. Byt alla livevärden atomärt i hostingmiljön och genomför hela sandbox-testet före lansering. Testkort får aldrig användas i live mode.
