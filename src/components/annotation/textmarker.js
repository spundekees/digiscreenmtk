// Textmarker als Variante des Stifts (Medienzentrum MTK):
// zeichnet frei wie der Stift, aber breit, durchscheinend und mit „multiply“,
// damit Schrift darunter lesbar bleibt. Stift- und Textmarker-Einstellungen werden getrennt gemerkt.
export default {
	data () {
		return {
			stiftModus: 'stylo',
			reglagesStylo: { couleur: '#000000', epaisseur: 2, transparence: 1 },
			reglagesMarqueur: { couleur: '#ffff00', epaisseur: 20, transparence: 0.4 }
		}
	},
	computed: {
		modeMarqueur () {
			return this.outilDessiner && this.stiftModus === 'marqueur'
		}
	},
	methods: {
		lireReglagesStift () {
			return { couleur: this.couleurStylo, epaisseur: this.epaisseurStylo, transparence: this.transparenceStylo }
		},
		appliquerReglagesStift (reglages) {
			this.couleurStylo = reglages.couleur
			this.epaisseurStylo = reglages.epaisseur
			this.transparenceStylo = reglages.transparence
		},
		basculerStiftModus (mode) {
			if (!this.outilDessiner) {
				this.definirOutilPrincipal('dessiner')
			}
			if (mode === this.stiftModus) {
				return
			}
			if (this.stiftModus === 'marqueur') {
				this.reglagesMarqueur = this.lireReglagesStift()
				this.appliquerReglagesStift(this.reglagesStylo)
			} else {
				this.reglagesStylo = this.lireReglagesStift()
				this.appliquerReglagesStift(this.reglagesMarqueur)
			}
			this.stiftModus = mode
		}
	}
}
