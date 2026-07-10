# SEO-lansering för vaktskolan.se

## InstaPods och miljövariabler

- Podden ska använda Node.js och bygga repots rot med `npm install`, `npm run build` och `npm start`.
- Sätt `APP_ENV=production` och `SITE_URL=https://vaktskolan.se` i poddens Env-flik. Produktionsbygget stoppas om `SITE_URL` saknas.
- Sätt produktionens Clerk- och Supabase-variabler enligt `.env.example`. Rotera alltid en serverhemlighet som har visats i en skärmbild, logg eller chatt innan deployment.
- Clerk måste använda production instance: `CLERK_PUBLISHABLE_KEY` och `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` ska börja med `pk_live_`, `CLERK_FRONTEND_API_URL` ska vara `https://clerk.vaktskolan.se`, och `CLERK_JWKS_URL` ska vara `https://clerk.vaktskolan.se/.well-known/jwks.json`.
- DNS-posterna `accounts`, `clerk`, `clk._domainkey`, `clk2._domainkey` och `clkmail` ska vara verifierade i Clerk innan login testas live. Om `clkmail` inte verifieras, kontrollera att target slutar på `.clerk.services`.
- Lägg in `GOOGLE_SITE_VERIFICATION` och `BING_SITE_VERIFICATION` efter att egendomen har skapats i respektive webmasterverktyg.
- Koppla både `vaktskolan.se` och `www.vaktskolan.se` i InstaPods Domains. Proxy-lagret skickar www till apex med 308.
- Kontrollera i InstaPods Logs att builden lyckas och att Next lyssnar på poddens tilldelade `PORT`. Startkommandot binder uttryckligen till `0.0.0.0`.
- Test- och pod-adresser som inte använder canonical-domänen svarar med `X-Robots-Tag: noindex, nofollow, noarchive`, även om `APP_ENV=production`.
- Använd Git-fliken för deploymenthistorik och rollback. Publicera inte direkt från en otestad lokal arbetsmapp.

## Obligatoriskt innehåll före indexering

- Ersätt organisationsuppgifter i integritets- och villkorstexterna med korrekt juridiskt namn, organisationsnummer och postadress.
- Verifiera att `kontakt@vaktskolan.se` är aktiv och bevakad.
- Låt ansvarig redaktion manuellt kontrollera samtliga 12 kärnsidor mot de synliga primärkällorna.
- Kontrollera särskilt utbildningstider, PYT-krav, FAP-hänvisningar och all text om befogenheter.
- Publicera inte formuleringar som “expertgranskad”, “officiell”, “godkänd utbildning” eller “branschledande” utan dokumenterbart stöd.

## Search Console och Bing

1. Verifiera apex-domänen via DNS.
2. Skicka `https://vaktskolan.se/sitemap.xml`.
3. Inspektera startsidan, `/vaktarprov`, `/vaktarutbildning/vu1` och `/lagstod/envarsgripande`.
4. Bekräfta att Google väljer samma canonical som sidan deklarerar.
5. Kontrollera att `/plattform`, `/login`, `/integritet` och `/anvandarvillkor` inte indexeras.

## Kvalitetsgrind

Kör lokalt mot ett produktionsbygge:

```powershell
$env:SITE_URL='https://vaktskolan.se'
$env:APP_ENV='production'
npm test
npm run build
npm start -- -p 3000
$env:BASE_URL='http://127.0.0.1:3000'
$env:EXPECT_PRODUCTION_INDEXING='true'
npm run test:seo
```

Lansera först när SEO-smoketestet är grönt, Lighthouse mobile är minst 90/100/95/95 och LCP är högst 2,5 sekunder. Kör en ny Lighthouse-mätning efter varje större design- eller driftförändring; tidigare mätvärden får inte återanvändas för en annan version av landningssidan.

## Uppföljning

- Dag 7: indexstatus, sitemap, 404 och canonical-val.
- Dag 30: impressions, CTR, sökfrågor, Core Web Vitals och eventuella crawlerfel.
- Dag 60: förbättra titlar och innehåll utifrån verkliga sökfrågor; publicera nya stödsidor där användarbehovet är tydligt.
- Dag 90: utvärdera ämneskluster, förtjänade länkar, konvertering till quiz och hänvisningar från AI-söktjänster.
