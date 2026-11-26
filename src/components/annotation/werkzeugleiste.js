// Annotations-Werkzeugleiste: zwei- bzw. dreispaltig, frei verschiebbar (Medienzentrum MTK)
const CLE = 'digiscreen_werkzeugleiste'

export default {
	data () {
		let position = null
		try {
			position = JSON.parse(localStorage.getItem(CLE) || 'null')
		} catch {}
		return {
			outilsPosition: position,
			outilsGeste: null,
			outilsDreiSpalten: false
		}
	},
	computed: {
		styleOutils () {
			return this.outilsPosition ? { left: this.outilsPosition.x + 'px', top: this.outilsPosition.y + 'px' } : {}
		}
	},
	mounted () {
		window.addEventListener('resize', this.outilsAjuster, false)
		this.$nextTick(this.outilsAjuster)
	},
	beforeUnmount () {
		window.removeEventListener('resize', this.outilsAjuster, false)
		this.outilsGesteFin()
	},
	methods: {
		outilsElement () {
			return document.querySelector('#outils-annotation')
		},
		outilsBasLibre () {
			// Unterkante des freien Bereichs: Oberkante der Programmleiste (falls sichtbar)
			const nav = document.querySelector('nav')
			if (nav && !nav.classList.contains('masque')) {
				return Math.min(window.innerHeight, nav.getBoundingClientRect().top)
			}
			return window.innerHeight
		},
		outilsAjuster () {
			const element = this.outilsElement()
			if (!element) {
				return
			}
			// Passt die Leiste zweispaltig nicht in die Höhe, dreispaltig anordnen
			this.outilsDreiSpalten = false
			this.$nextTick(() => {
				const haut = element.getBoundingClientRect().top
				if (element.offsetHeight > this.outilsBasLibre() - Math.max(haut, 8) - 8) {
					this.outilsDreiSpalten = true
				}
				this.$nextTick(() => this.outilsBegrenzer(false))
			})
		},
		outilsBegrenzer (enregistrer) {
			const element = this.outilsElement()
			if (!element || !this.outilsPosition) {
				return
			}
			const maxX = Math.max(0, window.innerWidth - element.offsetWidth)
			const maxY = Math.max(0, this.outilsBasLibre() - element.offsetHeight)
			const x = Math.round(Math.min(Math.max(0, this.outilsPosition.x), maxX))
			const y = Math.round(Math.min(Math.max(0, this.outilsPosition.y), maxY))
			if (x !== this.outilsPosition.x || y !== this.outilsPosition.y) {
				this.outilsPosition = { x, y }
			}
			if (enregistrer) {
				try {
					localStorage.setItem(CLE, JSON.stringify(this.outilsPosition))
				} catch {}
			}
		},
		outilsGesteDebut (event) {
			const element = this.outilsElement()
			if (!element || (event.button !== undefined && event.button > 0)) {
				return
			}
			event.preventDefault()
			const rect = element.getBoundingClientRect()
			this.outilsGeste = { dx: event.clientX - rect.left, dy: event.clientY - rect.top, id: event.pointerId }
			if (!this.outilsPosition) {
				this.outilsPosition = { x: rect.left, y: rect.top }
			}
			window.addEventListener('pointermove', this.outilsGesteMouvement, false)
			window.addEventListener('pointerup', this.outilsGesteFin, false)
			window.addEventListener('pointercancel', this.outilsGesteFin, false)
		},
		outilsGesteMouvement (event) {
			if (!this.outilsGeste || event.pointerId !== this.outilsGeste.id) {
				return
			}
			this.outilsPosition = { x: event.clientX - this.outilsGeste.dx, y: event.clientY - this.outilsGeste.dy }
			this.outilsBegrenzer(false)
		},
		outilsGesteFin () {
			window.removeEventListener('pointermove', this.outilsGesteMouvement, false)
			window.removeEventListener('pointerup', this.outilsGesteFin, false)
			window.removeEventListener('pointercancel', this.outilsGesteFin, false)
			if (this.outilsGeste) {
				this.outilsGeste = null
				this.outilsBegrenzer(true)
			}
		},
		outilsPositionReinitialiser () {
			this.outilsPosition = null
			try {
				localStorage.removeItem(CLE)
			} catch {}
			this.$nextTick(this.outilsAjuster)
		},
		outilsClavier (event) {
			// Mit Pfeiltasten verschiebbar (Barrierefreiheit)
			const pas = event.shiftKey ? 40 : 10
			const deplacements = { ArrowLeft: [-pas, 0], ArrowRight: [pas, 0], ArrowUp: [0, -pas], ArrowDown: [0, pas] }
			const d = deplacements[event.key]
			if (!d) {
				return
			}
			event.preventDefault()
			const rect = this.outilsElement().getBoundingClientRect()
			const depart = this.outilsPosition || { x: rect.left, y: rect.top }
			this.outilsPosition = { x: depart.x + d[0], y: depart.y + d[1] }
			this.outilsBegrenzer(true)
		}
	}
}
