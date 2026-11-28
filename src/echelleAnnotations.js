import { markRaw } from 'vue'

// Annotationen einer Seite mitskalieren, wenn der Schreib-Hintergrund vergrößert oder verkleinert wird.
// f = Faktor, (px, py) = Drehpunkt in Stage-Koordinaten (Bezugspunkt des Hintergrundmusters).
// Punktbasierte Objekte (Striche, Linien, Pfeile, Kreisbögen) werden direkt umgerechnet, damit die
// Anfasspunkte zum Bearbeiten weiter stimmen. Formen, Texte und Füllungen werden über ihren Maßstab skaliert.
// Die Strichdicke bleibt dabei immer gleich – nur Lage und Größe ändern sich.
export default function echelonnerAnnotations (items, f, px, py) {
	if (!Array.isArray(items) || !(f > 0) || f === 1) {
		return
	}
	const map = (x, y) => ({ x: px + (x - px) * f, y: py + (y - py) * f })
	items.forEach((item) => {
		if (!item || typeof item !== 'object') {
			return
		}
		const ox = item.x || 0
		const oy = item.y || 0
		const sx = item.scaleX || 1
		const sy = item.scaleY || 1
		const pointBase = (item.objet === 'dessin' || item.objet === 'gomme' || item.objet === 'ligne' || item.objet === 'fleche') && Array.isArray(item.points) && !item.rotation
		if (pointBase) {
			// Geodreieck-Strecken liegen um die halbe Strichdicke neben der Kante: diesen Abstand beibehalten
			const ax = item.geoAussen ? item.geoAussen.x * item.geoAussen.d : 0
			const ay = item.geoAussen ? item.geoAussen.y * item.geoAussen.d : 0
			const points = []
			for (let i = 0; i + 1 < item.points.length; i += 2) {
				const p = map(ox + item.points[i] * sx - ax, oy + item.points[i + 1] * sy - ay)
				points.push(Math.round((p.x + ax) * 100) / 100, Math.round((p.y + ay) * 100) / 100)
			}
			item.points = markRaw(points)
			item.x = 0
			item.y = 0
			item.scaleX = 1
			item.scaleY = 1
			if (item.zirkel) {
				const c = map(ox + item.zirkel.x * sx, oy + item.zirkel.y * sy)
				item.zirkel = { x: c.x, y: c.y, r: item.zirkel.r * sx * f, a0: item.zirkel.a0, a1: item.zirkel.a1 }
			}
		} else if (item.objet === 'uhr') {
			// Lernuhr: Mittelpunkt und Radius
			const p = map(ox, oy)
			item.x = p.x
			item.y = p.y
			item.r = Math.min(Math.max((item.r || 150) * f, 30), 1500)
		} else if (item.objet === 'ancre') {
			// Anfasspunkte: nur die Lage ändern, die Größe des Griffs bleibt
			const p = map(ox, oy)
			item.x = p.x
			item.y = p.y
		} else {
			const p = map(ox, oy)
			item.x = p.x
			item.y = p.y
			item.scaleX = sx * f
			item.scaleY = sy * f
			// Ränder von Formen nicht dicker oder dünner werden lassen
			item.strokeScaleEnabled = false
		}
	})
}

// Annotationen verschieben (Hintergrund wird verschoben). Punktbasierte Objekte werden direkt umgerechnet.
export function deplacerAnnotations (items, dx, dy) {
	if (!Array.isArray(items) || (dx === 0 && dy === 0)) {
		return
	}
	items.forEach((item) => {
		if (!item || typeof item !== 'object') {
			return
		}
		const pointBase = (item.objet === 'dessin' || item.objet === 'gomme' || item.objet === 'ligne' || item.objet === 'fleche') && Array.isArray(item.points) && !item.rotation && (item.scaleX || 1) === 1 && (item.scaleY || 1) === 1
		if (pointBase) {
			const ox = (item.x || 0) + dx
			const oy = (item.y || 0) + dy
			const points = []
			for (let i = 0; i + 1 < item.points.length; i += 2) {
				points.push(item.points[i] + ox, item.points[i + 1] + oy)
			}
			item.points = markRaw(points)
			if (item.zirkel) {
				item.zirkel = Object.assign({}, item.zirkel, { x: item.zirkel.x + ox, y: item.zirkel.y + oy })
			}
			item.x = 0
			item.y = 0
		} else {
			item.x = (item.x || 0) + dx
			item.y = (item.y || 0) + dy
		}
	})
}
