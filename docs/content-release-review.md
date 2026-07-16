# Versionsstyrd innehållsgranskning

`content/release-manifest.json` är registret för den exakta innehållsversion som ska granskas inför release. Varje kurs-, quiz-, flashcard-, scenario- och guidefil har både byteantal och SHA-256-hash. Fältet `contentVersion` är ett samlat fingeravtryck för hela innehållspaketet.

## Ny innehållsversion

1. Gör och verifiera innehållsändringarna.
2. Skapa ett nytt manifest med ett unikt id:

   `npm run content:manifest -- --release-id=YYYY-MM-DD-release.N`

3. Kör `npm run validate:release`. Ändrade, tillagda eller borttagna innehållsfiler gör att kontrollen misslyckas tills ett nytt manifest har skapats.
4. Ge granskarna `releaseId` och hela `contentVersion`. Granskningen ska avse exakt dessa hashade filer.
5. När respektive granskare har godkänt versionen fylls namn, roll och ISO-tid i under `reviews.legal` och `reviews.subjectMatter`, med status `approved`.
6. Sätt `releaseReady` till `true` först när båda granskningarna är godkända. Valideringen stoppar motstridiga statusar.

## Nuvarande status

Den första registrerade prelaunch-versionen är medvetet markerad `pending` för både juridisk och sakkunnig granskning. Manifestet är spårbarhet, inte ett påstående om att innehållet redan är godkänt.

Scenariofrågorna i Supabase ska distribueras från den hashade seedfilen i manifestet. VU1-, VU2- och flashcardbankerna ska distribueras från respektive hashad JSON-fil. Ändringar direkt i databasen måste först återföras till källfilen och ge upphov till ett nytt release-manifest.
