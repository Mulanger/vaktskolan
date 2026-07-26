# Granskning av VU1-kursmaterialet

**Datum:** 2026-07-26
**Granskat av:** Claude (Opus 5), på uppdrag av produktägaren
**Status:** K1 och faktapunkterna **F1–F8 är åtgärdade 2026-07-26**. Språk- och pedagogikpunkterna S1–S11 och P1–P5 är fortfarande förslag.

---

## 1. Vad som granskats

| Källa | Omfattning |
|---|---|
| `vu1quiz.json` | Samtliga **154 frågor** (94 modulquiz i modul 1–11 + 60 sluttestfrågor) – frågetext, alla fyra alternativ, facit och förklaring |
| `utbildning.md` rad 1–3005 | VU1:s brödtext, modul 1–12, inkl. sammanfattningar och materialöversikt |
| `content/guides/vu1.mdx` | Publik VU1-guide |
| `content/guides/vu1-ovningsfragor.mdx` | Publika övningsfrågor (3 st) |
| `quiz-balans/vu1-banken-alla-154.md` | Före/efter-underlaget från balanseringen 2026-07-23 |

**Metod:** varje fråga lästes mot brödtexten i motsvarande modul. Facit maskinjämfördes dessutom mot det ursprungliga facit i balanseringsunderlaget för att fånga svar som råkat flytta position. De juridiska påståenden som bär mest vikt kontrollerades mot lagtext hos Riksdagen och Polismyndighetens föreskrifter (se avsnitt 7).

**Resultat i korthet:**

| Allvarlighet | Antal | Innebörd |
|---|---|---|
| 🔴 Kritiskt | **1** | Eleven lär sig ett direkt felaktigt svar |
| 🟠 Faktagranskas | **8** | Sakuppgift som är fel, oprecis eller motsägs på annan plats |
| 🟡 Språk och stil | **11** | Grammatik, ordval, inkonsekvens |
| 🔵 Pedagogik | **5** | Förbättringsförslag, inget fel |

Den absoluta merparten av materialet höll för granskningen. Se avsnitt 6 för vad som kontrollerades och befanns korrekt.

---

## 2. 🔴 Kritiskt – måste rättas

### K1. Fråga 2 (Modul 1) har fel facit – eleven lär sig fel lagkrav

**Var:** `vu1quiz.json` id 2 · `utbildning.md:187–194` (Modul 1, Fråga 2) · sannolikt även Supabase (`vu1_quiz`)

**Frågan:** *"Vilka tre saker prövas när en person ska godkännas för anställning i ett bevakningsföretag?"*

Facit pekar i dag på **D) "Körkort, språkkunskaper och svenskt medborgarskap"**.

Det rätta svaret ligger på **B) "Laglydnad, medborgerlig pålitlighet och lämplighet i övrigt"**.

4 § lagen (1974:191) om bevakningsföretag: *"All personal hos ett auktoriserat bevakningsföretag skall vara godkänd vid prövning med avseende på laglydnad, medborgerlig pålitlighet samt lämplighet i övrigt för anställning i ett sådant företag."*

Tre saker gör det extra tydligt att D är fel och inte en avsiktlig omskrivning:

1. **Förklaringen beskriver B, inte D.** Den lyder *"Det är lagens tre kriterier…"* – körkort, språkkunskaper och medborgarskap är inga lagkriterier alls.
2. **Er egen brödtext säger B.** `utbildning.md:83` och sammanfattningen på rad 168 anger laglydnad / medborgerlig pålitlighet / lämplighet.
3. **Felet uppstod vid balanseringen 2026-07-23.** I `quiz-balans/vu1-banken-alla-154.md` ligger rätt svar på D före omskrivningen. Efteråt flyttades texten till B medan bokstaven D behölls. Ändringsnoteringen i samma fil säger *"Rätt svar (B) orört"* – bokstaven stämde alltså inte ens med den egna anteckningen.

**Omfattning:** frågan ingår i Modul 1-quizet och kan lottas in i slutprovet. Elever som svarar rätt får i dag fel.

**Att åtgärda:** byt `correct` till `"B"` och `correctIndex` till `1` i `vu1quiz.json`, ändra `**Rätt svar: D.**` till `**Rätt svar: B.**` på `utbildning.md:194`, och kör om `npm run import:quiz-portal` så att Supabase följer med. Alternativet – att byta plats på alternativen B och D – fungerar också men bryter mot invarianten om orörd alternativordning i `quiz-balans/INSTRUKTIONER-driftsattning.md`.

> **Kontrollerat:** samma maskinjämförelse gjordes för alla 154 frågor. Det här är den **enda** frågan där facit hamnat på fel alternativ. Övriga 95 avvikelser mot originaltexten var rena omformuleringar där innebörden bevarats.

---

## 3. 🟠 Faktagranskas

### F1. Väktarens tystnadsplikt beskrivs som lagstadgad – det stämmer sannolikt inte

**Var:** `utbildning.md:49` · `utbildning.md:462` · `vu1quiz.json` id 8 (förklaringen)

Materialet säger på rad 49: *"Du har dessutom **lagstadgad tystnadsplikt** … Att bryta mot den är straffbart."* Rad 462 listar *"Röja kunduppgifter → **brott mot tystnadsplikt** (20 kap. 3 §)"*. Förklaringen till fråga 8 säger *"Tystnadsplikten **enligt lagen om bevakningsföretag** är inte tidsbegränsad."*

Lagen (1974:191) om bevakningsföretag innehåller 1 §–16 § och **någon tystnadspliktsbestämmelse finns inte bland dem**. Den finns inte heller i PMFS 2017:10 (FAP 573-1), som bara nämner brott mot tystnadsplikt som exempel på diskvalificerande brottslighet. Enligt förarbetena är läget i stället att tystnadsplikten är offentligrättsligt reglerad för **ordningsvakter** (lagen om ordningsvakter), **skyddsvakter** och sedan 2023 **arrestantvakter** – medan den för vanliga väktare vilar på **anställningsavtal och kollektivavtal**.

Det spelar roll eftersom BrB 20 kap. 3 § förutsätter en tystnadsplikt *"enligt lag eller annan författning"*. Saknas den grunden är rubriceringen på rad 462 fel.

**Svaret på fråga 8 är däremot rimligt i sak** – en avtalad tystnadsplikt överlever normalt anställningen. Det är hänvisningen till lagrummet som behöver rättas, inte facit.

**Rekommendation:** låt jurist bekräfta. Om bilden stämmer bör formuleringen bli ungefär *"tystnadsplikt enligt anställningsavtal och kollektivavtal, som fortsätter gälla efter anställningen"*, och rad 462 skrivas om till avtalsbrott/skadestånd i stället för BrB 20:3.

### F2. VU1:s omfattning anges olika på olika ställen

**Var:** `utbildning.md:3`, `:93`, `:169`, `:203` (88 timmar) mot `content/guides/vu1.mdx:29` (91 lektionstimmar)

Kursmaterialet skriver genomgående *"VU1, 88 lektionstimmar enligt PMFS 2017:10, FAP 573-1"*. Den publika guiden skriver *"BYA anger att kursen genomförs under nio dagar och omfattar 91 lektionstimmar i deras upplägg."*

Båda kan vara sanna samtidigt – föreskriftens minimikrav respektive BYA:s faktiska upplägg – men som det står nu ser det ut som en självmotsägelse för en elev som läser båda. Timantalen ligger i **bilaga 1** till FAP 573-1, som inte gick att verifiera vid granskningen.

**Rekommendation:** kontrollera bilaga 1 och skriv sedan konsekvent, t.ex. *"minst 88 lektionstimmar enligt FAP 573-1 bilaga 1; BYA lägger upp kursen på 91 timmar under nio dagar."* Guiden `vu1.mdx` gör redan rätt som skriver ut källan – gör likadant i `utbildning.md`.

### F3. Fråga 3 – förklaringen upprepar timuppgiften utan källa

**Var:** `vu1quiz.json` id 3 · `utbildning.md:203`

*"Först 88 timmar VU1, sedan minst 160 timmars praktisk yrkesträning…"* Samma osäkerhet som F2. 160-timmarskravet är däremot bekräftat – det står uttryckligen i PMFS 2017:10.

### F4. Det förstärkta rättsskyddet saknar lagrum

**Var:** `utbildning.md:103` · `vu1quiz.json` id 4 (förklaringen)

Påståendet **stämmer**, men materialet skriver bara *"Det skyddet följer direkt av lagen om bevakningsföretag"* och *"(17 kap. brottsbalken)"*. Det exakta lagrummet är värt att skriva ut, eftersom det är en av de vanligaste provfrågorna:

> 7 § lagen (1974:191) om bevakningsföretag: *"Den som är godkänd för anställning i bevakningsföretag och har till uppgift att utföra bevakningstjänst (väktare) har det skydd som avses i 17 kap. 5 § första stycket brottsbalken när han eller hon utför sådan tjänst."*

Notera villkoren: skyddet kräver att man är **godkänd** och att man **utför bevakningstjänst**. Alternativ C i fråga 4 säger bara *"eftersom väktaren är i tjänst"*, vilket är en förenkling som tappar godkännandekravet.

### F5. Skyddsvisitationens lagrum anges olika på tre ställen

**Var:** `utbildning.md:331` ("polislagen 19 §, via 29 §") · `utbildning.md:410` ("19 § första stycket 1") · `vu1quiz.json` id 13 ("polislagen 19 § via 29 §")

Den precisa varianten på rad 410 är den rätta. Använd **"polislagen 19 § första stycket 1, via 29 §"** överallt, inklusive i förklaringen till fråga 13.

### F6. Fråga 150 – alternativet och förklaringen säger emot varandra

**Var:** `vu1quiz.json` id 150

Rätt svar: *"När sjukvården tar över, när personen visar tydliga livstecken **eller när du inte längre orkar**."*
Förklaring: *"HLR är en stafett som inte får tappa pinnen – **bedömningen om att avsluta är sjukvårdens, inte din**."*

En elev som läser båda får två motstridiga besked. Förklaringen behöver skilja på *att fysiskt inte orka* (giltigt skäl) och *att besluta att livräddningen är meningslös* (sjukvårdens beslut).

### F7. Handfängselmomentets placering i utbildningen bör verifieras

**Var:** `utbildning.md:143`, `:173` · `vu1quiz.json` id 5 (förklaringen)

Materialet säger att handfängsel får bäras *"efter utbildningsmomentet i VU1"*. PMFS 2017:10 bekräftar att handfängsel är ett eget utbildningsämne enligt **bilaga 1**, men om momentet ligger i del 1 eller del 2 framgår inte utan att läsa bilagan. Eftersom fråga 5 hänger på just den distinktionen (batong = efter VU1, handfängsel = i VU1) bör den kontrolleras mot bilaga 1.

Batongkravet och förbudet mot pepparspray för väktare stämmer.

### F8. "Snatteri" är en avskaffad brottsrubricering

**Var:** `vu1quiz.json` id 10 (alternativ B och förklaringen) · `utbildning.md:422`

Brottet heter **ringa stöld** sedan 2017. Att skriva *"Ringa stöld (snatteri)"* som brygga är rimligt – men förklaringen bör konsekvent använda den gällande termen, så att eleven inte tar med sig den gamla i provet. Värdegränsen "kring 1 250 kr" är korrekt återgiven med rätt reservation om att den kan ändras.

---

## 4. 🟡 Språk, grammatik och stil

| # | Var | Problem | Förslag |
|---|---|---|---|
| S1 | id 100, förklaring | *"…måste också ha haft uppsåt, **vilket är därför** den glömska kunden inte begår stöld."* – ogrammatiskt | *"…ha haft uppsåt. Det är därför den glömska kunden inte begår stöld."* |
| S2 | id 89, alt. D | *"…för att försöka väcka **den** till medvetande igen"* – person omtalas som "den" | *"…väcka personen"* |
| S3 | id 148, alt. D | *"Kontrollerar åtsittningen direkt och lossar vid behov, **och** dokumenterar…"* – dubbelt "och" | Stryk det andra "och" |
| S4 | id 94, förklaring | *"**Precis det modul 7 och 8 lär**: det som ser ut som trots kan vara sjukdom."* – elliptiskt | *"Precis det som modul 7 och 8 lär ut:"* |
| S5 | id 60, alt. A | *"svara med samma mynt **tillbaka**"* – pleonasm | *"betala tillbaka med samma mynt"* eller *"svara med samma mynt"* |
| S6 | id 38, alt. D | *"…släpper in hen **så länge under tiden**"* – dubblering | *"…och släpper in hen under tiden"* |
| S7 | id 5, förklaring | Tre huvudsatser hopfogade med komma | Dela i två meningar |
| S8 | Hela banken | Inkonsekvent personpronomen: **hen** (id 38, 60), **den** (id 89), **han** (id 94, 110), **personen** (flertalet) | Fastställ en regel. Förslag: *personen* som standard, *hen* när pronomen behövs, aldrig *den* om människor |
| S9 | id 32 alt. A och id 64 alt. B | Nästan identisk utfyllnad: *"kunden är ju trots allt den som betalar för hela tjänsten"* / *"det är ju trots allt kunden som betalar för hela den avtalade tjänsten"* | Variera – upprepningen gör mönstret igenkännbart |
| S10 | id 58, 65, 94 (förklaringar) | Hänvisar till **scenariobanken** och *"scenariot med den sovande mannen i vinterkylan"* – innehåll VU1-eleven kanske aldrig sett | Skriv om till fristående formuleringar, eller lägg till en tydlig länk |
| S11 | id 6 alt. D, id 91 alt. B, id 150 alt. A | Långa, överförklarade felsvar (*"oavsett vilken utbildning väktaren har eller saknar"*, *"…när du larmar in händelsen"*) | Se P4 nedan |

---

## 5. 🔵 Pedagogiska förbättringsförslag

**P1. De fyra straffrättsliga grunderna saknas som egen fråga.** Fråga 67 handlar om olaga diskriminering (BrB 16:9) och fråga 68 om diskrimineringslagens sju grunder. Brödtexten (`utbildning.md:1752–1770`) skiljer korrekt på att **BrB 16:9 bara omfattar fyra grunder** – etnisk tillhörighet, trosbekännelse, sexuell läggning samt könsöverskridande identitet eller uttryck – medan diskrimineringslagen har sju. Ingen fråga testar den skillnaden, trots att den är en klassisk provfälla. Överväg en fråga i modul 8.

**P2. Balanseringen har skapat ett nytt mönster.** Rätt svar är inte längre längst (31 % mot slumpens 25 %, väl inom vakten i `test:quiz-balance`) – men i flera frågor är felsvaren nu de mest utförligt *motiverade*. Ett alternativ som argumenterar för sig själv (*"…oavsett vilken utbildning väktaren har eller saknar"*) läser en van elev som fel. Tips inför nästa omgång: mät inte bara teckenlängd utan även antal bisatser per alternativ.

**P3. Fråga 45 och 124 är samma frågetyp.** Båda testar bokstaveringsalfabetet ("BIL" i modulquizet, "GÅS" i sluttestbanken). De kan inte hamna i samma slumpade prov via modulquizet, men det är värt att veta att kunskapen testas två gånger med identisk mekanik.

**P4. Osäker ålder saknas som fråga.** Brödtexten ger en bra tumregel (`utbildning.md:487`): *"Är du osäker på om personen är över eller under 15 – utgå från att reglerna för unga gäller."* Den prövas inte i någon fråga.

**P5. Överväg att sätta `reviewedAt` på quizbanken.** `vu1quiz.json` har `generated: "2026-07-23"` men inget fält för när innehållet senast faktakontrollerades. Guiderna i `content/guides/` har redan `reviewedAt` – samma fält i quizbanken skulle göra det lättare att se när juridiken senast stämdes av mot gällande rätt.

---

## 6. Kontrollerat och befunnet korrekt

Detta granskades aktivt och stämmer – noteras så att ingen behöver göra om arbetet:

**Juridik (modul 1–2, 8, 10)**
- Envarsgripandets tre villkor, RB 24 kap. 7 § andra stycket (id 9, 11, 12, 102)
- Bar gärning / flyende fot och kravet på obruten uppsikt (id 11)
- Efterlyst som undantag från kravet på bar gärning (id 12)
- Beslag vid gripande, RB 27 kap. 4 § (id 14, 106)
- Nödvärn BrB 24:1 inkl. alla fyra nödvärnssituationerna – särskilt att *"vägrar lämna en bostad efter tillsägelse"* är en av dem (id 15, 16, 17, 103, 104)
- Nödvärnsexcess BrB 24:6 och putativt nödvärn (id 18, 111)
- Nöd BrB 24:4 och att kravet där är strängare ("oförsvarlig" mot "uppenbart oförsvarlig") (id 19)
- Laga befogenhet: polislagen 29 § kopplad till 10 § första stycket 2 (id 20, 105)
- LUL 35 § – gripande av den som är under 15 (id 21, 107)
- Straffmyndighetsålder 15 år (id 22)
- Objektiva och subjektiva rekvisit (id 100), tillägnelseuppsåt som skiljelinje stöld/egenmäktigt förfarande (id 101)
- Våldsamt motstånd BrB 17 kap. 4 § (id 110)
- Olaga diskriminering BrB 16:9 – att **anställda** kan dömas personligen, böter eller fängelse i högst ett år (id 67)
- Diskrimineringslagens sju grunder, ordagrant (id 68); DO som tillsynsmyndighet (id 139)
- Kamerabevakningslagen: privata företag behöver normalt inget tillstånd, upplysningsplikt gäller, IMY är tillsynsmyndighet (id 23, 108)
- Att handfängsel för väktare **saknar** eget lagrum: polislagen 10 a § utsträcks i 29 § till ordningsvakter, inte till envar som griper. Materialets formulering *"Det finns ingen särskild handfängsellag för väktare"* är alltså riktig (id 81, 147)
- Vittnesplikten väger tyngre än tystnadsplikten (id 109)
- Auktorisation prövas av Länsstyrelsen (5 §), egenbevakning omfattas inte, 18-årsgräns (id 1, 96, 97, 98)

**Arbetsmiljö (modul 3)**
- Arbetsgivarens huvudansvar, skyddsombudets roll och skyddsombudsstopp (id 25, 113)
- Rätten att avbryta arbete vid omedelbar och allvarlig fara (id 28)
- Anmälan av allvarliga olyckor och tillbud till Arbetsmiljöverket utan dröjsmål; arbetsskador till Försäkringskassan (id 27)
- Riskobservation / tillbud / olycka som tre skilda begrepp (id 26, 112)

**Brand (modul 6)** – brandtriangeln, brandklasserna A/B/C/D/F, kolsyra mot elbrand, aldrig vatten i fett, RVLS, hissförbud vid utrymning, lägenheten som egen brandcell, sexmetersregeln för containrar, räddningsledaren som beslutsfattare vid återinträde (id 49–58, 126–132). Inga fel hittade.

**Akutsjukvård (modul 11)** – L-ABCDE, stabilt sidoläge, agonal andning som hjärtstopp, HLR 30:2 / 5–6 cm / 100–120 per minut, avbyte varannan minut, hjärtstartarens säkerhet, 5 ryggslag + 5 buktryck, AKUT-testet, inget att dricka till svårt skadad (id 87–94, 149–154). Överensstämmer med svenska HLR-rådets riktlinjer.

**Bevakningstjänst och teknik (modul 4–5)** – objektsinstruktionens företräde, tailgating, utpasseringskontroll på samtycke, godtagbara id-handlingar, att väktare aldrig kan kräva legitimation på allmän plats, signalementets ordning, skal- kontra volymskydd, överfallslarmets tysthet, svenska bokstaveringsalfabetet, bevakningsfordon utan utryckningsstatus (id 31–48, 114–125).

**Etik och konflikthantering (modul 7, 9)** – beslutstrappans fyra steg i rätt ordning, dagsljustestet, jäv, gyllene bro, taktisk andning, plötsligt lugn som varningssignal, finmotorikens fall vid adrenalinpåslag (id 59–66, 73–80, 133–137, 141–145).

**Format** – samtliga 154 frågor har exakt fyra alternativ och ett rätt svar, inga dubbla mellanslag, ingen blandad interpunktion, inga dubblettfrågor.

---

## 7. Källor som använts vid faktakontrollen

- [Lag (1974:191) om bevakningsföretag](https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-1974191-om-bevakningsforetag_sfs-1974-191/) – 4 §, 5 §, 7 §, samt paragrafförteckningen 1 §–16 §
- [Polislag (1984:387)](https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/polislag-1984387_sfs-1984-387/) – 10 §, 10 a §, 19 §, 29 §
- [PMFS 2017:10, FAP 573-1](https://polisen.se/51c6d188c6f3e356864df71f694502a6/siteassets/forfattningssamling/fap-nummer/fap573-01-pmfs2017-10/) – utbildningskrav, 160 timmar PYT, handfängsel och batong enligt bilagorna
- [Prop. 2021/22:275 Arrestantvakter och transportuppdrag](https://www.riksdagen.se/sv/dokument-och-lagar/dokument/proposition/arrestantvakter-och-transportuppdrag_H903275/html/) – för frågan om vilka bevakningskategorier som har lagreglerad tystnadsplikt
- [Betänkande 1985/86:NU11 om bevakningsverksamhet](https://www.riksdagen.se/sv/dokument-och-lagar/dokument/betankande/naringsutskottets-betankande-om_g901nu11/html/) – samma fråga
- Projektets egna filer: `utbildning.md`, `vu1quiz.json`, `quiz-balans/vu1-banken-alla-154.md`, `content/guides/*.mdx`

**Reservation:** granskningen är gjord av en AI-assistent, inte av jurist. Punkterna i avsnitt 3 – särskilt **F1 om tystnadsplikten** – bör bekräftas av jurist eller utbildningsansvarig innan innehållet ändras. Det ligger i linje med den reservation ni själva skrivit in på `utbildning.md:3`.

---

## 8. Föreslagen ordning att arbeta i

1. **K1** – rätta facit på fråga 2. Enda felet som ger eleven direkt felaktig kunskap.
2. **F1** – utred tystnadspliktens rättsliga grund. Påverkar brödtext, en fråga och en brottsrubricering.
3. **F2, F3, F7** – kontrollera FAP 573-1 bilaga 1 i ett svep: VU1:s timantal och handfängselmomentets placering.
4. **F4, F5, F6, F8** – skriv ut lagrum och lös motsägelsen i fråga 150.
5. **S1–S11** – språkputs, lämpligen i en samlad omgång.
6. **P1–P5** – pedagogiska tillägg när det finns utrymme.

VU2-materialet är **inte** granskat i den här omgången.

---

## 9. Åtgärdsstatus för faktapunkterna F1–F8

Rättelserna nedan gjordes 2026-07-26 efter en ny kontroll mot primärkällorna. De ursprungliga iakttagelserna ovan står kvar för spårbarhet.

| Punkt | Åtgärd |
|---|---|
| **F1** | Den generella hänvisningen till lagstadgad tystnadsplikt för vanliga väktare är borttagen. Materialet skiljer nu mellan skyldigheter som följer av avtal, kollektivavtal, instruktioner, lojalitetsplikt och företagshemligheter samt lagstadgad tystnadsplikt eller sekretess för särskilda roller och uppdrag. BrB 20 kap. 3 § anges bara när tystnadsplikten följer av lag eller annan författning. Fråga 8 är omskriven med oförändrat facit C. |
| **F2** | VU1 anges konsekvent som **88 föreskrivna lektionstimmar** enligt FAP 573-1 bilaga 1. Den publika guiden förklarar att BYA:s 91 timmar består av de 88 föreskrivna timmarna plus tre timmar som branschens parter lagt till. |
| **F3** | Förklaringen till fråga 3 anger nu källan till de 88 föreskrivna timmarna och skiljer dem från eventuella tillägg hos utbildningsanordnaren. |
| **F4** | Det förstärkta straffrättsliga skyddet knyts nu uttryckligen till 7 § lagen om bevakningsföretag och 17 kap. 5 § första stycket brottsbalken. Villkoren är att personen är godkänd för anställning och utför bevakningstjänst. |
| **F5** | Hänvisningen är standardiserad till **polislagen 19 § första stycket 1, via 29 §** i brödtext, sammanfattning, quizbank och dokumenterat slutprovsurval. |
| **F6** | Fråga 150 och förklaringen anger samma tre stoppkriterier för HLR: någon annan eller sjukvården tar över, personen börjar andas normalt eller visar tydliga livstecken, eller hjälparen är fysiskt oförmögen att fortsätta. Eleven ska inte själv avbryta för att insatsen bedöms utsiktslös. |
| **F7** | Handfängselmomentet är verifierat i VU1 och anges som fyra lektionstimmar. Materialet anger även villkoren i 9 kap. 1 § FAP 573-1: godkänt resultat i Konflikthantering och självskydd samt Handfängsel enligt bilaga 1. |
| **F8** | Den aktuella brottsrubriceringen **ringa stöld** används i frågan. I brödtexten nämns ”tidigare kallat snatteri” en gång som begreppsbrygga. |

Ändringarna är synkroniserade i `utbildning.md`, `vu1quiz.json`, `quiz-balans/data/vu1_fixed.json`, den publika VU1-guiden och de berörda förklaringarna i `docs/slutprov-topplista-vu1-vu2.md`.
