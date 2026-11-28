// Lernuhr für die Annotation (Medienzentrum MTK):
// Ziffern 1–12, darunter klein und rot 13–0 (ausblendbar), Stunden- und Minutenzeiger sind gekoppelt
// („geared“): Wird der Minutenzeiger gedreht, läuft der Stundenzeiger passend mit und umgekehrt.
const CLE = 'digiscreen_lernuhr'

function normaliser (a) {
	// Winkeldifferenz auf (-180, 180]
	let d = a % 360
	if (d > 180) d -= 360
	if (d <= -180) d += 360
	return d
}

export default {
	data () {
		let etat = null
		try {
			etat = JSON.parse(localStorage.getItem(CLE) || 'null')
		} catch {}
		return {
			uhrVisible: false,
			uhr: etat && etat.r > 0 ? { x: etat.x, y: etat.y, r: etat.r, m: etat.m || 0, mit24: etat.mit24 !== false } : { x: 0, y: 0, r: 150, m: 10 * 60 + 10, mit24: true },
			uhrGeste: null
		}
	},
	computed: {
		uhrDessin () {
			const r = this.uhr.r
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
			return { striche, dicke, zahlen, rot }
		},
		uhrMinuten () {
			return ((Math.round(this.uhr.m) % 720) + 720) % 720
		},
		uhrWinkelMinute () {
			return (this.uhr.m % 60) * 6
		},
		uhrWinkelStunde () {
			return (this.uhr.m % 720) / 2
		},
		uhrTexte () {
			const h = Math.floor(this.uhrMinuten / 60)
			const m = this.uhrMinuten % 60
			return (h === 0 ? 12 : h) + ':' + String(m).padStart(2, '0')
		}
	},
	methods: {
		basculerUhr () {
			if (this.uhrVisible) {
				this.uhrVisible = false
				return
			}
			const w = this.dimensionsCanva.w || window.innerWidth
			const h = this.dimensionsCanva.h || window.innerHeight
			// Erste Nutzung oder Uhr außerhalb der Fläche: in die Mitte
			if (!this.uhr.x || this.uhr.x < 0 || this.uhr.y < 0 || this.uhr.x > w || this.uhr.y > h) {
				this.uhr.r = Math.min(this.uhr.r, Math.max(60, Math.min(w, h) * 0.3))
				this.uhr.x = w / 2
				this.uhr.y = h / 2
			}
			this.uhrVisible = true
		},
		uhrSpeichern () {
			try {
				localStorage.setItem(CLE, JSON.stringify({ x: Math.round(this.uhr.x), y: Math.round(this.uhr.y), r: Math.round(this.uhr.r), m: Math.round(this.uhr.m), mit24: this.uhr.mit24 }))
			} catch {}
		},
		uhrUmschalten24 () {
			this.uhr.mit24 = !this.uhr.mit24
			this.uhrSpeichern()
		},
		uhrWinkel (p) {
			// Winkel des Zeigers in Grad, 0 = 12 Uhr, im Uhrzeigersinn
			return (Math.atan2(p.x - this.uhr.x, -(p.y - this.uhr.y)) * 180 / Math.PI + 360) % 360
		},
		uhrGesteDebut (event, mode) {
			if (event.button !== undefined && event.button > 0) {
				return
			}
			event.preventDefault()
			event.stopPropagation()
			const p = this.zirkelPosition(event)
			this.uhrGeste = { mode, id: event.pointerId, ox: this.uhr.x - p.x, oy: this.uhr.y - p.y, a: this.uhrWinkel(p), r0: this.uhr.r, d0: Math.hypot(p.x - this.uhr.x, p.y - this.uhr.y) }
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
			const p = this.zirkelPosition(event)
			if (g.mode === 'deplacer') {
				this.uhr.x = p.x + g.ox
				this.uhr.y = p.y + g.oy
			} else if (g.mode === 'taille') {
				const d = Math.hypot(p.x - this.uhr.x, p.y - this.uhr.y)
				this.uhr.r = Math.min(Math.max(g.r0 * d / Math.max(g.d0, 1), 60), 1200)
			} else {
				// Zeiger drehen: Minutenzeiger = 60 min je Umdrehung, Stundenzeiger = 720 min je Umdrehung
				const a = this.uhrWinkel(p)
				const delta = normaliser(a - g.a)
				g.a = a
				this.uhr.m = (this.uhr.m + delta / 360 * (g.mode === 'minute' ? 60 : 720) + 1440) % 1440
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
			if (g && (g.mode === 'minute' || g.mode === 'stunde')) {
				// Auf volle Minuten einrasten
				this.uhr.m = Math.round(this.uhr.m) % 1440
			}
			this.uhrGeste = null
			this.uhrSpeichern()
		},
		uhrClavier (event, mode) {
			// Barrierefreiheit: Pfeiltasten drehen den Zeiger (Minute: 1 min, Stunde: 5 min; mit Umschalt mehr)
			const pas = mode === 'minute' ? (event.shiftKey ? 5 : 1) : (event.shiftKey ? 60 : 5)
			if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
				this.uhr.m = (this.uhr.m + pas) % 1440
			} else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
				this.uhr.m = (this.uhr.m - pas + 1440) % 1440
			} else {
				return
			}
			event.preventDefault()
			this.uhrSpeichern()
		}
	}
}
