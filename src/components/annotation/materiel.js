// Rechengeld und Dienes-Material in der Annotation (Medienzentrum MTK).
// Ein Klick auf ein Teil legt es in die Mitte, Ziehen legt es an die gewünschte Stelle.
// Die Teile sind normale Annotations-Objekte (objet 'materiel'): verschieben, vergrößern,
// duplizieren und löschen wie Formen; sie werden mit der Tafel gespeichert.
import { markRaw } from 'vue'
import { KATALOG, MOTIFS } from './materialBilder.js'

export default {
	data () {
		return {
			materielMenu: '',
			materielBilder: {},
			materielGeste: null,
			materielFantome: null,
			materielStylePalette: {},
			materielDecalage: 0
		}
	},
	computed: {
		materielListe () {
			return KATALOG[this.materielMenu] || []
		}
	},
	watch: {
		outilsPosition () {
			if (this.materielMenu) {
				this.$nextTick(this.materielPositionner)
			}
		},
		outilsWaagrecht () {
			if (this.materielMenu) {
				this.$nextTick(this.materielPositionner)
			}
		}
	},
	created () {
		// Bilder einmal laden; Konva zeichnet sie, sobald sie bereit sind
		Object.values(MOTIFS).forEach((e) => {
			const image = new window.Image()
			image.onload = () => {
				this.materielBilder = { ...this.materielBilder, [e.motif]: markRaw(image) }
			}
			image.src = e.src
		})
	},
	beforeUnmount () {
		this.materielGesteFin()
	},
	methods: {
		configMateriel (item) {
			return { ...item, image: this.materielBilder[item.motif] }
		},
		titreMateriel (entree) {
			return this.materielMenu === 'dienes' ? this.$t('dienes_' + entree.titre) : entree.titre
		},
		basculerMateriel (type) {
			this.materielMenu = this.materielMenu === type ? '' : type
			if (this.materielMenu) {
				this.$nextTick(this.materielPositionner)
			}
		},
		materielPositionner () {
			// Auswahl neben die Werkzeugleiste legen (bei waagrechter Leiste darüber)
			const outils = this.outilsElement ? this.outilsElement() : null
			const palette = document.querySelector('#materiel-palette')
			if (!outils || !palette) {
				return
			}
			const r = outils.getBoundingClientRect()
			const pw = palette.offsetWidth
			const ph = palette.offsetHeight
			let left
			let top
			if (this.outilsWaagrecht) {
				left = r.left
				top = r.top - ph - 8
			} else {
				left = r.right + 8
				top = r.top
				if (left + pw > window.innerWidth - 8) {
					left = r.left - pw - 8
				}
			}
			left = Math.max(8, Math.min(left, window.innerWidth - pw - 8))
			top = Math.max(52, Math.min(top, window.innerHeight - ph - 8))
			this.materielStylePalette = { left: left + 'px', top: top + 'px' }
		},
		materielGesteDebut (event, entree) {
			if (event.button !== undefined && event.button > 0) {
				return
			}
			event.preventDefault()
			this.materielGeste = { id: event.pointerId, x0: event.clientX, y0: event.clientY, entree: entree, bouge: false }
			window.addEventListener('pointermove', this.materielGesteMouvement)
			window.addEventListener('pointerup', this.materielGesteFin)
			window.addEventListener('pointercancel', this.materielGesteAnnuler)
		},
		materielGesteMouvement (event) {
			const g = this.materielGeste
			if (!g || event.pointerId !== g.id) {
				return
			}
			if (!g.bouge && Math.hypot(event.clientX - g.x0, event.clientY - g.y0) > 6) {
				g.bouge = true
			}
			if (g.bouge) {
				this.materielFantome = { src: g.entree.src, x: event.clientX - g.entree.w / 2, y: event.clientY - g.entree.h / 2, w: g.entree.w, h: g.entree.h }
			}
		},
		materielGesteAnnuler () {
			this.materielGeste = null
			this.materielFantome = null
			this.materielGesteFin()
		},
		materielGesteFin (event) {
			window.removeEventListener('pointermove', this.materielGesteMouvement)
			window.removeEventListener('pointerup', this.materielGesteFin)
			window.removeEventListener('pointercancel', this.materielGesteAnnuler)
			const g = this.materielGeste
			this.materielGeste = null
			this.materielFantome = null
			if (!g || !event || event.pointerId !== g.id) {
				return
			}
			const cible = document.elementFromPoint(event.clientX, event.clientY)
			if (g.bouge) {
				// Nur ablegen, wenn über der Zeichenfläche losgelassen (nicht über Menü oder Werkzeugleiste)
				if (cible && (cible.closest('#materiel-palette') || cible.closest('#outils-annotation') || cible.closest('#options') || cible.closest('nav'))) {
					return
				}
				const p = this.zirkelPosition(event)
				this.materielPlacer(g.entree, p.x, p.y)
			} else {
				// Klick: in die Mitte legen, jedes weitere Teil etwas versetzt
				const d = (this.materielDecalage % 8) * 24
				this.materielDecalage++
				this.materielPlacer(g.entree, this.dimensionsCanva.w / 2 + d, this.dimensionsCanva.h / 2 + d)
			}
		},
		materielPlacer (entree, x, y) {
			if (!this.outilSelectionner) {
				this.definirOutilPrincipal('selectionner')
			}
			this.reinitialiserSelection()
			this.id++
			const nom = 'imag' + this.id
			this.items.push({ name: nom, objet: 'materiel', motif: entree.motif, x: Math.round(x - entree.w / 2), y: Math.round(y - entree.h / 2), width: entree.w, height: entree.h, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1, draggable: true, verrouille: false })
			this.enregistrer()
		}
	}
}
