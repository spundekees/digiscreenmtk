# Digiscreen

> **Angepasste Version des Medienzentrums Main-Taunus-Kreis**
> Dieses Repository basiert auf [Digiscreen von La Digitale](https://codeberg.org/ladigitale/digiscreen) (Emmanuel Zimmert) und wurde vom Medienzentrum MTK erweitert, u. a. um Zirkel, Geodreieck, Füllwerkzeug, Grundschul-Lineatur sowie skalierbare und verschiebbare Hintergründe.
> Online: https://spundekees.github.io/digiscreenmtk/ – Hinweise zu Build und Veröffentlichung dieser Version stehen in [README-MTK.md](README-MTK.md).
> Der folgende Text ist eine deutsche Übersetzung der README des Originalprojekts.

Digiscreen ist ein interaktiver Bildschirmhintergrund für den Unterricht im Klassenzimmer oder auf Distanz.

Die Anwendung wird unter der Lizenz GNU AGPLv3 veröffentlicht.
Ausgenommen sind die Schriften Anton, Baloo Bhaijaan 2, Barrio, Finger Paint, Fredericka The Great, Life Savers, Love Ya Like A Sister, Material Icons, Orbitron, Righteous, Roboto Serif und Roboto Mono (Apache License Version 2.0), die Schrift Mona Sans Expanded (SIL Open Font Licence 1.1), die Schrift Marelle (https://marelle.forge.apps.education.fr/index.html – SIL Open Font Licence 1.1), die Schrift Luciole (https://www.luciole-vision.com/fr/index.html – CC BY 4.0) und die Schrift OpenDyslexic (SIL Open Font Licence 1.1).

Die im Modul „Geschichte“ verwendeten Piktogramme sind Eigentum der Regierung von Aragonien und wurden von Sergio Palao für ARASAAC (https://arasaac.org) erstellt, die sie unter der Lizenz Creative Commons BY-NC-SA 4.0 verbreitet.

Die in den Modulen „Feedback“ und „Stimmungsbarometer“ verwendeten Emojis stammen aus dem Projekt OpenMoji (https://openmoji.org) und werden unter der Lizenz Creative Commons BY-SA 4.0 veröffentlicht.

Die im Modul „Countdown“ verwendeten Klänge stammen aus der Sonothèque (https://lasonotheque.org) und sind gemeinfrei.

## Voraussetzungen
PHP 8.4+

## Vorbereitung und Installation der Abhängigkeiten
```
npm install
composer install (nur in Verbindung mit Digidrive erforderlich)
```

## Entwicklungsserver starten
```
npm run dev
```

## Umgebungsvariablen (Datei .env.production vor dem Kompilieren im Hauptverzeichnis anlegen)
```
AUTHORIZED_DOMAINS (Liste der zugelassenen externen Domains, durch Komma getrennt, z. B. ladigitale.dev,http://localhost:8080 / Schema optional, Standard https / http nur bei APP_ENV=dev zulässig / leer oder * als Standard: alle Domains dürfen die Anwendung aufrufen, die Digidrive-API ist dann aber deaktiviert, außer bei * und APP_ENV=dev)
APP_ENV (dev oder prod / Standard prod / dev erlaubt Domains mit http und aktiviert die Digidrive-API bei AUTHORIZED_DOMAINS=*)
VITE_GOOGLE_API_KEY (Google-API-Schlüssel für YouTube)
VITE_PIXABAY_API_KEY (Pixabay-API-Schlüssel)
VITE_UMAMI_SCRIPT_URL (Link zum von Umami bereitgestellten Skript für die Zugriffsanalyse)
VITE_UMAMI_WEBSITE_ID (Website-ID auf dem Umami-Server)
S3_ENDPOINT (S3-Endpunkt / nur in Verbindung mit Digidrive erforderlich)
S3_ACCESS_KEY (S3-Zugriffsschlüssel / nur in Verbindung mit Digidrive erforderlich)
S3_SECRET_KEY (geheimer S3-Zugriffsschlüssel / nur in Verbindung mit Digidrive erforderlich)
S3_REGION (Region des S3-Buckets / nur in Verbindung mit Digidrive erforderlich)
S3_BUCKET (Name des S3-Buckets / nur in Verbindung mit Digidrive erforderlich)
DIGIDRIVE_BASE (Link zu einer Digidrive-Instanz zur Prüfung der Öffnungs-Tickets für Inhalte / nur erforderlich, wenn die Digidrive-API genutzt wird)
```

## Umgebungsvariablen für Ratenbegrenzungen (optional)
```
TRUSTED_PROXIES (Adressen oder CIDR-Netze vertrauenswürdiger Reverse-Proxys, durch Komma getrennt, z. B. 10.0.0.0/8 / die Client-Adresse wird dann aus X-Forwarded-For gelesen / Standard leer / IPv6-Adressen werden nach /64-Präfix zusammengefasst)
RATE_LIMIT_AUTHOR_FAILURES (erlaubte falsche Passwörter pro IP-Adresse und Inhalt beim Öffnen, beim Speichern und in der Digidrive-API / Standard 20)
RATE_LIMIT_AUTHOR_WINDOW (Länge des Zeitfensters für falsche Passwörter in Sekunden / Standard 900)
RATE_LIMIT_CREATIONS (Erstellen und Hochladen von Inhalten über die Digidrive-API pro Stunde und IP-Adresse / Standard 600)
RATE_LIMIT_TICKET_FAILURES (abgelehnte Digidrive-Öffnungs-Tickets pro 10 Minuten und IP-Adresse / Standard 30)
RATE_LIMIT_OPENINGS (Öffnen entfernter .dgs-Dateien pro 10 Minuten und IP-Adresse / Standard 600)
RATE_LIMIT_NETWORK (Abrufe von Website-Icons pro 10 Minuten und IP-Adresse / Standard 150)
```

## Dateien kompilieren und minifizieren
```
npm run build
```

## PHP-Server für die lokale Entwicklung
```
php -S 127.0.0.1:8000
```

## Schutz sensibler Dateien (Produktivbetrieb)
Die mitgelieferte Datei `.htaccess` (wird beim Kompilieren nach `dist` kopiert) sperrt unter Apache den direkten Zugriff auf die Datei `.env`, die SQLite-Datenbank und den Ordner `vendor`. Bei Nginx folgende Regel vor dem `location`-Block einfügen, der `.php`-Dateien an PHP-FPM weiterreicht. Dabei das Präfix `/digiscreen/` an den Pfad der Anwendung anpassen (bzw. entfernen, wenn sie direkt im Hauptverzeichnis der Domain liegt):
```
location ~ ^/digiscreen/(\.env$|inc/.+\.db(-journal)?$|vendor/) {
	deny all;
}
```

## Demo
https://ladigitale.dev/digiscreen/

## Wie kann ich beitragen?
*(Dieser Abschnitt bezieht sich auf das Originalprojekt von La Digitale.)*

Um Fehler zu melden, Verbesserungen oder neue Funktionen vorzuschlagen, kannst du ein Ticket im [Original-Repository](https://codeberg.org/ladigitale/digiscreen) eröffnen, eine Nachricht auf [dieser Pinnwand](https://digipad.app/p/8/64dab892e6eab) hinterlassen oder dem Autor eine E-Mail schicken.

Pull Requests werden derzeit nicht angenommen. Ein Code-Beitrag braucht oft mehrere Stunden, um geprüft und kommentiert zu werden, und das lässt sich nicht immer mit den Prioritäten und der Zeit vereinbaren, die der Autor für das Projekt aufwenden kann.

Das Projekt kann finanziell über [Liberapay](https://liberapay.com/ladigitale/), [Open Collective](https://opencollective.com/ladigitale) oder [Stripe](https://donate.stripe.com/4gweWveqf2sc6KAcMO) unterstützt werden.

Weitere Ideen, wie man beitragen kann, gibt es auf [dieser Seite](https://ladigitale.dev/contribuer.html).

Danke für deine Unterstützung! Bei Fragen kannst du dich gern beim Autor melden.

## Dank und Mitwirkende
Italienische Übersetzung von [Paolo Mauri](https://gitlab.com/maupao) und Roberto Marcolin (nilocram)

Spanische Übersetzung von [Fernando S. Delgado Trujillo](https://gitlab.com/fersdt)

Niederländische Übersetzung von Erik Devlies

Deutsche Übersetzung im Rahmen einer Aktion im „Lehrerzimmer“ [#twitterlehrerzimmer](https://twitter.com/search?q=%23twitterlehrerzimmer) / [#twlz](https://twitter.com/search?q=%23twlz) von [@uivens](https://twitter.com/uivens) (Ulrich Ivens), [@eBildungslabor](https://twitter.com/eBildungslabor) (Nele Hirsch) und [@teachitalizer](https://twitter.com/teachitalizer) (Holger Skarba)

Kroatische Übersetzung von [Ksenija Lekić](https://gitlab.com/Ksenija66L)

Baskische Übersetzung von [Eder Etxebarria](https://translate.codeberg.org/user/eder@betxepare.eus/)

Erweiterungen der MTK-Version: Medienzentrum Main-Taunus-Kreis
