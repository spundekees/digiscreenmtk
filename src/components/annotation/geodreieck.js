// Geodreieck für die Annotationen: Darstellung, Verschieben/Drehen/Skalieren, Einrasten und
// gerade Stiftlinien entlang der Kanten. Gehört zu annotation.vue (nutzt Fang-Funktionen aus zirkel.js).

export default {
	data () {
		return {
			geoVisible: false,
			geo: { x: 0, y: 0, a: 0, cm: 16 },
			geoGeste: null,
			geoSnap: null,
			geoFang: true,
			geoLineal: null,
			geoLongueur: null
		}
	},
	computed: {
		geoL () {
			// Länge der langen Kante (Hypotenuse) in px; 1 cm bleibt immer 1 cm (Maßstab des Hintergrunds)
			return (this.geo.cm || 16) * this.zirkelPxParCm
		},
		geoDegres () {
			return this.geo.a * 180 / Math.PI
		},
		geoTexteAngle () {
			// Mathematische Drehrichtung: gegen den Uhrzeigersinn positiv
			let d = Math.round(-this.geoDegres * 10) / 10
			d = ((d % 360) + 360) % 360
			if (d > 180) {
				d = d - 360
			}
			return (Number.isInteger(d) ? String(d) : d.toFixed(1).replace('.', ',')) + '°'
		},
		geoTrianglePoints () {
			// Lokale Koordinaten: lange Kante auf y = 0, Nullpunkt in der Mitte, Spitze oben bei (0, -L/2)
			// Umriss 1 px nach innen versetzt: Der 2 px breite Rand endet außen genau auf der Kante
			const h = this.geoL / 2
			const e = -1
			const xb = h + e * Math.SQRT2 + e
			return (-xb) + ',' + e + ' ' + xb + ',' + e + ' 0,' + (-(h + e * Math.SQRT2))
		},
		geoCorpsPoints () {
			// Anfassfläche zum Verschieben: das Dreieck ohne einen Randstreifen, an dem der Stift ansetzt
			const h = this.geoL / 2
			const d = 28
			const r = Math.SQRT2 * d
			const xb = Math.max(h - r - d, 0)
			const ya = -Math.max(h - r, d)
			return (-xb) + ',' + (-d) + ' ' + xb + ',' + (-d) + ' 0,' + ya
		},
		geoDessin () {
			const u = this.zirkelPxParCm
			const h = this.geoL / 2
			const f = (v) => Math.round(v * 100) / 100
			let traits = ''
			let paralleles = ''
			let demiParalleles = ''
			let arcs = ''
			const textes = []
			// cm-Skala auf der langen Kante, Striche nach oben ins Dreieck
			const mmMax = Math.floor((h - u * 0.15) / (u / 10))
			for (let m = -mmMax; m <= mmMax; m++) {
				const x = m * u / 10
				const l = m % 10 === 0 ? u * 0.26 : (m % 5 === 0 ? u * 0.18 : u * 0.1)
				if (Math.abs(x) + l > h - 2) continue
				traits += 'M' + f(x) + ' 0V' + f(-l)
				if (m % 10 === 0 && Math.abs(x) <= h - u * 0.75) {
					textes.push({ x: x, y: -u * 0.5, taille: Math.max(10, u * 0.24), texte: String(Math.abs(m / 10)), classe: 'geo-cm' })
				}
			}
			// Parallelen: ganze cm durchgezogen (beschriftet), halbe cm gestrichelt
			for (let k = 1; k * u / 2 < h - u * 0.4; k++) {
				const y = k * u / 2
				const x = h - y - 2
				if (x < u * 0.2) continue
				const ligne = 'M' + f(-x) + ' ' + f(-y) + 'H' + f(x)
				if (k % 2 === 0) {
					paralleles += ligne
					if (h - y > u * 1.2) {
						textes.push({ x: -(h - y) + u * 0.45, y: -y - u * 0.17, taille: Math.max(9, u * 0.19), texte: String(k / 2), classe: 'geo-par' })
					}
				} else {
					demiParalleles += ligne
				}
			}
			// Winkelmesser: großer Halbkreis um den Nullpunkt
			const R = h * 0.67
			const r0 = Math.min(u * 0.8, R * 0.2)
			// Halbkreise enden knapp innerhalb des Randes (nicht auf/über der Messkante)
			const ein = 2.5
			const demiCercle = (rr) => {
				const x = Math.sqrt(Math.max(rr * rr - ein * ein, 0))
				return 'M' + f(x) + ' ' + f(-ein) + 'A' + f(rr) + ' ' + f(rr) + ' 0 0 0 ' + f(-x) + ' ' + f(-ein)
			}
			arcs += demiCercle(R) + demiCercle(r0)
			// 0° und 180° fallen mit der Messkante zusammen – dort keine eigenen Striche
			for (let g = 1; g <= 179; g++) {
				const a = g * Math.PI / 180
				const c = Math.cos(a)
				const sn = -Math.sin(a)
				const l = g % 10 === 0 ? u * 0.26 : (g % 5 === 0 ? u * 0.18 : u * 0.1)
				traits += 'M' + f(c * R) + ' ' + f(sn * R) + 'L' + f(c * (R - l)) + ' ' + f(sn * (R - l))
			}
			const tailleExt = Math.max(10, Math.min(u * 0.3, R * 0.1))
			const tailleInt = Math.max(9, tailleExt * 0.72)
			const rExt = R - u * 0.26 - tailleExt * 1.1
			const rInt = rExt - tailleExt * 1.25
			if (rExt > u * 1.2) {
				for (let g = 20; g <= 160; g += 10) {
					const a = g * Math.PI / 180
					textes.push({ x: Math.cos(a) * rExt, y: -Math.sin(a) * rExt, taille: tailleExt, texte: String(g), classe: 'geo-grad' })
					if (rInt > r0 + tailleInt) {
						textes.push({ x: Math.cos(a) * rInt, y: -Math.sin(a) * rInt, taille: tailleInt, texte: String(180 - g), classe: 'geo-grad-int' })
					}
				}
			}
			// Gestrichelte Mittelsenkrechte
			const axe = 'M0 ' + f(-r0) + 'V' + f(-Math.min(h - u * 1.4, R + u * 0.9))
			return { u: u, traits: traits, paralleles: paralleles, demiParalleles: demiParalleles, arcs: arcs, axe: axe, textes: textes, yAngle: -(R + (h - R) * 0.42), tailleAngle: Math.max(12, Math.min(u * 0.42, (h - R) * 0.3)) }
		}
	},
	methods: {
		basculerGeodreieck () {
			if (this.geoVisible) {
				this.geoVisible = false
				this.geoSnap = null
				return
			}
			const w = this.dimensionsCanva.w || window.innerWidth
			const h = this.dimensionsCanva.h || window.innerHeight
			if (!(this.geo.x > 0 && this.geo.x < w && this.geo.y > 0 && this.geo.y < h)) {
				let x = w / 2
				let y = Math.min(h / 2 + this.geoL / 4, h - 40)
				const fang = this.zirkelFangGrille(x, y, Infinity)
				if (fang && this.geoFang) {
					x = fang.x
					y = fang.y
				}
				this.geo = { x: x, y: y, a: 0, cm: this.geo.cm || 16 }
			}
			this.geoVisible = true
			// Mit dem Geodreieck wird gezeichnet: vom Auswahl-/Verschiebe-Werkzeug direkt zum Stift wechseln
			if (!this.outilDessiner && !this.outilZirkel && !this.outilRemplir) {
				this.definirOutilPrincipal('dessiner')
			}
		},
		basculerGeoFang () {
			this.geoFang = !this.geoFang
			this.geoSnap = null
			try {
				localStorage.setItem('digiscreen_geodreieck_einrasten', this.geoFang ? 'oui' : 'non')
			} catch {
				// Einstellung gilt dann nur bis zum Neuladen
			}
		},
		geoLocalVersStage (lx, ly) {
			const c = Math.cos(this.geo.a)
			const sn = Math.sin(this.geo.a)
			return { x: this.geo.x + lx * c - ly * sn, y: this.geo.y + lx * sn + ly * c }
		},
		geoKanten () {
			// Die drei Kanten in Stage-Koordinaten; n = Normale nach innen (ins Dreieck)
			const h = this.geoL / 2
			const a = this.geoLocalVersStage(-h, 0)
			const b = this.geoLocalVersStage(h, 0)
			const c = this.geoLocalVersStage(0, -h)
			const kanten = [{ id: 'hyp', a: a, b: b }, { id: 'rechts', a: b, b: c }, { id: 'links', a: c, b: a }]
			const m = { x: (a.x + b.x + c.x) / 3, y: (a.y + b.y + c.y) / 3 }
			kanten.forEach((k) => {
				const l = Math.hypot(k.b.x - k.a.x, k.b.y - k.a.y)
				k.ux = (k.b.x - k.a.x) / l
				k.uy = (k.b.y - k.a.y) / l
				k.l = l
				let nx = -k.uy
				let ny = k.ux
				if ((m.x - k.a.x) * nx + (m.y - k.a.y) * ny < 0) {
					nx = -nx
					ny = -ny
				}
				k.nx = nx
				k.ny = ny
			})
			return kanten
		},
		geoKanteProche (x, y) {
			// Nächste Kante, wenn der Stift höchstens 24 px davon entfernt ansetzt
			let meilleure = null
			let dmin = 24
			this.geoKanten().forEach((k) => {
				const t = (x - k.a.x) * k.ux + (y - k.a.y) * k.uy
				if (t < -10 || t > k.l + 10) {
					return
				}
				const d = Math.abs((x - k.a.x) * k.nx + (y - k.a.y) * k.ny)
				if (d <= dmin) {
					dmin = d
					meilleure = k
				}
			})
			return meilleure
		},
		geoPointSurKante (kante, x, y) {
			// Punkt auf die Kante projizieren; beim Einrasten auf mm-Striche (lange Kante) bzw. auf Fangpunkte auf der Kante.
			// Die Linie liegt wie ein echter Stiftstrich außen am Geodreieck: um die halbe Strichdicke nach außen versetzt.
			const decalage = (this.epaisseurStylo || 2) / 2
			const k = Object.assign({}, kante, { a: { x: kante.a.x - kante.nx * decalage, y: kante.a.y - kante.ny * decalage } })
			let t = (x - k.a.x) * k.ux + (y - k.a.y) * k.uy
			t = Math.min(Math.max(t, 0), k.l)
			let p = { x: k.a.x + k.ux * t, y: k.a.y + k.uy * t }
			if (this.geoFang) {
				// Gezeichnete Punkte (Schnittpunkte, Enden …) haben Vorrang, danach die mm-Skala – das Karo-Raster zählt hier nicht
				const fang = this.zirkelTrouverFang(p.x, p.y, null, true, true)
				if (fang && Math.abs((fang.x - k.a.x) * k.nx + (fang.y - k.a.y) * k.ny) < 1.5) {
					return { x: fang.x, y: fang.y }
				}
				if (k.id === 'hyp') {
					const mm = this.zirkelPxParCm / 10
					const milieu = k.l / 2
					t = milieu + Math.round((t - milieu) / mm) * mm
					t = Math.min(Math.max(t, 0), k.l)
					p = { x: k.a.x + k.ux * t, y: k.a.y + k.uy * t }
				}
			}
			return p
		},
		geoGesteDebut (event, mode) {
			event.preventDefault()
			event.stopPropagation()
			const p = this.zirkelPosition(event)
			if (mode === 'deplacer') {
				this.geoGeste = { mode: mode, id: event.pointerId, ox: this.geo.x - p.x, oy: this.geo.y - p.y }
			} else if (mode === 'echelle') {
				// Abstand des Zeigers vom Nullpunkt senkrecht zur langen Kante (nach oben = positiv)
				const hauteur = -((p.x - this.geo.x) * -Math.sin(this.geo.a) + (p.y - this.geo.y) * Math.cos(this.geo.a))
				this.geoGeste = { mode: mode, id: event.pointerId, decalage: this.geoL / 2 - hauteur }
			} else {
				const a0 = Math.atan2(p.y - this.geo.y, p.x - this.geo.x)
				this.geoGeste = { mode: mode, id: event.pointerId, a0: a0, angle0: this.geo.a }
			}
			window.addEventListener('pointermove', this.geoGesteMouvement)
			window.addEventListener('pointerup', this.geoGesteFin)
			window.addEventListener('pointercancel', this.geoGesteFin)
		},
		geoGesteMouvement (event) {
			const geste = this.geoGeste
			if (!geste || event.pointerId !== geste.id) {
				return
			}
			event.preventDefault()
			const p = this.zirkelPosition(event)
			if (geste.mode === 'deplacer') {
				const x = p.x + geste.ox
				const y = p.y + geste.oy
				const fang = this.zirkelTrouverFang(x, y, null, this.geoFang)
				this.geo.x = fang ? fang.x : x
				this.geo.y = fang ? fang.y : y
				this.geoSnap = fang
			} else if (geste.mode === 'echelle') {
				const hauteur = -((p.x - this.geo.x) * -Math.sin(this.geo.a) + (p.y - this.geo.y) * Math.cos(this.geo.a))
				let cm = 2 * (hauteur + geste.decalage) / this.zirkelPxParCm
				cm = Math.min(Math.max(cm, 6), 30)
				if (this.geoFang) {
					cm = Math.round(cm)
				}
				this.geo.cm = cm
			} else {
				let a = geste.angle0 + Math.atan2(p.y - this.geo.y, p.x - this.geo.x) - geste.a0
				if (this.geoFang) {
					// Auf ganze Grad, bei 15°-Vielfachen (0°, 15°, 30°, 45° …) stärker einrasten
					let d = a * 180 / Math.PI
					const quinze = Math.round(d / 15) * 15
					d = Math.abs(d - quinze) <= 2.5 ? quinze : Math.round(d)
					a = d * Math.PI / 180
				}
				this.geo.a = a
			}
		},
		geoGesteFin (event) {
			const geste = this.geoGeste
			if (!geste || event.pointerId !== geste.id) {
				return
			}
			window.removeEventListener('pointermove', this.geoGesteMouvement)
			window.removeEventListener('pointerup', this.geoGesteFin)
			window.removeEventListener('pointercancel', this.geoGesteFin)
			this.geoGeste = null
			this.geoSnap = null
		}
	},
	mounted () {
		try {
			this.geoFang = localStorage.getItem('digiscreen_geodreieck_einrasten') !== 'non'
		} catch {
			this.geoFang = true
		}
	},
	beforeUnmount () {
		window.removeEventListener('pointermove', this.geoGesteMouvement)
		window.removeEventListener('pointerup', this.geoGesteFin)
		window.removeEventListener('pointercancel', this.geoGesteFin)
	}
}
