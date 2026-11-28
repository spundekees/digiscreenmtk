// Lernuhren für die Annotation (Medienzentrum MTK):
// Ziffern 1–12, darunter klein und rot 13–0 (je Uhr ausblendbar). Stunden- und Minutenzeiger sind
// gekoppelt („geared“): Wird der Minutenzeiger gedreht, läuft der Stundenzeiger passend mit und umgekehrt.
// Jede Uhr ist ein Annotations-Objekt (objet 'uhr'): beliebig viele, mit der Tafel gespeichert,
// Rückgängig/Wiederholen, Verschieben und Skalieren mit dem Hintergrund.

function normaliser (a) {
	// Winkeldifferenz auf (-180, 180]
	let d = a % 360
	if (d > 180) d -= 360
	if (d <= -180) d += 360
	return d
}

const dessins = {}

export default {
	data () {
		return {
			uhrGeste: null
		}
	},
	computed: {
		uhren () {
			return this.items.filter((item) => item && item.objet === 'uhr')
		}
	},
	beforeUnmount () {
		this.uhrGesteFin()
	},
	methods: {
		uhrDessin (rayon) {
			// Ziffernblatt einmal je Größe berechnen
			const r = Math.round(rayon)
			if (dessins[r]) {
				return dessins[r]
			}
			let striche = ''
			let dicke = ''
			for (let i = 0; i < 60; i++) {
				const a = i * 6 * Math.PI / 180
				const s = Math.sin(a)
				const c = -Math.cos(a)
				const innen = i % 5 === 0 ? r * 0.86 : r * 0.92
				const pfad = 'M' + (s * innen).toFixed(2) + ' ' + (c * innen).toFixed(2) + 'L' + (s * r * 0.97).toFixed(2) + ' ' + (c * r * 0.97).toFixed(2)
				if (i % 5 === 0) {
					dicke += pfad
				} else {
					striche += pfad
				}
			}
			const zahlen = []
			const rot = []
			for (let h = 1; h <= 12; h++) {
				const a = h * 30 * Math.PI / 180
				zahlen.push({ t: String(h), x: Math.sin(a) * r * 0.74, y: -Math.cos(a) * r * 0.74 })
				rot.push({ t: String(h === 12 ? 0 : h + 12), x: Math.sin(a) * r * 0.53, y: -Math.cos(a) * r * 0.53 })
			}
			dessins[r] = { striche, dicke, zahlen, rot }
			return dessins[r]
		},
		uhrWinkelMinute (u) {
			return (u.m % 60) * 6
		},
		uhrWinkelStunde (u) {
			return (u.m % 720) / 2
		},
		uhrTexte (u) {
			const minuten = ((Math.round(u.m) % 720) + 720) % 720
			const h = Math.floor(minuten / 60)
			return (h === 0 ? 12 : h) + ':' + String(minuten % 60).padStart(2, '0')
		},
		uhrHinzufuegen () {
			// Neue Uhr in die Mitte (jede weitere etwas versetzt), Zeit = aktuelle Uhrzeit
			const w = this.dimensionsCanva.w || window.innerWidth
			const h = this.dimensionsCanva.h || window.innerHeight
			const r = Math.round(Math.max(80, Math.min(170, Math.min(w, h) * 0.22)))
			const versatz = (this.uhren.length % 4) * Math.round(r * 0.6)
			const jetzt = new Date()
			this.id++
			this.items.push({ name: 'uhr_' + this.id, objet: 'uhr', x: Math.round(w / 2 + versatz), y: Math.round(h / 2 + versatz), r: r, m: jetzt.getHours() * 60 + jetzt.getMinutes(), mit24: true })
			this.enregistrer()
		},
		uhrEntfernen (u) {
			this.items = this.items.filter((item) => item !== u && item.name !== u.name)
			this.enregistrer()
		},
		uhrUmschalten24 (u) {
			u.mit24 = !u.mit24
			this.enregistrer()
		},
		uhrWinkel (u, p) {
			// Winkel in Grad, 0 = 12 Uhr, im Uhrzeigersinn
			return (Math.atan2(p.x - u.x, -(p.y - u.y)) * 180 / Math.PI + 360) % 360
		},
		uhrNachVorne (u) {
			// Angefasste Uhr nach vorne holen
			const i = this.items.indexOf(u)
			if (i > -1 && i !== this.items.length - 1) {
				this.items.splice(i, 1)
				this.items.push(u)
			}
		},
		uhrGesteDebut (event, u, mode) {
			if (event.button !== undefined && event.button > 0) {
				return
			}
			event.preventDefault()
			event.stopPropagation()
			const p = this.zirkelPosition(event)
			this.uhrNachVorne(u)
			this.uhrGeste = { u, mode, id: event.pointerId, ox: u.x - p.x, oy: u.y - p.y, a: this.uhrWinkel(u, p), r0: u.r, d0: Math.hypot(p.x - u.x, p.y - u.y), bouge: false }
			window.addEventListener('pointermove', this.uhrGesteMouvement)
			window.addEventListener('pointerup', this.uhrGesteFin)
			window.addEventListener('pointercancel', this.uhrGesteFin)
		},
		uhrGesteMouvement (event) {
			const g = this.uhrGeste
			if (!g || event.pointerId !== g.id) {
				return
			}
			event.preventDefault()
			g.bouge = true
			const u = g.u
			const p = this.zirkelPosition(event)
			if (g.mode === 'deplacer') {
				u.x = p.x + g.ox
				u.y = p.y + g.oy
			} else if (g.mode === 'taille') {
				const d = Math.hypot(p.x - u.x, p.y - u.y)
				u.r = Math.min(Math.max(g.r0 * d / Math.max(g.d0, 1), 60), 1200)
			} else {
				// Minutenzeiger: 60 min je Umdrehung, Stundenzeiger: 720 min je Umdrehung
				const a = this.uhrWinkel(u, p)
				const delta = normaliser(a - g.a)
				g.a = a
				u.m = (u.m + delta / 360 * (g.mode === 'minute' ? 60 : 720) + 1440) % 1440
			}
		},
		uhrGesteFin (event) {
			const g = this.uhrGeste
			if (g && event && event.pointerId !== g.id) {
				return
			}
			window.removeEventListener('pointermove', this.uhrGesteMouvement)
			window.removeEventListener('pointerup', this.uhrGesteFin)
			window.removeEventListener('pointercancel', this.uhrGesteFin)
			this.uhrGeste = null
			if (!g || !event) {
				return
			}
			if (g.mode === 'minute' || g.mode === 'stunde') {
				// Auf volle Minuten einrasten
				g.u.m = Math.round(g.u.m) % 1440
			}
			g.u.x = Math.round(g.u.x)
			g.u.y = Math.round(g.u.y)
			g.u.r = Math.round(g.u.r)
			if (g.bouge) {
				this.enregistrer()
			}
		},
		uhrClavier (event, u, mode) {
			// Pfeiltasten drehen den Zeiger (Minute: 1 min, Stunde: 5 min; mit Umschalt mehr)
			const pas = mode === 'minute' ? (event.shiftKey ? 5 : 1) : (event.shiftKey ? 60 : 5)
			if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
				u.m = (u.m + pas) % 1440
			} else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
				u.m = (u.m - pas + 1440) % 1440
			} else {
				return
			}
			event.preventDefault()
			this.enregistrer()
		}
	}
}
