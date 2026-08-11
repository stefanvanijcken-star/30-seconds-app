# Publiceren via VS Code, GitHub en Vercel

Deze app heeft geen installatie- of bouwstap nodig. Alle bestanden in deze map vormen samen de website.

## Eenmalig voorbereiden

1. Installeer [Visual Studio Code](https://code.visualstudio.com/), [Git](https://git-scm.com/download/win) en maak gratis accounts bij [GitHub](https://github.com/) en [Vercel](https://vercel.com/).
2. Open VS Code.
3. Kies **File → Open Folder** en open:
   `C:\Users\stefa\Documents\grappige ideeen\30 Seconds App`
4. Open in VS Code **Terminal → New Terminal**.

## Project naar GitHub sturen

Maak eerst op GitHub een leeg repository:

1. Ga naar `https://github.com/new`.
2. Geef het repository bijvoorbeeld de naam `30-seconds-app`.
3. Kies **Public** of **Private**. Beide werken voor een persoonlijk Vercel-project.
4. Vink **Add a README**, `.gitignore` en license niet aan; die bestanden staan al lokaal.
5. Klik **Create repository**.

Voer vervolgens in de VS Code-terminal deze opdrachten één voor één uit:

```powershell
git init
git add .
git commit -m "Eerste versie 30 Seconds PWA"
git branch -M main
git remote add origin https://github.com/JOUW-GEBRUIKERSNAAM/30-seconds-app.git
git push -u origin main
```

Vervang `JOUW-GEBRUIKERSNAAM` door je GitHub-gebruikersnaam. Als Git om aanmelden vraagt, voltooi je de GitHub-login in het geopende venster.

## GitHub-repository aan Vercel koppelen

1. Meld je bij `https://vercel.com/` aan met GitHub.
2. Klik **Add New… → Project**.
3. Zoek `30-seconds-app` en klik **Import**. Geef Vercel zo nodig toegang tot dit repository.
4. Controleer de instellingen:
   - **Framework Preset:** `Other`
   - **Root Directory:** `./`
   - **Build Command:** leeg laten
   - **Output Directory:** leeg laten
   - **Environment Variables:** geen nodig
5. Klik **Deploy**.
6. Na ongeveer een minuut toont Vercel een HTTPS-adres zoals `https://30-seconds-app.vercel.app`.

## Op de iPhone installeren

1. Open de Vercel-link in **Safari**.
2. Tik onderaan op het deelicoon.
3. Kies **Zet op beginscherm**.
4. Bevestig met **Voeg toe**.

De app opent daarna schermvullend en blijft na de eerste keer laden ook offline bruikbaar.

## Latere wijzigingen publiceren

Pas de bestanden aan in VS Code en voer daarna uit:

```powershell
git add .
git commit -m "Beschrijving van mijn wijziging"
git push
```

Iedere push naar `main` wordt automatisch opnieuw door Vercel gepubliceerd. Meestal staat de update binnen een minuut online.

## Veelvoorkomende problemen

- **`git` wordt niet herkend:** installeer Git en herstart VS Code.
- **Repository bestaat al:** controleer de repositorynaam of verwijder de verkeerde `origin` met `git remote remove origin` en voeg de juiste opnieuw toe.
- **Repository staat niet in Vercel:** open in Vercel de GitHub-integratie en geef toegang tot `30-seconds-app`.
- **Oude app blijft zichtbaar op iPhone:** sluit de app volledig en open opnieuw. De service worker controleert dan op een nieuwe versie.
- **Installatieoptie ontbreekt:** open de HTTPS-link rechtstreeks in Safari, niet in de ingebouwde browser van WhatsApp of Instagram.
