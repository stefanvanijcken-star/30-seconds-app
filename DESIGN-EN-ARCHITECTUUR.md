# Ontwerpanalyse en PWA-architectuur

## Schermen en interacties uit Figma

De Figma bevat een lineaire spelroute voor een iPhone 13/14-frame van 390 × 844 px:

1. **Start:** titel, uitlegknop en nieuw spel.
2. **Thema:** vijf keuzes; één geselecteerde witte optie en een vaste vervolgactie.
3. **Spelers:** keuze voor 2, 3 of 4+ spelers, gevolgd door dynamische naamvelden.
4. **Controle:** samenvatting van thema, spelersaantal en namen.
5. **Telefoon doorgeven:** actieve speler wordt groot getoond, met privacy-instructie.
6. **Speelbeurt:** vijf begrippen, een ronde timer van 30 seconden en vroegtijdig afronden wanneer alles is geraden.
7. **Tijd voorbij en score:** scorekeuze 0–5 plus terugblik op de vijf begrippen.
8. **Tussenstand:** gerangschikte scores, rondenummer en volgende speler.
9. **Winnaar:** winnaar en eindstand, met herstart- en nieuwe-rondeacties.
10. **Stopbevestiging:** modaal venster dat waarschuwt dat de huidige voortgang verloren gaat.

Visueel gebruikt het ontwerp consequent `#5939e8`, 16 px hoekafronding, witte primaire knoppen, donkere secundaire knoppen en Bricolage Grotesque voor koppen. De webversie houdt dit systeem aan, maar gebruikt vloeiende positionering en iPhone-safe-areas zodat ook andere schermhoogtes werken.

## Voorgestelde architectuur

Voor deze MVP is een compacte state-machine passender dan een zwaar framework:

- `state.screen` bepaalt het zichtbare scherm.
- Domeinfuncties beheren timer, woorden, beurtvolgorde, score en winnaar.
- De renderer vertaalt de state naar toegankelijke, semantische HTML.
- CSS bevat de gedeelde ontwerptokens en responsieve componentstijlen.
- `localStorage` bewaart alleen herbruikbare instellingen; lopende voortgang wordt niet bewaard.
- De service worker bewaart de app-shell zodat het spel na de eerste keer laden offline opent.

Deze scheiding maakt een latere uitbreiding naar teamspel, configureerbare doelscores, extra woordenlijsten of online synchronisatie mogelijk zonder de visuele laag opnieuw te bouwen.
