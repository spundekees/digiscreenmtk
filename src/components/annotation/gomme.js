// Radierer (Medienzentrum MTK): radiert Pixel aus allen Annotationen.
// Jeder Radierstrich wird als Linie mit globalCompositeOperation 'destination-out' gespeichert.
import Konva from 'konva'
import { markRaw } from 'vue'

export default {
	data () {
		return {
			outilGommer: false,
			epaisseurGomme: 40
		}
	},
	computed: {
		epaisseurActive () {
			return this.outilGommer ? this.epaisseurGomme : this.epaisseurStylo
		}
	},
	watch: {
		outilGommer (valeur) {
			if (!valeur) {
				this.gommeValider()
				this.gommeMasquerCurseur()
			}
		}
	},
	methods: {
		gommeDebut (event, stage) {
			this.gommeValider()
			const position = stage.getPointerPosition()
			this.pointeurStylo = event.evt.pointerId
			try {
				event.evt.target.setPointerCapture(event.evt.pointerId)
			} catch {}
			// Direkt in der Objekt-Ebene zeichnen, damit sofort sichtbar radiert wird
			this.traitGomme = new Konva.Line({ points: [position.x, position.y, position.x, position.y], globalCompositeOperation: 'destination-out', stroke: '#000000', strokeWidth: this.epaisseurGomme, lineJoin: 'round', lineCap: 'round', listening: false, perfectDrawEnabled: false })
			const calque = this.$refs.objets.getNode()
			calque.add(this.traitGomme)
			calque.batchDraw()
		},
		gommeMouvement (event, stage) {
			const position = stage.getPointerPosition()
			if (position) {
				this.gommeAfficherCurseur(position)
			}
			if (!this.traitGomme || event.evt.pointerId !== this.pointeurStylo) {
				return
			}
			const evenements = typeof event.evt.getCoalescedEvents === 'function' ? event.evt.getCoalescedEvents() : []
			const decalageX = position.x - event.evt.clientX
			const decalageY = position.y - event.evt.clientY
			const points = this.traitGomme.points()
			let pointAjoute = false
			for (const evenement of (evenements.length > 0 ? evenements : [event.evt])) {
				const x = evenement.clientX + decalageX
				const y = evenement.clientY + decalageY
				const dx = x - points[points.length - 2]
				const dy = y - points[points.length - 1]
				if (dx * dx + dy * dy >= 4) {
					points.push(x, y)
					pointAjoute = true
				}
			}
			if (pointAjoute) {
				this.traitGomme.points(points)
				this.traitGomme.getLayer().batchDraw()
			}
		},
		gommeFin (event) {
			if (event && event.evt && event.evt.pointerId !== this.pointeurStylo) {
				return
			}
			this.gommeValider()
		},
		gommeValider () {
			if (!this.traitGomme) {
				return
			}
			const ligne = this.traitGomme
			this.traitGomme = null
			this.pointeurStylo = null
			const points = this.reduirePoints(ligne.points(), 1)
			this.id++
			this.items.push({ name: 'gomm' + this.id, objet: 'gomme', points: markRaw(points), globalCompositeOperation: 'destination-out', stroke: '#000000', strokeWidth: ligne.strokeWidth(), lineJoin: 'round', lineCap: 'round', listening: false, draggable: false, verrouille: false })
			this.enregistrer()
			this.$nextTick(() => {
				const calque = ligne.getLayer()
				ligne.destroy()
				calque?.batchDraw()
			})
		},
		gommeAfficherCurseur (position) {
			const calque = this.$refs.calqueStylo?.getNode()
			if (!calque) {
				return
			}
			if (!this.curseurGomme) {
				this.curseurGomme = new Konva.Circle({ radius: 1, stroke: '#555555', strokeWidth: 1, dash: [4, 3], fill: 'rgba(255, 255, 255, 0.35)', listening: false })
				calque.add(this.curseurGomme)
			}
			this.curseurGomme.setAttrs({ x: position.x, y: position.y, radius: this.epaisseurGomme / 2, visible: true })
			calque.batchDraw()
		},
		gommeMasquerCurseur () {
			if (this.curseurGomme) {
				const calque = this.curseurGomme.getLayer()
				this.curseurGomme.destroy()
				this.curseurGomme = null
				calque?.batchDraw()
			}
		}
	}
}
