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
			outilsWaagrecht: !!(position && position.waagrecht)
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
			// Passt die senkrechte Leiste nicht auf den Bildschirm (sehr niedrige Fenster), waagrecht legen
			if (!this.outilsWaagrecht && element.offsetHeight > this.outilsBasLibre() - 8) {
				this.outilsWaagrecht = true
				if (!this.outilsPosition) {
					this.outilsPosition = { x: 8, y: this.outilsBasLibre() }
				}
			}
			this.$nextTick(() => {
				// Waagrechte Leiste klebt am unteren Rand
				if (this.outilsWaagrecht && this.outilsPosition) {
					this.outilsPosition = { x: this.outilsPosition.x, y: this.outilsBasLibre() - element.offsetHeight }
				}
				this.outilsBegrenzer(false)
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
					localStorage.setItem(CLE, JSON.stringify({ ...this.outilsPosition, waagrecht: this.outilsWaagrecht }))
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
			this.outilsGeste = { dx: event.clientX - rect.left, dy: event.clientY - rect.top, id: event.pointerId, refY: event.clientY }
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
			const element = this.outilsElement()
			if (!element) {
				return
			}
			const bas = this.outilsBasLibre()
			const x = event.clientX - this.outilsGeste.dx
			if (this.outilsWaagrecht) {
				// Waagrecht: Leiste bleibt am unteren Rand und wandert nur seitlich mit.
				// Erst wenn der Zeiger deutlich (60 px) nach oben gezogen wird, stellt sie sich wieder auf.
				this.outilsGeste.refY = Math.max(this.outilsGeste.refY, event.clientY)
				if (event.clientY < this.outilsGeste.refY - 60) {
					this.outilsBasculer(false, event)
					return
				}
				this.outilsPosition = { x, y: bas - element.offsetHeight }
				this.outilsBegrenzer(false)
				return
			}
			const y = event.clientY - this.outilsGeste.dy
			if (y + element.offsetHeight >= bas - 20) {
				// Unteren Rand (fast) berührt: Leiste waagrecht in eine Zeile legen
				this.outilsBasculer(true, event)
				return
			}
			this.outilsPosition = { x, y }
			this.outilsBegrenzer(false)
		},
		outilsBasculer (waagrecht, event) {
			this.outilsWaagrecht = waagrecht
			this.$nextTick(() => {
				const element = this.outilsElement()
				if (!element || !this.outilsGeste) {
					return
				}
				const griff = element.querySelector('.griff-outils')
				const rectGriff = griff ? griff.getBoundingClientRect() : null
				const rect = element.getBoundingClientRect()
				const bas = this.outilsBasLibre()
				// Griff bleibt waagrecht unter dem Zeiger
				this.outilsGeste.dx = rectGriff ? (rectGriff.left - rect.left) + rectGriff.width / 2 : 10
				let y
				if (waagrecht) {
					y = bas - element.offsetHeight
					this.outilsGeste.dy = rectGriff ? (rectGriff.top - rect.top) + rectGriff.height / 2 : 10
					this.outilsGeste.refY = event.clientY
				} else {
					// Senkrecht mit Abstand zum Rand aufstellen, damit sie nicht sofort wieder umklappt
					y = Math.max(0, Math.min(event.clientY - 8, bas - element.offsetHeight - 60))
					this.outilsGeste.dy = event.clientY - y
				}
				this.outilsPosition = { x: event.clientX - this.outilsGeste.dx, y }
				this.outilsBegrenzer(false)
			})
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
			this.outilsWaagrecht = false
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
