# Emblemsystem

Emblemen är en visuell sammanfattning av elevens faktiska kursresultat. De räknas fram från samma progression som redan sparas på användarkontot i Supabase. Ett emblem är därför inte en separat sanning som kan hamna ur synk med kursen.

## Upplåsningsregler

| Emblem | Upplåsningskrav |
| --- | --- |
| Grundstenen (VU1) | Alla VU1-moduler är klara. En modul kräver samtliga sidor och ett inskickat modulquiz med minst 80 procent rätt. |
| Fördjupningen (VU2) | Alla VU2-moduler är klara enligt samma regel. |
| Godkänd VU1 (Prov 1) | VU1-slutprovet är inskickat och godkänt med minst 80 procent rätt. |
| Godkänd VU2 (Prov 2) | VU2-slutprovet är inskickat och godkänt med minst 80 procent rätt. |
| Första fullträffen (Quiz) | Minst ett modulquiz i VU1 eller VU2 är inskickat och godkänt med minst 80 procent rätt. |

Quiz Portal är ett träningsläge där resultat inte sparas. Portalens VU1-, VU2- och scenarioquiz låser därför inte upp emblem.

## Datamodell och synkning

`emblemSystem.js` tar emot en summering per kurs och räknar deterministiskt fram status, procent och text för varje emblem. Underlaget kommer från:

- färdigställda lektionssidor,
- inskickade och godkända modulquiz,
- inskickade och godkända slutprov.

Underlaget ingår redan i `student_learning_progress` och följer därmed användaren mellan enheter. Ingen ny Supabase-tabell eller migration krävs.

Webbläsaren sparar endast vilka upplåsta emblem som redan har presenterats på den aktuella enheten. Den uppgiften styr animationen och notisen “Nytt emblem”, aldrig själva upplåsningen. Uppgiften nollställs när en annan användare loggar in i samma webbläsare.

## Gränssnitt

Hemvyn visar fem medaljonger med upplåst eller låst status och kort progressinformation. Varje medaljong är en knapp som öppnar en tillgänglig detaljdialog med:

- namn och beskrivning,
- exakt upplåsningskrav,
- aktuell progress,
- progressbar och status.

Nyligen upplåsta emblem får en kort, återhållsam animation och en toast. Animationen stängs av när användaren har valt reducerad rörelse i operativsystemet.

## Test och underhåll

Kör `npm run test:emblems` för de renodlade kriterietesterna. Testet täcker tom progression, första godkända quizet, slutförd VU1, godkänt VU1-slutprov, full upplåsning och procentbegränsning.

Nya emblem ska definieras i `emblemSystem.js` och få motsvarande testfall här innan lansering. Ändra inte gränsvärden endast i emblemsystemet; de måste fortsatt matcha kursens regler i `app.js`.
