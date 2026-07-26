# Rekommenderade slutprovsfrågor – VU1 top 50 och VU2 top 40

Detta är det implementerade urvalet från de frågor som redan finns i slutprovets fullständiga källbank.

## Implementerad provkonfiguration

- VU1 visar exakt samtliga 50 frågor i listan nedan.
- VU2 visar exakt samtliga 40 frågor i listan nedan.
- Frågornas ordning blandas vid varje nytt prov, men inga andra frågor kan väljas in.
- Skrivtiden är 30 minuter för båda slutproven.
- Godkäntgränsen är fortsatt 80 procent: minst 40 av 50 rätt i VU1 och minst 32 av 40 rätt i VU2.
- Den fullständiga källbanken ligger kvar oförändrad i kursmaterialet (154 tillgängliga VU1-frågor och 74 tillgängliga VU2-frågor efter nuvarande parser/deduplicering). Filtreringen sker i `app.js` genom stabila fråge-ID:n.
- Gamla avslutade prov kan fortfarande läsas från den fullständiga källbanken så att tidigare resultat och kursupplåsningar bevaras. Ett äldre pågående prov som inte innehåller exakt hela det nya 50/40-urvalet återställs och måste startas om.
- Slutprovets landningskort visar alltid resultat på den aktuella skalan: VU1 som `x/50` och VU2 som `x/40`. Resultat från det äldre 30-frågorsformatet räknas om till motsvarande nivå och märks som omräknade; det sparade originalresultatet ändras inte.

## Urvalsprinciper

- Täcker samtliga kursmoduler med tyngd på kursens säkerhets- och juridikkritiska moment.
- Prioriterar tillämpning, omdöme och realistiska arbetssituationer framför smal detaljkunskap.
- Undviker tydliga innehållsdubbletter och frågor där rätt svar kan gissas enbart på formuleringen.
- Behåller frågetext, svarsalternativ, facit och förklaring från den befintliga banken. Endast ett felaktigt avslutande Markdown-separatorfragment har städats bort ur vissa förklaringar.
- Numreringen följer kursens modulordning. Den anger inte att fråga 1 är viktigare än fråga 50.

## Fördelning per modul

| Kurs | Modul | Antal valda frågor |
|---|---|---:|
| VU1 | Modul 1 · Regler för bevakningsverksamheten | 4 |
| VU1 | Modul 2 · Bevakningsjuridik | 8 |
| VU1 | Modul 3 · Arbetsmiljö | 3 |
| VU1 | Modul 4 · Bevakningstjänst | 5 |
| VU1 | Modul 5 · Tekniska hjälpmedel | 4 |
| VU1 | Modul 6 · Brand | 5 |
| VU1 | Modul 7 · Yrkesetik och moral | 4 |
| VU1 | Modul 8 · Olaga diskriminering och mänskliga beteenden | 3 |
| VU1 | Modul 9 · Konflikthantering och självskydd | 5 |
| VU1 | Modul 10 · Handfängsel | 4 |
| VU1 | Modul 11 · Akutsjukvård | 5 |
| VU2 | Modul 1 · Bevakningsjuridik – fördjupning | 8 |
| VU2 | Modul 2 · Bevakningstjänst – fördjupning | 7 |
| VU2 | Modul 3 · Konflikthantering och självskydd – fördjupning | 7 |
| VU2 | Modul 4 · Arbetsmiljö – fördjupning | 7 |
| VU2 | Modul 5 · Samhällets rättsvårdande myndigheter | 5 |
| VU2 | Modul 6 · Droger | 6 |

## Kvalitetsnotering om den befintliga banken

- VU1-frågan `vu1-module-1-quiz-2` är avsiktligt bortvald. Frågan frågar efter de tre lagstadgade kriterierna för personalgodkännande, men det aktuella facit pekar på alternativ D (`Körkort, språkkunskaper och svenskt medborgarskap`) medan alternativ B innehåller de korrekta kriterierna (`Laglydnad, medborgerlig pålitlighet och lämplighet i övrigt`). [4 § lagen om bevakningsföretag](https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-1974191-om-bevakningsforetag_sfs-1974-191/) bekräftar alternativ B. Källbanken bör rättas separat innan frågan används igen.
- VU1-frågan `vu1-module-1-quiz-8` om tystnadsplikt är också bortvald. Förklaringen anger en generell, tidsobegränsad tystnadsplikt enligt lagen om bevakningsföretag, men den [gällande lagtexten](https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-1974191-om-bevakningsforetag_sfs-1974-191/) innehåller ingen sådan allmän bestämmelse. Tystnadsplikten kan i stället bero på anställningsvillkor, uppdrag och speciallagstiftning. Frågan bör därför preciseras juridiskt innan den används igen.

# VU1 – top 50

## Modul 1 · Regler för bevakningsverksamheten

### 1. Vad krävs för att ett företag ska få bedriva yrkesmässig bevakning för annans räkning?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-1-quiz-1`*

- A) Registrering hos Bolagsverket räcker
- B) Auktorisation från Länsstyrelsen
- C) Tillstånd från Polismyndigheten
- D) Medlemskap i en branschorganisation

**Rätt svar:** B) Auktorisation från Länsstyrelsen

**Förklaring:** Lagen om bevakningsföretag kräver auktorisation, och utan den är verksamheten straffbar. Polismyndigheten skriver föreskrifter om bland annat utbildning, men det är Länsstyrelsen som prövar auktorisationen.

---

### 2. Ett fastighetsbolag låter egna anställda vakta bolagets egna byggnader. Krävs auktorisation?

*Källa: Slutprov · Internt fråge-id: `vu1-final-bank-1-2-1`*

- A) Ja, all form av organiserad bevakning kräver auktorisation från Länsstyrelsen, utan undantag
- B) Ja, så snart de anställda bär uniform
- C) Ja, om bevakningen sker nattetid eller med hund
- D) Nej – lagen gäller yrkesmässig bevakning för annans räkning; egenbevakning omfattas inte

**Rätt svar:** D) Nej – lagen gäller yrkesmässig bevakning för annans räkning; egenbevakning omfattas inte

**Förklaring:** Nyckelorden i lagen är "yrkesmässigt" och "för annans räkning" – den som vaktar sitt eget behöver ingen auktorisation.

---

### 3. Vilken är rätt ordning i väktarens grundutbildning?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-1-quiz-3`*

- A) VU1 → praktisk yrkesträning (PYT) → VU2
- B) VU2 → VU1 → praktisk yrkesträning (PYT)
- C) Praktisk yrkesträning (PYT) → VU1 → VU2
- D) VU1 → VU2 → praktisk yrkesträning (PYT)

**Rätt svar:** A) VU1 → praktisk yrkesträning (PYT) → VU2

**Förklaring:** Först 88 timmar VU1, sedan minst 160 timmars praktisk yrkesträning under handledning, och därefter VU2. Först då är man behörig för självständigt väktararbete.

---

### 4. Vad skiljer en ordningsvakt från en väktare?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-1-quiz-7`*

- A) Ingenting – det är två olika ord för precis samma yrke och samma befogenheter
- B) Ordningsvakten är anställd av Polismyndigheten och arbetar på polisens direkta uppdrag
- C) Väktaren har fler tvångsbefogenheter än ordningsvakten och kan därför ingripa i betydligt fler situationer
- D) Ordningsvakten förordnas av Polismyndigheten och har ordningshållande befogenheter som väktaren saknar

**Rätt svar:** D) Ordningsvakten förordnas av Polismyndigheten och har ordningshållande befogenheter som väktaren saknar

**Förklaring:** Ordningsvakten lyder under Polismyndigheten genom sitt förordnande och har lagstadgade ordningshållande befogenheter. Väktaren arbetar med envars rättigheter och uppdragsgivarens rättigheter – men har inga egna tvångsmedel. Ordningsvakten kan till exempel avvisa och omhänderta.

---

## Modul 2 · Bevakningsjuridik

### 5. Vilka två delar krävs för att en gärning ska vara ett brott?

*Källa: Slutprov · Internt fråge-id: `vu1-final-bank-2-1-5`*

- A) Oberoende vittnen och teknisk bevisning som binder gärningsmannen till platsen och tidpunkten
- B) En formell polisanmälan och ett väckt åtal
- C) Objektiva rekvisit – själva gärningen – och subjektiva rekvisit – uppsåt eller oaktsamhet
- D) En konstaterad skada och ett tydligt ekonomiskt motiv

**Rätt svar:** C) Objektiva rekvisit – själva gärningen – och subjektiva rekvisit – uppsåt eller oaktsamhet

**Förklaring:** Det räcker inte att något hänt – gärningsmannen måste också ha haft uppsåt, vilket är därför den glömska kunden inte begår stöld.

---

### 6. Vad skiljer stöld från egenmäktigt förfarande?

*Källa: Slutprov · Internt fråge-id: `vu1-final-bank-2-2-6`*

- A) Stöld begås inne i byggnader medan egenmäktigt förfarande begås utomhus på allmän plats under bar himmel
- B) Egenmäktigt förfarande gäller enbart fordon och cyklar
- C) Enbart värdet på det som gärningsmannen har tagit
- D) Tillägnelseuppsåtet – stöld kräver avsikt att tillägna sig saken, vilket egenmäktigt förfarande saknar

**Rätt svar:** D) Tillägnelseuppsåtet – stöld kräver avsikt att tillägna sig saken, vilket egenmäktigt förfarande saknar

**Förklaring:** Den som "lånar" en cykel utan lov för att åka hem begår egenmäktigt förfarande – den som tar den för att behålla den begår stöld.

---

### 7. Vilka är grundvillkoren för ett envarsgripande?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-2-quiz-1`*

- A) Att brottet har böter i straffskalan och att polisen godkänner gripandet i förväg per telefon
- B) Att gärningsmannen erkänner brottet på plats inför minst ett vittne
- C) Fängelse i straffskalan, bar gärning eller flyende fot, och skyndsamt överlämnande till polis
- D) Att väktaren är i tjänst, bär uniform och har genomgått hela grundutbildningen

**Rätt svar:** C) Fängelse i straffskalan, bar gärning eller flyende fot, och skyndsamt överlämnande till polis

**Förklaring:** Det är de tre nycklarna i rättegångsbalken 24 kap. 7 §. Rätten gäller envar – uniform eller tjänstgöring krävs inte, och något erkännande eller förhandsgodkännande finns inte i lagen.

---

### 8. En butikskontrollant ser en stöld men tappar bort gärningsmannen i folkvimlet. Tio minuter senare upptäcks samma person i en annan del av gallerian. Vad gäller?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-2-quiz-3`*

- A) Gripande får ske så länge det har gått mindre än en timme sedan själva stölden
- B) Gripande får ske om en kollega självständigt kan bekräfta att det verkligen är rätt person som setts tidigare
- C) Gripande får i så fall bara ske utanför gallerian, ute på allmän plats
- D) Gripande får inte ske – uppsikten är bruten, så varken bar gärning eller flyende fot föreligger längre

**Rätt svar:** D) Gripande får inte ske – uppsikten är bruten, så varken bar gärning eller flyende fot föreligger längre

**Förklaring:** Flyende fot kräver ett oavbrutet flyende under kontinuerlig uppsikt. Bryts kedjan återstår att larma polis och lämna ett bra signalement.

---

### 9. Vad får en skyddsvisitation i samband med ett envarsgripande användas till?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-2-quiz-5`*

- A) Att leta rätt på stöldgodset som personen misstänks bära på sig
- B) Att fastställa personens identitet inför polisens ankomst
- C) Att säkra teknisk bevisning inför den kommande rättegången
- D) Att av säkerhetsskäl söka efter vapen och andra farliga föremål

**Rätt svar:** D) Att av säkerhetsskäl söka efter vapen och andra farliga föremål

**Förklaring:** Skyddsvisitationen (polislagen 19 § via 29 §) finns enbart för säkerheten. Gods, ID och bevis är polisens sak – däremot får stöldgods som påträffas öppet i samband med gripandet tas i beslag.

---

### 10. Var går lagens gräns för hur mycket våld som får användas i en nödvärnssituation?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-2-quiz-9`*

- A) Gärningen får inte vara uppenbart oförsvarlig i förhållande till angreppet
- B) Våldet får aldrig orsaka någon skada alls
- C) Endast exakt samma slags våld som angriparen själv använder är tillåtet att svara med
- D) Det finns ingen gräns så länge man är angripen

**Rätt svar:** A) Gärningen får inte vara uppenbart oförsvarlig i förhållande till angreppet

**Förklaring:** Formuleringen "uppenbart oförsvarlig" ger den angripne en marginal – men våldet ska stå i rimligt förhållande till angreppets art och upphöra när angreppet upphör.

---

### 11. En varm sommardag ser du ett litet barn ensamt i en låst bil i solen. Barnet är rött i ansiktet och slött. Ingen förare syns. Får du krossa rutan?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-2-quiz-11`*

- A) Nej, skadegörelse är alltid ett brott oavsett avsikten bakom
- B) Ja – nödbestämmelsen gör gärningen tillåten när fara hotar liv och hälsa
- C) Endast om bilägaren i efterhand ger sitt uttryckliga samtycke till skadan
- D) Endast om polisen först hinner ge sitt tillstånd per telefon

**Rätt svar:** B) Ja – nödbestämmelsen gör gärningen tillåten när fara hotar liv och hälsa

**Förklaring:** Detta är ett klassiskt nödfall enligt brottsbalken 24 kap. 4 §: faran för barnets liv väger långt tyngre än skadan på rutan. Larma 112 – men vänta inte om barnets tillstånd kräver omedelbart ingripande. Gärningen får inte vara oförsvarlig i förhållande till faran.

---

### 12. En 13-åring krossar en monter och tar varor, och du tar honom på bar gärning. Brottet har fängelse i straffskalan. Vad gäller?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-2-quiz-13`*

- A) Gripande är möjligt enligt LUL 35 § – den unge ska skyndsamt överlämnas till polis
- B) Barn under 15 år får aldrig gripas av någon
- C) Gripande är möjligt, men du ska lämna barnet till dess föräldrar i stället för till polisen
- D) Du ska hålla kvar barnet tills socialtjänsten kommer till platsen

**Rätt svar:** A) Gripande är möjligt enligt LUL 35 § – den unge ska skyndsamt överlämnas till polis

**Förklaring:** Lagen om unga lagöverträdare 35 § speglar envarsgripandets villkor även för den som är under 15. Överlämningen sker skyndsamt till polis – aldrig egna uppgörelser eller väntan på andra myndigheter – och proportionaliteten bedöms extra strängt när det gäller barn.

---

## Modul 3 · Arbetsmiljö

### 13. Vem har huvudansvaret för arbetsmiljön på en arbetsplats?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-3-quiz-1`*

- A) Skyddsombudet
- B) Varje arbetstagare själv
- C) Arbetsmiljöverket
- D) Arbetsgivaren

**Rätt svar:** D) Arbetsgivaren

**Förklaring:** Arbetsmiljölagen lägger huvudansvaret på arbetsgivaren, som ska vidta alla åtgärder som behövs för att förebygga ohälsa och olycksfall. Skyddsombudet företräder arbetstagarna och Arbetsmiljöverket utövar tillsyn – men ansvaret är arbetsgivarens.

---

### 14. En arbetsuppgift innebär omedelbar och allvarlig fara för ditt liv. Vad ger arbetsmiljölagen dig rätt till?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-3-quiz-4`*

- A) Ingenting – tilldelade uppgifter ska alltid utföras
- B) Att byta arbetsgivare med omedelbar verkan
- C) Att avbryta arbetet och genast kontakta arbetsgivaren
- D) Att först begära skriftligt beslut från Arbetsmiljöverket

**Rätt svar:** C) Att avbryta arbetet och genast kontakta arbetsgivaren

**Förklaring:** Vid omedelbar och allvarlig fara för liv eller hälsa får du avbryta arbetet i väntan på besked – och du ska genast underrätta arbetsgivaren eller skyddsombudet. Säkerheten går före uppgiften.

---

### 15. Du blir hotad vid ett ingripande men skadas inte fysiskt. Vad gäller?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-3-quiz-6`*

- A) Inget behöver göras eftersom ingen skadades fysiskt
- B) Du rapporterar bara om hotet skulle upprepas igen
- C) Händelsen är en ren privatsak mellan dig och den gärningsman som uttalade hotet
- D) Händelsen rapporteras som tillbud, och du har rätt till krisstöd vid behov

**Rätt svar:** D) Händelsen rapporteras som tillbud, och du har rätt till krisstöd vid behov

**Förklaring:** Hot och våld är arbetsmiljöhändelser oavsett fysisk skada. Tillbudsrapporten gör att arbetsgivaren kan förebygga nästa händelse – och den dokumenterar det du utsatts för, vilket skyddar dig om besvär kommer senare.

---

## Modul 4 · Bevakningstjänst

### 16. Kundens platschef ber dig mitt i passet att ta på dig en ny arbetsuppgift som inte finns i instruktionen. Vad gör du?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-4-quiz-2`*

- A) Utför den direkt och utan några frågor – kunden är ju trots allt den som betalar för hela tjänsten
- B) Vägrar blankt utan någon förklaring eller vidare åtgärd
- C) Utför den om den verkar rimlig och inte tar för mycket tid från ronden
- D) Stämmer av med ledningscentralen eller arbetsledningen – uppdragsändringar går via bevakningsföretaget

**Rätt svar:** D) Stämmer av med ledningscentralen eller arbetsledningen – uppdragsändringar går via bevakningsföretaget

**Förklaring:** Kunden kan inte ändra uppdraget över disk. Att vänligt hänvisa till att förändringar går via företaget skyddar både dig, kunden och avtalets gränser – och akuta nödsituationer hanteras förstås alltid enligt nöd- och nödvärnsreglerna.

---

### 17. Under en rond ser du en uppbruten dörr och hör ljud inifrån lokalen. Vad gör du?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-4-quiz-4`*

- A) Går rakt in i lokalen och ropar högt "väktare!" för att avbryta pågående brott
- B) Släcker belysningen och ställer dig tyst på vakt alldeles innanför den uppbrutna dörren
- C) Drar dig tillbaka, larmar polis via ledningscentralen och bevakar utgångarna på avstånd
- D) Låser dörren utifrån så att ingen kan ta sig ut ur lokalen

**Rätt svar:** C) Drar dig tillbaka, larmar polis via ledningscentralen och bevakar utgångarna på avstånd

**Förklaring:** Pågående brott möts med observation och larmning – aldrig med ensamingripande i en okänd lokal mot ett okänt antal gärningsmän. Att låsa in någon skapar dessutom både fara och rättsliga problem.

---

### 18. Vad är "tailgating" vid inpasseringskontroll?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-4-quiz-5`*

- A) Att köra alldeles för nära framförvarande fordon vid infartsgrinden till området
- B) Att någon obehörig följer med in på en behörig persons kortdragning
- C) Att låna ut sitt passerkort till en kollega under ett arbetspass
- D) Att gå in genom en branddörr som ställts upp på glänt

**Rätt svar:** B) Att någon obehörig följer med in på en behörig persons kortdragning

**Förklaring:** Tailgating är det vanligaste sättet för obehöriga att ta sig in i kontrollerade lokaler – och motmedlet är en artig, konsekvent rutin: alla registreras, utan undantag.

---

### 19. Vad är den rättsliga grunden för utpasseringskontroll av anställdas väskor?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-4-quiz-6`*

- A) Polislagen 19 § om skyddsvisitation
- B) Rättegångsbalken 27 kap. om beslag
- C) Väktarens laga befogenhet enligt lagen om bevakningsföretag och dess föreskrifter
- D) Avtal och frivillig medverkan – kontrollen får aldrig ske med tvång

**Rätt svar:** D) Avtal och frivillig medverkan – kontrollen får aldrig ske med tvång

**Förklaring:** Utpasseringskontrollen bygger på anställningsvillkor och samtycke. Vägran hanteras med notering och rapport till arbetsledningen – tvång skulle kunna utgöra olaga tvång eller ofredande.

---

### 20. Varför ska rapporten skrivas under samma arbetspass som händelsen?

*Källa: Slutprov · Internt fråge-id: `vu1-final-bank-4-7-25`*

- A) För att skrivaren i vaktlokalen är ledig då
- B) Minnet försämras snabbt, och en tidsnära rapport har högre bevisvärde
- C) För att arbetsledningen ska hinna läsa den till morgonmötet dagen därpå
- D) Det är mest en gammal tradition i branschen

**Rätt svar:** B) Minnet försämras snabbt, och en tidsnära rapport har högre bevisvärde

**Förklaring:** Detaljer som klockslag, ordval och ordningsföljd bleknar på timmar – tidsnärheten är halva trovärdigheten.

---

## Modul 5 · Tekniska hjälpmedel

### 21. Vad är skillnaden mellan skalskydd och volymskydd i ett inbrottslarm?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-5-quiz-1`*

- A) Skalskyddet är helt mekaniskt medan volymskyddet är helt elektroniskt
- B) Skalskydd används bara i butikslokaler medan volymskydd bara används i kontorsmiljöer och lagerlokaler
- C) Skalskyddet övervakar dörrar, fönster och portar medan volymskyddet känner av rörelse inne i lokalerna
- D) Det är två olika namn på precis samma sak

**Rätt svar:** C) Skalskyddet övervakar dörrar, fönster och portar medan volymskyddet känner av rörelse inne i lokalerna

**Förklaring:** Skalskyddet larmar när någon försöker ta sig in, volymskyddet när någon redan är inne. Sektionsindelningen berättar sedan var i byggnaden larmet utlösts.

---

### 22. Vad kännetecknar ett överfallslarm?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-5-quiz-2`*

- A) Det är ett tyst larm som utlöses av en hotad person och aldrig får röjas på platsen
- B) Det låter kraftigt för att skrämma bort gärningsmannen från platsen
- C) Det går alltid direkt till polisen och aldrig till bevakningsföretagets larmcentral
- D) Det återställs av väktaren så snart platsen ser lugn och tom ut

**Rätt svar:** A) Det är ett tyst larm som utlöses av en hotad person och aldrig får röjas på platsen

**Förklaring:** Överfallslarmet är tyst just för att skydda den som utlöst det. Utryckningen hanteras som skarpt läge, och att röja larmet på platsen kan utsätta den hotade för allvarlig fara.

---

### 23. Vad gäller för bevakningsfordon i trafiken vid en larmutryckning?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-5-quiz-6`*

- A) De får köra mot rött ljus om varningsblinkers används under hela utryckningen
- B) De får överskrida hastighetsgränsen med högst 30 km/h vid larm
- C) De räknas som utryckningsfordon under nattetid och vid skarpa larm
- D) Trafikreglerna gäller fullt ut – bevakningsbilar är inte utryckningsfordon

**Rätt svar:** D) Trafikreglerna gäller fullt ut – bevakningsbilar är inte utryckningsfordon

**Förklaring:** Väktare har inga undantag i trafiken. Målet är att komma fram säkert – en väktare som kör omkull hjälper ingen och skapar dessutom en ny olycksplats.

---

### 24. Du upptäcker att en huvudnyckel till ett objekt saknas. Vad gör du?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-5-quiz-7`*

- A) Letar själv i några dagar innan du säger något till någon
- B) Rapporterar omedelbart till ledningscentralen och arbetsledningen – kunden kan behöva byta lås
- C) Beställer i tysthet en kopia hos låssmeden och säger inget
- D) Lånar en kollegas nyckelknippa och fortsätter passet som om ingenting alls hade hänt med nycklarna

**Rätt svar:** B) Rapporterar omedelbart till ledningscentralen och arbetsledningen – kunden kan behöva byta lås

**Förklaring:** En försvunnen huvudnyckel är en akut säkerhetsrisk för hela objektet. Snabb rapport ger kunden möjlighet att byta lås eller spärra – att dölja förlusten förvärrar både risken och förtroendeskadan.

---

## Modul 6 · Brand

### 25. Vid återsamlingsplatsen visar det sig att två personer saknas. Vad gör du?

*Källa: Slutprov · Internt fråge-id: `vu1-final-bank-6-4-34`*

- A) Går själv in i byggnaden igen och letar i de rum där de saknade brukar hålla till
- B) Meddelar räddningstjänsten omedelbart vilka som saknas och var de senast sågs
- C) Väntar tio minuter till – de dyker nog upp bland de andra
- D) Ropar in i byggnaden från entrén och lyssnar efter svar

**Rätt svar:** B) Meddelar räddningstjänsten omedelbart vilka som saknas och var de senast sågs

**Förklaring:** Vem som saknas och var är den enskilt viktigaste informationen du kan ge räddningsledaren – och ingen utom rökdykare går in.

---

### 26. Varför ska branddörrar hållas stängda?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-6-quiz-3`*

- A) De avgränsar brandceller och hindrar brand och rök från att sprida sig
- B) De håller värmen inne i lokalerna under den kalla årstiden
- C) De fungerar i första hand som stöldskydd mellan byggnadens olika avdelningar
- D) De minskar bullret mellan olika avdelningar i byggnaden

**Rätt svar:** A) De avgränsar brandceller och hindrar brand och rök från att sprida sig

**Förklaring:** Byggnadens brandceller är dimensionerade att hålla branden instängd en viss tid – men bara om dörrarna är stängda. Uppkilade branddörrar är en av de vanligaste och allvarligaste bristerna på brandronden. En uppkilad branddörr sätter hela skyddet ur spel.

---

### 27. Det börjar brinna i en fritös i ett kök. Vad gör du?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-6-quiz-4`*

- A) Häller rikligt med vatten över fritösen så att elden slocknar snabbt
- B) Bär snabbt ut den brinnande fritösen på gården bakom köket
- C) Kväver branden med lock eller brandfilt – aldrig vatten i brinnande fett
- D) Blåser kraftigt på lågorna för att kyla ner dem

**Rätt svar:** C) Kväver branden med lock eller brandfilt – aldrig vatten i brinnande fett

**Förklaring:** Vatten i brinnande fett förångas explosionsartat och kastar brinnande fett omkring sig. Fettbränder kvävs – med lock, brandfilt eller F-släckare – och att flytta ett brinnande kärl riskerar att sprida branden och skada dig.

---

### 28. Vad är rätt grundteknik med en handbrandsläckare?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-6-quiz-6`*

- A) Sikta högt upp i lågorna och töm släckaren i en enda punkt
- B) Stå kvar och töm släckaren helt, oavsett vad som händer runt omkring
- C) Börja släcka längst in i lokalen och arbeta dig sedan metodiskt utåt mot närmaste utgång
- D) Rikta mot lågornas bas med svepande rörelser – och ha alltid reträttvägen bakom dig

**Rätt svar:** D) Rikta mot lågornas bas med svepande rörelser – och ha alltid reträttvägen bakom dig

**Förklaring:** Branden släcks vid basen och glödbädden, inte i rökpelaren. En pulversläckare är tömd på 10–20 sekunder, så varje sekund ska träffa rätt – och du får aldrig hamna med branden mellan dig och utgången.

---

### 29. Vad står RVLS för?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-6-quiz-9`*

- A) Rök, Värme, Ljus, Syre
- B) Rädda, Varna, Larma, Släck
- C) Rapportera, Vänta, Lyssna, Sök
- D) Rädda, Vattna, Lämna, Spring

**Rätt svar:** B) Rädda, Varna, Larma, Släck

**Förklaring:** RVLS är prioritetsordningen vid brand: människor i omedelbar fara räddas först, andra varnas, hjälpen larmas – och först därefter görs släckförsök, om det kan ske utan risk. Går det inte att släcka: stäng in branden.

---

## Modul 7 · Yrkesetik och moral

### 30. Mitt under ett gripande ser du att din kollega tar i betydligt hårdare än situationen kräver. Vad är din första åtgärd?

*Källa: Slutprov · Internt fråge-id: `vu1-final-bank-7-3-40`*

- A) Väntar tills passet är slut och tar först då ett allvarligt samtal med kollegan i enrum
- B) Filmar händelsen med mobilen som bevis till en anmälan
- C) Säger ifrån direkt på plats – "lugnt, han gör inte motstånd" – och tar vid behov över
- D) Låtsas inte se någonting alls

**Rätt svar:** C) Säger ifrån direkt på plats – "lugnt, han gör inte motstånd" – och tar vid behov över

**Förklaring:** Ingripandet pågår nu och skadan sker nu – äkta kollegialitet bryter förloppet direkt, och rapporteringen kommer sedan.

---

### 31. En butiksägare på ditt objekt erbjuder dig gratis varor "för att du gör ett så bra jobb". Vad gör du?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-7-quiz-3`*

- A) Tar emot – det vore oartigt att tacka nej
- B) Tackar vänligt nej och rapporterar erbjudandet enligt företagets rutin
- C) Tar emot men delar med kollegorna på passet
- D) Tackar nej till varorna men lovar att titta extra noga på butiken i fortsättningen

**Rätt svar:** B) Tackar vänligt nej och rapporterar erbjudandet enligt företagets rutin

**Förklaring:** Förmåner som kan påverka – eller se ut att kunna påverka – tjänsteutövningen tas aldrig emot. Även små gåvor bygger tysta förväntningar, och rapporteringen skyddar både dig och förtroendet för uppdraget.

---

### 32. Du ser en kollega stoppa en upphittad mobiltelefon i sin egen ficka. Vad är rätt?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-7-quiz-5`*

- A) Ingenting – kollegor skyddar varandra i alla lägen
- B) Du väntar och ser om beteendet upprepas fler gånger
- C) Du säger ifrån direkt och rapporterar enligt rutin
- D) Du tar själv en sak ur hittegodset så att ni är kvitt

**Rätt svar:** C) Du säger ifrån direkt och rapporterar enligt rutin

**Förklaring:** Äkta kollegialitet skyddar tredje man, yrket och i längden även kollegan. Tystnad gör dig dessutom delaktig – hittegods som försvinner är stöld, och förtroendeskadan drabbar hela branschen. Falsk lojalitet skyddar beteendet, inte människan.

---

### 33. Vad kännetecknar en professionell människosyn i väktaryrket?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-7-quiz-8`*

- A) Att vara extra vaksam mot personer som ser avvikande ut i miljön
- B) Att utgå från alla människors lika värde och ingripa mot beteenden – aldrig mot vem någon är
- C) Att behandla kunder bättre än allmänheten i alla lägen
- D) Att alltid hålla känslomässig distans genom att undvika ögonkontakt med människor du möter i tjänsten

**Rätt svar:** B) Att utgå från alla människors lika värde och ingripa mot beteenden – aldrig mot vem någon är

**Förklaring:** Lika värde är grunden för både etiken och juridiken: ingripanden riktas mot vad någon gör, aldrig mot vem någon är. Det är dessutom den inställning som gör nästa möte med samma person lättare – för er båda.

---

## Modul 8 · Olaga diskriminering och mänskliga beteenden

### 34. Vilka är diskrimineringslagens sju diskrimineringsgrunder?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-8-quiz-2`*

- A) Kön, könsidentitet, ålder, längd och vikt, modersmål, yrkestillhörighet och medlemskap i fackförening
- B) Etnisk tillhörighet, religion eller annan trosuppfattning, sexuell läggning och ålder – men inga andra grunder
- C) Medborgarskap, bostadsort, utbildningsnivå, civilstånd, politisk åsikt, språkkunskaper, ekonomisk ställning, kroppslängd samt medlemskap i föreningar
- D) Kön, könsöverskridande identitet eller uttryck, etnisk tillhörighet, religion eller annan trosuppfattning, funktionsnedsättning, sexuell läggning och ålder

**Rätt svar:** D) Kön, könsöverskridande identitet eller uttryck, etnisk tillhörighet, religion eller annan trosuppfattning, funktionsnedsättning, sexuell läggning och ålder

**Förklaring:** De sju grunderna är lagens kärna och värda att kunna utantill. Tillsynsmyndighet är Diskrimineringsombudsmannen, och lagen förbjuder även indirekt diskriminering, trakasserier och bristande tillgänglighet.

---

### 35. Du nekar en synligt kraftigt berusad person inträde till ett evenemang. Är det diskriminering?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-8-quiz-3`*

- A) Nej – beslutet vilar på beteende och tillämpas lika för alla, vilket är en saklig grund
- B) Ja – berusning räknas som en av diskrimineringsgrunderna
- C) Ja, om personen själv upplever sig kränkt av beslutet
- D) Nej, men bara om det är en förordnad ordningsvakt som fattar själva beslutet i entrén

**Rätt svar:** A) Nej – beslutet vilar på beteende och tillämpas lika för alla, vilket är en saklig grund

**Förklaring:** Diskriminering handlar om urval på grupptillhörighet. Att neka utifrån beteende – berusning, aggressivitet, brott mot sakliga villkor som gäller alla – är tillåtet och ofta nödvändigt. Regeln är: vad personen gör, inte vem personen är.

---

### 36. Kundens platschef säger åt dig att inte släppa in personer av visst etniskt ursprung. Vad gör du?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-8-quiz-4`*

- A) Följer ordern – kunden är den som bestämmer på sitt eget objekt
- B) Följer ordern men skriver i din rapport att du egentligen var emot den från allra första början
- C) Vägrar, förklarar att ordern är brottslig och rapporterar till bevakningsföretaget
- D) Släpper in alla utom just de personer som chefen uttryckligen pekar ut

**Rätt svar:** C) Vägrar, förklarar att ordern är brottslig och rapporterar till bevakningsföretaget

**Förklaring:** Ordern är ett brott, och den som lyder kan dömas personligen för olaga diskriminering. Att vägra brottsliga uppdrag – och lyfta dem till företaget – är en del av yrkets kärna, inte en avvikelse från det. Dokumentera vad som sagts.

---

## Modul 9 · Konflikthantering och självskydd

### 37. En mycket uppjagad person blir plötsligt helt lugn och tyst. Hur tolkar du det?

*Källa: Slutprov · Internt fråge-id: `vu1-final-bank-9-2-47`*

- A) Faran är över för den här gången och du kan slappna av och sänka garden
- B) Som en möjlig varningssignal – lugnet kan betyda att beslutet om angrepp redan är fattat
- C) Personen har tröttnat på att bråka och går snart hem
- D) Deeskaleringen har lyckats fullt ut och samtalet kan avslutas som planerat utan vidare åtgärder

**Rätt svar:** B) Som en möjlig varningssignal – lugnet kan betyda att beslutet om angrepp redan är fattat

**Förklaring:** Verklig avspänning syns i hela kroppen – ett abrupt lugn hos en rasande person är ofta stiltjen före stormen. Höj beredskapen och håll avståndet.

---

### 38. En kraftigt drogpåverkad person går inte att nå med ord. Vad gäller?

*Källa: Slutprov · Internt fråge-id: `vu1-final-bank-9-5-50`*

- A) Höj rösten steg för steg tills budskapet till slut går fram
- B) Fortsätt samtala på exakt samma sätt – alla människor kan lugnas med rätt ord och rätt tonläge
- C) Ingrip fysiskt direkt för att snabbt få kontroll över situationen
- D) Byt mål: avstånd, tid och förstärkning – vissa tillstånd går inte att prata ner i stunden

**Rätt svar:** D) Byt mål: avstånd, tid och förstärkning – vissa tillstånd går inte att prata ner i stunden

**Förklaring:** Kraftig berusning, psykos och drogpåverkan kan stänga dörren för dialog – då köper du tid och yta i väntan på polis, i stället för att eskalera.

---

### 39. Vilken av följande är en typisk fysisk varningssignal för nära förestående våld?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-9-quiz-2`*

- A) Personen sätter sig ner och lutar sig bakåt
- B) Knutna nävar, låst blick och viktförflyttning till främre foten
- C) Personen börjar prata långsammare och ber om ett glas vatten
- D) Personen tittar upprepade gånger på klockan

**Rätt svar:** B) Knutna nävar, låst blick och viktförflyttning till främre foten

**Förklaring:** Kroppen laddar innan den slår: spända händer, låst eller flackande blick mot hakparti och utgångar, jackan som åker av. Var också vaksam på plötsligt lugn hos en uppjagad person – det kan betyda att beslutet redan är fattat.

---

### 40. En man skriker att han blivit orättvist behandlad i kassan. Vilket svar är mest deeskalerande?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-9-quiz-3`*

- A) "Lugna ner dig omedelbart, annars får du lämna butiken på en gång utan vidare diskussion eller förklaring."
- B) "Så där får man faktiskt inte bete sig här inne hos oss."
- C) "Det där är faktiskt inte mitt bord – du får ta det med kassapersonalen i stället."
- D) "Jag hör att du är riktigt arg. Berätta vad som hände, så tittar vi på hur vi kan lösa det."

**Rätt svar:** D) "Jag hör att du är riktigt arg. Berätta vad som hände, så tittar vi på hur vi kan lösa det."

**Förklaring:** Att bekräfta känslan utan att ge efter i sak – och sedan erbjuda en väg framåt – tar bort konfliktens vanligaste bränsle: att inte bli hörd. Kommandon och avvisanden trycker personen uppåt på trappan i stället.

---

### 41. Hur positionerar du dig i samtal med en uppjagad person?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-9-quiz-6`*

- A) Rakt framför personen med korslagda armar och bred stans
- B) Snett bakom personen så att du inte syns i synfältet
- C) Så nära personen som det bara går för att tydligt visa att du inte låter dig skrämmas av situationen
- D) Snett i bladad ställning, händerna synliga, din reträttväg fri – utan att blockera personens utväg

**Rätt svar:** D) Snett i bladad ställning, händerna synliga, din reträttväg fri – utan att blockera personens utväg

**Förklaring:** Vinkeln gör dig mindre konfrontativ och snabbare, de synliga händerna lugnar utan att sänka din beredskap – och två fria utvägar minskar risken för att någon av er känner sig tvingad att slåss.

---

## Modul 10 · Handfängsel

### 42. I vilket av följande fall får handfängsel INTE användas?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-10-quiz-2`*

- A) Rutinmässigt "för säkerhets skull" på en lugn och samarbetsvillig person
- B) När en gripen person gör våldsamt motstånd
- C) När det finns en konkret risk att den gripne skadar sig själv allvarligt
- D) När det finns konkret flyktrisk vid ett gripande

**Rätt svar:** A) Rutinmässigt "för säkerhets skull" på en lugn och samarbetsvillig person

**Förklaring:** Utan behov finns ingen rätt – fängsel på en samarbetsvillig person är oförsvarligt våld, oavsett hur smidigt det vore. Behovet ska dessutom omprövas löpande: när motståndet upphör ska frågan om avtagning ställas.

---

### 43. Vad är positionsasfyxi och hur förebyggs den?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-10-quiz-3`*

- A) En allergisk reaktion mot metallen i handfängslet
- B) Ett tillstånd som i princip bara drabbar äldre personer
- C) Cirkulationsproblem i händer och handleder som orsakas av alldeles för hårt åtdragna fängsel under lång tid
- D) Kvävning till följd av kroppsställning – personen sätts upp eller läggs i sidoläge och lämnas aldrig på mage

**Rätt svar:** D) Kvävning till följd av kroppsställning – personen sätts upp eller läggs i sidoläge och lämnas aldrig på mage

**Förklaring:** Positionsasfyxi är den allvarligaste risken vid fängsling och kan döda på minuter. Utmattning, kraftig kroppshydda och drogpåverkan förstärker risken – alltså just de omständigheter som ofta råder efter en kamp. Särskilt farligt är bukläge med fängsel bak och tryck mot ryggen.

---

### 44. En fängslad person säger "jag kan inte andas" – men kan uppenbarligen tala. Vad gäller?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-10-quiz-4`*

- A) Kan man tala kan man andas – ingen ytterligare åtgärd behövs
- B) Klagomålet tas alltid på allvar: att kunna tala utesluter inte livshotande andningspåverkan
- C) Personen försöker med största sannolikhet bara slippa fängslen och kan därför lugnt ignoreras tills polisen kommer
- D) Vänta fem minuter och se om besvären går över av sig själva

**Rätt svar:** B) Klagomålet tas alltid på allvar: att kunna tala utesluter inte livshotande andningspåverkan

**Förklaring:** Tal kräver bara små luftmängder – en person kan prata och samtidigt kvävas. "Den som pratar kan andas" är en myt som kostat liv. Positionsändring kostar ingenting; att ha fel åt andra hållet kan kosta allt. Ändra position, övervaka noga och larma vid försämring.

---

### 45. Vad ska särskilt dokumenteras när handfängsel har använts?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-10-quiz-6`*

- A) Endast klockslaget för själva gripandet
- B) Fängslets fabrikat, modell och serienummer
- C) Varför fängsel behövdes, tid för på- och avtagning, gjorda kontroller och personens tillstånd
- D) Vilken kollega som bar fängslet under arbetspasset och när det kvitterades ut ur utrustningsskåpet

**Rätt svar:** C) Varför fängsel behövdes, tid för på- och avtagning, gjorda kontroller och personens tillstånd

**Förklaring:** Varje fängsling ska kunna motiveras i efterhand – behovet, tiderna, kontrollerna och tillståndet är det som visar att användningen var försvarlig. Samma uppgifter lämnas muntligt vid överlämningen till polisen. Notera även eventuella klagomål på smärta eller andning.

---

## Modul 11 · Akutsjukvård

### 46. Vad står L:et för i L-ABCDE?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-11-quiz-1`*

- A) Larma – ring 112 före allt annat du gör
- B) Läget och din egen säkerhet – platsen säkras innan du hjälper någon
- C) Ljus – se till att arbetsområdet är tillräckligt upplyst innan du börjar
- D) Luftväg – samma sak som A i bedömningen

**Rätt svar:** B) Läget och din egen säkerhet – platsen säkras innan du hjälper någon

**Förklaring:** En skadad hjälpare hjälper ingen och blir dessutom ytterligare en patient. Trafik, el, rasrisk, våld och smitta bedöms på sekunder – sedan börjar ABCDE.

---

### 47. Du hittar en medvetslös person som andas normalt. Vad gör du?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-11-quiz-3`*

- A) Lägger personen i stabilt sidoläge, larmar 112 och övervakar andningen
- B) Startar HLR direkt för säkerhets skull
- C) Sätter personen upp i sittande mot en vägg
- D) Ger personen lite vatten att dricka för att försöka väcka den till medvetande igen

**Rätt svar:** A) Lägger personen i stabilt sidoläge, larmar 112 och övervakar andningen

**Förklaring:** Sidoläget håller luftvägen fri och hindrar tunga och kräkning från att kväva. Men bedömningen är färskvara: slutar andningen vara normal går du omedelbart över till HLR.

---

### 48. En livlös person reagerar inte på tilltal och drar bara enstaka djupa, suckande andetag. Vad gäller?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-11-quiz-4`*

- A) Personen andas ju – lägg i stabilt sidoläge och invänta ambulansens ankomst i lugn och ro
- B) Vänta och räkna andetagen under en hel minut för säkerhets skull
- C) Detta är agonal andning och räknas som hjärtstopp – larma 112 och starta HLR
- D) Ge två inblåsningar och invänta sedan ambulansens ankomst

**Rätt svar:** C) Detta är agonal andning och räknas som hjärtstopp – larma 112 och starta HLR

**Förklaring:** De suckande andetagen är ett vanligt tidigt tecken vid hjärtstopp och lurar många att vänta – med minuter som kostar liv. Ingen reaktion plus ingen normal andning är alltid HLR-läge.

---

### 49. Vilket alternativ beskriver korrekt HLR-teknik på vuxen?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-11-quiz-5`*

- A) 15 kompressioner och 5 inblåsningar med mjukt, försiktigt tryck
- B) Kompressioner behövs bara om ambulansen är mer än 20 minuter bort från platsen när du larmar in händelsen
- C) Tryck på vänster sida av bröstet i lugn takt om 60 tryck per minut
- D) 30 kompressioner och 2 inblåsningar – mitt på bröstkorgen, 5–6 cm djupt, i takten 100–120 per minut

**Rätt svar:** D) 30 kompressioner och 2 inblåsningar – mitt på bröstkorgen, 5–6 cm djupt, i takten 100–120 per minut

**Förklaring:** Djup, takt och kontinuitet är det som håller hjärnan syresatt. Låt bröstkorgen häva sig helt mellan trycken, byt av varandra varannan minut – och kan du inte blåsa är enbart kompressioner mycket bättre än ingenting. Håll avbrotten i kompressionerna så korta som möjligt.

---

### 50. En vuxen har satt i halsen och kan varken hosta, tala eller andas. Vad gör du?

*Källa: Träningsfråga · Internt fråge-id: `vu1-module-11-quiz-7`*

- A) Uppmuntrar personen att försöka dricka lite vatten
- B) Väntar en stund på att hostreflexen ska ta över av sig själv
- C) Ger 5 kraftiga ryggslag växlat med 5 buktryck tills föremålet lossnar
- D) Sticker in fingrarna längst in i halsen och letar efter föremålet

**Rätt svar:** C) Ger 5 kraftiga ryggslag växlat med 5 buktryck tills föremålet lossnar

**Förklaring:** Tystnaden är larmsignalen – kan personen inte hosta måste du hjälpa. Ryggslag och buktryck varvas 5 + 5, på gravida används brösttryck, och vid medvetslöshet kan HLR-kompressionerna pressa loss föremålet. Blir personen medvetslös: starta HLR.

---

# VU2 – top 40

## Modul 1 · Bevakningsjuridik – fördjupning

### 1. Du har påbörjat ett gripande när tre av gärningsmannens kamrater närmar sig hotfullt. Vad gäller?

*Källa: Slutprov · Internt fråge-id: `vu2-final-bank-1-2-1`*

- A) Ett påbörjat gripande måste alltid fullföljas oavsett läget
- B) Du får släppa bara om polisen först godkänner det per telefon
- C) Du ropar på hjälp från förbipasserande och håller fast tills hjälpen kommer
- D) Gripandet får avbrytas – du släpper, skapar avstånd, larmar och dokumenterar

**Rätt svar:** D) Gripandet får avbrytas – du släpper, skapar avstånd, larmar och dokumenterar

**Förklaring:** Gripanderätten är en rättighet i varje sekund, aldrig en skyldighet. Att avbryta när riskbilden växer är ett professionellt beslut – som dokumenteras precis som ett fullföljt gripande. Dokumentera skälen, signalement och färdriktning.

---

### 2. Den du gripit för stöld har en stängd ryggsäck. Får du öppna och söka igenom den efter stöldgodset?

*Källa: Slutprov · Internt fråge-id: `vu2-final-bank-1-3-2`*

- A) Nej – fynd vid skyddsvisitationen får tas i beslag, men genomsökning efter gods är polisens uppgift
- B) Ja – beslagsrätten förutsätter ju att du får leta efter godset
- C) Ja, om ett vittne från personalen ser på under genomsökningen
- D) Nej, men du får kräva att personen själv öppnar och tömmer väskan framför dig i väntan på polis

**Rätt svar:** A) Nej – fynd vid skyddsvisitationen får tas i beslag, men genomsökning efter gods är polisens uppgift

**Förklaring:** Beslagsrätten är ingen genomsökningsrätt. Väskan följer med orörd till polisen – och att tvinga någon tömma den är olaga tvång.

---

### 3. Din kollega ser en stöld, följer gärningsmannen och lämnar över uppsikten till dig via radio utan avbrott. Du griper mannen efter kassalinjen. Är gripandet korrekt?

*Källa: Träningsfråga · Internt fråge-id: `vu2-module-1-quiz-1`*

- A) Nej – bara den som själv såg brottet med egna ögon får genomföra själva gripandet i slutänden
- B) Nej – radiokommunikation bryter alltid den kontinuerliga uppsiktskedjan
- C) Ja – uppsikten får hållas i stafett, så länge kedjan från brott till gripande är obruten
- D) Ja, men bara om ni båda arbetar för samma bevakningsföretag på objektet

**Rätt svar:** C) Ja – uppsikten får hållas i stafett, så länge kedjan från brott till gripande är obruten

**Förklaring:** Flyende fot kräver kontinuerlig uppsikt – inte att en och samma person håller den. Luckan är det som dödar gripanderätten, inte överlämningen.

---

### 4. En man försöker stoppa på sig ett paket kaffe för 89 kronor men avbryts av personalen före kassalinjen. Får du gripa honom för försök till stöld?

*Källa: Träningsfråga · Internt fråge-id: `vu2-module-1-quiz-2`*

- A) Nej – försök till ringa stöld är inte straffbart, så inget gripbart brott finns ännu
- B) Ja – alla försök till brott är gripbara på bar gärning
- C) Ja, om han erkänner försöket inför personalen
- D) Nej, men du får hålla kvar honom i butiken tills polisen kommer och utreder saken

**Rätt svar:** A) Nej – försök till ringa stöld är inte straffbart, så inget gripbart brott finns ännu

**Förklaring:** Försöksansvar gäller stöld men inte ringa stöld. Vid låga värden finns brottet först när personen passerat sista betalningsmöjligheten – och att "hålla kvar" utan gripande är olaga frihetsberövande.

---

### 5. Vid en butiksstöld distraherar en person personalen medan kompisen bär ut varorna. Vad gäller för distraktören?

*Källa: Träningsfråga · Internt fråge-id: `vu2-module-1-quiz-3`*

- A) Distraktören kan aldrig gripas eftersom han själv aldrig rörde några av de stulna varorna med sina händer
- B) Distraktören kan bara polisanmälas i efterhand när stölden är utredd
- C) Distraktören begår på sin höjd förargelseväckande beteende
- D) Distraktören kan gripas på bar gärning som medverkande – huvudbrottet har fängelse i straffskalan

**Rätt svar:** D) Distraktören kan gripas på bar gärning som medverkande – huvudbrottet har fängelse i straffskalan

**Förklaring:** Medhjälp till stöld är straffbart enligt medverkansreglerna, och envarsgripandet gäller på samma villkor. Nyckeln är dina iakttagelser av att agerandet var en del av brottsplanen.

---

### 6. En kund pekar ut en kvinna på väg ut ur butiken: "Hon stal nyss!" Ingen i personalen eller du har sett något. Vad gör du?

*Källa: Träningsfråga · Internt fråge-id: `vu2-module-1-quiz-4`*

- A) Griper kvinnan direkt på väg ut – kundens tydliga utpekande räcker gott som grund för ett gripande
- B) Griper inte – utan egen eller stafettöverlämnad uppsikt finns varken bar gärning eller flyende fot
- C) Ber kunden själv gripa kvinnan eftersom det var hon som såg stölden
- D) Låser entrédörrarna tills saken är utredd på plats

**Rätt svar:** B) Griper inte – utan egen eller stafettöverlämnad uppsikt finns varken bar gärning eller flyende fot

**Förklaring:** Andrahandsuppgifter ger ingen gripanderätt, hur trovärdiga de än verkar. Ett gripande på utpekande riskerar olaga frihetsberövande – dokumentationen och vittnet är i stället guld för polisen. Notera signalement, säkra kundens vittnesuppgifter och larma polis.

---

### 7. Under ett gripande slår den gripne dig plötsligt i ansiktet, men ger upp efter en kort stund och blir passiv. Hur förändras din våldsrätt?

*Källa: Träningsfråga · Internt fråge-id: `vu2-module-1-quiz-7`*

- A) Nödvärnet fortsätter gälla under resten av ingripandet eftersom han redan har slagit dig en gång under ingripandet
- B) Under angreppet råder nödvärn – när han blir passiv återstår bara det våld som behövs för att hålla kvar honom
- C) Du får ge igen med ett markerande slag för att visa att motstånd inte lönar sig
- D) All våldsrätt upphör helt när han slutar slåss, även rätten att hålla kvar honom

**Rätt svar:** B) Under angreppet råder nödvärn – när han blir passiv återstår bara det våld som behövs för att hålla kvar honom

**Förklaring:** Grunderna avlöser varandra i realtid, och våldet ska trappas ned i samma takt. Frågan vid granskningen är inte bara om du fick använda våld – utan om du fick använda det våldet just då.

---

### 8. Efter ett rån mot din reception vill polisen ha kamerabilderna. Vad är viktigast för att materialet ska hålla som bevis?

*Källa: Träningsfråga · Internt fråge-id: `vu2-module-1-quiz-8`*

- A) Att du mejlar filmen till alla berörda parter direkt efter händelsen
- B) Att du klipper ihop de bästa och tydligaste sekvenserna åt polisen i förväg
- C) Att sekvensen säkras direkt enligt rutin innan den rullande raderingen, och lämnas till polisen den dokumenterade vägen
- D) Att filmen genast läggs upp på objektets gemensamma server så att den inte försvinner i den rullande raderingen över natten

**Rätt svar:** C) Att sekvensen säkras direkt enligt rutin innan den rullande raderingen, och lämnas till polisen den dokumenterade vägen

**Förklaring:** Bevisvärde kräver en obruten och dokumenterad hanteringskedja – och tiden är knapp eftersom de flesta system raderar rullande. Spridning och egen redigering förstör både integritetsskyddet och bevisningen. Notera kamera, tidsintervall och vem som säkrade materialet.

---

## Modul 2 · Bevakningstjänst – fördjupning

### 9. Samma bil står parkerad utanför grinden tre kvällar i rad, och föraren fotograferar mot kameror och infarter. Vad gör du?

*Källa: Slutprov · Internt fråge-id: `vu2-final-bank-2-2-7`*

- A) Konfronterar föraren direkt vid bilen och kräver att få se alla bilderna i kameran på en gång
- B) Dokumenterar registreringsnummer, signalement och tider och rapporterar mönstret enligt rutin
- C) Punkterar diskret ett däck så att bilen inte kan återvända i morgon
- D) Ignorerar det helt – fotografering från allmän plats är lagligt

**Rätt svar:** B) Dokumenterar registreringsnummer, signalement och tider och rapporterar mönstret enligt rutin

**Förklaring:** Fotografering på allmän plats är i sig tillåten – men mönstret är informationen. Systematisk rekognosering föregår många brott, och din mönsterrapport kan bli polisens lägesbild. Systematisk rekognosering är ett förberedelsetecken.

---

### 10. Vad menas med ett objekts "normalbild"?

*Källa: Träningsfråga · Internt fråge-id: `vu2-module-2-quiz-3`*

- A) Kunskapen om hur objektet ser ut, låter och beter sig en vanlig dag
- B) Fotografierna av objektet som finns i objektsinstruktionens bilagor
- C) Kamerasystemets förinställda standardvy över området
- D) Arkitektritningen över byggnadens alla plan

**Rätt svar:** A) Kunskapen om hur objektet ser ut, låter och beter sig en vanlig dag

**Förklaring:** Avvikelser upptäcks bara mot ett känt normalläge – därför ägnas de första passen på ett nytt objekt åt att bygga normalbilden: fråga, läs, gå långsamt.

---

### 11. Samma larmsektion har larmat tre nätter i rad utan att någon orsak hittats. Vad är rätt inför natt fyra?

*Källa: Träningsfråga · Internt fråge-id: `vu2-module-2-quiz-4`*

- A) Avvakta i bilen utanför – det är med största sannolikhet detektorn igen
- B) Be ledningscentralen att tills vidare ignorera sektionen tills teknikern har hunnit undersöka den ordentligt
- C) Rapportera mönstret, begär fördjupad teknikerkontroll – och möt nästa larm med högre beredskap, inte lägre
- D) Återställa larmet på distans utan åtgärd

**Rätt svar:** C) Rapportera mönstret, begär fördjupad teknikerkontroll – och möt nästa larm med högre beredskap, inte lägre

**Förklaring:** Att trötta ut responsen tills larm avfärdas är en känd metod. Mönstret är informationen – och falsklarm förblir en slutsats som kräver fullständig kontroll, varje gång.

---

### 12. En stressad man i kostym kräver access: "Revisionen väntar, vi är redan sena!" Ingen föranmälan finns och kontaktpersonen svarar inte. Vilka manipulationshävstänger använder han – och vad gör du?

*Källa: Träningsfråga · Internt fråge-id: `vu2-module-2-quiz-5`*

- A) Auktoritet och tidspress – du bemöter vänligt men ger ingen access förrän besöket bekräftats via en egen kanal
- B) Inga alls – revisorer har alltid laglig rätt till tillträde vid revision
- C) Tidspress – därför släpper du in honom snabbt nu och registrerar besöket i efterhand när lugnet lagt sig efter revisionen
- D) Auktoritet – därför ber du om hans visitkort och släpper in honom mot uppvisandet av det

**Rätt svar:** A) Auktoritet och tidspress – du bemöter vänligt men ger ingen access förrän besöket bekräftats via en egen kanal

**Förklaring:** Auktoritet, tidspress och namndroppning är manipulationens klassiska treklang. Verifieringen sker via dina kanaler, aldrig hans – och en äkta revisor respekterar kontrollen.

---

### 13. En lastbil ska lämna området med gods och föraren visar en följesedel. Vad innebär en korrekt utpasseringskontroll?

*Källa: Träningsfråga · Internt fråge-id: `vu2-module-2-quiz-6`*

- A) Att följesedeln har en läslig underskrift från avsändaren
- B) Att föraren kan namnet på sin närmaste chef på företaget
- C) Att registreringsnumret antecknas noggrant i journalen – själva lasten är chaufförens och avsändarens eget ansvar
- D) Att handlingen kontrolleras mot den faktiska lasten – en följesedel på tre pallar säger inget om en fjärde

**Rätt svar:** D) Att handlingen kontrolleras mot den faktiska lasten – en följesedel på tre pallar säger inget om en fjärde

**Förklaring:** Papper utan kontroll mot verkligheten är ingen kontroll. Plomberade transporter stäms av på plombnummer, och varje avvikelse vid grinden är rapportmaterial. Avvikelser rapporteras, förhandlas inte.

---

### 14. Vad är problemet med formuleringen "mannen var aggressiv" i en ingriparapport?

*Källa: Träningsfråga · Internt fråge-id: `vu2-module-2-quiz-7`*

- A) Den är för lång och tar för mycket plats i rapporten
- B) Ordet "man" ska enligt den moderna rapportstandarden inte längre användas i ingriparapporter
- C) Det är ett värdeord utan konkretion – rapporten ska återge exakta handlingar och ordagranna citat
- D) Aggressivitet är ingen juridiskt relevant omständighet i sammanhanget

**Rätt svar:** C) Det är ett värdeord utan konkretion – rapporten ska återge exakta handlingar och ordagranna citat

**Förklaring:** Domstolen kan inte väga din åsikt, bara dina iakttagelser. "Höjde rösten, knöt händerna, sa: 'jag vet var du bor'" bär ett åtal – "aggressiv" gör det inte.

---

### 15. Du upptäcker att kunden ändrat en rutin så att verkligheten inte längre stämmer med objektsinstruktionen. Vad gör du?

*Källa: Träningsfråga · Internt fråge-id: `vu2-module-2-quiz-8`*

- A) Fortsätter följa den gamla instruktionen tills någon uttryckligen säger annat och lämnar saken utan åtgärd
- B) Skriver en avvikelserapport samma pass med förslag till ändring – uppdateringen beslutas av bevakningsföretaget
- C) Ändrar själv direkt i instruktionspärmen så att den stämmer
- D) Anpassar dig tyst till den nya verkligheten utan att dokumentera något

**Rätt svar:** B) Skriver en avvikelserapport samma pass med förslag till ändring – uppdateringen beslutas av bevakningsföretaget

**Förklaring:** Glappet mellan karta och verklighet är farligare än förändringen själv – varje orapporterat glapp är en incident som väntar. Initiativet till levande instruktioner kommer från väktaren på golvet.

---

## Modul 3 · Konflikthantering och självskydd – fördjupning

### 16. Varför räknas ingripanden i pågående relationsbråk som särskilt riskfyllda?

*Källa: Slutprov · Internt fråge-id: `vu2-final-bank-3-2-13`*

- A) De tar betydligt längre tid än andra typer av ingripanden
- B) De sker oftast utomhus i mörker
- C) Juridiken kring ingripanden är annorlunda vid just relationsbråk mellan närstående parter
- D) Parternas konflikt kan på en sekund bli en gemensam front mot den som ingriper

**Rätt svar:** D) Parternas konflikt kan på en sekund bli en gemensam front mot den som ingriper

**Förklaring:** "Lägg dig inte i" kan komma från båda hållen samtidigt. Separera med vinkelposition, tala med en i taget – och minns att pågående brott ingriper du mot enligt vanliga regler, med nödvärn för annan som grund. Håll avstånd, larma tidigt och stå aldrig mitt emellan parterna.

---

### 17. Vad är gummibatongens främsta värde i de flesta situationer?

*Källa: Slutprov · Internt fråge-id: `vu2-final-bank-3-4-15`*

- A) Slaget mot benens muskulatur
- B) Den rent psykologiska effekten av att den dras snabbt och synligt ur hölstret inför motparten
- C) Avståndet – att blockera, hålla ifrån och markera beredskap kan avgöra utan en enda träff
- D) Att den vid behov kan användas som bräckverktyg vid dörrar

**Rätt svar:** C) Avståndet – att blockera, hålla ifrån och markera beredskap kan avgöra utan en enda träff

**Förklaring:** Batongen är först ett avståndsverktyg, sist ett slagverktyg. Varje träff ska klara försvarlighetsprövningen – varje meter avstånd är gratis.

---

### 18. Vilka tre steg följer obligatoriskt efter varje batonganvändning?

*Källa: Slutprov · Internt fråge-id: `vu2-final-bank-3-5-16`*

- A) Rengöring av batongen, inlämning och byte till en ny
- B) Vila, ett kort samtal med en kollega och en kopp kaffe
- C) Fotografering av motparten, ett kort eget förhör och muntlig avrapportering till kunden på plats
- D) Sjukvårdsbedömning av den träffade, exakt dokumentation samt händelse- och tillbudsrapportering

**Rätt svar:** D) Sjukvårdsbedömning av den träffade, exakt dokumentation samt händelse- och tillbudsrapportering

**Förklaring:** Slag mot muskulatur kan ge dolda blödningar, och batonganvändning granskas alltid. Sjukvård, dokumentation och rapport är inte efterarbete – de är en del av användningen. Dokumentationen ska ange antal slag, träffområden, skäl, effekt och deeskaleringen före.

---

### 19. Du behöver hjälp av allmänheten i ett nödläge. Hur utnyttjar du kunskapen om åskådareffekten?

*Källa: Träningsfråga · Internt fråge-id: `vu2-module-3-quiz-3`*

- A) Ropar "kan någon snälla ringa 112?" rakt ut till hela folkmassan
- B) Litar på att någon i folkmassan redan har larmat
- C) Pekar ut en specifik person och ger en specifik uppgift: "Du i röd jacka – ring 112 nu"
- D) Skickar först iväg alla nyfikna åskådare från platsen innan du gör någonting annat

**Rätt svar:** C) Pekar ut en specifik person och ger en specifik uppgift: "Du i röd jacka – ring 112 nu"

**Förklaring:** När alla är tillfrågade känner sig ingen ansvarig – åskådareffekten gör att "någon" ofta blir "ingen". En utpekad person med en tydlig uppgift agerar nästan alltid.

---

### 20. Hur fördelas rollerna när två väktare ingriper tillsammans?

*Källa: Träningsfråga · Internt fråge-id: `vu2-module-3-quiz-5`*

- A) Båda talar samtidigt med samma budskap för att visa fullständig enighet
- B) En kontaktperson sköter all kommunikation medan säkerhetspersonen håller position och läser omgivningen
- C) Den mest erfarne sköter allting medan den andre står bredvid och lär sig
- D) En av er håller alltid i fängslen och den andra i batongen enligt den fasta rollfördelningen ni övat in

**Rätt svar:** B) En kontaktperson sköter all kommunikation medan säkerhetspersonen håller position och läser omgivningen

**Förklaring:** Motstridiga besked från två röster skapar förvirring och eskalering. Rollfördelningen görs före kontakt – och blir det fysiskt gäller samordnat, bestämt och kort. Principen är en enda röst – och beredskap i vinkel.

---

### 21. Var riktas batongslag – och var får de i princip aldrig träffa?

*Källa: Träningsfråga · Internt fråge-id: `vu2-module-3-quiz-6`*

- A) Mot benens leder och knäskålar, som ger snabbast effekt vid motstånd
- B) Var som helst på kroppen där det ger effekt – batongen är ju godkänd utrustning efter genomförd utbildning
- C) Mot händer och underarmar, så att motparten tappar greppet om tillhygget
- D) Mot stora muskelgrupper som lår, vader och överarmar – aldrig mot huvud, hals, nacke, ryggrad eller leder

**Rätt svar:** D) Mot stora muskelgrupper som lår, vader och överarmar – aldrig mot huvud, hals, nacke, ryggrad eller leder

**Förklaring:** Målet med batongen är tillfällig smärta och nedsatt funktion, inte skada. Träffområdet är därför själva försvarlighetsfrågan – ett slag mot låret och ett mot huvudet är juridiskt två helt olika handlingar. Träffar mot huvud, hals, nacke, ryggrad och leder kan ge livshotande eller bestående skador och kan bara försvaras i yttersta nödvärnslägen med livsfara.

---

### 22. Vad bedömer det praktiska rollspelet i VU2 främst?

*Källa: Träningsfråga · Internt fråge-id: `vu2-module-3-quiz-8`*

- A) Hur snabbt du lyckas få fysisk kontroll på motparten i själva ingripandemomentet
- B) Hur många olika grepptekniker du behärskar felfritt
- C) Helheten: kommunikation först, korrekt lagstöd, minsta möjliga våld och egen säkerhet
- D) Din fysiska styrka och kondition genom hela momentet

**Rätt svar:** C) Helheten: kommunikation först, korrekt lagstöd, minsta möjliga våld och egen säkerhet

**Förklaring:** Provets huvudmål är yrkets: lösa konflikten utan våld, och använda minsta möjliga när våld krävs. Den som pratar för lite och tar i för tidigt faller på just det som bedöms högst. Även en klar redogörelse efteråt bedöms.

---

## Modul 4 · Arbetsmiljö – fördjupning

### 23. Vilka är huvudreglerna för dygns- och veckovila?

*Källa: Slutprov · Internt fråge-id: `vu2-final-bank-4-2-19`*

- A) 8 timmars sammanhängande dygnsvila och 24 timmars sammanhängande veckovila enligt huvudregeln i lagen
- B) Minst 11 timmars sammanhängande dygnsvila och minst 36 timmars sammanhängande veckovila
- C) 6 timmars sammanhängande dygnsvila och 48 timmars sammanhängande veckovila
- D) Vilotider regleras inte i lag utan enbart i det lokala schemat

**Rätt svar:** B) Minst 11 timmars sammanhängande dygnsvila och minst 36 timmars sammanhängande veckovila

**Förklaring:** Vilotiderna är skyddsregler mot yrkets största slitagefaktor – och nattarbetande har dessutom rätt till medicinska kontroller. Trötthet hanteras som den risk den är.

---

### 24. Vad gör ett inaktivitetslarm?

*Källa: Slutprov · Internt fråge-id: `vu2-final-bank-4-4-21`*

- A) Larmar om bäraren är stilla för länge, så att hjälp når fram även utan aktivt larm
- B) Larmar när radions batterinivå börjar bli kritiskt svag
- C) Stänger av larmsystemet automatiskt vid längre inaktivitet
- D) Påminner bäraren om att inplanerade rondpunkter har missats under det pågående nattpasset

**Rätt svar:** A) Larmar om bäraren är stilla för länge, så att hjälp når fram även utan aktivt larm

**Förklaring:** Vid ensamarbete är det farligaste scenariot att bli liggande utan att kunna kalla på hjälp – inaktivitetslarmet, gärna kombinerat med GPS-position, täcker exakt det glappet.

---

### 25. En identifierad risk kan inte åtgärdas omedelbart. Vad kräver det systematiska arbetsmiljöarbetet?

*Källa: Träningsfråga · Internt fråge-id: `vu2-module-4-quiz-2`*

- A) Att risken accepteras tills vidare utan vidare åtgärd
- B) Att muntlig information om risken ges på nästa ordinarie arbetsplatsträff i god ordning
- C) Att risken förs in i en skriftlig handlingsplan med åtgärd, ansvarig och tidpunkt
- D) Att skyddsombudet formellt tar över ansvaret för risken

**Rätt svar:** C) Att risken förs in i en skriftlig handlingsplan med åtgärd, ansvarig och tidpunkt

**Förklaring:** Ingen risk får bli liggande utan ägare – handlingsplanen gör att åtgärden kan följas upp och att ansvaret inte försvinner i vardagen.

---

### 26. Du arbetar som väktare på en kunds industriområde. Hur fördelas arbetsmiljöansvaret?

*Källa: Träningsfråga · Internt fråge-id: `vu2-module-4-quiz-3`*

- A) Kunden tar över hela arbetsmiljöansvaret så länge du befinner dig fysiskt på deras inhägnade industriområde
- B) Företaget har arbetsgivaransvaret, kunden ansvarar för arbetsstället – det strängaste regelverket gäller
- C) Ingen har något ansvar för inhyrd personal enligt lagen
- D) Du ansvarar helt själv eftersom du arbetar ensam på objektet

**Rätt svar:** B) Företaget har arbetsgivaransvaret, kunden ansvarar för arbetsstället – det strängaste regelverket gäller

**Förklaring:** Ansvaret följer rollerna: arbetsgivaren för dig, den som råder över stället för stället, samordnaren för helheten. För dig i praktiken: företagets och objektets skyddsregler gäller samtidigt. På gemensamma arbetsställen finns dessutom ett samordningsansvar.

---

### 27. Kundens driftjour ber dig nattetid kontrollera ett larm uppe på ett tak utan räcken – du saknar fallskyddsutrustning och utbildning. Vad gör du?

*Källa: Träningsfråga · Internt fråge-id: `vu2-module-4-quiz-4`*

- A) Går upp försiktigt ändå utan utrustning – kunden betalar ju trots allt för den avtalade servicen dygnet runt, året om
- B) Går upp om ledningscentralen lovar att stanna kvar i telefonen under hela takkontrollen
- C) Ber en kollega med mindre höjdrädsla att göra det i stället
- D) Avböjer – uppgiften ligger utanför uppdraget och innebär allvarlig fara – och erbjuder det du kan göra från marken

**Rätt svar:** D) Avböjer – uppgiften ligger utanför uppdraget och innebär allvarlig fara – och erbjuder det du kan göra från marken

**Förklaring:** Två självständiga skäl räcker vart och ett: ändringar av uppdraget går via företaget, och allvarlig fara ger rätt att avstå. Ett motiverat nej är professionell leverans – taket löses av behörig personal i dagsljus. Rapportera till ledningscentral och arbetsledning.

---

### 28. Vilka tre frågor utgör sista-minuten-riskbedömningen före ett riskmoment?

*Källa: Träningsfråga · Internt fråge-id: `vu2-module-4-quiz-6`*

- A) Vad kan hända? Hur illa kan det bli? Vad gör jag åt det – nu?
- B) Vem bär ansvaret? Vad säger avtalet? Vem betalar om det går fel?
- C) Hur lång tid tar det? Vad tycker kunden? Hinner jag ta rasten?
- D) Var är kamerorna? Vem tittar just nu? Vad syns i bild efteråt?

**Rätt svar:** A) Vad kan hända? Hur illa kan det bli? Vad gör jag åt det – nu?

**Förklaring:** Trettio sekunders strukturerad eftertanke före ingripandet, utryckningen eller ronden som känns fel – och när svaret får dig att avvika från rutinen dokumenteras beslutet med skälen.

---

### 29. En väktare har hotats två gånger av samma gäng på ett objekt. Vad ska tillbudsrapporterna leda till?

*Källa: Träningsfråga · Internt fråge-id: `vu2-module-4-quiz-7`*

- A) Att väktaren erbjuds byta arbetsplats till ett lugnare objekt
- B) Att rapporterna arkiveras och används i den årliga statistiken
- C) Att väktaren uppmanas att helt enkelt vara mer försiktig och uppmärksam i fortsättningen av tjänsten
- D) En uppdaterad riskbedömning med konkreta åtgärder – omlagd rond, dubbelbemanning eller personlarm

**Rätt svar:** D) En uppdaterad riskbedömning med konkreta åtgärder – omlagd rond, dubbelbemanning eller personlarm

**Förklaring:** Varje händelse ska följas upp så att rutinerna skärps av verkligheten. Rapporterna är det som styr resurser och bemanning – orapporterade hot lämnar nästa kollega ensam med samma risk. Åtgärderna tas fram i samråd med kunden och följs upp.

---

## Modul 5 · Samhällets rättsvårdande myndigheter

### 30. När används 114 14 i stället för 112?

*Källa: Slutprov · Internt fråge-id: `vu2-final-bank-5-1-24`*

- A) För anmälningar och tips som inte är akuta – 112 är till för pågående fara
- B) 114 14 är polisens interna nummer för samverkanspartners
- C) Endast på vardagar före klockan 17 när polisstationerna är fullt bemannade
- D) När 112 är upptaget och du inte kan vänta kvar i kön

**Rätt svar:** A) För anmälningar och tips som inte är akuta – 112 är till för pågående fara

**Förklaring:** Rätt nummer till rätt läge håller akutlinjen fri: pågående händelser till 112, efterhandsanmälan av inbrottet till 114 14 eller polisen.se.

---

### 31. Vilken är rättskedjans ordning?

*Källa: Träningsfråga · Internt fråge-id: `vu2-module-5-quiz-1`*

- A) Åtal → förundersökning → anmälan → rättegång → dom
- B) Brott och anmälan → förundersökning → åtal → rättegång → påföljd och verkställighet
- C) Rättegång → förundersökning → åtal → påföljd och verkställighet i den ordningen
- D) Anmälan → häktning → påföljd → åtal → verkställighet

**Rätt svar:** B) Brott och anmälan → förundersökning → åtal → rättegång → påföljd och verkställighet

**Förklaring:** Kedjan är en stafett där varje myndighet äger sin sträcka – och väktarens gripande, beslag och rapport är ofta det allra första materialet i den.

---

### 32. Vem leder förundersökningen vid allvarligare brott och beslutar om åtal?

*Källa: Träningsfråga · Internt fråge-id: `vu2-module-5-quiz-2`*

- A) Polismyndighetens vakthavande befäl
- B) Tingsrättens ordförande
- C) Kriminalvården
- D) Åklagaren

**Rätt svar:** D) Åklagaren

**Förklaring:** Åklagaren är navet mellan utredning och domstol: förundersökningsledare vid allvarligare brott, åtalsbeslutet, anhållanden och häktningsframställningar.

---

### 33. Du kallas som vittne till tingsrätten men vill helst slippa. Vad gäller?

*Källa: Träningsfråga · Internt fråge-id: `vu2-module-5-quiz-5`*

- A) Du kan tacka nej – vittnesmål är frivilliga för privatanställda
- B) Du kan skicka in din skriftliga rapport i stället för att inställa dig personligen
- C) Ditt bevakningsföretag kan skicka en erfaren kollega i ditt ställe
- D) Kallelsen måste följas – den som uteblir riskerar vite och kan hämtas till rätten

**Rätt svar:** D) Kallelsen måste följas – den som uteblir riskerar vite och kan hämtas till rätten

**Förklaring:** Vittnesplikten är en medborgerlig skyldighet som väger tyngre än både olust och tystnadsplikt. Förbered dig genom att läsa rapporten – den skrevs för exakt det här. I rätten gäller vittnesed och sanningsplikt, med din rapport som tillåtet minnesstöd.

---

### 34. Vem beslutar om tillträdesförbud till en butik – och vad betyder beslutet för väktaren?

*Källa: Träningsfråga · Internt fråge-id: `vu2-module-5-quiz-6`*

- A) Butikschefen – och beslutet ger väktaren rätt att visitera personen vid entrén
- B) Åklagaren – den som trots förbudet går in begår ett brott och kan gripas
- C) Polismyndigheten – och beslutet gäller automatiskt alla butiker i kommunen
- D) Länsstyrelsen – och beslutet gäller i sex månader åt gången

**Rätt svar:** B) Åklagaren – den som trots förbudet går in begår ett brott och kan gripas

**Förklaring:** Det åklagarbeslutade tillträdesförbudet är straffsanktionerat – butikens egen portning är det inte. Skillnaden avgör om ett gripande är möjligt, precis som i scenariobanken.

---

## Modul 6 · Droger

### 35. En man uppträder "berusat" men luktar inte alkohol. Vad gör du innan du drar slutsatsen drogpåverkan?

*Källa: Slutprov · Internt fråge-id: `vu2-final-bank-6-3-29`*

- A) Avvisar honom direkt från platsen som berusad
- B) Begär att han visar legitimation som första åtgärd
- C) Väntar tio minuter på avstånd och ser om beteendet går över helt av sig självt innan du agerar
- D) Överväger medicinska orsaker – diabetes, stroke, skallskada – och gör hälsobedömningen först

**Rätt svar:** D) Överväger medicinska orsaker – diabetes, stroke, skallskada – och gör hälsobedömningen först

**Förklaring:** "Fyllan som inte luktar" är materialets återkommande varning, från VU1:s akutsjukvård till etiken: det som ser ut som påverkan kan vara sjukdom – och hälsan bedöms alltid först.

---

### 36. Under en rond hittar du en påse med misstänkt narkotika i ett cykelförråd. Vad gör du?

*Källa: Träningsfråga · Internt fråge-id: `vu2-module-6-quiz-2`*

- A) Rör inte påsen, säkrar platsen och kontaktar polis enligt rutin – fyndet dokumenteras med plats och tid
- B) Tar med påsen till vaktlokalen och låser in den i värdeskåpet för säker förvaring till morgonens överlämning
- C) Spolar ner innehållet på toaletten så att det inte hamnar i fel händer
- D) Lämnar påsen där den ligger – den är ju trots allt undangömd

**Rätt svar:** A) Rör inte påsen, säkrar platsen och kontaktar polis enligt rutin – fyndet dokumenteras med plats och tid

**Förklaring:** Fyndet är bevis i ett möjligt brott: fingeravtryck och DNA förstörs av hantering, och egen "förvaring" av narkotika försätter dig i ett omöjligt läge. Rör inte, säkra, larma – samma princip som vid vapenfyndet i scenariobanken.

---

### 37. En person har mycket små pupiller, hängande ögonlock och blir alltmer dåsig – till slut svarar hen inte på tilltal och andningen är långsam. Vad misstänker du och vad gör du?

*Källa: Träningsfråga · Internt fråge-id: `vu2-module-6-quiz-3`*

- A) Vanlig trötthet efter ett långt pass – låt personen sova
- B) Cannabispåverkan – ingen särskild åtgärd behövs just nu
- C) Stimulantiapåverkan – håll behörigt avstånd och invänta att ruset klingar av helt av sig självt
- D) Möjlig opioidpåverkan med överdosrisk – larma 112, lägg i stabilt sidoläge och övervaka andningen

**Rätt svar:** D) Möjlig opioidpåverkan med överdosrisk – larma 112, lägg i stabilt sidoläge och övervaka andningen

**Förklaring:** Knappnålspupiller, dåsighet och långsam andning är opioidbilden – och andningsdepressionen är det som dödar. Sänkt medvetande plus påverkad andning är alltid ett akutläge, oavsett orsak. Ha beredskap för HLR.

---

### 38. Varför kräver GHB särskild vaksamhet?

*Källa: Träningsfråga · Internt fråge-id: `vu2-module-6-quiz-4`*

- A) Det luktar så starkt och karakteristiskt att det alltid avslöjar sig självt vid varje kontroll
- B) Marginalen mellan rus och överdos är mycket liten – en medvetslös person ska alltid till 112
- C) Det ger alltid kraftig aggressivitet hos den som tagit det
- D) Det är den enda missbrukssubstansen som inte är narkotikaklassad i Sverige

**Rätt svar:** B) Marginalen mellan rus och överdos är mycket liten – en medvetslös person ska alltid till 112

**Förklaring:** GHB:s smala marginal gör "sova av sig" till en livsfarlig chansning. Regeln är absolut: okontaktbar efter fest är ett sjukvårdslarm, varje gång.

---

### 39. Vad är säkerhetsmässigt viktigast att veta om en person som är kraftigt påverkad av centralstimulantia?

*Källa: Träningsfråga · Internt fråge-id: `vu2-module-6-quiz-5`*

- A) Oberäkneligheten och den höga smärttåligheten – håll avstånd och kalla förstärkning tidigt
- B) Att personen snart somnar av sig själv när ruset klingar av
- C) Att personen alltid lyder tydliga order från en uniformerad väktare
- D) Att fysiskt ingripande är riskfritt eftersom personen är fysiskt försvagad av det pågående ruset

**Rätt svar:** A) Oberäkneligheten och den höga smärttåligheten – håll avstånd och kalla förstärkning tidigt

**Förklaring:** Rastlöshet, misstänksamhet och smärttålighet gör både dialog och fysiska ingripanden opålitliga. Det är VU1 modul 9:s regel i praktiken: vissa tillstånd möts med avstånd, tid och förstärkning.

---

### 40. Vilka är väktarens tre spår vid misstänkt drogpåverkan?

*Källa: Träningsfråga · Internt fråge-id: `vu2-module-6-quiz-6`*

- A) Förhöra personen på plats, visitera fickorna efter substanser och avvisa från platsen
- B) Fotografera personen diskret, filma förloppet och publicera internt som en varning till kollegorna på andra objekt
- C) Fara → larma polis; medicinsk påverkan → 112 och sidoläge; enbart avvikande beteende → dokumentera och rapportera
- D) Ignorera, avvakta och gå vidare med ronden

**Rätt svar:** C) Fara → larma polis; medicinsk påverkan → 112 och sidoläge; enbart avvikande beteende → dokumentera och rapportera

**Förklaring:** Sorteringen styr allt agerande – och hälsan bedöms alltid, oavsett spår. Väktarens uppgift är säkerhet, liv och rapport; diagnosen är vårdens och skuldfrågan polisens.

---
