# TimerIQ — Používateľská príručka

*English version: [USAGE.en.md](./USAGE.en.md)*

TimerIQ je časovač na prezentácie, ktorý beží celý priamo vo vašom prehliadači (alebo ako nainštalovaná offline aplikácia). Nepotrebuje žiadny účet, žiadny server a žiadne dáta neopúšťajú vaše zariadenie — všetko sa ukladá lokálne.

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

## Playlist

Každý riadok je buď **časovač** (prednáška, segment, blok programu) alebo **prestávka**. Môžete:

- **Pridať** časovač alebo prestávku pomocou formulára pod playlistom (zadajte názov a trvanie v tvare `mm:ss`, napr. `12:30`).
- **Zmeniť poradie** ťahaním úchytky vľavo od riadku.
- **Upraviť** názov priamo v riadku, alebo kliknutím na dĺžku zadať novú hodnotu.
- **Duplikovať** alebo **odstrániť** segment pomocou tlačidiel s ikonami.
- **Preskočiť** na ľubovoľný segment kliknutím na jeho poradové číslo.

Keď bežiacemu segmentu dôjde čas, TimerIQ automaticky prejde na ďalšiu položku v zozname a pokračuje v behu — takže celý program (prednáška → prestávka → prednáška → …) môže plynúť samostatne, keď ho raz spustíte. Aby automatický posun fungoval, ovládacie okno musí zostať otvorené; výstupné okno je len zrkadlo.

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
- **Farbu akcentu**, **písmo** (čisté bezpätkové alebo monospace), **štýl priebehu** (pruh, kruh alebo oboje), **pozadie** (plné alebo prechod).
- **Hodiny** — zobrazenie aktuálneho času na výstupnej obrazovke, v 24-hodinovom alebo 12-hodinovom formáte.
- **Logo** — nahrajte obrázok (automaticky sa zmenší a uloží lokálne); vyberte, v ktorom rohu sa má zobraziť, alebo ho vycentrujte pre pokojovú/čakaciu obrazovku.

## Offline používanie

TimerIQ je Progresívna webová aplikácia (PWA). Po prvej návšteve funguje aj bez internetového pripojenia. Ak si ju chcete nainštalovať ako samostatnú aplikáciu, použite v prehliadači voľbu „Nainštalovať aplikáciu" / „Pridať na plochu" (zvyčajne v adresnom riadku alebo v menu prehliadača).

## Dáta a súkromie

Váš playlist a nastavenia sa ukladajú len v lokálnom úložisku vášho prehliadača, na vašom zariadení. Vymazaním dát webu TimerIQ v prehliadači (alebo voľbou **Nastavenia → Vymazať všetky dáta**) sa odstráni úplne všetko.

---
Vytvoril **møušn**.
