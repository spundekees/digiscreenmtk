# Digiscreen – Erweiterung Medienzentrum Main-Taunus-Kreis

Dieses Repository ist ein Ableger (Fork) von **Digiscreen** von La Digitale:
<https://codeberg.org/ladigitale/digiscreen> (Lizenz GNU AGPLv3, siehe `LICENSE`).
Die Original-Beschreibung steht in `README.md`.

Grundlage ist das Original in Version **1.2.4**, Stand 22.11.2026. Die Git-Geschichte ist so aufgebaut:

1. **Commit „Original La Digitale …“** – das unveränderte Original
2. **Commit „MTK-Erweiterungen“** – alle Änderungen des Medienzentrums
3. danach: Build-Automatik und Anleitung

So lässt sich jederzeit nachvollziehen, was gegenüber dem Original geändert wurde.

## Neue Funktionen

| Funktion | Wo im Code |
|---|---|
| **Zirkel** mit Einrasten (Karo-Schnittpunkte, Schnittpunkte, Mittel-/Endpunkte, auf Linien), Radius in cm (1 Kästchen = 0,5 cm), Schalter „Einrasten“ | `src/components/annotation/zirkel.js` |
| **Geodreieck** (cm-Skala, Winkelmesser, Parallelen), verschieben/drehen/skalieren, Stiftlinien rasten an den Kanten ein, Schalter „Geodreieck einrasten“ | `src/components/annotation/geodreieck.js` |
| **Füllwerkzeug** (Farbeimer) für geschlossene Flächen | `src/components/annotation/remplir.js` |
| Zeichnungen, Zirkel und Geodreieck **wachsen und wandern mit**, wenn der Hintergrund skaliert/verschoben wird | `src/components/annotation/arrierePlan.js`, `src/echelleAnnotations.js` |
| **Grundschul-Lineatur mit Häuschen** (normal und groß) als Hintergrund | `public/static/img/lineatur-haeuschen*.svg`, `src/components/parametres.vue` |
| **Größe und Lage des Schreib-Hintergrunds** direkt auf dem Bildschirm (– 100 % + / Hand / Mitte) | `src/App.vue` |
| **Logo des Medienzentrums** oben rechts, nur auf Foto-Hintergründen | `src/assets/css/style.css`, `src/assets/img/logo-mtk-medienzentrum.svg` |
| Waagerechte/senkrechte Linien und Pfeile lassen sich zeichnen (Fehler im Original behoben) | `src/components/annotation.vue` |

Die Darstellung (CSS) von Zirkel und Geodreieck liegt in `src/assets/css/annotation-werkzeuge.css`.
Alle neuen Texte sind in `src/lang/*.json` übersetzt (Deutsch, Englisch, Französisch, Spanisch, Italienisch, Niederländisch, Kroatisch, Baskisch).

## Bauen

Benötigt: Node.js 22.

```
npm ci
touch .env         # leer lassen oder API-Schlüssel eintragen (siehe README.md)
mkdir -p vendor    # nur nötig, weil der Original-Build diesen Ordner kopiert
npm run build:varianten
```

Ergebnis im Ordner `ausgabe/`:

- `ausgabe/server` – die Webseite (ohne PHP-Teil und ohne `.env`, geeignet für GitHub Pages und jedes einfache Webhosting)
- `ausgabe/lokal` – startet per Doppelklick auf `index.html` direkt vom Rechner

Das Skript dazu: `scripts/varianten.mjs`.

## Automatisch bauen und veröffentlichen (GitHub)

Die Datei `.github/workflows/pages.yml` baut bei jedem Push auf `main` beide Varianten:

- Die **Webseite** wird automatisch auf GitHub Pages veröffentlicht.
- Die **lokale Variante** liegt unter *Actions* → letzter Lauf → *Artifacts* → `digiscreen-lokal` zum Herunterladen.

Einmalig einstellen: Repository → *Settings* → *Pages* → *Source*: **GitHub Actions**.

Optional für Bilder- und YouTube-Suche: *Settings* → *Secrets and variables* → *Actions* → *New repository secret*:
`VITE_PIXABAY_API_KEY` bzw. `VITE_GOOGLE_API_KEY`.

## Neue Versionen des Originals übernehmen

Mit Git auf der Kommandozeile (GitHub Desktop kann keine zweite Quelle verwalten):

```
git remote add original https://codeberg.org/ladigitale/digiscreen.git   # nur beim ersten Mal
git fetch original
git merge original/main
```

Konflikte entstehen am ehesten in `src/components/annotation.vue` (Stift und Werkzeugleiste) und `src/App.vue` (Hintergrund).
Die eigenen Funktionen liegen bewusst in eigenen Dateien, damit Konflikte selten und klein bleiben.

Hinweis: Die Grundlage wurde als ZIP-Datei von Codeberg übernommen. Ein erstes `git merge original/main` braucht deshalb einmalig den Zusatz `--allow-unrelated-histories`. Danach geht es normal.
