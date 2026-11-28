// Erzeugt aus dem Build-Ordner „dist“ zwei Varianten (Erweiterung Medienzentrum MTK):
//   ausgabe/server – statische Webseite (z. B. GitHub Pages), ohne PHP-Teil und ohne .env
//   ausgabe/lokal  – startet per Doppelklick auf index.html direkt vom Rechner (file://)
// Aufruf: npm run build:varianten
import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import process from 'node:process'

const racine = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(racine, 'dist')
const ausgabe = join(racine, 'ausgabe')
const server = join(ausgabe, 'server')
const lokal = join(ausgabe, 'lokal')

if (!existsSync(join(dist, 'index.html'))) {
	console.error('Kein Build gefunden. Bitte zuerst „npm run build:dist“ ausführen.')
	process.exit(1)
}

rmSync(ausgabe, { recursive: true, force: true })
mkdirSync(ausgabe, { recursive: true })

// ---------------------------------------------------------------- Server-Variante (statisch)
// PHP-Teil, Abhängigkeiten und Umgebungsdatei gehören nicht auf eine statische Webseite
const nichtKopieren = new Set(['inc', 'vendor', '.env', '.htaccess'])
cpSync(dist, server, { recursive: true, filter: (quelle) => !nichtKopieren.has(basename(quelle)) || normalize(dirname(quelle)) !== normalize(dist) })
// GitHub Pages soll Dateien nicht mit Jekyll verarbeiten
writeFileSync(join(server, '.nojekyll'), '')

// ---------------------------------------------------------------- Lokale Variante (file://)
cpSync(server, lokal, { recursive: true })
rmSync(join(lokal, '.nojekyll'), { force: true })

const assets = join(lokal, 'static', 'assets')
const fichiers = readdirSync(assets)
const js = fichiers.find((f) => /^index-.*\.js$/.test(f))
const css = fichiers.find((f) => /^index-.*\.css$/.test(f))
if (!js || !css) {
	console.error('index-*.js oder index-*.css nicht gefunden.')
	process.exit(1)
}

// 1. Module laufen unter file:// nicht – als klassisches Skript laden; import.meta.url ersetzen
let code = readFileSync(join(assets, js), 'utf8')
code = code.replaceAll('import.meta.url', 'window.__dsAssetBase')
if (/\bimport\s*\(|^\s*import\s|\bexport\s*\{/m.test(code)) {
	console.warn('Achtung: Das Skript enthält noch import/export – die lokale Variante funktioniert dann evtl. nicht.')
}
writeFileSync(join(assets, js), code)

// 2. Schriften dürfen unter file:// nicht nachgeladen werden – als data-URL ins CSS; CSS in die Seite
let feuille = readFileSync(join(assets, css), 'utf8')
const mime = { woff2: 'font/woff2', woff: 'font/woff', ttf: 'font/ttf', otf: 'font/otf' }
feuille = feuille.replace(/url\(([^)]+)\)/g, (tout, brut) => {
	const url = brut.trim().replace(/^['"]|['"]$/g, '')
	if (url.startsWith('data:') || /^https?:/.test(url)) return tout
	const chemin = normalize(join(assets, url.split(/[?#]/)[0]))
	if (!existsSync(chemin)) return tout
	const ext = chemin.split('.').pop().toLowerCase()
	if (mime[ext]) {
		return 'url(data:' + mime[ext] + ';base64,' + readFileSync(chemin).toString('base64') + ')'
	}
	// Bilder bleiben Dateien; Pfad relativ zur Seite statt zum CSS
	return 'url(./static/assets/' + basename(chemin) + ')'
})

let html = readFileSync(join(lokal, 'index.html'), 'utf8')
html = html.replace(/\s*<script type="module" crossorigin src="[^"]+"><\/script>/, '')
html = html.replace(/<link rel="stylesheet" crossorigin href="[^"]+">/, () => '<style>\n' + feuille + '\n</style>')
html = html.replace('<div id="app"></div>', '<div id="app"></div>\n\t\t<script>window.__dsAssetBase = new URL("./static/assets/", location.href).href</script>')
// Hauptskript nach den Hilfsskripten laden (wie im Original: Bibliotheken zuerst)
html = html.replace(/(<script src="\.\/static\/js\/charger-mathjax\.js" async><\/script>)/, '$1\n\t\t<script src="./static/assets/' + js + '"></script>')
if (!html.includes('./static/assets/' + js)) {
	html = html.replace('</body>', '\t<script src="./static/assets/' + js + '"></script>\n\t</body>')
}
writeFileSync(join(lokal, 'index.html'), html)
rmSync(join(lokal, 'README.md'), { force: true })
writeFileSync(join(lokal, 'ANLEITUNG.txt'), [
	'Digiscreen – Version des Medienzentrums Main-Taunus-Kreis (lokal startbar)',
	'',
	'1. Den ganzen Ordner auf den Rechner (oder einen USB-Stick) kopieren.',
	'2. Die Datei index.html doppelklicken – Digiscreen öffnet sich im Browser.',
	'',
	'Die Grundfunktionen laufen ohne Internet. Einige Module (z. B. Bildersuche,',
	'Videos, Einbettungen) brauchen weiterhin eine Internetverbindung.',
	'',
	'Online-Version: https://digiscreen-mtk.de/',
	'Quellcode und Lizenz (GNU AGPLv3): https://github.com/spundekees/digiscreenmtk',
	''
].join('\r\n'))

// Lokale Variante zusätzlich als ZIP auf die Webseite legen (verlinkt im „Über“-Fenster)
const zipOrdner = join(ausgabe, 'digiscreen-lokal')
rmSync(zipOrdner, { recursive: true, force: true })
cpSync(lokal, zipOrdner, { recursive: true })
try {
	execFileSync('zip', ['-qr9', join('server', 'digiscreen-lokal.zip'), 'digiscreen-lokal'], { cwd: ausgabe })
	console.log('  ' + join(server, 'digiscreen-lokal.zip') + '  (ZIP der lokalen Variante)')
} catch {
	console.warn('Hinweis: „zip“ nicht gefunden – digiscreen-lokal.zip wurde nicht erstellt.')
}
rmSync(zipOrdner, { recursive: true, force: true })

console.log('Fertig:')
console.log('  ' + server + '  (Webseite)')
console.log('  ' + lokal + '  (lokal per Doppelklick)')
