# Sicherheitsprüfung Digiscreen (Version Medienzentrum MTK)

Stand: 26.11.2026 · geprüft: Quellcode in diesem Repository (inkl. gesamter Git-Historie) und das gebaute Paket (`dist`).
Vorgaben: [CLAUDE.md](CLAUDE.md), Abschnitte „IT-Sicherheitsrichtlinien“ und „Open Source“.

## 1. Durchgeführte Prüfungen

| Prüfung | Werkzeug (Lizenz) | Umfang | Ergebnis |
|---|---|---|---|
| Secret-Scan | Gitleaks 8.28.0 (MIT) | Git-Historie dieses Repos, GitHub-Stand, gebautes Paket `dist` | **keine Funde** |
| Abhängigkeiten (CVE) | `npm audit` | Laufzeit-Abhängigkeiten | **0 Schwachstellen** (nach Update vue-i18n 11.4.24) |
| Abhängigkeiten (CVE) | `npm audit` | Entwicklungswerkzeuge | 3 × mittel (eslint → minimatch, nur beim Entwickeln, nicht im ausgelieferten Programm) |
| SAST | Semgrep 1.187.0 (LGPL-2.1), Regeln aus `semgrep/semgrep-rules` (javascript, php, html, generic/secrets) | `src`, `inc`, `scripts`, `public/static/js`, `index.html` | 35 Hinweise, Bewertung siehe Abschnitt 2 |
| Lizenzen | Auswertung `package.json` aller Laufzeit-Abhängigkeiten | 72 Pakete | alle Open Source: 66 × MIT, 2 × BSD-2, 1 × BSD-3, 1 × ISC, 1 × 0BSD, 1 × MPL-2.0/Apache-2.0 |
| Externe Verbindungen | Playwright (Apache-2.0), Netzwerkmitschnitt beim Laden | Server- und lokale Variante | **keine** Verbindung zu Fremdservern beim Start (seit MathJax selbst ausgeliefert wird) |

## 2. Bewertung der Semgrep-Hinweise

Alle Hinweise betreffen Code des Originalprojekts (La Digitale) bzw. das Build-Skript; die MTK-Erweiterungen (Zirkel, Geodreieck, Füllen, Radierer, Werkzeugleiste) lösten keine Hinweise aus.

| Hinweis | Stelle | Bewertung |
|---|---|---|
| php-ssrf | `inc/api.php:62`, `inc/fonctions.php:27` | **Kein Befund.** Ziel ist die fest konfigurierte Digidrive-Adresse aus `.env`; Abrufe von Nutzer-URLs laufen über `chargerUrlPublique()` mit Prüfung auf öffentliche IP, festgenagelter DNS-Auflösung und nur HTTP/HTTPS. |
| weak-crypto (sha1) | `inc/limites.php:95, 157` | **Kein Befund.** SHA-1 dient nur zur Benennung eines Cache-Ordners/Schlüssels, nicht für Passwörter. Passwörter: `password_hash()` (bcrypt). |
| insecure-innerhtml | `src/panneau.js`, `public/static/js/pell.js` | **Kein Befund.** Inhalte laufen durch DOMPurify bzw. sind feste Texte; der Editor (pell) ist auf HTML-Eingabe ausgelegt. |
| avoid-v-html | 11 Vue-Komponenten | **Gering, nicht vollständig geprüft.** Ausgabe von Übersetzungstexten bzw. Inhalten, die Lehrkräfte selbst eingeben. In den Modulen Text und HTML wird mit DOMPurify bereinigt; die übrigen Module (u. a. Gruppen, Lückentext, Rangliste) wurden nicht einzeln geprüft. |
| unknown-value-with-script-tag, no-replaceall | `scripts/varianten.mjs` | **Kein Befund.** Build-Skript, verarbeitet nur eigene Build-Dateien. |
| echoed-request | `inc/recuperer_donnees_dgs.php`, `inc/recuperer_icone.php`, `inc/api.php:249` | **Relevant – siehe 3.1.** |
| robots-denied, template-explicit-unescape | `index.html` | **Kein Befund.** Platzhalter für Analyse-Skript, wird beim Bauen entfernt. |

## 3. Offene Punkte / Empfehlungen

### 3.1 Server-Konfiguration: `AUTHORIZED_DOMAINS` setzen (wichtig)
Ist `AUTHORIZED_DOMAINS` in der `.env` auf dem Server leer, nehmen die PHP-Skripte Anfragen von **jeder** fremden Webseite an und geben die Antwort als `text/html` aus. Eine präparierte fremde Seite könnte so eigenen HTML-/Script-Inhalt im Namen von digiscreen-mtk.de anzeigen lassen (reflektiertes XSS).
Nachgewiesen im lokalen Test: fremde Herkunft → HTTP 200; mit gesetzter Variable → HTTP 403.

**Abhilfe (nur Konfiguration, kein Code):** In der Datei `.env` im Webverzeichnis eintragen:
```
AUTHORIZED_DOMAINS=digiscreen-mtk.de
```
Zusätzlich empfehlenswert (Codeänderung, noch nicht umgesetzt): in `inc/headers.php` `Content-Type: text/plain` setzen.

### 3.2 Externe Dienste, die nur bei Nutzung angesprochen werden
YouTube-/Vimeo-Einbettungen (YouTube im datensparsamen „nocookie“-Modus), noembed.com (Vorschau bei Einbettungen), Pixabay- und YouTube-Suche (nur mit API-Schlüssel, derzeit nicht aktiv). Bei als einzelne HTML-Datei exportierten Tafeln wird MathJax – nur wenn eine Formel vorkommt – weiterhin von jsDelivr geladen, da diese Dateien keinen eigenen Server haben. Für die Datenschutzhinweise der Schulen dokumentieren.

### 3.3 Noch nicht umgesetzt (Anforderungen aus CLAUDE.md)
- Logging-Konzept mit Log-Levels (derzeit nur Apache-/PHP-Fehlerlog des Hosters).
- Automatisierte Tests im Repository inkl. Test-Caching (bisherige Playwright-Prüfungen liefen außerhalb des Repos).
- Trivy / OWASP Dependency Check / OWASP-Top-10-Prüfung.
- Update der Entwicklungswerkzeuge (eslint), um die 3 mittleren Hinweise zu beheben.

## 4. Änderungen im Rahmen dieser Prüfung
- MathJax 3.2.2 (Apache-2.0) wird aus `public/static/mathjax` vom eigenen Server geladen statt von cdn.jsdelivr.net, und nur, wenn eine Formel angezeigt wird.
- vue-i18n 10.0.8 → 11.4.24 (behebt 4 Schwachstellen „hoch“, XSS über `escapeParameter`).
- Diese Datei und die `CLAUDE.md` wurden ins Repository aufgenommen.
