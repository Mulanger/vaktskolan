-- Seed the scenario_quiz collection with the 300-question scenario bank.
-- Generated from D:/vaktarskolan_scenariobank_300.json.
-- Questions are inserted as draft. Change --status to published only after review.

begin;

drop table if exists vakt_scenario_seed_payload;

create temp table vakt_scenario_seed_payload (
  data jsonb not null
) on commit drop;

insert into vakt_scenario_seed_payload (data) values (
$vakt_scenario_json$
{
  "meta": {
    "name": "Vaktskolan – scenariobank",
    "version": "2.0",
    "language": "sv",
    "generated": "2026-07-04",
    "count": 300,
    "notes": "Scenario 1–100 (source: v1) är den ursprungliga banken, 101–300 (source: v2) är utökningen. Alternativen ligger i ursprunglig A–D-ordning med rätt svar i correct/correctIndex – appen bör slumpa alternativens ordning vid visning. Taggar för 1–100 är automatiskt härledda ur texten och kan förfinas manuellt. Kategorin felsokning använder frågeformatet \"vilket var det allvarligaste felet\". Innehållet ska juridikgranskas före publicering."
  },
  "categories": [
    {
      "id": "butik",
      "label": "Butik och handel",
      "level": "grund",
      "count": 18
    },
    {
      "id": "kopcentrum",
      "label": "Köpcentrum och gallerior",
      "level": "grund",
      "count": 9
    },
    {
      "id": "lager",
      "label": "Lager och logistik",
      "level": "grund",
      "count": 8
    },
    {
      "id": "kollektivtrafik",
      "label": "Kollektivtrafik",
      "level": "grund",
      "count": 10
    },
    {
      "id": "sjukhus",
      "label": "Sjukhus och vård",
      "level": "grund",
      "count": 8
    },
    {
      "id": "kontor",
      "label": "Kontor och reception",
      "level": "grund",
      "count": 10
    },
    {
      "id": "bostad",
      "label": "Bostadsområden",
      "level": "grund",
      "count": 8
    },
    {
      "id": "industri",
      "label": "Industri och rondering",
      "level": "grund",
      "count": 8
    },
    {
      "id": "event",
      "label": "Arenor och event",
      "level": "grund",
      "count": 11
    },
    {
      "id": "juridik",
      "label": "Juridik och befogenheter",
      "level": "grund",
      "count": 6
    },
    {
      "id": "brand_nodlage",
      "label": "Brand och nödläge",
      "level": "grund",
      "count": 4
    },
    {
      "id": "vardetransport",
      "label": "Värdetransport",
      "level": "fordjupning",
      "count": 12
    },
    {
      "id": "larmcentral",
      "label": "Larmcentral",
      "level": "fordjupning",
      "count": 12
    },
    {
      "id": "butikskontroll_civil",
      "label": "Civil butikskontroll",
      "level": "grund",
      "count": 10
    },
    {
      "id": "krog_nattliv",
      "label": "Krog och nattliv",
      "level": "grund",
      "count": 12
    },
    {
      "id": "skola",
      "label": "Skola",
      "level": "grund",
      "count": 10
    },
    {
      "id": "hotell",
      "label": "Hotell",
      "level": "grund",
      "count": 10
    },
    {
      "id": "parkering",
      "label": "Parkeringshus och garage",
      "level": "grund",
      "count": 8
    },
    {
      "id": "hundforare",
      "label": "Hundförare",
      "level": "fordjupning",
      "count": 6
    },
    {
      "id": "byggarbetsplats",
      "label": "Byggarbetsplats",
      "level": "grund",
      "count": 8
    },
    {
      "id": "roller_befogenheter",
      "label": "Roller och befogenheter",
      "level": "grund",
      "count": 10
    },
    {
      "id": "vu2_juridik",
      "label": "Juridiska gränsfall (VU2)",
      "level": "fordjupning",
      "count": 20
    },
    {
      "id": "social_manipulation",
      "label": "Social manipulation",
      "level": "fordjupning",
      "count": 10
    },
    {
      "id": "kamera_it_sekretess",
      "label": "Kamera, IT och sekretess",
      "level": "fordjupning",
      "count": 10
    },
    {
      "id": "arbetsmiljo_sakerhet",
      "label": "Arbetsmiljö och egen säkerhet",
      "level": "fordjupning",
      "count": 12
    },
    {
      "id": "konflikt_deeskalering",
      "label": "Konflikt och deeskalering",
      "level": "fordjupning",
      "count": 14
    },
    {
      "id": "sjukvard_fordjupning",
      "label": "Akutsjukvård – fördjupning",
      "level": "fordjupning",
      "count": 12
    },
    {
      "id": "brand_fordjupning",
      "label": "Brand – fördjupning",
      "level": "fordjupning",
      "count": 10
    },
    {
      "id": "felsokning",
      "label": "Felsökning – hitta felet",
      "level": "fordjupning",
      "count": 14
    }
  ],
  "scenarios": [
    {
      "id": 1,
      "category": "butik",
      "categoryLabel": "Butik och handel",
      "level": "grund",
      "source": "v1",
      "title": "Intaget är gjort – men inte brottet",
      "scenario": "Du arbetar som butikskontrollant och ser en kund stoppa en parfym innanför jackan. Personen står fortfarande kvar inne bland hyllorna. Vad gör du?",
      "options": [
        "Griper personen direkt – du såg ju intaget med egna ögon.",
        "Går fram och ber personen lägga tillbaka varan.",
        "Fortsätter diskret observation tills personen passerat sista betalningsmöjligheten.",
        "Ringer polisen och pekar ut personen på avstånd."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Brottet är fullbordat först när personen passerar sista betalningsmöjligheten utan att betala. Griper du för tidigt kan personen hävda betalningsavsikt – och du riskerar att göra dig skyldig till olaga frihetsberövande. Håll oavbruten uppsikt fram till gripandet.",
      "tags": [
        "envarsgripande"
      ]
    },
    {
      "id": 2,
      "category": "butik",
      "categoryLabel": "Butik och handel",
      "level": "grund",
      "source": "v1",
      "title": "Personen ångrar sig",
      "scenario": "Du observerar en kund som stoppat ett par hörlurar i fickan. Innan kassan tar personen upp hörlurarna och ställer tillbaka dem på hyllan. Vad gör du?",
      "options": [
        "Ingen åtgärd – inget fullbordat brott har skett. Du kan notera händelsen och hålla diskret uppsikt.",
        "Griper personen för stöldförsök.",
        "Stoppar personen i kassan och kräver en förklaring.",
        "Meddelar personalen att personen ska portas från butiken."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "När varan återlämnas före sista betalningsmöjligheten finns inget fullbordat tillgreppsbrott att ingripa mot. Fortsatt diskret observation är rätt nivå.",
      "tags": [
        "envarsgripande"
      ]
    },
    {
      "id": 3,
      "category": "butik",
      "categoryLabel": "Butik och handel",
      "level": "grund",
      "source": "v1",
      "title": "Du tappade uppsikten",
      "scenario": "Du såg en person stoppa en tröja i sin väska, men tappade sedan bort personen i några minuter bland klädställen. Nu passerar personen kassalinjen. Vad gör du?",
      "options": [
        "Griper – du såg ju intaget tidigare.",
        "Griper, men ber om ursäkt om väskan visar sig vara tom.",
        "Kräver att personen öppnar väskan innan hen lämnar butiken.",
        "Avstår från gripande. Utan oavbruten uppsikt kan varan ha lagts tillbaka – du dokumenterar och rapporterar i stället."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Grundregeln för butikskontroll är säkra, kontinuerliga iakttagelser: se intaget, vet var varan finns och ha oavbruten uppsikt fram till sista betalningsmöjligheten. Brister det – grip inte. Ett felaktigt gripande kan vara brottsligt (olaga frihetsberövande) och skadar både dig och uppdragsgivaren.",
      "tags": [
        "envarsgripande"
      ]
    },
    {
      "id": 4,
      "category": "butik",
      "categoryLabel": "Butik och handel",
      "level": "grund",
      "source": "v1",
      "title": "Larmbågen tjuter",
      "scenario": "Larmbågarna vid utgången börjar pipa när en kund passerar. Du har inte gjort någon egen iakttagelse av något tillgrepp. Vad gör du?",
      "options": [
        "Griper personen – larmet är bevis nog.",
        "Ber vänligt personen om en frivillig kontroll av kvitto och varor, och förklarar att larm ibland är tekniska fel.",
        "Låser dörren tills personen visar kvitto.",
        "Följer efter personen ut och antecknar registreringsnumret på bilen."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Ett larmpip är inte \"bar gärning\" och ger ingen rätt att gripa eller hålla kvar. Kontrollen bygger helt på frivillighet. Vägrar personen får hen gå – dokumentera och rapportera.",
      "tags": [
        "envarsgripande",
        "dokumentation"
      ]
    },
    {
      "id": 5,
      "category": "butik",
      "categoryLabel": "Butik och handel",
      "level": "grund",
      "source": "v1",
      "title": "Våldsamt motstånd vid gripandet",
      "scenario": "Du har korrekt gripit en person för ringa stöld efter kassalinjen. Personen börjar slita, sparka och försöka komma loss. Vad gör du?",
      "options": [
        "Släpper direkt – väktare får aldrig använda våld.",
        "Använder så mycket våld som krävs för att personen ska \"lära sig\".",
        "Använder försvarligt våld för att genomföra gripandet, påkallar hjälp och trappar ned så fort motståndet upphör.",
        "Brottar ned personen och sätter dig på hen tills polisen kommer."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Vid ett lagligt gripande har du laga befogenhet att använda försvarligt våld om personen gör motstånd (polislagen 29 § jämförd med 10 §). Våldet ska vara nödvändigt och proportionerligt, avbrytas när motståndet upphör – och alltid dokumenteras i din rapport.",
      "tags": [
        "envarsgripande",
        "laga_befogenhet",
        "dokumentation"
      ]
    },
    {
      "id": 6,
      "category": "butik",
      "categoryLabel": "Butik och handel",
      "level": "grund",
      "source": "v1",
      "title": "Var är stöldgodset?",
      "scenario": "Du har gripit en person för stöld. Personen vägrar visa vad som finns i jackfickorna. Får du söka igenom fickorna efter stöldgodset?",
      "options": [
        "Ja, den som griper får alltid visitera.",
        "Nej. Du får endast göra en skyddsvisitation efter vapen och farliga föremål. Godset får polisen söka efter – be personen lämna fram det frivilligt i väntan på polis.",
        "Ja, men bara ytterkläderna.",
        "Nej, och du får inte heller ta emot godset om personen lämnar fram det."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Skyddsvisitationen (polislagen 29 § jämförd med 19 §) är enbart till för din och andras säkerhet. Att leta efter gods är en kroppsvisitation som kräver polis. Lämnar personen godset frivilligt, eller påträffas det vid gripandet, får du ta det i beslag (RB 27 kap. 4 §) och överlämna till polisen.",
      "tags": [
        "envarsgripande",
        "laga_befogenhet",
        "visitation"
      ]
    },
    {
      "id": 7,
      "category": "butik",
      "categoryLabel": "Butik och handel",
      "level": "grund",
      "source": "v1",
      "title": "Snattaren är 13 år",
      "scenario": "Du griper en person på bar gärning efter kassalinjen – och inser att det är ett barn på cirka 13 år. Vad gäller?",
      "options": [
        "Släpp direkt – barn under 15 får aldrig gripas.",
        "Ring föräldrarna och låt barnet gå när de lovar att prata med barnet.",
        "Håll kvar barnet tills en förälder kommer och hämtar det.",
        "Gripandet är tillåtet enligt LUL 35 § – överlämna barnet skyndsamt till polisen, som kontaktar vårdnadshavare och socialtjänst."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Barn under 15 år kan inte straffas, men får gripas av envar på bar gärning om fängelse kan följa på brottet (LUL 35 §). Barnet ska skyndsamt överlämnas till polis – det är polisens uppgift, inte din, att kontakta vårdnadshavare och socialtjänst. Behandla barnet extra varsamt.",
      "tags": [
        "envarsgripande",
        "unga",
        "roller"
      ]
    },
    {
      "id": 8,
      "category": "butik",
      "categoryLabel": "Butik och handel",
      "level": "grund",
      "source": "v1",
      "title": "Flyende fot",
      "scenario": "En person med stulna varor upptäcker att du sett hen och springer ut genom entrén, rakt mot en trafikerad gata. Vad gör du?",
      "options": [
        "Du får förfölja och gripa på flyende fot – men avbryter om förföljandet blir farligt för dig, personen eller allmänheten. Hellre tappa godset än orsaka en allvarlig skada.",
        "Du måste avbryta direkt – rätten att gripa upphör vid butiksdörren.",
        "Du tacklar personen i farten oavsett omgivning.",
        "Du ropar \"Stanna, polis!\" för att få personen att stanna."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Envarsgripande gäller även på flyende fot (RB 24 kap. 7 §). Men proportionalitetsprincipen gäller alltid: väg brottets allvar mot riskerna. Att utge sig för att vara polis (alternativ D) är dessutom brottsligt (föregivande av allmän ställning).",
      "tags": [
        "envarsgripande",
        "proportionalitet"
      ]
    },
    {
      "id": 9,
      "category": "butik",
      "categoryLabel": "Butik och handel",
      "level": "grund",
      "source": "v1",
      "title": "Chefen vill visitera personalen",
      "scenario": "Butikschefen misstänker internt svinn och ber dig visitera alla anställdas väskor när de går hem i kväll. Vad svarar du?",
      "options": [
        "Ja, chefen bestämmer på sin arbetsplats.",
        "Ja, men bara de anställda som verkar nervösa.",
        "Nej. Du saknar befogenhet att tvångsvisitera. Kontroller av anställda kräver frivillighet och stöd i avtal – hänvisa frågan till din arbetsledning och vid konkret brottsmisstanke till polisen.",
        "Nej, men du kan göra det i smyg när de bytt om."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Väktare har aldrig rätt att genomföra tvångsvisitationer. Utpasseringskontroller på arbetsplatser bygger på frivillighet, ofta reglerat i kollektivavtal, och hanteras av arbetsgivaren. Din roll är att rapportera – inte att improvisera befogenheter.",
      "tags": [
        "visitation",
        "dokumentation"
      ]
    },
    {
      "id": 10,
      "category": "butik",
      "categoryLabel": "Butik och handel",
      "level": "grund",
      "source": "v1",
      "title": "Anställd stjäl ur kassan",
      "scenario": "Via butikens kameraövervakning ser du i realtid hur en anställd stoppar sedlar ur kassan i fickan. Vad gör du?",
      "options": [
        "Väntar till arbetsdagens slut och konfronterar personen på tu man hand.",
        "Detta är bar gärning – informera omgående ansvarig chef enligt din instruktion, larma polis och grip om det kan ske säkert och lämpligt.",
        "Ingenting – anställda omfattas inte av din bevakningsuppgift.",
        "Raderar inspelningen för att inte skapa dålig stämning."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Stöld har fängelse i straffskalan och du ser brottet på bar gärning – envarsgripande är möjligt. Interna ärenden är dock känsliga: samordna med butiksledningen enligt uppdragsinstruktionen och säkra kamerabevisningen till polisen.",
      "tags": [
        "envarsgripande",
        "kamerabevakning"
      ]
    },
    {
      "id": 11,
      "category": "butik",
      "categoryLabel": "Butik och handel",
      "level": "grund",
      "source": "v1",
      "title": "Väskan förblir stängd",
      "scenario": "Du har gripit en person och misstänker att stöldgodset ligger i personens axelväska. Personen vägrar öppna den. Vad gör du?",
      "options": [
        "Rycker väskan till dig och öppnar den – godset är butikens egendom.",
        "Släpper personen men behåller väskan.",
        "Hotar med hårdare tag om väskan inte öppnas.",
        "Låter väskan vara, håller personen gripen under uppsikt och inväntar polisen som har rätt att visitera."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Du får inte genomsöka väskan mot personens vilja – det är en kroppsvisitation som endast polisen får besluta om. Gripandet består, och polisen löser visitationen när de anländer.",
      "tags": [
        "envarsgripande",
        "visitation"
      ]
    },
    {
      "id": 12,
      "category": "butik",
      "categoryLabel": "Butik och handel",
      "level": "grund",
      "source": "v1",
      "title": "\"Rör mig och jag anmäler dig!\"",
      "scenario": "Under ett korrekt gripande skriker personen att hen kommer att anmäla dig för misshandel om du rör hen. Vad gör du?",
      "options": [
        "Fortsätter lugnt och korrekt: förklarar att personen är gripen enligt lag för stöld, att polis är tillkallad, och dokumenterar allt noggrant efteråt.",
        "Släpper personen – en anmälan är inte värd besväret.",
        "Höjer rösten och förklarar vem som bestämmer.",
        "Filmar personen med din privata mobil som motbevis."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Ett lagligt envarsgripande påverkas inte av hot om anmälan. Ditt skydd är korrekt agerande, lugnt bemötande och en saklig, detaljerad rapport. Vittnen och butikens kameror stödjer din version.",
      "tags": [
        "envarsgripande",
        "dokumentation",
        "bemotande"
      ]
    },
    {
      "id": 13,
      "category": "butik",
      "categoryLabel": "Butik och handel",
      "level": "grund",
      "source": "v1",
      "title": "Den glömska damen",
      "scenario": "En äldre dam passerar kassan och betalar sina varor – men i rullatorkorgen ligger ett paket kaffe som hon inte tagit upp. Hon verkar helt obekymrad. Vad gör du?",
      "options": [
        "Griper henne – reglerna är lika för alla.",
        "Tar vänlig kontakt, uppmärksammar henne på varan och ger henne möjlighet att betala.",
        "Låter det passera men fotograferar henne till butikens \"svarta lista\".",
        "Ringer polisen och rapporterar en stöld."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Stöld kräver uppsåt. När omständigheterna talar för glömska eller misstag är ett vänligt tillrättaläggande rätt åtgärd – både juridiskt och för butikens förtroende. Gripanden vid oklart uppsåt är riskabla.",
      "tags": [
        "envarsgripande"
      ]
    },
    {
      "id": 14,
      "category": "butik",
      "categoryLabel": "Butik och handel",
      "level": "grund",
      "source": "v1",
      "title": "Två som samarbetar",
      "scenario": "Du ser två personer arbeta ihop: den ena distraherar personalen medan den andra fyller en preparerad väska med varor och går mot kassalinjen. Vad gör du?",
      "options": [
        "Griper båda samtidigt på egen hand.",
        "Ställer dig i vägen vid utgången och konfronterar dem.",
        "Släpper fokus på den som distraherar – hen har inte tagit något.",
        "Larmar polis tidigt, försöker få stöd av en kollega, och griper efter sista betalningsmöjligheten endast om styrkeförhållandena gör det säkert. Annars: signalement, dokumentation och polis."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Två gärningspersoner mot en väktare är ett riskläge. Din säkerhet går före godset. Notera att även den som distraherar kan vara straffbar (medhjälp) – dokumentera bådas signalement åt polisen.",
      "tags": [
        "dokumentation"
      ]
    },
    {
      "id": 15,
      "category": "butik",
      "categoryLabel": "Butik och handel",
      "level": "grund",
      "source": "v1",
      "title": "Toalettbesöket",
      "scenario": "En person du gripit ber att få gå på toaletten medan ni väntar på polisen. Vad gör du?",
      "options": [
        "Självklart – grundläggande behov går först.",
        "Nej, och du behöver inte förklara varför.",
        "Förklarar vänligt att personen behöver vänta tills polisen kommer, eftersom du måste hålla hen under ständig uppsikt. Vid akut behov löses det med bibehållen uppsikt enligt butikens rutin.",
        "Följer med in på toaletten och visiterar efteråt."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Ett toalettbesök är ett klassiskt sätt att göra sig av med gods eller avvika. Den gripne hålls under uppsikt tills polisen tar över – men bemötandet ska vara respektfullt och rimliga behov hanteras utan att uppsikten bryts.",
      "tags": [
        "envarsgripande",
        "bemotande"
      ]
    },
    {
      "id": 16,
      "category": "butik",
      "categoryLabel": "Butik och handel",
      "level": "grund",
      "source": "v1",
      "title": "Polisen dröjer",
      "scenario": "Polisen meddelar per telefon att de har lång framkörningstid. De ber er anteckna de personuppgifter personen frivilligt lämnar, dokumentera händelsen och därefter släppa personen – ärendet tas som anmälan. Vad gör du?",
      "options": [
        "Följer polisens anvisning: dokumenterar, antecknar det personen frivilligt uppger och släpper personen.",
        "Vägrar – ett gripande får bara avslutas genom att polis kommer till platsen.",
        "Kör själv personen till polisstationen.",
        "Håller kvar personen tills polis kommer, oavsett hur länge det dröjer."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Gripandet sker för att personen ska överlämnas till polis. När polisen ger besked om annan hantering följer du det – frihetsberövandet ska inte pågå längre än nödvändigt. Du kan aldrig tvinga fram legitimation, men får notera det som lämnas frivilligt.",
      "tags": [
        "envarsgripande",
        "dokumentation",
        "id_kontroll"
      ]
    },
    {
      "id": 17,
      "category": "butik",
      "categoryLabel": "Butik och handel",
      "level": "grund",
      "source": "v1",
      "title": "Du blir filmad",
      "scenario": "Under ett gripande ställer sig en åskådare nära och filmar dig med mobilen, tydligt irriterad över ditt ingripande. Vad gör du?",
      "options": [
        "Beslagtar mobilen som bevismaterial.",
        "Kräver att filmen raderas innan personen får gå.",
        "Håller upp handen framför kameran och skäller ut personen.",
        "Fortsätter arbeta professionellt. Filmning är tillåten – be endast personen hålla säkert avstånd om hen stör ingripandet."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Det är tillåtet att filma på plats dit allmänheten har tillträde, och du har ingen rätt att ta någons mobil eller kräva radering. Ett korrekt utfört ingripande tål att filmas – agera som om kameran alltid är på.",
      "tags": [
        "envarsgripande",
        "kamerabevakning"
      ]
    },
    {
      "id": 18,
      "category": "butik",
      "categoryLabel": "Butik och handel",
      "level": "grund",
      "source": "v1",
      "title": "Efter ingripandet",
      "scenario": "Polisen har hämtat den gripne och situationen är över. Vad är din viktigaste åtgärd nu?",
      "options": [
        "Ta rast – du har förtjänat den.",
        "Skriva en ingriparapport under samma arbetspass: tid, plats, iakttagelser steg för steg, eventuell våldsanvändning, vittnen och överlämnandet till polis.",
        "Berätta detaljerna i personalrummet så alla vet vad som hänt.",
        "Lägga ut en anonymiserad beskrivning i väktarnas Facebookgrupp."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Dokumentationen är ditt viktigaste skydd och en central del av tjänsten. Skriv sakligt, kronologiskt och medan minnet är färskt. Detaljer till utomstående stoppas av tystnadsplikten.",
      "tags": [
        "envarsgripande",
        "tystnadsplikt"
      ]
    },
    {
      "id": 19,
      "category": "kopcentrum",
      "categoryLabel": "Köpcentrum och gallerior",
      "level": "grund",
      "source": "v1",
      "title": "Den sovande mannen",
      "scenario": "En kraftigt berusad man har somnat på en bänk mitt i gallerian. Besökare tittar snett. Vad gör du?",
      "options": [
        "Bär ut honom till gatan tillsammans med en kollega.",
        "Omhändertar honom enligt LOB och låser in honom i personalutrymmet tills han nyktrat till.",
        "Väcker honom varsamt, bedömer om han behöver vård, och ber honom lämna platsen på uppdragsgivarens vägnar. Kan han inte ta hand om sig själv – kontakta polis.",
        "Låter honom sova – han stör ju ingen aktivt."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Väktare har ingen befogenhet att omhänderta berusade (LOB gäller endast polis och ordningsvakt) och får inte bära ut någon med tvång. Börja med hälsobedömningen: en \"berusad\" kan vara sjuk eller nedkyld. Vid behov är polisen rätt instans.",
      "tags": [
        "roller",
        "sjukvard"
      ]
    },
    {
      "id": 20,
      "category": "kopcentrum",
      "categoryLabel": "Köpcentrum och gallerior",
      "level": "grund",
      "source": "v1",
      "title": "Skateboardgänget",
      "scenario": "Ett gäng ungdomar åker skateboard genom gallerian och besökare tvingas hoppa undan. Vad gör du?",
      "options": [
        "Tar en lugn, vänlig kontakt: förklarar ordningsreglerna, ber dem sluta och hänvisar dem till lämplig plats.",
        "Beslagtar brädorna tills de lämnar centrumet.",
        "Ringer polisen direkt utan att först prata med dem.",
        "Ignorerar dem – ungdomar ska få vara ungdomar."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Dialog och tydliga, vänliga tillsägelser utifrån centrumets ordningsregler löser de flesta situationer och bygger trygghet. Du får inte beslagta egendom. Först vid brott, hot eller upprepad vägran eskalerar du enligt instruktion – och då kan polis bli aktuellt.",
      "tags": [
        "beslag",
        "bemotande"
      ]
    },
    {
      "id": 21,
      "category": "kopcentrum",
      "categoryLabel": "Köpcentrum och gallerior",
      "level": "grund",
      "source": "v1",
      "title": "Det borttappade barnet",
      "scenario": "Ett gråtande barn, cirka 4 år, går ensamt omkring och letar efter sin mamma. Vad gör du?",
      "options": [
        "Visar barnet till utgången så föräldern lättare hittar det.",
        "Tar hand om barnet på en synlig, trygg plats, tillkallar en kollega som stöd, kontaktar centrumledningen för utrop – och kopplar in polisen om vårdnadshavaren inte hittas inom kort.",
        "Frågar runt bland besökare om någon kan tänka sig att passa barnet.",
        "Lämnar barnet i en leksaksbutik och fortsätter ronden."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Barnet får aldrig lämnas ensamt eller överlämnas till någon okänd. Stanna på en öppen, synlig plats och arbeta gärna två – det skyddar både barnet och dig. Polisen kopplas in om situationen drar ut på tiden.",
      "tags": [
        "allmant"
      ]
    },
    {
      "id": 22,
      "category": "kopcentrum",
      "categoryLabel": "Köpcentrum och gallerior",
      "level": "grund",
      "source": "v1",
      "title": "Blottaren",
      "scenario": "En man blottar sig för besökare vid en av gallerians sittgrupper. Flera personer reagerar med obehag. Vad gör du?",
      "options": [
        "Tittar bort – det är en fråga för polisen, inte för dig.",
        "Fotograferar mannen och publicerar bilden i centrumets varningsgrupp.",
        "Ber honom vänligt gå hem och byta om.",
        "Larmar polis, och griper på bar gärning om det kan ske säkert – sexuellt ofredande har fängelse i straffskalan. Säkra vittnesuppgifter."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Sexuellt ofredande är ett brott med fängelse i straffskalan, vilket ger rätt till envarsgripande på bar gärning. Gör alltid en säkerhetsbedömning först; kan du inte gripa säkert – följ på avstånd, notera signalement och led polisen rätt.",
      "tags": [
        "envarsgripande"
      ]
    },
    {
      "id": 23,
      "category": "kopcentrum",
      "categoryLabel": "Köpcentrum och gallerior",
      "level": "grund",
      "source": "v1",
      "title": "Flygbladsutdelaren",
      "scenario": "En person delar ut flygblad inne i gallerian utan tillstånd från centrumledningen. Vad gör du?",
      "options": [
        "Informerar vänligt om att utdelning kräver tillstånd, ber personen sluta eller lämna, och kontaktar centrumledningen vid diskussion. Polis endast om personen vägrar och situationen eskalerar.",
        "Samlar in och slänger alla flygblad personen redan delat ut.",
        "Griper personen för olovlig marknadsföring.",
        "Låter det pågå – yttrandefriheten gäller överallt."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Gallerian är privat mark och ägaren bestämmer reglerna, men du saknar tvångsmedel: din väg är information, uppmaning och rapportering. Att dela ut flygblad är inget brott du kan gripa för, och du får inte beslagta materialet.",
      "tags": [
        "envarsgripande",
        "beslag",
        "dokumentation"
      ]
    },
    {
      "id": 24,
      "category": "kopcentrum",
      "categoryLabel": "Köpcentrum och gallerior",
      "level": "grund",
      "source": "v1",
      "title": "Tillträdesförbudet",
      "scenario": "En man kommer in i en butik trots att åklagare har beslutat om tillträdesförbud till butiken för honom. Butikschefen känner igen honom direkt och larmar dig. Vad gör du?",
      "options": [
        "Du kan bara be honom gå – förbudet är en sak mellan honom och åklagaren.",
        "Du väntar tills han stjäl något, för först då finns ett brott.",
        "Kontaktar polis omgående. Att bryta mot ett beslutat tillträdesförbud är ett brott med fängelse i straffskalan – envarsgripande på bar gärning är möjligt om det kan ske säkert.",
        "Låser dörren så att han inte kan lämna butiken."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Överträdelse av tillträdesförbud enligt lagen om tillträdesförbud till butik är straffbart med böter eller fängelse – själva inträdet är alltså bar gärning. Agera enligt uppdragsinstruktionen: larma polis, dokumentera och grip endast om det kan ske säkert.",
      "tags": [
        "envarsgripande",
        "dokumentation",
        "larm"
      ]
    },
    {
      "id": 25,
      "category": "kopcentrum",
      "categoryLabel": "Köpcentrum och gallerior",
      "level": "grund",
      "source": "v1",
      "title": "Butikens eget \"förbud\"",
      "scenario": "En kvinna som butiken själv har \"portat\" (utan något beslut från åklagare) kommer in i lokalen. Hon uppträder lugnt. Vad gör du?",
      "options": [
        "Griper henne – portning är portning.",
        "Informerar henne om att hon inte är välkommen och ber henne lämna butiken. Vägrar hon, kontaktar du polis. Något envarsgripande blir inte aktuellt enbart för besöket.",
        "Knuffar ut henne genom entrén.",
        "Ignorerar det – butiken kan inte porta någon."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "En informell portning från butiken är inte samma sak som ett beslutat tillträdesförbud. Enbart besöket är då normalt inget brott du kan gripa för. Din väg är uppmaning på uppdragsgivarens vägnar och polis vid vägran. Jämför med scenario 24 – skillnaden är själva åklagarbeslutet.",
      "tags": [
        "envarsgripande",
        "bemotande"
      ]
    },
    {
      "id": 26,
      "category": "kopcentrum",
      "categoryLabel": "Köpcentrum och gallerior",
      "level": "grund",
      "source": "v1",
      "title": "Den kvarlämnade väskan",
      "scenario": "En ryggsäck står ensam utanför en butik. Ingen ägare syns till, och när du tittar närmare sticker sladdar ut ur en delvis öppen ficka. Vad gör du?",
      "options": [
        "Öppnar väskan för att leta efter ägarens ID.",
        "Bär väskan till hittegodsdisken.",
        "Ropar ut i lokalen och skakar på väskan för att höra vad som finns i den.",
        "Rör inte väskan. Spärra av området, larma ledningscentral och 112, påbörja utrymning av närområdet enligt rutin och undvik att sända med kommunikationsradio eller mobil alldeles intill föremålet."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Kvarglömt bagage hanteras normalt enligt hittegodsrutin – men vid misstänkta omständigheter (sladdar, tejp, aktuell hotbild) gäller: rör inte, spärra av, larma och utrym. Radiosändning nära föremålet undviks som försiktighetsåtgärd.",
      "tags": [
        "brand",
        "hittegods",
        "larm"
      ]
    },
    {
      "id": 27,
      "category": "kopcentrum",
      "categoryLabel": "Köpcentrum och gallerior",
      "level": "grund",
      "source": "v1",
      "title": "Trängseln vid rean",
      "scenario": "Vid en stor rea trycker en växande folkmassa på mot entrédörrarna. Personer längst fram börjar klämmas mot glaset. Vad gör du?",
      "options": [
        "Agerar direkt mot orsaken: stoppa eller styr om inflödet, öppna fler dörrar/utrymningsvägar, larma centrumledningen och begär utrop – och 112 om personer riskerar att skadas.",
        "Ställer dig längst fram och håller emot folkmassan.",
        "Väntar på instruktion från din arbetsledare innan du gör något.",
        "Ropar åt folk att skärpa sig."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Vid trängselolyckor är det trycket bakifrån som dödar – lösningen är att minska inflödet och öppna fler vägar ut, inte att hålla emot. Detta är ett akutläge där du agerar omedelbart och eskalerar samtidigt.",
      "tags": [
        "allmant"
      ]
    },
    {
      "id": 28,
      "category": "lager",
      "categoryLabel": "Lager och logistik",
      "level": "grund",
      "source": "v1",
      "title": "Den oanmälda chauffören",
      "scenario": "En lastbilschaufför utan föranmälan vill in på logistikområdet för att \"hämta en pall åt en kund\". Han verkar stressad och trycker på. Vad gör du?",
      "options": [
        "Släpper in honom – transporter är ju områdets kärnverksamhet.",
        "Släpper in honom om han visar körkort.",
        "Nekar tillträde tills bokningen verifierats med godsmottagningen eller din kontaktperson. Dokumentera besöket – oavsett utfall.",
        "Ber honom vänta och glömmer sedan bort saken."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Inpasseringskontrollens hela poäng är att ingen kommer in utan verifierad behörighet. Stress och tidspress är klassiska påtryckningsmetoder – rutinen gäller alla, alltid.",
      "tags": [
        "allmant"
      ]
    },
    {
      "id": 29,
      "category": "lager",
      "categoryLabel": "Lager och logistik",
      "level": "grund",
      "source": "v1",
      "title": "Utpasseringskontrollen",
      "scenario": "Du genomför slumpvisa utpasseringskontroller enligt avtalet med uppdragsgivaren. En anställd vägrar visa innehållet i sin väska. Vad gör du?",
      "options": [
        "Håller kvar personen tills väskan öppnats.",
        "Konstaterar lugnt att kontrollen är frivillig, noterar händelsen och rapporterar enligt rutin till arbetsledningen/uppdragsgivaren. Inget tvång används.",
        "Tar väskan ifrån personen och tittar själv.",
        "Hotar med polisanmälan om väskan inte öppnas."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Utpasseringskontroller bygger på frivillighet och regleras i avtal mellan arbetsgivare och anställda. En vägran är en arbetsgivarfråga som du rapporterar – inte något du löser med tvång. Endast vid en säker iakttagelse av stöld på bar gärning gäller andra regler.",
      "tags": [
        "envarsgripande",
        "dokumentation"
      ]
    },
    {
      "id": 30,
      "category": "lager",
      "categoryLabel": "Lager och logistik",
      "level": "grund",
      "source": "v1",
      "title": "Hålet i stängslet",
      "scenario": "Under rondering upptäcker du ett uppklippt hål i områdets yttre stängsel. Vad gör du?",
      "options": [
        "Lagar hålet provisoriskt och fortsätter ronden.",
        "Kryper igenom hålet för att se vart spåren leder.",
        "Noterar det i rapporten som du lämnar vid passets slut.",
        "Rapporterar omgående till ledningscentralen, dokumenterar med foto, kontrollerar försiktigt om intrång kan pågå och bevakar platsen enligt de besked du får."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Ett uppklippt stängsel kan betyda att någon är kvar inne på området. Omedelbar rapport, dokumentation och försiktig kontroll är rätt ordning – och beredskap för att polis kan behöva larmas.",
      "tags": [
        "dokumentation",
        "larm"
      ]
    },
    {
      "id": 31,
      "category": "lager",
      "categoryLabel": "Lager och logistik",
      "level": "grund",
      "source": "v1",
      "title": "Porten som ska vara låst",
      "scenario": "Klockan 02 finner du en lastport olåst och på glänt – den ska enligt instruktionen vara låst sedan 18. Vad gör du?",
      "options": [
        "Kontrollerar utsidan efter brytmärken, kontaktar ledningscentralen och går inte in ensam om något tyder på pågående inbrott – invänta polis eller kollega enligt instruktion.",
        "Går rakt in och tänder alla lampor för att visa att du är där.",
        "Låser porten och antar att personalen slarvat.",
        "Ropar in i mörkret att du är väktare och beväpnad."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "En avvikelse i skalskyddet nattetid hanteras som ett möjligt pågående inbrott tills motsatsen bevisats. Din egen säkerhet går först – och att aldrig bluffa om beväpning är en självklarhet.",
      "tags": [
        "allmant"
      ]
    },
    {
      "id": 32,
      "category": "lager",
      "categoryLabel": "Lager och logistik",
      "level": "grund",
      "source": "v1",
      "title": "Ficklampsskenet",
      "scenario": "Inne på lagret ser du under ronden ett ficklampssken och hör röster mellan hyllraderna. Ingen ska vara där. Vad gör du?",
      "options": [
        "Smyger fram och överraskar dem för att gripa på bar gärning.",
        "Ropar \"Stanna! Väktare!\" och springer mot ljuset.",
        "Drar dig tillbaka till en säker plats, larmar polis via ledningscentralen och observerar utifrån: antal personer, signalement, eventuella fordon och flyktvägar.",
        "Låser alla dörrar så att de inte kan komma ut."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Vid pågående inbrott med okänt antal gärningsmän är du observatör och polisens ögon – inte insatsstyrka. Att låsa in gärningsmän skapar en farlig konfrontationssituation. Bra vittnesuppgifter fäller fler tjuvar än ensamma hjältedåd.",
      "tags": [
        "roller"
      ]
    },
    {
      "id": 33,
      "category": "lager",
      "categoryLabel": "Lager och logistik",
      "level": "grund",
      "source": "v1",
      "title": "Dieselläckan",
      "scenario": "En parkerad truck läcker diesel i en växande pöl nära lastkajen, intill en byggnad. Vad gör du?",
      "options": [
        "Ställer ut en varningskon och fortsätter ronden.",
        "Spärrar av området, säkerställer att inga tändkällor finns i närheten, larmar driftansvarig enligt rutin – och räddningstjänsten om läckan är omfattande. Dokumentera och rapportera.",
        "Spolar bort dieseln med vatten mot närmaste dagvattenbrunn.",
        "Provkör trucken för att se hur mycket som läckt ut."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Bränsleläckage är både brandrisk och miljörisk. Aldrig mot dagvattenbrunn – det är ett miljöbrott. Avspärrning, larmning enligt rutin och dokumentation är väktarens uppgift.",
      "tags": [
        "brand"
      ]
    },
    {
      "id": 34,
      "category": "lager",
      "categoryLabel": "Lager och logistik",
      "level": "grund",
      "source": "v1",
      "title": "Kollit som luktar",
      "scenario": "Vid godsmottagningen upptäcker du ett kolli som läcker vätska och luktar stickande kemiskt. Vad gör du?",
      "options": [
        "Öppnar kollit för att identifiera innehållet.",
        "Flyttar kollit utomhus så lukten vädras ut.",
        "Torkar upp vätskan med papper och slänger i soporna.",
        "Rör inte kollit. Utrym närområdet, larma 112 och driftansvarig, håll människor på avstånd och möt räddningstjänsten med den information du har (märkning, fraktsedel på avstånd)."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Okända kemikalier hanteras som farliga tills experter sagt annat. Att flytta eller öppna kollit kan förvärra läget och skada dig. Utrymning, larmning och information till räddningstjänsten är rätt insats.",
      "tags": [
        "brand"
      ]
    },
    {
      "id": 35,
      "category": "lager",
      "categoryLabel": "Lager och logistik",
      "level": "grund",
      "source": "v1",
      "title": "Mutförsöket",
      "scenario": "En lageranställd kommer fram i fikarummet: \"Om du 'missar' en pall vid utfarten på fredag delar vi på förtjänsten.\" Vad gör du?",
      "options": [
        "Avböjer bestämt och rapporterar omgående händelsen till din arbetsledning.",
        "Skrattar bort det och låtsas som ingenting.",
        "Låtsas gå med på det för att samla egna bevis under några veckor.",
        "Konfronterar personen högljutt inför kollegorna."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Detta är ett mutförsök och en planerad stöld. Din trovärdighet är din viktigaste tillgång – rapportera direkt till arbetsledningen, som avgör fortsatt hantering tillsammans med uppdragsgivaren och eventuellt polisen. Egna infiltrationsprojekt är inte din uppgift.",
      "tags": [
        "dokumentation"
      ]
    },
    {
      "id": 36,
      "category": "kollektivtrafik",
      "categoryLabel": "Kollektivtrafik",
      "level": "grund",
      "source": "v1",
      "title": "Personen på spåret",
      "scenario": "Du ser en person klättra ner på spårområdet på en tunnelbanestation. Vad gör du?",
      "options": [
        "Hoppar ner och lyfter upp personen.",
        "Larmar omedelbart trafikledningen via ledningscentral/nödtelefon så att trafiken stoppas, ropar åt personen att ta sig till plattformskanten och larmar 112 vid behov. Du går inte själv ner medan trafik kan passera.",
        "Ropar åt personen och väntar sedan på att hen ska klättra upp själv.",
        "Filmar händelsen som bevis för din rapport."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Första åtgärden är alltid att få trafiken stoppad – ett tåg går inte att förhandla med. Först när det är bekräftat säkert kan fysisk hjälp bli aktuell. Två offer är alltid sämre än ett.",
      "tags": [
        "allmant"
      ]
    },
    {
      "id": 37,
      "category": "kollektivtrafik",
      "categoryLabel": "Kollektivtrafik",
      "level": "grund",
      "source": "v1",
      "title": "Sista natt-turen",
      "scenario": "Terminalen stänger och en kraftigt berusad man sover kvar på en bänk. Vad gör du?",
      "options": [
        "Låter honom sova – han fryser inte inomhus.",
        "Bär ut honom med hjälp av en kollega och låser dörren.",
        "Skakar liv i honom och skäller ut honom.",
        "Väcker honom varsamt, kontrollerar att han inte är skadad eller sjuk, förklarar att terminalen stänger och hjälper honom tillrätta. Kan han inte ta hand om sig själv kontaktar du polis – du har ingen egen befogenhet att omhänderta."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Bakom \"berusad\" döljer sig ibland diabetes, skallskada eller nedkylning – hälsokontrollen kommer först. LOB-omhändertagande får endast polis och ordningsvakt göra, och tvång att bära ut någon ingår inte i väktarens verktygslåda.",
      "tags": [
        "roller",
        "sjukvard"
      ]
    },
    {
      "id": 38,
      "category": "kollektivtrafik",
      "categoryLabel": "Kollektivtrafik",
      "level": "grund",
      "source": "v1",
      "title": "Slagsmålet på perrongen",
      "scenario": "Två resenärer börjar slåss på perrongen och knytnävsslag utdelas. Folk står runt omkring. Vad gör du?",
      "options": [
        "Kastar dig in mellan dem direkt.",
        "Ställer dig på säkert avstånd och väntar tills de slagit sig trötta.",
        "Larmar polis via ledningscentralen, försöker avbryta verbalt med tydlig röst, håller tredje man borta – och ingriper fysiskt bara om det krävs för att skydda någon och kan ske utan orimlig risk. Nödvärnsrätten gäller även till förmån för annan.",
        "Sprutar din privata pepparspray mot båda."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Misshandel pågår – larma först. Nödvärn får användas för att hjälpa den angripne (BrB 24 kap. 1 och 5 §§), men bara med försvarligt våld och efter en snabb riskbedömning. Privat pepparspray är dessutom olaglig att bära utan tillstånd.",
      "tags": [
        "envarsgripande",
        "nodvarn",
        "laga_befogenhet"
      ]
    },
    {
      "id": 39,
      "category": "kollektivtrafik",
      "categoryLabel": "Kollektivtrafik",
      "level": "grund",
      "source": "v1",
      "title": "Plankaren",
      "scenario": "En person hoppar över spärren rakt framför dig och försvinner ner mot perrongen. Vad gör du?",
      "options": [
        "Agerar enligt uppdragets instruktion: rapporterar händelsen, informerar trafikföretagets personal/biljettkontrollanter och noterar signalement. Du jagar inte ikapp personen genom folkmassan.",
        "Springer efter och griper – tjuvåkning är ett brott.",
        "Blockerar spärren så inga fler kan passera.",
        "Ropar ut i högtalarna att en plankare är på väg ner."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Tjuvåkning (ringa bedrägeri) har visserligen fängelse i straffskalan, men proportionalitetsprincipen gäller: en jakt genom en fullsatt station riskerar mer skada än nytta för ett bötesbrott. Branschpraxis är rapportering och stöd till kontrollanterna.",
      "tags": [
        "dokumentation",
        "proportionalitet"
      ]
    },
    {
      "id": 40,
      "category": "kollektivtrafik",
      "categoryLabel": "Kollektivtrafik",
      "level": "grund",
      "source": "v1",
      "title": "Kontrollanten behöver hjälp",
      "scenario": "En biljettkontrollant tillkallar dig: en resenär utan giltig biljett vägrar uppge sin identitet och försöker gå därifrån. Vad gör du?",
      "options": [
        "Håller fast resenären tills identiteten är fastställd.",
        "Stannar som stöd och vittne, försöker lugna situationen – men förklarar att varken du eller kontrollanten får hålla kvar personen för identifiering. Kontakta polis och notera signalement om personen avviker.",
        "Tar resenärens plånbok för att läsa ID-kortet.",
        "Låser spärrarna så att ingen kommer ut."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Ingen av er har rätt att kvarhålla någon för att fastställa identitet – det är en polisiär befogenhet. Din närvaro har ändå stort värde: den lugnar, avskräcker och ger polisen bra vittnesuppgifter.",
      "tags": [
        "bemotande"
      ]
    },
    {
      "id": 41,
      "category": "kollektivtrafik",
      "categoryLabel": "Kollektivtrafik",
      "level": "grund",
      "source": "v1",
      "title": "Resväskan på perrongen",
      "scenario": "En resväska står kvarlämnad mitt på perrongen. Ingen ägare syns. Vad gör du?",
      "options": [
        "Öppnar väskan och letar efter namnlapp.",
        "Rullar den direkt till hittegodset.",
        "Ställer den i ett förråd och tar hand om saken efter rusningen.",
        "Följer rutinen: frågar resenärer i närheten, begär utrop och kontaktar ledningscentralen. Vid misstänkta omständigheter behandlas väskan som farligt föremål – rör inte, spärra av, larma."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "De allra flesta kvarglömda väskor är just kvarglömda – men bedömningen görs stegvis och enligt rutin. Tröskeln för att eskalera ska vara låg i kollektivtrafikmiljö.",
      "tags": [
        "allmant"
      ]
    },
    {
      "id": 42,
      "category": "kollektivtrafik",
      "categoryLabel": "Kollektivtrafik",
      "level": "grund",
      "source": "v1",
      "title": "Mannen med kniven",
      "scenario": "En man står på stationen och viftar med en kniv medan han skriker osammanhängande. Ingen är ännu direkt hotad. Vad gör du?",
      "options": [
        "Larmar 112 omedelbart, håller säkert avstånd, leder bort resenärer från platsen, följer mannens rörelser och möter polisen med lägesinformation. Du ingriper inte fysiskt mot en beväpnad person om det inte krävs i en akut nödvärnssituation.",
        "Går fram och ber honom lämna över kniven till dig.",
        "Smyger upp bakifrån och försöker avväpna honom.",
        "Utrymmer hela stationen på eget initiativ innan du larmar."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Mot beväpnade personer är avstånd, larmning och evakuering av allmänheten dina verktyg. Fysiskt ingripande mot kniv är livsfarligt och görs av polis. Din lägesrapportering (position, signalement, beteende) är avgörande för insatsen.",
      "tags": [
        "envarsgripande",
        "dokumentation"
      ]
    },
    {
      "id": 43,
      "category": "kollektivtrafik",
      "categoryLabel": "Kollektivtrafik",
      "level": "grund",
      "source": "v1",
      "title": "Klottraren i gångtunneln",
      "scenario": "Under rondering ser du en ensam person spreja klotter på väggen i en gångtunnel. Vad gör du?",
      "options": [
        "Låtsas inte se – klotter är för bagatellartat för att agera på.",
        "Rycker sprejburken ur handen på personen.",
        "Gör en snabb säkerhetsbedömning: är personen ensam och läget hanterbart får du gripa på bar gärning (skadegörelse har fängelse i straffskalan). Vid osäkerhet: håll avstånd, säkra signalement och larma polis.",
        "Griper alltid, oavsett läge – lagen ger dig ju rätten."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Skadegörelse, även ringa, har fängelse i straffskalan – envarsgripande är alltså möjligt på bar gärning. Men rätten att gripa är aldrig en skyldighet: gärningspersoner kan ha följeslagare i närheten, och sprejburken kan användas mot dina ögon. Bedöm först, agera sedan.",
      "tags": [
        "envarsgripande"
      ]
    },
    {
      "id": 44,
      "category": "kollektivtrafik",
      "categoryLabel": "Kollektivtrafik",
      "level": "grund",
      "source": "v1",
      "title": "Flickan vid plattformskanten",
      "scenario": "En ung kvinna sitter ensam på plattformskanten med benen ut mot spåret. Hon gråter och reagerar inte på omgivningen. Vad gör du?",
      "options": [
        "Ropar åt henne att flytta sig därifrån.",
        "Larmar diskret trafikledningen (stoppa/sänk trafiken) och 112, närmar dig lugnt, presenterar dig med förnamn och inleder ett stillsamt samtal utan att göra utfall. Du lämnar henne inte ensam.",
        "Springer fram och rycker undan henne från kanten.",
        "Håller avstånd och väntar på att någon anhörig ska dyka upp."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Vid misstänkt suicidrisk är ordningen: säkra trafiken, larma, skapa lugn kontakt. Plötsliga rörelser eller rop kan utlösa det du vill förhindra. Stanna kvar tills professionell hjälp tagit över – din närvaro kan vara livsavgörande.",
      "tags": [
        "bemotande",
        "larm"
      ]
    },
    {
      "id": 45,
      "category": "kollektivtrafik",
      "categoryLabel": "Kollektivtrafik",
      "level": "grund",
      "source": "v1",
      "title": "Fallet i rulltrappan",
      "scenario": "En äldre man tappar balansen och faller i den uppåtgående rulltrappan. Han blir liggande och trappan fortsätter röra sig. Vad gör du?",
      "options": [
        "Ropar åt folk längre ner att hjälpa honom.",
        "Försöker lyfta upp honom medan trappan rullar.",
        "Ringer först ledningscentralen och frågar vad du ska göra.",
        "Trycker omedelbart på rulltrappans nödstopp, tar dig till mannen, gör en första bedömning av skadorna och larmar 112 vid behov. Rapportera händelsen efteråt."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Nödstoppet först – en rullande trappa förvärrar skadorna för varje sekund. Därefter L-ABC-bedömning och larmning. Att veta var nödstopp, hjärtstartare och brandsläckare finns på ditt objekt är grundläggande yrkeskunskap.",
      "tags": [
        "brand",
        "sjukvard"
      ]
    },
    {
      "id": 46,
      "category": "sjukhus",
      "categoryLabel": "Sjukhus och vård",
      "level": "grund",
      "source": "v1",
      "title": "Hotet på akuten",
      "scenario": "En patient på akutmottagningen reser sig, skriker och hotar en sjuksköterska. Du är stationerad väktare på sjukhuset. Vad gör du?",
      "options": [
        "Tar dig lugnt till platsen, ställer dig så att personalen kan backa undan, använder lågaffektivt bemötande och sänkt röst – och larmar polis om hoten fortsätter eller eskalerar. Fysiskt ingriper du bara vid ett angrepp (nödvärn) eller vid brott på bar gärning.",
        "Springer fram och trycker ner patienten i britsen.",
        "Väntar utanför tills personalen ropar på dig.",
        "Beordrar patienten att sätta sig annars \"blir det konsekvenser\"."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Sjukhusväktarens främsta verktyg är närvaro, positionering och lågaffektivt bemötande – många hotfulla situationer i vården bottnar i smärta, rädsla eller påverkan. Olaga hot är ett brott, men målet är alltid att trappa ned innan tvång blir aktuellt.",
      "tags": [
        "bemotande"
      ]
    },
    {
      "id": 47,
      "category": "sjukhus",
      "categoryLabel": "Sjukhus och vård",
      "level": "grund",
      "source": "v1",
      "title": "\"Håll fast honom!\"",
      "scenario": "En sjuksköterska ber dig hålla fast en patient som vägrar ta sin medicin, så att hon kan ge en injektion. Vad gör du?",
      "options": [
        "Hjälper till – vårdpersonalen vet bäst.",
        "Håller fast patienten, men bara i armarna.",
        "Avböjer vänligt och förklarar att du saknar befogenhet: tvångsåtgärder i vården kräver lagstöd (t.ex. LPT) och utförs av vårdpersonal. Du kan ingripa endast vid nödvärn eller en akut nödsituation.",
        "Ber sjuksköterskan skriva under ett papper som tar över ansvaret."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Väktare får aldrig utöva vårdtvång – det är strikt reglerat i tvångsvårdslagstiftningen och ligger på vården, ibland med polishandräckning. Din roll är att skydda mot angrepp och brott, inte att medverka i behandling mot någons vilja.",
      "tags": [
        "allmant"
      ]
    },
    {
      "id": 48,
      "category": "sjukhus",
      "categoryLabel": "Sjukhus och vård",
      "level": "grund",
      "source": "v1",
      "title": "Kniven i väntrummet",
      "scenario": "Personal viskar till dig att en man i väntrummet har en kniv synlig i bältet. Han sitter för tillfället lugnt. Vad gör du?",
      "options": [
        "Går fram och drar kniven ur bältet medan han är lugn.",
        "Larmar polis omgående via ledningscentralen, informerar personalen diskret, håller mannen under uppsikt på avstånd och planerar hur väntrummet snabbt kan utrymmas om läget förändras.",
        "Ropar högt att alla ska lämna väntrummet.",
        "Ber mannen visa legitimation och förklara kniven."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "En lugn person med kniv kan bli en farlig person med kniv på en sekund – men ett förhastat ingripande kan vara det som utlöser våldet. Diskret larmning, uppsikt och en utrymningsplan är rätt balans. Avväpning är polisens uppgift.",
      "tags": [
        "envarsgripande",
        "brand",
        "roller"
      ]
    },
    {
      "id": 49,
      "category": "sjukhus",
      "categoryLabel": "Sjukhus och vård",
      "level": "grund",
      "source": "v1",
      "title": "Besökaren som inte går",
      "scenario": "Besökstiden är slut men en upprörd anhörig vägrar lämna avdelningen, trots personalens uppmaningar. Vad gör du?",
      "options": [
        "Tar tag i armen och leder ut personen.",
        "Ringer 112 direkt utan att först prata med personen.",
        "Låter personen stanna – anhöriga har alltid rätt att vara kvar.",
        "Tar över samtalet: bekräftar oron, förklarar reglerna lugnt, erbjuder alternativ (t.ex. att ringa avdelningen) och uppmanar personen att lämna på vårdens uppdrag. Vid fortsatt vägran kontaktas polis."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Empati först – anhöriga på sjukhus är ofta i kris. Men avdelningens regler gäller, och din uppmaning sker på uppdragsgivarens vägnar. Tvång att avlägsna någon har du inte; vägran efter tillsägelse blir en fråga för polisen.",
      "tags": [
        "allmant"
      ]
    },
    {
      "id": 50,
      "category": "sjukhus",
      "categoryLabel": "Sjukhus och vård",
      "level": "grund",
      "source": "v1",
      "title": "Påsen på toaletten",
      "scenario": "Vid rondering hittar du en liten påse med vitt pulver på en offentlig toalett på sjukhuset. Vad gör du?",
      "options": [
        "Rör påsen så lite som möjligt, säkrar platsen så ingen annan tar den, kontaktar polis via ledningscentralen, dokumenterar fyndet och överlämnar enligt instruktion.",
        "Spolar ner påsen så att ingen kommer till skada.",
        "Stoppar den i fickan och lämnar in den efter passet.",
        "Luktar och smakar försiktigt för att avgöra vad det är."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Misstänkt narkotika ska till polisen – att förstöra fyndet undanröjer bevis och att bära runt på det är olämpligt (och i värsta fall straffbart). Fentanylanaloger kan dessutom vara farliga vid hudkontakt: minimera hanteringen.",
      "tags": [
        "allmant"
      ]
    },
    {
      "id": 51,
      "category": "sjukhus",
      "categoryLabel": "Sjukhus och vård",
      "level": "grund",
      "source": "v1",
      "title": "Patienten som avviker",
      "scenario": "En patient som vårdas enligt LPT springer mot utgången. Personal ropar: \"Stoppa honom!\" Vad gör du?",
      "options": [
        "Tacklar patienten – personalen bad ju om det.",
        "Ställer dig i dörren och vägrar släppa förbi någon.",
        "Följer efter på avstånd, rapporterar löpande vart patienten tar vägen och hjälper personalen larma polis. Fysiskt kvarhållande gör du bara om patienten är en akut fara för sig själv eller andra (nöd/nödvärn).",
        "Gör ingenting – psykiatrin är inte ditt bord."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Att kvarhålla en LPT-patient är vårdens ansvar, med polishandräckning som verktyg – väktaren har ingen egen befogenhet för det. Men du är ovärderlig som följare och rapportör, och vid akut livsfara ger nödbestämmelsen (BrB 24 kap. 4 §) utrymme att ingripa.",
      "tags": [
        "envarsgripande",
        "nod",
        "brand"
      ]
    },
    {
      "id": 52,
      "category": "sjukhus",
      "categoryLabel": "Sjukhus och vård",
      "level": "grund",
      "source": "v1",
      "title": "Hjärtstoppet i entrén",
      "scenario": "En medelålders man segnar ner i sjukhusets entréhall. Han är okontaktbar och andas inte normalt. Vad gör du?",
      "options": [
        "Springer och letar rätt på en läkare någonstans i huset.",
        "Larmar enligt objektets rutin (internt hjärtlarm/112), startar omedelbart HLR med 30 kompressioner och 2 inblåsningar, och pekar ut en namngiven person som hämtar närmaste hjärtstartare.",
        "Lägger honom i stabilt sidoläge och väntar.",
        "Häller vatten i ansiktet för att väcka honom."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Vid hjärtstopp räknas sekunder: larma, starta HLR, hämta hjärtstartare – parallellt, genom att delegera med pekfinger och namn (\"Du i röd jacka – hämta hjärtstartaren vid receptionen!\"). Stabilt sidoläge är för medvetslösa som andas normalt, inte för hjärtstopp.",
      "tags": [
        "sjukvard",
        "larm"
      ]
    },
    {
      "id": 53,
      "category": "sjukhus",
      "categoryLabel": "Sjukhus och vård",
      "level": "grund",
      "source": "v1",
      "title": "Fotografen i entrén",
      "scenario": "En kvällstidningsfotograf står i sjukhusentrén och fotograferar in mot akuten, där en känd person just tagits in. Vad gör du?",
      "options": [
        "Beslagtar kameran och raderar bilderna.",
        "Berättar för fotografen vilken avdelning personen ligger på så han kan vänta där i stället.",
        "Knuffar ut fotografen genom dörrarna.",
        "Informerar vänligt om att fotografering inte är tillåten i lokalerna, ber honom lämna byggnaden och hänvisar till sjukhusets presskontakt. Vid vägran kontaktas polis. Du lämnar aldrig ut uppgifter om patienter."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Sjukhuset bestämmer reglerna i sina lokaler och patientsekretessen är absolut – men du har inga tvångsmedel mot fotografen och får aldrig röra hans utrustning. Uppmaning, hänvisning och vid behov polis. Alternativ B vore ett brott mot din tystnadsplikt.",
      "tags": [
        "tystnadsplikt"
      ]
    },
    {
      "id": 54,
      "category": "kontor",
      "categoryLabel": "Kontor och reception",
      "level": "grund",
      "source": "v1",
      "title": "Tailgating",
      "scenario": "En okänd person utan synligt passerkort smiter in genom säkerhetsdörren tätt bakom en anställd. Vad gör du?",
      "options": [
        "Hejdar personen artigt: \"Hej! Jag ser att du inte drog något kort – kan jag hjälpa dig tillrätta?\" Kontrollera behörighet, hänvisa till receptionen för besöksregistrering och rapportera händelsen.",
        "Utlöser inbrottslarmet.",
        "Låter det bero – personen såg ut att höra hemma där.",
        "Springer fram och ställer dig bredbent i vägen."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Tailgating är den vanligaste vägen förbi ett skalskydd, och de flesta obehöriga \"ser ut att höra hemma\". Ett vänligt men konsekvent stopp med kontroll löser situationen utan konfrontation – och även behöriga som slarvat ska påminnas om rutinen.",
      "tags": [
        "allmant"
      ]
    },
    {
      "id": 55,
      "category": "kontor",
      "categoryLabel": "Kontor och reception",
      "level": "grund",
      "source": "v1",
      "title": "Samtalet från \"VD:n\"",
      "scenario": "Du sitter i receptionen kvällstid. En man ringer, uppger sig vara VD och kräver att du omedelbart släpper in en konsult i serverrummet: \"Det är skarpt läge, jag tar ansvaret.\" Vad gör du?",
      "options": [
        "Släpper in konsulten – VD:n är högsta chefen.",
        "Släpper in konsulten men följer med och tittar på.",
        "Följer behörighetsrutinen: förklarar vänligt att du måste verifiera, ringer tillbaka via ett officiellt nummer eller kontaktar din ledningscentral/kontaktperson. Ingen kommer in i serverrummet utan bekräftad behörighet.",
        "Ber mannen mejla dig ett godkännande från sin privata adress."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Detta är ett klassiskt social engineering-upplägg: auktoritet, tidspress och löfte om ansvarsövertagande. Verifiering sker alltid via en kanal du själv kontrollerar. En riktig VD respekterar en väktare som följer rutinen.",
      "tags": [
        "allmant"
      ]
    },
    {
      "id": 56,
      "category": "kontor",
      "categoryLabel": "Kontor och reception",
      "level": "grund",
      "source": "v1",
      "title": "Den krossade rutan",
      "scenario": "Larmet går kl. 03. På plats ser du en krossad ruta på kontorets baksida. Ingen syns till. Vad gör du?",
      "options": [
        "Kliver in genom fönstret för att kontrollera lokalerna.",
        "Larmar polis via ledningscentralen, rör inte fönstret eller marken intill (spårsäkring), håller uppsikt över byggnadens flyktvägar från säkert avstånd och möter polisen med information.",
        "Ropar in genom hålet att polisen är på väg.",
        "Konstaterar skadegörelse, tejpar för rutan och åker vidare."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "En krossad ruta betyder möjligt pågående inbrott – gärningsmannen kan vara kvar. Du går inte in ensam, du förstör inte spår, och du positionerar dig så att du ser utan att synas. Polisens tekniker behöver orörda skoavtryck och glas.",
      "tags": [
        "roller",
        "larm"
      ]
    },
    {
      "id": 57,
      "category": "kontor",
      "categoryLabel": "Kontor och reception",
      "level": "grund",
      "source": "v1",
      "title": "Den hotfulle f.d. anställde",
      "scenario": "En nyligen uppsagd man kommer in i receptionen, är högröstad och kräver att få träffa HR-chefen \"annars smäller det\". Receptionisten är rädd. Vad gör du?",
      "options": [
        "Säger åt honom att skärpa sig och sluta bete sig som ett barn.",
        "Lovar honom ett möte med HR-chefen för att lugna ner läget.",
        "Ber receptionisten ringa vakten – och inser sedan att det är du.",
        "Placerar dig mellan mannen och receptionisten, talar lugnt och bekräftande, ber honom lämna lokalen på uppdragsgivarens vägnar och ser till att kollegor larmar polis. \"Annars smäller det\" kan utgöra olaga hot."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Skydda personalen genom positionering, trappa ned verbalt och dokumentera exakt vad som sägs – ordalydelsen avgör om det är ett olaga hot. Falska löften (alternativ B) brukar förvärra situationen när de spricker.",
      "tags": [
        "dokumentation"
      ]
    },
    {
      "id": 58,
      "category": "kontor",
      "categoryLabel": "Kontor och reception",
      "level": "grund",
      "source": "v1",
      "title": "Dokumenten på skrivaren",
      "scenario": "Under nattrondering på ett kontor hittar du en bunt papper märkta \"Konfidentiellt – styrelsematerial\" kvarglömda på en skrivare. Vad gör du?",
      "options": [
        "Läser inte innehållet. Säkra handlingarna enligt objektsinstruktionen (t.ex. i låst fack eller överlämning till kontaktperson) och notera fyndet i din rapport.",
        "Läser igenom dem så att du kan beskriva innehållet i rapporten.",
        "Fotograferar dokumenten som bevis på fyndet.",
        "Lägger dem i papperskorgen under skrivaren."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Din tystnadsplikt omfattar allt du får kännedom om i tjänsten – och det du inte läst kan du inte läcka. Säker hantering enligt instruktion plus rapportering skyddar både kunden och dig. Att fotografera känsliga handlingar skapar bara en ny informationsläcka.",
      "tags": [
        "tystnadsplikt",
        "brand",
        "dokumentation"
      ]
    },
    {
      "id": 59,
      "category": "kontor",
      "categoryLabel": "Kontor och reception",
      "level": "grund",
      "source": "v1",
      "title": "Bombhotet i luren",
      "scenario": "Du bemannar växeln kvällstid. En röst säger: \"Det ligger en bomb i huset som sprängs om en timme\" och fortsätter prata. Vad gör du?",
      "options": [
        "Slänger på luren och drar brandlarmet.",
        "Säger att du inte tror på honom och ber honom sluta ringa.",
        "Håller uppringaren kvar i samtalet så länge det går: antecknar exakt ordalydelse, röst, dialekt, bakgrundsljud och tidpunkt. Direkt efteråt larmar du 112 och aktiverar objektets krisrutin – utrymning sker enligt beslut, inte panik.",
        "Sätter samtalet på högtalare så kollegorna får höra."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Varje detalj från samtalet är guld för polisens bedömning av hotets allvar. Många objekt har en bombhotschecklista vid telefonen – använd den. Beslut om utrymning tas enligt krisorganisationens rutin, ofta i samråd med polis.",
      "tags": [
        "brand",
        "roller"
      ]
    },
    {
      "id": 60,
      "category": "kontor",
      "categoryLabel": "Kontor och reception",
      "level": "grund",
      "source": "v1",
      "title": "Nyckelknippan i garaget",
      "scenario": "I parkeringsgaraget hittar du en nyckelknippa med taggar och nycklar som verkar gå till stora delar av fastigheten. Vad gör du?",
      "options": [
        "Hänger upp den på anslagstavlan med en lapp.",
        "Säkrar knippan omgående, lämnar den enligt rutin till ledningscentral eller fastighetsansvarig och dokumenterar fyndet med tid och plats. Den lämnas aldrig ut till någon som \"känner igen den\" utan verifiering.",
        "Testar vilka dörrar den går till för att hitta ägaren.",
        "Låser in den i ditt eget skåp till nästa vecka."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Nycklar och taggar på vift är en allvarlig säkerhetsrisk – i fel händer öppnar de hela fastigheten. Snabb säkring, dokumentation och kontrollerad återlämning gäller. Fyndet kan också innebära att lås eller taggar behöver spärras – det avgör fastighetsägaren.",
      "tags": [
        "allmant"
      ]
    },
    {
      "id": 61,
      "category": "kontor",
      "categoryLabel": "Kontor och reception",
      "level": "grund",
      "source": "v1",
      "title": "Mötet som inte får störas",
      "scenario": "Brandlarmet ljuder på kontoret. En anställd vägrar lämna konferensrummet: \"Det är säkert ett falsklarm, vi sitter i ett viktigt kundmöte.\" Vad gör du?",
      "options": [
        "Rycker upp honom ur stolen och släpar ut honom.",
        "Stannar och diskuterar tills han ändrar sig.",
        "Låter honom sitta – vuxna människor ansvarar för sig själva.",
        "Uppmanar bestämt och tydligt: \"Brandlarmet gäller alla – lämna byggnaden nu.\" Vägrar han ändå fortsätter du utrymningen av övriga och rapporterar omgående till räddningsledaren att en person är kvar och var."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Du får inte bära ut någon med tvång (annat än vid omedelbar livsfara – nöd), och du får inte fastna hos en enskild medan andra behöver hjälp ut. Räddningstjänsten måste dock alltid få veta om kvarvarande personer och deras position.",
      "tags": [
        "nod",
        "brand",
        "larm"
      ]
    },
    {
      "id": 62,
      "category": "kontor",
      "categoryLabel": "Kontor och reception",
      "level": "grund",
      "source": "v1",
      "title": "Städaren klockan 02",
      "scenario": "Under nattrondering möter du en okänd person med städvagn i korridoren. Ingen städning finns aviserad i dina handlingar. Vad gör du?",
      "options": [
        "Kontrollerar vänligt personens identitet och uppdrag, stämmer av mot ledningscentral eller bemanningslista – och följer personen ut om behörighet inte kan bekräftas. Händelsen rapporteras oavsett utfall.",
        "Nickar och går vidare – städvagnen talar för sig själv.",
        "Griper personen för olaga intrång.",
        "Låser in personen i städskrubben tills det är utrett."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "En städvagn är en av de äldsta förklädnaderna för obehörigt tillträde. Kontrollen görs vänligt – oftast är det en riktig städare med ändrat schema – men den görs alltid. Gripande kräver brott på bar gärning, inte bara en obekräftad närvaro.",
      "tags": [
        "envarsgripande"
      ]
    },
    {
      "id": 63,
      "category": "kontor",
      "categoryLabel": "Kontor och reception",
      "level": "grund",
      "source": "v1",
      "title": "Kollegan som sover",
      "scenario": "Du kommer till objektet för att avlösa och hittar din kollega djupt sovande i receptionen, med larmpanelen obevakad. Vad gör du?",
      "options": [
        "Tar en bild och skickar i gruppchatten som ett skämt.",
        "Låter honom sova – han har säkert haft en tuff natt.",
        "Väcker honom, säkerställer att bevakningen är intakt (larm, loggar, ronder) och rapporterar händelsen till arbetsledningen. Du täcker inte upp genom att tiga.",
        "Väcker honom och lovar att hålla tyst mot att han tar ditt nästa helgpass."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "En sovande väktare är en allvarlig säkerhetsbrist mot kund och kollegor – och att dölja det gör dig medansvarig. Rapporten handlar inte om att sätta dit någon: bakom sömn på pass kan ligga sjukdom eller ohållbart schema, vilket arbetsgivaren måste hantera.",
      "tags": [
        "dokumentation"
      ]
    },
    {
      "id": 64,
      "category": "bostad",
      "categoryLabel": "Bostadsområden",
      "level": "grund",
      "source": "v1",
      "title": "Gänget i trapphuset",
      "scenario": "Vid trygghetsrondering kl. 23 hittar du fem ungdomar som röker och spelar hög musik i ett trapphus. Boende har klagat. Vad gör du?",
      "options": [
        "Beordrar dem att omedelbart försvinna, annars ringer du polisen.",
        "Tar en lugn och respektfull kontakt: hälsar, förklarar att boende störs och att rökning i trapphus inte är tillåten, och ber dem flytta på sig. De flesta lyssnar när de blir vänligt men tydligt bemötta. Vid brott eller upprepad vägran – rapportera och kontakta polis.",
        "Fotograferar dem för framtida identifiering.",
        "Ställer dig tyst bredvid tills de tröttnar och går."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Trygghetsrondering bygger på relationer – dagens ungdomar i trapphuset är morgondagens vuxna i området, och hur du bemöter dem avgör din trovärdighet i månader framåt. Tvångsmedel att avlägsna dem har du inte; det har polisen.",
      "tags": [
        "brand"
      ]
    },
    {
      "id": 65,
      "category": "bostad",
      "categoryLabel": "Bostadsområden",
      "level": "grund",
      "source": "v1",
      "title": "Källarförrådet",
      "scenario": "I källargången hittar du en förrådsdörr med färska brytmärken, uppbrutet hänglås och dörren på glänt. Vad gör du?",
      "options": [
        "Går in i förrådet för att inventera vad som saknas.",
        "Sätter dit ett nytt hänglås från din väska.",
        "Ropar \"Kom fram!\" in i källargången.",
        "Stannar och lyssnar. Vid tecken på att någon är kvar drar du dig tillbaka och larmar polis via ledningscentralen. Annars: dokumentera med foto utan att röra brytmärken eller dörr, rapportera till förvaltaren och säkra utrymmet enligt rutin."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Färska brytmärken kan betyda pågående brott – lyssna innan du agerar. Källargångar är trånga med begränsade reträttvägar, vilket höjer riskerna. Spårsäkring och dokumentation hjälper både polis och fastighetsägare.",
      "tags": [
        "allmant"
      ]
    },
    {
      "id": 66,
      "category": "bostad",
      "categoryLabel": "Bostadsområden",
      "level": "grund",
      "source": "v1",
      "title": "Skriken från lägenheten",
      "scenario": "Under rondering hör du högljutt bråk från en lägenhet: skrik, dunsar och en kvinna som ropar på hjälp. Vad gör du?",
      "options": [
        "Ringer 112 omedelbart, stannar kvar utanför och fortsätter lyssna för att kunna vägleda polisen (våning, dörr, vad som hörs). Du går in endast om det pågår ett akut livshotande angrepp som inte kan vänta på polis – då kan nöd och nödvärn ge lagstöd.",
        "Bankar på dörren och kräver att få komma in och kontrollera.",
        "Noterar adressen i din rapport och fortsätter ronden.",
        "Ropar genom brevinkastet att de ska lugna ner sig."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Rop på hjälp plus våldsljud är ett polisärende med högsta prioritet – ring 112 direkt, inte förvaltaren. Hemfriden väger tungt, men vid ett pågående livshotande angrepp får envar ingripa (nödvärn gäller till förmån för annan). Din lägesrapportering utifrån är oftast den största hjälpen.",
      "tags": [
        "envarsgripande",
        "nodvarn",
        "sjukvard"
      ]
    },
    {
      "id": 67,
      "category": "bostad",
      "categoryLabel": "Bostadsområden",
      "level": "grund",
      "source": "v1",
      "title": "Bultsaxen i cykelrummet",
      "scenario": "I föreningens cykelrum står en man och kapar ett cykellås med bultsax. Han har inte sett dig. Vad gör du?",
      "options": [
        "Går fram och griper honom direkt – bar gärning är bar gärning.",
        "Blockerar dörren så han inte kommer ut.",
        "Gör en säkerhetsbedömning från dörren: en man med bultsax är en man med ett tungt verktyg. Larma polis via ledningscentralen, säkra signalement – och grip på bar gärning endast om läget bedöms hanterbart och helst med stöd av kollega.",
        "Smäller igen dörren och låser in honom."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Stöld på bar gärning ger rätt att gripa, men bultsaxen förändrar riskbilden helt. Rätten att gripa är aldrig en plikt. Att låsa in gärningsmannen skapar en desperat, beväpnad person i ett trångt rum – med dig utanför enda utgången.",
      "tags": [
        "envarsgripande"
      ]
    },
    {
      "id": 68,
      "category": "bostad",
      "categoryLabel": "Bostadsområden",
      "level": "grund",
      "source": "v1",
      "title": "Grannen ska bort",
      "scenario": "En boende ringer bovärdens journummer och du möter honom på gården: \"Grannen spelar hög musik varje natt – gå upp och kasta ut honom!\" Vad gör du?",
      "options": [
        "Går upp och beordrar grannen att öppna dörren.",
        "Förklarar din roll: du kan knacka på, prata med grannen och dokumentera störningen till förvaltaren – men du har ingen rätt att avlägsna någon ur sin bostad. Störningsärenden drivs av hyresvärden, akuta ordningsstörningar av polisen.",
        "Stänger av strömmen till grannens lägenhet.",
        "Säger att störningar inte ingår i ditt uppdrag och kör därifrån."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Att hantera förväntningar är halva jobbet: boende tror ofta att väktaren har polisiära befogenheter. Ett samtal med grannen och en välskriven störningsrapport är precis det underlag hyresvärden behöver för att agera – och det är din faktiska uppgift.",
      "tags": [
        "dokumentation"
      ]
    },
    {
      "id": 69,
      "category": "bostad",
      "categoryLabel": "Bostadsområden",
      "level": "grund",
      "source": "v1",
      "title": "Bilen med krossad ruta",
      "scenario": "I garaget hittar du en bil med krossad sidoruta och larmet tjutande. Glas ligger på marken och handskfacket står öppet. Vad gör du?",
      "options": [
        "Sträcker dig in och stänger av billarmet.",
        "Städar upp glaset så ingen skär sig.",
        "Väntar vid bilen tills ägaren dyker upp.",
        "Kontrollerar försiktigt närområdet efter gärningsman, rör inte bilen (spår), dokumenterar med foto och registreringsnummer, rapporterar via ledningscentralen så ägaren kan kontaktas – och tipsa ägaren om polisanmälan."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Inbrott i bil är gjort på sekunder och gärningsmannen kan finnas kvar i garaget – kontrollera först, försiktigt. Bilen är en brottsplats: fingeravtryck på dörr och handskfack förstörs lätt. Anmälan gör ägaren; din rapport och dina bilder blir underlaget.",
      "tags": [
        "dokumentation",
        "larm"
      ]
    },
    {
      "id": 70,
      "category": "bostad",
      "categoryLabel": "Bostadsområden",
      "level": "grund",
      "source": "v1",
      "title": "Mannen i trapphuset en vinternatt",
      "scenario": "En kall vinternatt hittar du en man sovande på golvet i ett trapphus. Vad gör du?",
      "options": [
        "Börjar med hälsan: försök väcka honom varsamt och kontrollera medvetande och nedkylning. Vaknar han inte eller verkar sjuk – larma 112. Är han vaken och ok: förklara att han inte kan sova där, och hjälp honom vidare via de kontaktvägar din instruktion anger (t.ex. socialjour eller härbärge). Polis vid behov.",
        "Väcker honom och visar ut honom i kylan – trapphuset är låst av en anledning.",
        "Låter honom sova till morgonen, det är ju minusgrader ute.",
        "Häller kallt vatten på honom för att väcka honom snabbt."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "En orörlig person en vinternatt är ett potentiellt medicinskt nödläge innan det är ett ordningsproblem – nedkylning och sjukdom förväxlas lätt med berusning och sömn. Att köra ut någon i livshotande kyla utan alternativ kan dessutom vara straffbart. Hälsobedömning först, sedan human hantering enligt rutin.",
      "tags": [
        "sjukvard"
      ]
    },
    {
      "id": 71,
      "category": "bostad",
      "categoryLabel": "Bostadsområden",
      "level": "grund",
      "source": "v1",
      "title": "Överlämningen på gården",
      "scenario": "Från din ronderingsbil ser du vad som ser ut som langning på gården: en bil stannar, påsar och kontanter byter händer genom rutan, kön av köpare växer. Vad gör du?",
      "options": [
        "Kör fram med helljuset på och skingrar dem.",
        "Går fram och kräver att få se vad som finns i påsarna.",
        "Observerar diskret på avstånd: registreringsnummer, signalement, tidpunkter och mönster. Rapportera till polisen (tipstelefon eller enligt din instruktion) och till uppdragsgivaren. Du ingriper inte själv.",
        "Griper köparna en och en när de lämnar platsen."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Misstänkt narkotikaförsäljning är svårbedömd på plats, ofta kopplad till kriminella nätverk och förenad med verklig hotbild – ingripanden här är polisens sak. Dina systematiska observationer över tid är däremot mycket värdefull underrättelseinformation.",
      "tags": [
        "envarsgripande",
        "roller"
      ]
    },
    {
      "id": 72,
      "category": "industri",
      "categoryLabel": "Industri och rondering",
      "level": "grund",
      "source": "v1",
      "title": "Grinden som står öppen",
      "scenario": "Vid rondering av ett inhägnat industriområde finner du huvudgrinden vidöppen – den ska vara låst nattetid. Vad gör du?",
      "options": [
        "Låser grinden direkt och kör vidare till nästa objekt.",
        "Rapporterar avvikelsen till ledningscentralen, kontrollerar området systematiskt efter fordon, personer och andra avvikelser, och låser grinden först när området bedömts säkert. Allt dokumenteras.",
        "Parkerar utanför och väntar på att någon ska komma ut.",
        "Antar att nattpersonalen glömt den och noterar det i morgonrapporten."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "En öppen grind kan betyda slarv – eller att någon är inne på området just nu. Låser du direkt kan du låsa in en gärningsman, eller ute den behöriga person som strax kommer tillbaka. Kontroll först, åtgärd sedan, dokumentation alltid.",
      "tags": [
        "allmant"
      ]
    },
    {
      "id": 73,
      "category": "industri",
      "categoryLabel": "Industri och rondering",
      "level": "grund",
      "source": "v1",
      "title": "Gaslukten vid cisternerna",
      "scenario": "Under fotrondering på ett industriområde känner du en stark gaslukt nära cisternområdet. Vad gör du?",
      "options": [
        "Går närmare för att hitta läckan och kunna beskriva den exakt.",
        "Öppnar portarna för att vädra ut.",
        "Tänder ficklampan och lyser mot cisternerna för att se dimma.",
        "Drar dig omedelbart undan i vindriktningens motsatta riktning, larmar 112 och driftansvarig, spärrar av på betryggande avstånd och undviker allt som kan ge gnistor – inklusive att slå på elektronik i riskzonen."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Gasläckor är explosions- och förgiftningsrisk – avstånd är ditt skydd, och en gnista från en strömbrytare eller mobil kan räcka för antändning. Din uppgift är att larma, spärra av och möta räddningstjänsten med information, inte att lokalisera läckan.",
      "tags": [
        "brand",
        "larm"
      ]
    },
    {
      "id": 74,
      "category": "industri",
      "categoryLabel": "Industri och rondering",
      "level": "grund",
      "source": "v1",
      "title": "Pistolen i buskaget",
      "scenario": "Under rondering hittar du något som ser ut som en pistol i ett buskage intill staketet. Vad gör du?",
      "options": [
        "Rör den inte. Säkra platsen på avstånd så ingen annan kommer åt den, larma polis omgående via ledningscentralen och stanna kvar tills polisen tar över. Dokumentera fyndplatsen.",
        "Plockar upp den försiktigt och lägger den i din bil för överlämning.",
        "Kontrollerar om den är laddad innan du larmar.",
        "Täcker över den med en hink och åker vidare."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Ett skjutvapen kan vara laddat, osäkrat – och bevis i ett grovt brott. Att flytta det förstör spår (DNA, fingeravtryck) och innebär dessutom att du hanterar ett vapen utan tillstånd. Bevaka på avstånd tills polisen kommer.",
      "tags": [
        "allmant"
      ]
    },
    {
      "id": 75,
      "category": "industri",
      "categoryLabel": "Industri och rondering",
      "level": "grund",
      "source": "v1",
      "title": "Skadan under ensamarbete",
      "scenario": "Du ronderar ensam nattetid och trampar snett i ett trapphus. Foten värker rejält men du kan halta vidare. Tre objekt återstår. Vad gör du?",
      "options": [
        "Biter ihop och slutför ronden – rapporterar i morgon om det behövs.",
        "Tar av dig skon och vilar en timme i bilen.",
        "Kontaktar omgående ledningscentralen, rapporterar skadan och följer beskedet – anpassad rond, avlösning eller vård. Skadan rapporteras som arbetsskada/tillbud.",
        "Åker hem utan att säga något – passet är ändå snart slut."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Ensamarbetets viktigaste regel: ledningscentralen ska alltid veta ditt läge. En \"liten\" skada kan förvärras snabbt, och en väktare som inte kan springa eller försvara sig är en säkerhetsrisk för sig själv. Tillbudsrapportering är dessutom ett lagkrav i arbetsmiljöarbetet – och skyddar din rätt vid framtida besvär.",
      "tags": [
        "dokumentation"
      ]
    },
    {
      "id": 76,
      "category": "industri",
      "categoryLabel": "Industri och rondering",
      "level": "grund",
      "source": "v1",
      "title": "Heta arbeten utan brandvakt",
      "scenario": "Vid rondering ser du en entreprenör kapa stål med vinkelslip intill ett upplag med emballage. Gnistregnet yr. Ingen brandvakt, ingen släckutrustning, inget tillstånd synligt. Vad gör du?",
      "options": [
        "Noterar det och tar upp saken med driftchefen nästa vecka.",
        "Påtalar den akuta brandrisken direkt och ber entreprenören avbryta tills tillstånd och säkerhetsåtgärder finns på plats, kontaktar driftansvarig enligt rutin och rapporterar avvikelsen skriftligt.",
        "Ställer dig bredvid med en brandsläckare som improviserad brandvakt.",
        "Blandar dig inte i – entreprenörer ansvarar för sitt eget arbete."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Heta arbeten kräver tillstånd, brandvakt och släckutrustning – och gnistor i emballage är en klassisk storbrandsorsak. Brandskydd ingår i väktarens ronderingsuppdrag: vid akut fara agerar du direkt, sedan eskalerar du enligt rutin.",
      "tags": [
        "brand"
      ]
    },
    {
      "id": 77,
      "category": "industri",
      "categoryLabel": "Industri och rondering",
      "level": "grund",
      "source": "v1",
      "title": "Larmet från Kontor 2",
      "scenario": "Du rycker ut på inbrottslarm, sektion \"Kontor 2\". Utvändigt syns inga skador och allt verkar lugnt. Vad gör du?",
      "options": [
        "Återställer larmet och rapporterar \"falsklarm\" – utsidan var ju hel.",
        "Går rakt in till sektionen med nycklarna.",
        "Väntar i bilen tills larmet tystnar av sig självt.",
        "Gör en systematisk yttre kontroll av hela byggnaden (dörrar, fönster, tak/källarnivå), rapporterar läget till ledningscentralen och genomför därefter invändig kontroll enligt objektsinstruktionen – med skärpt uppmärksamhet, eftersom något har utlöst larmet."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Ett larm utan synlig yttre orsak kan bero på teknik, ett djur – eller på att någon tagit sig in en väg du ännu inte kontrollerat. Metodik enligt instruktion gäller: yttre varv först, löpande kontakt med ledningscentralen, och aldrig \"falsklarm\" som slutsats utan fullständig kontroll.",
      "tags": [
        "bemotande"
      ]
    },
    {
      "id": 78,
      "category": "industri",
      "categoryLabel": "Industri och rondering",
      "level": "grund",
      "source": "v1",
      "title": "Kamerorna är nere",
      "scenario": "Ledningscentralen meddelar att kamerasystemet på ditt objekt slutat fungera – tekniker kommer först i morgon. Vad gör du?",
      "options": [
        "Kompenserar bortfallet: tätare och mer oregelbunden fysisk rondering med fokus på de ytor kamerorna normalt täcker, avstämning med ledningscentralen om prioriteringar, och dokumentation av avvikelsen.",
        "Fortsätter exakt som vanligt – kamerorna är inte ditt ansvar.",
        "Sätter upp lappar om att området är kameraövervakat ändå.",
        "Går hem tidigare eftersom övervakningen ändå ligger nere."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "När ett skyddslager faller förstärks de andra – det är grundprincipen i allt säkerhetsarbete. Tänk också på att ett plötsligt kamerabortfall i sig kan vara ett förstadium till brott (sabotage), vilket motiverar extra vaksamhet.",
      "tags": [
        "kamerabevakning"
      ]
    },
    {
      "id": 79,
      "category": "industri",
      "categoryLabel": "Industri och rondering",
      "level": "grund",
      "source": "v1",
      "title": "Fotografen vid skyddsobjektet",
      "scenario": "Anläggningen du bevakar är skyddsobjekt med skyltat avbildningsförbud. Du är väktare – inte förordnad skyddsvakt. En man står utanför staketet och fotograferar systematiskt in mot anläggningen. Vad gör du?",
      "options": [
        "Hoppar över staketet, beslagtar kameran och håller kvar mannen.",
        "Raderar bilderna i hans kamera och låter honom sedan gå.",
        "Informerar mannen om att fotografering är förbjuden, kontaktar omgående skyddsvakt/polis enligt instruktion och dokumenterar signalement, fordon och tid. Skyddsvaktens särskilda befogenheter (avvisa, omhänderta, beslagta) har du inte utan förordnande.",
        "Ignorerar honom – han står ju utanför staketet."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Vid skyddsobjekt gäller skyddslagen, men dess tvångsbefogenheter tillhör förordnade skyddsvakter och polis – väktarrollen ger dem inte automatiskt. Din insats är information, snabb larmning och bra dokumentation. Systematisk fotografering av skyddsobjekt kan vara ett allvarligt brott och ska alltid rapporteras.",
      "tags": [
        "dokumentation",
        "roller"
      ]
    },
    {
      "id": 80,
      "category": "event",
      "categoryLabel": "Arenor och event",
      "level": "grund",
      "source": "v1",
      "title": "Visitationen som nekas",
      "scenario": "I entrén till en konsert ska alla besökare visiteras som villkor för inträde. En man vägrar låta sig visiteras men kräver att komma in – \"jag har ju betalat för biljetten\". Vad gör du?",
      "options": [
        "Visiterar honom snabbt mot hans vilja – alla andra har ju gått med på det.",
        "Nekar honom inträde, lugnt och tydligt: visitationen är frivillig, men ett villkor för att komma in. Han väljer själv – visitation eller ingen entré. Hänvisa biljettfrågan till arrangören.",
        "Släpper in honom för att undvika bråk i kön.",
        "Ropar på kollegor så ni kan hålla fast honom under visitationen."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Entrévisitation bygger helt på samtycke – den är ett avtalsvillkor, inte ett tvångsmedel. Vägrar besökaren gäller: inget inträde, inget tvång, ingen diskussion om biljettpengar (det är arrangörens fråga). Tvångsvisitation av väktare är ett brott.",
      "tags": [
        "visitation"
      ]
    },
    {
      "id": 81,
      "category": "event",
      "categoryLabel": "Arenor och event",
      "level": "grund",
      "source": "v1",
      "title": "Kniven i väskan",
      "scenario": "Vid entrévisitationen hittar du en kniv i en besökares ryggsäck. Vad gör du?",
      "options": [
        "Tar kniven, slänger den i en låda och släpper in besökaren.",
        "Ger tillbaka kniven och släpper in honom – han verkar ju trevlig.",
        "Ropar högt \"KNIV!\" så alla hör.",
        "Nekar inträde, behåller lugnet och kontaktar polis eller ordningsvakt enligt evenemangets rutin. Kniv på allmän sammankomst kan vara brott mot knivlagen – dokumentera och låt polisen avgöra hanteringen. Du beslagtar inget på eget bevåg utanför ett gripande."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Knivinnehav vid offentliga tillställningar och allmänna sammankomster är normalt förbjudet enligt knivlagen. Rutinen på de flesta evenemang är: neka inträde, tillkalla polis/ordningsvakt, dokumentera. Att tyst \"samla knivar i en låda\" utan polisens inblandning riskerar att släppa igenom allvarliga ärenden.",
      "tags": [
        "visitation",
        "dokumentation",
        "roller"
      ]
    },
    {
      "id": 82,
      "category": "event",
      "categoryLabel": "Arenor och event",
      "level": "grund",
      "source": "v1",
      "title": "Trycket mot scenstaketet",
      "scenario": "Under en konsert trycks publiken framåt. Personer längst fram kläms mot scenstaketet och en ung kvinna får panik. Vad gör du?",
      "options": [
        "Larmar omedelbart säkerhetsansvarig via radio med kodord/klartext för trängsel – vid behov ska showen stoppas – och börjar tillsammans med kollegorna lyfta nödställda över staketet till säkerheten framför scenen.",
        "Ropar åt publiken att backa.",
        "Väntar på att låten ska ta slut så trycket släpper.",
        "Klättrar upp på scenen för att få överblick."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Vid trängsel mot scen räddas liv framför staketet – lyft över de nödställda – och genom att trycket bakifrån bryts, vilket ofta kräver att artisten pausar. Att ropa åt en publikmassa fungerar inte; de bakre hör inte och ser inte vad som händer längst fram. Snabb eskalering enligt evenemangets rutin är avgörande.",
      "tags": [
        "allmant"
      ]
    },
    {
      "id": 83,
      "category": "event",
      "categoryLabel": "Arenor och event",
      "level": "grund",
      "source": "v1",
      "title": "Scenklättraren",
      "scenario": "En person tar sig förbi staketet och klättrar upp på scenen, springande mot artisten. Vad gör du?",
      "options": [
        "Väntar och ser om han bara vill ta en selfie.",
        "Ropar åt artisten att springa.",
        "Ingriper direkt: genskjut, stoppa och led bort personen från artisten – vid ett angrepp ger nödvärnsrätten (som gäller till förmån för annan) stöd för nödvändigt våld, och vid brott på bar gärning kan personen gripas och överlämnas till polis/ordningsvakt.",
        "Släcker strålkastarna så han inte hittar fram."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Att skydda personer på scenen är kärnan i uppdraget, och tidsfönstret är sekunder – du kan inte invänta att \"avsikten klarnar\". Använd inte mer våld än situationen kräver: många scenklättrare är berusade fans, inte attentatsmän. Dokumentera och överlämna enligt rutin.",
      "tags": [
        "dokumentation"
      ]
    },
    {
      "id": 84,
      "category": "event",
      "categoryLabel": "Arenor och event",
      "level": "grund",
      "source": "v1",
      "title": "Den medvetslöse på läktaren",
      "scenario": "Efter andra perioden hittar du en kraftigt berusad man hopsjunken på läktaren. Han är svårväckt och luktar starkt av alkohol. Vad gör du?",
      "options": [
        "Låter honom sova ruset av sig – matchen är snart slut.",
        "Behandlar det som ett sjukvårdsläge först: kontrollera medvetande och andning, tillkalla evenemangets sjukvårdare, lägg honom i stabilt sidoläge om han andas men inte vaknar – och larma 112 vid minsta tvekan. Är han vaken men oförmögen att ta hand om sig kopplas ordningsvakt/polis in.",
        "Bär ut honom till gatan med hjälp av en kollega.",
        "Häller vatten på honom och ger honom kaffe."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "\"Kraftigt berusad och svårväckt\" är per definition ett medicinskt risktillstånd – alkoholförgiftning dödar, och kaffe eller sömn är ingen behandling. Sjukvårdsbedömning först. Omhändertagande av berusade (LOB) är sedan en fråga för polis och ordningsvakt, inte för väktaren.",
      "tags": [
        "roller",
        "sjukvard"
      ]
    },
    {
      "id": 85,
      "category": "event",
      "categoryLabel": "Arenor och event",
      "level": "grund",
      "source": "v1",
      "title": "\"Skott!\"",
      "scenario": "Under ett evenemang ropar någon \"skott!\" och panik utbryter i folkmassan. Du har inte själv hört några skott. Vad gör du?",
      "options": [
        "Ropar att alla ska lugna sig – det är säkert falskt alarm.",
        "Springer mot platsen ropet kom från för att kontrollera.",
        "Gömmer dig och väntar tills allt är över.",
        "Agerar enligt principen fly – sök skydd – larma: hjälp människor bort från området och in i skydd, öppna utrymningsvägar, larma 112 med tydlig lägesinformation (plats, vad som ropats, folkströmmar) och håll radiodisciplin. Du konfronterar inte en eventuell gärningsman."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Vid misstänkt pågående dödligt våld gäller: rädda liv genom utrymning och skydd, larma med precis information, och lämna konfrontationen till polisen. Att ropet kan vara falskt ändrar inte första insatsen – paniken i sig skadar människor, och utrymningsvägarna måste öppnas oavsett.",
      "tags": [
        "brand",
        "larm"
      ]
    },
    {
      "id": 86,
      "category": "event",
      "categoryLabel": "Arenor och event",
      "level": "grund",
      "source": "v1",
      "title": "\"Jag är med bandet\"",
      "scenario": "Vid backstage-ingången dyker en man upp utan ackreditering: \"Jag är med bandet, min tagg ligger i tourbussen. Kolla med vem som helst.\" Vad gör du?",
      "options": [
        "Håller honom kvar utanför och verifierar via produktionsledningen eller turnéansvarig enligt ackrediteringsrutinen. Ingen passerar utan bekräftelse – hur trovärdig historien än låter. Erbjud honom att vänta medan du kontrollerar.",
        "Släpper in honom – han kan ju bandets låtar.",
        "Släpper in honom om någon i kön går i god för honom.",
        "Avvisar honom direkt utan att kontrollera något."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Backstage finns artister, kontanter och utrustning – och \"min tagg ligger någon annanstans\" är standardrepliken vid försök till obehörigt tillträde. Skillnaden mellan bra och dålig bevakning är att verifieringen faktiskt görs, varje gång, vänligt och utan undantag.",
      "tags": [
        "allmant"
      ]
    },
    {
      "id": 87,
      "category": "event",
      "categoryLabel": "Arenor och event",
      "level": "grund",
      "source": "v1",
      "title": "Supporterbråket",
      "scenario": "På läktaren ryker två supportrar ihop och börjar slåss. Runt dem trängs andra åskådare. Vad gör du?",
      "options": [
        "Kastar dig ensam in i klungan och drar isär dem.",
        "Låter dem hållas – de lugnar sig nog.",
        "Larmar via radio enligt rutin (ordningsvakter, kollegor, polis), tar dig dit, försöker bryta verbalt och skapa yta genom att flytta undan publik – och ingriper fysiskt först med tillräckligt många kollegor, med försvarligt våld. Envarsgripande på bar gärning för misshandel kan bli aktuellt.",
        "Filmar bråket för rapporten i stället för att agera."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Ensamingripanden i folkmassa är farliga – supportrar kan vända sig mot den som ingriper. Larma, samla styrka, skydda tredje man och agera samordnat. På arenor arbetar väktare oftast tillsammans med ordningsvakter, som har utökade befogenheter att avlägsna och omhänderta.",
      "tags": [
        "envarsgripande",
        "roller",
        "larm"
      ]
    },
    {
      "id": 88,
      "category": "event",
      "categoryLabel": "Arenor och event",
      "level": "grund",
      "source": "v1",
      "title": "Mobilen på golvet",
      "scenario": "Efter konserten hittar du en mobiltelefon på golvet i den tömda lokalen. Vad gör du?",
      "options": [
        "Lägger den i fickan – upphittat tillhör upphittaren.",
        "Lämnar den där – ägaren kommer säkert tillbaka.",
        "Använder den för att ringa \"Mamma\" i kontaktlistan.",
        "Hanterar den som hittegods: dokumentera fyndplats och tid, lämna in enligt arrangörens rutin och i förlängningen till polisen om ägaren inte nås. Kvittera enligt din instruktion."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Hittegodslagen gäller: upphittat gods ska anmälas och ägaren har rätt att få tillbaka det. Ordnad dokumentation skyddar också dig – värdesaker som \"försvinner\" efter att en väktare hanterat dem är en förtroendefråga för hela branschen.",
      "tags": [
        "hittegods"
      ]
    },
    {
      "id": 89,
      "category": "event",
      "categoryLabel": "Arenor och event",
      "level": "grund",
      "source": "v1",
      "title": "Langaren på festivalcampingen",
      "scenario": "På festivalens campingområde ser du en person som öppet säljer små påsar till en kö av köpare. Vad gör du?",
      "options": [
        "Går fram och kräver att få se vad påsarna innehåller.",
        "Observerar diskret och dokumenterar (signalement, plats, tält/fordon, tider) och rapporterar omgående till polisen på området via festivalens säkerhetsorganisation. Du ingriper inte själv.",
        "Köper en påse som bevis.",
        "Sprider ryktet bland besökarna att polisen är på väg, så att försäljningen upphör."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "På större festivaler finns polis på plats och en samlad säkerhetsorganisation – misstänkt narkotikaförsäljning kanaliseras dit. Egna ingripanden riskerar både din säkerhet och polisens spaningsarbete, som kan pågå utan att du vet om det.",
      "tags": [
        "envarsgripande",
        "roller"
      ]
    },
    {
      "id": 90,
      "category": "event",
      "categoryLabel": "Arenor och event",
      "level": "grund",
      "source": "v1",
      "title": "Nattbevakningen av montern",
      "scenario": "Du nattbevakar en mässhall. Kl. 03 kommer två män med en skåpbil: \"Vi ska hämta vår utställningsutrustning nu, vi hinner inte i morgon.\" De saknar utpasseringshandlingar. Vad gör du?",
      "options": [
        "Nekar utlämning tills hämtningen verifierats med utställaren eller mässarrangören enligt rutin, dokumenterar besöket (namn, registreringsnummer, tid) och rapporterar. Gods lämnar hallen endast med godkänd handling.",
        "Släpper ut godset om de kan beskriva montern rätt.",
        "Hjälper dem bära – de har ju bråttom.",
        "Ringer 112 och rapporterar ett pågående inbrott."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Nattliga \"hämtningar\" utan papper är ett klassiskt upplägg för mässtölder – och just därför finns utpasseringsrutinen. Att kunna beskriva montern bevisar ingenting; det kan vilken besökare som helst. Verifiera, dokumentera, och stå fast vänligt men orubbligt.",
      "tags": [
        "dokumentation"
      ]
    },
    {
      "id": 91,
      "category": "juridik",
      "categoryLabel": "Juridik och befogenheter",
      "level": "grund",
      "source": "v1",
      "title": "Mannen som urinerar",
      "scenario": "Utanför entrén till ditt objekt står en man och urinerar mot fasaden, mitt framför förbipasserande. Vad gör du?",
      "options": [
        "Griper honom på bar gärning – det är ju ett brott.",
        "Håller kvar honom tills polis kommer och skriver böter.",
        "Säger till honom att sluta och lämna platsen, dokumenterar och rapporterar enligt rutin. Något envarsgripande är inte tillåtet: förargelseväckande beteende har endast penningböter i straffskalan – fängelse ingår inte.",
        "Spolar av fasaden och låter saken bero helt."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Envarsgripande kräver att fängelse ingår i brottets straffskala. Förargelseväckande beteende ger bara penningböter – därför finns ingen gripanderätt, hur störande beteendet än är. Ett bra kontrollexempel för att testa om användaren förstått grundregeln i RB 24 kap. 7 §.",
      "tags": [
        "envarsgripande"
      ]
    },
    {
      "id": 92,
      "category": "juridik",
      "categoryLabel": "Juridik och befogenheter",
      "level": "grund",
      "source": "v1",
      "title": "Den efterlyste",
      "scenario": "Vid din station känner du igen en man från polisens efterlysning: han är efterlyst för grov misshandel. Han har inte begått något brott inför dina ögon. Vad gör du?",
      "options": [
        "Du får inte göra något alls – du såg ju inget brott.",
        "Larmar polisen omgående med position och signalement och håller diskret uppsikt. Envarsgripande av efterlysta är visserligen tillåtet enligt RB 24 kap. 7 §, men mot en person efterlyst för grovt våldsbrott väger säkerhetsbedömningen tyngst – grip endast om det kan ske utan allvarlig risk.",
        "Går fram och konfronterar honom med att du vet vem han är.",
        "Följer efter honom hem för att kunna ge polisen hans adress."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Lagen ger envar rätt att gripa den som är efterlyst för brott – bar gärning krävs inte i det fallet. Men rätten är ingen skyldighet, och en person efterlyst för grov misshandel utgör en påtaglig risk. Diskret uppsikt och snabb, precis information till polisen är oftast den bästa insatsen.",
      "tags": [
        "envarsgripande",
        "roller",
        "efterlyst"
      ]
    },
    {
      "id": 93,
      "category": "juridik",
      "categoryLabel": "Juridik och befogenheter",
      "level": "grund",
      "source": "v1",
      "title": "Väskryckningen på väg hem",
      "scenario": "Du är på väg hem efter passet, fortfarande i uniform, när du ser en man rycka en handväska från en äldre kvinna och springa. Vad gör du?",
      "options": [
        "Gör ingenting – du är inte i tjänst och har inga befogenheter nu.",
        "Ropar \"Stanna, väktare!\" och skjuter varningsskott i luften.",
        "Jagar gärningsmannen i flera kvarter, oavsett vad som händer med kvinnan.",
        "Agerar som envar utifrån läget: larma 112, ta hand om kvinnan och säkra signalement och flyktriktning – och grip på flyende fot endast om det kan ske säkert. Utanför tjänst har du samma rättigheter som alla andra, varken mer eller mindre."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Envarsgripanderätten är knuten till dig som människa, inte till uniformen – den gäller dygnet runt. Men utanför tjänst saknar du radio, kollegor och uppdrag: brottsoffret och larmandet går först, och riskbedömningen blir ännu viktigare. Uniformen ger dig inga extra befogenheter, bara extra förväntningar.",
      "tags": [
        "envarsgripande",
        "larm"
      ]
    },
    {
      "id": 94,
      "category": "juridik",
      "categoryLabel": "Juridik och befogenheter",
      "level": "grund",
      "source": "v1",
      "title": "Frågan på festen",
      "scenario": "På en privat fest frågar en bekant nyfiket: \"Du bevakar ju det där lagret – vad har de för larm egentligen, och vilka tider ronderar ni?\" Vad gör du?",
      "options": [
        "Avböjer vänligt att svara och byter samtalsämne. Din tystnadsplikt enligt lagen om bevakningsföretag gäller dygnet runt, även mot vänner, och även efter att anställningen upphört. Vid upprepade eller misstänkta frågor rapporterar du till din arbetsledning.",
        "Berättar lite ungefärligt – det är ju ingen hemlighet på riktigt.",
        "Berättar allt men får hen att lova att inte föra det vidare.",
        "Hittar på felaktiga uppgifter så att hen luras."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Uppgifter om larm, rutiner och ronderingstider är exakt den information kriminella kartlägger inför brott – och \"oskyldiga frågor\" på fester är en känd metod. Tystnadsplikten är lagstadgad och personlig. Att någon frågar systematiskt är dessutom i sig värt att rapportera.",
      "tags": [
        "tystnadsplikt",
        "dokumentation"
      ]
    },
    {
      "id": 95,
      "category": "juridik",
      "categoryLabel": "Juridik och befogenheter",
      "level": "grund",
      "source": "v1",
      "title": "Klagomålet efter gripandet",
      "scenario": "En person du grep i förra veckan har klagat till din arbetsgivare och hävdar att du använde övervåld. Du vet att du agerade korrekt. Vad gör du?",
      "options": [
        "Ringer upp personen och förklarar hur fel hen har.",
        "Skriver om din rapport i efterhand så att den blir mer detaljerad till din fördel.",
        "Medverkar öppet och sakligt i arbetsgivarens utredning, hänvisar till din ingriparapport från händelsen och kompletterar muntligt vid behov. Du ändrar aldrig något i originalrapporten i efterhand.",
        "Ber kollegorna skriva intyg om att du är en lugn person."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Klagomål är en normal del av yrket och ska tas på allvar – för allas rättssäkerhet. Din rapport från händelsen är ditt starkaste skydd, men bara om den är orörd: ändringar i efterhand förstör dess bevisvärde och din trovärdighet. Transparens är rätt strategi när du agerat rätt.",
      "tags": [
        "dokumentation"
      ]
    },
    {
      "id": 96,
      "category": "juridik",
      "categoryLabel": "Juridik och befogenheter",
      "level": "grund",
      "source": "v1",
      "title": "Ordningsvaktens begäran",
      "scenario": "En ordningsvakt vid krogen intill ditt objekt är upptagen med ett bråk och ropar till dig: \"Ta hand om den där berusade killen enligt LOB så länge!\" Vad gör du?",
      "options": [
        "Omhändertar mannen – ordningsvakten delegerade ju uppgiften.",
        "Förklarar snabbt att du som väktare inte har LOB-befogenhet, men hjälper till inom din roll: håller uppsikt över den berusade, pratar lugnande, larmar polis om det behövs och skyddar honom från trafik och fara. Vid ett direkt angrepp gäller nödvärn.",
        "Sätter handfängsel på den berusade så han inte går någonstans.",
        "Går därifrån – krogens problem är inte ditt uppdrag."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Befogenheter kan aldrig \"lånas ut\": LOB-omhändertaganden får endast polis och ordningsvakt göra, oavsett vem som ber om hjälp. Men att hjälpa en kollega inom ramen för din egen roll – uppsikt, omsorg, larmning – är både tillåtet och rätt. Att veta var din gräns går är kärnan i yrket.",
      "tags": [
        "roller"
      ]
    },
    {
      "id": 97,
      "category": "brand_nodlage",
      "categoryLabel": "Brand och nödläge",
      "level": "grund",
      "source": "v1",
      "title": "Röken från papperskorgen",
      "scenario": "Under rondering i en kontorskorridor ser du lågor och rök från en papperskorg. Några personer arbetar sent i rummen intill. Vad gör du?",
      "options": [
        "Springer direkt och hämtar en brandsläckare två våningar ner.",
        "Filmar branden och skickar till ledningscentralen för bedömning.",
        "Öppnar fönstren så röken vädras ut.",
        "Följer RVLS: Rädda och varna dem som är i omedelbar fara, larma 112 (och internt), släck sedan med närmaste släckare om det kan ske utan risk – och stäng dörrar bakom dig för att begränsa rök och brand."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Ordningen Rädda – Varna – Larma – Släck finns för att människor går före egendom och för att hjälpen ska vara på väg även om släckförsöket misslyckas. Öppna fönster ger branden syre – stängda dörrar är ett av dina mest effektiva verktyg.",
      "tags": [
        "brand",
        "larm"
      ]
    },
    {
      "id": 98,
      "category": "brand_nodlage",
      "categoryLabel": "Brand och nödläge",
      "level": "grund",
      "source": "v1",
      "title": "Automatlarmet utan rök",
      "scenario": "Brandlarmet på ditt objekt löser ut. Vid den angivna sektionen syns ingen rök och känns ingen lukt. Vad gör du?",
      "options": [
        "Undersöker orsaken enligt objektets rutin utan att avfärda larmet, återställer inte förrän orsaken är klarlagd, och möter räddningstjänsten vid angiven plats med nycklar, orienteringsritning och lägesinformation.",
        "Återställer larmet direkt – det var uppenbarligen fel på detektorn.",
        "Ringer räddningstjänsten och säger att de kan vända.",
        "Väntar utanför tills larmet tystnar av sig självt."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "En brand kan pyra dold ovanför undertak eller i schakt långt innan rök syns i korridoren – \"ingen rök\" betyder inte \"ingen brand\". Att möta räddningstjänsten med nycklar och lokalkunskap är en av väktarens viktigaste uppgifter vid larm, och avbeställning är räddningsledarens beslut, inte ditt.",
      "tags": [
        "brand",
        "larm"
      ]
    },
    {
      "id": 99,
      "category": "brand_nodlage",
      "categoryLabel": "Brand och nödläge",
      "level": "grund",
      "source": "v1",
      "title": "Blödningen",
      "scenario": "En besökare har fallit genom en glasdörr och har en kraftig, pulserande blödning från underarmen. Vad gör du?",
      "options": [
        "Springer efter förbandslådan i vaktlokalen tre våningar bort.",
        "Lägger en tryckförband löst så det inte gör ont.",
        "Tryck direkt och hårt mot såret omedelbart – med förband, tygtrasa eller handen – larma 112 (eller peka ut någon som ringer), håll personen liggande och varm, och utse någon som möter ambulansen. Släpp inte trycket.",
        "Ger personen vatten att dricka mot chocken."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Vid kraftig blödning räknas sekunder och direkt tryck är den åtgärd som räddar liv – improvisera med det som finns inom räckhåll i stället för att lämna personen. Delegera larmning och ambulansmöte så att du kan hålla trycket. Dryck ges aldrig till svårt skadade.",
      "tags": [
        "sjukvard"
      ]
    },
    {
      "id": 100,
      "category": "brand_nodlage",
      "categoryLabel": "Brand och nödläge",
      "level": "grund",
      "source": "v1",
      "title": "Den livlöse",
      "scenario": "I en korridor på ditt objekt hittar du en person som ligger livlös på golvet. Personen reagerar inte på tilltal eller försiktig skakning, och andas inte normalt. Vad gör du?",
      "options": [
        "Lägger personen i stabilt sidoläge och inväntar ambulans.",
        "Larmar 112 (sätt på högtalarfunktionen), startar omedelbart hjärt-lungräddning med 30 kompressioner följt av 2 inblåsningar, skickar någon – eller hämtar själv om du är ensam och vet var den finns – efter närmaste hjärtstartare, och fortsätter utan avbrott tills hjälp tar över.",
        "Söker efter ID-handlingar för att kunna ringa anhöriga.",
        "Kontrollerar puls i fem minuter för att vara helt säker."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Medvetslös + onormal andning = hjärtstopp tills motsatsen bevisats, och varje minut utan HLR minskar överlevnadschansen med cirka tio procent. SOS-operatören coachar dig via högtalaren. Stabilt sidoläge är enbart för medvetslösa som andas normalt.",
      "tags": [
        "sjukvard"
      ]
    },
    {
      "id": 101,
      "category": "vardetransport",
      "categoryLabel": "Värdetransport",
      "level": "fordjupning",
      "source": "v2",
      "title": "Överfallet vid lastkajen",
      "scenario": "Under lastning vid en butik konfronteras du och din kollega av två maskerade män med tillhyggen som skriker åt er att lämna ifrån er väskan. Vad gör ni?",
      "options": [
        "Försvarar väskan – godset är ert ansvar.",
        "Lämnar ifrån er godset utan motstånd, drar er undan, larmar så snart det kan ske säkert och koncentrerar er på signalement, tillhyggen och flyktväg.",
        "Springer efter rånarna för att se vart de tar vägen.",
        "Kastar väskan åt ett annat håll och tar upp jakten."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Vid rån gäller branschens järnregel: liv och hälsa går alltid före gods – godset är försäkrat, det är inte ni. Efterföljande är förbjudet enligt säkerhetsrutinerna; era iakttagelser är det värdefullaste ni kan ge polisen.",
      "tags": [
        "ran",
        "egen_sakerhet"
      ]
    },
    {
      "id": 102,
      "category": "vardetransport",
      "categoryLabel": "Värdetransport",
      "level": "fordjupning",
      "source": "v2",
      "title": "Den ändrade rutten",
      "scenario": "Mitt under en tur ringer en okänd röst som uppger sig vara från trafikledningen och beordrar er att köra till en ny, oplanerad hämtplats. Vad gör ni?",
      "options": [
        "Följer ordern – trafikledningen bestämmer rutten.",
        "Kör dit men håller extra uppsikt.",
        "Ber personen faxa en bekräftelse.",
        "Verifierar ordern via er ordinarie kanal och rutin innan någon avvikelse görs – ruttändringar följs aldrig på ett inkommande samtal från okänd."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Falska ruttändringar är en klassisk metod för att styra en transport till en förberedd plats. All verifiering sker via era egna, kända kanaler enligt rutin – aldrig via uppgifter som den som ringer själv lämnar.",
      "tags": [
        "social_manipulation",
        "rutin"
      ]
    },
    {
      "id": 103,
      "category": "vardetransport",
      "categoryLabel": "Värdetransport",
      "level": "fordjupning",
      "source": "v2",
      "title": "Frågorna på fikarasten",
      "scenario": "En bekant på ditt gym frågar nyfiket vilka tider ni brukar hämta pengar vid ett visst köpcentrum – 'jag såg er där i förra veckan'. Vad gör du?",
      "options": [
        "Avböjer vänligt att prata om rutter och tider, byter ämne – och rapporterar frågorna till arbetsledningen, särskilt om de återkommer.",
        "Berättar ungefärliga tider – exakta tider är ju hemliga.",
        "Säger fel tider med flit för att vilseleda.",
        "Berättar som det är – han är ju en bekant."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Tider och rutter är exakt den information ett rånupplägg byggs på, och tystnadsplikten gäller dygnet runt. Systematiska frågor om rutiner är dessutom i sig en varningssignal som ska rapporteras.",
      "tags": [
        "tystnadsplikt",
        "social_manipulation"
      ]
    },
    {
      "id": 104,
      "category": "vardetransport",
      "categoryLabel": "Värdetransport",
      "level": "fordjupning",
      "source": "v2",
      "title": "Bilen i backspegeln",
      "scenario": "Du noterar att samma personbil legat bakom värdetransporten genom tre svängar och en rondell. Vad gör ni?",
      "options": [
        "Stannar vid vägkanten och låter bilen köra om.",
        "Kör hem till garaget den snabbaste vägen.",
        "Larmar trafikledningen enligt rutin, noterar registreringsnummer, undviker att stanna på enskilda platser och styr mot ett säkert läge enligt instruktion.",
        "Bromsar in kraftigt för att markera att ni sett bilen."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Misstänkt efterföljning hanteras enligt en förberedd rutin: larma tidigt, dokumentera och sök säkerhet – aldrig konfrontation eller stopp på enslig plats. Det trafikledningen vet i realtid kan polisen agera på.",
      "tags": [
        "rutin",
        "egen_sakerhet"
      ]
    },
    {
      "id": 105,
      "category": "vardetransport",
      "categoryLabel": "Värdetransport",
      "level": "fordjupning",
      "source": "v2",
      "title": "Den blockerade lastkajen",
      "scenario": "När ni anländer till en hämtning står en främmande skåpbil parkerad så att den blockerar er ordinarie uppställningsplats vid lastkajen. Ingen förare syns. Vad gör ni?",
      "options": [
        "Ställer er dubbelparkerade bredvid och genomför hämtningen snabbt.",
        "Avviker från platsen, larmar trafikledningen och avbryter hämtningen enligt rutin tills läget är kontrollerat – en blockerad angöring är en klassisk förberedelse.",
        "Bär godset en längre väg runt skåpbilen.",
        "Väntar i bilen tills skåpbilen flyttas."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Ett rånupplägg börjar ofta med att styra transporten till en sämre position. Avvikelser på hämtplatsen möts med avbrott och larm – hämtningen kan alltid göras senare, ett överfall kan inte göras ogjort.",
      "tags": [
        "rutin",
        "egen_sakerhet"
      ]
    },
    {
      "id": 106,
      "category": "vardetransport",
      "categoryLabel": "Värdetransport",
      "level": "fordjupning",
      "source": "v2",
      "title": "Kollegan som genar",
      "scenario": "Din kollega vill lämna transportbilen olåst med motorn igång 'i trettio sekunder' medan ni båda bär in gods. Vad gör du?",
      "options": [
        "Går med på det – det sparar tid.",
        "Säger inget men skriver en anonym lapp till chefen.",
        "Låter kollegan bestämma – han är äldst i tjänsten.",
        "Säger ifrån direkt och följer rutinen – bilen lämnas aldrig olåst – och rapporterar om genvägarna upprepas."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Säkerhetsrutinerna är transportens skalskydd, och varje genväg är en lucka någon kan ha väntat på. Att säga ifrån på plats är äkta kollegialitet – och upprepade avsteg är en avvikelse som ska rapporteras.",
      "tags": [
        "rutin",
        "kollegialitet"
      ]
    },
    {
      "id": 107,
      "category": "vardetransport",
      "categoryLabel": "Värdetransport",
      "level": "fordjupning",
      "source": "v2",
      "title": "Mannen som behöver hjälp",
      "scenario": "Mitt under bärningsmomentet kommer en man fram och ber dig växla en femhundralapp – han står tätt intill och pratar högt. Vad gör du?",
      "options": [
        "Avböjer kort och vänligt utan att stanna upp, fullföljer momentet medan din kollega håller uppsikt – och rapporterar händelsen.",
        "Stannar och hjälper honom – service är viktigt.",
        "Skäller ut honom för att han stör.",
        "Ställer ner väskan och visar honom till närmaste butik."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Distraktion är rånets vanligaste förspel: en person upptar din uppmärksamhet medan någon annan agerar. Under pågående moment bryts fokus aldrig – artigt, kort och i rörelse.",
      "tags": [
        "social_manipulation",
        "egen_sakerhet"
      ]
    },
    {
      "id": 108,
      "category": "vardetransport",
      "categoryLabel": "Värdetransport",
      "level": "fordjupning",
      "source": "v2",
      "title": "Ensam i dag?",
      "scenario": "En kollega är sjuk och trafikledningen frågar om du kan köra ett moment ensam som enligt rutinen kräver dubbelbemanning. Vad gör du?",
      "options": [
        "Kör ensam – det är ju bara den här gången.",
        "Kör men hoppar över de farligaste hämtningarna.",
        "Avböjer och eskalerar: bemanningskravet är ett säkerhetskrav, och momentet får läggas om eller skjutas upp tills bemanningen finns.",
        "Tar med en väktarkollega från ett annat uppdrag utan att fråga någon."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Dubbelbemanning på riskmoment är en arbetsmiljö- och säkerhetsregel, inte en bekvämlighet. Underbemanning möts med ombokning – aldrig med att en person tar två personers risk.",
      "tags": [
        "arbetsmiljo",
        "rutin"
      ]
    },
    {
      "id": 109,
      "category": "vardetransport",
      "categoryLabel": "Värdetransport",
      "level": "fordjupning",
      "source": "v2",
      "title": "Hotet i mobilen",
      "scenario": "Kvällen före ett pass får du ett sms till din privata mobil: 'Vi vet vilken tur du kör i morgon. Sjukanmäl dig.' Vad gör du?",
      "options": [
        "Blockerar numret och kör som vanligt.",
        "Rapporterar omedelbart till arbetsledningen och polisanmäler – turen läggs om enligt säkerhetsrutin, och hotet dokumenteras ordagrant.",
        "Sjukanmäler dig som sms:et säger.",
        "Svarar och frågar vem det är."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Ett riktat hot med kunskap om din tur betyder att någon har information de inte ska ha – det är både ett brott mot dig och en säkerhetsläcka. Tystnad skyddar ingen; rapporten gör att både turen och du kan skyddas.",
      "tags": [
        "hot",
        "rapportering"
      ]
    },
    {
      "id": 110,
      "category": "vardetransport",
      "categoryLabel": "Värdetransport",
      "level": "fordjupning",
      "source": "v2",
      "title": "Den extra väskan",
      "scenario": "Vid en hämtning ber butikschefen er ta med en extra, oanmäld väska 'när ni ändå kör' – den finns inte på er hämtlista. Vad gör ni?",
      "options": [
        "Tar med den – kunden betalar för tjänsten.",
        "Tar med den om chefen skriver sitt namn på en lapp.",
        "Öppnar väskan och kontrollerar innehållet själva.",
        "Avböjer vänligt: endast aviserat gods enligt hämtlistan transporteras – och rapporterar önskemålet så att kunden kan avisera korrekt."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Oanmält gods är en säkerhetsrisk i sig – ingen vet vad väskan innehåller eller vem som packat den – och hämtlistan är transportens kontrollkedja. Ändringar går via avisering och rutin, aldrig över disk.",
      "tags": [
        "rutin",
        "over_disk"
      ]
    },
    {
      "id": 111,
      "category": "vardetransport",
      "categoryLabel": "Värdetransport",
      "level": "fordjupning",
      "source": "v2",
      "title": "Motorstopp på ensliga vägen",
      "scenario": "Transportbilen får motorstopp på en enslig vägsträcka. En bil stannar bakom er och föraren kliver ur för att 'hjälpa till'. Vad gör ni?",
      "options": [
        "Stannar i den låsta bilen, larmar trafikledningen enligt rutin och avböjer hjälpen genom rutan – ni inväntar er egen assistans.",
        "Kliver ur och tar emot hjälpen – folk är hyggliga.",
        "Ber föraren skjutsa en av er till närmaste mack.",
        "Lämnar bilen och ställer er en bit bort."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "En stillastående värdetransport är ett utsatt läge, och 'spontan hjälp' på enslig plats kan vara allt annat än spontan. Bilen är ert skydd: låst, larmad kontakt med trafikledningen och egen assistans enligt rutin.",
      "tags": [
        "egen_sakerhet",
        "rutin"
      ]
    },
    {
      "id": 112,
      "category": "vardetransport",
      "categoryLabel": "Värdetransport",
      "level": "fordjupning",
      "source": "v2",
      "title": "Bilden från förarplatsen",
      "scenario": "En kollega har lagt ut en bild på sociala medier tagen från förarplatsen i värdetransportbilen, med kommentaren 'dagens kontor'. Vad gör du?",
      "options": [
        "Gillar bilden – den är ju snyggt tagen.",
        "Skriver en kommentar om att den borde tas bort.",
        "Ber kollegan ta bort bilden direkt och rapporterar enligt rutin – bilden kan röja fordon, utrustning, tider och rutter.",
        "Gör inget – bilden visar ju inga pengar."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "En oskyldig bild läcker mer än man tror: interiör, utrustning, tidpunkt via metadata, igenkännbar plats. Tystnadsplikten och säkerhetsrutinerna gäller även i flödet – och rapporten skyddar hela laget.",
      "tags": [
        "tystnadsplikt",
        "sociala_medier"
      ]
    },
    {
      "id": 113,
      "category": "larmcentral",
      "categoryLabel": "Larmcentral",
      "level": "fordjupning",
      "source": "v2",
      "title": "Tre larm samtidigt",
      "scenario": "Som larmoperatör får du inom samma minut: ett överfallslarm från en butik, ett inbrottslarm från ett lager och ett driftlarm från en frysanläggning. Vad gör du?",
      "options": [
        "Tar dem i den ordning de kom in.",
        "Skickar närmaste väktare till lagret – inbrott är ju brott.",
        "Prioriterar överfallslarmet: polis och närmaste enhet dit först – fara för liv går före egendom – medan övriga larm köas och bevakas.",
        "Ringer frysanläggningen först eftersom varor kan förstöras."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Prioriteringen följer alltid samma trappa: liv och hälsa, sedan egendom, sedan drift. Ett överfallslarm betyder en människa i fara just nu – de andra larmen väntar utan att någon skadas.",
      "tags": [
        "prioritering",
        "overfallslarm"
      ]
    },
    {
      "id": 114,
      "category": "larmcentral",
      "categoryLabel": "Larmcentral",
      "level": "fordjupning",
      "source": "v2",
      "title": "Väktaren som tystnade",
      "scenario": "En ensamarbetande väktare rapporterade position inför ett ingripande för åtta minuter sedan och svarar nu inte på anrop. Vad gör du?",
      "options": [
        "Eskalerar direkt: försöker nå väktaren via alternativ kanal, skickar närmaste enhet till positionen och kontaktar polis enligt rutinen för utebliven kontakt.",
        "Väntar en kvart till – ingripanden tar tid.",
        "Noterar i loggen och fortsätter med annat.",
        "Ringer väktarens privata mobil i en timme."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Utebliven kontakt efter ett anmält ingripande behandlas som ett nödläge tills motsatsen bevisats. Varje minut räknas om väktaren ligger skadad – rutinen finns för att hjälpen ska rulla innan någon hunnit ropa.",
      "tags": [
        "ensamarbete",
        "eskalering"
      ]
    },
    {
      "id": 115,
      "category": "larmcentral",
      "categoryLabel": "Larmcentral",
      "level": "fordjupning",
      "source": "v2",
      "title": "Bombhotet i luren",
      "scenario": "En uppringare säger lugnt att en bomb är placerad i en galleria ni bevakar och nämner plats och tidpunkt. Vad gör du?",
      "options": [
        "Avfärdar det – bombhot är nästan alltid falska.",
        "Lägger på och ringer gallerian.",
        "Ber personen ringa polisen i stället.",
        "Håller kvar samtalet så länge det går, antecknar ordagrant vad som sägs samt röst och bakgrundsljud, larmar polis parallellt och aktiverar objektets hotrutin."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Varje bombhot hanteras som skarpt tills polisen bedömt det. Samtalet är bevismaterialet: exakta ord, röstläge och bakgrundsljud kan avgöra både hotbedömning och utredning – och rutinen aktiverar rätt personer utan dröjsmål.",
      "tags": [
        "hot",
        "rutin"
      ]
    },
    {
      "id": 116,
      "category": "larmcentral",
      "categoryLabel": "Larmcentral",
      "level": "fordjupning",
      "source": "v2",
      "title": "Misshandeln i kameran",
      "scenario": "Du ser i realtid hur en person misshandlas på en bevakad parkeringsyta. Närmaste väktare är ensam och fyra minuter bort. Vad gör du?",
      "options": [
        "Skickar väktaren och säger åt honom att ingripa direkt vid framkomst oavsett läge.",
        "Larmar polis via 112 omedelbart med lägesbild, skickar väktaren med instruktion att prioritera egen säkerhet och offrets skydd – och fortsätter rapportera det du ser i kameran.",
        "Väntar med polis tills väktaren bekräftat att det verkligen är en misshandel.",
        "Zoomar in och spelar in utan att larma – bevisningen är viktigast."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Pågående våld är polisens larm i första hand – och din kamerabild är guld i realtid: antal, vapen, riktning. Väktaren skickas med tydlig ram: skydda offret om det kan ske säkert, aldrig ensamingripande mot överläge.",
      "tags": [
        "prioritering",
        "egen_sakerhet"
      ]
    },
    {
      "id": 117,
      "category": "larmcentral",
      "categoryLabel": "Larmcentral",
      "level": "fordjupning",
      "source": "v2",
      "title": "Koden i telefonen",
      "scenario": "En person ringer och uppger sig vara butiksägaren: 'Jag har glömt larmkoden, kan du läsa upp den? Jag står utanför min butik.' Vad gör du?",
      "options": [
        "Läser upp koden – han lät stressad och trovärdig.",
        "Ber honom beskriva butiken som bevis.",
        "Säger koden om han kan uppge organisationsnumret.",
        "Läser aldrig ut koder på inkommande samtal – verifierar identiteten enligt rutin, till exempel genom motringning till registrerat nummer eller kodord, och hanterar därefter ärendet."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Den som ringer in bestämmer själv vem den utger sig för att vara – verifiering sker alltid via era egna registrerade kanaler. En utläst larmkod till fel person är ett fullbordat inbrott i förskott.",
      "tags": [
        "social_manipulation",
        "rutin"
      ]
    },
    {
      "id": 118,
      "category": "larmcentral",
      "categoryLabel": "Larmcentral",
      "level": "fordjupning",
      "source": "v2",
      "title": "Journalisten",
      "scenario": "En journalist ringer larmcentralen och vill ha detaljer om nattens uppmärksammade händelse på ett av era objekt. Vad gör du?",
      "options": [
        "Hänvisar vänligt till företagets pressansvariga utan att bekräfta eller kommentera någonting om händelsen eller objektet.",
        "Berättar det som ändå står i tidningen.",
        "Bekräftar att något hänt men inte vad.",
        "Ber journalisten ringa kunden direkt och ger numret."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Tystnadsplikten gäller även det som 'alla redan vet' – varje bekräftelse är en uppgift. Pressfrågor har en enda väg: den pressansvariga. Vänligt, kort och utan att bekräfta ens att objektet är ert.",
      "tags": [
        "tystnadsplikt",
        "media"
      ]
    },
    {
      "id": 119,
      "category": "larmcentral",
      "categoryLabel": "Larmcentral",
      "level": "fordjupning",
      "source": "v2",
      "title": "Falsklarmet på trettio sekunder",
      "scenario": "En väktare rapporterar 'falsklarm, åker vidare' trettio sekunder efter framkomst till ett inbrottslarm, utan att ha hunnit runt byggnaden. Vad gör du?",
      "options": [
        "Godkänner – väktaren är ju på plats och ser läget.",
        "Noterar tiden och säger inget.",
        "Begär fullständig kontroll enligt objektsinstruktionen innan larmet får avskrivas – och loggar avvikelsen om kontrollen brister.",
        "Skickar en annan väktare i smyg för att dubbelkolla."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Falsklarm är en slutsats som kräver fullständig kontroll – trettio sekunder räcker inte runt en byggnad. Larmcentralen är kvalitetsvakten: begär, dokumentera och följ upp, för nästa gång kan det vara på riktigt.",
      "tags": [
        "rutin",
        "kvalitet"
      ]
    },
    {
      "id": 120,
      "category": "larmcentral",
      "categoryLabel": "Larmcentral",
      "level": "fordjupning",
      "source": "v2",
      "title": "Brand och inbrott samtidigt",
      "scenario": "Från samma objekt kommer ett automatiskt brandlarm och trettio sekunder senare ett inbrottslarm från en annan sektion. Vad gör du?",
      "options": [
        "Avvaktar – dubbla larm brukar vara tekniska fel.",
        "Behandlar det som möjligt samordnat: räddningstjänsten är redan larmad via brandlarmet, du larmar även polis, skickar väktare med skärpt lägesbild och informerar alla om dubbellarmet.",
        "Skickar bara väktare – de får reda ut vad det är.",
        "Återställer inbrottslarmet så att räddningstjänsten kan jobba ostört."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Anlagd brand används som avledning vid inbrott – och tvärtom. Dubbla larm från samma objekt höjer beredskapen i stället för att sänka den, och alla på väg dit ska veta att bilden kan vara större än ett larm.",
      "tags": [
        "prioritering",
        "brand"
      ]
    },
    {
      "id": 121,
      "category": "larmcentral",
      "categoryLabel": "Larmcentral",
      "level": "fordjupning",
      "source": "v2",
      "title": "Den tysta panikknappen",
      "scenario": "En ensamarbetande receptionist på ett kontor har tryckt på sitt överfallslarm. Linjen är öppen men tyst. Vad gör du?",
      "options": [
        "Behandlar larmet som skarpt: lyssnar på den öppna linjen utan att röja den, larmar polis och skickar närmaste enhet – och ringer inte upp objektet på ett sätt som kan avslöja larmet.",
        "Ringer upp receptionen direkt och frågar högt om allt är okej.",
        "Väntar fem minuter – knappen kan ha tryckts av misstag.",
        "Skickar ett sms till receptionisten."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Ett tyst överfallslarm är tyst av ett skäl – att ringa upp kan utsätta den hotade för livsfara. Lyssna, larma, skicka: den öppna linjen är dina ögon tills polisen är framme.",
      "tags": [
        "overfallslarm",
        "egen_sakerhet"
      ]
    },
    {
      "id": 122,
      "category": "larmcentral",
      "categoryLabel": "Larmcentral",
      "level": "fordjupning",
      "source": "v2",
      "title": "Bilen som stått still",
      "scenario": "GPS:en visar att en väktarbil stått stilla på en ödslig industrigata i fyrtio minuter mitt i natten, utan rapporterad aktivitet. Vad gör du?",
      "options": [
        "Antar att väktaren tar rast.",
        "Noterar det till morgonrapporten.",
        "Kontaktar väktaren – och vid uteblivet eller avvikande svar skickar du närmaste enhet till positionen enligt rutinen för inaktivitet.",
        "Ringer väktarens chef och frågar om han brukar göra så."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Oförklarad inaktivitet på enslig plats är en varningssignal, inte en förvaltningsfråga. Rutinen är enkel: kontakta, och vid tvivel åk – en väktare som fått en stroke eller blivit angripen kan inte trycka på något larm.",
      "tags": [
        "ensamarbete",
        "eskalering"
      ]
    },
    {
      "id": 123,
      "category": "larmcentral",
      "categoryLabel": "Larmcentral",
      "level": "fordjupning",
      "source": "v2",
      "title": "Det pinsamma samtalet",
      "scenario": "En kollega på larmcentralen ber dig hjälpa till att radera ett inspelat samtal där hon råkade uttrycka sig olämpligt mot en uppringare. Vad gör du?",
      "options": [
        "Raderar det – alla har dåliga dagar.",
        "Avböjer: inspelningar och loggar får aldrig manipuleras – och råder kollegan att i stället lyfta händelsen med arbetsledningen själv.",
        "Klipper bara bort den olämpliga delen.",
        "Raderar det mot att hon tar ditt nattpass."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Loggar och inspelningar är verksamhetens svarta låda – deras värde bygger på att de är orörda. Ett raderat samtal förvandlar ett klantigt ordval till ett förtroendebrott. Ärlighet uppåt är den enda utvägen som håller.",
      "tags": [
        "dokumentation",
        "kollegialitet"
      ]
    },
    {
      "id": 124,
      "category": "larmcentral",
      "categoryLabel": "Larmcentral",
      "level": "fordjupning",
      "source": "v2",
      "title": "Kunden som vill slippa larmen",
      "scenario": "En irriterad kund ringer och kräver att ni 'struntar i' de nattliga larmen från en krånglande sektion tills teknikern hinner dit nästa vecka. Vad gör du?",
      "options": [
        "Lovar att ignorera sektionen – kunden bestämmer.",
        "Stänger av sektionen i systemet direkt.",
        "Säger nej och lägger på.",
        "Dokumenterar kundens önskemål, förklarar att larmhantering inte kan avtalas bort muntligt, eskalerar till kundansvarig – och driver på för en snabbare teknikeråtgärd."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Larm som 'ska ignoreras' är exakt luckan en gärningsman behöver – och en muntlig instruktion från en irriterad kund är inget avtal. Ärendet ägs av kundansvarig: dokumentera, eskalera och lös tekniken snabbare.",
      "tags": [
        "rutin",
        "over_disk"
      ]
    },
    {
      "id": 125,
      "category": "butikskontroll_civil",
      "categoryLabel": "Civil butikskontroll",
      "level": "grund",
      "source": "v2",
      "title": "Hej vakten!",
      "scenario": "Du arbetar civilt som butikskontrollant när en kassör glatt ropar 'hej vakten!' tvärs över butiken. Flera kunder vänder sig om. Vad gör du?",
      "options": [
        "Fortsätter passet som om inget hänt.",
        "Avbryter diskret bevakningen i den delen av butiken, byter område eller tar paus enligt rutin – och lyfter behovet av personalinformation till arbetsledningen.",
        "Går fram och tillrättavisar kassören inför kunderna.",
        "Tar av dig jackan som förklädnad och fortsätter."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Den civila kontrollantens verktyg är anonymiteten – röjd täckning gör fortsatt bevakning meningslös och kan provocera fram konfrontationer utan brott. Felet åtgärdas via utbildning av personalen, inte via en scen i butiken.",
      "tags": [
        "butikskontroll",
        "diskretion"
      ]
    },
    {
      "id": 126,
      "category": "butikskontroll_civil",
      "categoryLabel": "Civil butikskontroll",
      "level": "grund",
      "source": "v2",
      "title": "Kunden som stirrar tillbaka",
      "scenario": "En kund du diskret följt vänder sig plötsligt om, ser dig rakt i ögonen två gånger och verkar ha genomskådat dig. Inget brott har ännu begåtts. Vad gör du?",
      "options": [
        "Följer efter ännu närmare för att visa att du inte låter dig skrämmas.",
        "Konfronterar kunden: 'Har du något att dölja?'",
        "Ställer dig vid utgången och väntar in kunden.",
        "Släpper diskret den kunden och byter fokus – ett röjt följande utan brott ger bara risk för konfrontation och felaktiga ingripanden."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Utan brott finns inget att ingripa mot – och en kund som känner sig förföljd kan eskalera eller klaga med rätta. Den professionella kontrollanten vet när ett spår är bränt och släpper det utan prestige.",
      "tags": [
        "butikskontroll",
        "diskretion"
      ]
    },
    {
      "id": 127,
      "category": "butikskontroll_civil",
      "categoryLabel": "Civil butikskontroll",
      "level": "grund",
      "source": "v2",
      "title": "Barnvagnen",
      "scenario": "Du ser en förälder gömma varor under filten i en barnvagn där ett barn sover, och personen passerar därefter kassalinjen utan att betala. Vad gäller för ingripandet?",
      "options": [
        "Samma juridiska villkor som alltid – men genomförandet anpassas: extra lugnt tilltal, erbjud att gå till ett avskilt rum, och barnets trygghet väger tungt i varje moment.",
        "Inget ingripande – personer med barn grips aldrig.",
        "Gripandet görs extra snabbt och bestämt så att barnet inte hinner vakna.",
        "Du tar barnvagnen i beslag med varorna i."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Brottet bedöms lika oavsett vem som begår det, men proportionaliteten skärps när ett barn är med: lågmält, avskilt och utan dramatik. Barnet är aldrig en del av konflikten – och vagnen är ingen beslagsfråga, varorna är det.",
      "tags": [
        "envarsgripande",
        "bemotande"
      ]
    },
    {
      "id": 128,
      "category": "butikskontroll_civil",
      "categoryLabel": "Civil butikskontroll",
      "level": "grund",
      "source": "v2",
      "title": "Chefens misstanke",
      "scenario": "Butikschefen drar dig åt sidan: 'Jag tror att Kalle på lagret stjäl – kan du inte skugga honom några dagar?' Vad gör du?",
      "options": [
        "Börjar skugga Kalle direkt – kunden har ju bett om det.",
        "Ber chefen själv konfrontera Kalle.",
        "Förklarar att intern personalkontroll är ett särskilt uppdrag som avtalas via bevakningsföretaget – du noterar önskemålet och lyfter det till din arbetsledning.",
        "Skuggar Kalle men bara på lunchrasterna."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Personalkontroll rör anställdas integritet och arbetsrätt och kräver ett formaliserat uppdrag – det beställs aldrig muntligt över disk. Samma regel som alltid: ändringar av uppdraget går via företaget.",
      "tags": [
        "over_disk",
        "integritet"
      ]
    },
    {
      "id": 129,
      "category": "butikskontroll_civil",
      "categoryLabel": "Civil butikskontroll",
      "level": "grund",
      "source": "v2",
      "title": "Provrummet",
      "scenario": "En kund går in i provrummet med fem plagg och kommer ut med tre synliga. Provrummen får inte kameraövervakas. Vad gör du?",
      "options": [
        "Går in i provrummet och letar efter tomma galgar.",
        "Använder butikens plagg-räkningsrutin via personalen, håller kunden under uppsikt utanför – och ingriper bara om hela kedjan fram till passerad kassalinje är säker. Är du osäker: släpp.",
        "Griper kunden direkt utanför provrummet – matematiken är ju tydlig.",
        "Kräver att kunden visar väskans innehåll."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Provrummet är en laglig blind fläck – därför finns räkningsrutiner. Två saknade plagg är en indikation, inte en iakttagelsekedja: utan säker kedja finns inget gripande, hur stark magkänslan än är.",
      "tags": [
        "envarsgripande",
        "butikskontroll"
      ]
    },
    {
      "id": 130,
      "category": "butikskontroll_civil",
      "categoryLabel": "Civil butikskontroll",
      "level": "grund",
      "source": "v2",
      "title": "Den tomma förpackningen",
      "scenario": "Personalen visar dig en uppriven, tom förpackning till hörlurar som hittats gömd bakom konserverna. Gärningsmannen är okänd. Vad gör du?",
      "options": [
        "Dokumenterar fyndet med plats och tid, säkrar förpackningen varsamt för eventuella spår, kontrollerar kameramaterial enligt rutin och rapporterar – något gripande är inte aktuellt.",
        "Ställer dig vid utgången och granskar alla kunder med väskor.",
        "Ropar ut i högtalarna att den skyldige ska ge sig till känna.",
        "Slänger förpackningen – skadan är redan skedd."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Utan gärningsman på bar gärning finns bara utredningsspåret: dokumentation, spårsäkring och kamera. Fyndet är dessutom värdefull mönsterdata – var, när och vilka varor styr din framtida bevakning.",
      "tags": [
        "dokumentation",
        "butikskontroll"
      ]
    },
    {
      "id": 131,
      "category": "butikskontroll_civil",
      "categoryLabel": "Civil butikskontroll",
      "level": "grund",
      "source": "v2",
      "title": "Vem är du egentligen?",
      "scenario": "Du har just gripit en person för stöld. Personen skriker: 'Du är ju ingen väktare, du är en vanlig kille i hoodie – släpp mig!' Vad gör du?",
      "options": [
        "Fortsätter utan att svara – du behöver inte förklara dig.",
        "Släpper personen – han har ju en poäng.",
        "Ber en uniformerad kollega ta över hela ärendet och går därifrån.",
        "Presenterar dig lugnt som butikskontrollant, visar din legitimation enligt rutin och förklarar att personen är gripen för stöld och att polis är på väg."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Civil klädsel ändrar inte skyldigheten att vara tydlig med vem du är och varför ingripandet sker – tydligheten minskar dessutom motståndet. Envarsgripandet kräver ingen uniform, men professionen kräver en presentation.",
      "tags": [
        "envarsgripande",
        "bemotande"
      ]
    },
    {
      "id": 132,
      "category": "butikskontroll_civil",
      "categoryLabel": "Civil butikskontroll",
      "level": "grund",
      "source": "v2",
      "title": "Kassören och kompisrabatten",
      "scenario": "Från din position ser du en kassör medvetet slå in en bråkdel av varorna åt en person som verkar vara en bekant. Vad gör du?",
      "options": [
        "Går fram och konfronterar kassören direkt vid bandet.",
        "Griper kompisen när denne passerar utgången.",
        "Dokumenterar diskret dina iakttagelser med tider och detaljer och rapporterar enligt rutin till din arbetsledning och behörig hos kunden – utan konfrontation på golvet.",
        "Låtsas inte om det – internsvinn är butikens ensak."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Internbrott kräver hållbar bevisning och korrekt arbetsrättslig hantering – en förhastad konfrontation bränner båda. Din exakta, tidsatta dokumentation är det som gör att kunden och polisen kan agera rätt.",
      "tags": [
        "dokumentation",
        "internbrott"
      ]
    },
    {
      "id": 133,
      "category": "butikskontroll_civil",
      "categoryLabel": "Civil butikskontroll",
      "level": "grund",
      "source": "v2",
      "title": "Fickstöldsteamet",
      "scenario": "Du ser två personer arbeta i samspel mot en äldre kund vid fruktdisken – en distraherar medan den andra närmar sig kundens öppna handväska. Vad gör du?",
      "options": [
        "Väntar tills stölden är fullbordad så att du kan gripa.",
        "Prioriterar att skydda offret: kliv in i situationen, gör din närvaro tydlig och stör upplägget, säkra signalement på båda och larma polis – gripande blir aktuellt först vid fullbordat brott och säkert läge.",
        "Fotograferar paret med mobilen på nära håll.",
        "Ropar högt 'ficktjuvar!' genom butiken."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Att låta ett brott fullbordas mot en människa för att få ett gripande är fel prioritering – skyddet av offret går först. Ett stört upplägg plus bra signalement är ofta dagens bästa resultat.",
      "tags": [
        "prioritering",
        "bemotande"
      ]
    },
    {
      "id": 134,
      "category": "butikskontroll_civil",
      "categoryLabel": "Civil butikskontroll",
      "level": "grund",
      "source": "v2",
      "title": "Fotoregistret",
      "scenario": "Efter ett gripande vill butikschefen fotografera den gripne med sin mobil 'till vårt interna register över snattare'. Vad gör du?",
      "options": [
        "Avböjer att medverka och förklarar att egna bildregister över utpekade personer är rättsligt mycket tveksamma – portning och uppföljning hanteras enligt kedjans policy och gällande dataskyddsregler.",
        "Håller upp den gripne så att bilden blir skarp.",
        "Tar bilden åt chefen med din tjänstetelefon.",
        "Föreslår att bilden läggs i personalrummet som varning."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Ett eget 'snattarregister' med foton är behandling av känsliga personuppgifter utan rättslig grund – och du ska inte medverka till det. Kundens vilja upphäver aldrig dataskydd och integritet.",
      "tags": [
        "integritet",
        "kamerabevakning"
      ]
    },
    {
      "id": 135,
      "category": "krog_nattliv",
      "categoryLabel": "Krog och nattliv",
      "level": "grund",
      "source": "v2",
      "title": "Diskriminering!",
      "scenario": "Du nekar en kraftigt berusad man inträde till en klubb. Han höjer rösten: 'Det här är diskriminering, jag ska anmäla er!' Vad gör du?",
      "options": [
        "Släpper in honom för att undvika anmälan.",
        "Svarar att han får anmäla hur mycket han vill.",
        "Står lugnt fast vid beskedet och förklarar kort att nekandet beror på berusningsgraden och gäller lika för alla – och dokumenterar händelsen efteråt.",
        "Ber honom bevisa att han inte är berusad."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Berusning är ett beteende och en saklig grund – inte en diskrimineringsgrund. Lugnt besked, likabehandling och dokumentation är hela svaret; diskussionen om anmälan tas aldrig i dörren.",
      "tags": [
        "diskriminering",
        "bemotande"
      ]
    },
    {
      "id": 136,
      "category": "krog_nattliv",
      "categoryLabel": "Krog och nattliv",
      "level": "grund",
      "source": "v2",
      "title": "Utan legitimation",
      "scenario": "Stället har 20-årsgräns. En gäst som ser ung ut har ingen legitimation men lovar att han fyllt 23 och blir alltmer irriterad. Vad gör du?",
      "options": [
        "Nekar vänligt: utan giltig legitimation vid ålderskontroll blir det inget inträde – villkoret gäller alla, och han är välkommen åter med leg.",
        "Släpper in honom om en kompis intygar åldern.",
        "Gissar åldern utifrån utseendet.",
        "Släpper in honom men förbjuder honom att köpa alkohol."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Ålderskontrollen är ett villkor för tillträde och kan aldrig bygga på löften – ansvaret vid fel hamnar på stället. Vänligt, konsekvent och lika för alla är både juridiken och konfliktförebyggandet.",
      "tags": [
        "id_kontroll",
        "rutin"
      ]
    },
    {
      "id": 137,
      "category": "krog_nattliv",
      "categoryLabel": "Krog och nattliv",
      "level": "grund",
      "source": "v2",
      "title": "Gästen som somnat",
      "scenario": "En gäst har somnat vid ett bord med huvudet mot bordsskivan. En ordningsvakt finns i lokalen. Vad gör du?",
      "options": [
        "Låter honom sova – han stör ju ingen.",
        "Väcker honom lugnt och gör en snabb hälsobedömning – är han vaken och kontaktbar men för berusad för att stanna kopplar du in ordningsvakten, som har befogenheterna kring omhändertagande.",
        "Bär ut honom på gatan tillsammans med en kollega.",
        "Häller ett glas vatten över honom."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Först hälsan – 'somnat' kan vara alkoholförgiftning eller sjukdom. Därefter rollerna: väktaren väcker, bedömer och larmar; omhändertagande av berusade är ordningsvaktens och polisens verktyg, aldrig ditt.",
      "tags": [
        "sjukvard",
        "roller"
      ]
    },
    {
      "id": 138,
      "category": "krog_nattliv",
      "categoryLabel": "Krog och nattliv",
      "level": "grund",
      "source": "v2",
      "title": "Bråket på dansgolvet",
      "scenario": "Ett slagsmål bryter ut på dansgolvet. Ordningsvakterna är på väg dit. Vad är din roll som väktare?",
      "options": [
        "Kastar dig in i klungan före ordningsvakterna.",
        "Ställer dig och filmar för rapporten.",
        "Går ut och väntar tills det är över.",
        "Stöttar enligt din roll: hjälper tredje man undan, öppnar väg för ordningsvakterna, larmar vid behov polis och ambulans – och ingriper själv endast vid nödvärnslägen."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Ordningsvakterna leder ordningsingripandet – din största insats är runtomkring: skydda gäster, skapa yta, larma och dokumentera. Nödvärnsrätten finns kvar om någon angrips akut framför dig.",
      "tags": [
        "roller",
        "prioritering"
      ]
    },
    {
      "id": 139,
      "category": "krog_nattliv",
      "categoryLabel": "Krog och nattliv",
      "level": "grund",
      "source": "v2",
      "title": "Knuffarna i kön",
      "scenario": "Långt bak i entrékön börjar två män knuffas och gapa åt varandra. Vad gör du?",
      "options": [
        "Väntar – kön löser oftast sådant själv.",
        "Går dit tidigt, talar lugnt med båda, separerar dem till olika delar av kön och minskar publiken runt dem – tidiga steg på konflikttrappan är billiga.",
        "Ropar från din plats att de ska sluta.",
        "Nekar båda inträde direkt utan att prata med dem."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Knuffar i kö är irritation på väg uppåt – den som kliver in tidigt med lugn närvaro och separation slipper hantera slagsmålet tio minuter senare. Publiken är bränslet: minska den.",
      "tags": [
        "deeskalering",
        "prioritering"
      ]
    },
    {
      "id": 140,
      "category": "krog_nattliv",
      "categoryLabel": "Krog och nattliv",
      "level": "grund",
      "source": "v2",
      "title": "Kvar efter stängning",
      "scenario": "Lokalen har stängt och släckts upp. En gäst vägrar demonstrativt att lämna sin plats i soffan trots upprepade uppmaningar. Vad gäller?",
      "options": [
        "Du bär ut honom omedelbart – stängt är stängt.",
        "Han får sitta kvar tills han själv vill gå.",
        "Du häller ut hans dricka som markering.",
        "Efter tydliga uppmaningar kan kvarstannandet utgöra olaga intrång – lokalen är inte längre öppen för allmänheten – och ordningsvakt eller polis kopplas in; eget våld är inte förstahandsvalet."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "En stängd lokal är inte allmän plats, och den som obehörigen stannar kvar efter tillsägelse kan begå olaga intrång – sedan 2022 med fängelse i skalan. Men proportionaliteten styr: uppmaningar, ordningsvakt, polis – i den ordningen.",
      "tags": [
        "olaga_intrang",
        "roller"
      ]
    },
    {
      "id": 141,
      "category": "krog_nattliv",
      "categoryLabel": "Krog och nattliv",
      "level": "grund",
      "source": "v2",
      "title": "Handeln på toaletten",
      "scenario": "Flera gäster har oberoende av varandra berättat att en man säljer 'något' inne på herrtoaletten. Vad gör du?",
      "options": [
        "Observerar diskret, dokumenterar signalement och mönster och informerar ordningsvakt och polis enligt ställets rutin – utan eget ingripande eller egen 'razzia'.",
        "Går in och kroppsvisiterar mannen.",
        "Låser toalettdörren med mannen inne.",
        "Ropar in i toaletten att polisen är på väg."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Misstänkt narkotikaförsäljning kanaliseras till polisen via rutinen – egna ingripanden riskerar din säkerhet, bevisningen och eventuell pågående spaning. Dina observationer är bidraget, inte razzian.",
      "tags": [
        "narkotika",
        "roller"
      ]
    },
    {
      "id": 142,
      "category": "krog_nattliv",
      "categoryLabel": "Krog och nattliv",
      "level": "grund",
      "source": "v2",
      "title": "Legitimationen som känns fel",
      "scenario": "En ung gäst räcker fram ett id-kort. Laminatet bubblar vid kanten, trycket är ojämnt och han undviker din blick. Vad gör du?",
      "options": [
        "Släpper in honom – kortet har ju rätt födelseår.",
        "Klipper kortet mitt itu framför honom.",
        "Nekar inträde vid tvivel, dokumenterar och kontaktar polis enligt ställets rutin – handlingen får du dock bara ta i beslag i samband med ett gripande.",
        "Behåller kortet i en låda bakom disken."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Håll, känn, vinkla – och neka hellre än chansa. Att bruka falsk urkund är ett brott, men din beslagsrätt hänger på ett gripande: grundlinjen är nekande, dokumentation och polis.",
      "tags": [
        "id_kontroll",
        "beslag"
      ]
    },
    {
      "id": 143,
      "category": "krog_nattliv",
      "categoryLabel": "Krog och nattliv",
      "level": "grund",
      "source": "v2",
      "title": "Han väntar utanför",
      "scenario": "En gäst ni avvisat tidigare står nu kvar utanför entrén och skriker hotelser mot en annan gäst som är på väg att gå hem. Vad gör du?",
      "options": [
        "Säger åt gästen inne att gå ut och reda upp det själv.",
        "Låter den hotade gästen vänta kvar inne, larmar polis om hoten fortsätter, dokumenterar hotelserna ordagrant – och hjälper till med ett säkert uppbrott, till exempel via annan utgång eller taxi till dörren.",
        "Går ut och brottar ner den som skriker.",
        "Stänger dörren och låter dem göra upp."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Ditt uppdrag omfattar gästernas trygghet hela vägen ut. Olaga hot dokumenteras ordagrant och polisanmäls – och den enklaste skyddsåtgärden är ofta logistik: tid, annan väg, sällskap.",
      "tags": [
        "hot",
        "prioritering"
      ]
    },
    {
      "id": 144,
      "category": "krog_nattliv",
      "categoryLabel": "Krog och nattliv",
      "level": "grund",
      "source": "v2",
      "title": "Flaskan i handen",
      "scenario": "Under ett hetsigt gräl greppar en gäst en ölflaska med ett omvänt grepp och stirrar på sin motpart. Vad gör du?",
      "options": [
        "Rycker flaskan ur handen på honom bakifrån.",
        "Väntar och ser om han lugnar sig av sig själv.",
        "Ställer dig mitt emellan de två männen.",
        "Skapar avstånd mellan parterna, varnar tydligt, kallar ordningsvakt och förstärkning – flaskan i det greppet är ett potentiellt vapen och höjer hela riskbilden."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Ett vardagsföremål i fel grepp ändrar allt: avstånd, tydlig gräns och förstärkning före kontakt. Att ställa sig i linjen mellan två uppjagade män är att erbjuda sig som första mål.",
      "tags": [
        "egen_sakerhet",
        "deeskalering"
      ]
    },
    {
      "id": 145,
      "category": "krog_nattliv",
      "categoryLabel": "Krog och nattliv",
      "level": "grund",
      "source": "v2",
      "title": "Kameran i VIP-delen",
      "scenario": "En gäst fotograferar ihärdigt mot en känd artist i VIP-delen trots att stället har fotoförbud inomhus. Vad gör du?",
      "options": [
        "Påminner vänligt om fotoförbudet som är ett villkor för vistelsen – vid fortsatt fotografering hanteras avvisningen av ordningsvakt enligt husets regler; mobilen rör du aldrig.",
        "Beslagtar mobilen och raderar bilderna.",
        "Ställer dig framför kameran resten av kvällen.",
        "Ber artisten byta bord."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "I en privat lokal gäller husets villkor – men verktyget är tillsägelse och i förlängningen avvisning, aldrig beslag eller radering. Gästens mobil är gästens egendom, punkt.",
      "tags": [
        "integritet",
        "roller"
      ]
    },
    {
      "id": 146,
      "category": "krog_nattliv",
      "categoryLabel": "Krog och nattliv",
      "level": "grund",
      "source": "v2",
      "title": "Jag känner ägaren",
      "scenario": "En man i kön kräver att få gå före: 'Jag känner ägaren, ring honom så får du se – släpp bara in mig så slipper vi tjafs.' Vad gör du?",
      "options": [
        "Släpper in honom – tänk om han faktiskt känner ägaren.",
        "Ber honom bevisa vänskapen med ett foto.",
        "Behåller rutinen vänligt: kön och villkoren gäller alla, och vill ägaren göra undantag får det beskedet komma till dig via ställets egna kanaler – inte via gästen själv.",
        "Släpper in honom men tar betalt dubbelt."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Namndroppning och 'slipp tjafs' är normaliseringens klassiska hävstänger. Undantag beordras via dina kanaler, aldrig av den som vill ha undantaget – och proffs klagar inte på proffsighet.",
      "tags": [
        "social_manipulation",
        "rutin"
      ]
    },
    {
      "id": 147,
      "category": "skola",
      "categoryLabel": "Skola",
      "level": "grund",
      "source": "v2",
      "title": "Fotografen vid staketet",
      "scenario": "En okänd vuxen står vid skolgårdens staket och fotograferar elever på rasten. Vad gör du?",
      "options": [
        "Ignorerar det – fotografering är lagligt.",
        "Tar kontakt lugnt, förklarar att fotografering av eleverna inte är tillåten enligt skolans regler och ber personen sluta och lämna platsen – vid vägran kopplas skolledning och polis in, och allt dokumenteras med signalement.",
        "Beslagtar kameran.",
        "Ropar åt eleverna att gå in."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Skolan ansvarar för elevernas trygghet och kan ställa villkor kring sin verksamhet. Din insats är kontakt, tydligt besked och dokumentation – tvångsmedel mot person eller kamera har du inte, men polisen ska veta om beteendet.",
      "tags": [
        "barn",
        "dokumentation"
      ]
    },
    {
      "id": 148,
      "category": "skola",
      "categoryLabel": "Skola",
      "level": "grund",
      "source": "v2",
      "title": "Kniven i väskan",
      "scenario": "En elev berättar förtroligt för dig att en annan elev har en kniv i sin ryggsäck och har visat den i omklädningsrummet. Vad gör du?",
      "options": [
        "Går direkt och genomsöker den utpekade elevens väska.",
        "Ber eleven som berättade att själv ta kniven.",
        "Lovar eleven att inte säga något till någon.",
        "Informerar omgående skolledningen enligt skolans rutin – rektor och polis äger hanteringen – håller diskret uppsikt över den utpekade eleven och dokumenterar vad som sagts."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Vapenuppgifter på en skola tas alltid på allvar och kanaliseras direkt till skolledning och polis – du genomsöker inga väskor och lovar aldrig hemligheter som hindrar skydd. Din diskreta uppsikt köper tid tills rätt aktörer agerar.",
      "tags": [
        "barn",
        "roller"
      ]
    },
    {
      "id": 149,
      "category": "skola",
      "categoryLabel": "Skola",
      "level": "grund",
      "source": "v2",
      "title": "Pappan som ska hämta",
      "scenario": "En upprörd man kräver att få hämta sin dotter mitt under skoldagen: 'Jag är hennes pappa, det pågår en vårdnadstvist och jag har rätt till henne i dag.' Vad gör du?",
      "options": [
        "Följer honom lugnt till expeditionen och hänvisar till skolans rutin – skolan lämnar bara ut elever enligt sina vårdnadshavaruppgifter, och beslutet är rektors, aldrig ditt.",
        "Hämtar dottern åt honom – en pappa är en pappa.",
        "Ber dottern själv välja om hon vill följa med.",
        "Avvisar honom från skolans område direkt."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Vårdnadsfrågor är ett minfält som skolan har rutiner och register för – väktarens roll är att lugnt kanalisera till expeditionen och finnas kvar som trygghet. Fel utlämning kan vara katastrofal; rätt väg är alltid rektors besked.",
      "tags": [
        "barn",
        "rutin"
      ]
    },
    {
      "id": 150,
      "category": "skola",
      "categoryLabel": "Skola",
      "level": "grund",
      "source": "v2",
      "title": "Slagsmålet i korridoren",
      "scenario": "Två elever i femtonårsåldern slåss vilt i en korridor medan andra elever filmar och hetsar. Vad gör du?",
      "options": [
        "Väntar på att en lärare ska komma.",
        "Filmar själv som bevis.",
        "Larmar skolpersonal, går emellan för att skydda eleverna från varandra med minsta möjliga fysiska ingrepp – nödvärn gäller till förmån för annan – och skingrar publiken som hetsar.",
        "Ropar att alla ska gå till sina klassrum."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Pågående våld mellan barn möts med skydd, inte åskådande: separera med lägsta möjliga kraft, extra varsamhet eftersom det är unga, och ta bort publiken som driver på. Skolans personal och rutiner tar sedan över.",
      "tags": [
        "nodvarn",
        "barn"
      ]
    },
    {
      "id": 151,
      "category": "skola",
      "categoryLabel": "Skola",
      "level": "grund",
      "source": "v2",
      "title": "Före detta eleven",
      "scenario": "En hotfull före detta elev vandrar runt i skolans korridorer och vägrar lämna trots personalens uppmaningar. Vad gör du?",
      "options": [
        "Handgripligen föser ut honom direkt.",
        "Håller avstånd, uppmanar lugnt och tydligt, ser till att rektor kopplas in – och larmar polis vid fortsatt vägran: skolans inre är inte allmän plats, och obehörigt kvarstannande kan utgöra olaga intrång.",
        "Låter honom vara – han har ju gått här.",
        "Låser in honom i ett klassrum i väntan på polis."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Skolans lokaler är till för elever och personal – obehöriga som vägrar gå efter tillsägelse kan begå olaga intrång. Men verktygen är uppmaning, rektors beslut och polis; avstånd och lugn skyddar eleverna bäst.",
      "tags": [
        "olaga_intrang",
        "deeskalering"
      ]
    },
    {
      "id": 152,
      "category": "skola",
      "categoryLabel": "Skola",
      "level": "grund",
      "source": "v2",
      "title": "Hotet på sociala medier",
      "scenario": "En elev visar dig ett inlägg där någon skriver att 'något stort kommer hända på skolan i morgon'. Vad gör du?",
      "options": [
        "Avfärdar det – ungdomar skriver mycket.",
        "Ber eleven svara på inlägget och fråga vad som menas.",
        "Delar inlägget i personalens chattgrupp och låter det räcka.",
        "Tar det på fullt allvar: säkrar en skärmbild, informerar omgående skolledningen som kontaktar polisen enligt rutin – och berömmer eleven för att den berättade."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Hot mot skolor hanteras alltid som skarpa tills polisen bedömt dem – och vägen går via skolledningens rutin, inte via egna utredningar eller svar i tråden. Eleven som vågar berätta är trygghetsarbetets viktigaste resurs.",
      "tags": [
        "hot",
        "barn"
      ]
    },
    {
      "id": 153,
      "category": "skola",
      "categoryLabel": "Skola",
      "level": "grund",
      "source": "v2",
      "title": "Klasslistan vid uppsamlingsplatsen",
      "scenario": "Skolan utryms efter brandlarm. Vid uppsamlingsplatsen säger en lärare stressat att två elever ur klassen saknas och att de 'kanske är kvar på toaletten'. Vad gör du?",
      "options": [
        "Meddelar räddningstjänstens ledning omedelbart vilka som saknas och var de senast sågs – ingen går tillbaka in, och läraren stannar hos sin klass.",
        "Springer själv in och letar på toaletterna.",
        "Skickar två äldre elever att kolla.",
        "Väntar tio minuter – de dyker nog upp."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Uppgiften om saknade barn och deras troliga position är det viktigaste du kan ge räddningsledaren – rökdykare söker rätt direkt. Ingen, allra minst elever, går in i en larmad byggnad.",
      "tags": [
        "brand",
        "barn"
      ]
    },
    {
      "id": 154,
      "category": "skola",
      "categoryLabel": "Skola",
      "level": "grund",
      "source": "v2",
      "title": "Eleven som gömmer sig",
      "scenario": "Under din rond hittar du en gråtande elev som gömt sig i ett förråd och säger att hon inte vågar gå hem. Vad gör du?",
      "options": [
        "Skjutsar hem henne själv efter passet.",
        "Lovar att hålla det hemligt om hon går till lektionen.",
        "Lyssnar lugnt utan att pressa, stannar kvar som trygghet och kopplar in elevhälsan eller annan skolpersonal direkt – du lovar aldrig hemligheter, men du lovar att hon får hjälp.",
        "Ber henne rycka upp sig och gå hem."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Ett barn som inte vågar gå hem är en signal som skolans elevhälsa är byggd för att fånga – din roll är den trygga vuxna som lyssnar och lotsar rätt, utan förhör och utan hemlighetslöften som kan hindra skydd.",
      "tags": [
        "barn",
        "bemotande"
      ]
    },
    {
      "id": 155,
      "category": "skola",
      "categoryLabel": "Skola",
      "level": "grund",
      "source": "v2",
      "title": "Mopederna på skolgården",
      "scenario": "På lunchrasten kör tre utomstående ungdomar moped i hög fart tvärs över skolgården mellan eleverna. Vad gör du?",
      "options": [
        "Ställer dig i deras väg för att stoppa dem.",
        "Får undan eleverna från körstråket, tar kontakt när det kan ske säkert och förklarar att skolgården inte är öppen för utomstående under skoltid – vägrar de lämna dokumenteras registreringsnummer och signalement och polis kontaktas vid fara.",
        "Kastar en kon mot framhjulet.",
        "Ignorerar det – skolgårdar är allmän plats."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Elevernas fysiska säkerhet går först – därefter kontakt och besked. Skolgården är under skoltid till för skolans verksamhet, och fortsatt farlig körning bland barn är en polisfråga, inte en jaktuppgift.",
      "tags": [
        "barn",
        "egen_sakerhet"
      ]
    },
    {
      "id": 156,
      "category": "skola",
      "categoryLabel": "Skola",
      "level": "grund",
      "source": "v2",
      "title": "Håll kvar honom",
      "scenario": "En stressad lärare ber dig låsa in en utåtagerande elev i ett grupprum 'tills han lugnat sig'. Vad gör du?",
      "options": [
        "Låser in eleven som läraren ber om.",
        "Håller fast eleven i en stol i stället.",
        "Lämnar platsen – det är skolans problem.",
        "Avböjer vänligt: att låsa in eller hålla kvar en elev är ett frihetsberövande utan lagstöd – du stöttar i stället genom närvaro och avstånd medan skolans personal hanterar situationen enligt sina rutiner."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Varken skola eller väktare har rätt att frihetsberöva elever som inte begått gripbara brott – inlåsning 'för lugnets skull' kan vara olaga frihetsberövande. Ditt bidrag är lugn närvaro, skydd av andra elever och stöd till personalen.",
      "tags": [
        "laga_befogenhet",
        "barn"
      ]
    },
    {
      "id": 157,
      "category": "hotell",
      "categoryLabel": "Hotell",
      "level": "grund",
      "source": "v2",
      "title": "Utelåst utan legitimation",
      "scenario": "Klockan 03 ber en man i hotellkorridoren dig öppna dörren till rum 412: 'Det är mitt rum, nyckelkortet slutade funka och min plånbok ligger därinne.' Vad gör du?",
      "options": [
        "Öppnar – han står ju utanför just det rummet.",
        "Ber honom sova i loungen till receptionen öppnar.",
        "Följer med honom till receptionen och verifierar mot bokningssystemet – namn, bokningsuppgifter, kontrollfrågor – innan någon dörr öppnas.",
        "Öppnar om han kan beskriva rummets inredning."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Att stå utanför en dörr bevisar ingenting – ett hotellrum innehåller en gästs hela integritet och egendom. Verifiering sker mot systemet via receptionen, aldrig mot berättelsen i korridoren.",
      "tags": [
        "social_manipulation",
        "id_kontroll"
      ]
    },
    {
      "id": 158,
      "category": "hotell",
      "categoryLabel": "Hotell",
      "level": "grund",
      "source": "v2",
      "title": "Ljuden från rum 218",
      "scenario": "Under nattronden hör du skrik, gråt och dunsar från ett gästrum. En kvinnoröst ropar 'sluta!'. Vad gör du?",
      "options": [
        "Knackar hårt, ger dig till känna och frågar om läget – vid tecken på pågående våld larmar du 112 direkt, och går in med huvudnyckel endast om det krävs akut för att skydda liv, helst med kollega.",
        "Antecknar rumsnumret och lyssnar igen om en timme.",
        "Ringer rummet och ber dem dämpa sig.",
        "Spelar in ljuden genom dörren som bevis."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Misstänkt pågående våld väger tyngre än hemfriden i rummet: ge dig till känna, larma tidigt och gå in vid akut fara – nödvärn gäller till förmån för annan. Dokumentera tider och exakt vad du hörde.",
      "tags": [
        "nodvarn",
        "prioritering"
      ]
    },
    {
      "id": 159,
      "category": "hotell",
      "categoryLabel": "Hotell",
      "level": "grund",
      "source": "v2",
      "title": "Duschmössan på detektorn",
      "scenario": "Vid tillsyn av en korridor upptäcker du att en gäst trätt en duschmössa över rökdetektorn i sitt rum, synligt genom den öppna dörren vid städning. Vad gör du?",
      "options": [
        "Tar bort duschmössan, kontrollerar detektorn enligt rutin, rapporterar avvikelsen och ser till att gästen informeras om allvaret – en satt detektor släcker rummets brandskydd.",
        "Låter den sitta – gästen kanske röker och det är hans sak.",
        "Väntar till utcheckning och tar bort den då.",
        "Sätter en lapp på dörren."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "En övertäckt detektor är ett hål i hela byggnadens brandskydd – i ett hus fullt av sovande människor. Avvikelsen åtgärdas direkt, dokumenteras och följs upp mot gästen enligt hotellets rutin.",
      "tags": [
        "brand",
        "rutin"
      ]
    },
    {
      "id": 160,
      "category": "hotell",
      "categoryLabel": "Hotell",
      "level": "grund",
      "source": "v2",
      "title": "Ensam i poolen",
      "scenario": "Poolområdet stängde för två timmar sedan. Du hittar en kraftigt berusad gäst ensam i vattnet, skrattande och osäker i simtagen. Vad gör du?",
      "options": [
        "Säger åt honom att simma klart och gå upp själv.",
        "Släcker belysningen så att han förstår att det är stängt.",
        "Hämtar hans handduk och väntar vid dörren.",
        "Får upp honom ur vattnet omgående utan att själv hamna i riskläge, stannar hos honom, gör en hälsobedömning och följer honom till rummet – berusning och vatten är en livsfarlig kombination, och han lämnas inte ensam förrän läget är tryggt."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Drunkning är snabb och tyst, och alkohol raderar både omdöme och simförmåga. Regeln är absolut: upp ur vattnet, aldrig lämnas ensam – ordningsfrågan om öppettider kommer långt efter livet.",
      "tags": [
        "sjukvard",
        "prioritering"
      ]
    },
    {
      "id": 161,
      "category": "hotell",
      "categoryLabel": "Hotell",
      "level": "grund",
      "source": "v2",
      "title": "Städvagnen och huvudnyckeln",
      "scenario": "En person i städkläder du inte känner igen drar en städvagn med huvudnyckelkort genom korridoren klockan 23 – långt utanför städtiderna. Vad gör du?",
      "options": [
        "Hälsar och går vidare – kläderna talar för sig.",
        "Kontaktar personen vänligt, kontrollerar identitet och behörighet mot husfru eller ledning – huvudnycklar utanför rutin är en av hotellets största risker – och följer upp tills läget är verifierat.",
        "Tar nyckelkortet ifrån personen direkt.",
        "Följer efter på avstånd hela natten."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Ett huvudnyckelkort öppnar varje gästs rum – den kombinationen kontrolleras alltid när den dyker upp utanför rutinen. Kläder är kostym, behörighet är verifiering; vänligt men villkorslöst.",
      "tags": [
        "id_kontroll",
        "social_manipulation"
      ]
    },
    {
      "id": 162,
      "category": "hotell",
      "categoryLabel": "Hotell",
      "level": "grund",
      "source": "v2",
      "title": "Stölden ur rummet",
      "scenario": "En gäst anmäler upprört att smycken försvunnit ur rummet under dagen. Vad gör du?",
      "options": [
        "Ber gästen leta en gång till och återkomma i morgon.",
        "Genomsöker städpersonalens skåp direkt.",
        "Ber gästen inte röra mer i rummet, dokumenterar anmälan med tider, ser till att passerloggen för rummet säkras och hjälper gästen att göra polisanmälan enligt hotellets rutin.",
        "Ersätter smyckena ur hotellkassan för att lösa det snabbt."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Rummet är en möjlig brottsplats och passerloggen visar exakt vilka kort som öppnat dörren – båda säkras innan de förstörs eller skrivs över. Utredningen är polisens; din uppgift är att bevara det utredbara.",
      "tags": [
        "dokumentation",
        "rutin"
      ]
    },
    {
      "id": 163,
      "category": "hotell",
      "categoryLabel": "Hotell",
      "level": "grund",
      "source": "v2",
      "title": "Tecknen i lobbyn",
      "scenario": "En mycket ung person checkar in tillsammans med en betydligt äldre man som betalar kontant, svarar på alla frågor åt den unga och blir irriterad när receptionisten ber om den ungas legitimation. Vad gör du?",
      "options": [
        "Konfronterar mannen direkt med dina misstankar i lobbyn.",
        "Gör inget – vuxna får checka in med vem de vill.",
        "Agerar diskret enligt hotellets rutin: informerar ledningen, dokumenterar iakttagelserna och ser till att polisen kontaktas – vid akut oro för den unga ringer ni 112, utan att konfrontera på plats.",
        "Nekar incheckning högljutt och visar ut dem."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Kombinationen mycket ung person, kontrollerande sällskap, kontanter och undvikna id-kontroller är kända varningstecken som hotellbranschen utbildas att rapportera. Diskretion skyddar den unga – konfrontation kan utsätta hen för fara; bedömningen är polisens.",
      "tags": [
        "barn",
        "dokumentation"
      ]
    },
    {
      "id": 164,
      "category": "hotell",
      "categoryLabel": "Hotell",
      "level": "grund",
      "source": "v2",
      "title": "Gästen som vägrar utrymma",
      "scenario": "Brandlarmet ljuder klockan 04. En gäst i morgonrock vägrar lämna sitt rum: 'Det är säkert falskt, jag har ett möte klockan åtta.' Vad gör du?",
      "options": [
        "Bär ut honom i morgonrocken.",
        "Ger honom öronproppar och går vidare.",
        "Låser hans dörr utifrån som markering.",
        "Uppmanar tydligt en sista gång, noterar rumsnumret och fortsätter utrymningen – och meddelar räddningsledaren exakt vilket rum som har en kvarvarande person."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Du kan inte tvinga någon ut – men du kan se till att räddningstjänsten vet exakt var han finns, vilket kan rädda hans liv. Utrymningen av de många får aldrig stanna för den enes vägran.",
      "tags": [
        "brand",
        "rutin"
      ]
    },
    {
      "id": 165,
      "category": "hotell",
      "categoryLabel": "Hotell",
      "level": "grund",
      "source": "v2",
      "title": "Plånboken i soffan",
      "scenario": "I lobbyns soffa hittar du en plånbok med en tjock bunt kontanter och utländska id-handlingar. Vad gör du?",
      "options": [
        "Dokumenterar fyndet direkt tillsammans med ett vittne ur personalen – innehåll räknas och antecknas gemensamt – och plånboken hanteras enligt hotellets hittegodsrutin med kvittens.",
        "Lägger den i din ficka och väntar på att någon frågar.",
        "Räknar pengarna själv på ditt rum och lämnar in i morgon.",
        "Lägger tillbaka den i soffan – ägaren kommer nog."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Kontanter utan vittne är en förtroendefälla: räkna och dokumentera tillsammans med någon, direkt, med kvittens i varje led. Hittegodsrutinen skyddar ägarens egendom – och din heder.",
      "tags": [
        "hittegods",
        "dokumentation"
      ]
    },
    {
      "id": 166,
      "category": "hotell",
      "categoryLabel": "Hotell",
      "level": "grund",
      "source": "v2",
      "title": "Bor min fru här?",
      "scenario": "En man i receptionen kräver att få veta om hans fru är incheckad på hotellet: 'Jag vet att hon är här – vilket rum?' Vad gör du?",
      "options": [
        "Kollar i systemet och nickar diskret.",
        "Bekräftar aldrig gästuppgifter: hotellet varken bekräftar eller förnekar vem som bor där – du kan erbjuda att receptionen förmedlar ett meddelande, och vid hotfullt beteende kopplas polis in.",
        "Säger rumsnumret om han visar vigselbevis.",
        "Ber honom vänta i baren medan du letar rätt på henne."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Gästsekretessen kan vara ett skalskydd för någon som flytt hot eller våld – ett bekräftat rumsnummer kan vara livsfarligt. Regeln är villkorslös: varken ja eller nej, bara erbjudandet att förmedla.",
      "tags": [
        "tystnadsplikt",
        "integritet"
      ]
    },
    {
      "id": 167,
      "category": "parkering",
      "categoryLabel": "Parkeringshus och garage",
      "level": "grund",
      "source": "v2",
      "title": "Mannen som testar dörrar",
      "scenario": "I parkeringshuset ser du en man systematiskt gå längs bilraderna och rycka i dörrhandtag efter dörrhandtag. Vad gör du?",
      "options": [
        "Griper honom – uppsåtet är uppenbart.",
        "Ropar tvärs över garaget att du ser honom.",
        "Ställer dig gömd och väntar på att han ska lyckas.",
        "Observerar och dokumenterar, larmar polis via ledningscentralen med signalement och position – och ingriper med gripande först om ett gripbart brott fullbordas inför dina ögon och det kan ske säkert."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Att rycka i handtag är starkt misstänkt men ännu inget fullbordat gripbart brott – gränsen går vid inbrottet eller tillgreppet. Polisen vill gärna ta sådana mönster själva; dina observationer i realtid är nyckeln.",
      "tags": [
        "envarsgripande",
        "dokumentation"
      ]
    },
    {
      "id": 168,
      "category": "parkering",
      "categoryLabel": "Parkeringshus och garage",
      "level": "grund",
      "source": "v2",
      "title": "Eskorten",
      "scenario": "En kvinna kommer fram till dig i parkeringshuset sent på kvällen: 'Det står en man vid hissen som gjorde mig rädd – kan du följa mig till bilen?' Vad gör du?",
      "options": [
        "Följer henne till bilen, väntar tills hon kört i väg och noterar därefter diskret mannen vid hissen – trygghetsservice är en del av uppdraget.",
        "Säger att du inte är någon eskortservice.",
        "Pekar ut den kortaste vägen och önskar lycka till.",
        "Går och konfronterar mannen vid hissen först."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Upplevd trygghet är parkeringshusets kärnleverans, och en eskort kostar tre minuter. Hennes oro är dessutom information: mannen vid hissen förtjänar din diskreta uppmärksamhet efteråt.",
      "tags": [
        "bemotande",
        "prioritering"
      ]
    },
    {
      "id": 169,
      "category": "parkering",
      "categoryLabel": "Parkeringshus och garage",
      "level": "grund",
      "source": "v2",
      "title": "Tomgången på plan 3",
      "scenario": "På ett dåligt ventilerat plan står en bil på tomgång med en person som verkar sova i förarsätet. Luften är tung av avgaser. Vad gör du?",
      "options": [
        "Väcker personen omgående genom rutan, får motorn avstängd och personen ut i friskare luft, bedömer påverkan – kolmonoxid är luktfri och dödlig – och larmar 112 vid minsta tecken på medvetandepåverkan.",
        "Knackar en gång och går vidare om ingen svarar.",
        "Öppnar en port och låter det vädra ut.",
        "Skriver en parkeringsanmärkning på rutan."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Avgaser i slutna utrymmen är ett tyst akutläge – 'sover' kan vara medvetslös. Väck, ut, bedöm, larma: kolmonoxidförgiftning ger huvudvärk, förvirring och medvetslöshet utan förvarning.",
      "tags": [
        "sjukvard",
        "prioritering"
      ]
    },
    {
      "id": 170,
      "category": "parkering",
      "categoryLabel": "Parkeringshus och garage",
      "level": "grund",
      "source": "v2",
      "title": "Smitningen",
      "scenario": "Du ser en bil backa in i en parkerad bil så att skador uppstår, varpå föraren kliver ur, tittar sig omkring och går därifrån utan att lämna uppgifter. Vad gör du?",
      "options": [
        "Springer efter och tacklar föraren.",
        "Gör inget – parkeringsskador är ett civilrättsligt ärende.",
        "Dokumenterar registreringsnummer, tid, skador och signalement, säkrar dig som vittne åt den drabbade och rapporterar – smitning från trafikolycksplats är ett brott, men dokumentationen är nästan alltid det proportionerliga verktyget.",
        "Ställer dig bakom bilen så att den inte kan lämna."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Smitning har fängelse i straffskalan, men ett fysiskt ingripande mot en bilförare är sällan proportionerligt eller säkert. Ditt registreringsnummer, dina tider och ditt vittnesmål ger den drabbade allt som behövs.",
      "tags": [
        "dokumentation",
        "prioritering"
      ]
    },
    {
      "id": 171,
      "category": "parkering",
      "categoryLabel": "Parkeringshus och garage",
      "level": "grund",
      "source": "v2",
      "title": "Skateboards på plan 5",
      "scenario": "Tre ungdomar åker skateboard i det nästan tomma parkeringshuset nattetid. Musik ekar mellan planen. Vad gör du?",
      "options": [
        "Ringer polisen direkt.",
        "Tar kontakt med lugn dialog, förklarar att huset inte är öppet för åkning och visar ut dem vänligt – parkeringshuset är inte allmän plats, och tilltalet avgör om de kommer tillbaka i morgon eller inte.",
        "Släcker belysningen så att de inte kan åka.",
        "Konfiskerar skateboardsen tills föräldrar hämtar."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Ett privat parkeringshus får ställa villkor för vistelse – men verktyget mot ungdomar utan brott är dialog och tydlighet, inte tvång eller beslag. Bra bemötande i kväll är billigaste bevakningen nästa vecka.",
      "tags": [
        "bemotande",
        "roller"
      ]
    },
    {
      "id": 172,
      "category": "parkering",
      "categoryLabel": "Parkeringshus och garage",
      "level": "grund",
      "source": "v2",
      "title": "Bensinlukten",
      "scenario": "Vid en parkerad bil känner du kraftig bensinlukt, och en mörk pöl breder ut sig under bilen. Vad gör du?",
      "options": [
        "Startar bilen och kör ut den ur huset.",
        "Lägger sand över pölen och går vidare.",
        "Röker inte men låter andra passera som vanligt.",
        "Spärrar av området, håller tändkällor borta, larmar räddningstjänsten vid pågående läckage av den omfattningen och ser till att fordonsägaren och driften kontaktas – bensinångor i slutna utrymmen är ett explosionsläge."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Bensinångor är tyngre än luft och samlas i slutna garage – en gnista räcker. Avspärrning, inga tändkällor och räddningstjänst vid rinnande läckage; att starta bilen är att erbjuda gnistan själv.",
      "tags": [
        "brand",
        "egen_sakerhet"
      ]
    },
    {
      "id": 173,
      "category": "parkering",
      "categoryLabel": "Parkeringshus och garage",
      "level": "grund",
      "source": "v2",
      "title": "Mannen som bor i bilen",
      "scenario": "Samma bil står på samma plats tredje natten i rad, med immiga rutor, sovsäck och en man som uppenbarligen bor i den. Vad gör du?",
      "options": [
        "Knackar lugnt, informerar vänligt om husets regler, gör en enkel hälsokoll – särskilt vid kyla – tipsar om vart han kan vända sig för stöd och rapporterar enligt rutin, utan dramatik.",
        "Bogserar bort bilen omedelbart.",
        "Bankar på rutorna tills han kör därifrån.",
        "Punkterar ett däck så att frågan löser sig."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Uppdraget och medmänskligheten går att förena: reglerna förklaras, hälsan kontrolleras och vägen till hjälp visas – med värdigheten intakt. Hemlöshet är ingen ordningsfråga att 'lösa' med hårdhet.",
      "tags": [
        "bemotande",
        "sjukvard"
      ]
    },
    {
      "id": 174,
      "category": "parkering",
      "categoryLabel": "Parkeringshus och garage",
      "level": "grund",
      "source": "v2",
      "title": "Bommen och stötfångaren",
      "scenario": "En bilist som vägrar betala gasar mot utfartsbommen, backar och gasar igen medan kön bakom växer. Vad gör du?",
      "options": [
        "Ställer dig framför bommen som mänsklig sköld.",
        "Låter honom köra sönder bommen – då blir det polissak.",
        "Öppnar bommen och släpper ut fordonet när fara för person eller egendom annars uppstår, dokumenterar registreringsnummer och förlopp och rapporterar till polis och parkeringsbolag – en bom är aldrig värd en påkörning.",
        "Hoppar upp på motorhuven för att stoppa honom."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Materiella hinder försvaras aldrig med kroppar, och en desperat bilist är ett fordon utan omdöme. Släpp ut, dokumentera, anmäl: registreringsnumret driver ärendet vidare – helt utan att någon skadas.",
      "tags": [
        "egen_sakerhet",
        "prioritering"
      ]
    },
    {
      "id": 175,
      "category": "hundforare",
      "categoryLabel": "Hundförare",
      "level": "fordjupning",
      "source": "v2",
      "title": "Markeringen vid containern",
      "scenario": "Under sökrond markerar din tjänstehund tydligt mot en container på det inhägnade området – någon kan gömma sig där. Vad gör du?",
      "options": [
        "Öppnar containern och skickar in hunden.",
        "Håller hunden kopplad, tar betryggande avstånd, ropar an mot containern och larmar ledningscentral och polis enligt rutin – hunden har gjort sitt jobb, resten är lägesbedömning.",
        "Släpper hunden lös runt containern som markering.",
        "Bankar på containern med batongen."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Hundens markering är information, inte ett startskott: du vet att någon troligen finns där, men inte vem, hur många eller med vad. Anrop, avstånd och larm – ett hundsläpp mot okänd person är våldsanvändning som kräver ett försvarligt läge.",
      "tags": [
        "hundforare",
        "egen_sakerhet"
      ]
    },
    {
      "id": 176,
      "category": "hundforare",
      "categoryLabel": "Hundförare",
      "level": "fordjupning",
      "source": "v2",
      "title": "Barnet som vill klappa",
      "scenario": "Ett barn springer plötsligt fram mot din tjänstehund med utsträckta händer: 'Får jag klappa!' Föräldern är flera meter bakom. Vad gör du?",
      "options": [
        "Avvärjer vänligt men bestämt: kliver emellan, förkortar kopplet och förklarar att hunden arbetar och inte får klappas – med ett leende till barnet och föräldern.",
        "Låter barnet klappa – hunden är ju snäll.",
        "Ryter åt barnet att stanna.",
        "Lyfter upp hunden i famnen."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "En tjänstehund i arbete är ett arbetsredskap med kontrollansvar – ett överraskat hundmöte kan gå fel på en sekund. Vänlig tydlighet skyddar barnet, hunden och förtroendet på samma gång.",
      "tags": [
        "hundforare",
        "bemotande"
      ]
    },
    {
      "id": 177,
      "category": "hundforare",
      "categoryLabel": "Hundförare",
      "level": "fordjupning",
      "source": "v2",
      "title": "Påken",
      "scenario": "En man höjer en träpåk och går mot dig med tydlig avsikt att slå. Du har din tjänstehund kopplad vid sidan. Vad gäller?",
      "options": [
        "Hunden får aldrig användas mot människor.",
        "Du släpper hunden direkt utan förvarning.",
        "Du kastar kopplet och springer.",
        "Hunden är i det läget ett skyddsmedel inom nödvärnsrätten: varna om situationen medger, och använd hunden med samma försvarlighetskrav som allt annat våld – aldrig mer än angreppet kräver, och avbryt när angreppet upphör."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Hundanvändning mot person är våldsanvändning och prövas mot nödvärnets och proportionalitetens vanliga måttstock. Ett pågående väpnat angrepp kan motivera den – men varningen först och nedtrappningen efteråt är samma som alltid.",
      "tags": [
        "hundforare",
        "nodvarn"
      ]
    },
    {
      "id": 178,
      "category": "hundforare",
      "categoryLabel": "Hundförare",
      "level": "fordjupning",
      "source": "v2",
      "title": "Den haltande hunden",
      "scenario": "Halvvägs in i passet börjar din hund halta märkbart på ett framben. Tre sökmoment återstår enligt instruktionen. Vad gör du?",
      "options": [
        "Fortsätter passet – hunden får vila i morgon.",
        "Ger hunden en värktablett ur ditt eget förråd.",
        "Avbryter hundmomenten, rapporterar till ledningscentralen och tar ekipaget ur tjänst enligt rutin – en skadad hund är varken funktionsduglig eller djurskyddsmässigt försvarbar att arbeta med.",
        "Bär hunden mellan sökmomenten."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Ekipaget är godkänt tillsammans, och hundens hälsa är både en djurskyddsfråga och en funktionsfråga – en haltande hund söker sämre och riskerar förvärrad skada. Samma logik som för en skadad väktare: rapportera och avbryt.",
      "tags": [
        "hundforare",
        "arbetsmiljo"
      ]
    },
    {
      "id": 179,
      "category": "hundforare",
      "categoryLabel": "Hundförare",
      "level": "fordjupning",
      "source": "v2",
      "title": "Släpp hunden i lagret",
      "scenario": "Kundens driftchef hör ljud inifrån ett mörkt lager och kräver: 'Släpp in hunden lös så får vi se vad det är!' Vad gör du?",
      "options": [
        "Släpper hunden – kunden känner sitt lager.",
        "Avböjer: ett okontrollerat släpp mot okänd person eller okänt djur är oförsvarligt – du söker i stället metodiskt med hunden kopplad enligt din utbildning, efter anrop och med polis larmad vid misstänkt inbrott.",
        "Släpper hunden men ropar en varning först.",
        "Ber driftchefen gå in själv först."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Ljudet kan vara en inbrottstjuv, en instängd anställd eller en katt – ett lössläpp gör hunden till ett vapen du inte längre styr. Metodiken är anrop, kopplat sök och polis; kundens otålighet ändrar ingen försvarlighetsbedömning.",
      "tags": [
        "hundforare",
        "over_disk"
      ]
    },
    {
      "id": 180,
      "category": "hundforare",
      "categoryLabel": "Hundförare",
      "level": "fordjupning",
      "source": "v2",
      "title": "Hundrädslan",
      "scenario": "En anställd på objektet trycker sig panikslaget mot väggen när du kommer med hunden i korridoren: 'Snälla, jag är livrädd för hundar!' Vad gör du?",
      "options": [
        "Skapar direkt avstånd: förkortar kopplet, ställer hunden på din bortre sida, stannar upp och låter personen passera i sin egen takt – och anpassar framöver din väg när personen syns.",
        "Förklarar att hunden är ofarlig och går fram så hon får se.",
        "Skrattar bort det – rädslan är ju irrationell.",
        "Ber henne ta en annan korridor i fortsättningen."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Hundrädsla är verklig och kan vara handikappande – och personen är på sin arbetsplats. Ditt kontrollansvar inkluderar att omgivningen känner sig trygg: avstånd, förutsägbarhet och respekt kostar ingenting.",
      "tags": [
        "hundforare",
        "bemotande"
      ]
    },
    {
      "id": 181,
      "category": "byggarbetsplats",
      "categoryLabel": "Byggarbetsplats",
      "level": "grund",
      "source": "v2",
      "title": "Utan ID06",
      "scenario": "Innanför byggstaketet möter du en man i arbetskläder utan synligt ID06-kort: 'Kortet ligger i bilen, jag jobbar för rörfirman.' Vad gör du?",
      "options": [
        "Släpper honom vidare – arbetskläderna talar för honom.",
        "Ber honom hämta kortet och litar på att han gör det.",
        "Följer honom lugnt till grinden och verifierar med platsledningen mot personalliggaren – innanför staketet vistas man med giltigt ID06 enligt platsens regler, utan undantag.",
        "Fotograferar honom och släpper honom sedan."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "ID06 och personalliggaren är byggets behörighetssystem, och 'kortet ligger i bilen' är en klassisk replik för både obehöriga och svartarbete. Vänligt till grinden, verifiering via platsledningen – lika för alla.",
      "tags": [
        "id_kontroll",
        "rutin"
      ]
    },
    {
      "id": 182,
      "category": "byggarbetsplats",
      "categoryLabel": "Byggarbetsplats",
      "level": "grund",
      "source": "v2",
      "title": "Slangen i dieseltanken",
      "scenario": "Under nattronden ser du en man stå böjd över en hjullastare med en slang nedstucken i dieseltanken och en dunk bredvid sig. Vad gör du?",
      "options": [
        "Bedömer läget på avstånd, larmar polis via ledningscentralen med position och signalement – och griper på bar gärning endast om det kan ske säkert; stölden pågår inför dina ögon, men verktyg och mörker väger tungt i riskbedömningen.",
        "Rusar fram och rycker slangen ur tanken.",
        "Tänder ficklampan rakt i ansiktet på honom och skriker.",
        "Väntar tills han är klar så att dunken blir bevis."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Pågående dieselstöld är bar gärning och gripbar – men en ensam man med verktyg i mörker är också en riskbild. Larm och observation först; gripandet är en rättighet du använder när säkerhetsbedömningen tillåter.",
      "tags": [
        "envarsgripande",
        "egen_sakerhet"
      ]
    },
    {
      "id": 183,
      "category": "byggarbetsplats",
      "categoryLabel": "Byggarbetsplats",
      "level": "grund",
      "source": "v2",
      "title": "Klättraren i kranen",
      "scenario": "Klockan 02 upptäcker du en ung person som klättrar i byggkranen, filmande sig själv med mobilen på väg uppåt. Vad gör du?",
      "options": [
        "Klättrar efter för att hämta ner honom.",
        "Skriker åt honom att hoppa ner.",
        "Släcker byggplatsens belysning så att han inte kan filma.",
        "Larmar polis och räddningstjänst omgående, försöker etablera lugn röstkontakt nerifrån utan att stressa klättringen – och klättrar aldrig själv efter."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Kranklättring är ett livsfarligt fenomen där stress och skrik kan orsaka fallet du vill förhindra. Räddningstjänsten har höjdkompetensen; din uppgift är larm, lugn och att hålla marken under kranen fri.",
      "tags": [
        "egen_sakerhet",
        "prioritering"
      ]
    },
    {
      "id": 184,
      "category": "byggarbetsplats",
      "categoryLabel": "Byggarbetsplats",
      "level": "grund",
      "source": "v2",
      "title": "Schaktkanten",
      "scenario": "Vid ronden hittar du en djup, vattenfylld schaktgrop där avspärrningen blåst omkull – och byggplatsens staket har en känd lucka som kvarterets barn brukar använda. Vad gör du?",
      "options": [
        "Noterar bristen till morgonens rapport.",
        "Återställer avspärrningen provisoriskt direkt, rapporterar avvikelsen till platsledningen samma natt och kontrollerar att staketluckan täpps – en öppen grop plus nyfikna barn är en dödsolycka som väntar.",
        "Lägger några brädor löst över gropen.",
        "Ställer dig och vaktar gropen resten av passet."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Fysiska risker för tredje man – särskilt barn – åtgärdas provisoriskt på plats och eskaleras direkt, inte i morgonrapporten. Lösa brädor över en grop är en fälla, inte en avspärrning.",
      "tags": [
        "arbetsmiljo",
        "prioritering"
      ]
    },
    {
      "id": 185,
      "category": "byggarbetsplats",
      "categoryLabel": "Byggarbetsplats",
      "level": "grund",
      "source": "v2",
      "title": "Glöden under presenningen",
      "scenario": "Där dagens svetsarbete pågick känner du på kvällsronden bränd lukt, och under en presenning glöder det svagt i isoleringsmaterial. Vad gör du?",
      "options": [
        "Lägger tillbaka presenningen så att glöden kvävs.",
        "Antecknar det till brandskyddsansvarig i morgon.",
        "Drar undan presenningen försiktigt, släcker glöden grundligt med närmaste släckutrustning, bevakar mot återantändning och rapporterar – heta arbeten kräver efterkontroll, och den brast uppenbarligen i dag.",
        "Häller kaffe över glöden och går vidare."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Glödbränder efter heta arbeten är en klassisk storbrandsorsak – de pyr i timmar innan de slår upp. Släck grundligt, bevaka återantändningen och rapportera bristen i rutinen: brandvaktens efterkontroll fanns där av ett skäl.",
      "tags": [
        "brand",
        "rutin"
      ]
    },
    {
      "id": 186,
      "category": "byggarbetsplats",
      "categoryLabel": "Byggarbetsplats",
      "level": "grund",
      "source": "v2",
      "title": "Nycklarna i tändningslåset",
      "scenario": "En hjullastare står med nycklarna kvar i tändningslåset på den öde byggplatsen. Maskinstölder har ökat i området. Vad gör du?",
      "options": [
        "Låter nycklarna sitta – maskinföraren blir arg annars.",
        "Tar hand om nycklarna, lämnar dem enligt platsens rutin med tydlig notering om var de hittades och rapporterar avvikelsen – en startklar maskin är både stöldobjekt och skaderisk.",
        "Gömmer nycklarna under maskinen.",
        "Provkör maskinen för att se att den fungerar."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "En maskin med nyckel i är en inbjudan – till tjuvar och till nattliga 'provförare'. Nycklarna säkras spårbart enligt rutin, och avvikelsen rapporteras så att slarv i låsrutinen kan rättas till.",
      "tags": [
        "rutin",
        "dokumentation"
      ]
    },
    {
      "id": 187,
      "category": "byggarbetsplats",
      "categoryLabel": "Byggarbetsplats",
      "level": "grund",
      "source": "v2",
      "title": "Barnet i gropen",
      "scenario": "En lördagseftermiddag hittar du ett ensamt barn i sjuårsåldern lekande nere i en grund schaktgrop på bygget. Ingen vuxen syns till. Vad gör du?",
      "options": [
        "Ropar åt barnet att gå hem.",
        "Ringer socialtjänsten och väntar vid gropen.",
        "Låter barnet leka klart under din uppsikt.",
        "Hjälper lugnt barnet upp och bort från farorna, stannar hos det, försöker nå vårdnadshavare – via barnet eller polisen om ingen hittas – och spärrar därefter vägen barnet kom in: hålet i skalskyddet är nästa akutpunkt."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Barnet först, alltid: upp ur gropen, trygghet och vuxenkontakt via polisen om ingen förälder nås. Sedan orsaken – ett bygge som ett barn kan ta sig in på släpper in nästa barn i kväll.",
      "tags": [
        "barn",
        "prioritering"
      ]
    },
    {
      "id": 188,
      "category": "byggarbetsplats",
      "categoryLabel": "Byggarbetsplats",
      "level": "grund",
      "source": "v2",
      "title": "Hjälmen behövs inte där",
      "scenario": "Skyltningen kräver hjälm i hela produktionsområdet, men platschefen säger åt dig: 'Du behöver ingen hjälm på din rondväg, det är lugnt där.' Vad gör du?",
      "options": [
        "Går utan hjälm – platschefen råder över arbetsstället.",
        "Går utan hjälm men skriver en avvikelse.",
        "Bär hjälmen enligt skyltningen och förklarar vänligt att du följer områdets skyddsregler – muntliga undantag från skyltade krav gäller inte dig, och det strängaste regelverket vinner alltid.",
        "Ronderar bara utanför staketet i fortsättningen."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Skyltade skyddskrav är platsens regelverk, och som inhyrd följer du det fullt ut – ett muntligt 'det är lugnt' skyddar varken huvudet eller ansvarsfrågan när något faller. Strängaste regeln gäller, varje gång.",
      "tags": [
        "arbetsmiljo",
        "rutin"
      ]
    },
    {
      "id": 189,
      "category": "roller_befogenheter",
      "categoryLabel": "Roller och befogenheter",
      "level": "grund",
      "source": "v2",
      "title": "Bötfäll dem!",
      "scenario": "Kunden är irriterad över felparkerade bilar på fastighetens mark och kräver att du 'lappar' dem: 'Du är ju vakt, skriv ut böter!' Vad gör du?",
      "options": [
        "Skriver egna lappar med betalningskrav.",
        "Förklarar att kontrollavgifter och parkeringsanmärkningar utfärdas av parkeringsbolag och parkeringsvakter – inte av väktare – och rapporterar problemet så att kunden kan koppla in rätt aktör.",
        "Låser fast bilarnas hjul med kätting.",
        "Ringer polisen om varje felparkerad bil."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Parkeringsövervakning är en egen roll med eget regelverk – väktarens uniform ger ingen rätt att utfärda avgifter. Rätt svar är att lotsa kunden till rätt aktör, inte att improvisera myndighet.",
      "tags": [
        "roller",
        "over_disk"
      ]
    },
    {
      "id": 190,
      "category": "roller_befogenheter",
      "categoryLabel": "Roller och befogenheter",
      "level": "grund",
      "source": "v2",
      "title": "Håll honom åt mig",
      "scenario": "En biljettkontrollant på stationen ropar till dig: 'Han vägrar visa leg och tänker smita från tilläggsavgiften – håll kvar honom tills polisen kommer!' Vad gör du?",
      "options": [
        "Håller fast mannen som kontrollanten ber om.",
        "Ställer dig i vägen så att mannen inte kommer förbi.",
        "Kräver själv att mannen visar legitimation.",
        "Avböjer kvarhållandet – ingen får hålla kvar någon för identifiering eller tilläggsavgift – men bistår inom din roll: närvaro, lugnande samtal och vittnesuppgifter till kontrollantens rapport."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Befogenheter smittar inte mellan roller: varken kontrollanten eller du får frihetsberöva någon för en avgiftsfråga. Din närvaro och dina iakttagelser är det stöd som ryms i väktarrollen.",
      "tags": [
        "roller",
        "laga_befogenhet"
      ]
    },
    {
      "id": 191,
      "category": "roller_befogenheter",
      "categoryLabel": "Roller och befogenheter",
      "level": "grund",
      "source": "v2",
      "title": "Ta min post en timme",
      "scenario": "Skyddsvakten vid anläggningen du delar område med behöver åka akut och ber dig 'ta hans post' i en timme: 'Det är ju samma jobb ungefär.' Vad gör du?",
      "options": [
        "Avböjer: skyddsvaktens post kräver skyddsvaktsgodkännande och de befogenheter som följer med det – du larmar i stället hans arbetsledning om bemanningsluckan och kan bevaka som väktare utanför skyddsobjektets särskilda krav.",
        "Tar posten – en timme spelar ingen roll.",
        "Tar posten men lovar att inte använda hans befogenheter.",
        "Låser grinden och åker hem."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Skyddsvakt är en förordnad roll med egna tvångsbefogenheter enligt skyddslagen – den kan inte lånas ut över en kaffe. Bemanningsluckan är arbetsgivarens akuta problem att lösa med behörig personal.",
      "tags": [
        "roller",
        "rutin"
      ]
    },
    {
      "id": 192,
      "category": "roller_befogenheter",
      "categoryLabel": "Roller och befogenheter",
      "level": "grund",
      "source": "v2",
      "title": "Ordningsvakten från krogen",
      "scenario": "En ordningsvakt från nattklubben intill följer efter en bråkstake in på kontorsfastigheten du bevakar och vill 'avsluta avvisningen' där inne. Vad gäller?",
      "options": [
        "Ordningsvaktens befogenheter gäller överallt dygnet runt.",
        "Ordningsvakten bestämmer – han har högre befogenheter än du.",
        "Ordningsvaktens förordnande gäller det område det utfärdats för – utanför det agerar han som envar, precis som du. Ni samverkar utifrån det: din fastighet, era gemensamma envarsrättigheter, och polis vid behov.",
        "Du måste avvisa ordningsvakten från fastigheten."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Ordningsvaktens utökade verktyg följer förordnandets geografi – kliver han utanför är han en välutbildad envar. Kunskapen om varandras gränser är grunden för bra samverkan i stället för revirstrid.",
      "tags": [
        "roller",
        "laga_befogenhet"
      ]
    },
    {
      "id": 193,
      "category": "roller_befogenheter",
      "categoryLabel": "Roller och befogenheter",
      "level": "grund",
      "source": "v2",
      "title": "Västen med SECURITY",
      "scenario": "Vid en trafikolycka utanför ditt objekt står en okänd man i väst märkt 'SECURITY' och dirigerar trafiken med stora gester. Ingen känner honom. Vad gör du?",
      "options": [
        "Låter honom hållas – han hjälper ju till.",
        "Tar kontakt vänligt, bildar dig en uppfattning om vem han är, och informerar polisen på väg till platsen om mannen – välvilliga hjälpare finns, men falska funktionsvästar används också för att skaffa auktoritet och access.",
        "Sliter av honom västen inför alla.",
        "Ställer dig och dirigerar åt andra hållet."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "En väst är inte en behörighet, och den som klär sig i auktoritet ska tåla en vänlig fråga. Polisen som kommer till olycksplatsen avgör – din uppgift är att de vet vad som mött dig.",
      "tags": [
        "roller",
        "social_manipulation"
      ]
    },
    {
      "id": 194,
      "category": "roller_befogenheter",
      "categoryLabel": "Roller och befogenheter",
      "level": "grund",
      "source": "v2",
      "title": "Grannbutikens gripande",
      "scenario": "Ägaren till grannbutiken – inte din kund – har själv gripit en man för stöld på bar gärning och ropar på dig: 'Hjälp mig vakta honom tills polisen kommer!' Vad gör du?",
      "options": [
        "Avböjer – butiken är inte din kund.",
        "Tar över helt och skickar hem ägaren.",
        "Ringer din kund och frågar om lov först.",
        "Bistår som envar: förvissar dig kort om att gripandet vilar på bar gärning, hjälper till att hålla läget lugnt och säkert, kontrollerar att polis är larmad – och dokumenterar dina egna iakttagelser för rapporten."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Envarsgripandet tillhör alla, och att bistå vid ett lagligt gripande är envars rätt – uniformen ändrar varken mer eller mindre. Din snabba kontroll av grunden skyddar dig från att förlänga ett olagligt frihetsberövande.",
      "tags": [
        "envarsgripande",
        "roller"
      ]
    },
    {
      "id": 195,
      "category": "roller_befogenheter",
      "categoryLabel": "Roller och befogenheter",
      "level": "grund",
      "source": "v2",
      "title": "Svampplockaren",
      "scenario": "Innanför skylten 'Skyddsobjekt – tillträdesförbud' vid anläggningen möter du en äldre man med svampkorg som uppenbart gått vilse. Du är väktare, inte skyddsvakt. Vad gör du?",
      "options": [
        "Informerar vänligt om att området är skyddsobjekt, följer honom till närmaste utgång och rapporterar händelsen till skyddsvakt eller polis enligt instruktion – skyddslagens tvångsbefogenheter har du inte, men omhändertagandet av situationen klarar du med dialog.",
        "Omhändertar honom med stöd av skyddslagen.",
        "Beslagtar svampkorgen som bevis.",
        "Låter honom plocka klart eftersom han verkar ofarlig."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Även den ofarligaste överträdelse av ett skyddsobjekt ska hanteras och rapporteras – men verktygen skiljer sig med rollen: skyddsvaktens befogenheter kräver förordnande. Din dialog löser fallet, din rapport stänger det.",
      "tags": [
        "roller",
        "dokumentation"
      ]
    },
    {
      "id": 196,
      "category": "roller_befogenheter",
      "categoryLabel": "Roller och befogenheter",
      "level": "grund",
      "source": "v2",
      "title": "Hjälp till i säkerhetskontrollen",
      "scenario": "På flygplatsen där du ronderar landside ber en stressad kollega i säkerhetskontrollen dig hoppa in och visitera passagerare: 'Vi har kö och du är ju också vakt.' Vad gör du?",
      "options": [
        "Hoppar in – visitation kan du ju.",
        "Visiterar bara handbagage, inte personer.",
        "Avböjer: flygplatsens säkerhetskontroll utförs av särskilt utbildade och förordnade kontrollanter enligt luftfartens regelverk – du hjälper i stället till med det som ryms i din roll, som köordning och information.",
        "Tar av dig uniformen och hjälper till civilt."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Säkerhetskontrollantens visitationer vilar på ett eget förordnande och regelverk – väktarutbildningen ersätter det inte. Att kunna sin rollgräns under tidspress är exakt vad båda rollerna kräver.",
      "tags": [
        "roller",
        "visitation"
      ]
    },
    {
      "id": 197,
      "category": "roller_befogenheter",
      "categoryLabel": "Roller och befogenheter",
      "level": "grund",
      "source": "v2",
      "title": "Låna dina fängsel",
      "scenario": "Kommunens trygghetsvärd ber att få låna dina handfängsel 'om det skulle hetta till i kväll'. Vad gör du?",
      "options": [
        "Lånar ut dem – ni jobbar ju för samma trygghet.",
        "Avböjer: handfängsel är personlig utrustning knuten till din utbildning och din roll – och trygghetsvärdar har varken utbildningen eller befogenhetsläget för dem. Du erbjuder i stället samverkan: han larmar, du och polisen agerar.",
        "Lånar ut dem mot kvitto.",
        "Säljer dina gamla fängsel till honom."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Utrustning följer utbildning och roll – ett utlånat fängsel i otränade händer är en skadad person och en rättslig härdsmälta i väntan. Trygghetsvärdens styrka är ögon och relationer; dina verktyg stannar i ditt bälte.",
      "tags": [
        "roller",
        "rutin"
      ]
    },
    {
      "id": 198,
      "category": "roller_befogenheter",
      "categoryLabel": "Roller och befogenheter",
      "level": "grund",
      "source": "v2",
      "title": "P-vakten och den rasande bilisten",
      "scenario": "En parkeringsvakt får en kontrollavgift uppriven i ansiktet, och bilisten kliver ur bilen och går hotfullt mot honom med knutna nävar. Vad gör du?",
      "options": [
        "Ställer dig bredvid p-vakten och skriver en egen avgift.",
        "Hjälper bilisten att överklaga avgiften på plats.",
        "Filmar förloppet på avstånd.",
        "Kliver in för att skydda personen: skapar avstånd, deeskalerar och larmar polis – vid ett fysiskt angrepp gäller nödvärn till förmån för annan. Avgiftstvisten är däremot inte din: den löses mellan bilisten och bolaget."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Människan skyddas, tvisten lämnas: p-vaktens säkerhet är ett nödvärns- och medmänniskoläge, kontrollavgiften ett civilrättsligt ärende. Att kunna skilja de två mitt i ilskan är rollkunskap i praktiken.",
      "tags": [
        "nodvarn",
        "roller"
      ]
    },
    {
      "id": 199,
      "category": "vu2_juridik",
      "categoryLabel": "Juridiska gränsfall (VU2)",
      "level": "fordjupning",
      "source": "v2",
      "title": "Larmet som klipptes",
      "scenario": "I provrumsgången ser du en man klippa loss larmbrickan från en jacka värd 4 000 kronor och stoppa jackan i en väska. Han är fortfarande långt från kassorna. Vad gäller?",
      "options": [
        "Inget kan göras förrän han passerat kassalinjen.",
        "Du får bara be personalen gömma jackorna bättre.",
        "Manipulationen av larmet fullbordar redan försökspunkten: försök till stöld av det värdet är straffbart med fängelse i skalan – gripande är möjligt redan nu, förutsatt säkra iakttagelser av själva klippet.",
        "Du väntar utanför butiken för säkerhets skull."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Vid stöld av normalgraden är redan försöket gripbart – och att klippa larmet är en så tydlig utförandehandling att försökspunkten normalt är nådd. Jämför med låga värden, där försök till ringa stöld inte ens är straffbart.",
      "tags": [
        "forsok",
        "envarsgripande"
      ]
    },
    {
      "id": 200,
      "category": "vu2_juridik",
      "categoryLabel": "Juridiska gränsfall (VU2)",
      "level": "fordjupning",
      "source": "v2",
      "title": "Ångern vid kassan",
      "scenario": "En kvinna har gömt godis för cirka 60 kronor i fickan, men vid kassan tvekar hon, tar upp godiset och lägger det på bandet för betalning. Vad gäller?",
      "options": [
        "Inget brott finns att ingripa mot: stölden fullbordades aldrig, och försök till ringa stöld är inte straffbart – dessutom trädde hon frivilligt tillbaka. Du noterar händelsen för din egen mönsterbild, inget mer.",
        "Du griper henne – intaget i fickan räckte.",
        "Du kräver att hon betalar dubbelt som kompensation.",
        "Du portar henne från butiken på stående fot."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Två skäl var för sig räcker: vid ringa värden är försöket straffritt, och ett frivilligt tillbakaträdande före fullbordan friar även annars. Den som ångrar sig vid kassan är en kund som betalar – behandla henne så.",
      "tags": [
        "forsok",
        "envarsgripande"
      ]
    },
    {
      "id": 201,
      "category": "vu2_juridik",
      "categoryLabel": "Juridiska gränsfall (VU2)",
      "level": "fordjupning",
      "source": "v2",
      "title": "Flyktbilen",
      "scenario": "Två män bär ut en TV genom en nödutgång medan en tredje väntar i en bil med motorn igång precis utanför. Vad gäller för föraren?",
      "options": [
        "Föraren begår inget brott – han sitter ju bara i bilen.",
        "Föraren deltar som medverkande och kan i princip gripas på bar gärning – men en bil är också ett vapen: prioritera registreringsnummer, signalement och larm, och blockera aldrig fordonet med din kropp.",
        "Föraren får bara gripas om han kliver ur bilen.",
        "Du ska köra din bil framför flyktbilen som hinder."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Medverkansansvaret gör chauffören gripbar på samma villkor som bärarna – juridiskt. Taktiskt väger fordonet tyngst i riskbedömningen: ingen TV är värd en påkörning, och registreringsnumret fångar honom i morgon.",
      "tags": [
        "medverkan",
        "egen_sakerhet"
      ]
    },
    {
      "id": 202,
      "category": "vu2_juridik",
      "categoryLabel": "Juridiska gränsfall (VU2)",
      "level": "fordjupning",
      "source": "v2",
      "title": "Ångrat samtycke",
      "scenario": "Under entrévisitationen till en konsert säger en besökare mitt i momentet: 'Nej, jag ångrar mig – sluta.' Vad gäller?",
      "options": [
        "Du gör klart visitationen snabbt – han sa ju ja från början.",
        "Du håller fast honom tills visitationen är klar.",
        "Du visiterar bara det som återstår i väskan, inte kläderna.",
        "Du avbryter visitationen omedelbart – samtycket kan återkallas när som helst – och konsekvensen blir densamma som vid vägran från början: inget inträde."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Frivillig visitation vilar på ett samtycke som gäller sekund för sekund. Utan samtycke saknar fortsättningen lagstöd, hur nära klart du än var – men villkoret för inträde kvarstår, så valet är fortfarande hans.",
      "tags": [
        "visitation",
        "samtycke"
      ]
    },
    {
      "id": 203,
      "category": "vu2_juridik",
      "categoryLabel": "Juridiska gränsfall (VU2)",
      "level": "fordjupning",
      "source": "v2",
      "title": "Ryckkampen om väskan",
      "scenario": "Du har hunnit ifatt en väskryckare på bar gärning och greppat väskan för att återta den. Gärningsmannen rycker emot med full kraft och försöker slita tillbaka den. Vad gäller?",
      "options": [
        "Du måste släppa väskan – dragkamp är förbjuden.",
        "Du får bara hålla emot, aldrig göra något aktivt.",
        "Nödvärnsrätten gäller mot den som med våld hindrar att egendom återtas på bar gärning – du får använda det våld som inte är uppenbart oförsvarligt för att fullfölja återtagandet.",
        "Du får slå honom tills han släpper, oavsett hur."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Nödvärnets andra punkt är byggd för exakt detta läge: på bar gärning får egendom återtas, och våldsamt motstånd mot återtagandet möts med försvarligt våld. Gränsen är som alltid det uppenbart oförsvarliga – och nedtrappningen när han släpper.",
      "tags": [
        "nodvarn",
        "atertagande"
      ]
    },
    {
      "id": 204,
      "category": "vu2_juridik",
      "categoryLabel": "Juridiska gränsfall (VU2)",
      "level": "fordjupning",
      "source": "v2",
      "title": "Greppet som inte släpper",
      "scenario": "Din kollega har brottat ner en angripare som nu ligger stilla, gråter och ropar 'jag ger mig' – men kollegan fortsätter pressa sin underarm mot mannens hals. Vad gör du?",
      "options": [
        "Ingriper omedelbart: 'Han har gett upp – släpp trycket!', tar vid behov fysiskt över till ett kontrollerat grepp, kontrollerar mannens tillstånd och rapporterar hela förloppet, inklusive ditt ingripande.",
        "Låter kollegan avgöra – det var han som blev angripen.",
        "Tittar bort så att du slipper vittna om det.",
        "Väntar tills polisen kommer och låter dem bedöma."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "När motståndet upphört är fortsatt våld inte längre försvar utan ett nytt brott – och tryck mot hals är dessutom livsfarligt. Din skyldighet är att bryta förloppet nu; lojaliteten som tiger gör dig delaktig.",
      "tags": [
        "excess",
        "kollegialitet"
      ]
    },
    {
      "id": 205,
      "category": "vu2_juridik",
      "categoryLabel": "Juridiska gränsfall (VU2)",
      "level": "fordjupning",
      "source": "v2",
      "title": "Pistolen i mörkret",
      "scenario": "I ett mörkt garage riktar en man något svart och pistolliknande mot dig på tre meters håll. Du kastar dig fram och brottar ner honom hårt. Föremålet visar sig vara en leksakspistol. Vad gäller?",
      "options": [
        "Du döms för misshandel – pistolen var ju falsk.",
        "Ditt agerande bedöms utifrån situationen som du med fog uppfattade den: ett riktat vapen i mörker gav en nödvärnssituation, även om vapnet visade sig vara attrapp – dokumentera noga exakt vad du såg och varför du uppfattade det som skarpt.",
        "Leksakspistoler får alltid ignoreras.",
        "Du måste be om ursäkt och ersätta leksaken, inget mer."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Putativt nödvärn skyddar den som gör en befogad felbedömning i stunden – ingen kan kräva facit i mörkret. Men skyddet vilar på att uppfattningen var rimlig, och det är din detaljerade rapport som visar det.",
      "tags": [
        "putativt",
        "dokumentation"
      ]
    },
    {
      "id": 206,
      "category": "vu2_juridik",
      "categoryLabel": "Juridiska gränsfall (VU2)",
      "level": "fordjupning",
      "source": "v2",
      "title": "Cykeln utanför Ica",
      "scenario": "Kundens tjänstecykel stals i går. I dag ser du den – omisskännlig med företagets dekaler – fastlåst utanför en mataffär. Vad gör du?",
      "options": [
        "Klipper låset och tar tillbaka cykeln – den är ju kundens.",
        "Väntar vid cykeln och tar den från den som kommer.",
        "Sätter ett eget lås på cykeln så att den inte kan flyttas.",
        "Kontaktar polis, dokumenterar plats och lås, och låter kunden formellt peka ut cykeln – egenhändigt återtagande dagen efter är förbjuden självtäkt, hur rätt ni än har i sak."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Bar gärning-fönstret stängdes i går: nu äger rättsordningen återtagandet. Att klippa låset vore själv­täkt och möjligen skadegörelse – polisen löser samma sak lagligt på en timme, med din dokumentation som karta.",
      "tags": [
        "sjalvtakt",
        "dokumentation"
      ]
    },
    {
      "id": 207,
      "category": "vu2_juridik",
      "categoryLabel": "Juridiska gränsfall (VU2)",
      "level": "fordjupning",
      "source": "v2",
      "title": "Aktivisterna efter stängning",
      "scenario": "Fem aktivister sitter kvar i butikens entré efter stängning, vägrar lämna trots upprepade uppmaningar och filmar allt. De är helt fredliga. Vad gäller?",
      "options": [
        "Inget brott begås – de sitter ju bara.",
        "Du ska bära ut dem en och en omedelbart.",
        "Obehörigt kvarstannande i lokalen efter stängning och tillsägelse kan utgöra olaga intrång, som sedan 2022 har fängelse i skalan – gripande är alltså juridiskt möjligt, men proportionaliteten talar starkt för polis: fredligt motstånd, flera personer, kameror.",
        "Du släcker och larmar på lokalen med dem kvar inne."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Juridiskt gripbart är inte detsamma som klokt att gripa: fem fredliga personer inför kameror är polisens hemmaplan, inte din. Att kunna befogenheten och ändå välja det lugnare verktyget är fördjupningens kärna.",
      "tags": [
        "olaga_intrang",
        "prioritering"
      ]
    },
    {
      "id": 208,
      "category": "vu2_juridik",
      "categoryLabel": "Juridiska gränsfall (VU2)",
      "level": "fordjupning",
      "source": "v2",
      "title": "Jackorna ur sportbagen",
      "scenario": "På ditt köpcentrum säljer en man märkesjackor med prislapparna kvar ur en sportbag, till en tredjedel av butikspriset. Vad gör du?",
      "options": [
        "Dokumenterar diskret – signalement, plats, tider, vilka varor – och rapporterar till polisen via rutin: misstänkt häleri utreds av polis, och du köper aldrig 'bevis' eller konfronterar på egen hand.",
        "Köper en jacka som bevis för utredningen.",
        "Beslagtar bagen med jackorna.",
        "Griper honom för stöld – jackorna är ju uppenbart stulna."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Att varorna sannolikt är stulna gör inte försäljaren till tjuven du sett på bar gärning – häleribedömningen kräver utredning. Din dokumentation ger polisen fallet; ett eget köp gör dig till del av problemet.",
      "tags": [
        "haleri",
        "dokumentation"
      ]
    },
    {
      "id": 209,
      "category": "vu2_juridik",
      "categoryLabel": "Juridiska gränsfall (VU2)",
      "level": "fordjupning",
      "source": "v2",
      "title": "Sextonåringen och fängslen",
      "scenario": "En 16-åring du gripit för stöld gör våldsamt motstånd, sparkar och försöker slita sig. Du överväger handfängsel. Vad gäller?",
      "options": [
        "Fängsel används aldrig på personer under 18 år.",
        "Fängsel kan användas även på en 16-åring, men bedömningen är extra restriktiv: bara om det är oundgängligen nödvändigt för säkerheten, med skärpt övervakning – och behovet, alternativen och kontrollerna dokumenteras särskilt noga.",
        "Fängsel sätts alltid på minderåriga för deras egen skull.",
        "Du släpper honom – unga får inte gripas med våld."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Åldern förbjuder inte fängsel men höjer ribban rejält: proportionaliteten bedöms strängare mot unga, och varje minut ska kunna motiveras. Rapporten efteråt granskas – skriv den därefter.",
      "tags": [
        "unga",
        "handfangsel"
      ]
    },
    {
      "id": 210,
      "category": "vu2_juridik",
      "categoryLabel": "Juridiska gränsfall (VU2)",
      "level": "fordjupning",
      "source": "v2",
      "title": "Filmen som försvann",
      "scenario": "En åklagare begär kamerasekvensen från ett tillgrepp för tre veckor sedan. Ingen säkrade materialet, och systemets rullande radering har skrivit över det. Vad gör du?",
      "options": [
        "Säger att kamerorna var trasiga den dagen.",
        "Letar upp en 'liknande' sekvens från en annan dag.",
        "Ber teknikern försöka 'återskapa' något som ser rätt ut.",
        "Svarar sanningsenligt att materialet inte säkrades och därför raderats enligt lagringstiden, dokumenterar svaret – och lyfter internt att säkringsrutinen efter händelser måste skärpas."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Ett pinsamt men ärligt 'materialet finns inte' är hanterbart – varje form av efterhandskonstruktion är en katastrof för både målet och din trovärdighet. Lärdomen institutionaliseras: händelse betyder säkring, samma dag.",
      "tags": [
        "kamerabevakning",
        "dokumentation"
      ]
    },
    {
      "id": 211,
      "category": "vu2_juridik",
      "categoryLabel": "Juridiska gränsfall (VU2)",
      "level": "fordjupning",
      "source": "v2",
      "title": "Släpp min systerson",
      "scenario": "Butiksägaren – din kund – kommer springande under ett pågående gripande: 'Det där är min systerson, släpp honom omedelbart, jag tar inte det vidare!' Vad gör du?",
      "options": [
        "Släpper direkt – kunden bestämmer på sitt objekt.",
        "Håller kvar honom hårdare som markering.",
        "Gör en självständig bedömning: gripanderätten är din enligt lag, inte kundens att beordra bort – men den är också en rättighet du kan välja att inte fullfölja. Väljer du att avbryta sker det på sakliga grunder, och kundens påtryckning dokumenteras ordagrant.",
        "Griper även butiksägaren för hindrande."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Varken fullföljandet eller släppandet får styras av påtryckningar – lagen gav dig gripandet, omdömet avgör resten. Målsägandens ovilja att gå vidare är ett sakligt skäl att väga in; ordern 'släpp!' är det inte, och den ska stå i rapporten.",
      "tags": [
        "envarsgripande",
        "over_disk"
      ]
    },
    {
      "id": 212,
      "category": "vu2_juridik",
      "categoryLabel": "Juridiska gränsfall (VU2)",
      "level": "fordjupning",
      "source": "v2",
      "title": "Kuvertet vid grinden",
      "scenario": "En leverantör trycker ett kuvert med sedlar i din hand vid grinden: 'Du släpper in min bil utan kontroll i kväll, okej? Det här är för besväret.' Vad gör du?",
      "options": [
        "Avvisar erbjudandet direkt, genomför kontrollen enligt rutin, dokumenterar exakt vad som sagts och erbjudits och rapporterar omgående – försöket är sannolikt både givande av muta och anstiftan till brott, och det ska till polis via arbetsledningen.",
        "Tar kuvertet men gör kontrollen ändå.",
        "Skrattar bort det och släpper in bilen som vanligt.",
        "Behåller kuvertet som bevis i din ficka tills vidare."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Den som betalar för en utebliven kontroll planerar något som är värt priset – mutförsöket är en brottsmisstanke i sig och en varningsklocka om lasten. Pengarna rör du inte mer än nödvändigt; orden, tiden och rapporten är ditt jobb.",
      "tags": [
        "muta",
        "dokumentation"
      ]
    },
    {
      "id": 213,
      "category": "vu2_juridik",
      "categoryLabel": "Juridiska gränsfall (VU2)",
      "level": "fordjupning",
      "source": "v2",
      "title": "Patrullen som inte hann kvittera",
      "scenario": "Polispatrullen som hämtar din gripne och beslaget är stressad till nästa larm och vill åka utan att kvittera överlämningen. Vad gör du?",
      "options": [
        "Vägrar lämna över förrän blanketten är påskriven.",
        "Antecknar själv i din rapport patrullens beteckning, polisernas namn eller nummer, exakt tid och vad som överlämnades – kedjan dokumenteras från din sida även när kvittensen inte hinns med.",
        "Struntar i dokumentationen – polisen tog ju över.",
        "Behåller beslaget tills en lugnare patrull kommer."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Beslagets och frihetsberövandets kedja får inte ha luckor – men kedjan kan hållas från din ände. Patrull, tid, personer och gods i din rapport ersätter kvittensen den stressiga natten; att hindra en patrull på väg till larm gör det inte.",
      "tags": [
        "beslag",
        "dokumentation"
      ]
    },
    {
      "id": 214,
      "category": "vu2_juridik",
      "categoryLabel": "Juridiska gränsfall (VU2)",
      "level": "fordjupning",
      "source": "v2",
      "title": "Vittnesmålet om kollegan",
      "scenario": "Du kallas att vittna i ett mål där din kollega står åtalad för övervåld vid ett gripande – och du såg slaget som inte behövdes. Kollegan ber dig 'minnas lite luddigt'. Vad gäller?",
      "options": [
        "Du kan tacka nej till att vittna mot en kollega.",
        "Du säger att du inte minns – ord står ändå mot ord.",
        "Du berättar bara det som talar för kollegan.",
        "Du vittnar sanningsenligt om exakt det du såg – vittnesplikten och sanningsplikten under ed gäller fullt ut, och medvetna 'minnesluckor' är mened. Lojalitet är aldrig ett rättsligt eller etiskt försvar."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Vittnesbåset har ingen kollegialitetsrabatt: eden binder dig vid sanningen, och mened är ett allvarligt brott. Den kollega som ber dig ljuga ber dig bära hans gärning – äkta lojalitet sa ifrån redan på plats.",
      "tags": [
        "vittnesplikt",
        "kollegialitet"
      ]
    },
    {
      "id": 215,
      "category": "vu2_juridik",
      "categoryLabel": "Juridiska gränsfall (VU2)",
      "level": "fordjupning",
      "source": "v2",
      "title": "Skriket som fick en adress",
      "scenario": "En man går i tio minuter tätt bakom en ensam kvinna på ditt centrum och skriker upprepade grova könsord riktade mot just henne. Hon är synbart skärrad. Vad gäller?",
      "options": [
        "Detta är förargelseväckande beteende – aldrig gripbart.",
        "Detta är yttrandefrihet som inte kan röras.",
        "Riktade, hänsynslösa angrepp mot en enskild person är ofredande – ett brott med fängelse i skalan, till skillnad från allmänt förargelseväckande beteende – och gripande på bar gärning är möjligt; minst lika viktigt: skydda kvinnan och säkra hennes uppgifter.",
        "Du får bara ingripa om han rör vid henne."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Gränsen går vid måltavlan: skrik ut i luften är förargelse med bara böter, riktade angrepp mot en person är ofredande med fängelse i skalan. Brottsoffret först – ditt skydd och hennes vittnesuppgifter väger tyngst.",
      "tags": [
        "ofredande",
        "envarsgripande"
      ]
    },
    {
      "id": 216,
      "category": "vu2_juridik",
      "categoryLabel": "Juridiska gränsfall (VU2)",
      "level": "fordjupning",
      "source": "v2",
      "title": "Exet som inte går",
      "scenario": "En boende i fastigheten du bevakar ringer ner: hennes före detta pojkvän har tagit sig in i lägenheten och vägrar gå trots att hon flera gånger sagt åt honom. Hon vågar inte vara ensam med honom. Vad gäller?",
      "options": [
        "Detta är en privat relationsfråga du inte rör.",
        "Den som vägrar lämna en bostad efter tillsägelse skapar en nödvärnssituation för den boende – du kan bistå henne med stöd av nödvärnsrätten, men förstahandsvalet är polis: larma, gå upp tillsammans, prioritera hennes säkerhet och dokumentera hennes begäran.",
        "Du får bara agera om han förstör något.",
        "Du säger åt henne att lämna sin egen lägenhet."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Bostaden har nödvärnsrättens starkaste skydd – att vägra gå efter tillsägelse är en av lagens fyra situationer, och hjälpen får ges av annan. Men relationsärenden är högriskingripanden: polis, sällskap och hennes trygghet styr taktiken.",
      "tags": [
        "nodvarn",
        "prioritering"
      ]
    },
    {
      "id": 217,
      "category": "vu2_juridik",
      "categoryLabel": "Juridiska gränsfall (VU2)",
      "level": "fordjupning",
      "source": "v2",
      "title": "Fel man i dubbelgripandet",
      "scenario": "Efter ett tumult har du och en kollega gripit var sin man. Ett upprört vittne pekar nu på din gripne: 'Nej, det var inte han – det var en i röd jacka som sprang ditåt!' Din egen iakttagelsekedja känns plötsligt osäker. Vad gör du?",
      "options": [
        "Släpper din gripne om du vid ärlig prövning inte längre kan stå för en egen, obruten iakttagelsekedja – tvivlet går alltid i frihetens riktning – och lämnar signalementet på rätt gärningsman till polisen direkt.",
        "Håller kvar honom – polisen får reda ut det sen.",
        "Frågar den gripne själv om han är skyldig.",
        "Byter gripen med kollegan för säkerhets skull."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Gripandet står och faller med din egen kedja – rubbas den på allvar ska frihetsberövandet upphöra, för varje ytterligare minut kräver en grund du inte längre har. Att släppa i tid är rättssäkerhet, inte misslyckande.",
      "tags": [
        "envarsgripande",
        "dokumentation"
      ]
    },
    {
      "id": 218,
      "category": "vu2_juridik",
      "categoryLabel": "Juridiska gränsfall (VU2)",
      "level": "fordjupning",
      "source": "v2",
      "title": "Nödvändigt våld",
      "scenario": "Efter ett stökigt gripande läser du kollegans rapportutkast: 'Vi använde nödvändigt våld för att få kontroll.' Inget mer om våldet. Vad gör du?",
      "options": [
        "Godkänner – 'nödvändigt' säger ju allt.",
        "Stryker meningen helt, våld behöver inte nämnas.",
        "Skriver samma mening i din egen rapport för samstämmighet.",
        "Ber kollegan konkretisera: vilka grepp, mot vad, hur länge, efter vilka uppmaningar, och hur våldet trappades ned – 'nödvändigt våld' är en slutsats, och slutsatser är domstolens jobb; rapportens jobb är iakttagelserna som bär den."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "En rapport som betygsätter sitt eget våld i stället för att beskriva det faller vid första granskning. Försvarligheten byggs av detaljerna – uppmaningarna före, greppen under, nedtrappningen efter – aldrig av adjektivet.",
      "tags": [
        "dokumentation",
        "laga_befogenhet"
      ]
    },
    {
      "id": 219,
      "category": "social_manipulation",
      "categoryLabel": "Social manipulation",
      "level": "fordjupning",
      "source": "v2",
      "title": "USB-stickan på parkeringen",
      "scenario": "På personalparkeringen hittar du ett USB-minne märkt 'Löner 2026 – konfidentiellt'. Vad gör du?",
      "options": [
        "Sätter in det i receptionsdatorn för att se vems det är.",
        "Lämnar det orört i kuvert till IT- eller säkerhetsansvarig enligt rutin och rapporterar fyndet – 'tappade' USB-minnen med lockande etiketter är en klassisk metod för att få in skadlig kod.",
        "Tar hem det och kollar på din privata dator.",
        "Slänger det i papperskorgen."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Etiketten är betet och nyfikenheten är kroken – ett enda inkopplat minne kan öppna hela nätverket. Fyndet hanteras som det säkerhetsärende det är: orört, spårbart och till rätt funktion.",
      "tags": [
        "social_manipulation",
        "it_sakerhet"
      ]
    },
    {
      "id": 220,
      "category": "social_manipulation",
      "categoryLabel": "Social manipulation",
      "level": "fordjupning",
      "source": "v2",
      "title": "IT-supporten i luren",
      "scenario": "En man ringer dig i receptionen: 'Hej, IT-support här – vi uppdaterar passersystemet i natt och behöver ditt användarnamn och lösenord för att inte låsa ute er.' Vad gör du?",
      "options": [
        "Ger uppgifterna – systemet får ju inte låsa sig.",
        "Ger bara användarnamnet, det är ju inte hemligt.",
        "Ber honom ringa tillbaka om en timme och ger dem då.",
        "Lämnar aldrig inloggningsuppgifter per telefon – ingen legitim support behöver ditt lösenord – och verifierar samtalet via företagets egen IT-kanal samt rapporterar försöket."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Regeln är absolut och enkel att minnas: riktig IT frågar aldrig efter lösenord. Samtalet i sig är säkerhetsinformation – rapporterat blir det en varning till alla kollegor som får samma samtal i natt.",
      "tags": [
        "social_manipulation",
        "it_sakerhet"
      ]
    },
    {
      "id": 221,
      "category": "social_manipulation",
      "categoryLabel": "Social manipulation",
      "level": "fordjupning",
      "source": "v2",
      "title": "Vikarien ingen bokat",
      "scenario": "En man i korrekt väktaruniform dyker upp vid ditt objekt: 'Jag är inhyrd vikarie, du skulle bli avlöst tidigare i kväll – ge mig nycklarna så kan du dra.' Du har inte hörts något om detta. Vad gör du?",
      "options": [
        "Verifierar via ledningscentralen mot schema och bemanningsbesked innan någon nyckel eller information byter hand – en uniform är kläder, behörighet är en bekräftad uppgift i era egna system.",
        "Lämnar över – uniformen och legitimationen ser äkta ut.",
        "Ger honom nycklarna men stannar kvar en halvtimme.",
        "Ber honom vakta medan du ringer runt privat."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Uniformer går att köpa och legitimationer att förfalska – schemat i ledningscentralen går inte att prata sig runt. Oanmälda avlösningar verifieras alltid via egen kanal; en äkta vikarie förväntar sig inget annat.",
      "tags": [
        "social_manipulation",
        "rutin"
      ]
    },
    {
      "id": 222,
      "category": "social_manipulation",
      "categoryLabel": "Social manipulation",
      "level": "fordjupning",
      "source": "v2",
      "title": "Stammisens pussel",
      "scenario": "En trevlig stammis i receptionen har under några veckor ställt spridda småfrågor: när ni byter pass, om helgerna är lugna, om källaren också larmas. Var för sig är frågorna oskyldiga. Vad gör du?",
      "options": [
        "Svarar ärligt – han är ju en känd och trevlig person.",
        "Konfronterar honom med att han verkar planera ett brott.",
        "Svarar neutralt utan sakinnehåll, börjar föra minnesanteckningar över frågorna med datum och rapporterar mönstret till arbetsledningen – aggregerade småfrågor är kartläggningens vanligaste form.",
        "Portar honom från byggnaden direkt."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Ingen fråga röjde något – men pusslet av alla svar hade ritat er säkerhetskarta. Mönstret är signalen: dokumentera, rapportera och låt bedömningen göras på helheten, inte på trevligheten.",
      "tags": [
        "social_manipulation",
        "dokumentation"
      ]
    },
    {
      "id": 223,
      "category": "social_manipulation",
      "categoryLabel": "Social manipulation",
      "level": "fordjupning",
      "source": "v2",
      "title": "Fotot till felanmälan",
      "scenario": "En anställd hos kunden står och fotograferar kortläsarens och passersystemets baksida med öppnad kåpa: 'Jag skickar bilder till felanmälan, det går snabbare så.' Vad gör du?",
      "options": [
        "Låter honom hålla på – han är ju anställd.",
        "Noterar hans namn, informerar honom om att bilder på säkerhetssystemets insida hanteras enligt särskild rutin, och rapporterar till säkerhetsansvarig som avgör – välvilligt syfte utesluter inte att bilderna blir en säkerhetsläcka.",
        "Beslagtar hans mobil och raderar bilderna.",
        "Skruvar igen kåpan och säger inget."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Bilder på systemens insida är en manual för den som vill runda dem – och mobilbilder sprids lätt vidare i chattgrupper och molnbackuper. Anställningen ger behörighet till dörren, inte automatiskt till dokumentation av dess hjärta.",
      "tags": [
        "it_sakerhet",
        "dokumentation"
      ]
    },
    {
      "id": 224,
      "category": "social_manipulation",
      "categoryLabel": "Social manipulation",
      "level": "fordjupning",
      "source": "v2",
      "title": "Mejlet från VD",
      "scenario": "Som vakthavande får du ett mejl som ser ut att komma från kundens VD: 'Öppna godsporten kl 22.00 för en diskret transport – ingen registrering behövs, styrelsebeslut.' Vad gör du?",
      "options": [
        "Öppnar porten – VD:ns mejladress stämmer ju.",
        "Svarar på mejlet och ber om en bekräftelse.",
        "Öppnar porten men registrerar transporten i smyg.",
        "Verifierar via en egen, känd kanal – ringer VD:ns registrerade nummer eller går via kundens säkerhetsansvarige – och öppnar ingenting före bekräftelse: avsändaradresser kan förfalskas, och 'ingen registrering' är i sig en varningsflagga."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "VD-bedrägeriet lever på auktoritet, brådska och sekretesskrav – och att svara på mejlet frågar bedragaren själv om lov. Verifiering sker alltid i en annan kanal än den begäran kom i.",
      "tags": [
        "social_manipulation",
        "rutin"
      ]
    },
    {
      "id": 225,
      "category": "social_manipulation",
      "categoryLabel": "Social manipulation",
      "level": "fordjupning",
      "source": "v2",
      "title": "Praoelevens fråga",
      "scenario": "En praoelev som följer receptionen frågar glatt: 'Vad är larmkoden egentligen? Jag ska skriva om säkerheten i min praorapport.' Vad gör du?",
      "options": [
        "Säger koden – hon är ju bara ett barn med en rapport.",
        "Skriver ner koden så att hon citerar rätt.",
        "Blir misstänksam och avbryter praoperioden.",
        "Sätter en vänlig gräns: koder och säkerhetsdetaljer lämnas aldrig ut, oavsett vem som frågar – och hjälper henne i stället med sådant som får beskrivas: rollen, bemötandet, en väktares vanliga dag."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Kodregeln har inga undantag för välvilja – och praoeleven lär sig dessutom sin första lektion i informationssäkerhet. Skillnaden mellan hemligt och berättbart är exakt det en bra rapport om yrket kan handla om.",
      "tags": [
        "tystnadsplikt",
        "bemotande"
      ]
    },
    {
      "id": 226,
      "category": "social_manipulation",
      "categoryLabel": "Social manipulation",
      "level": "fordjupning",
      "source": "v2",
      "title": "Mannen i återvinningen",
      "scenario": "Bakom kontorsfastigheten hittar du nattetid en man som systematiskt går igenom kundens pappersåtervinning och stoppar dokument i en ryggsäck. Vad gör du?",
      "options": [
        "Låter honom hålla på – sopor är väl ingens egendom.",
        "Griper honom för stöld av papper.",
        "Tar kontakt, avvisar honom från fastighetens område enligt kundens regler, dokumenterar signalement och vad han verkade söka, rapporterar – och lyfter samtidigt att kundens dokumenthantering läcker: känsliga papper hör hemma i strimlare, inte i öppna kärl.",
        "Tömmer kärlet över honom som markering."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Sopdykning efter dokument är informationsinhämtning – fakturor, listor och utkast blir kartläggningsmaterial. Avvisa och rapportera, men den varaktiga åtgärden är kundens: det som strimlas kan ingen dyka efter.",
      "tags": [
        "social_manipulation",
        "dokumentation"
      ]
    },
    {
      "id": 227,
      "category": "social_manipulation",
      "categoryLabel": "Social manipulation",
      "level": "fordjupning",
      "source": "v2",
      "title": "Kollegans skärmdumpar",
      "scenario": "Du råkar se att en väktarkollega fotograferar veckans bemanningsschema med sin privata mobil och skickar bilden vidare i en chatt du inte känner igen. Vad gör du?",
      "options": [
        "Rycker mobilen ur handen på honom.",
        "Rapporterar din iakttagelse sakligt till säkerhetsansvarig eller arbetsledningen och låter dem utreda – schemat visar när objekt är svagt bemannade, och du varken anklagar, förhör eller spanar vidare på egen hand.",
        "Frågar runt bland kollegorna vad de tror.",
        "Glömmer det – det är säkert till hans fru."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Kanske helt oskyldigt, kanske en insiderläcka – skillnaden avgörs av en utredning, inte av din gissning. Din uppgift är den sakliga iakttagelsen till rätt funktion; ryktesspridning och egna förhör förstör båda utfallen.",
      "tags": [
        "insider",
        "rapportering"
      ]
    },
    {
      "id": 228,
      "category": "social_manipulation",
      "categoryLabel": "Social manipulation",
      "level": "fordjupning",
      "source": "v2",
      "title": "Kaffebrickorna",
      "scenario": "En leende man med händerna fulla av kaffebrickor nickar mot passerdörren: 'Kan du ta dörren? Tack, du räddar mitt liv!' Du känner inte igen honom. Vad gör du?",
      "options": [
        "Öppnar och håller upp dörren – vanlig hygglighet.",
        "Låter honom balansera brickorna och dra sitt eget kort.",
        "Säger nej och går därifrån utan förklaring.",
        "Hjälper gärna till med dörren – och ber honom samtidigt vänligt dra sitt kort eller följa med till receptionen för registrering: artigheten och access-kontrollen är två olika saker, och båda går att leverera."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Fulla händer är tailgatingens äldsta kostym, och hyggligheten är låset den dyrkar. Lösningen är inte otrevlighet utan sekvens: hjälp med dörren, kort i läsaren – service och säkerhet i samma mening.",
      "tags": [
        "social_manipulation",
        "rutin"
      ]
    },
    {
      "id": 229,
      "category": "kamera_it_sekretess",
      "categoryLabel": "Kamera, IT och sekretess",
      "level": "fordjupning",
      "source": "v2",
      "title": "Drönaren över området",
      "scenario": "En drönare hovrar i tio minuter över industriområdet du bevakar och rör sig systematiskt längs byggnaderna. Vad gör du?",
      "options": [
        "Kastar något mot den för att få ner den.",
        "Ignorerar den – luftrummet är fritt.",
        "Dokumenterar tid, flygmönster och riktning, försöker lokalisera piloten i närområdet, rapporterar till ledningscentral och polis – och gör aldrig egna försök att störa eller fälla drönaren.",
        "Släcker områdets belysning så att den inte kan filma."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Systematisk drönarflygning över ett skyddat område kan vara kartläggning – och är i vart fall en avvikelse värd polisens kännedom. Att själv fälla en drönare är både farligt och sannolikt brottsligt; piloten på marken är det intressanta spåret.",
      "tags": [
        "kamerabevakning",
        "dokumentation"
      ]
    },
    {
      "id": 230,
      "category": "kamera_it_sekretess",
      "categoryLabel": "Kamera, IT och sekretess",
      "level": "fordjupning",
      "source": "v2",
      "title": "Chefen vill se den slöa",
      "scenario": "Kundens avdelningschef ber dig ta fram övervakningsfilm på en anställd 'som verkar ta väldigt långa raster – jag vill se vad han egentligen gör'. Vad gör du?",
      "options": [
        "Avböjer och förklarar att kamerorna är avsedda för säkerhetsändamål, inte prestationskontroll av anställda – begäran hänvisas till kundens säkerhetsansvarige och de regler och avtal som styr materialet.",
        "Tar fram filmen – chefen är ju kundens representant.",
        "Visar filmen men bara i snabbspolning.",
        "Klipper ihop de längsta rasterna åt chefen."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Kameramaterial får bara användas för de ändamål bevakningen har – att övervaka anställdas raster är något annat än att förebygga brott, och glidningen är både ett integritetsbrott och ett förtroendehaveri. Ändamålet är muren; du vaktar den.",
      "tags": [
        "kamerabevakning",
        "integritet"
      ]
    },
    {
      "id": 231,
      "category": "kamera_it_sekretess",
      "categoryLabel": "Kamera, IT och sekretess",
      "level": "fordjupning",
      "source": "v2",
      "title": "Radera din kamera",
      "scenario": "Mannen du just gripit ser din kroppskamera och kräver: 'Radera det där, du har ingen rätt att filma mig!' Vad gör du?",
      "options": [
        "Raderar inspelningen för att lugna honom.",
        "Stänger av kameran och låtsas att den aldrig var på.",
        "Låter honom själv hålla i kameran som kompromiss.",
        "Förklarar lugnt att kameran används enligt företagets rutin och gällande regler, att materialet lagras skyddat med begränsad tid och kan begäras av polisen – och att du varken kan eller får radera det på plats."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Kroppskamerans värde bygger på att materialet är orört – för hans rättssäkerhet lika mycket som din. Information ersätter radering: syfte, lagring och vem som kan få ut det. Sedan hanteras allt enligt rutin, inte enligt kravet.",
      "tags": [
        "kamerabevakning",
        "dokumentation"
      ]
    },
    {
      "id": 232,
      "category": "kamera_it_sekretess",
      "categoryLabel": "Kamera, IT och sekretess",
      "level": "fordjupning",
      "source": "v2",
      "title": "Facebookgruppens vädjan",
      "scenario": "Ortens Facebookgrupp svämmar över efter ett inbrott, och en administratör ber dig: 'Du har ju kamerabilder – släng ut en bild på tjuven i gruppen så hittar vi honom på en timme!' Vad gör du?",
      "options": [
        "Publicerar bilden – medborgarkraft löser brott.",
        "Avböjer: kameramaterial lämnas till polisen enligt rutin, aldrig till sociala medier – ett publikt utpekande kan träffa fel person, förstöra utredningen och är dessutom en otillåten spridning av personuppgifter.",
        "Lägger ut bilden men suddar ögonen.",
        "Skickar bilden privat till administratören i stället."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Nätets domstol dömer på minuter och friar aldrig – och ett felaktigt utpekande förföljer en oskyldig i åratal. Bilden har exakt en laglig väg: till polisen, spårbart och orörd.",
      "tags": [
        "kamerabevakning",
        "integritet"
      ]
    },
    {
      "id": 233,
      "category": "kamera_it_sekretess",
      "categoryLabel": "Kamera, IT och sekretess",
      "level": "fordjupning",
      "source": "v2",
      "title": "TV-teamet",
      "scenario": "Mitt under ditt ingripande på torget dyker ett TV-team upp och filmar på nära håll medan reportern ropar frågor till dig. Vad gör du?",
      "options": [
        "Håller handen för objektivet och föser undan dem.",
        "Avbryter ingripandet tills de slutar filma.",
        "Fortsätter ingripandet korrekt och lugnt – på allmän plats får de filma – besvarar inga frågor under pågående moment och hänvisar därefter kort till företagets pressansvariga.",
        "Ger en intervju på plats när allt är klart."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Kameran ändrar ingenting i sak – gör rätt så tål varje sekund granskning. Mediefrågor har sin kanal, och den kanalen är aldrig en flåsande väktare på ett torg. Agera som om du filmas; nu gör du bevisligen det.",
      "tags": [
        "media",
        "bemotande"
      ]
    },
    {
      "id": 234,
      "category": "kamera_it_sekretess",
      "categoryLabel": "Kamera, IT och sekretess",
      "level": "fordjupning",
      "source": "v2",
      "title": "Kollegans privata mobilfilm",
      "scenario": "Under ett stökigt gripande ser du att din kollega filmar den gripne med sin privata mobil 'för säkerhets skull, om han anmäler oss'. Vad gör du?",
      "options": [
        "Säger ifrån: privat filmning ligger utanför rutinen och skapar en okontrollerad kopia som kan spridas – dokumentationen sker via kroppskamera, objektets system och rapporten, och det inträffade lyfts med arbetsledningen.",
        "Ber honom skicka filmen till dig också.",
        "Filmar själv från en annan vinkel som backup.",
        "Låter honom filma men ber honom radera sen."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Syftet kan vara gott men kanalen är fel: en privat mobilfilm har ingen lagringsrutin, ingen åtkomstkontroll och en tumme från att hamna i en chatt. Skydd byggs i systemen – aldrig i privata galleri­er.",
      "tags": [
        "kamerabevakning",
        "kollegialitet"
      ]
    },
    {
      "id": 235,
      "category": "kamera_it_sekretess",
      "categoryLabel": "Kamera, IT och sekretess",
      "level": "fordjupning",
      "source": "v2",
      "title": "Justera loggen",
      "scenario": "Kundens platschef ber dig ändra i passersystemets logg: 'Kalle glömde stämpla ut i fredags – lägg in 17.00 åt honom, det är ju bara en formalitet.' Vad gör du?",
      "options": [
        "Lägger in tiden – det är ju harmlöst.",
        "Lägger in tiden men skriver en lapp om det.",
        "Ber Kalle själv logga in och ändra.",
        "Avböjer: loggar manipuleras aldrig, oavsett hur oskyldigt ärendet verkar – felet dokumenteras öppet i en avvikelse, och rättelser görs spårbart av systemägaren enligt rutin."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "En logg som går att 'fixa' åt Kalle går att fixa åt vem som helst med sämre avsikter – hela bevisvärdet vilar på orördheten. Öppna rättelser med spår är lösningen; tysta justeringar är början på slutet.",
      "tags": [
        "it_sakerhet",
        "dokumentation"
      ]
    },
    {
      "id": 236,
      "category": "kamera_it_sekretess",
      "categoryLabel": "Kamera, IT och sekretess",
      "level": "fordjupning",
      "source": "v2",
      "title": "Ansiktsigenkänningen",
      "scenario": "Kunden vill att ni kopplar på ansiktsigenkänning mot en egen 'svart lista' i entrékamerorna: 'Tekniken finns ju – då slipper ni komma ihåg vilka som är portade.' Vad gör du?",
      "options": [
        "Aktiverar funktionen – tekniken är ju laglig att köpa.",
        "Vidarebefordrar önskemålet till bevakningsföretagets ledning och jurister utan att lova något: biometrisk realtidsidentifiering är bland det mest reglerade som finns, kräver en rättslig prövning som ligger långt över din och kundens bordskant – och införs aldrig som en teknisk 'quick fix'.",
        "Testar funktionen i smyg några veckor först.",
        "Bygger listan men använder den bara vid misstanke."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Biometri i realtid mot listor är ett integritetsingrepp i särklass, med hårda lagkrav och tillsyn – frågan ägs av jurister och ledning, inte av entrén. Din professionella insats är att stoppa quick-fixen och skicka frågan rätt.",
      "tags": [
        "kamerabevakning",
        "integritet"
      ]
    },
    {
      "id": 237,
      "category": "kamera_it_sekretess",
      "categoryLabel": "Kamera, IT och sekretess",
      "level": "fordjupning",
      "source": "v2",
      "title": "Skärmen mot gatan",
      "scenario": "Du upptäcker att en av ledningscentralens monitorer – med kartbild över objekt och pågående larm – står fullt synlig genom ett gatufönster. Vad gör du?",
      "options": [
        "Rapporterar exponeringen direkt och ordnar en omedelbar provisorisk lösning – vinkla skärmen eller skärma av – tills en permanent åtgärd är på plats: den som står på gatan ska aldrig kunna läsa er lägesbild.",
        "Sätter upp en lapp: 'Titta inte in'.",
        "Sänker skärmens ljusstyrka på kvällen.",
        "Struntar i det – ingen förstår ändå kartbilden."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Visuell informationsläcka är läcka den med: objektnamn, larmstatus och bemanningsmönster genom ett fönster är gratis underrättelse. Provisoriet görs på minuten, rapporten samma pass, permanenta lösningen får ett datum.",
      "tags": [
        "it_sakerhet",
        "rapportering"
      ]
    },
    {
      "id": 238,
      "category": "kamera_it_sekretess",
      "categoryLabel": "Kamera, IT och sekretess",
      "level": "fordjupning",
      "source": "v2",
      "title": "Länken med koderna",
      "scenario": "Kundens fastighetschef mejlar dig en öppen molnlänk – utan lösenord – till ett dokument med samtliga portkoder och larmkoder: 'Praktiskt, va? Då har du alltid koderna i mobilen!' Vad gör du?",
      "options": [
        "Sparar länken som bokmärke – smidigt är smidigt.",
        "Skriver ut dokumentet och slänger länken.",
        "Påtalar risken direkt: en öppen länk kan spridas och indexeras okontrollerat – ber kunden dra tillbaka den och distribuera koderna via en säker, behörighetsstyrd kanal, och rapporterar avvikelsen enligt rutin.",
        "Vidarebefordrar länken till kollegorna så alla har den."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "En olåst molnlänk är i praktiken en publik anslagstavla – ett vidarebefordrat mejl eller en synkad enhet, och nycklarna till fastigheten ligger på nätet. Kodhantering är säkerhetsarkitektur, inte bekvämlighet; att säga det vänligt är din uppgift.",
      "tags": [
        "it_sakerhet",
        "rutin"
      ]
    },
    {
      "id": 239,
      "category": "arbetsmiljo_sakerhet",
      "categoryLabel": "Arbetsmiljö och egen säkerhet",
      "level": "fordjupning",
      "source": "v2",
      "title": "Mannen vid din bil",
      "scenario": "När ditt pass är slut ser du genom personalentréns glasruta att mannen du grep tidigare i kväll står och väntar vid din privata bil på personalparkeringen. Vad gör du?",
      "options": [
        "Går ut som vanligt – han vågar nog inget.",
        "Går ut bakvägen och smyger hem till fots.",
        "Stannar inne, larmar polis och ledningscentral, informerar arbetsledningen och lämnar platsen först i sällskap eller när polisen hanterat mannen – hot som följer dig från tjänsten är arbetsgivarens och polisens sak, inte din ensamma promenad.",
        "Går ut och konfronterar honom direkt."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Att någon identifierat din privata bil är en allvarlig hotsignal som aldrig testas ensam i mörker. Kopplingen till tjänsten gör det till en arbetsmiljöhändelse: rapportera, polisanmäl och låt skyddsåtgärder – parkering, samåkning, bevakning – sättas in.",
      "tags": [
        "hot",
        "egen_sakerhet"
      ]
    },
    {
      "id": 240,
      "category": "arbetsmiljo_sakerhet",
      "categoryLabel": "Arbetsmiljö och egen säkerhet",
      "level": "fordjupning",
      "source": "v2",
      "title": "Efternamnet på bröstet",
      "scenario": "En gripen man läser högt från din namnskylt: 'Andersson... ovanligt namn i den här stadsdelen. Jag hittar dig.' Vad gör du?",
      "options": [
        "Dokumenterar hotet ordagrant, rapporterar till arbetsledningen och polisanmäler – olaga hot mot dig i tjänsten är ett brott – och lyfter frågan om tjänstenummer i stället för namnskylt enligt företagets policy.",
        "Skrattar bort det – tomma ord från en gripen.",
        "Byter efternamn för säkerhets skull.",
        "Tar av dig namnskylten och slänger den."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Ett hot kopplat till din identitet tas alltid på allvar: ordagrann dokumentation, rapport och polisanmälan är grundpaketet. Många företag tillåter tjänstenummer just därför – frågan är legitim att driva efter en sådan händelse.",
      "tags": [
        "hot",
        "rapportering"
      ]
    },
    {
      "id": 241,
      "category": "arbetsmiljo_sakerhet",
      "categoryLabel": "Arbetsmiljö och egen säkerhet",
      "level": "fordjupning",
      "source": "v2",
      "title": "Mikrosömnen",
      "scenario": "På väg mellan två objekt klockan fyra på natten vaknar du till av att bilen nuddar vägrenens räfflor – du har somnat till en sekund bakom ratten. Vad gör du?",
      "options": [
        "Vevar ner rutan och höjer musiken.",
        "Stannar på säker plats omgående, rapporterar läget till ledningscentralen och vilar innan färden fortsätter – och tillbudsrapporterar händelsen: mikrosömn bakom ratten är ett allvarligt tillbud, inte en pinsamhet.",
        "Kör fortare så att du kommer fram innan du somnar.",
        "Dricker en energidryck och fortsätter direkt."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "En sekunds mikrosömn i 80 km/h är 22 meter i blindo – nästa gång finns ett träd eller en människa där. Stopp och rapport är det enda professionella; tillbudet kan dessutom ändra scheman som annars sliter ner nästa kollega.",
      "tags": [
        "arbetsmiljo",
        "rapportering"
      ]
    },
    {
      "id": 242,
      "category": "arbetsmiljo_sakerhet",
      "categoryLabel": "Arbetsmiljö och egen säkerhet",
      "level": "fordjupning",
      "source": "v2",
      "title": "Kollegan som väntar barn",
      "scenario": "Din kollega berättar att hon är gravid och orolig för nattpassen på objektet där ni haft flera våldsincidenter – men hon vågar inte säga något till chefen. Vad gör du?",
      "options": [
        "Lovar att hålla tyst – det är hennes ensak.",
        "Byter i smyg pass med henne resten av året.",
        "Säger åt henne att skärpa sig – jobbet är jobbet.",
        "Uppmuntrar och stöttar henne att lyfta det till arbetsledningen: arbetsgivaren är skyldig att göra en individuell riskbedömning vid graviditet och anpassa arbetsuppgifterna – och erbjuder dig att följa med som stöd om hon vill."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Gravida har rätt till individuell riskbedömning och anpassning – men rätten aktiveras först när arbetsgivaren vet. Tysta privatlösningar skyddar varken henne eller barnet den dag något händer; ditt stöd gör steget till chefen kortare.",
      "tags": [
        "arbetsmiljo",
        "kollegialitet"
      ]
    },
    {
      "id": 243,
      "category": "arbetsmiljo_sakerhet",
      "categoryLabel": "Arbetsmiljö och egen säkerhet",
      "level": "fordjupning",
      "source": "v2",
      "title": "Kanylen i fickan",
      "scenario": "Vid skyddsvisitationen efter ett gripande sticker du dig på en kanyl i den gripnes jackficka – trots att du frågade om vassa föremål och fick nej. Vad gör du?",
      "options": [
        "Suger ut blodet och fortsätter visitationen.",
        "Låter det vara – det var ju bara ett litet stick.",
        "Låter blödningen komma, skölj och desinficera omgående, säkra kanylen varsamt, och uppsök vård samma dygn för bedömning av smittrisk och eventuell förebyggande behandling – händelsen anmäls som tillbud och arbetsskada.",
        "Konfronterar den gripne argt om varför han ljög."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Stickskador har en medicinsk klocka: snabb sårvård och tidig vårdkontakt avgör vilka förebyggande åtgärder som är möjliga. Dokumentationen skyddar dina rättigheter – och det är därför frågan om vassa föremål alltid ställs, med handskar på ändå.",
      "tags": [
        "sjukvard",
        "arbetsmiljo"
      ]
    },
    {
      "id": 244,
      "category": "arbetsmiljo_sakerhet",
      "categoryLabel": "Arbetsmiljö och egen säkerhet",
      "level": "fordjupning",
      "source": "v2",
      "title": "Hettan på festivalen",
      "scenario": "Tolfte timmen i 31-gradig värme börjar din kollega vid grinden sludda lätt, har slutat svettas och verkar förvirrad. Vad gör du?",
      "options": [
        "Ger honom en kall öl från beslagen.",
        "Säger åt honom att ta av västen och bita ihop sista timmen.",
        "Låter honom sitta i skuggan fem minuter och sedan fortsätta.",
        "Behandlar det som misstänkt värmeslag: larma 112, få honom till skugga, kyl aktivt med vatten och fläktning, och avlös posten – upphörd svettning med förvirring är ett akutläge, inte trötthet."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "När kroppen slutar svettas har kylsystemet kollapsat – värmeslag dödar. Sjukvårdslarmet går före bemanningen, och lärdomen efteråt heter rotation, vätska och skugga innan någon når den gränsen.",
      "tags": [
        "sjukvard",
        "arbetsmiljo"
      ]
    },
    {
      "id": 245,
      "category": "arbetsmiljo_sakerhet",
      "categoryLabel": "Arbetsmiljö och egen säkerhet",
      "level": "fordjupning",
      "source": "v2",
      "title": "Tredje dubbelpasset",
      "scenario": "Arbetsledaren ringer och beordrar dig ett tredje dubbelpass på lika många nätter: 'Alla är sjuka, du får ta det.' Du känner dig redan farligt sliten. Vad gör du?",
      "options": [
        "Påtalar sakligt att du är för trött för säkert arbete och att vilotidsreglerna riskerar att brytas, dokumenterar samtalet – och kopplar in skyddsombudet om beordringen står fast: din trötthet är en risk för fler än dig.",
        "Tar passet – order är order.",
        "Tar passet men sover i bilen mellan ronderna.",
        "Sjukanmäler dig fast du inte är sjuk."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "En väktare på tredje dubbelpasset är ett vandrande tillbud: omdöme, reaktion och våldsbedömningar försämras mätbart. Att säga nej med dokumentation och skyddsombud är inte trots – det är exakt vad arbetsmiljösystemet är byggt för.",
      "tags": [
        "arbetsmiljo",
        "rapportering"
      ]
    },
    {
      "id": 246,
      "category": "arbetsmiljo_sakerhet",
      "categoryLabel": "Arbetsmiljö och egen säkerhet",
      "level": "fordjupning",
      "source": "v2",
      "title": "Larmet som glömdes",
      "scenario": "Halvvägs ut på den ensliga nattronden upptäcker du att ditt personlarm ligger kvar i laddaren i vaktlokalen. Vad gör du?",
      "options": [
        "Fortsätter ronden – du klarar dig en natt.",
        "Ber ledningscentralen ringa dig varje timme i stället.",
        "Avbryter, hämtar larmet och rapporterar avvikelsen – ensamarbete utan fungerande larm bryter mot säkerhetsrutinen, och rapporten kan leda till en bättre rutin, som larmkontroll i utpasseringschecklistan.",
        "Lånar en förbipasserandes mobil om något händer."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Larmet är din livlina just de nätter inget 'borde' hända – att chansa utan det är att arbeta utan skyddsutrustning. Vändningen kostar tio minuter; rapporten gör att glömskan byggs bort ur rutinen i stället för att upprepas.",
      "tags": [
        "ensamarbete",
        "rutin"
      ]
    },
    {
      "id": 247,
      "category": "arbetsmiljo_sakerhet",
      "categoryLabel": "Arbetsmiljö och egen säkerhet",
      "level": "fordjupning",
      "source": "v2",
      "title": "Skolan dina barn går i",
      "scenario": "En man ni avvisat flera gånger säger lågmält i förbifarten: 'Fin skola dina ungar går i förresten – den gula vid parken, va?' Vad gör du?",
      "options": [
        "Behandlar det som ett allvarligt hot: dokumentera ordagrant, informera arbetsledning och företagets säkerhetsfunktion omgående, polisanmäl – och låt skyddsbedömningen omfatta familjen, inte bara dig.",
        "Ignorerar det – han sa ju inget direkt hotfullt.",
        "Byter skola för barnen på eget initiativ.",
        "Söker upp mannen privat och varnar honom."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Ett förtäckt hot som visar kartläggning av din familj är bland det allvarligaste en väktare kan mötas av – och det hanteras av polis och arbetsgivarens säkerhetsorganisation, aldrig av dig ensam. Ordagrann dokumentation samma minut; hela paketet av skyddsåtgärder därefter.",
      "tags": [
        "hot",
        "egen_sakerhet"
      ]
    },
    {
      "id": 248,
      "category": "arbetsmiljo_sakerhet",
      "categoryLabel": "Arbetsmiljö och egen säkerhet",
      "level": "fordjupning",
      "source": "v2",
      "title": "Isgatan",
      "scenario": "Vinterronden går över en spegelblank gårdsplan, och du saknar broddar – de har varit 'på ingång' från arbetsgivaren i tre veckor. Vad gör du?",
      "options": [
        "Springer över isen så går det fort.",
        "Ställer in hela ronden tills våren.",
        "Går som vanligt – halkar man så halkar man.",
        "Anpassar ronden tillfälligt – väljer säkrare väg där det går – och rapporterar utrustningsbristen skriftligt igen med hänvisning till att halkskydd är beställd skyddsutrustning som inte levererats: fallolyckor är yrkets vanligaste skada."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Halka skadar fler väktare än våld gör, och skyddsutrustning 'på ingång' skyddar ingen fot. Den provisoriska riskminskningen är din; leveransen är arbetsgivarens – och den skriftliga påstöten är det som flyttar den från att-göra till gjort.",
      "tags": [
        "arbetsmiljo",
        "rapportering"
      ]
    },
    {
      "id": 249,
      "category": "arbetsmiljo_sakerhet",
      "categoryLabel": "Arbetsmiljö och egen säkerhet",
      "level": "fordjupning",
      "source": "v2",
      "title": "Kollegan som skakar",
      "scenario": "Efter ett knivhot sitter din kollega i vaktbilen, skakar i händerna och får tårar i ögonen – och skäms: 'Förlåt, jag vet inte vad det är med mig.' Vad gör du?",
      "options": [
        "Säger åt honom att skärpa sig innan någon ser.",
        "Normaliserar reaktionen – 'det där är kroppens helt normala svar på en onormal händelse' – stannar hos honom, ser till att han avlöses för stunden och att arbetsledningen erbjuder avlastningssamtal; händelsen tillbudsrapporteras som det hot den var.",
        "Skickar hem honom ensam direkt.",
        "Berättar om värre saker du själv varit med om."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Adrenalindippen med skakningar och tårar är fysiologi, inte svaghet – och skammen är det farligaste i rummet, för den tystar. Din normalisering öppnar dörren till stödet: avlösning, samtal och en rapport som gör händelsen synlig.",
      "tags": [
        "krisstod",
        "kollegialitet"
      ]
    },
    {
      "id": 250,
      "category": "arbetsmiljo_sakerhet",
      "categoryLabel": "Arbetsmiljö och egen säkerhet",
      "level": "fordjupning",
      "source": "v2",
      "title": "Ta av dig västen",
      "scenario": "Kundens hotellchef ber dig ta av väktarvästen och jobba i civil kavaj: 'Uniformen skrämmer våra gäster, ni får smälta in.' Vad gör du?",
      "options": [
        "Förklarar vänligt att uniformskraven följer av föreskrifter och företagets beslut och inte kan ändras över disk – och lyfter kundens önskemål till bevakningsföretaget, som kan pröva om uppdraget ska utformas annorlunda.",
        "Tar av västen – kunden vet vad gästerna vill ha.",
        "Jobbar i väst men gömmer dig bakom pelare.",
        "Byter till en väst utan text på egen hand."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Hur väktare uniformeras styrs av föreskrifter och arbetsgivarens beslut – inte av kundens estetik i stunden. Önskemålet kan vara legitimt, men vägen dit heter avtalsdialog mellan kund och företag, aldrig ett klädbyte i lobbyn.",
      "tags": [
        "rutin",
        "over_disk"
      ]
    },
    {
      "id": 251,
      "category": "konflikt_deeskalering",
      "categoryLabel": "Konflikt och deeskalering",
      "level": "fordjupning",
      "source": "v2",
      "title": "Genvägen ut",
      "scenario": "En berusad man vägrar lämna gallerian, och en klunga åskådare med mobiler har samlats runt er. Han verkar mer låst för varje uppmaning. Vad säger du?",
      "options": [
        "'Sista chansen innan det blir polisen!'",
        "'Kom, jag visar dig en genväg ut här borta – så slipper du trängseln', och leder honom lugnt åt sidan, bort från publiken, mot utgången.",
        "'Alla filmar dig – vill du bli viral?'",
        "'Sätt dig där borta så glömmer vi det här.'"
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Publiken har gjort avmarsch till ansiktsförlust – den gyllene bron gör den till hans eget val. En 'genväg' som råkar vara utgången ger honom både utvägen och värdigheten, och dig ett löst ärende utan en hand på någon.",
      "tags": [
        "deeskalering",
        "bemotande"
      ]
    },
    {
      "id": 252,
      "category": "konflikt_deeskalering",
      "categoryLabel": "Konflikt och deeskalering",
      "level": "fordjupning",
      "source": "v2",
      "title": "Språkmuren",
      "scenario": "En man gestikulerar allt mer upprört mot dig och talar snabbt på ett språk du inte förstår. Han pekar mot parkeringen och verkar desperat. Vad gör du?",
      "options": [
        "Höjer rösten och talar långsammare svenska.",
        "Avvisar honom – ni förstår ändå inte varandra.",
        "Ber honom komma tillbaka med tolk.",
        "Sänker ditt eget tempo, visar lugn med kroppen, följer hans pekande, använder enkla ord och mobilens översättning eller en kollega med språket – det som ser ut som aggression är ofta desperation över att inte bli förstådd."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Språkfrustration läses lätt som hot – men mannen kanske pekar mot ett barn i en låst bil. Kroppsspråk, tempo och översättningsverktyg river muren på en minut; höjd röst bygger den bara högre.",
      "tags": [
        "deeskalering",
        "bemotande"
      ]
    },
    {
      "id": 253,
      "category": "konflikt_deeskalering",
      "categoryLabel": "Konflikt och deeskalering",
      "level": "fordjupning",
      "source": "v2",
      "title": "Två röster mot dig",
      "scenario": "Ett par skäller på dig i mun på varandra om en nekad återbetalning – båda höjer rösten, båda kräver svar samtidigt. Vad gör du?",
      "options": [
        "Vänder dig lugnt till en av dem i taget – 'jag vill höra er båda, men en i sänder, du först' – ställer dig i vinkel så du ser båda, och sänker tempot i samtalet.",
        "Överröstar båda med ditt besked.",
        "Vänder ryggen till och går tills de lugnat sig.",
        "Ber dem göra upp inbördes om vem som får prata."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Två samtidiga röster går inte att lyssna på – och att inte bli hörd är konfliktens bränsle. Turordningen visar respekt åt båda, vinkeln håller din överblick, och tempot du sätter blir tempot samtalet får.",
      "tags": [
        "deeskalering",
        "bemotande"
      ]
    },
    {
      "id": 254,
      "category": "konflikt_deeskalering",
      "categoryLabel": "Konflikt och deeskalering",
      "level": "fordjupning",
      "source": "v2",
      "title": "Flickan bakom pappan",
      "scenario": "En upprörd pappa skäller högljutt på dig i entrén medan hans dotter i sexårsåldern står tätt bakom honom och ser skräckslagen ut. Vad gör du?",
      "options": [
        "Skäller tillbaka så att han förstår allvaret.",
        "Ber flickan gå undan så att ni kan prata klart.",
        "Sänker rösten rejält och flyttar fokus: 'Jag ser att din dotter blir rädd – ska vi ta det här lite lugnare för hennes skull?' och löser sedan sakfrågan i dämpat läge.",
        "Ignorerar flickan – hon är inte din angelägenhet."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Barnet är både den som skyddas och nyckeln som låser upp: få föräldrar fortsätter skrika när barnets rädsla görs synlig med respekt. Sänkt röst smittar – och sakfrågan löser sig alltid lättare på låg volym.",
      "tags": [
        "deeskalering",
        "barn"
      ]
    },
    {
      "id": 255,
      "category": "konflikt_deeskalering",
      "categoryLabel": "Konflikt och deeskalering",
      "level": "fordjupning",
      "source": "v2",
      "title": "Mannen som inte svarar",
      "scenario": "Du ropar två gånger bakifrån åt en man att stanna, men han fortsätter gå utan minsta reaktion. Kollegan fräser: 'Han trotsar oss ju!' Vad gör du?",
      "options": [
        "Tar tag i hans axel bakifrån direkt.",
        "Går lugnt runt honom, in i hans synfält på tryggt avstånd, och tar kontakt framifrån med tydliga tecken – utebliven reaktion bakifrån kan vara hörselnedsättning, hörlurar eller funktionsnedsättning, inte trots.",
        "Ropar en tredje gång, ännu högre.",
        "Låter kollegan tackla honom som markering."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Den som inte hör kan inte lyda – och ett grepp bakifrån på en intet ont anande människa är både farligt och fel. Synfältet är din kanal: framifrån, avstånd, tecken. Tolka beteenden, döm handlingar.",
      "tags": [
        "deeskalering",
        "bemotande"
      ]
    },
    {
      "id": 256,
      "category": "konflikt_deeskalering",
      "categoryLabel": "Konflikt och deeskalering",
      "level": "fordjupning",
      "source": "v2",
      "title": "Kollegan som kokar",
      "scenario": "Mitt i ett samtal med en dryg besökare hör du din kollega börja höja rösten och bli personlig: 'Du är faktiskt en riktig idiot...' Vad gör du?",
      "options": [
        "Kliver in lugnt och tar över kontakten – 'jag tar det här, ta en runda' – låter kollegan kliva av, löser situationen med besökaren och pratar med kollegan efteråt, inte inför motparten.",
        "Ställer dig bakom kollegan som förstärkning.",
        "Rättar kollegan högt inför besökaren.",
        "Låter det ha sin gång – han är vuxen."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "När en av er tappar tonen byter man förare – sömlöst och utan att desavuera någon inför motparten. En röst-principen gäller även här: kollegan får luft, besökaren får ett proffs, och samtalet er emellan tas i enrum.",
      "tags": [
        "kollegialitet",
        "deeskalering"
      ]
    },
    {
      "id": 257,
      "category": "konflikt_deeskalering",
      "categoryLabel": "Konflikt och deeskalering",
      "level": "fordjupning",
      "source": "v2",
      "title": "Sittstrejken",
      "scenario": "En ensam demonstrant har satt sig i skräddarställning mitt i kundens entré med en skylt, helt tyst och fredlig, och vägrar flytta sig. Kunden kräver att du 'släpar bort honom'. Vad gör du?",
      "options": [
        "Släpar undan honom – kunden har ju rätt till sin entré.",
        "Lyfter honom tillsammans med en kollega.",
        "Sätter dig bredvid tills han tröttnar.",
        "Informerar lugnt om att han behöver flytta sig, dokumenterar, håller passagen framkomlig runt honom – och överlåter ett eventuellt avlägsnande åt polisen: mot fredligt passivt motstånd är eget tvång sällan försvarligt, och kundens order ändrar inte den bedömningen."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Passivt, fredligt motstånd är juridiskt och taktiskt polisens gren – ditt våld skulle prövas hårt mot en person som varken hotar eller förstör. Information, dokumentation och framkomlighet är din leverans; 'släpa bort' beställer man inte över disk.",
      "tags": [
        "deeskalering",
        "over_disk"
      ]
    },
    {
      "id": 258,
      "category": "konflikt_deeskalering",
      "categoryLabel": "Konflikt och deeskalering",
      "level": "fordjupning",
      "source": "v2",
      "title": "Paragrafryttaren",
      "scenario": "En högljudd man viftar med mobilen: 'Enligt regeringsformen paragraf åtta har du ingen rätt att ens prata med mig – jag kan lagen!' Han citerar fel men med stort självförtroende. Vad gör du?",
      "options": [
        "Rättar varje felcitat tills han ger sig.",
        "Googlar paragrafen och läser upp den rätta.",
        "Låter bli den juridiska debatten helt: ger ditt korta, korrekta besked om vad som gäller och vad som händer härnäst – och står lugnt fast vid det oavsett hur många paragrafer som viftas.",
        "Erkänner att han nog har rätt för att få lugn."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Debatten är hans arena – där finns bara förlust, hur rätt du än har. Ditt lugna besked plus handling är din arena: 'så här gäller, det här händer nu'. Vinn situationen, aldrig diskussionen.",
      "tags": [
        "deeskalering",
        "bemotande"
      ]
    },
    {
      "id": 259,
      "category": "konflikt_deeskalering",
      "categoryLabel": "Konflikt och deeskalering",
      "level": "fordjupning",
      "source": "v2",
      "title": "Rösterna ingen annan hör",
      "scenario": "En man står vid busshållplatsen och skriker mot någon som inte finns, slår sig själv i huvudet och kliver plötsligt ut i körbanan bland bilarna. Vad gör du?",
      "options": [
        "Skriker åt honom att skärpa sig och gå upp på trottoaren.",
        "Prioriterar säkerheten: varnar trafiken, försöker med korta, lugna uppmaningar leda honom från körbanan utan gripanden eller argumentation, larmar 112 för både polis och ambulans – detta är ett sjukvårdsläge med akut trafikfara, inte en ordningsfråga.",
        "Går emellan honom och rösten han skriker åt.",
        "Väntar på att han ska lugna ner sig själv."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Psykosliknande tillstånd nås inte av argument – men korta uppmaningar och en lugn hand kan styra fötterna. Trafiken är den omedelbara döden i scenen: varna, led, larma dubbelt. Han är sjuk, inte stökig.",
      "tags": [
        "sjukvard",
        "prioritering"
      ]
    },
    {
      "id": 260,
      "category": "konflikt_deeskalering",
      "categoryLabel": "Konflikt och deeskalering",
      "level": "fordjupning",
      "source": "v2",
      "title": "Kören som filmar",
      "scenario": "Ett gäng tonåringar följer efter dig genom centrumet, filmar och skanderar ramsor om väktare för att få en reaktion. Inget brott begås. Vad gör du?",
      "options": [
        "Stannar tvärt och konfronterar den som filmar närmast.",
        "Jagar bort dem en och en.",
        "Ställer dig och stirrar tillbaka tills de tröttnar.",
        "Berövar föreställningen sin scen: fortsätter arbetet demonstrativt oberört, ändrar din rutt så att följet blir ointressant, håller dörren öppen med en vänlig kommentar – och låter kameran fånga tre minuter tråkig professionalism."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Innehållet de vill ha är din tappade fattning – utan den dör klippet i redigeringen. Rörelse, oberördhet och lite humor är motmedlet; varje konfrontation är manus åt dem. Trakasserierna dokumenteras om de eskalerar.",
      "tags": [
        "deeskalering",
        "bemotande"
      ]
    },
    {
      "id": 261,
      "category": "konflikt_deeskalering",
      "categoryLabel": "Konflikt och deeskalering",
      "level": "fordjupning",
      "source": "v2",
      "title": "Ursäkten",
      "scenario": "Du inser att du var onödigt snäsig i tonen mot en besökare som nu står kvar, korslagda armar, och vägrar samarbeta om något alls. Vad gör du?",
      "options": [
        "Ber om ursäkt för tonen – 'jag var kort mot dig nyss, det var fel av mig' – utan att backa i sakfrågan, och börjar om samtalet därifrån.",
        "Står fast vid allt – ursäkter är svaghet i uniform.",
        "Ber en kollega ta över så slipper du ursäkten.",
        "Ger honom rätt i sakfrågan som kompensation."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "En ursäkt för formen kostar ingenting och köper tillbaka hela samtalet – sakfrågan står orörd. Att skilja ton från sak är styrka, inte svaghet: den som kan säga 'det var fel av mig' äger rummet igen.",
      "tags": [
        "bemotande",
        "deeskalering"
      ]
    },
    {
      "id": 262,
      "category": "konflikt_deeskalering",
      "categoryLabel": "Konflikt och deeskalering",
      "level": "fordjupning",
      "source": "v2",
      "title": "Förlorarnas vandring",
      "scenario": "Hemmalaget har förlorat derbyt och tusentals besvikna supportrar väller ut mot samma trånga passage där du står posterad. Stämningen är tryckt och aggressiv. Vad gör du?",
      "options": [
        "Ställer dig mitt i passagen som en mänsklig fartkamera.",
        "Konfronterar de mest högljudda tidigt som markering.",
        "Arbetar med flödet i stället för mot det: håller passagen maximalt öppen, rapporterar trycket till samordningen så att alternativa vägar öppnas, står synlig men vid sidan – och undviker varje individkonfrontation i massan.",
        "Ropar åt massan att lugna ner sig."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Tusen besvikna människor är fysik, inte psykologi: flöde, yta och alternativa vägar är verktygen, aldrig enskilda tillsägelser som kan tända massan. Din synliga, lugna närvaro vid sidan dämpar – din kropp i flödet gör det inte.",
      "tags": [
        "prioritering",
        "egen_sakerhet"
      ]
    },
    {
      "id": 263,
      "category": "konflikt_deeskalering",
      "categoryLabel": "Konflikt och deeskalering",
      "level": "fordjupning",
      "source": "v2",
      "title": "Handen på axeln",
      "scenario": "Du lade vänligt en hand på axeln på en upprörd man för att lugna honom – han exploderade: 'RÖR MIG INTE!' och är nu betydligt argare än innan. Vad gör du?",
      "options": [
        "Håller kvar handen för att visa att du inte backar.",
        "Tar ett tydligt steg tillbaka, håller händerna synliga och kvitterar direkt: 'Du har rätt, jag ska inte röra dig – vi löser det här med ord', och fortsätter på behörigt avstånd.",
        "Lägger handen på den andra axeln i stället.",
        "Går därifrån – han är omöjlig att prata med."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Beröring av en person i affekt utan skäl var felet – och felet erkänns bäst med kroppen: steg tillbaka, öppna händer, verbal kvittens. Hans gräns respekterad blir din trovärdighet tillbaka; samtalet kan börja om.",
      "tags": [
        "deeskalering",
        "bemotande"
      ]
    },
    {
      "id": 264,
      "category": "konflikt_deeskalering",
      "categoryLabel": "Konflikt och deeskalering",
      "level": "fordjupning",
      "source": "v2",
      "title": "Samtalet som går i cirklar",
      "scenario": "Efter tio minuters lugnt samtal upprepar mannen samma anklagelser för fjärde gången. Inget nytt tillkommer, men han visar inga tecken på att vare sig eskalera eller gå. Vad gör du?",
      "options": [
        "Fortsätter lyssna i cirklar hur länge det än tar.",
        "Avbryter tvärt och går mitt i hans mening.",
        "Höjer rösten för att bryta mönstret.",
        "Avslutar strukturerat: sammanfattar hans poäng så han hör att den nått fram, ger de två val som finns kvar med respektive konsekvens, erbjuder kort betänketid – och verkställer sedan lugnt det val han gör."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Att lyssna färdigt betyder inte att lyssna för evigt – när cirkeln slutit sig tre varv tillför fler varv inget. Sammanfattning, tydliga val, betänketid, verkställighet: samtalets slut kan vara lika respektfullt som dess början.",
      "tags": [
        "deeskalering",
        "bemotande"
      ]
    },
    {
      "id": 265,
      "category": "sjukvard_fordjupning",
      "categoryLabel": "Akutsjukvård – fördjupning",
      "level": "fordjupning",
      "source": "v2",
      "title": "Mannen vid elcentralen",
      "scenario": "I ett teknikrum ligger en elektriker orörlig intill en öppnad elcentral, med ena handen fortfarande nära kablaget. Vad gör du FÖRST?",
      "options": [
        "Bryter strömmen eller separerar honom från strömkällan med icke-ledande föremål innan du rör honom – därefter L-ABCDE, larm på 112 och HLR vid behov.",
        "Drar undan honom i armarna direkt.",
        "Startar HLR på platsen där han ligger.",
        "Häller vatten i ansiktet för att väcka honom."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Rör du en strömförande person blir ni två patienter – strömmen bryts alltid först. Elolyckor kan dessutom ge hjärtrytmrubbningar med fördröjning: 112 och vårdbedömning gäller även den som kvicknar till.",
      "tags": [
        "sjukvard",
        "egen_sakerhet"
      ]
    },
    {
      "id": 266,
      "category": "sjukvard_fordjupning",
      "categoryLabel": "Akutsjukvård – fördjupning",
      "level": "fordjupning",
      "source": "v2",
      "title": "Livlös i poolen",
      "scenario": "Du drar upp en livlös man ur hotellpoolen. Han reagerar inte och andas inte normalt. Vad skiljer HLR vid drunkning?",
      "options": [
        "Inget – du väntar på ambulansen vid drunkning.",
        "Du vänder honom upp och ner för att tömma ut vattnet.",
        "Vid drunkning inleds HLR med 5 inblåsningar innan kompressionerna – syrebristen är problemets kärna – därefter 30:2 som vanligt, med 112 på högtalare och hjärtstartare hämtad.",
        "Du gör enbart kompressioner, aldrig inblåsningar, på våta personer."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Drunkning är ett syrebristsstopp – därför prioriteras luft direkt: fem inledande inblåsningar, sedan vanlig HLR. Att 'tömma vatten' är en myt som stjäl minuter; hjärtstartare fungerar när bröstkorgen torkats av.",
      "tags": [
        "sjukvard",
        "hlr"
      ]
    },
    {
      "id": 267,
      "category": "sjukvard_fordjupning",
      "categoryLabel": "Akutsjukvård – fördjupning",
      "level": "fordjupning",
      "source": "v2",
      "title": "Ångan ur maskinen",
      "scenario": "En anställd får het ånga över handen och underarmen – huden är rodnad med begynnande blåsor, och han skriker av smärta. Vad gör du?",
      "options": [
        "Smörjer in brännskadan med salva direkt.",
        "Kyl skadan med svalt rinnande vatten i 15–20 minuter, ta försiktigt av ringar och klocka innan svullnaden kommer, täck sedan löst med rent förband – och se till att han kommer till vård för bedömning av blåsorna.",
        "Spricker blåsorna så trycket lättar.",
        "Lägger is direkt mot huden."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Svalt vatten stoppar den fortsatta vävnadsskadan och lindrar – is skadar mer, salvor och spruckna blåsor bjuder in infektionen. Ringar av tidigt: en svullen hand med ring kan förlora fingret.",
      "tags": [
        "sjukvard",
        "brannskada"
      ]
    },
    {
      "id": 268,
      "category": "sjukvard_fordjupning",
      "categoryLabel": "Akutsjukvård – fördjupning",
      "level": "fordjupning",
      "source": "v2",
      "title": "Krampen som inte slutar",
      "scenario": "En man faller i kramp i entrén. Du har skyddat huvudet och flyttat undan möbler – men efter fem minuter krampar han fortfarande. Vad gäller?",
      "options": [
        "Kramper går alltid över – fortsätt bara vänta.",
        "Håll fast armarna så att krampen bryts.",
        "Stoppa en plånbok mellan tänderna nu.",
        "Larma 112 omgående om det inte redan är gjort – ett anfall som pågår över fem minuter är ett akutläge – fortsätt skydda utan att hålla fast, ta tid på förloppet, och lägg honom i stabilt sidoläge när krampen släpper."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Femminutersgränsen är larmgränsen: långdragna anfall kan skada hjärnan och kräver akutvård. Reglerna under tiden är orubbliga – inget fasthållande, inget i munnen, bara skydd, tid och sidoläge efteråt.",
      "tags": [
        "sjukvard",
        "kramper"
      ]
    },
    {
      "id": 269,
      "category": "sjukvard_fordjupning",
      "categoryLabel": "Akutsjukvård – fördjupning",
      "level": "fordjupning",
      "source": "v2",
      "title": "Adrenalinpennan",
      "scenario": "En gäst som blivit getingstucken sväller snabbt runt ögon och läppar, får väsande andning – och fumlar hjälplöst med en adrenalinpenna hon inte orkar hantera. Vad gör du?",
      "options": [
        "Hjälper henne att använda pennan enligt instruktionen på den – med ett bestämt tryck mot lårets utsida, genom kläderna om det behövs – larmar 112 och stannar hos henne; en andra dos kan bli aktuell om ambulansen dröjer och symtomen återkommer.",
        "Väntar med pennan tills ambulansen bedömt henne.",
        "Ger henne en antihistamintablett och avvaktar.",
        "Lägger henne plant och höjer benen, inget mer."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Vid anafylaxi räknas minuter, och adrenalinet är det som häver förloppet – pennan är byggd för att lekmän ska kunna hjälpa till, med instruktionen tryckt på sidan. Tabletter är för långsamma; 112 och pennan är paret som räddar.",
      "tags": [
        "sjukvard",
        "allergi"
      ]
    },
    {
      "id": 270,
      "category": "sjukvard_fordjupning",
      "categoryLabel": "Akutsjukvård – fördjupning",
      "level": "fordjupning",
      "source": "v2",
      "title": "Näsblodet",
      "scenario": "En besökare blöder kraftigt näsblod efter en lätt smäll och lutar instinktivt huvudet bakåt medan blodet rinner ner i halsen. Vad gör du?",
      "options": [
        "Låter honom fortsätta – bakåt känns ju logiskt.",
        "Lägger honom raklång på rygg.",
        "Rättar till tekniken: framåtlutat huvud och ett stadigt grepp som klämmer ihop näsvingarna i 10–15 minuter utan att släppa efter – och vård om blödningen inte avstannar eller smällen var kraftig.",
        "Stoppar upp näsan med papper så långt det går."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Bakåtlutning skickar blodet till svalg och mage – illamående och falsk trygghet. Framåt plus oavbrutet tryck på näsvingarna låter blodet levra: enkelt, gammalt och rätt.",
      "tags": [
        "sjukvard",
        "blodning"
      ]
    },
    {
      "id": 271,
      "category": "sjukvard_fordjupning",
      "categoryLabel": "Akutsjukvård – fördjupning",
      "level": "fordjupning",
      "source": "v2",
      "title": "Fingertoppen i dörren",
      "scenario": "En tung branddörr slår igen över en hantverkares hand – yttersta delen av ett finger ligger kvar på golvet och blödningen är riklig. Vad gör du?",
      "options": [
        "Stoppar blödningen med direkt tryck och förband, tar hand om den avskilda delen: svep in den i ren, fuktad kompress, lägg i en tät påse – och påsen i sin tur mot is eller kallt vatten, aldrig delen direkt mot isen – och se till att båda snabbt når sjukhus.",
        "Lägger fingertoppen direkt på is.",
        "Slänger delen – så små bitar går inte att rädda.",
        "Trär tillbaka delen och tejpar fast den."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Rätt hanterad kan en avskild kroppsdel ofta räddas – men frysskadad direkt mot is kan den inte. Blödningen först, delen skyddad och indirekt kyld, och sjukhuset informerat om att den är på väg.",
      "tags": [
        "sjukvard",
        "blodning"
      ]
    },
    {
      "id": 272,
      "category": "sjukvard_fordjupning",
      "categoryLabel": "Akutsjukvård – fördjupning",
      "level": "fordjupning",
      "source": "v2",
      "title": "Juicen till den medvetslöse",
      "scenario": "En diabetiker har blivit medvetslös, och hennes vän försöker i paniken hälla juice i hennes mun: 'Hon behöver bara socker!' Vad gör du?",
      "options": [
        "Hjälper till att hälla – vännen känner ju sjukdomen.",
        "Håller upp huvudet så att juicen rinner ner lättare.",
        "Väntar och ser om juicen hjälper.",
        "Stoppar vänligt men bestämt hällandet – en medvetslös person kan inte svälja och kvävs – lägger henne i stabilt sidoläge, larmar 112 och övervakar andningen; vännens sjukdomskunskap lämnas i stället till larmoperatören."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Regeln bryter panikens logik: socker räddar den vakne, men dränker den medvetslöse. Sidoläge, larm, övervakning – och vännen blir en resurs i luren i stället för en fara vid munnen.",
      "tags": [
        "sjukvard",
        "diabetes"
      ]
    },
    {
      "id": 273,
      "category": "sjukvard_fordjupning",
      "categoryLabel": "Akutsjukvård – fördjupning",
      "level": "fordjupning",
      "source": "v2",
      "title": "Hjärtstoppet i hissen",
      "scenario": "En man segnar livlös ihop i en trång hiss – utrymmet räcker knappt för att stå bredvid honom, och han andas inte normalt. Vad gör du?",
      "options": [
        "Gör HLR i den vinkel som får plats i hissen.",
        "Skapar först förutsättningar: drar snabbt ut honom till plant, hårt underlag utanför hissen – kompressioner kräver arbetsyta och hårt stöd under ryggen – och kör därefter larm, HLR 30:2 och hjärtstartare som vanligt.",
        "Sätter honom upp mot hissväggen.",
        "Väntar i hissen på att ambulansen bär ut honom."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Kompressioner mot ett mjukt eller trångt underlag pressar personen, inte hjärtat. De sekunder förflyttningen kostar betalar sig i varje efterföljande kompression – ut, ner på hårt golv, och kör.",
      "tags": [
        "sjukvard",
        "hlr"
      ]
    },
    {
      "id": 274,
      "category": "sjukvard_fordjupning",
      "categoryLabel": "Akutsjukvård – fördjupning",
      "level": "fordjupning",
      "source": "v2",
      "title": "Mötaren",
      "scenario": "Ambulansen är larmad till ett hjärtstopp inne på det stora kontorskomplexet, och du utses att möta den. Vad innebär uppdraget?",
      "options": [
        "Att stå kvar hos patienten och vinka genom fönstret.",
        "Att ringa ambulansen var femte minut och fråga var de är.",
        "Att låsa upp alla dörrar och sedan gå hem.",
        "Att posta dig väl synlig vid rätt infart, vinka in ambulansen, hålla dörrar och hiss öppna längs vägen – och under gången ge en kort rapport: vad som hänt, vad som gjorts, hur länge, och exakt var patienten finns."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Varje minut ambulansen letar port är en minut utan defibrillator hos patienten – mötaren kan korta insatsen mer än någon annan enskild åtgärd. Synlighet, fri väg och trettio sekunders koncentrerad rapport: det är hela jobbet, och det räddar liv.",
      "tags": [
        "sjukvard",
        "prioritering"
      ]
    },
    {
      "id": 275,
      "category": "sjukvard_fordjupning",
      "categoryLabel": "Akutsjukvård – fördjupning",
      "level": "fordjupning",
      "source": "v2",
      "title": "De tysta och de skrikande",
      "scenario": "En bil har kört in i en busskur utanför ditt objekt. Tre skadade: en man skriker högt om sitt ben, en kvinna sitter tyst och gråblek med snabb, ytlig andning, en tredje går omkring förvirrad. Ensam de första minuterna – vem först?",
      "options": [
        "Mannen som skriker – han låter värst.",
        "Den gående – han är lättast att hjälpa.",
        "Den tysta, gråbleka kvinnan – skrik kräver luft och medvetande, medan tystnad med påverkad andning signalerar den kritiska skadan; larma 112 med antal och tillstånd, åtgärda livshoten i L-ABCDE-ordning och be den gående sitta ner.",
        "Alla tre samtidigt, lite i taget."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Ljudnivån lurar: den som orkar skrika har luftväg, andning och medvetande. Den tysta med ytlig andning är den klocka som tickar snabbast – prioritering efter ABCDE, inte efter decibel.",
      "tags": [
        "sjukvard",
        "prioritering"
      ]
    },
    {
      "id": 276,
      "category": "sjukvard_fordjupning",
      "categoryLabel": "Akutsjukvård – fördjupning",
      "level": "fordjupning",
      "source": "v2",
      "title": "Treåringen som tystnat",
      "scenario": "På familjedagen springer en förälder fram med en treåring som satt en druva i halsen – barnet kan varken skrika eller hosta och börjar blåna. Vad gör du?",
      "options": [
        "Håller barnet upp och ner i benen och skakar.",
        "Ger omedelbart buktryck som på en vuxen.",
        "För in fingrarna och letar efter druvan i halsen.",
        "Lägger barnet framåtlutat med stöd över din arm eller ditt knä och ger 5 bestämda ryggslag mellan skulderbladen, växlar därefter med 5 försiktigare buktryck – och blir barnet medvetslöst: larma 112 och starta barn-HLR, som inleds med 5 inblåsningar."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Tystnaden är larmet – luftvägen är helt blockerad. Ryggslag först på barn, buktryck varsammare än på vuxna, och blinda fingrar i halsen trycker bara druvan djupare. Barn-HLR:s fem inledande inblåsningar speglar drunkningslogiken: syret först.",
      "tags": [
        "sjukvard",
        "barn"
      ]
    },
    {
      "id": 277,
      "category": "brand_fordjupning",
      "categoryLabel": "Brand – fördjupning",
      "level": "fordjupning",
      "source": "v2",
      "title": "Elsparkcykeln i cykelrummet",
      "scenario": "I fastighetens cykelrum ryker och fräser en elsparkcykel på laddning – smällande ljud hörs från batteriet. Vad gör du?",
      "options": [
        "Bär snabbt ut sparkcykeln på gården.",
        "Utrymmer rummet, stänger dörren om branden, larmar 112 med uppgiften att det gäller ett litiumbatteri – och försöker aldrig bära ut ett fräsande batteri: de kan övertända explosionsartat och återantända långt senare.",
        "Kväver den med en filt och går sedan.",
        "Drar ur laddsladden och väntar kvar bredvid."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Ett termiskt skenande litiumbatteri är en brandbomb med egen tidtabell – gasutveckling, stickflammor och återantändning i timmar. Dörr, larm och information till räddningstjänsten om batteriet; hjältebärningen har skadat många.",
      "tags": [
        "brand",
        "egen_sakerhet"
      ]
    },
    {
      "id": 278,
      "category": "brand_fordjupning",
      "categoryLabel": "Brand – fördjupning",
      "level": "fordjupning",
      "source": "v2",
      "title": "Gasolen vid matvagnen",
      "scenario": "En foodtruck på ditt evenemang börjar brinna i friteringsdelen – och på vagnens baksida sitter två gasolflaskor. Vad gör du?",
      "options": [
        "Kopplar loss gasolflaskorna och bär bort dem.",
        "Släcker fritösbranden med festivalens vattenslang.",
        "Ber matvagnens personal köra bort vagnen.",
        "Utrymmer omedelbart en stor radie runt vagnen, larmar 112 med den avgörande uppgiften om gasolflaskorna, stoppar tillströmningen av publik – och lämnar flaskorna åt räddningstjänsten: gasol i brand kan ge en explosion."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Gasolflaskor som hettas upp kan sprängas med dödlig radie – informationen till 112 ändrar hela räddningsinsatsens taktik. Din uppgift är avstånd och tomma ytor, aldrig flasklyft i lågor eller vatten i brinnande fett.",
      "tags": [
        "brand",
        "prioritering"
      ]
    },
    {
      "id": 279,
      "category": "brand_fordjupning",
      "categoryLabel": "Brand – fördjupning",
      "level": "fordjupning",
      "source": "v2",
      "title": "Vattenhinken mot fritösen",
      "scenario": "Det brinner i personalkökets fritös – och en välmenande kollega kommer springande med en fylld vattenhink, två sekunder från att kasta. Vad gör du?",
      "options": [
        "Stoppar honom omedelbart – fysiskt om det krävs, med ett skarpt 'STANNA, inte vatten!' – och kväver i stället branden med lock eller brandfilt; vatten i brinnande fett exploderar i ett eldklot.",
        "Låter honom kasta – vatten släcker ju eld.",
        "Håller upp dörren så att ångan kan vädras ut.",
        "Springer efter en egen, större hink."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Här får deeskaleringsreglerna vika: en liter vatten i brinnande fett blir tusentals liter brinnande ånga i ansiktshöjd. Skarp röst och en arm i vägen är helt rätt våldsnivå mot en välmenande katastrof – sedan lock, filt och larm.",
      "tags": [
        "brand",
        "prioritering"
      ]
    },
    {
      "id": 280,
      "category": "brand_fordjupning",
      "categoryLabel": "Brand – fördjupning",
      "level": "fordjupning",
      "source": "v2",
      "title": "Elcentralen som sprakar",
      "scenario": "Ur en elcentral i källaren sprakar det, lukten av bränd plast är tydlig och tunn rök sipprar ur skåpet. Vad gör du?",
      "options": [
        "Öppnar skåpet och blåser bort röken.",
        "Sprutar vatten in i skåpet genom springorna.",
        "Bryter huvudströmmen om det kan ske säkert, larmar 112 och driftansvarig, håller kolsyresläckaren redo – aldrig vatten mot el – och möter räddningstjänsten med vägen till centralen och besked om strömläget.",
        "Tejpar igen skåpets springor så syret tar slut."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "El plus vatten är en dödlig ekvation, och en sprakande central kan tända på riktigt vilken sekund som helst. Bryt strömmen, larma, kolsyra i beredskap – och räddningstjänstens första fråga blir 'är strömmen bruten?': ha svaret.",
      "tags": [
        "brand",
        "egen_sakerhet"
      ]
    },
    {
      "id": 281,
      "category": "brand_fordjupning",
      "categoryLabel": "Brand – fördjupning",
      "level": "fordjupning",
      "source": "v2",
      "title": "Ropen inifrån röken",
      "scenario": "En korridor är fylld av tät, svart rök – och inifrån hör du någon ropa på hjälp. Ingen räddningstjänst är framme än. Vad gör du?",
      "options": [
        "Håller andan och springer in mot rösten.",
        "Ropar tillbaka med lugnande besked och vägledning mot din röst, håller dörren och positionen, och ger 112 och den anländande räddningstjänsten den exakta uppgiften om var rösten hörs – utan att gå in i tät rök: några andetag räcker för att du ska bli offer nummer två.",
        "Blöter en tröja, binder för ansiktet och kryper in.",
        "Väntar tyst utanför tills ropen tystnar."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Tät brandrök slår ut en otränad, oskyddad människa på sekunder – att gå in är att addera en patient och subtrahera en rapportör. Din röst kan leda personen ut, och din positionsangivelse styr rökdykarna rätt: det är så du räddar liv härifrån.",
      "tags": [
        "brand",
        "egen_sakerhet"
      ]
    },
    {
      "id": 282,
      "category": "brand_fordjupning",
      "categoryLabel": "Brand – fördjupning",
      "level": "fordjupning",
      "source": "v2",
      "title": "Stäng av sprinklern!",
      "scenario": "Sprinklern har utlöst över ett lager och kunden skriker i telefon: 'Vattnet förstör varor för miljoner – stäng huvudventilen NU!' Rök syns fortfarande från sektionen. Vad gör du?",
      "options": [
        "Stänger ventilen – kundens varor är kundens beslut.",
        "Stänger hälften av flödet som kompromiss.",
        "Låter kunden själv komma och stänga.",
        "Avböjer: sprinklern har utlöst för att något brinner eller brann, och avstängning sker först på räddningsledarens besked efter kontroll – vattenskadade varor går att ersätta, en återuppflammande lagerbrand tar allt."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Sprinklern är den anställde som aldrig sover – att strypa den medan rök syns är att avväpna släckningen mitt i insatsen. Beslutet är räddningsledarens; din uppgift är att stå emot paniken och dokumentera kundens order.",
      "tags": [
        "brand",
        "over_disk"
      ]
    },
    {
      "id": 283,
      "category": "brand_fordjupning",
      "categoryLabel": "Brand – fördjupning",
      "level": "fordjupning",
      "source": "v2",
      "title": "Det är säkert bara en övning",
      "scenario": "Utrymningslarmet ljuder i kontorshuset, och en avdelning sitter kvar: 'Det är säkert den där oanmälda övningen facilities pratade om – vi har deadline.' Vad gör du?",
      "options": [
        "Behandlar larmet som skarpt och genomför utrymningen med tydliga besked – 'larmet gäller, ut via trapphus B nu' – för varken du eller de vet om det övas: den informationen får ni vid återsamlingsplatsen, aldrig vid skrivborden.",
        "Kollar med facilities först och låter dem sitta så länge.",
        "Låter deadline-laget sitta kvar mot en underskrift.",
        "Utrymmer alla utom just den avdelningen."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Varje larm är skarpt tills motsatsen bevisats – och den bevisningen sker utomhus. Kulturen 'det är nog övning' är exakt det som dödar vid den riktiga branden; din tydlighet i dag är deras reflex i morgon.",
      "tags": [
        "brand",
        "rutin"
      ]
    },
    {
      "id": 284,
      "category": "brand_fordjupning",
      "categoryLabel": "Brand – fördjupning",
      "level": "fordjupning",
      "source": "v2",
      "title": "Rullstolen på plan tre",
      "scenario": "Brandlarmet går i kontorshuset. På plan tre möter du en rullstolsburen kvinna vid hissen – som är spärrad vid brand. Vad gör du?",
      "options": [
        "Bär henne ensam nerför sex trappor direkt.",
        "Ställer henne i korridoren och fortsätter utrymma.",
        "Följer henne till våningens utrymningsplats – den skyddade ytan vid trapphuset avsedd för exakt detta – stannar hos henne om läget medger eller ser till att någon gör det, och meddelar räddningsledaren omedelbart position och behov: räddningstjänsten evakuerar därifrån.",
        "Prövar hissen ändå – den kanske fungerar."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Utrymningsplatsen är byggd som en säker ö med brandcellsskydd och kommunikation – därifrån lyfter räddningstjänsten tryggt och rätt. En ensam trappbärning skadar ofta båda; hissen kan bli en ugn. Position till räddningsledaren är den livräddande raden.",
      "tags": [
        "brand",
        "prioritering"
      ]
    },
    {
      "id": 285,
      "category": "brand_fordjupning",
      "categoryLabel": "Brand – fördjupning",
      "level": "fordjupning",
      "source": "v2",
      "title": "Slangen mot soffbranden",
      "scenario": "En soffa brinner med växande lågor i en foajé. Inomhusbrandposten med formstyv slang finns fem meter bort, och utrymningen pågår bakom dig. Vad gäller för ditt släckförsök?",
      "options": [
        "Slangen ger obegränsat vatten och räckvidd – ett släckförsök är rimligt om du håller reträttvägen fri bakom dig och avbryter direkt om branden växer förbi dig: då stängs dörren om foajén och branden lämnas till räddningstjänsten.",
        "Brandposten får bara användas av räddningstjänsten.",
        "Du släcker tills soffan är helt utglödgad, oavsett rökläget.",
        "Du väljer alltid pulversläckaren före brandposten inomhus."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Brandposten är lekmannens kraftigaste verktyg – vatten utan slut mot en fast brand i A-material. Men verktyget ändrar inte reglerna: reträttväg bakom ryggen, röken som klocka, och dörren som plan B när sekunderna säger stopp.",
      "tags": [
        "brand",
        "rutin"
      ]
    },
    {
      "id": 286,
      "category": "brand_fordjupning",
      "categoryLabel": "Brand – fördjupning",
      "level": "fordjupning",
      "source": "v2",
      "title": "Brandvakten efteråt",
      "scenario": "Räddningstjänsten har släckt en mindre brand i ett soprum och åker vidare – räddningsledaren ber dig gå efterbevakning under natten. Vad innebär det?",
      "options": [
        "Att du låser soprummet och tittar till det i gryningen.",
        "Att du vädrar ut röklukten med öppna dörrar.",
        "Att du städar upp brandresterna åt kunden.",
        "Att du enligt räddningsledarens instruktion återkommande kontrollerar brandplatsen – känner på ytor, letar glöd och röklukt, med släckutrustning omedelbart tillgänglig – och larmar direkt vid minsta tecken: återantändning ur dolda glödhärdar är vanligt i timmar efteråt."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Branden som ser död ut kan pyra djupt i material och bjälklag – efterbevakningen är räddningstjänstens förlängda arm under de kritiska timmarna. Intervall, kontrollpunkter och tröskeln för nytt larm sätts av räddningsledaren; din noggrannhet avgör om natten slutar lugnt.",
      "tags": [
        "brand",
        "rutin"
      ]
    },
    {
      "id": 287,
      "category": "felsokning",
      "categoryLabel": "Felsökning – hitta felet",
      "level": "fordjupning",
      "source": "v2",
      "title": "Gripandet på hörsägen",
      "scenario": "En väktare får höra av en kassör att 'mannen i grön jacka stal nyss cigaretter'. Väktaren tar lugnt kontakt, presenterar sig korrekt, griper mannen utanför kassalinjen och larmar polis direkt. Vilket var det allvarligaste felet?",
      "options": [
        "Att han presenterade sig – det röjer taktiken.",
        "Att han larmade polisen för tidigt.",
        "Att gripandet saknade grund: väktaren hade varken egen eller stafettöverlämnad kontinuerlig uppsikt – kassörens utpekande ger ingen gripanderätt, och gripandet riskerar att vara olaga frihetsberövande.",
        "Att han väntade tills mannen passerat kassalinjen."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Allt i genomförandet var korrekt – men huset byggdes utan grund. Andrahandsuppgifter ger aldrig bar gärning eller flyende fot: rätt väg var signalement, kassören som vittne och polis.",
      "tags": [
        "felsokning",
        "envarsgripande"
      ]
    },
    {
      "id": 288,
      "category": "felsokning",
      "categoryLabel": "Felsökning – hitta felet",
      "level": "fordjupning",
      "source": "v2",
      "title": "Fängslen för säkerhets skull",
      "scenario": "En väktare griper en man som direkt blir lugn och samarbetsvillig. Väktaren sätter ändå på handfängsel 'för säkerhets skull', aktiverar låsspärren korrekt, kontrollerar åtsittningen och dokumenterar tiderna perfekt. Vilket var det allvarligaste felet?",
      "options": [
        "Att han aktiverade låsspärren.",
        "Att fängsel användes utan behov: mot en lugn och samarbetsvillig person saknar fängslandet stöd – tekniken var felfri, men våldsanvändningen i sig var oförsvarlig.",
        "Att han dokumenterade tiderna – det är polisens jobb.",
        "Att han kontrollerade åtsittningen för ofta."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Perfekt utförd teknik räddar inte en åtgärd som aldrig skulle gjorts: fängsel är våld och kräver behov varje minut. 'För säkerhets skull' är ingen grund – det är frånvaron av en.",
      "tags": [
        "felsokning",
        "handfangsel"
      ]
    },
    {
      "id": 289,
      "category": "felsokning",
      "categoryLabel": "Felsökning – hitta felet",
      "level": "fordjupning",
      "source": "v2",
      "title": "Släckaren före larmet",
      "scenario": "En väktare upptäcker en växande brand i en papperskorg intill ett väntrum med människor. Han springer efter en släckare två korridorer bort, släcker efter fyra minuters kamp och ringer först därefter 112 och varnar de väntande. Vilket var det allvarligaste felet?",
      "options": [
        "Att han använde pulversläckare inomhus.",
        "Att han ringde 112 fast branden redan var släckt.",
        "Att han sprang i stället för att gå med släckaren.",
        "Att han vände på prioritetsordningen: människorna intill skulle varnas och räddas och larmet göras innan släckförsöket – RVLS finns för att hjälpen ska vara på väg och ingen sitta kvar i röken om släckningen misslyckas."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Han vann sitt vad – den här gången. Hade släckningen misslyckats hade väntrummet fyllts av rök utan att någon varnats och utan att hjälp var på väg. Rädda, varna, larma, släck: ordningen är själva säkerhetsmarginalen.",
      "tags": [
        "felsokning",
        "brand"
      ]
    },
    {
      "id": 290,
      "category": "felsokning",
      "categoryLabel": "Felsökning – hitta felet",
      "level": "fordjupning",
      "source": "v2",
      "title": "Blanketten",
      "scenario": "Efter ett korrekt gripande med handfängsel sätter väktaren den gripne på en stol i personalrummet och går själv två våningar ner för att hämta rapportblanketter – borta i sex minuter. Vilket var det allvarligaste felet?",
      "options": [
        "Att han lämnade en fängslad person ensam och utan övervakning: positionsrisker, självskada, flyktförsök och medicinska förlopp kan inte upptäckas – en fängslad person övervakas kontinuerligt tills polisen tar över.",
        "Att han valde personalrummet i stället för kontoret.",
        "Att han satte den gripne på en stol.",
        "Att han prioriterade dokumentationen så högt."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "En fängslad människa kan inte skydda sig själv – mot fallet, paniken eller den egna andningen. Sex minuter utan ögon är sex minuter där allt kan hända: blanketten kunde ha väntat, övervakningen kunde det inte.",
      "tags": [
        "felsokning",
        "handfangsel"
      ]
    },
    {
      "id": 291,
      "category": "felsokning",
      "categoryLabel": "Felsökning – hitta felet",
      "level": "fordjupning",
      "source": "v2",
      "title": "Legitimationen på avstånd",
      "scenario": "Vid inpasseringen visar en besökare upp sitt id-kort på en halvmeters avstånd. Väktaren nickar igenkännande åt fotot, jämför noga frisyren, antecknar namnet ur minnet och släpper in. Vilket var det allvarligaste felet?",
      "options": [
        "Att han antecknade namnet – det är integritetskänsligt.",
        "Att kontrolltekniken uteblev: en id-handling tas i egen hand och granskas – känn på ytan, vinkla mot ljuset, kontrollera giltighetstid och personnummer – och ansiktsjämförelsen görs mot drag som inte ändras, inte mot frisyren.",
        "Att han jämförde fotot med personen.",
        "Att han nickade – det ser oprofessionellt ut."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "En kontroll på avstånd är en förevisning, inte en kontroll – förfalskningar avslöjas i handen, inte på en halvmeter. Håll, känn, vinkla, jämför: utan de fyra momenten är inpasseringen bara en artighet.",
      "tags": [
        "felsokning",
        "id_kontroll"
      ]
    },
    {
      "id": 292,
      "category": "felsokning",
      "categoryLabel": "Felsökning – hitta felet",
      "level": "fordjupning",
      "source": "v2",
      "title": "Springturen efter hjärtstartaren",
      "scenario": "En väktare hittar en livlös man som inte andas normalt. Han vet att en hjärtstartare finns 'någonstans åt kulverten till', springer ensam och letar i tre minuter, hittar den, springer tillbaka och startar först då HLR och ringer 112. Vilket var det allvarligaste felet?",
      "options": [
        "Att han hämtade hjärtstartaren över huvud taget.",
        "Att han sprang i kulverten – man går med hjärtstartare.",
        "Att han inte ringde 112 från kulverten.",
        "Att larm och kompressioner försenades: ensam startar man HLR och ringer 112 på högtalare omedelbart – hjärtstartaren hämtas själv bara om man vet exakt var den finns nära; tre minuters letande är trettio procents överlevnad bort."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Kedjan tål ingen lucka i början: varje minut utan kompressioner sänker chansen med tio procent. Osäker på var apparaten finns? Då är svaret händer på bröstet och telefon på högtalare – operatören vet ofta var närmaste hjärtstartare sitter.",
      "tags": [
        "felsokning",
        "sjukvard"
      ]
    },
    {
      "id": 293,
      "category": "felsokning",
      "categoryLabel": "Felsökning – hitta felet",
      "level": "fordjupning",
      "source": "v2",
      "title": "Rapporten som putsades",
      "scenario": "Efter ett stökigt ingripande väntar väktaren med rapporten till nästa kväll 'för att skriva i lugn och ro'. När klagomål sedan kommer in går han tillbaka in i dokumentet och lägger till detaljer om deeskaleringen med ursprungligt datum kvar. Vilket var det allvarligaste felet?",
      "options": [
        "Att han skrev om deeskaleringen – den är oväsentlig.",
        "Att han skrev rapporten på kvällstid.",
        "Att originalet ändrades i efterhand under gammalt datum: den sena rapporten var ett mindre fel, men den dolda efterhandsändringen förstör hela dokumentets bevisvärde – kompletteringar görs öppet i en ny, daterad anteckning.",
        "Att han lät klagomålet påverka honom känslomässigt."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "En sen rapport är svagare – en manipulerad är värdelös och komprometterande. Trovärdighetens regel är enkel: originalet rörs aldrig; det som saknas läggs till synligt, daterat och ärligt.",
      "tags": [
        "felsokning",
        "dokumentation"
      ]
    },
    {
      "id": 294,
      "category": "felsokning",
      "categoryLabel": "Felsökning – hitta felet",
      "level": "fordjupning",
      "source": "v2",
      "title": "Dörröppningen",
      "scenario": "En väktare deeskalerar skickligt en upprörd man: lugn röst, bekräftar känslan, erbjuder val. Under hela samtalet står han dock rakt framför mannen i den enda dörröppningen, en halvmeter ifrån. Mannen exploderar plötsligt och knuffar sig ut. Vilket var det allvarligaste felet?",
      "options": [
        "Positioneringen: rakt framför, på armlängds avstånd och blockerande motpartens enda utväg – en inträngd människa slåss, och avståndet gav ingen reaktionstid; orden var rätt men kroppen sa fälla.",
        "Att han bekräftade mannens känslor – det uppmuntrar.",
        "Att han erbjöd val – väktare ska ge order.",
        "Att han inte höjde rösten när mannen blev arg."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Deeskalering är ord plus geometri: bladad vinkel, ett par meters marginal och fria utvägar åt båda. Den bästa replik i världen hjälper inte den som byggt en bur av sin egen kropp.",
      "tags": [
        "felsokning",
        "egen_sakerhet"
      ]
    },
    {
      "id": 295,
      "category": "felsokning",
      "categoryLabel": "Felsökning – hitta felet",
      "level": "fordjupning",
      "source": "v2",
      "title": "Hissen går ju fortare",
      "scenario": "Vid ett brandlarm hjälper en väktare metodiskt människor mot utgångarna – men när en äldre dam med rullator tvekar vid trappan pekar han mot hissen: 'Ta den du, det går fortare.' Vilket var det allvarligaste felet?",
      "options": [
        "Att han hjälpte damen före de yngre.",
        "Att hissen anvisades vid brand: den kan stanna av strömbortfall eller styras till brandplanet och bli en fälla – rätt väg var trapphuset med hjälp, eller våningens utrymningsplats med besked till räddningsledaren.",
        "Att han pekade i stället för att leda henne.",
        "Att han lät henne behålla rullatorn."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Välviljan var äkta och misstaget klassiskt: hissen känns som hjälpen men kan bli kistan. Den som inte klarar trappan har en plats – utrymningsplatsen – och en livlina: att räddningsledaren vet exakt var hon väntar.",
      "tags": [
        "felsokning",
        "brand"
      ]
    },
    {
      "id": 296,
      "category": "felsokning",
      "categoryLabel": "Felsökning – hitta felet",
      "level": "fordjupning",
      "source": "v2",
      "title": "Plånboken i visitationen",
      "scenario": "Efter ett korrekt gripande skyddsvisiterar väktaren den gripne, hittar inga vapen – men fortsätter sedan igenom plånboken 'när jag ändå håller på' och antecknar namnet från körkortet till rapporten. Vilket var det allvarligaste felet?",
      "options": [
        "Att han antecknade till rapporten under pågående moment.",
        "Att han visiterade trots att mannen verkade ofarlig.",
        "Att han inte hittade några vapen.",
        "Att visitationens syfte överskreds: skyddsvisitationen söker vapen och farliga föremål av säkerhetsskäl – plånboken och identiteten är polisens område, och genomgången saknade lagstöd."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Lagstödet är ett smalt fönster, inte en öppen dörr: säkerheten motiverar sökandet efter vapen, ingenting mer. 'När jag ändå håller på' är exakt den glidning som förvandlar en laglig åtgärd till ett ofredande.",
      "tags": [
        "felsokning",
        "visitation"
      ]
    },
    {
      "id": 297,
      "category": "felsokning",
      "categoryLabel": "Felsökning – hitta felet",
      "level": "fordjupning",
      "source": "v2",
      "title": "Ut i kylan",
      "scenario": "En kraftigt berusad man avvisas från ett köpcentrum en kväll med sträng kyla. Väktaren följer honom korrekt till dörren, ser honom sätta sig på en bänk utomhus i bara en tunn tröja – och återgår till ronden: 'Inte mitt problem längre.' Vilket var det allvarligaste felet?",
      "options": [
        "Att omsorgsplikten släpptes vid dörren: en kraftigt berusad person i sträng kyla är en akut hälsorisk – hälsobedömning, fortsatt uppsikt och vid behov 112 eller polis hör till avvisningen, för nedkylning dödar den som inte märker att han fryser.",
        "Att mannen avvisades över huvud taget.",
        "Att väktaren följde honom ända till dörren.",
        "Att väktaren inte gav honom sin egen jacka."
      ],
      "correct": "A",
      "correctIndex": 0,
      "explanation": "Avvisningen var rätt – att sluta se människan var fel. Alkohol slår ut köldförsvaret, och bänken i minusgrader är en långsam nödsituation: ansvaret tar inte slut vid tröskeln, det byter bara form.",
      "tags": [
        "felsokning",
        "sjukvard"
      ]
    },
    {
      "id": 298,
      "category": "felsokning",
      "categoryLabel": "Felsökning – hitta felet",
      "level": "fordjupning",
      "source": "v2",
      "title": "Namnet i etern",
      "scenario": "Efter ett ingripande rapporterar väktaren snabbt och strukturerat över radion: mottagaranrop först, kort läge – och därefter målsägandens fullständiga namn och personnummer i klartext på den öppna kanalen. Vilket var det allvarligaste felet?",
      "options": [
        "Att rapporten var för kort för att vara användbar.",
        "Att han anropade mottagaren före sig själv.",
        "Att känsliga personuppgifter sändes i klartext på öppen kanal: radiotrafik kan avlyssnas, och tystnadsplikten gäller även i etern – identiteter lämnas via telefon eller enligt säker rutin.",
        "Att han rapporterade innan polisen anlänt."
      ],
      "correct": "C",
      "correctIndex": 2,
      "explanation": "Formen var perfekt och innehållet en läcka: den som lyssnar på kanalen fick just namn och nummer på ett brottsoffer. Radion bär läget – aldrig identiteterna; de går den skyddade vägen.",
      "tags": [
        "felsokning",
        "tystnadsplikt"
      ]
    },
    {
      "id": 299,
      "category": "felsokning",
      "categoryLabel": "Felsökning – hitta felet",
      "level": "fordjupning",
      "source": "v2",
      "title": "Slaget mot mobilen",
      "scenario": "En tonåring filmar provocerande nära ett pågående ingripande och kommenterar hånfullt. Väktaren, i övrigt korrekt, slår till slut undan mobilen så att den går i golvet. Vilket var det allvarligaste felet?",
      "options": [
        "Att han lät filmningen pågå så länge innan han agerade.",
        "Våldet mot en laglig handling: att filma på allmän plats är tillåtet, och slaget mot mobilen saknar varje lagstöd – det kan utgöra både ofredande och skadegörelse, och det är dessutom exakt det klipp provokatören ville ha.",
        "Att han inte beslagtog mobilen i stället.",
        "Att han inte ställde sig i vägen för kameran tidigare."
      ],
      "correct": "B",
      "correctIndex": 1,
      "explanation": "Provokationens hela affärsidé är att byta tre minuters hån mot en sekunds övertramp – och väktaren betalade fullpris. Filmning tåls, avstånd skapas, arbetet fortsätter: kameran är aldrig ett angrepp och mobilen aldrig ett lovligt mål.",
      "tags": [
        "felsokning",
        "bemotande"
      ]
    },
    {
      "id": 300,
      "category": "felsokning",
      "categoryLabel": "Felsökning – hitta felet",
      "level": "fordjupning",
      "source": "v2",
      "title": "Städningen vid staketet",
      "scenario": "En rondväktare hittar en pall med kopparkabel upplagd vid staketets insida och ett färskt hål i stängslet. Han bär prydligt tillbaka kabeln till upplaget, surrar provisoriskt igen hålet, och skriver en utförlig rapport till morgonen. Vilket var det allvarligaste felet?",
      "options": [
        "Att rapporten skrevs först till morgonen.",
        "Att han lagade hålet med fel material.",
        "Att han rörde kabeln utan handskar.",
        "Att han städade bort ett pågående brottsupplägg: uppläggningen skulle lämnats orörd och larmats direkt – nu är gärningsmännens spår hanterade, polisens chans till bar gärning vid hämtningen borta, och upptäckten röjd för den som återvänder i natt."
      ],
      "correct": "D",
      "correctIndex": 3,
      "explanation": "Ordningssinnet raderade brottsplatsen: kabeln var betet, hålet var dörren och natten var polisens fönster. Rätt drag var att röra ingenting, larma omgående och bevaka på avstånd – oordningen var själva bevisningen.",
      "tags": [
        "felsokning",
        "dokumentation"
      ]
    }
  ]
}
$vakt_scenario_json$::jsonb
);

insert into public.quiz_collections (
  id,
  label,
  description,
  question_kind,
  course_id,
  sort_order
) values (
  'scenario_quiz',
  'Scenario quiz',
  'Situationsbaserade frågor där eleven väljer lämplig åtgärd.',
  'scenario',
  'general',
  50
) on conflict (id) do update set
  label = excluded.label,
  description = excluded.description,
  question_kind = excluded.question_kind,
  course_id = excluded.course_id,
  sort_order = excluded.sort_order,
  is_active = true,
  updated_at = now();

with payload as (
  select data from vakt_scenario_seed_payload
),
scenarios as (
  select scenario.value as item
  from payload
  cross join jsonb_array_elements(payload.data -> 'scenarios') with ordinality as scenario(value, ordinality)
)
insert into public.quiz_questions (
  collection_id,
  external_id,
  question_kind,
  status,
  course_id,
  title,
  prompt,
  scenario_context,
  explanation,
  tags,
  source,
  source_reference,
  sort_order,
  metadata
)
select
  'scenario_quiz',
  'scenario:' || (item ->> 'id'),
  'scenario',
  'draft',
  'general',
  item ->> 'title',
  item ->> 'scenario',
  item ->> 'categoryLabel',
  item ->> 'explanation',
  array(
    select distinct tag
    from (
      select jsonb_array_elements_text(coalesce(item -> 'tags', '[]'::jsonb)) as tag
      union all select item ->> 'category'
      union all select item ->> 'level'
      union all select item ->> 'source'
    ) tags
    where tag is not null and tag <> ''
    order by tag
  ),
  item ->> 'source',
  'scenario:' || (item ->> 'id'),
  (item ->> 'id')::integer,
  jsonb_strip_nulls(jsonb_build_object(
    'original_id', (item ->> 'id')::integer,
    'category', item ->> 'category',
    'category_label', item ->> 'categoryLabel',
    'level', item ->> 'level',
    'source', item ->> 'source',
    'correct', item ->> 'correct',
    'correct_index', (item ->> 'correctIndex')::integer,
    'bank_name', payload.data -> 'meta' ->> 'name',
    'bank_version', payload.data -> 'meta' ->> 'version',
    'generated', payload.data -> 'meta' ->> 'generated'
  ))
from scenarios
cross join payload
on conflict (collection_id, external_id) do update set
  question_kind = excluded.question_kind,
  status = excluded.status,
  course_id = excluded.course_id,
  title = excluded.title,
  prompt = excluded.prompt,
  scenario_context = excluded.scenario_context,
  explanation = excluded.explanation,
  tags = excluded.tags,
  source = excluded.source,
  source_reference = excluded.source_reference,
  sort_order = excluded.sort_order,
  metadata = excluded.metadata,
  updated_at = now();

with payload as (
  select data from vakt_scenario_seed_payload
),
scenarios as (
  select scenario.value as item
  from payload
  cross join jsonb_array_elements(payload.data -> 'scenarios') with ordinality as scenario(value, ordinality)
),
options as (
  select
    questions.id as question_id,
    chr(64 + option.ordinality::integer) as label,
    option.value #>> '{}' as option_text,
    (option.ordinality::integer - 1) = (scenarios.item ->> 'correctIndex')::integer as is_correct,
    option.ordinality::integer as sort_order
  from scenarios
  join public.quiz_questions questions
    on questions.collection_id = 'scenario_quiz'
    and questions.external_id = 'scenario:' || (scenarios.item ->> 'id')
  cross join jsonb_array_elements(scenarios.item -> 'options') with ordinality as option(value, ordinality)
)
insert into public.quiz_answer_options (
  question_id,
  label,
  option_text,
  is_correct,
  sort_order
)
select
  question_id,
  label,
  option_text,
  is_correct,
  sort_order
from options
on conflict (question_id, label) do update set
  option_text = excluded.option_text,
  is_correct = excluded.is_correct,
  sort_order = excluded.sort_order,
  updated_at = now();

commit;
