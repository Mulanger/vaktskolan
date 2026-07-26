# Svenska bevakningsföretag – underlag till Arbetsgivare-fliken

Sammanställd 2026-07-26. Underlaget ligger till grund för `EMPLOYER_DIRECTORY` i `app.js`
(Karriärverktyget → Arbetsgivare), som utökades från 9 till 231 bolag samma dag.

**Skillnaden mot listan i appen:** 19 poster i tabellerna nedan kom inte med, eftersom de visade sig
vara dubbletter av varandra (samma varumärke och ort, samma webbplats, samma telefonnummer eller
samma besöksadress). Dedupliceringen och pagineringen beskrivs i `agent.md` under
*Arbetsgivarlistan utökad till 231 bolag med paginering*.

## Så här togs listan fram

Tre register slogs ihop, dubbletter togs bort på företagsnamn, och poster som inte är
bevakningsbolag rensades (privatpersoner, utbildningsföretag, parkeringsbolag,
hemlarms-, larmcentral- och säkerhetsteknikbolag). Källkoderna i sista kolumnen:

| Källkod | Källa | Vad den bidrar med |
| --- | --- | --- |
| `eniro-auk` | Eniros kategori *Bevakningsföretag – auktoriserade* | Namn, gatuadress, postnummer, ort, telefon |
| `eniro` | Eniros kategorier *Bevakningsföretag*, *Larm och bevakning*, *Ordningsvakt*, *Säkerhetsföretag* | Samma fält |
| `SäkB` | SäkerhetsBranschens medlemsregister | Namn, adress, telefon, webbplats |
| `SäkF` | Almega Säkerhetsföretagens medlemsregister | Namn och organisationsnummer |

E-post och webbplats är hämtade från respektive företags egen webbplats
(startsida + kontakt-/om-oss-sida). Där ingen adress kunde bekräftas står `N/A`.

Logga-kolumnen pekar på den bildfil företaget själv använder som logotyp – hämtad ur
`schema.org`-datan, en `<img>` med logo/logga i filnamnet, eller sidans apple-touch-icon.
Länkarna är alltså till bolagens egna servrar. Hotlänka dem inte i produktion: nuvarande
nio kort laddar logotyper lokalt från `assets/employers/<slug>.png`, nedskalade till max
120 px med `sharp`, och nya bolag bör följa samma mönster.

## Innan listan publiceras

- Uppgifterna är maskinellt insamlade 2026-07-26 och är inte manuellt ringda/mailade. Stäm av
  kontaktvägarna innan de går ut publikt – särskilt e-postadresserna, som ofta är
  kundtjänstadresser snarare än rekryteringsadresser (samma bedömning som redan gjordes
  för de nio nuvarande korten).
- Länsstyrelsen är den som auktoriserar bevakningsföretag men publicerar inget öppet
  register. Att ett bolag står med här är alltså inte ett bevis på gällande auktorisation.
- Flera poster är enmans- eller lokalbolag som sällan nyanställer. Vill ni bara visa
  bolag som rekryterar löpande, börja med de rikstäckande i tabellen nedan.
- Adressen är bolagets registrerade besöks-/postadress, inte nödvändigtvis den ort där
  jobben finns. Rikstäckande bolag har kontor på fler orter.

## Företag med kontaktuppgifter (236 st)

| Företag | Adress | Telefon | E-post | Hemsida | Logga | Källa |
| --- | --- | --- | --- | --- | --- | --- |
| 1Security AB | Batterivägen 14, 432 32 Varberg | 0340-187 77 | N/A | N/A | N/A | SäkF |
| 23 Bevakning AB | Järntorget 4, 413 04 Göteborg | N/A | N/A | N/A | N/A | eniro |
| 2Secure AB | Gustavslundsvägen 42, 167 51 Bromma | 08-656 50 00 | [info@2secure.se](mailto:info@2secure.se) | [2secure.se](https://2secure.se) | [png](https://2secure.se/data/media/2021/04/2Secure_logotype.png) | eniro, SäkB |
| 916 Svensk Spårsäkerhet, AB | Hallongatan 27, 298 33 Tollarp | 076-633 14 00 | N/A | N/A | N/A | eniro |
| Addici Security & Technology AB | Knarrarnäsgatan 7, 164 99 Kista | 010-559 50 90 | [info@addici.com](mailto:info@addici.com) | [www.addici.com](https://www.addici.com) | [svg](https://www.addici.se/globalassets/media/logos/addici/addici-logo-vertical.svg) | eniro-auk, eniro, SäkB |
| Aimo Bevakning AB | Förmansvägen 11, 117 59 Stockholm | 08-722 15 00 | N/A | N/A | N/A | eniro, SäkF |
| Alingsås Vaktbolag AB | Hemvägen 17E, 441 39 Alingsås | 0322-197 92 | [info@alingsas-vaktbolag.se](mailto:info@alingsas-vaktbolag.se) | [alingsas-vaktbolag.se](https://alingsas-vaktbolag.se) | [png](https://alingsas-vaktbolag.se/wp-content/uploads/2020/05/Logo322x105.png) | eniro-auk, SäkF |
| Alpha Bevakning AB | Fallängsvägen 13, 671 30 Arvika | N/A | N/A | N/A | N/A | eniro |
| Anna Security AB | Solbergsvägen 59B, 168 66 Bromma | 08-25 99 88 | N/A | [www.annasecurity.se](https://www.annasecurity.se) | [png](https://www.annasecurity.se/wp-content/uploads/2022/01/ANNA-Park-logga-mörkblå-1.png) | eniro |
| Apex Security AB | Köpmanstorget 1, 456 31 Kungshamn | 010-682 23 50 | [info@apexsecurity.se](mailto:info@apexsecurity.se) | [apexsecurity.se](https://apexsecurity.se) | N/A | SäkF |
| Argus Security Handelsbolag | Sundstorget 2, 252 21 Helsingborg | 010-214 66 40 | [info@argussecurity.se](mailto:info@argussecurity.se) | [argussecurity.se](https://argussecurity.se) | [png](https://i0.wp.com/argussecurity.se/wp-content/uploads/2023/08/cropped-Argus-Security-logo-med-vit-kant-overst.png?fit=253%2C250&ssl=1) | SäkF |
| Argus Vakt AB | Linnégatan 6, 114 47 Stockholm | 031-12 62 03 | N/A | N/A | N/A | eniro-auk |
| Arm Bevakning AB | Harpsundsvägen 82B, 124 58 Bandhagen | N/A | N/A | N/A | N/A | eniro |
| Armins Elitbevakning AB | Ekholmsvägen 245, 127 46 Skärholmen | N/A | N/A | N/A | N/A | eniro |
| Atlas Bevakning AB | A Odhners gata 43, 421 30 Västra Frölunda | N/A | N/A | N/A | N/A | eniro |
| Aurora Säkerhet AB | Hagtorpsvägen 19, 754 71 Uppsala | 08-121 377 07 | N/A | N/A | N/A | eniro-auk |
| Avarn Security AB | Västberga allé 11, 126 30 Hägersten | 010-210 95 00 | [vi.hjalper.dig@avarnsecurity.com](mailto:vi.hjalper.dig@avarnsecurity.com) | [www.avarnsecurity.com](https://www.avarnsecurity.com) | [png](https://www.avarnsecurity.com/globalassets/imagevault/avarn-security-konsern/profil-og-logo/avarn-favicon.png?width=192&height=192&rmode=Crop&rxy=0.50,0.50&h=a66a5cee5464769a4ac89d2de3d257cb4c2c1f008b0eb831e66e79e6281908f9) | eniro-auk, eniro, SäkB |
| Aventra Bevakning AB | Tallvägen 14, 233 76 Klågerup | 073-344 79 00 | N/A | N/A | N/A | eniro-auk, SäkF |
| Avn Bevakning | Östra Midvintersgatan 19, 415 42 Göteborg | N/A | N/A | N/A | N/A | eniro |
| Behovia Tjänster HB | Morsarvet 1, 179 96 Svartsjö | 073-663 06 22 | N/A | N/A | N/A | eniro-auk |
| Bertil Jarnemyr AB | Hermelinsvägen 4, 146 38 Tullinge | 070-719 29 03 | N/A | N/A | N/A | eniro-auk |
| Bevakning & Säkerhet I Väst AB | Solgårdsgatan 4C, 412 64 Göteborg | N/A | N/A | N/A | N/A | eniro |
| Bevaknings AB Prevendo | Solhagavägen 28, 184 63 Åkersberga | 070-854 02 46 | N/A | N/A | N/A | eniro-auk, SäkF |
| Bevakningsaktiebolaget Företagsskydd | Svartövägen 22, 974 37 Luleå | 0920-920 00 | N/A | N/A | N/A | eniro-auk |
| Bevakningspoolen I Östhammar AB | Gammelbygatan 22, 742 34 Östhammar | 0173-500 57 | [info@bevakningspoolen.se](mailto:info@bevakningspoolen.se) | [bevakningspoolen.se](https://bevakningspoolen.se) | N/A | eniro-auk, SäkF |
| Bevakningsskydd I Hässleholm AB | Logementsvägen 4, 281 56 Hässleholm | 0451-800 50 | [info@bevakningsskydd.se](mailto:info@bevakningsskydd.se) | [www.bevakningsskydd.se](https://www.bevakningsskydd.se) | [jpg](https://usercontent.one/wp/www.bevakningsskydd.se/wp-content/uploads/2021/08/loggan.jpg) | eniro-auk, SäkB, SäkF |
| Bevakningstjänst Nordisk Security AB | Skeppargatan 57, 114 59 Stockholm | N/A | N/A | N/A | N/A | SäkF |
| BK Gruppen AB | Bergvägen 5, 649 30 Sparreholm | 010-200 78 78 | [info@bkgruppen.se](mailto:info@bkgruppen.se) | [www.bkgruppen.se](https://www.bkgruppen.se) | [png](https://www.bkgruppen.se/wp-content/uploads/2024/03/BKGRUPPEN-security-sv-rod-1.png) | eniro-auk |
| Bol Säkerhet AB | Träffgatan 2, 136 44 Handen | 08-742 07 69 | [info@bol-sakerhet.se](mailto:info@bol-sakerhet.se) | [www.bol-sakerhet.se](https://www.bol-sakerhet.se) | [png](https://www.bol-sakerhet.se/wp-content/uploads/bol-sakerhet-logo-2019-2x.png) | eniro-auk, SäkB |
| Capricorn Security AB | Löjtnantsgatan 14, 115 50 Stockholm | 070-755 62 75 | N/A | N/A | N/A | eniro-auk |
| CB Eventsäkerhet AB | Södra Förstadsgatan 26, 211 43 Malmö | 073-325 25 04 | N/A | N/A | N/A | eniro-auk |
| Citadel Group Security AB | Kvarnhagsvägen 75, 145 60 Norsborg | N/A | N/A | N/A | N/A | eniro |
| City Security Sweden AB | N/A | 031-761 51 00 | N/A | N/A | N/A | eniro |
| CityBevakning Sverige AB | Nobelvägen 147E, 212 15 Malmö | 010-210 22 80 | N/A | [www.citybevakning.se](https://www.citybevakning.se) | [png](https://static.wixstatic.com/media/49ed6d_1374c17d203e4627a41fc313f7fca561%7Emv2.png/v1/fill/w_180%2Ch_180%2Clg_1%2Cusm_0.66_1.00_0.01/49ed6d_1374c17d203e4627a41fc313f7fca561%7Emv2.png) | eniro |
| Commando Security AB | Norra Skeppspromenaden 14, 417 60 Göteborg | N/A | N/A | N/A | N/A | eniro |
| Commuter Security Group AB | Finlandsgatan 60, 164 74 Kista | 08-410 147 00 | [info@csgab.se](mailto:info@csgab.se) | [csgab.se](https://csgab.se) | [png](https://csgab.se/wp-content/themes/csg/images/csg-logo-banner-small.png) | eniro-auk |
| Cpg Bevakning Sverige AB | J A Wettergrens gata 14, 421 30 Västra Frölunda | 031-762 86 00 | [info@cpgbevakning.se](mailto:info@cpgbevakning.se) | [cpgbevakning.se](https://cpgbevakning.se) | [png](https://cpgbevakning.se/wp-content/uploads/2025/05/cropped-CPG_Bevakning-180x180.png) | eniro, SäkB |
| Creab Säkerhet AB | Ölandsgatan 5, 371 33 Karlskrona | 077-112 41 24 | N/A | N/A | N/A | eniro |
| Crewsec AB | Strandvägen 67, 115 23 Stockholm | 010-707 97 59 | [kontakt@crewsec.se](mailto:kontakt@crewsec.se) | [crewsec.se](https://crewsec.se) | [png](https://crewsec.se/wp-content/uploads/2026/01/crewsec-ab-brand-logo.png) | eniro |
| CubAB KB | Säbygatan 25, 753 23 Uppsala | 018-69 33 30 | N/A | N/A | N/A | eniro-auk |
| Cubsec AB | Hemvärnsgatan 15 plan 7, 171 54 Solna | 0771-761 900 | [kundservice@cubsec.se](mailto:kundservice@cubsec.se) | [www.cubsec.se](https://www.cubsec.se) | [png](https://cubsec.se/assets/img/favicon-cubsec.8750d3216683261075ce8eec97b765d1.png) | eniro, SäkF |
| Cubsec Bevakning AB | Hemvärnsgatan 17, 171 54 Solna | 077-176 19 00 | [info@cubsecalarm.se](mailto:info@cubsecalarm.se) | [cubsec.se](https://cubsec.se) | [png](https://cubsec.se/assets/img/favicon-cubsec.8750d3216683261075ce8eec97b765d1.png) | eniro-auk, SäkB |
| Dala Bevakningsservice AB | Lomtorpet 23, 783 90 Säter | 010-750 07 02 | [info@dalabevakningsservice.se](mailto:info@dalabevakningsservice.se) | [dalabevakningsservice.se](https://dalabevakningsservice.se) | [png](https://impro.usercontent.one/appid/oneComWsb/domain/dalabevakningsservice.se/media/dalabevakningsservice.se/onewebmedia/S%C3%A4kerhet%20&%20Trygghet%203.png?withoutEnlargement&resize=96,29) | eniro |
| Defencia Bevakning AB | Björnänge 825, 837 97 Åre | 0647-510 00 | [kontakt@defencia.se](mailto:kontakt@defencia.se) | [defencia.se](https://defencia.se) | [png](https://defencia.se/wp-content/uploads/2026/05/defencia_logo_two.png) | eniro, SäkB, SäkF |
| Defencia Service AB | Björnänge 825, 837 97 Åre | 010-510 50 00 | [kontakt@defencia.se](mailto:kontakt@defencia.se) | [defencia.se](https://defencia.se) | [png](https://defencia.se/wp-content/uploads/2026/05/defencia_logo_two.png) | eniro |
| DS Bevakning AB | Månskärsvägen 10B, 141 75 Kungens Kurva | 08-123 505 55 | N/A | [dsbevakning.se](https://dsbevakning.se) | [png](https://dsbevakning.se/wp-content/themes/bevakning/images/favicon-57x57.png) | eniro, SäkF |
| Eagle Security, AB | Sparbanksvägen 9, 129 32 Hägersten | 070-679 67 97 | [info@eaglesecurity.se](mailto:info@eaglesecurity.se) | [www.eaglesecurity.se](https://www.eaglesecurity.se) | [png](https://www.eaglesecurity.se/wp-content/uploads/2025/02/cropped-siteicon-1-180x180.png) | eniro-auk |
| Earthart Business Protection Agency | Malmskillnadsgatan 44, 111 57 Stockholm | 08-400 215 70 | [contact@earhart.se](mailto:contact@earhart.se) | [earhart.se](https://earhart.se) | [png](https://impro.usercontent.one/appid/oneComWsb/domain/earhart.se/media/earhart.se/onewebmedia/website_logo_transparent_background_%20Klippt.png?withoutEnlargement&resize=31,29) | SäkB |
| EGAB Bevakning AB | Knådavägen 74, 828 94 Edsbyn | 0271-23330 | [info@egabbevakning.se](mailto:info@egabbevakning.se) | [egabbevakning.se](https://egabbevakning.se) | [png](https://files.builder.misssite.com/9b/28/9b28e9c4-14c5-43e8-bf1d-3f2aa3aeaa76.png) | SäkB, SäkF |
| Ek's Vakthundar AB | Badvägen 10, 264 34 Klippan | 070-785 44 00 | [info@eksvakthundar.se](mailto:info@eksvakthundar.se) | [eksvakthundar.se](https://eksvakthundar.se) | N/A | eniro-auk |
| Elite Service & Security Stockholm AB | Älvsjö stationsgata 4, 125 31 Älvsjö | N/A | N/A | N/A | N/A | eniro |
| Englavakt Bevakning AB | Trastvägen 23, 227 29 Lund | 046-32 40 60 | N/A | N/A | N/A | eniro-auk |
| Ensec AB | Löfströms allé 2E, 172 61 Sundbyberg | 073-505 02 52 | [info@ensec.se](mailto:info@ensec.se) | [ensec.se](https://ensec.se) | [png](https://ensec.se/cdn/shop/t/3/assets/ensec-logo.png?v=27363830151634616421778695258) | eniro |
| Epok:S Vaktservice | Skogslundsvägen 11, 574 34 Vetlanda | N/A | N/A | N/A | N/A | eniro-auk |
| Eps Bevakning AB | Årstaängsvägen 21B, 117 60 Stockholm | 08-556 306 70 | N/A | N/A | N/A | eniro, SäkF |
| Event Security AB | Löfströms allé 5, 172 66 Sundbyberg | 08-624 05 80 | N/A | N/A | N/A | eniro-auk |
| Executive Security Sweden AB | Linnégatan 50, 114 54 Stockholm | N/A | N/A | N/A | N/A | eniro |
| Exista Säkerhet AB | Banvaktsvägen 12, 171 48 Solna | 08-7392900 | [info@exista.se](mailto:info@exista.se) | [www.exista.se](https://www.exista.se) | [png](https://www.exista.se/wp-content/uploads/2021/06/Lager-2.png) | SäkB |
| F.D Security AB | Långströmsgatan 36C, 418 70 Göteborg | N/A | N/A | N/A | N/A | eniro |
| Fair Security Scandinavia AB | Sedelvägen 12, 129 32 Hägersten | N/A | N/A | N/A | N/A | eniro |
| Fairdeal Group Sverige AB | Virkesvägen 10, 120 30 Stockholm | 08-452 04 90 | N/A | N/A | N/A | eniro-auk |
| Falbygdens Bevaknings AB | Torggatan 56, 534 50 Vara | 0512-222 00 | N/A | N/A | N/A | eniro-auk, SäkF |
| Focus Security AB | Övre Husargatan 19, 413 14 Göteborg | 073-508 23 29 | N/A | N/A | N/A | eniro |
| Fortify Security Sverige AB | Sankt Eriksgatan 63B, 112 34 Stockholm | 070-685 83 87 | N/A | N/A | N/A | eniro |
| Fyrstads Säkerhetsservice AB | Kungsgatan 13, 451 30 Uddevalla | 0522-191 90 | N/A | N/A | N/A | eniro-auk, SäkF |
| Föreningen Ordningsvakterna C4 | Hemvärnsvägen 1, 291 63 Kristianstad | N/A | N/A | N/A | N/A | eniro |
| Gateeas Security AB | Sågverksgatan 5, 652 21 Karlstad | 054-53 66 01 | N/A | N/A | N/A | SäkF |
| Gdr Security Group AB | Cypressvägen 12, 213 63 Malmö | 040-97 09 07 | [info@gdr.se](mailto:info@gdr.se) | [www.gdr.se](https://www.gdr.se) | N/A | eniro, SäkF |
| Gefle-Vakt AB | Forskarvägen 21, 804 23 Gävle | 073-046 56 45 | [info@geflevakt.se](mailto:info@geflevakt.se) | [geflevakt.se](https://geflevakt.se) | N/A | SäkF |
| Global Security IPS AB | Kungsporten 6C, 427 50 Billdal | 031-2070779 | [info@globalsecurity.se](mailto:info@globalsecurity.se) | [www.globalsecurity.se](https://www.globalsecurity.se) | [jpg](https://static.wixstatic.com/media/de2f18_f27c104025a04439abe5f00b87c6b825%7Emv2.jpg/v1/fill/w_180%2Ch_180%2Clg_1%2Cusm_0.66_1.00_0.01/de2f18_f27c104025a04439abe5f00b87c6b825%7Emv2.jpg) | SäkB |
| Gotsec Säkerhet & Utbildning | Säljåsbacken 3, 437 93 Lindome | N/A | N/A | N/A | N/A | SäkF |
| Grand Bevakning AB | Varuvägen 9, 125 30 Älvsjö | 08-410 457 70 | N/A | [grandbevakning.se](https://grandbevakning.se) | N/A | SäkF |
| Great Security Holding AB | Vagnvägen 16C, 432 32 Varberg | 0340-64 58 00 | [info@greatsecurity.se](mailto:info@greatsecurity.se) | [greatsecurity.se](https://greatsecurity.se) | [png](https://greatsecurity.se/wp-content/uploads/2024/04/GS-logotype-black.png) | eniro, SäkF |
| Gripen Bevakning AB | Jägersrovägen 160, 212 37 Malmö | 070-419 60 80 | N/A | N/A | N/A | eniro |
| Grupplarm AB | Björkhemsvägen 25, 291 54 Kristianstad | 044-10 38 50 | [info@grupplarm.se](mailto:info@grupplarm.se) | [www.grupplarm.se](https://www.grupplarm.se) | [png](https://cdn.yourvismawebsite.com/img/03/3d2a46c5-661f-4661-895c-1d64544aaedd/57/57/true) | eniro-auk, SäkF |
| GSV Security AB | Rissneleden 110, 174 57 Sundbyberg | 077-022 05 99 | N/A | [www.gsvsecurity.se](https://www.gsvsecurity.se) | [png](https://static.wixstatic.com/media/793f67_2e59fb1555ca414dbe55be3355527999%7Emv2.png/v1/fill/w_180%2Ch_180%2Clg_1%2Cusm_0.66_1.00_0.01/793f67_2e59fb1555ca414dbe55be3355527999%7Emv2.png) | SäkF |
| Gävleborgs Bevakning AB | N/A | 026-25 25 80 | N/A | N/A | N/A | SäkF |
| Hallstavik Bevakning Ek. För. | Lundåsvägen 6, 763 30 Hallstavik | 070-810 10 99 | N/A | N/A | N/A | eniro-auk |
| Handelsbevakning Sverige AB | Alströmergatan 51, 112 47 Stockholm | 010-174 08 00 | [info@handelsbevakning.com](mailto:info@handelsbevakning.com) | [handelsbevakning.com](https://handelsbevakning.com) | [png](https://handelsbevakning.com/wp-content/uploads/ny-logga.png) | eniro, SäkF |
| Helsingborgs Beskydd & Bevakning AB | Fjällugglegatan 9, 254 50 Helsingborg | N/A | N/A | N/A | N/A | eniro |
| HIGH Security Stockholm AB | Sparbanksvägen 10, 129 32 Hägersten | 08-68459600 | [info@highsecurity.se](mailto:info@highsecurity.se) | [www.highsecurity.se](https://www.highsecurity.se) | [png](https://www.highsecurity.se/wp-content/uploads/fbrfg/apple-touch-icon.png) | SäkB |
| Hometec Security Gbg AB | Johannas väg 5, 512 91 Sexdrega | 031-755 49 00 | N/A | N/A | N/A | SäkF |
| Honk & Sandström Säkerhetsbemanning AB | Bulyckevägen 5, 418 78 Göteborg | N/A | N/A | N/A | N/A | eniro |
| I-SEC Sweden Aviation Security AB | Fraktvägen 45B, 190 60 Stockholm-Arlanda | 010-185 00 00 | N/A | N/A | N/A | eniro, SäkF |
| Imperium Security AB | Övralidsgatan 25, 422 47 Hisings Backa | N/A | [info@imperiumsecurity.se](mailto:info@imperiumsecurity.se) | [imperiumsecurity.se](https://imperiumsecurity.se) | [png](https://impro.usercontent.one/appid/oneComWsb/domain/imperiumsecurity.se/media/imperiumsecurity.se/onewebmedia/Imperiumorange___serialized1.png?withoutEnlargement&resize=59,29) | eniro |
| Ipatrol Security AB | Industrivägen 4, 449 44 Nol | 030-323 30 00 | [info@ipatrol.se](mailto:info@ipatrol.se) | [ipatrol.se](https://ipatrol.se) | [svg](https://ipatrol.se/wp-content/themes/ipatrol/assets/img/logo.svg) | SäkF |
| JB Bevakning AB | Kungsgatan 32, 285 31 Markaryd | 0433-732 00 | [info@jbbevakning.se](mailto:info@jbbevakning.se) | [jbbevakning.se](https://jbbevakning.se) | [png](https://impro.usercontent.one/appid/oneComWsb/domain/jbbevakning.se/media/jbbevakning.se/onewebmedia/JB%20BEVAKNING%20LOGO.png?withoutEnlargement&resize=72,29) | SäkF |
| Je Larm & Bevakning I Uppland AB | Gesällgatan 15, 745 39 Enköping | 0171-61 91 61 | N/A | N/A | N/A | eniro |
| Jesa Security AB | Klockarevägen 12B, 449 30 Nödinge | 031-12 86 95 | [info@jesasecurity.com](mailto:info@jesasecurity.com) | [jesasecurity.com](https://jesasecurity.com) | [png](https://jesasecurity.com/content/themes/wakefield/img/logo.png) | eniro-auk |
| Jj Säkerhet & Event, AB | Åsvägen 96, 836 71 Ås | 070-666 89 90 | N/A | N/A | N/A | eniro |
| Jonsson & Sewerin AB | Hantverksvägen 16, 355 73 Gemla | 070-676 77 70 | N/A | N/A | N/A | eniro-auk |
| Jv Bevakning | Lärkvägen 6, 903 54 Umeå | 070-679 26 54 | N/A | N/A | N/A | eniro-auk |
| K9-Security Dalarna | Granåsvägen 13, 775 50 Krylbo | N/A | N/A | N/A | N/A | eniro |
| KeyLink AB | Box 79, 592 22 Vadstena | 08-55667770 | [info@keylink.se](mailto:info@keylink.se) | [www.keylink.se](https://www.keylink.se) | [png](https://impro.usercontent.one/appid/oneComWsb/domain/keylink.se/media/keylink.se/onewebmedia/WWW-2017-Logo.png?etag=%227e41-58cbec6f%22&sourceContentType=image%2Fpng&resize=57,57&ignoreAspectRatio) | SäkB |
| Kilsmotorp AB | Kaptensgatan 6, 114 57 Stockholm | 08-753 08 46 | N/A | N/A | N/A | eniro-auk |
| Kinds Vakt AB | Boråsvägen 7, 512 53 Svenljunga | 070-592 77 06 | N/A | [kindsvakt.se](https://kindsvakt.se) | [svg](https://kindsvakt.se/wp-content/uploads/2025/06/logo_dark.svg) | eniro-auk, SäkB, SäkF |
| Kroon Security AB | Maskinvägen 1, 227 30 Lund | 046-12 70 95 | [info@kroonsecurity.se](mailto:info@kroonsecurity.se) | [kroonsecurity.se](https://kroonsecurity.se) | [webp](https://kroonsecurity.se/wp-content/uploads/2025/11/site_logo-kroon_security_lund.webp) | eniro, SäkF |
| La Jour och Säkerhet AB | Malmgatan 16, 602 23 Norrköping | 010-207 03 00 | N/A | N/A | N/A | SäkF |
| Larm Assistans Sverige AB | N/A | 090-19460 | [info@larmassistans.se](mailto:info@larmassistans.se) | [www.larmassistans.se](https://www.larmassistans.se) | [ico](https://static.parastorage.com/client/pfavico.ico) | SäkF |
| Larm O Bevakning Norr AB | Topasvägen 10, 282 32 Tyringe | 070-844 55 78 | N/A | N/A | N/A | eniro-auk |
| Linnovation AB | Servicegatan 27, 931 76 Skellefteå | 070-611 61 95 | [info@linnovation.se](mailto:info@linnovation.se) | [linnovation.se](https://linnovation.se) | [png](https://linnovation.se/wp-content/uploads/2020/07/linnovation-logo.png) | eniro-auk |
| Lokala Vakten AB | Storgatan 28, 334 32 Anderstorp | 0371-185 55 | [info@lokalavakten.se](mailto:info@lokalavakten.se) | [lokalavakten.se](https://lokalavakten.se) | [jpg](https://lokalavakten.se/wp-content/uploads/2017/03/cropped-logofav-180x180.jpg) | eniro-auk, SäkF |
| Loomis Sverige AB | Staffans Väg 2, 192 78 Sollentuna | 010-163 63 00 | N/A | [se.loomis.com](https://se.loomis.com) | [svg](https://se.loomis.com/assets/loomis//static/logo.svg) | eniro, SäkF |
| Lykil Säkerhet AB | Mått Johanssons Väg 7, 633 46 Eskilstuna | 016-170150 | [info@lykil.se](mailto:info@lykil.se) | [www.lykil.se](https://www.lykil.se) | [png](https://www.lykil.se/wp-content/uploads/2024/09/LYKIL-Symbols-under.png) | SäkB |
| Lövestad Larmcentral AB | Södergatan 18, 275 75 Lövestad | 020-40 80 00 | [larmcentralen@lovestadlarmcentral.se](mailto:larmcentralen@lovestadlarmcentral.se) | [lovestadlarmcentral.se](https://lovestadlarmcentral.se) | [png](https://lovestadlarmcentral.se/wp-content/uploads/2025/11/lovestad-logo-mork-tekst.png) | eniro-auk, SäkF |
| Majosec Bevakning AB | Silkesvägen 19, 331 53 Värnamo | 010-252 91 39 | [info@majosecbevakning.se](mailto:info@majosecbevakning.se) | [www.majosecbevakning.se](https://www.majosecbevakning.se) | [png](https://static.wixstatic.com/media/b8e25e_9f97e3044ebb4da0b70730efe573db39%7Emv2.png/v1/fill/w_180%2Ch_180%2Clg_1%2Cusm_0.66_1.00_0.01/b8e25e_9f97e3044ebb4da0b70730efe573db39%7Emv2.png) | eniro |
| Malmö Industrivakter AB | Storgatan 24, 261 29 Landskrona | 020-82 30 00 | N/A | N/A | N/A | eniro-auk, SäkF |
| Malung Sälen Vakt & Service AB | Skolgatan 6, 782 30 Malung | 070-380 01 12 | N/A | N/A | N/A | eniro-auk |
| Manison AB | Sjöflygvägen 35, 183 62 Täby | 08-544 705 40 | N/A | N/A | N/A | eniro-auk |
| Maribo Security AB | Tråkärrsslättvägen 74, 427 50 Billdal | 070-686 10 18 | N/A | N/A | N/A | eniro-auk |
| Mektex & Bevakning | Sisjöbäckens Väg 31, 436 38 Askim | N/A | N/A | N/A | N/A | eniro |
| Mk Bevakningstjänst AB | Theres Svenssons gata 15, 417 55 Göteborg | N/A | N/A | N/A | N/A | eniro |
| Monitor Larm & Bevakning I Göteborg AB | Gullbergs strandgata 36A, 411 04 Göteborg | 031-63 65 00 | N/A | N/A | N/A | eniro |
| Msec - Maribo Security AB | Tråkärrsslättvägen 74, 427 50 Billdal | 031-91 20 47 | N/A | N/A | N/A | eniro |
| Nokas Värdehantering AB | Västberga Allé 11, 126 30 Hägersten | 010-222 60 00 | N/A | [www.nokas.se](https://www.nokas.se) | [png](https://www.nokas.se/Static/gfx/nokas-logo-negative-full@2x.png) | SäkF |
| Nord Security Bevakning | Stenvägen 10, 952 31 Kalix | 073-028 04 91 | N/A | N/A | N/A | eniro-auk |
| Nordisk Elitbevakning AB | Grånestad 4, 605 93 Norrköping | N/A | N/A | N/A | N/A | eniro |
| Nordisk Skydd AB | Måttbandsvägen 12, 187 66 Täby | 08-87 00 00 | [info@nordiskskydd.se](mailto:info@nordiskskydd.se) | [nordiskskydd.se](https://nordiskskydd.se) | [png](https://nordiskskydd.se/wp-content/uploads/2025/05/logonordisk.png) | eniro, SäkF |
| Nordiska Säkerhetsnätet AB | Rådjursgatan 3, 722 42 Västerås | 021-14 47 70 | N/A | N/A | N/A | eniro-auk |
| Northern Fire AB | Hökegatan 16, 416 66 Göteborg | 070-565 21 87 | N/A | N/A | N/A | eniro-auk |
| Northern Protection Group AB | Sjösavägen 1A, 124 55 Bandhagen | 08-24 57 40 | N/A | N/A | N/A | eniro |
| Novasec AB | N/A | 08-23 62 36 | N/A | [www.novasec.se](https://www.novasec.se) | [png](https://static.wixstatic.com/media/d6ed27_7ea8f67b307c46da8e54adb61991009c~mv2.png) | eniro |
| Np-Bevakning | Lodjursstråket 1, 417 51 Göteborg | N/A | N/A | N/A | N/A | eniro |
| Nvss Security AB | Sjöflygvägen 35C-D, 183 62 Täby | 08-122 040 20 | N/A | [NVSS.se](https://NVSS.se) | N/A | eniro, SäkB |
| Nya Gotlands Vaktbolag | N/A | 0498-27 72 00 | N/A | N/A | N/A | eniro-auk |
| Orca Security AB | Göteborgsvägen 23, 443 30 Lerum | 070-773 06 06 | [info@orcasecurity.se](mailto:info@orcasecurity.se) | [www.orcasecurity.se](https://www.orcasecurity.se) | [png](https://www.orcasecurity.se/wp-content/uploads/2019/02/logo-orca-security-footer.png) | eniro-auk, SäkF |
| Orion säkerhet AB | Stagneliusvägen 43, 112 57 Stockholm | 08-88 10 10 | N/A | N/A | N/A | SäkF |
| Oxaros AB | Krondammsvägen 67, 433 43 Partille | 072-317 22 39 | N/A | N/A | N/A | eniro-auk |
| P.H Säkerhet & Äventyr AB | Sandhamnsgatan 75A, 115 28 Stockholm | N/A | N/A | N/A | N/A | eniro |
| Paratus Security AB | Artillerigatan 44, 114 45 Stockholm | 08-665 00 06 | N/A | [paratussecurity.se](https://paratussecurity.se) | [png](https://paratussecurity.se/wp-content/uploads/2024/03/Paratus_logo.png) | eniro |
| PD Bevakning AB | Hagvägen 18, 831 48 Östersund | 070-323 85 85 | N/A | [pdbevakning.se](https://pdbevakning.se) | [gif](https://pdbevakning.se/bilder/loggasos.gif) | eniro-auk, SäkF |
| Peak Security AB | Högbergsgatan 83, 118 54 Stockholm | 070-845 55 10 | [info@peaksecurity.se](mailto:info@peaksecurity.se) | [peaksecurity.se](https://peaksecurity.se) | N/A | eniro |
| Plan B Bevakning, AB | Datavägen 12B, 436 32 Askim | 054-21 41 00 | N/A | [www.planbbevakning.se](https://www.planbbevakning.se) | N/A | eniro, SäkB, SäkF |
| Premisec AB | Västergöksvägen 119, 162 71 Vällingby | N/A | [info@premisec.se](mailto:info@premisec.se) | [premisec.se](https://premisec.se) | N/A | eniro |
| PreSäkra AB | Höjdrodergatan 23, 212 39 Malmö | 020-51 25 00 | [info@presakra.se](mailto:info@presakra.se) | [www.presakra.se](https://www.presakra.se) | [svg](https://www.presakra.se/wp-content/uploads/2026/05/PreSakra-ny-logo-black-text.svg) | eniro |
| Prevaka Security AB | Lagervägen 4, 200 39 Malmö | 040-611 69 00 | [info@prevaka.se](mailto:info@prevaka.se) | [prevaka.se](https://prevaka.se) | [png](https://usercontent.one/wp/prevaka.se/wp-content/uploads/2024/01/prevaka-logo-1-150x150-1.png?media=1741856936) | SäkF |
| Prevent Bevakning AB | Munkerödsvägen 7, 444 32 Stenungsund | 0303-945 94 | N/A | N/A | N/A | eniro, SäkF |
| PRISMA Security AB | Herkulesgatan 17, 111 52 Stockholm | 010-211 58 00 | [info@prismasecurity.se](mailto:info@prismasecurity.se) | [www.prismasecurity.se](https://www.prismasecurity.se) | [png](https://static.wixstatic.com/media/28edab_1b0c7a7a018b4ecbb5ce9527b6d8bc62%7Emv2.png/v1/fill/w_180%2Ch_180%2Clg_1%2Cusm_0.66_1.00_0.01/28edab_1b0c7a7a018b4ecbb5ce9527b6d8bc62%7Emv2.png) | eniro-auk, SäkF |
| Proaktiv Säkerhet Götaland AB | Andréevägen 29, 554 66 Jönköping | 076-785 34 33 | [evert@proaktiv.nu](mailto:evert@proaktiv.nu) | [proaktiv.nu](https://proaktiv.nu) | [png](https://impro.usercontent.one/appid/oneComWsb/domain/proaktiv.nu/media/proaktiv.nu/onewebmedia/Logga%20ProaktivS%C3%A4kerhet_Bara%20text_en%20rad%20_Orange.png?withoutEnlargement&resize=181,29) | eniro, SäkB |
| Proaktiv Säkerhet i Sverige AB | Vendevägen 89, 182 32 Danderyd | 010-5511941 | [info@prosecurity.se](mailto:info@prosecurity.se) | [prosecurity.se](https://prosecurity.se) | [png](https://prosecurity.se/wp-content/uploads/2023/10/Pro-Security-logga-Bla-Rott-strack-Outline.png) | SäkB |
| Professionell Säkerhet i Skåne AB | Hävertgatan 29, 254 42 Helsingborg | 010-5500100 | N/A | [professionellsakerhet.se](https://professionellsakerhet.se) | [png](https://professionellsakerhet.se/wp-content/uploads/2020/04/cropped-Prosak_webb_logo_Rityta-1-180x180.png) | SäkB |
| Professionell Säkerhet i Stockholm AB | Mangårdsgatan 65D, 256 67 Helsingborg | 010-550 01 00 | N/A | [professionellsakerhet.se](https://professionellsakerhet.se) | [png](https://professionellsakerhet.se/wp-content/uploads/2020/04/cropped-Prosak_webb_logo_Rityta-1-180x180.png) | SäkF |
| Proguard Vaktservice AB | Ängesvägen 1B, 931 39 Skellefteå | 070-296 28 05 | [info@proguardvaktservice.se](mailto:info@proguardvaktservice.se) | [www.proguardvaktservice.se](https://www.proguardvaktservice.se) | [png](https://www.proguardvaktservice.se/assets/images/site_logo.png) | eniro |
| Promota Security AB | Björkholmsvägen 10, 141 46 Huddinge | 08-744 10 61 | [info@promota.se](mailto:info@promota.se) | [promota.se](https://promota.se) | [jpg](https://promota.se/wp-content/uploads/2024/09/Promotahog1-300x83-1.jpg) | eniro-auk, SäkF |
| Promota Security Handelssäkerhet AB | Jakobsdalsvägen 13, 126 53 Hägersten | 08-744 42 20 | [info@promota.se](mailto:info@promota.se) | [promota.se](https://promota.se) | [jpg](https://promota.se/wp-content/uploads/2024/09/Promotahog1-300x83-1.jpg) | eniro-auk |
| ProSecurity Sweden AB | Stormbyvägen 2-4, 163 55 Spånga | 010-551 19 40 | [info@prosecurity.se](mailto:info@prosecurity.se) | [prosecurity.se](https://prosecurity.se) | [png](https://prosecurity.se/wp-content/uploads/2023/10/Pro-Security-logga-Bla-Rott-strack-Outline.png) | eniro-auk |
| Protection Company Europe AB | Sjöviksvägen 60, 117 58 Stockholm | N/A | N/A | N/A | N/A | eniro |
| Protectus Bevakning AB | Dag Hammarskjölds väg 10B, 752 37 Uppsala | 018-60 27 70 | N/A | [protectusbevakning.se](https://protectusbevakning.se) | [gif](http://protectusbevakning.se/wp-content/uploads/2014/05/Logo.gif) | SäkF |
| Q Security Sverige AB | Brehogsvägen 5, 457 32 Tanumshede | 010-516 75 00 | [info@qsecurity.se](mailto:info@qsecurity.se) | [www.qsecurity.se](https://www.qsecurity.se) | [png](https://www.qsecurity.se/assets/logo_white.png) | eniro-auk, SäkB, SäkF |
| Qsg Bevakning AB | Gamlestads Torg 7, 415 12 Göteborg | 077-440 30 30 | N/A | N/A | N/A | eniro, SäkF |
| RANTA AB | Utövägen 8B, 371 37 Karlskrona | 0455-30 70 24 | N/A | N/A | N/A | eniro-auk |
| Rapid Säkerhet AB  | Kronborgsgränd 15, 164 46 Kista | 08-564 202 00 | N/A | [rapidsakerhet.se](https://rapidsakerhet.se) | [png](https://rapidsakerhet.se/icons/icon-48x48.png?v=715281146b9f9821787fc565bc8572b1) | eniro-auk, SäkB, SäkF |
| Rempart AB | Mor Annas brygga 69, 181 29 Lidingö | 070-748 06 87 | N/A | N/A | N/A | eniro-auk |
| Rixbevakning Sverige AB | Storgatan 23, 434 30 Kungsbacka | 010-333 33 64 | [info@rixbevakning.se](mailto:info@rixbevakning.se) | [rixbevakning.se](https://rixbevakning.se) | [png](https://rixbevakning.se/wp-content/uploads/2023/10/rixbevakning_logga_transparent.png) | eniro |
| Robsecurity (Robsec) | Lansgatan 6, 943 35 Öjebyn | 0911-20 68 62 | N/A | N/A | N/A | eniro-auk |
| Romaq Security AB | Linslingan 7, 241 35 Eslöv | 0413-698 75 | N/A | N/A | N/A | eniro-auk |
| RT Säkerhet AB | Box 7027, 187 11 Täby | 073-763 45 00 | [info@rtsakerhet.se](mailto:info@rtsakerhet.se) | [www.rtsakerhet.se](https://www.rtsakerhet.se) | [png](https://www.rtsakerhet.se/wp-content/uploads/2024/09/Bla-symbol-med-svart-text-vid-sidan_Rityta-1-mindre-format-1.png) | SäkF |
| SA Bevakning AB | Fabrikstorget 1, 412 50 Göteborg | 031-80 95 30 | N/A | [sabevakning.se](https://sabevakning.se) | N/A | eniro, SäkF |
| Safe Security I Sverige AB | Verkstadsgatan 8, 753 23 Uppsala | 018-15 74 44 | [info@safesecurity.se](mailto:info@safesecurity.se) | [safesecurity.se](https://safesecurity.se) | N/A | eniro-auk, SäkF |
| Safekeeper AB | Oslovägen 48, 452 35 Strömstad | 010-510 10 00 | [info@safekeeper.se](mailto:info@safekeeper.se) | [www.safekeeper.se](https://www.safekeeper.se) | [png](https://www.safekeeper.se/wp-content/uploads/2019/10/sitelogo-300x61-1.png) | eniro, SäkF |
| Safetly AB | Torshamnsgatan 27, 164 40 Kista | 08-121 044 33 | [info@safetly.se](mailto:info@safetly.se) | [www.safetly.se](https://www.safetly.se) | [png](https://safetly.se/safetly-og-image-new.png) | eniro, SäkF |
| SAM Security AB | Smedjegatan 22, 352 46 Växjö | 072-322 44 31 | [info@samsecurity.se](mailto:info@samsecurity.se) | [www.samsecurity.se](https://www.samsecurity.se) | [png](https://www.samsecurity.se/wp-content/uploads/cropped-sam-security-logo-180x180.png) | eniro-auk |
| Sbg Bevakning KB | Safirgränd 18, 126 79 Hägersten | 08-38 50 00 | N/A | N/A | N/A | eniro |
| Scutus Protection AB | Magnus Ladulåsgatan 3, 118 65 Stockholm | 08-20 40 00 | [info@scutus.se](mailto:info@scutus.se) | [scutus.se](https://scutus.se) | [png](https://scutus.se/app/themes/scutus-theme/resources/images/favicon.png) | eniro, SäkF |
| Securitas Sverige AB | Lindhagensplan 70, 112 43 Stockholm | 010-470 10 00 | [kundservice@securitas.se](mailto:kundservice@securitas.se) | [www.securitas.se](https://www.securitas.se) | [svg](https://www.securitas.se/images/brand/securitas_ab_logo.svg) | eniro-auk, eniro, SäkF |
| Security & Facility Services 360 AB | Jörgen Kocksgatan 65, 211 20 Malmö | N/A | N/A | N/A | N/A | eniro |
| Security Assistance Syd AB | Flygplansgatan 1-3, 212 39 Malmö | 040-6892450 | [kontakt@secass.se](mailto:kontakt@secass.se) | [www.secass.se](https://www.secass.se) | [png](https://www.secass.se/wp-content/uploads/2026/02/secass-logo-1200-x-628.png) | SäkB |
| Security Group Scandinavia AB | Ribevägen 20D, 217 46 Malmö | N/A | N/A | N/A | N/A | eniro |
| Security House Bevakning Shb AB | Ålgrytevägen 139, 127 31 Skärholmen | N/A | N/A | N/A | N/A | eniro |
| Security House International KB | Ålgrytevägen 139, 127 31 Skärholmen | N/A | [info@securityhouse.se](mailto:info@securityhouse.se) | [securityhouse.se](https://securityhouse.se) | [jpg](https://impro.usercontent.one/appid/oneComWsb/domain/securityhouse.se/media/securityhouse.se/onewebmedia/logo.jpg?withoutEnlargement&resize=97,29) | eniro |
| Security Store Sweden AB | N/A | 010-303 78 95 | [kundservice@securitystore.se](mailto:kundservice@securitystore.se) | [securitystore.se](https://securitystore.se) | [jpg](https://securitystore.se/userfiles/image/logo_orange_securitystore.jpg) | eniro |
| Securus Säkerhet i Sverige AB | Mossängsvägen 1, 141 71 Segeltorp | 08-734 00 20 | [info@securus.se](mailto:info@securus.se) | [www.securus.se](https://www.securus.se) | [png](https://www.securus.se/files/600x600/Securus-logo-vektor.png) | eniro-auk, SäkB, SäkF |
| Secutor Security AB | Ekuddsvägen 21, 131 38 Nacka | 070-456 25 20 | [info@secutorsecurity.se](mailto:info@secutorsecurity.se) | [secutorsecurity.se](https://secutorsecurity.se) | [png](https://secutorsecurity.se/images/r%c3%a4tt%20logga%2c%20r%c3%a4tt%20f%c3%a4rg.png?crc=3883381514) | SäkF |
| Selpro Investment, AB | Valinge by 55, 432 92 Varberg | 0340-50 00 05 | N/A | N/A | N/A | eniro-auk |
| SEQR SERVICES AB | Kommendörsgatan 37, 114 58 Stockholm | 08-611 61 00 | [info@seqrservices.com](mailto:info@seqrservices.com) | [seqrservices.com](https://seqrservices.com) | [png](https://impro.usercontent.one/appid/oneComWsb/domain/seqrservices.com/media/seqrservices.com/onewebmedia/seqrny%403x.png?withoutEnlargement&resize=25,29) | eniro-auk |
| Servitium Bevakning AB | Vretavägen 4D, 719 93 Vintrosa | N/A | N/A | N/A | N/A | SäkF |
| Show Security Sweden | Renstiernas Gata 14, 116 28 Stockholm | 08-520 010 10 | [info@showsecurity.se](mailto:info@showsecurity.se) | [www.showsecurity.se](https://www.showsecurity.se) | [png](https://www.showsecurity.se/wp-content/uploads/2018/11/logo-show-security.png) | eniro |
| Smart Bevakning Sverige AB | Lindövägen 72, 602 28 Norrköping | 020-26 11 50 | N/A | [www.smartsakerhet.com](https://www.smartsakerhet.com) | [png](https://i0.wp.com/www.smartsakerhet.com/wp-content/uploads/2022/07/cropped-smart-logo.png?fit=180%2C180&ssl=1) | eniro-auk, SäkF |
| Smart Säkerhet Sverige AB | Lindövägen 72, 602 28 Norrköping | 020-26 11 50 | N/A | [smartsakerhet.se](https://smartsakerhet.se) | [png](https://smartsakerhet.se/images/safetymate-logga-transparent-1-.png) | eniro, SäkF |
| Sodergaard AB | Humlarpsvägen 70, 265 90 Åstorp | 076-014 15 46 | [info@sodergaard.se](mailto:info@sodergaard.se) | [www.sodergaard.se](https://www.sodergaard.se) | N/A | SäkF |
| SOOKAB Säkerhet AB | Hjalmar Strååts väg 3B, 184 60 Åkersberga | N/A | N/A | N/A | N/A | SäkF |
| Spartan Security AB | Bertrandsgatan 3A, 212 14 Malmö | N/A | [info@spartansecurity.se](mailto:info@spartansecurity.se) | [spartansecurity.se](https://spartansecurity.se) | [png](https://spartansecurity.se/oglogo.png) | eniro |
| Ssg Security Sweden Group AB | Elektravägen 53, 126 30 Hägersten | N/A | N/A | N/A | N/A | eniro |
| sst bevakning.se | Virebergsvägen 9, 169 30 Solna | 073-368 14 11 | N/A | N/A | N/A | eniro |
| Star Security AB | Fyrspannvägen 14A, 425 41 Hisings Kärra | N/A | N/A | N/A | N/A | eniro |
| Stiernekens Säkerhetstjänst AB | Arabygatan 15, 352 46 Växjö | 0470-32 81 10 | N/A | N/A | N/A | SäkF |
| Store Secure Bevakningstjänst AB | Växthusvägen 15, 197 36 Bro | N/A | N/A | N/A | N/A | SäkF |
| Svensk Bevakning och Säkerhetspartner AB | A Odhners gata 43, 421 30 Västra Frölunda | 070-593 90 99 | N/A | N/A | N/A | eniro |
| Svensk Evenemangssäkerhet Securities AB | Arenavägen 23, 121 77 Johanneshov | N/A | N/A | N/A | N/A | eniro |
| Svensk Fjällbevakning AB | Sälenvägen 48, 780 67 Sälen | 0280-200 40 | N/A | N/A | N/A | SäkF |
| Svensk Säkerhet & Störningsjour I Sverige AB | Företagshusvägen 2, 244 93 Kävlinge | 040-97 00 60 | N/A | [svensksakerhet.com](https://svensksakerhet.com) | [svg](https://svensksakerhet.com/wp-content/uploads/2024/03/svensk-sakerhet-logotype.svg) | eniro-auk, SäkF |
| Svenska Störningsjouren AB | N/A | 08-645 00 35 | N/A | N/A | N/A | eniro-auk |
| Svenska Vakt | Kvarnvägen 3, 445 02 Surte | N/A | [kontakt@svenskavakt.com](mailto:kontakt@svenskavakt.com) | [www.svenskavakt.com](https://www.svenskavakt.com) | [png](https://irp.cdn-website.com/5d2e1d44/dms3rep/multi/Svenska+Vakt+Logo+SV+utskuren-b5e8f23c.png) | SäkF |
| Svenska Vakt Göteborg AB | Kvarnvägen 3, 445 57 Surte | N/A | [kontakt@svenskavakt.com](mailto:kontakt@svenskavakt.com) | [www.svenskavakt.com](https://www.svenskavakt.com) | [png](https://irp.cdn-website.com/5d2e1d44/dms3rep/multi/Svenska+Vakt+Logo+SV+utskuren-b5e8f23c.png) | eniro |
| Svesab Security AB | Vilundavägen 30, 194 34 Upplands Väsby | 08-6225561 | [info@svesabsecurity.se](mailto:info@svesabsecurity.se) | [www.svesabsecurity.se](https://www.svesabsecurity.se) | [png](https://www.svesabsecurity.se/wp-content/uploads/2025/03/cropped-Svesab_icon-180x180.png) | SäkB |
| Swedbevakningstjänster AB | Svärdvägen 27, 182 33 Danderyd | 073-697 38 23 | N/A | N/A | N/A | eniro-auk |
| Sweguard AB | Storforsvägen 15, 944 72 Piteå | N/A | N/A | N/A | N/A | eniro |
| Swepo Group AB | Neptunigränd 34, 194 43 Upplands Väsby | 070-4582370 | [kundtjanst@swepogroup.se](mailto:kundtjanst@swepogroup.se) | [www.swepogroup.se](https://www.swepogroup.se) | [png](http://static1.squarespace.com/static/60d9ebf15202bc2e19862af6/t/632835be65bc4652206d742d/1663579582787/SWEPO-removebg-preview.png?format=1500w) | SäkB |
| Sydsec Bevakning AB | Arlövsvägen 2, 211 24 Malmö | 040-611 33 11 | N/A | N/A | N/A | eniro-auk, SäkF |
| Säkerhet Ordningsbevakning Sob, AB | Kanalvägen 12, 194 61 Upplands Väsby | 08-642 05 80 | N/A | N/A | N/A | eniro-auk, SäkF |
| Säkerhetsmäklarna I Sverige AB | Strålgatan 11, 112 63 Stockholm | 072-577 98 00 | [info@sakerhetsmaklarna.se](mailto:info@sakerhetsmaklarna.se) | [www.sakerhetsmaklarna.se](https://www.sakerhetsmaklarna.se) | N/A | eniro |
| Säkerhetstjänst I Karlstad AB | Kvarnvägen 15, 663 40 Hammarö | N/A | N/A | N/A | N/A | eniro-auk |
| Säkerhetstjänst i Värmland AB | Kvarnvägen 15, 663 40 Hammarö | 054-21 94 00 | N/A | N/A | N/A | SäkF |
| Säkerhetstjänst I Väst AB | Traversgatan 10, 531 40 Lidköping | 072-534 53 19 | N/A | N/A | N/A | eniro, SäkF |
| Säkerhetsvakterna i Malmö AB | Skallavångsvägen 26, 247 33 Södra Sandby | 040-680 64 69 | N/A | N/A | N/A | eniro |
| T. P. Ordningsvakter AB | Ekens väg 10, 741 98 Knutby | N/A | N/A | N/A | N/A | eniro |
| Tarantsec Bevakning AB | Vretensborgsvägen 28, 126 30 Hägersten | N/A | N/A | N/A | N/A | eniro |
| Tarantsec Crowd Management AB | Vretensborgsvägen 28, 126 30 Hägersten | 070-741 88 11 | [info@tarantsec.se](mailto:info@tarantsec.se) | [tarantsec.se](https://tarantsec.se) | [svg](https://tarantsec.se/static/white-logo-32860e589e7b0790a92df8b3cde54f7b.svg) | eniro |
| Teletec Connect AB | Ostmästargränd 8, 120 40 Årsta | 08-6021600 | N/A | [www.teletec.se](https://www.teletec.se) | [png](https://www.teletec.se/media/favicon/stores/1/Teletec_Favicon_Vit_RGB.png) | SäkB |
| Tempest Security Sverige AB | Rålambsvägen 17, 112 59 Stockholm | 010-45 777 60 | [info@tempest.se](mailto:info@tempest.se) | [www.tempest.se](https://www.tempest.se) | [svg](https://cdn-bdpbh.nitrocdn.com/AgTmSNocjpkEKocmTiUbxuQQtbiiabUB/assets/images/optimized/rev-448b3b5/www.tempestsecurity.com/wp-content/themes/tempest/img/icons/logo.svg) | eniro, SäkF |
| Texstar AB | Gösvägen 7, 761 48 Norrtälje | 0176-29 65 50 | [info@texstar.se](mailto:info@texstar.se) | [texstar.se](https://texstar.se) | [png](https://texstar.se/favicons/apple-touch-icon.png) | eniro |
| Thora Bevakning AB | Storgatan 34, 269 77 Torekov | 073-325 25 20 | N/A | N/A | N/A | eniro |
| TM-Security AB | Älgvägen 10, 352 45 Växjö | 070-810 16 21 | [info@tmsecurity.se](mailto:info@tmsecurity.se) | [tmsecurity.se](https://tmsecurity.se) | [ico](https://websitebuilder.one.com/favicon/favicon.ico) | SäkF |
| Top Security Scandinavia AB | Engelbrektsgatan 6B, 114 32 Stockholm | 073-718 02 75 | [info@topsecurity.se](mailto:info@topsecurity.se) | [topsecurity.se](https://topsecurity.se) | N/A | eniro |
| Top Solution Security Sverige AB | Fatburs Brunnsgata 31, 118 28 Stockholm | 08-646 83 00 | [info@topsolution.se](mailto:info@topsolution.se) | [www.topsolution.se/topsolution](https://www.topsolution.se/topsolution) | [png](https://www.topsolution.se/wp-content/uploads/2014/12/top_logo.png) | eniro |
| Total Säkerhet Skandinavien AB | Grännavägen 24, 561 34 Huskvarna | 036-13 23 20 | [info@totalsakerhet.se](mailto:info@totalsakerhet.se) | [totalsakerhet.se](https://totalsakerhet.se) | [jpg](https://impro.usercontent.one/appid/oneComWsb/domain/totalsakerhet.se/media/totalsakerhet.se/onewebmedia/Total%20Sa%CC%88kerhet-Ho%CC%88gupplo%CC%88st%20logga___serialized2.jpg?withoutEnlargement&resize=76,29) | eniro-auk, SäkF |
| Trinity Security AB | Sandfjärdsgatan 29, 120 56 Årsta | N/A | N/A | N/A | N/A | eniro |
| Trygghetsbevakning Stockholm HB | Hamngatan 10, 111 47 Stockholm | 070-777 81 17 | N/A | [trygghetsbevakning.se](https://trygghetsbevakning.se) | [png](https://trygghetsbevakning.se/wp-content/uploads/2019/11/cropped-cropped-logo_black_bg-1-4.png) | eniro-auk, SäkF |
| TS Säkerhet AB | Rolandsbacke 205, 861 95 Söråker | 073-817 09 85 | N/A | N/A | N/A | eniro-auk |
| Ull Security AB | Nitvägen 12, 126 38 Hägersten | 08-18 89 85 | N/A | [ullsecurity.se](https://ullsecurity.se) | [png](https://ullsecurity.se/ws/media-library/b3606b00498d3a169a4c813a0a135c75/logoullsecurity-transparantbakgrund.png) | eniro |
| Unit Security Sweden | Stora torget 1C, 599 31 Ödeshög | 070-034 78 13 | N/A | N/A | N/A | eniro |
| V B O Security AB | Järvstigen 27, 974 53 Luleå | 072-231 59 01 | N/A | N/A | N/A | eniro |
| Vakter/Ordningsvakter I Kalmar | Rotebrunnsvägen 10, 393 55 Kalmar | 0480-869 66 | N/A | N/A | N/A | eniro |
| VBK Västsvensk Butikskontroll AB | N/A | 033-10 60 25 | N/A | N/A | N/A | eniro-auk |
| Vialarm i Sverige AB | Uddevallavägen 3, 452 31 Strömstad | 0771-747576 | [kundtjanst@vialarm.se](mailto:kundtjanst@vialarm.se) | [www.vialarm.shop](https://www.vialarm.shop) | [png](https://static.wixstatic.com/media/03c546_c9815f22c93646eda985dd06391f8bda%7Emv2.png/v1/fill/w_180%2Ch_180%2Clg_1%2Cusm_0.66_1.00_0.01/03c546_c9815f22c93646eda985dd06391f8bda%7Emv2.png) | SäkB |
| ViPo Säkerhetstjänster AB | Järnvägsgatan 7, 252 24 Helsingborg | 076-0358007 | [kundservice@vipo.se](mailto:kundservice@vipo.se) | [www.vipo.se](https://www.vipo.se) | [png](https://www.vipo.se/wp-content/uploads/cropped-logga_vipo_2021-kopia-3.png) | SäkB |
| Vj Security AB | Tånåsvägen 4B, 417 49 Göteborg | N/A | N/A | N/A | N/A | eniro |
| Vv Security AB | Grevgatan 4, 114 53 Stockholm | 076-003 43 00 | [info@vvsecurity.se](mailto:info@vvsecurity.se) | [vvsecurity.se](https://vvsecurity.se) | N/A | eniro |
| Wallins Bevakningstjänst | Slånbärsvägen 40A, 453 38 Lysekil | 070-592 06 19 | N/A | N/A | N/A | eniro |
| Westra Security Group AB | Storgatan 21, 671 31 Arvika | 010-1415800 | [info@westrasecurity.se](mailto:info@westrasecurity.se) | [westrasecurity.se](https://westrasecurity.se) | [svg](https://westrasecurity.se/wp-content/uploads/westra_security_front_logo.svg) | SäkB, SäkF |
| Wik Säkerhet AB | Mastvägen 5, 746 32 Bålsta | 0171-590 80 | N/A | N/A | N/A | eniro |
| X Security Xsec Global AB | N/A | 010-167 70 00 | N/A | N/A | N/A | eniro |
| Z-Security | Älvdanshagen 27, 423 51 Torslanda | N/A | N/A | N/A | N/A | eniro |
| Zenit Säkerhet AB | Omloppsvägen 8, 372 41 Ronneby | 0457-122 11 | N/A | N/A | N/A | SäkF |
| Zonsec Bevakning AB | Skalldalsvägen 18, 436 52 Hovås | 031-99 00 48 | [info@zonsec.se](mailto:info@zonsec.se) | [zonsec.se](https://zonsec.se) | [png](https://files.builder.misssite.com/0c/93/0c93b2dc-5689-46af-ba4f-b2bc57c63814.png) | eniro, SäkB, SäkF |
| Örn Bevakning AB | Blomstergatan 2, 411 04 Göteborg | 031-19 03 92 | [info@ornbevakning.se](mailto:info@ornbevakning.se) | [ornbevakning.se](https://ornbevakning.se) | N/A | eniro |

## Företag utan bekräftade kontaktuppgifter (14 st)

Namnen kommer från branschorganisationernas medlemsregister, men varken adress eller
telefon gick att bekräfta maskinellt. De behöver slås upp manuellt innan de kan läggas in.

| Företag | Hemsida | Logga | Org.nr |
| --- | --- | --- | --- |
| 247 Säkerhet AB | [247sakerhet.se](https://247sakerhet.se) | [png](https://247sakerhet.se/apple-touch-icon.png) | 556698-8589 |
| Best Security Sweden AB | N/A | N/A | 556479-7750 |
| Guard Security Service X AB | N/A | N/A | 559060-3394 |
| J security AB | N/A | N/A | 559074-4107 |
| JSS - Judisk Säkerhet Sverige AB | N/A | N/A | 559345-7590 |
| Klemo Bevakning AB | [klemobevakning.se](https://klemobevakning.se) | [png](https://klemobevakning.se/wp-content/uploads/2023/01/logo-ny-vit-klemo-x1.png) | 556284-2673 |
| PreCont Bevakning AB | N/A | N/A | 556856-8793 |
| Proheda Fire Security AB | N/A | N/A | 556609-0139 |
| Retail Security Stockholm AB | N/A | N/A | N/A |
| Sesec Bevakning AB | N/A | N/A | 556910-8896 |
| Svenska Hjältar AB | [www.svenska-hjaltar.se](https://www.svenska-hjaltar.se) | [png](https://www.svenska-hjaltar.se/cdn/shop/files/Svenska_Hjaltar_Thin_blue_line_305x.png?v=1624561878) | 559249-4198 |
| To Trust Operations AB | [www.totrust.se](https://www.totrust.se) | [svg](https://www.totrust.se/wp-content/themes/totrust/resources/images/ToTrust-Logo-sand.svg) | 559492-6346 |
| Trygghet & Säkerhet i Östergötland AB | N/A | N/A | 556777-9359 |
| Wåges Security AB | N/A | N/A | 559494-8910 |

## Täckning

- Företag totalt: **250**
- Med gatuadress: **227**
- Med telefon: **188**
- Med e-post: **92**
- Med webbplats: **120**
- Med logotyp: **103**
