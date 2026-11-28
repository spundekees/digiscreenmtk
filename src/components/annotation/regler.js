// Schieberegler für Strichstärke und Deckkraft (Erweiterung Medienzentrum MTK)
// Die Strichstärke wird logarithmisch abgebildet: feine Stärken lassen sich genau
// einstellen, dicke Striche bleiben trotzdem erreichbar.
const MIN = 1
const MAX = 80

export function staerkeAusRegler (wert) {
	return Math.max(MIN, Math.round(MIN * Math.pow(MAX / MIN, wert / 100)))
}

export function reglerAusStaerke (staerke) {
	const s = Math.min(MAX, Math.max(MIN, staerke || MIN))
	return Math.round(Math.log(s / MIN) / Math.log(MAX / MIN) * 100)
}

export default {
	computed: {
		reglerStaerke () {
			return reglerAusStaerke(this.epaisseurActive)
		},
		deckkraftProzent () {
			return Math.round((this.transparenceStylo ?? 1) * 100)
		},
		vorschauStrich () {
			const d = Math.min(26, Math.max(2, this.epaisseurActive))
			return {
				width: d + 'px',
				height: d + 'px',
				background: this.outilGommer ? '#888' : this.couleurStylo,
				opacity: this.outilGommer ? 0.5 : this.transparenceStylo
			}
		}
	},
	methods: {
		reglerStaerkeGeaendert (event) {
			this.modifierEpaisseur(staerkeAusRegler(Number(event.target.value)))
		},
		reglerDeckkraftGeaendert (event) {
			this.modifierTransparence(Math.round(Number(event.target.value)) / 100)
		}
	}
}
