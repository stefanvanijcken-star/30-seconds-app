# 30 Seconds PWA

Een installeerbare, offline werkende mobiele web-app op basis van het aangeleverde Figma-ontwerp.

## Architectuur

- **View-laag:** semantische HTML die per spelstatus wordt gerenderd.
- **State-laag:** één centrale state-machine in `app.js`; schermwissels volgen de spelroute.
- **Domeinlogica:** themawoorden, timer, beurtvolgorde, scores en winnaar zijn los van de CSS opgebouwd.
- **Spelinstellingen:** thema, spelersaantal en doelscore worden bij ieder nieuw spel gekozen. Spelers krijgen standaard de namen Speler 1, Speler 2, enzovoort.
- **PWA-laag:** manifest plus service worker maken installatie en offline spelen mogelijk.

## Lokaal openen

Start in deze map een eenvoudige lokale webserver. Bijvoorbeeld met:

```powershell
python -m http.server 4173
```

Open daarna `http://localhost:4173`. Voor installatie op een echte iPhone moet de map via HTTPS worden gepubliceerd.

## Installeren op iPhone

1. Open de gepubliceerde HTTPS-link in Safari.
2. Tik op **Deel**.
3. Kies **Zet op beginscherm**.
4. Open 30 Seconds voortaan via het app-icoon.

De eerste speler die de gekozen doelscore haalt, wint. De woordenbank bevat 80 begrippen per thema en deelt eerst alle begrippen uit voordat een nieuwe, geschudde reeks begint.
