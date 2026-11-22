# Digiscreen

Digiscreen est un fond d'écran interactif pour la classe en présence ou à distance. 

L'application est publiée sous licence GNU AGPLv3.
Sauf les fontes Anton, Baloo Bhaijaan 2, Barrio, Finger Paint, Fredericka The Great, Life Savers, Love Ya Like A Sister, Material Icons, Orbitron, Righteous, Roboto Serif et Roboto Mono (Apache License Version 2.0), la fonte Mona Sans Expanded (Sil Open Font Licence 1.1), la fonte Marelle (https://marelle.forge.apps.education.fr/index.html - Sil Open Font Licence 1.1), la fonte Luciole (https://www.luciole-vision.com/fr/index.html - CC BY 4.0) et la fonte OpenDyslexic (Sil Open Font Licence 1.1)

Les symboles pictographiques utilisés dans le module Histoire sont la propriété du Gouvernement d'Aragon et ont été créés par Sergio Palao pour ARASAAC (https://arasaac.org), qui les distribuent sous Licence Creative Commons BY-NC-SA 4.0.

Les émojis utilisés dans les modules Rétroaction et Météo de l'humeur proviennent du projet OpenMoji (https://openmoji.org) et sont publiés sous Licence Creative Commons BY-SA 4.0.

Les sons utilisés dans le module Compte à rebours proviennent de la Sonothèque (https://lasonotheque.org) et sont publiés dans le domaine public.

## Prérequis
PHP 8.4+

## Préparation et installation des dépendances
```
npm install
composer install (uniquement nécessaire en combinaison avec Digidrive)
```

## Lancement du serveur de développement
```
npm run dev
```

## Variables d'environnement (fichier .env.production à créer à la racine avant compilation)
```
AUTHORIZED_DOMAINS (liste des domaines externes autorisés, séparés par une virgule, par ex. ladigitale.dev,http://localhost:8080 / schéma facultatif, https par défaut / http accepté uniquement si APP_ENV=dev / vide ou * par défaut : tous les domaines peuvent appeler l'application, mais l'API Digidrive est désactivée, sauf avec * et APP_ENV=dev)
APP_ENV (dev ou prod / prod par défaut / dev accepte les domaines en http et active l'API Digidrive avec AUTHORIZED_DOMAINS=*)
VITE_GOOGLE_API_KEY (clé API Google pour Youtube)
VITE_PIXABAY_API_KEY (clé API Pixabay)
VITE_UMAMI_SCRIPT_URL (lien vers le script fourni par Umami pour l'analyse de trafic)
VITE_UMAMI_WEBSITE_ID (id de site sur le serveur Umami)
S3_ENDPOINT (endpoint S3 / uniquement nécessaire en combinaison avec Digidrive)
S3_ACCESS_KEY (clé d'accès S3 / uniquement nécessaire en combinaison avec Digidrive)
S3_SECRET_KEY (clé secrète d'accès S3 / uniquement nécessaire en combinaison avec Digidrive)
S3_REGION (région du conteneur S3 / uniquement nécessaire en combinaison avec Digidrive)
S3_BUCKET (nom du conteneur s3 / uniquement nécessaire en combinaison avec Digidrive)
DIGIDRIVE_BASE (lien vers une instance Digidrive pour la validation des tickets d'ouverture des contenus / uniquement nécessaire si l'API Digidrive est utilisée)
```

## Variables d'environnement pour les limites de débit (facultatives)
```
TRUSTED_PROXIES (adresses ou réseaux CIDR des proxys inverses de confiance, séparés par une virgule, par ex. 10.0.0.0/8 / l'adresse du client est alors lue dans X-Forwarded-For / vide par défaut / les adresses IPv6 sont regroupées par préfixe /64)
RATE_LIMIT_AUTHOR_FAILURES (mots de passe incorrects autorisés par adresse IP et par contenu, à l'ouverture, à l'enregistrement et dans l'API Digidrive / 20 par défaut)
RATE_LIMIT_AUTHOR_WINDOW (durée de la fenêtre en secondes pour les mots de passe incorrects / 900 par défaut)
RATE_LIMIT_CREATIONS (créations et téléversements de contenus par l'API Digidrive, par heure et par adresse IP / 600 par défaut)
RATE_LIMIT_TICKET_FAILURES (tickets d'ouverture Digidrive refusés par 10 minutes et par adresse IP / 30 par défaut)
RATE_LIMIT_OPENINGS (ouvertures de fichiers .dgs distants par 10 minutes et par adresse IP / 600 par défaut)
RATE_LIMIT_NETWORK (récupérations d'icônes de sites par 10 minutes et par adresse IP / 150 par défaut)
```

## Compilation et minification des fichiers
```
npm run build
```

## Serveur PHP pour le développement en local
```
php -S 127.0.0.1:8000
```

## Protection des fichiers sensibles (production)
Le fichier `.htaccess` fourni (copié dans `dist` lors de la compilation) bloque sous Apache l'accès direct au fichier `.env`, à la base SQLite et au dossier `vendor`. Avec Nginx, ajouter la règle suivante avant le bloc `location` qui transmet les fichiers `.php` à PHP-FPM, en adaptant le préfixe `/digiscreen/` au chemin de l'application (le supprimer si elle est servie à la racine du domaine) :
```
location ~ ^/digiscreen/(\.env$|inc/.+\.db(-journal)?$|vendor/) {
	deny all;
}
```

## Démo
https://ladigitale.dev/digiscreen/

## Comment contribuer ?
Pour signaler des bugs, proposer des améliorations ou de nouvelles fonctionnalités, vous pouvez ouvrir un ticket sur ce dépôt, publier un message sur [ce mur](https://digipad.app/p/8/64dab892e6eab) ou m'envoyer un e-mail.

Les demandes d'ajouts (Pull Requests) ne sont plus acceptées pour le moment. En effet, une contribution au code nécessite souvent plusieurs heures pour être révisée et commentée et ce n'est pas toujours compatible avec les priorités et le temps que je peux consacrer au projet.

Il est possible de soutenir financièrement le projet via [Liberapay](https://liberapay.com/ladigitale/), [Open Collective](https://opencollective.com/ladigitale) ou [Stripe](https://donate.stripe.com/4gweWveqf2sc6KAcMO).

Vous trouverez d'autres idées de contribution sur [cette page](https://ladigitale.dev/contribuer.html).

Merci pour votre soutien ! N'hésitez pas à me contacter si vous avez des questions.

## Remerciements et crédits
Traduction en italien par [Paolo Mauri](https://gitlab.com/maupao) et Roberto Marcolin (nilocram)

Traduction en espagnol par [Fernando S. Delgado Trujillo](https://gitlab.com/fersdt)

Traduction en néerlandais par Erik Devlies

Traduction en allemand lors d'une action dans « la salle des profs » [#twitterlehrerzimmer](https://twitter.com/search?q=%23twitterlehrerzimmer) / [#twlz](https://twitter.com/search?q=%23twlz) par [@uivens](https://twitter.com/uivens) (Ulrich Ivens), [@eBildungslabor](https://twitter.com/eBildungslabor) (Nele Hirsch) et [@teachitalizer](https://twitter.com/teachitalizer) (Holger Skarba)

Traduction en croate par [Ksenija Lekić](https://gitlab.com/Ksenija66L)

Traduction en basque par [Eder Etxebarria](https://translate.codeberg.org/user/eder@betxepare.eus/)
