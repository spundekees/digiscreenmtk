// Zeichnungen, Zirkel und Geodreieck mitbewegen, wenn der Schreib-Hintergrund skaliert oder verschoben wird.
// Gehört zu annotation.vue.
import echelonnerAnnotations, { deplacerAnnotations } from '../../echelleAnnotations.js'

export default {
	computed: {
		zirkelEchelleFond () {
			// Seite + aktuelle Skalierung des Schreib-Hintergrunds (1, wenn kein Schreib-Hintergrund)
			const page = this.app.pages[this.app.page - 1]
			const fond = (page && page.fond) || ''
			const ecriture = fond.includes('/static/img/') && /\.(png|svg)$/.test(fond)
			const d = ecriture && page.decalageFond ? page.decalageFond : { x: 0, y: 0 }
			return { page: this.app.page, fond: fond, echelle: ecriture && page.echelleFond > 0 ? page.echelleFond : 1, dx: d.x, dy: d.y }
		}
	},
	watch: {
		zirkelEchelleFond (neu, alt) {
			// Hintergrund wurde auf derselben Seite skaliert: Zirkel mitskalieren, damit er auf denselben Kästchen bleibt
			if (!alt || neu.page !== alt.page || neu.fond !== alt.fond) {
				return
			}
			// Hintergrund wurde verschoben: alles mitverschieben
			const vx = neu.dx - alt.dx
			const vy = neu.dy - alt.dy
			if ((vx !== 0 || vy !== 0) && neu.echelle === alt.echelle) {
				this.zirkel.x += vx
				this.zirkel.y += vy
				this.geo.x += vx
				this.geo.y += vy
				if (this.items.length > 0) {
					this.reinitialiserSelection()
					deplacerAnnotations(this.items, vx, vy)
					// Nicht bei jeder Mausbewegung einen Rückgängig-Schritt anlegen
					clearTimeout(this.minuteurDeplacementFond)
					this.minuteurDeplacementFond = setTimeout(() => {
						this.enregistrer()
					}, 400)
				}
				return
			}
			if (neu.echelle === alt.echelle) {
				return
			}
			const f = neu.echelle / alt.echelle
			const main = document.querySelector('main')
			const annotation = document.querySelector('#annotation')
			if (!main || !annotation) {
				return
			}
			const rm = main.getBoundingClientRect()
			const ra = annotation.getBoundingClientRect()
			// Drehpunkt = Bezugspunkt des Musters: links oben bei der Häuschen-Lineatur, sonst Bildschirmmitte
			const gauche = rm.left + main.clientLeft - ra.left
			const haut = rm.top + main.clientTop - ra.top
			const pivot = neu.fond.includes('/img/lineatur-haeuschen') ? { x: gauche + neu.dx, y: haut + neu.dy } : { x: gauche + main.clientWidth / 2 + neu.dx, y: haut + main.clientHeight / 2 + neu.dy }
			this.zirkel.x = pivot.x + (this.zirkel.x - pivot.x) * f
			this.zirkel.y = pivot.y + (this.zirkel.y - pivot.y) * f
			this.zirkel.r = Math.min(Math.max(this.zirkel.r * f, 10), 3000)
			this.geo.x = pivot.x + (this.geo.x - pivot.x) * f
			this.geo.y = pivot.y + (this.geo.y - pivot.y) * f
			// Alle gezeichneten Objekte wachsen mit
			if (this.items.length > 0) {
				this.reinitialiserSelection()
				echelonnerAnnotations(this.items, f, pivot.x, pivot.y)
				this.enregistrer()
				this.$nextTick(() => {
					if (this.$refs.objets) {
						this.$refs.objets.getNode().getLayer().batchDraw()
					}
				})
			}
		}
	}
}
