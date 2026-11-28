// Schreiblineaturen als „Blatt“: feste Breite mit Rand links und rechts,
// Zeilen wiederholen sich nur nach unten, verschieben nur nach oben/unten (Medienzentrum MTK).
const BLAETTER = ['/img/lineatur-haeuschen', '/img/seyes.png', '/img/lignes-horizontales.png']

export function istBlatt (fond) {
	return typeof fond === 'string' && BLAETTER.some((teil) => fond.includes(teil))
}

export function blattBreite (largeur) {
	const rand = Math.max(24, Math.round(largeur * 0.04))
	return Math.max(320, Math.min(1400, largeur - 2 * rand))
}

// Bezugspunkt des Musters (für Skalierung der Zeichnungen), relativ zur linken oberen Ecke von <main>
export function pivotFond (fond, largeur, hauteur, d) {
	if (istBlatt(fond)) {
		const x = Math.round((largeur - blattBreite(largeur)) / 2)
		// Fester Punkt beim Zoomen: linker Blattrand (beim Häuschen die linke Hauswand)
		return fond.includes('/img/lineatur-haeuschen') ? { x: x, y: d.y } : { x: x, y: hauteur / 2 + d.y }
	}
	return { x: largeur / 2 + d.x, y: hauteur / 2 + d.y }
}
