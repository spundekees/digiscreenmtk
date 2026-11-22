<template>
	<JsPanel class="panneau" :visible="!chargement" :options="options">
		<div class="conteneur-gauche" />
		<div class="conteneur panneau-audio">
			<div class="contenu" v-if="mode === 'edition' && !chargementAudio">
				<label :for="'lien_audio_' + id">{{ $t('lienFichierAudio') }}</label>
				<div class="valider">
					<input :id="'lien_audio_' + id" type="text" :value="audio" @input="audio = $event.target.value" @keydown.enter="valider">
					<button type="button" class="bouton-secondaire" :title="$t('valider')" :aria-label="$t('valider')" @click="valider"><i class="material-icons" aria-hidden="true">search</i></button>
				</div>
				<div class="separateur"><span>{{ $t('ou') }}</span></div>
				<label :id="'libelle-audio-1_' + id">{{ $t('fichierAppareil') }}</label>
				<span :aria-describedby="'libelle-audio-1_' + id" role="button" class="bouton" tabindex="0" @keydown.enter.space.prevent="activerInput('selectionner_audio_' + id)" @click="activerInput('selectionner_audio_' + id)">{{ $t('selectionnerAudio') }}</span>
				<input :id="'selectionner_audio_' + id" type="file" @change="televerserAudio" style="display: none" accept=".mp3, .wav, .m4a, .ogg">
			</div>
			<div class="contenu" v-else-if="mode === 'edition' && chargementAudio">
				<div class="conteneur-chargement">
					<div class="chargement"><span class="lecteur-ecran">{{ $t('chargementEnCours') }}</span></div>
				</div>
			</div>
			<div class="contenu" v-else-if="mode === 'parametres'">
				<audio controls :src="audio"></audio>
				<label :for="'vitesse_' + id">{{ $t('vitesseLecture') }}</label>
				<div class="vitesse">
					<input :id="'vitesse_' + id" type="range" :min="0.5" :max="2" :value="vitesse" :step="0.1" @change="modifierVitesse">
					<span class="valeur">{{ vitesse }}</span>
				</div>
				<label :id="'groupe_choix_' + id" class="libelle-option">{{ $t('apparence') }}</label>
				<div class="choix" role="radiogroup" :aria-labelledby="'groupe_choix_' + id">
					<span class="lecteur-audio">
						<input :id="'lecteur_' + id" type="radio" :name="'type_' + id" value="lecteur" :checked="type === 'lecteur'" @change="type = $event.target.value">
						<label :for="'lecteur_' + id">{{ $t('lecteur') }}</label>
					</span>
					<span class="bouton-audio">
						<input :id="'bouton_' + id" type="radio" :name="'type_' + id" value="bouton" :checked="type === 'bouton'" @change="type = $event.target.value">
						<label :for="'bouton_' + id">{{ $t('bouton') }}</label>
					</span>
				</div>
				<button type="button" class="bouton" @click="generer">{{ $t('valider') }}</button>
			</div>
			<div class="contenu lecture-audio" v-else>
				<audio controls :class="{'masque': type === 'bouton'}" :src="audio"></audio>
				<button type="button" class="bouton audio" :title="$t('ecouterAudio')" :aria-label="$t('ecouterAudio')" @click="lireAudio" v-if="type === 'bouton' && !lecture">
					<i class="material-icons" aria-hidden="true">play_arrow</i>
				</button>
				<button type="button" class="bouton audio" :title="$t('pause')" :aria-label="$t('pause')" @click="lireAudio" v-else-if="type === 'bouton' && lecture">
					<i class="material-icons" aria-hidden="true">pause</i>
				</button>
				<button type="button" class="bouton-secondaire" :title="$t('relireAudio')" :aria-label="$t('relireAudio')" @click="relireAudio" v-if="type === 'bouton'"><i class="material-icons" aria-hidden="true">replay</i></button>
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
	name: 'PAudio',
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
			mode: 'edition',
			deplacement: false,
			redimensionnement: false,
			redimensionnementProportionnel: true,
			titre: '',
			id: '',
			w: 0,
			h: 0,
			x: 0,
			y: 0,
			minw: 21,
			minh: 12,
			statut: '',
			dimensions: {},
			position: {},
			donnees: { x: 0, y: 0 },
			audio: '',
			dataURL: '',
			type: 'lecteur',
			vitesse: 1,
			lecture: false,
			chargementAudio: false
		}
	},
	watch: {
		chargementAudio (valeur) {
			if (valeur) this.annoncer(this.$t('chargementEnCours'))
		},
		export (valeur) {
			if (valeur === true) {
				this.position = { x: this.x, y: this.y }
				this.$emit('export', { id: this.id, titre: this.titre, mode: this.mode, statut: this.statut, dimensions: this.dimensions, position: this.position, contenu: { audio: this.audio, dataURL: this.dataURL, type: this.type, vitesse: this.vitesse }, echelle: this.echelle, w: this.w, h: this.h, x: this.x, y: this.y })
			}
		}
	},
	created () {
		this.definirCaracteristiques('audio')
		if (this.panneau.contenu !== '') {
			if (this.panneau.contenu.hasOwnProperty('dataURL')) {
				this.dataURL = this.panneau.contenu.dataURL
			}
			if (this.dataURL !== '') {
				const blob = this.convertirDataURL(this.dataURL)
				this.audio = window.URL.createObjectURL(blob)
			} else {
				this.audio = this.panneau.contenu.audio
			}
			if (this.panneau.contenu.hasOwnProperty('type')) {
				this.type = this.panneau.contenu.type
			}
			if (this.panneau.contenu.hasOwnProperty('vitesse')) {
				this.vitesse = this.panneau.contenu.vitesse
			}
		}
		if (this.mode === 'vitesse') {
			this.mode = 'parametres'
			this.w = 40
			this.h = 32
		}
		this.genererOptions('audio')
	},
	mounted () {
		this.initialiser()
		this.positionner()
		this.chargement = false
		if (this.mode === 'edition' && this.statut !== 'min') {
			setTimeout(() => {
				document.querySelector('#' + this.id + ' input[type="text"]')?.focus()
			}, 0)
		} else if (this.mode === 'parametres' && this.statut !== 'min') {
			setTimeout(() => {
				document.querySelector('#' + this.id + ' audio')?.focus()
			}, 30)
		} else if (this.mode === 'lecture') {
			setTimeout(() => {
				const audio = document.querySelector('#' + this.id + ' audio')
				audio.playbackRate = this.vitesse
				audio.preservesPitch = true
				if (this.type === 'bouton') {
					audio.addEventListener('ended', () => {
						this.lecture = false
					})
				} else {
					audio.focus()
				}
				if (this.statut !== 'min' && this.type === 'bouton') {
					this.$nextTick(() => {
						document.querySelector('#' + this.id + ' .bouton.audio')?.focus()
					})
				} else if (this.statut !== 'min' && this.type !== 'bouton') {
					this.$nextTick(() => {
						audio.focus()
					})
				}
			}, 30)
		}
	},
	methods: {
		valider () {
			if (this.verifierURL(this.audio) === true) {
				this.mode = 'parametres'
				this.w = 40
				this.h = 32
				this.positionner()
			}
		},
		generer () {
			this.mode = 'lecture'
			if (this.type === 'lecteur') {
				this.w = 40
				this.h = 12
			} else {
				this.w = 21
				this.h = 14
			}
			if (this.donnees.x > 0 && this.donnees.y > 0) {
				this.x = this.donnees.x
				this.y = this.donnees.y
			}
			this.positionner()
			this.$nextTick(() => {
				const audio = document.querySelector('#' + this.id + ' audio')
				audio.playbackRate = this.vitesse
				audio.preservesPitch = true
				if (this.type === 'bouton') {
					document.querySelector('#' + this.id + ' .bouton.audio')?.focus()
					audio.addEventListener('ended', () => {
						this.lecture = false
					})
				} else {
					audio.focus()
				}
			})
		},
		editer () {
			this.mode = 'parametres'
			this.lecture = false
			this.donnees.x = this.x
			this.donnees.y = this.y
			this.w = 40
			this.h = 32
			this.$nextTick(() => {
				document.querySelector('#' + this.id + ' audio')?.focus()
			})
			this.positionner()
		},
		modifierVitesse (event) {
			const vitesse = event.target.value
			document.querySelector('#' + this.id + ' audio').playbackRate = vitesse
			this.vitesse = vitesse
		},
		televerserAudio (event) {
			const fichier = event.target.files[0]
			if (fichier) {
				this.chargementAudio = true
				const reader = new FileReader()
				reader.readAsDataURL(fichier)
				reader.onloadend = (e) => {
					this.chargementAudio = false
					this.dataURL = e.target.result
					this.audio = window.URL.createObjectURL(fichier)
					this.mode = 'parametres'
					this.w = 40
					this.h = 32
					this.$nextTick(() => {
						document.querySelector('#' + this.id + ' audio')?.focus()
					})
					this.positionner()
				}
				reader.onerror = () => {
					this.chargementAudio = false
				}
			}
		},
		lireAudio () {
			const audio = document.querySelector('#' + this.id + ' audio')
			if (this.lecture === false) {
				audio.play()
				this.lecture = true
			} else {
				audio.pause()
				this.lecture = false
			}
		},
		relireAudio () {
			const audio = document.querySelector('#' + this.id + ' audio')
			audio.pause()
			audio.currentTime = 0
			audio.play()
			this.lecture = true
		}
	}
}
</script>

<style>
.panneau .panneau-audio audio {
	width: 100%;
}

.panneau .panneau-audio audio.masque {
	display: none;
}

.panneau .panneau-audio audio + label {
	margin-top: 2rem;
}

.panneau .panneau-audio .valider {
	display: flex;
	align-items: center;
}

.panneau .panneau-audio .valider .bouton-secondaire {
    width: auto!important;
    margin-left: 0.5rem;
	line-height: 1;
}

.panneau .panneau-audio .conteneur-chargement {
	font-size: 0;
	line-height: 1;
	text-align: center;
}

.panneau .panneau-audio .conteneur-chargement {
	font-size: 0;
	line-height: 1;
	text-align: center;
}

.panneau .panneau-audio .chargement {
	display: inline-block;
	border: 7px solid #ddd;
	border-top: 7px solid #00ced1;
	border-radius: 50%;
	width: 45px;
	height: 45px;
	animation: rotation 0.7s linear infinite;
}

.panneau .panneau-audio .separateur {
    position: relative;
    margin: 2rem 25% 2rem;
    text-align: center;
    width: 50%;
}

.panneau .panneau-audio .separateur::before {
    position: absolute;
    top: 50%;
    display: block;
    content: '';
    width: 100%;
    height: 1px;
    background-color: #ddd;
}

.panneau .panneau-audio .separateur span {
    position: relative;
    margin: 0;
    font-size: 1.5rem;
    z-index: 2;
    display: inline-block;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    vertical-align: middle;
    background-color: #fff;
}

.panneau .panneau-audio span:where([role="button"]).bouton {
	margin-top: 0;
	margin-bottom: 0!important;
}

.panneau .panneau-audio .choix label {
	display: inline-block;
	width: auto;
	font-size: 1.6rem;
	font-weight: 400;
    margin-left: 1rem;
	margin-bottom: 0;
}

.panneau .panneau-audio .lecteur-audio {
	margin-right: 2.5rem;
}

.panneau .panneau-audio .contenu.lecture-audio {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.panneau .panneau-audio .contenu.lecture-audio .bouton-secondaire {
	width: 3.6rem;
	line-height: 1;
}

.panneau .panneau-audio .bouton.audio {
	height: 6.4rem;
	line-height: 6.4rem;
	padding: 0 3.5rem;
	margin-top: 0;
}

.panneau .panneau-audio .bouton.audio i {
	font-size: 4.8rem;
}
</style>
