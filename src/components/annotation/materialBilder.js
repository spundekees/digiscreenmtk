// Selbst gezeichnetes Anschauungsmaterial für die Annotation (Medienzentrum MTK):
// Spielgeld (Euro-Scheine und -Münzen, Größenverhältnisse wie im Original, Aufdruck „Spielgeld“)
// und Dienes-Material (Einer, Zehner, Hunderter, Tausender).
// Alle Bilder sind SVG-Grafiken, die hier erzeugt werden – keine fremden Bilddateien.

const MM = 1.4 // Pixel pro Millimeter (Originalmaße der Euro-Scheine und -Münzen)
const SCHRIFT = 'Andika, Arial, Helvetica, sans-serif'

function svg (w, h, inhalt) {
	return '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' + inhalt + '</svg>'
}

function r (n) {
	return Math.round(n * 100) / 100
}

// ---------- Scheine ----------
const SCHEINE = [
	{ wert: 5, mm: [120, 62], farbe: '#8d9a90', hell: '#e3e8e1', dunkel: '#4c5a50' },
	{ wert: 10, mm: [127, 67], farbe: '#d9645a', hell: '#f8dcd6', dunkel: '#8e2c25' },
	{ wert: 20, mm: [133, 72], farbe: '#4f80c0', hell: '#dbe6f5', dunkel: '#20467d' },
	{ wert: 50, mm: [140, 77], farbe: '#ee9140', hell: '#fde6cf', dunkel: '#9a4d0f' },
	{ wert: 100, mm: [147, 77], farbe: '#47a36e', hell: '#d9efe1', dunkel: '#1f6740' },
	{ wert: 200, mm: [153, 77], farbe: '#cfa93a', hell: '#f6ecc7', dunkel: '#7d6114' },
	{ wert: 500, mm: [160, 82], farbe: '#9a63b4', hell: '#ecdff3', dunkel: '#5b2d72' }
]

function sterne (cx, cy, rayon, taille, farbe) {
	let s = ''
	for (let i = 0; i < 12; i++) {
		const a = i / 12 * Math.PI * 2
		s += '<circle cx="' + r(cx + Math.sin(a) * rayon) + '" cy="' + r(cy - Math.cos(a) * rayon) + '" r="' + r(taille) + '" fill="' + farbe + '"/>'
	}
	return s
}

function schein (s) {
	const w = Math.round(s.mm[0] * MM)
	const h = Math.round(s.mm[1] * MM)
	const band = w * 0.34
	const t = String(s.wert)
	// Torbogen als Motiv (angelehnt an die Fenster und Tore der echten Scheine)
	const bx = band + w * 0.06
	const bw = w * 0.2
	const by = h * 0.22
	const bh = h * 0.6
	const bogen = '<path d="M' + r(bx) + ' ' + r(by + bh) + ' V' + r(by + bw / 2) + ' A' + r(bw / 2) + ' ' + r(bw / 2) + ' 0 0 1 ' + r(bx + bw) + ' ' + r(by + bw / 2) + ' V' + r(by + bh) + '" fill="none" stroke="' + s.farbe + '" stroke-width="' + r(h * 0.05) + '" stroke-linecap="round" opacity="0.75"/>' +
		'<path d="M' + r(bx + bw * 0.22) + ' ' + r(by + bh) + ' V' + r(by + bw * 0.62) + ' A' + r(bw * 0.28) + ' ' + r(bw * 0.28) + ' 0 0 1 ' + r(bx + bw * 0.78) + ' ' + r(by + bw * 0.62) + ' V' + r(by + bh) + '" fill="none" stroke="' + s.farbe + '" stroke-width="' + r(h * 0.025) + '" opacity="0.6"/>'
	const inhalt =
		'<rect x="1" y="1" width="' + (w - 2) + '" height="' + (h - 2) + '" rx="' + r(h * 0.06) + '" fill="' + s.hell + '" stroke="' + s.dunkel + '" stroke-width="1.5"/>' +
		'<path d="M' + r(h * 0.06 + 1) + ' 1 H' + r(band) + ' V' + (h - 1) + ' H' + r(h * 0.06 + 1) + ' A' + r(h * 0.06) + ' ' + r(h * 0.06) + ' 0 0 1 1 ' + r(h - 1 - h * 0.06) + ' V' + r(1 + h * 0.06) + ' A' + r(h * 0.06) + ' ' + r(h * 0.06) + ' 0 0 1 ' + r(h * 0.06 + 1) + ' 1 Z" fill="' + s.farbe + '"/>' +
		sterne(band * 0.5, h * 0.4, h * 0.2, h * 0.026, '#ffe14d') +
		'<text x="' + r(band * 0.5) + '" y="' + r(h * 0.84) + '" font-family="' + SCHRIFT + '" font-size="' + r(h * 0.085) + '" font-weight="700" fill="#fff" text-anchor="middle" letter-spacing="1">SPIELGELD</text>' +
		bogen +
		'<text x="' + r(w * 0.94) + '" y="' + r(h * 0.36) + '" font-family="' + SCHRIFT + '" font-size="' + r(h * (t.length > 2 ? 0.28 : 0.34)) + '" font-weight="700" fill="' + s.dunkel + '" text-anchor="end" dominant-baseline="central">' + t + '</text>' +
		'<text x="' + r(w * 0.94) + '" y="' + r(h * 0.7) + '" font-family="' + SCHRIFT + '" font-size="' + r(h * 0.13) + '" font-weight="700" fill="' + s.dunkel + '" text-anchor="end" letter-spacing="1">EURO</text>'
	return { svg: svg(w, h, inhalt), w, h }
}

// ---------- Münzen ----------
const KUPFER = ['#e9a06b', '#c06a33', '#7a3a12']
const GOLD = ['#f3dc8d', '#cfa63c', '#7d5f12']
const SILBER = ['#f2f3f5', '#b7bcc3', '#5f656d']

const MUENZEN = [
	{ cle: '1ct', wert: '1', einheit: 'CENT', mm: 16.25, innen: KUPFER },
	{ cle: '2ct', wert: '2', einheit: 'CENT', mm: 18.75, innen: KUPFER },
	{ cle: '5ct', wert: '5', einheit: 'CENT', mm: 21.25, innen: KUPFER },
	{ cle: '10ct', wert: '10', einheit: 'CENT', mm: 19.75, innen: GOLD },
	{ cle: '20ct', wert: '20', einheit: 'CENT', mm: 22.25, innen: GOLD },
	{ cle: '50ct', wert: '50', einheit: 'CENT', mm: 24.25, innen: GOLD },
	{ cle: '1e', wert: '1', einheit: 'EURO', mm: 23.25, innen: SILBER, ring: GOLD },
	{ cle: '2e', wert: '2', einheit: 'EURO', mm: 25.75, innen: GOLD, ring: SILBER }
]

function muenze (m) {
	const d = Math.round(m.mm * MM * 1.5) // Münzen größer als maßstäblich (untereinander aber im richtigen Verhältnis), damit die Schrift lesbar bleibt
	const c = d / 2
	const rand = m.ring || m.innen
	const id = 'g' + m.cle
	let inhalt = '<defs>' +
		'<radialGradient id="' + id + 'a" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="' + rand[0] + '"/><stop offset="1" stop-color="' + rand[1] + '"/></radialGradient>' +
		'<radialGradient id="' + id + 'b" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="' + m.innen[0] + '"/><stop offset="1" stop-color="' + m.innen[1] + '"/></radialGradient>' +
		'</defs>' +
		'<circle cx="' + c + '" cy="' + c + '" r="' + r(c - 0.8) + '" fill="url(#' + id + 'a)" stroke="' + rand[2] + '" stroke-width="1.2"/>'
	if (m.ring) {
		inhalt += '<circle cx="' + c + '" cy="' + c + '" r="' + r(c * 0.7) + '" fill="url(#' + id + 'b)" stroke="' + m.innen[2] + '" stroke-width="0.8"/>'
	} else {
		inhalt += '<circle cx="' + c + '" cy="' + c + '" r="' + r(c * 0.86) + '" fill="none" stroke="' + rand[2] + '" stroke-width="0.6" opacity="0.6"/>'
	}
	const farbeText = m.innen[2]
	inhalt += '<text x="' + c + '" y="' + r(c * 0.9) + '" font-family="' + SCHRIFT + '" font-size="' + r(d * (m.wert.length > 1 ? 0.36 : 0.42)) + '" font-weight="700" fill="' + farbeText + '" text-anchor="middle" dominant-baseline="central">' + m.wert + '</text>' +
		'<text x="' + c + '" y="' + r(c * 1.42) + '" font-family="' + SCHRIFT + '" font-size="' + r(d * 0.13) + '" font-weight="700" fill="' + farbeText + '" text-anchor="middle" dominant-baseline="central">' + m.einheit + '</text>'
	return { svg: svg(d, d, inhalt), w: d, h: d }
}

// ---------- Dienes-Material ----------
// Leichte Zentralperspektive (Fluchtpunkt oben rechts): Kanten nach hinten laufen zusammen,
// statt wie beim Schrägbild optisch auseinanderzugehen.
const U = 16 // Kantenlänge eines Einerwürfels in px (Vorderseite)
const NEIGUNG = 0.42 // Versatz je Einheit Tiefe an der Vorderkante
const FLUCHT = 0.012 // Verkleinerung nach hinten je Einheit Tiefe
const HOLZ = { vorne: '#f3d49a', oben: '#f9e6c1', seite: '#ddb36d', linie: '#9a6b2c' }

function dienes (b, h, t) {
	// Fluchtpunkt relativ zur Mitte der Vorderseite
	const vx = b * U / 2 + NEIGUNG * U / FLUCHT
	const vy = h * U / 2 - NEIGUNG * U / FLUCHT
	const proj = (x, y, z) => {
		const s = 1 / (1 + FLUCHT * z)
		return [vx + (x * U - vx) * s, vy + (y * U - vy) * s]
	}
	const ecken = [proj(0, 0, 0), proj(b, h, 0), proj(0, 0, t), proj(b, 0, t), proj(b, h, t)]
	const pad = 2
	const minX = Math.min(...ecken.map((e) => e[0]))
	const minY = Math.min(...ecken.map((e) => e[1]))
	const maxX = Math.max(...ecken.map((e) => e[0]))
	const maxY = Math.max(...ecken.map((e) => e[1]))
	const P = (x, y, z) => {
		const q = proj(x, y, z)
		return [q[0] - minX + pad, q[1] - minY + pad]
	}
	const w = Math.ceil(maxX - minX + 2 * pad)
	const hh = Math.ceil(maxY - minY + 2 * pad)
	const pts = (liste) => liste.map((q) => r(q[0]) + ',' + r(q[1])).join(' ')
	const trait = 'stroke="' + HOLZ.linie + '" stroke-width="0.9"'
	const ligne = (a, c) => '<line x1="' + r(a[0]) + '" y1="' + r(a[1]) + '" x2="' + r(c[0]) + '" y2="' + r(c[1]) + '" ' + trait + '/>'
	let lignes = ''
	// Vorderseite
	for (let i = 1; i < b; i++) lignes += ligne(P(i, 0, 0), P(i, h, 0))
	for (let j = 1; j < h; j++) lignes += ligne(P(0, j, 0), P(b, j, 0))
	// Oberseite
	for (let i = 1; i < b; i++) lignes += ligne(P(i, 0, 0), P(i, 0, t))
	for (let k = 1; k < t; k++) lignes += ligne(P(0, 0, k), P(b, 0, k))
	// rechte Seite
	for (let j = 1; j < h; j++) lignes += ligne(P(b, j, 0), P(b, j, t))
	for (let k = 1; k < t; k++) lignes += ligne(P(b, 0, k), P(b, h, k))
	const bord = 'stroke="' + HOLZ.linie + '" stroke-width="1.4" stroke-linejoin="round"'
	const inhalt =
		'<polygon points="' + pts([P(0, 0, 0), P(b, 0, 0), P(b, 0, t), P(0, 0, t)]) + '" fill="' + HOLZ.oben + '" ' + bord + '/>' +
		'<polygon points="' + pts([P(b, 0, 0), P(b, 0, t), P(b, h, t), P(b, h, 0)]) + '" fill="' + HOLZ.seite + '" ' + bord + '/>' +
		'<polygon points="' + pts([P(0, 0, 0), P(b, 0, 0), P(b, h, 0), P(0, h, 0)]) + '" fill="' + HOLZ.vorne + '" ' + bord + '/>' +
		lignes
	return { svg: svg(w, hh, inhalt), w, h: hh }
}

// ---------- Katalog ----------
export const KATALOG = {
	geld: [
		...SCHEINE.map((s) => ({ motif: 'schein-' + s.wert, titre: s.wert + ' €', ...schein(s) })),
		...MUENZEN.map((m) => ({ motif: 'muenze-' + m.cle, titre: m.einheit === 'CENT' ? m.wert + ' ct' : m.wert + ' €', ...muenze(m) }))
	],
	dienes: [
		{ motif: 'dienes-1', titre: 'einer', ...dienes(1, 1, 1) },
		{ motif: 'dienes-10', titre: 'zehner', ...dienes(1, 10, 1) },
		{ motif: 'dienes-10q', titre: 'zehnerQuer', ...dienes(10, 1, 1) },
		{ motif: 'dienes-100', titre: 'hunderter', ...dienes(10, 10, 1) },
		{ motif: 'dienes-1000', titre: 'tausender', ...dienes(10, 10, 10) }
	]
}

export const MOTIFS = {}
Object.values(KATALOG).forEach((liste) => liste.forEach((e) => {
	e.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(e.svg)
	MOTIFS[e.motif] = e
}))
