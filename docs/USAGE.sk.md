# timeriq — Používateľská príručka

*English version: [USAGE.en.md](./USAGE.en.md)*

timeriq je časovač na prezentácie, ktorý beží celý priamo vo vašom prehliadači (alebo ako nainštalovaná offline aplikácia). Nepotrebuje žiadny účet, žiadny server a žiadne dáta neopúšťajú vaše zariadenie — všetko sa ukladá lokálne.

## Rýchly štart

1. Otvorte aplikáciu. Uvidíte **ovládací panel**: vľavo živý náhľad, vpravo **playlist** a **nastavenia**.
2. Zostavte si program v playliste — pridajte časované segmenty a prestávky, poradie zmeníte ťahaním, čas segmentu upravíte kliknutím naň.
3. Kliknite na **Otvoriť výstupné okno** (alebo **Otvoriť na druhej obrazovke**, ak to váš prehliadač podporuje automaticky) a presuňte toto okno na obrazovku, ktorú vidí publikum/projektor.
4. Stlačte **Spustiť** alebo medzerník. Výstupné okno sa aktualizuje okamžite.

## Klávesové skratky

Fungujú v oboch oknách — ovládacom aj výstupnom (ak je aktívne výstupné okno, príkaz sa presmeruje do ovládacieho okna, ktoré zostáva zdrojom pravdy):

| Klávesa | Akcia |
| --- | --- |
| `Medzerník` | Spustiť / pozastaviť aktuálny segment |
| `Esc` | Resetovať aktuálny segment na jeho plnú dĺžku |
| `→` | Preskočiť na ďalší segment |
| `←` | Preskočiť na predchádzajúci segment |

Skratky sa ignorujú, kým píšete do textového poľa.

## Úprava času klávesnicou

Každé pole s trvaním (riadky playlistu, formulár na pridanie, upozornenia, predvolená prestávka, jeden časovač) je editor `mm:ss` ovládaný klávesnicou. Kliknite naň (alebo naň prejdite klávesom Tab), potom `←` / `→` vyberá číslicu, `↑` / `↓` pripočíta alebo odpočíta na danej číslici (s prenosom, napr. `0:59` + 1 s = `1:00`), alebo číslom prepíšete vybranú číslicu. `Enter` / `Esc` pole opustí.

## Režim jedného časovača

Nepotrebujete program? Použite prepínač **Playlist / Jeden časovač** nad zoznamom. Režim jedného časovača zobrazí len jeden názov a jedno trvanie, skryje tlačidlá preskočenia aj „Nasleduje" a po dosiahnutí nuly sa zastaví. Playlist sa zachová a po prepnutí späť sa vráti.

## Playlist

Každý riadok je buď **časovač** (prednáška, segment, blok programu) alebo **prestávka**. Môžete:

- **Pridať** časovač alebo prestávku pomocou formulára pod playlistom (zadajte názov a nastavte trvanie).
- **Zmeniť poradie** ťahaním úchytky vľavo od riadku.
- **Upraviť** názov priamo v riadku, alebo upraviť trvanie klávesnicou (pozri vyššie).
- **Duplikovať** alebo **odstrániť** segment pomocou tlačidiel s ikonami.
- **Preskočiť** na ľubovoľný segment kliknutím na jeho poradové číslo.

Keď bežiacemu segmentu dôjde čas, timeriq automaticky prejde na ďalšiu položku v zozname a pokračuje v behu — takže celý program (prednáška → prestávka → prednáška → …) môže plynúť samostatne, keď ho raz spustíte. Aby automatický posun fungoval, ovládacie okno musí zostať otvorené; výstupné okno je len zrkadlo.

## Upozornenia na čas (zmena farby)

V **Nastavenia → Upozornenia na čas** si definujete jeden alebo viac bodov spustenia, napr. „zostáva 5 minút → oranžová" a „zostáva 1 minúta → červená, blikajúca". Keď zostávajúci čas prekročí danú hranicu, farba akcentu (čísla, pruh/kruh priebehu) sa automaticky prepne a obrazovka môže voliteľne aj blikať — jasný signál pre rečníka bez slov. Upozornenia môžete ľubovoľne pridávať, upravovať alebo odstraňovať; platia pre práve aktívny segment.

## Dve obrazovky (ovládanie + výstup)

- **Otvoriť výstupné okno** otvorí bežné okno prehliadača na adrese `/output`, ktoré zrkadlí zobrazenie časovača z ovládacieho panela — bez ovládacích prvkov, len čisté zobrazenie pripravené na premietanie.
- **Otvoriť na druhej obrazovke** (zobrazí sa, ak váš prehliadač podporuje Window Management API — momentálne Chrome/Edge) si raz vypýta povolenie a potom výstupné okno automaticky umiestni na druhý monitor a prepne na celú obrazovku.
- Ak to váš prehliadač nepodporuje, otvorte výstupné okno bežným spôsobom, presuňte ho na druhý displej a stlačte skratku prehliadača pre celú obrazovku (`F11` vo Windows/Linuxe, `Ctrl+Cmd+F` na macOS).
- Obe okná sa synchronizujú v reálnom čase cez `BroadcastChannel` (bez siete, bez servera) — klávesové skratky, ovládanie prehrávania aj zmeny nastavení sa prejavia okamžite.

## Vzhľad a branding

V **Nastaveniach** môžete nastaviť:

- **Tému** — tmavú (predvolené) alebo svetlú.
- **Farbu akcentu**, **písmo** (čisté bezpätkové alebo monospace), **štýl priebehu** (pruh, kruh alebo oboje), **pozadie** (plné alebo prechod) a **animované častice**, ktoré sa vznášajú za časovačom (preberajú aj farbu upozornení).
- **Hodiny** — zobrazenie aktuálneho času na výstupnej obrazovke, v 24-hodinovom alebo 12-hodinovom formáte.
- **Logo** — nahrajte obrázok (automaticky sa zmenší a uloží lokálne); vyberte, v ktorom rohu sa má zobraziť (alebo ho vycentrujte), a zmeňte jeho veľkosť posuvníkom **Veľkosť loga**.

## Debatný časovač

Samostatný nástroj na panelové diskusie a debaty — prepnete naň záložkami **Prezentácia / Diskusia** navrchu.

- Pridajte účastníkov s menom a voliteľnou fotkou (kliknutím na avatar v zozname fotku nahráte; bez fotky sa zobrazia iniciály).
- Každému účastníkovi priraďte vlastný časový limit. Každý účastník má svoj nezávislý časovač.
- Kliknutím na **Dať slovo** pri účastníkovi ho presuniete do stredu obrazovky a spustíte jeho čas; predtým aktívnemu účastníkovi sa čas presne zastaví tam, kde bol, a presunie sa do riadku menších časovačov dole. Naraz beží vždy len jeden časovač.
- Tlačidlom **+ Pridať časovač na otázky** vytvoríte opakovane použiteľný slot pre otázky od moderátorov (zobrazí sa s vlastným odznakom). Jeho riadok má vlastné tlačidlo na reset, takže ho po každej otázke vrátite na plný pridelený čas bez ovplyvnenia práve vybraného rečníka.
- `Medzerník` spustí/pozastaví práve vybraného rečníka (bez zmeny výberu), `Esc` resetuje jeho čas na priradenú hodnotu, `←`/`→` prepnú slovo na predchádzajúceho/ďalšieho účastníka.
- V nastaveniach pridajte **názov diskusie** a/alebo **logo** (s vlastnou veľkosťou/pozíciou) — zobrazia sa na výstupnej obrazovke.
- **Otvoriť výstupné okno** / **Otvoriť na druhej obrazovke** fungujú rovnako ako v prezentačnom nástroji.
- **Otvoriť spodný pruh** otvorí malé priehľadné okno zobrazujúce len meno, fotku a čas aktuálneho rečníka — pridajte ho ako Browser Source v OBS (alebo podobnom nástroji) pre prekrytie pri livestreame; nemá pozadie, takže ho netreba klučovať.

## Offline používanie

timeriq je Progresívna webová aplikácia (PWA). Po prvej návšteve funguje aj bez internetového pripojenia. Ak si ju chcete nainštalovať ako samostatnú aplikáciu, použite v prehliadači voľbu „Nainštalovať aplikáciu" / „Pridať na plochu" (zvyčajne v adresnom riadku alebo v menu prehliadača).

## Dáta a súkromie

Váš playlist a nastavenia sa ukladajú len v lokálnom úložisku vášho prehliadača, na vašom zariadení. Vymazaním dát webu timeriq v prehliadači (alebo voľbou **Nastavenia → Vymazať všetky dáta**) sa odstráni úplne všetko.

---
Vytvoril **møušn**.
