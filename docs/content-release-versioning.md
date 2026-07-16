# Versionsstyrd innehållspublicering

`content/release-manifest.json` registrerar den exakta innehållsversion som hör till en release. Varje kurs-, quiz-, flashcard-, scenario- och guidefil har både byteantal och SHA-256-hash. Fältet `contentVersion` är ett samlat digitalt fingeravtryck för hela innehållspaketet.

## Ny innehållsversion

1. Gör och verifiera innehållsändringarna.
2. Skapa ett nytt manifest med ett unikt id:

   `npm run content:manifest -- --release-id=YYYY-MM-DD-release.N`

3. Kör `npm run validate:release`.
4. Ändrade, tillagda eller borttagna innehållsfiler gör att kontrollen misslyckas tills ett nytt manifest har skapats.
5. Distribuera quiz- och kursinnehåll från filerna som finns registrerade i manifestet.

## Vad kontrollen säkerställer

- Fillistan motsvarar projektets aktuella innehållskällor.
- Byteantal och SHA-256-hash matchar för varje fil.
- `contentVersion` motsvarar den samlade filversionen.
- Manifestet innehåller en verifierad hänvisning till aktuell FAP 573-01.

Manifestet är teknisk spårbarhet. Det innehåller ingen formell releasegrind, inget krav på namngivna granskare och inget påstående om myndighets- eller expertgodkännande.

Scenariofrågorna i Supabase ska distribueras från den hashade seedfilen i manifestet. VU1-, VU2- och flashcardbankerna ska distribueras från respektive hashad JSON-fil. Ändringar direkt i databasen måste först återföras till källfilen och ge upphov till ett nytt release-manifest.
