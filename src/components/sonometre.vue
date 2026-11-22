<template>
	<JsPanel class="panneau" :visible="!chargement" :options="options">
		<div class="conteneur-gauche" />
		<div class="conteneur panneau-sonometre">
			<div class="contenu">
				<div class="volume">
					<span class="vert" :style="{'width': volume + '%'}" v-if="volume < sensibilite" />
					<span class="rouge" :style="{'width': volume + '%'}" v-else />
				</div>
				<label :id="'libelle-sensibilite-' + id">{{ $t('sensibilite') }}</label>
				<div class="sensibilite" role="group" :aria-labelledby="'libelle-sensibilite-' + id">
					<button type="button" :title="$t('modifierSensibilite', { sensibilite: 98 })" :aria-label="$t('modifierSensibilite', { sensibilite: 98 })" @click="modifierSensibilite(98)" :aria-pressed="sensibilite === 98 ? 'true' : 'false'" :class="{'selectionne': sensibilite === 98 }">1</button>
					<button type="button" :title="$t('modifierSensibilite', { sensibilite: 88 })" :aria-label="$t('modifierSensibilite', { sensibilite: 88 })" @click="modifierSensibilite(88)" :aria-pressed="sensibilite === 88 ? 'true' : 'false'" :class="{'selectionne': sensibilite === 88 }">2</button>
					<button type="button" :title="$t('modifierSensibilite', { sensibilite: 78 })" :aria-label="$t('modifierSensibilite', { sensibilite: 78 })" @click="modifierSensibilite(78)" :aria-pressed="sensibilite === 78 ? 'true' : 'false'" :class="{'selectionne': sensibilite === 78 }">3</button>
					<button type="button" :title="$t('modifierSensibilite', { sensibilite: 68 })" :aria-label="$t('modifierSensibilite', { sensibilite: 68 })" @click="modifierSensibilite(68)" :aria-pressed="sensibilite === 68 ? 'true' : 'false'" :class="{'selectionne': sensibilite === 68 }">4</button>
					<button type="button" :title="$t('modifierSensibilite', { sensibilite: 58 })" :aria-label="$t('modifierSensibilite', { sensibilite: 58 })" @click="modifierSensibilite(58)" :aria-pressed="sensibilite === 58 ? 'true' : 'false'" :class="{'selectionne': sensibilite === 58 }">5</button>
					<button type="button" :title="$t('modifierSensibilite', { sensibilite: 48 })" :aria-label="$t('modifierSensibilite', { sensibilite: 48 })" @click="modifierSensibilite(48)" :aria-pressed="sensibilite === 48 ? 'true' : 'false'" :class="{'selectionne': sensibilite === 48 }">6</button>
					<button type="button" :title="$t('modifierSensibilite', { sensibilite: 38 })" :aria-label="$t('modifierSensibilite', { sensibilite: 38 })" @click="modifierSensibilite(38)" :aria-pressed="sensibilite === 38 ? 'true' : 'false'" :class="{'selectionne': sensibilite === 38 }">7</button>
				</div>
				<label :for="'seuil_tolerance_' + id">{{ $t('seuilTolerance') }}</label>
				<input :id="'seuil_tolerance_' + id" type="number" :value="tolerance" @input="tolerance = $event.target.value" :min="1" :max="100">
				<div class="actions">
					<button type="button" class="bouton" @click="demarrer" v-if="verificationVolume === ''">{{ $t('demarrer') }}</button>
					<button type="button" class="bouton" @click="pause" v-else>{{ $t('pause') }}</button>
				</div>
			</div>
		</div>
		<div class="conteneur-droite" />
		<div class="conteneur-bas" />
	</JsPanel>
</template>

<script>
import JsPanel from '@/components/jspanel.vue'
import Panneau from '@/panneau'

export default {
	name: 'PSonometre',
	inject: ['app'],
	components: {
		JsPanel
	},
	props: {
		panneau: { type: Object, required: true },
		pages: { type: Array, required: true },
		nav: { type: Boolean, default: false },
		export: { type: Boolean, default: false },
		evenementClavier: { type: Object, default: () => ({}) }
	},
	extends: Panneau,
	data () {
		return {
			chargement: true,
			options: {},
			mode: 'lecture',
			deplacement: false,
			redimensionnement: false,
			redimensionnementProportionnel: true,
			titre: '',
			id: '',
			w: 0,
			h: 0,
			x: 0,
			y: 0,
			minw: 40,
			minh: 24,
			statut: '',
			dimensions: {},
			position: {},
			contexteAudio: '',
			sourceAudio: '',
			analyseur: '',
			volumes: [],
			volume: 0,
			sensibilite: 98,
			verificationVolume: '',
			decompte: 0,
			tolerance: 3
		}
	},
	watch: {
		export (valeur) {
			if (valeur === true) {
				this.position = { x: this.x, y: this.y }
				this.$emit('export', { id: this.id, titre: this.titre, statut: this.statut, dimensions: this.dimensions, position: this.position, contenu: '', echelle: this.echelle, w: this.w, h: this.h, x: this.x, y: this.y })
			}
		},
		volume (valeur) {
			if (valeur >= this.sensibilite) {
				this.decompte++
				if (this.decompte === this.tolerance * 10) {
					clearInterval(this.verificationVolume)
					this.app.audio.src = this.$recupererRessource('./static/audio/cloche.mp3')
					this.app.audio.play()
					this.decompte = 0
					setTimeout(() => {
						this.verificationVolume = setInterval(this.dessinerFlux, 100)
						this.decompte = 0
					}, 100)
				}
			} else {
				this.decompte = 0
			}
		}
	},
	created () {
		this.definirCaracteristiques('sonometre')
		this.genererOptions('sonometre')
	},
	mounted () {
		this.initialiser()
		this.positionner()
		this.chargement = false
		if (this.statut !== 'min') {
			setTimeout(() => {
				document.querySelector('#' + this.id + ' .actions .bouton')?.focus()
			}, 0)
		}
	},
	methods: {
		modifierSensibilite (sensibilite) {
			this.sensibilite = sensibilite
		},
		demarrer () {
			if (this.verificationVolume === '') {
				navigator.mediaDevices.getUserMedia({ audio: true }).then((fluxAudio) => {
					this.genererFlux(fluxAudio)
					if (this.volumes.length > 0) {
						this.verificationVolume = setInterval(this.dessinerFlux, 100)
					} else {
						alert(this.$t('erreurSonometre'))
					}
				}).catch(() => {
					alert(this.$t('erreurSonometre'))
				})
			}
		},
		pause () {
			if (this.verificationVolume !== '') {
				clearInterval(this.verificationVolume)
				this.verificationVolume = ''
			}
		},
		genererFlux (fluxAudio) {
			this.contexteAudio = new AudioContext()
			this.sourceAudio = this.contexteAudio.createMediaStreamSource(fluxAudio)
			this.analyseur = this.contexteAudio.createAnalyser()
			this.analyseur.fftSize = 512
			this.analyseur.minDecibels = -127
			this.analyseur.maxDecibels = 0
			this.analyseur.smoothingTimeConstant = 0.4
			this.sourceAudio.connect(this.analyseur)
			this.volumes = new Uint8Array(this.analyseur.frequencyBinCount)
		},
		dessinerFlux () {
			this.analyseur.getByteFrequencyData(this.volumes)
			let additionVolume = 0
			for (const volume of this.volumes) {
				additionVolume += volume
			}
			const volumeMoyen = additionVolume / this.volumes.length
			this.volume = (volumeMoyen * 100) / 127
		}
	}
}
</script>

<style>
.panneau .panneau-sonometre .volume {
	border: 1px solid #ddd;
	width: 100%;
	height: 3rem;
	margin-bottom: 2rem;
}

.panneau .panneau-sonometre .volume span {
	display: block;
	max-width: 100%;
	height: 100%;
	transition: width 100ms linear;
}

.panneau .panneau-sonometre .volume span.vert {
	background: #00b894;
}

.panneau .panneau-sonometre .volume span.rouge {
	background: #ff7575;
}

.panneau .panneau-sonometre .sensibilite {
	display: flex;
	justify-content: center;
	margin-bottom: 2rem;
}

.panneau .panneau-sonometre .sensibilite button {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 3.2rem;
	height: 3.2rem;
	margin-right: 1rem;
	font-size: 1.7rem;
	border-radius: 50%;
	background: #00ced1;
	color: #001d1d;
	cursor: pointer;
	user-select: none;
}

.panneau .panneau-sonometre .sensibilite button.selectionne {
	background: #444;
	color: #fff;
}

.panneau .panneau-sonometre .sensibilite button:last-child {
	margin-right: 0;
}
</style>
