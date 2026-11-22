// Zirkel für die Annotationen: Einstichpunkt, Radius, Zeichnen von Kreisen/Bögen und Einrasten
// (Karo-Schnittpunkte, Schnittpunkte, Mittel-/Endpunkte, Linien). Gehört zu annotation.vue.

export default {
	data () {
		return {
			outilZirkel: false,
			zirkel: { x: 0, y: 0, r: 0, a: 0 },
			zirkelGeste: null,
			zirkelSnap: null,
			zirkelFang: true
		}
	},
	computed: {
		zirkelSpitze () {
			return { x: this.zirkel.x + Math.cos(this.zirkel.a) * this.zirkel.r, y: this.zirkel.y + Math.sin(this.zirkel.a) * this.zirkel.r }
		},
		zirkelGrille () {
			const page = this.app.pages[this.app.page - 1]
			const fond = (page && page.fond) || ''
			const grilles = {
				'quadrillage.png': { px: 30, py: 30, ox: 15, oy: 15, karo: true },
				'quadrillage-gris.png': { px: 30, py: 30, ox: 15, oy: 15, karo: true },
				'quadrillage-grand.png': { px: 60, py: 60, ox: 30, oy: 30, karo: true },
				'quadrillage-gris-grand.png': { px: 60, py: 60, ox: 30, oy: 30, karo: true },
				'points.png': { px: 30, py: 30, ox: 15, oy: 15, karo: true },
				'seyes.png': { px: 80, py: 20, tx: 80, ty: 80, ox: 79.5, oy: 19, karo: false }
			}
			const nom = fond.split('/').pop()
			if (!fond.includes('/static/img/') || !grilles[nom]) {
				return null
			}
			const e = page.echelleFond > 0 ? page.echelleFond : 1
			const g = grilles[nom]
			return { px: g.px * e, py: g.py * e, tx: (g.tx || g.px) * e, ty: (g.ty || g.py) * e, ox: g.ox * e, oy: g.oy * e, karo: g.karo }
		},
		zirkelPxParCm () {
			// Ein Kästchen = 0,5 cm. Ohne Karo-Hintergrund gilt derselbe Maßstab wie beim normalen Karo (30 px = 0,5 cm).
			const g = this.zirkelGrille
			if (g && g.karo) {
				return g.px * 2
			}
			const page = this.app.pages[this.app.page - 1]
			const fond = (page && page.fond) || ''
			const e = fond.includes('/static/img/') && /\.(png|svg)$/.test(fond) && page.echelleFond > 0 ? page.echelleFond : 1
			return 60 * e
		},
		zirkelTexteRayon () {
			const cm = this.zirkel.r / this.zirkelPxParCm
			const t = Math.abs(cm * 10 - Math.round(cm * 10)) < 0.01 ? cm.toFixed(1) : cm.toFixed(2)
			return t.replace('.', ',') + ' cm'
		}
	},
	watch: {
		outilZirkel (valeur) {
			if (valeur === true) {
				this.desactiverDeplacement()
			}
			this.zirkelSnap = null
			this.reinitialiserSelection()
		}
	},
	methods: {
		basculerZirkelFang () {
			this.zirkelFang = !this.zirkelFang
			this.zirkelSnap = null
			try {
				localStorage.setItem('digiscreen_zirkel_einrasten', this.zirkelFang ? 'oui' : 'non')
			} catch {
				// Speichern nicht möglich (z. B. privater Modus) – Einstellung gilt dann nur bis zum Neuladen
			}
		},
		zirkelInitialiser () {
			const w = this.dimensionsCanva.w || window.innerWidth
			const h = this.dimensionsCanva.h || window.innerHeight
			if (this.zirkel.r > 0 && this.zirkel.x > 0 && this.zirkel.x < w && this.zirkel.y > 0 && this.zirkel.y < h) {
				return
			}
			let x = w / 2
			let y = h / 2
			const fang = this.zirkelFangGrille(x, y, Infinity)
			if (fang) {
				x = fang.x
				y = fang.y
			}
			this.zirkel = { x: x, y: y, r: this.zirkelPxParCm * 2, a: 0 }
		},
		zirkelPosition (event) {
			const rect = document.querySelector('#annotation').getBoundingClientRect()
			return { x: event.clientX - rect.left, y: event.clientY - rect.top }
		},
		zirkelFangGrille (x, y, seuil) {
			const g = this.zirkelGrille
			const main = document.querySelector('main')
			const annotation = document.querySelector('#annotation')
			if (!g || !main || !annotation) {
				return null
			}
			const rm = main.getBoundingClientRect()
			const ra = annotation.getBoundingClientRect()
			// Tatsächliche Lage des Kachelmusters (Digiscreen zentriert die Kacheln: background-position 50% 50%)
			// Werte wie „calc(50% - 237px) calc(50% + 113px)“ nicht an den Leerzeichen innerhalb von calc() trennen
			const position = ((window.getComputedStyle(main).backgroundPosition || '0% 0%').split(/,(?![^(]*\))/)[0].trim().match(/calc\([^)]*\)|\S+/g)) || ['0%', '0%']
			const decalage = (valeur, taille, tuile) => {
				if (!valeur) return 0
				if (valeur === 'center') return (taille - tuile) / 2
				if (valeur === 'left' || valeur === 'top') return 0
				if (valeur === 'right' || valeur === 'bottom') return taille - tuile
				// auch calc(50% + 30px) usw.
				const pct = valeur.match(/(-?[\d.]+)%/)
				const pxs = [...valeur.matchAll(/([+-]?)\s*(-?[\d.]+)px/g)].reduce((somme, m) => somme + (m[1] === '-' ? -1 : 1) * parseFloat(m[2]), 0)
				return (pct ? (taille - tuile) * parseFloat(pct[1]) / 100 : 0) + pxs
			}
			const bx = decalage(position[0], main.clientWidth, g.tx || g.px)
			const by = decalage(position[1] || '50%', main.clientHeight, g.ty || g.py)
			const dx = rm.left + main.clientLeft - ra.left + bx + g.ox
			const dy = rm.top + main.clientTop - ra.top + by + g.oy
			const gx = Math.round((x - dx) / g.px) * g.px + dx
			const gy = Math.round((y - dy) / g.py) * g.py + dy
			const d = Math.hypot(gx - x, gy - y)
			return d <= seuil ? { x: gx, y: gy, d: d } : null
		},
		zirkelGeometrie () {
			// Bögen, Strecken und Einzelpunkte aus den Annotationen (in Stage-Koordinaten)
			const arcs = []
			const segments = []
			const points = []
			const enCours = this.geoLineal && this.geoLineal.nom
			this.items.forEach((item) => {
				if (item.visible === false || (enCours && item.name === enCours)) {
					return
				}
				const ox = item.x || 0
				const oy = item.y || 0
				const sx = item.scaleX || 1
				const sy = item.scaleY || 1
				if (item.objet === 'dessin' && item.zirkel) {
					const z = item.zirkel
					const arc = { x: z.x + ox, y: z.y + oy, r: z.r, a0: z.a0, a1: z.a1 }
					arcs.push(arc)
					points.push({ x: arc.x, y: arc.y })
					if (Math.abs(z.a1 - z.a0) < 2 * Math.PI - 1e-6) {
						points.push({ x: arc.x + Math.cos(z.a0) * z.r, y: arc.y + Math.sin(z.a0) * z.r })
						points.push({ x: arc.x + Math.cos(z.a1) * z.r, y: arc.y + Math.sin(z.a1) * z.r })
					}
				} else if ((item.objet === 'ligne' || item.objet === 'fleche') && item.points && item.points.length >= 4) {
					const p1 = { x: ox + item.points[0] * sx, y: oy + item.points[1] * sy }
					const p2 = { x: ox + item.points[2] * sx, y: oy + item.points[3] * sy }
					segments.push([p1, p2])
					points.push(p1, p2)
				} else if (item.objet === 'dessin' && item.droite && item.points && item.points.length >= 4) {
					const n = item.points.length
					const p1 = { x: ox + item.points[0] * sx, y: oy + item.points[1] * sy }
					const p2 = { x: ox + item.points[n - 2] * sx, y: oy + item.points[n - 1] * sy }
					segments.push([p1, p2])
					points.push(p1, p2)
				} else if (item.objet === 'dessin' && item.points && item.points.length >= 2) {
					const n = item.points.length
					points.push({ x: ox + item.points[0] * sx, y: oy + item.points[1] * sy }, { x: ox + item.points[n - 2] * sx, y: oy + item.points[n - 1] * sy })
				} else if ((item.objet === 'rectangle' || item.objet === 'rectangle-plein') && !item.rotation) {
					const w = (item.width || 0) * sx
					const h = (item.height || 0) * sy
					const ecken = [{ x: ox, y: oy }, { x: ox + w, y: oy }, { x: ox + w, y: oy + h }, { x: ox, y: oy + h }]
					points.push(...ecken)
					for (let i = 0; i < 4; i++) {
						segments.push([ecken[i], ecken[(i + 1) % 4]])
					}
				} else if (item.objet === 'cercle' || item.objet === 'cercle-plein') {
					points.push({ x: ox, y: oy })
					const rx = (item.width || 0) * sx / 2
					const ry = (item.height || 0) * sy / 2
					if (Math.abs(rx - ry) < 0.5 && rx > 0) {
						arcs.push({ x: ox, y: oy, r: rx, a0: 0, a1: 2 * Math.PI })
					}
				}
			})
			return { arcs, segments, points }
		},
		zirkelSurArc (arc, x, y) {
			const delta = arc.a1 - arc.a0
			if (Math.abs(delta) >= 2 * Math.PI - 1e-6) {
				return true
			}
			const a = Math.atan2(y - arc.y, x - arc.x)
			const tour = 2 * Math.PI
			const marge = 0.01
			if (delta > 0) {
				return ((a - arc.a0) % tour + tour) % tour <= delta + marge
			}
			return ((arc.a0 - a) % tour + tour) % tour <= -delta + marge
		},
		zirkelIntersections (geo, x, y, rayon) {
			// Nur Schnittpunkte in der Nähe des Zeigers berechnen
			const res = []
			const proche = (p) => Math.hypot(p.x - x, p.y - y) <= rayon
			const { arcs, segments } = geo
			const surSegment = (s, p) => {
				const [a, b] = s
				const l2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2
				if (l2 === 0) return false
				const t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2
				return t >= -0.001 && t <= 1.001
			}
			// Kreis – Kreis
			for (let i = 0; i < arcs.length; i++) {
				for (let j = i + 1; j < arcs.length; j++) {
					const c1 = arcs[i]
					const c2 = arcs[j]
					const d = Math.hypot(c2.x - c1.x, c2.y - c1.y)
					if (d < 1e-6 || d > c1.r + c2.r + 1e-6 || d < Math.abs(c1.r - c2.r) - 1e-6) continue
					const a = (c1.r * c1.r - c2.r * c2.r + d * d) / (2 * d)
					const h = Math.sqrt(Math.max(0, c1.r * c1.r - a * a))
					const mx = c1.x + a * (c2.x - c1.x) / d
					const my = c1.y + a * (c2.y - c1.y) / d
					const kandidaten = [{ x: mx + h * (c2.y - c1.y) / d, y: my - h * (c2.x - c1.x) / d }, { x: mx - h * (c2.y - c1.y) / d, y: my + h * (c2.x - c1.x) / d }]
					kandidaten.forEach((p) => {
						if (proche(p) && this.zirkelSurArc(c1, p.x, p.y) && this.zirkelSurArc(c2, p.x, p.y)) res.push(p)
					})
				}
			}
			// Kreis – Strecke
			arcs.forEach((c) => {
				segments.forEach((s) => {
					const [a, b] = s
					const dx = b.x - a.x
					const dy = b.y - a.y
					const fx = a.x - c.x
					const fy = a.y - c.y
					const A = dx * dx + dy * dy
					const B = 2 * (fx * dx + fy * dy)
					const C = fx * fx + fy * fy - c.r * c.r
					const disc = B * B - 4 * A * C
					if (A === 0 || disc < 0) return
					const w = Math.sqrt(disc);
					[(-B - w) / (2 * A), (-B + w) / (2 * A)].forEach((t) => {
						if (t < -0.001 || t > 1.001) return
						const p = { x: a.x + t * dx, y: a.y + t * dy }
						if (proche(p) && this.zirkelSurArc(c, p.x, p.y)) res.push(p)
					})
				})
			})
			// Strecke – Strecke
			for (let i = 0; i < segments.length; i++) {
				for (let j = i + 1; j < segments.length; j++) {
					const [p1, p2] = segments[i]
					const [p3, p4] = segments[j]
					const den = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x)
					if (Math.abs(den) < 1e-9) continue
					const px = ((p1.x * p2.y - p1.y * p2.x) * (p3.x - p4.x) - (p1.x - p2.x) * (p3.x * p4.y - p3.y * p4.x)) / den
					const py = ((p1.x * p2.y - p1.y * p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x * p4.y - p3.y * p4.x)) / den
					const p = { x: px, y: py }
					if (proche(p) && surSegment(segments[i], p) && surSegment(segments[j], p)) res.push(p)
				}
			}
			return res
		},
		zirkelTrouverFang (x, y, exclure, actif, sansGrille) {
			if (!(actif === undefined ? this.zirkelFang : actif)) {
				return null
			}
			// Fangpunkte: Schnittpunkte, Mittelpunkte, Endpunkte und Ecken (stärker), Schnittpunkte des Hintergrunds (leichter)
			const seuil = 16
			const loin = (p) => exclure && Math.hypot(p.x - exclure.x, p.y - exclure.y) < exclure.r
			const geo = this.zirkelGeometrie()
			const kandidaten = geo.points.concat(this.zirkelIntersections(geo, x, y, seuil))
			let meilleur = null
			kandidaten.forEach((p) => {
				if (loin(p)) {
					return
				}
				const d = Math.hypot(p.x - x, p.y - y)
				if (d <= seuil && (!meilleur || d < meilleur.d)) {
					meilleur = { x: p.x, y: p.y, d: d }
				}
			})
			if (meilleur) {
				return meilleur
			}
			// Auf der Linie einrasten: nächster Punkt auf einer Kreislinie (bzw. einem Bogen) oder einer Strecke
			const seuilLigne = 10
			const proposer = (p) => {
				if (loin(p)) {
					return
				}
				const d = Math.hypot(p.x - x, p.y - y)
				if (d <= seuilLigne && (!meilleur || d < meilleur.d)) {
					meilleur = { x: p.x, y: p.y, d: d, ligne: true }
				}
			}
			geo.arcs.forEach((c) => {
				const dc = Math.hypot(x - c.x, y - c.y)
				if (dc < 1e-6 || Math.abs(dc - c.r) > seuilLigne) {
					return
				}
				const p = { x: c.x + (x - c.x) / dc * c.r, y: c.y + (y - c.y) / dc * c.r }
				if (this.zirkelSurArc(c, p.x, p.y)) {
					proposer(p)
				}
			})
			geo.segments.forEach(([a, b]) => {
				const l2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2
				if (l2 === 0) {
					return
				}
				const t = Math.min(1, Math.max(0, ((x - a.x) * (b.x - a.x) + (y - a.y) * (b.y - a.y)) / l2))
				proposer({ x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) })
			})
			if (meilleur || sansGrille) {
				return meilleur
			}
			const fang = this.zirkelFangGrille(x, y, 12)
			return fang && !loin(fang) ? fang : null
		},
		zirkelGesteDebut (event, mode) {
			event.preventDefault()
			event.stopPropagation()
			const p = this.zirkelPosition(event)
			const z = this.zirkel
			if (mode === 'deplacer') {
				this.zirkelGeste = { mode: mode, id: event.pointerId, ox: z.x - p.x, oy: z.y - p.y }
			} else if (mode === 'rayon') {
				this.zirkelGeste = { mode: mode, id: event.pointerId }
			} else {
				this.id++
				const nom = 'dess' + this.id
				this.items.push({ name: nom, objet: 'dessin', points: [this.zirkelSpitze.x, this.zirkelSpitze.y, this.zirkelSpitze.x, this.zirkelSpitze.y], globalCompositeOperation: 'source-over', stroke: this.couleurStylo, strokeWidth: this.epaisseurStylo, opacity: this.transparenceStylo, hitStrokeWidth: 25, lineJoin: 'round', lineCap: 'round', draggable: false, verrouille: false, zirkel: { x: z.x, y: z.y, r: z.r, a0: z.a, a1: z.a } })
				this.zirkelGeste = { mode: mode, id: event.pointerId, nom: nom, a0: z.a, dernier: z.a, total: 0 }
			}
			window.addEventListener('pointermove', this.zirkelGesteMouvement)
			window.addEventListener('pointerup', this.zirkelGesteFin)
			window.addEventListener('pointercancel', this.zirkelGesteFin)
		},
		zirkelGesteMouvement (event) {
			const geste = this.zirkelGeste
			if (!geste || event.pointerId !== geste.id) {
				return
			}
			event.preventDefault()
			const p = this.zirkelPosition(event)
			const z = this.zirkel
			if (geste.mode === 'deplacer') {
				const x = p.x + geste.ox
				const y = p.y + geste.oy
				const fang = this.zirkelTrouverFang(x, y)
				z.x = fang ? fang.x : x
				z.y = fang ? fang.y : y
				this.zirkelSnap = fang
			} else if (geste.mode === 'rayon') {
				// Der Griff sitzt auf halber Länge: Spitze = doppelte Entfernung vom Mittelpunkt
				const a = Math.atan2(p.y - z.y, p.x - z.x)
				const d = Math.hypot(p.x - z.x, p.y - z.y) * 2
				const spitze = { x: z.x + Math.cos(a) * d, y: z.y + Math.sin(a) * d }
				const fang = this.zirkelTrouverFang(spitze.x, spitze.y, { x: z.x, y: z.y, r: 8 })
				if (fang) {
					z.r = Math.min(Math.max(Math.hypot(fang.x - z.x, fang.y - z.y), 10), 3000)
					z.a = Math.atan2(fang.y - z.y, fang.x - z.x)
				} else {
					const mm = this.zirkelPxParCm / 10
					z.r = Math.min(Math.max(this.zirkelFang ? Math.round(d / mm) * mm : d, 10), 3000)
					z.a = a
				}
				this.zirkelSnap = fang
			} else {
				const a = Math.atan2(p.y - z.y, p.x - z.x)
				let d = a - geste.dernier
				if (d > Math.PI) d -= 2 * Math.PI
				if (d < -Math.PI) d += 2 * Math.PI
				geste.dernier = a
				geste.total = Math.min(Math.max(geste.total + d, -2 * Math.PI), 2 * Math.PI)
				z.a = a
				const item = this.items.find(r => r.name === geste.nom)
				if (item) {
					const n = Math.max(2, Math.ceil(Math.abs(geste.total) * z.r / 3))
					const points = []
					for (let i = 0; i <= n; i++) {
						const ai = geste.a0 + geste.total * i / n
						points.push(Math.round((z.x + Math.cos(ai) * z.r) * 100) / 100, Math.round((z.y + Math.sin(ai) * z.r) * 100) / 100)
					}
					item.points = points
					item.zirkel = { x: z.x, y: z.y, r: z.r, a0: geste.a0, a1: geste.a0 + geste.total }
					this.$refs.objets.getNode().getLayer().batchDraw()
				}
			}
		},
		zirkelGesteFin (event) {
			const geste = this.zirkelGeste
			if (!geste || event.pointerId !== geste.id) {
				return
			}
			window.removeEventListener('pointermove', this.zirkelGesteMouvement)
			window.removeEventListener('pointerup', this.zirkelGesteFin)
			window.removeEventListener('pointercancel', this.zirkelGesteFin)
			if (geste.mode === 'dessiner') {
				const index = this.items.findIndex(r => r.name === geste.nom)
				if (index > -1 && Math.abs(geste.total) * this.zirkel.r > 2) {
					this.enregistrer()
				} else if (index > -1) {
					this.items.splice(index, 1)
				}
			}
			this.zirkelGeste = null
			this.zirkelSnap = null
		},
		zirkelSaisirRayon () {
			const unite = this.zirkelPxParCm
			const actuel = (this.zirkel.r / unite).toFixed(1).replace('.', ',')
			const valeur = window.prompt(this.$t('zirkelRadiusCm'), actuel)
			if (valeur === null) {
				return
			}
			const n = parseFloat(valeur.replace(',', '.').replace(/[^\d.]/g, ''))
			if (isFinite(n) && n > 0) {
				this.zirkel.r = Math.min(Math.max(Math.round(n * 10) / 10 * unite, 10), 3000)
			}
		}
	},
	mounted () {
		try {
			this.zirkelFang = localStorage.getItem('digiscreen_zirkel_einrasten') !== 'non'
		} catch {
			this.zirkelFang = true
		}
	},
	beforeUnmount () {
		window.removeEventListener('pointermove', this.zirkelGesteMouvement)
		window.removeEventListener('pointerup', this.zirkelGesteFin)
		window.removeEventListener('pointercancel', this.zirkelGesteFin)
	}
}
