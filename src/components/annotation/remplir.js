// Füllwerkzeug für die Annotationen: geschlossene Flächen per Flutfüllung als Pfad füllen.
// Gehört zu annotation.vue.

export default {
	data () {
		return {
			outilRemplir: false
		}
	},
	watch: {
		outilRemplir (valeur) {
			if (valeur === true) {
				this.desactiverDeplacement()
				// Sinnvolle Vorgabe zum Markieren von Flächen: Gelb, halbtransparent
				if (this.couleurStylo === '#000000' || this.couleurStylo === '#ffffff') {
					this.couleurStylo = '#ffff00'
				}
				if (this.transparenceStylo === 1) {
					this.transparenceStylo = 0.6
				}
			}
			this.reinitialiserSelection()
		}
	},
	methods: {
		remplir (position) {
			const stage = this.$refs.stage.getNode()
			const layer = this.$refs.objets.getNode()
			const x0 = Math.floor(position.x)
			const y0 = Math.floor(position.y)
			// Klick auf eine vorhandene Füllfläche: nur deren Farbe/Transparenz ändern
			const touche = stage.getIntersection(position)
			if (touche && touche.getAttr('objet') === 'remplissage') {
				const item = this.items.find(r => r.name === touche.name())
				if (item) {
					item.fill = this.couleurStylo
					item.opacity = this.transparenceStylo
					this.enregistrer()
				}
				return
			}
			// Nur die Striche als Grenzen rendern (Füllflächen, Auswahl und Transformer ausblenden)
			const versteckt = []
			layer.getChildren().forEach((node) => {
				if (node.visible() && (node.getAttr('objet') === 'remplissage' || node.getAttr('objet') === 'ancre' || node.getClassName() === 'Transformer' || !node.getAttr('objet'))) {
					node.visible(false)
					versteckt.push(node)
				}
			})
			const w = Math.round(stage.width())
			const h = Math.round(stage.height())
			let donnees
			try {
				const canvas = layer.toCanvas({ x: 0, y: 0, width: w, height: h, pixelRatio: 1 })
				donnees = canvas.getContext('2d').getImageData(0, 0, w, h).data
			} finally {
				versteckt.forEach(node => node.visible(true))
				layer.batchDraw()
			}
			if (x0 < 0 || y0 < 0 || x0 >= w || y0 >= h) {
				return
			}
			const bord = new Uint8Array(w * h)
			for (let i = 0; i < w * h; i++) {
				if (donnees[i * 4 + 3] > 40) bord[i] = 1
			}
			if (bord[y0 * w + x0]) {
				return
			}
			// Flutfüllung (Scanline)
			const masque = new Uint8Array(w * h)
			const pile = [x0, y0]
			let touchesBord = false
			let nombre = 0
			while (pile.length) {
				const y = pile.pop()
				let x = pile.pop()
				let i = y * w + x
				while (x > 0 && !bord[i - 1] && !masque[i - 1]) { x--; i-- }
				let haut = false
				let bas = false
				while (x < w && !bord[i] && !masque[i]) {
					masque[i] = 1
					nombre++
					if (x === 0 || x === w - 1 || y === 0 || y === h - 1) touchesBord = true
					if (y > 0) {
						const libre = !bord[i - w] && !masque[i - w]
						if (libre && !haut) { pile.push(x, y - 1); haut = true } else if (!libre) haut = false
					}
					if (y < h - 1) {
						const libre = !bord[i + w] && !masque[i + w]
						if (libre && !bas) { pile.push(x, y + 1); bas = true } else if (!libre) bas = false
					}
					x++
					i++
				}
			}
			if (touchesBord || nombre === 0) {
				this.app.notification = { type: 'erreur', message: this.$t('remplirZoneOuverte') }
				return
			}
			// Fläche um 2 px unter die Striche erweitern, damit kein Spalt bleibt
			for (let n = 0; n < 2; n++) {
				const copie = masque.slice()
				for (let y = 1; y < h - 1; y++) {
					for (let x = 1; x < w - 1; x++) {
						const i = y * w + x
						if (!copie[i] && (copie[i - 1] || copie[i + 1] || copie[i - w] || copie[i + w])) masque[i] = 1
					}
				}
			}
			const chemin = this.tracerContours(masque, w, h)
			if (!chemin) {
				return
			}
			this.id++
			const item = { name: 'fill' + this.id, objet: 'remplissage', data: chemin, x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, fill: this.couleurStylo, fillRule: 'evenodd', opacity: this.transparenceStylo, strokeWidth: 0, draggable: false, verrouille: false, listening: true }
			// Füllflächen kommen unter alle Striche
			this.items.unshift(item)
			this.nom = ''
			this.objet = ''
			this.enregistrer()
			this.$nextTick(() => {
				layer.batchDraw()
			})
		},
		tracerContours (masque, w, h) {
			// Pixelkanten zwischen gefüllten und leeren Pixeln zu geschlossenen Linienzügen verbinden (äußerer Rand und Löcher)
			const suivant = new Map()
			const cle = (x, y) => y * (w + 1) + x
			const ajouter = (x1, y1, x2, y2) => {
				const k = cle(x1, y1)
				if (!suivant.has(k)) suivant.set(k, [])
				suivant.get(k).push(cle(x2, y2))
			}
			const plein = (x, y) => x >= 0 && y >= 0 && x < w && y < h && masque[y * w + x] === 1
			for (let y = 0; y < h; y++) {
				for (let x = 0; x < w; x++) {
					if (!masque[y * w + x]) continue
					if (!plein(x, y - 1)) ajouter(x, y, x + 1, y)
					if (!plein(x + 1, y)) ajouter(x + 1, y, x + 1, y + 1)
					if (!plein(x, y + 1)) ajouter(x + 1, y + 1, x, y + 1)
					if (!plein(x - 1, y)) ajouter(x, y + 1, x, y)
				}
			}
			const simplifier = (pts, eps) => {
				if (pts.length < 3) return pts
				let dmax = 0
				let index = 0
				const [a, b] = [pts[0], pts[pts.length - 1]]
				const lx = b[0] - a[0]
				const ly = b[1] - a[1]
				const l = Math.hypot(lx, ly) || 1
				for (let i = 1; i < pts.length - 1; i++) {
					const d = Math.abs(ly * pts[i][0] - lx * pts[i][1] + b[0] * a[1] - b[1] * a[0]) / l
					if (d > dmax) { dmax = d; index = i }
				}
				if (dmax > eps) {
					const g = simplifier(pts.slice(0, index + 1), eps)
					const d = simplifier(pts.slice(index), eps)
					return g.slice(0, -1).concat(d)
				}
				return [a, b]
			}
			const parties = []
			suivant.forEach((liste, depart) => {
				while (liste.length) {
					const boucle = []
					let k = depart
					let garde = 0
					do {
						boucle.push([k % (w + 1), Math.floor(k / (w + 1))])
						const suite = suivant.get(k)
						if (!suite || !suite.length) break
						k = suite.pop()
						garde++
					} while (k !== depart && garde < 10000000)
					if (boucle.length >= 4) {
						// Bei geschlossenen Zügen an einem beliebigen Punkt teilen, damit die Vereinfachung funktioniert
						const moitie = Math.floor(boucle.length / 2)
						const p1 = simplifier(boucle.slice(0, moitie + 1), 0.6)
						const p2 = simplifier(boucle.slice(moitie).concat([boucle[0]]), 0.6)
						const pts = p1.slice(0, -1).concat(p2.slice(0, -1))
						parties.push('M' + pts.map(p => p[0] + ' ' + p[1]).join('L') + 'Z')
					}
				}
			})
			return parties.length ? parties.join('') : null
		}
	}
}
