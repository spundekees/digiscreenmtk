<template>
	<JsPanel class="panneau" :visible="!chargement" :options="options">
		<div class="conteneur-gauche" />
		<div class="conteneur panneau-enregistrement">
			<div class="contenu" v-if="mode === 'edition'">
				<label :id="'libelle-enregistrement-1_' + id">{{ $t('enregistrementAudio') }}</label>
				<div role="group" :aria-labelledby="'libelle-enregistrement-1_' + id" :id="'enregistrement_' + id" v-if="enregistrement === false">
					<button type="button" class="bouton enregistrer" @click="enregistrerAudio"><i class="material-icons" aria-hidden="true">fiber_manual_record</i><span>{{ $t('enregistrerAudio') }}</span></button>
				</div>
				<div :id="'enregistrement_' + id" v-else-if="enregistrement === true">
					<canvas :id="'visualisation_' + id" class="visualisation" width="360" height="60" aria-hidden="true" />
					<div class="enregistrement">
						<button type="button" class="bouton-enregistrement" :title="$t('stopper')" :aria-label="$t('stopper')" :class="{'stopper': !pause}" @click="arreterEnregistrementAudio"><i class="material-icons" aria-hidden="true">stop</i></button>
						<button type="button" class="bouton-enregistrement" :title="$t('pause')" :aria-label="$t('pause')" @click="mettreEnPauseEnregistrementAudio" v-if="!pause"><i class="material-icons" aria-hidden="true">pause</i></button>
						<button type="button" class="bouton-enregistrement" :title="$t('reprendre')" :aria-label="$t('reprendre')" @click="reprendreEnregistrementAudio" v-else><i class="material-icons" aria-hidden="true">play_arrow</i></button>
						<span class="duree" role="timer"><span class="lecteur-ecran">{{ $t('dureeEnregistrement') }} </span>{{ dureeEnregistrement }}</span>
					</div>
				</div>
			</div>
			<div class="contenu" v-else-if="mode === 'parametres'">
				<div class="audio">
					<audio controls :src="audio"></audio>
					<button type="button" class="bouton-secondaire" :title="$t('refaire')" :aria-label="$t('refaire')" @click="refaire"><i class="material-icons" aria-hidden="true">replay</i></button>
				</div>
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
import { MediaRecorder, register } from 'extendable-media-recorder'
import { connect } from 'extendable-media-recorder-wav-encoder'
import Panneau from '@/panneau'

export default {
	name: 'PEnregistrement',
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
			enregistrement: false,
			mediaRecorder: null,
			fluxMedia: null,
			flux: [],
			contexte: null,
			sourceAudio: null,
			analyseurAudio: null,
			animationFrameId: null,
			intervalle: null,
			pause: false,
			delta: '',
			dureeEnregistrement: '00:00',
			audio: '',
			blob: '',
			type: 'lecteur',
			vitesse: 1,
			lecture: false,
			chargementAudio: false
		}
	},
	watch: {
		export (valeur) {
			if (valeur === true) {
				this.position = { x: this.x, y: this.y }
				this.$emit('export', { id: this.id, titre: this.titre, mode: this.mode, statut: this.statut, dimensions: this.dimensions, position: this.position, contenu: { blob: this.blob, type: this.type, vitesse: this.vitesse }, echelle: this.echelle, w: this.w, h: this.h, x: this.x, y: this.y })
			}
		}
	},
	created () {
		this.definirCaracteristiques('enregistrementAudio')
		if (this.panneau.contenu !== '' && this.panneau.contenu.hasOwnProperty('blob')) {
			this.blob = this.panneau.contenu.blob
			if (this.blob !== '') {
				this.audio = window.URL.createObjectURL(this.blob)
			}
			if (this.panneau.contenu.hasOwnProperty('type')) {
				this.type = this.panneau.contenu.type
			}
			if (this.panneau.contenu.hasOwnProperty('vitesse')) {
				this.vitesse = this.panneau.contenu.vitesse
			}
		}
		this.genererOptions('enregistrement')
	},
	async mounted () {
		this.initialiser()
		this.positionner()
		this.chargement = false
		if (!navigator.mediaDevices || !navigator.mediaDevices?.enumerateDevices || !navigator.mediaDevices?.getUserMedia) {
			alert(this.$t('navigateurNonSupporte'))
		} else {
			let entreeAudio = false
			const devices = await navigator.mediaDevices.enumerateDevices()
			for (const device of devices) {
				if (device.kind === 'audioinput') {
					entreeAudio = true
					break
				}
			}
			if (entreeAudio === false) {
				alert(this.$t('aucuneEntreeAudio'))
			} else if (entreeAudio === true && this.app.encodeurCharge === false) {
				try {
					await register(await connect())
				} catch {}
				this.app.encodeurCharge = true
			}
		}
		if (this.mode === 'edition' && this.statut !== 'min') {
			setTimeout(() => {
				document.querySelector('#' + this.id + ' .bouton')?.focus()
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
	beforeUnmount () {
		if (this.mediaRecorder) {
			this.mediaRecorder.onstop = null
			this.mediaRecorder.ondataavailable = null
			if (this.mediaRecorder.state !== 'inactive') {
				this.mediaRecorder.stop()
			}
			this.mediaRecorder = null
		}
		if (this.fluxMedia) {
			this.fluxMedia.getTracks().forEach(t => t.stop())
			this.fluxMedia = null
		}
		if (this.animationFrameId !== null) {
			cancelAnimationFrame(this.animationFrameId)
		}
		if (this.intervalle) {
			clearInterval(this.intervalle)
			this.intervalle = null
		}
	},
	methods: {
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
		async enregistrerAudio () {
			try {
				if (this.contexte === null) {
					this.contexte = new AudioContext()
				}
				this.contexte.resume().catch(() => {})
				const flux = await navigator.mediaDevices.getUserMedia({ audio: true })
				this.fluxMedia = flux
				if (window.MediaRecorder) {
					this.mediaRecorder = new window.MediaRecorder(flux)
				} else {
					this.mediaRecorder = new MediaRecorder(flux, { mimeType: 'audio/wav' })
				}
				this.mediaRecorder.start()
				this.enregistrement = true
				this.visualiser(flux)
				const temps = Date.now()
				this.$nextTick(() => {
					document.querySelector('#' + this.id + ' .enregistrement .bouton-enregistrement:nth-child(1)')?.focus()
				})

				this.intervalle = setInterval(() => {
					this.delta = Date.now() - temps
					let secondes = Math.floor((this.delta / 1000) % 60)
					let minutes = Math.floor(this.delta / 1000 / 60)
					if (secondes < 10) {
						secondes = '0' + secondes
					}
					if (minutes < 10) {
						minutes = '0' + minutes
					}
					this.dureeEnregistrement = minutes + ':' + secondes
					if (this.dureeEnregistrement === '05:00') {
						this.arreterEnregistrementAudio()
					}
				}, 100)

				this.mediaRecorder.onstop = () => {
					if (this.flux.length > 0) {
						this.mode = 'parametres'
						this.w = 40
						this.h = 32
						this.enregistrement = false
						this.blob = new Blob(this.flux, { type: this.mediaRecorder.mimeType || 'audio/wav' })
						this.audio = window.URL.createObjectURL(this.blob)
						this.mediaRecorder = null
						if (this.fluxMedia) {
							this.fluxMedia.getTracks().forEach(t => t.stop())
							this.fluxMedia = null
						}
						this.flux = []
						this.delta = ''
						this.dureeEnregistrement = '00:00'
						this.pause = false
						if (this.sourceAudio) {
							this.sourceAudio.disconnect()
							this.sourceAudio = null
						}
						if (this.analyseurAudio) {
							this.analyseurAudio.disconnect()
							this.analyseurAudio = null
						}
						if (this.contexte) {
							this.contexte.close().catch(() => {})
							this.contexte = null
						}
						if (this.intervalle) {
							clearInterval(this.intervalle)
							this.intervalle = null
						}
						if (this.animationFrameId) {
							cancelAnimationFrame(this.animationFrameId)
							this.animationFrameId = null
						}
						this.$nextTick(() => {
							document.querySelector('#' + this.id + ' audio')?.focus()
						})
						this.positionner()
					}
				}

				this.mediaRecorder.ondataavailable = (e) => {
					this.flux.push(e.data)
				}
			} catch {
				if (this.fluxMedia) {
					this.fluxMedia.getTracks().forEach(t => t.stop())
					this.fluxMedia = null
				}
				if (this.contexte) {
					this.contexte.close().catch(() => {})
					this.contexte = null
				}
				alert(this.$t('erreurMicro'))
			}
		},
		mettreEnPauseEnregistrementAudio () {
			if (this.intervalle) {
				clearInterval(this.intervalle)
				this.intervalle = null
			}
			this.mediaRecorder.pause()
			this.pause = true
			this.$nextTick(() => {
				document.querySelector('#' + this.id + ' .enregistrement .bouton-enregistrement:nth-child(2)')?.focus()
			})
		},
		reprendreEnregistrementAudio () {
			let temps = Date.now()
			temps = temps - this.delta
			this.intervalle = setInterval(() => {
				this.delta = Date.now() - temps
				let secondes = Math.floor((this.delta / 1000) % 60)
				let minutes = Math.floor(this.delta / 1000 / 60)
				if (secondes < 10) {
					secondes = '0' + secondes
				}
				if (minutes < 10) {
					minutes = '0' + minutes
				}
				this.dureeEnregistrement = minutes + ':' + secondes
				if (this.dureeEnregistrement === '05:00') {
					this.arreterEnregistrementAudio()
				}
			}, 100)
			this.mediaRecorder.resume()
			this.pause = false
			this.$nextTick(() => {
				document.querySelector('#' + this.id + ' .enregistrement .bouton-enregistrement:nth-child(2)')?.focus()
			})
		},
		arreterEnregistrementAudio () {
			this.mediaRecorder.stop()
		},
		refaire () {
			this.mode = 'edition'
			this.w = 40
			this.h = 26
			window.URL.revokeObjectURL(this.audio)
			this.audio = ''
			this.blob = ''
			this.enregistrerAudio()
			this.positionner()
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
		},
		visualiser (flux) {
			if (this.contexte === null) {
				this.contexte = new AudioContext()
			}
			const contexte = this.contexte
			if (contexte.state !== 'running') {
				contexte.resume().catch(() => {})
			}
			contexte.onstatechange = () => {
				if (this.contexte === contexte && contexte.state !== 'running' && contexte.state !== 'closed') {
					contexte.resume().catch(() => {})
				}
			}
			const source = contexte.createMediaStreamSource(flux)
			const analyser = contexte.createAnalyser()
			const silence = contexte.createGain()
			silence.gain.value = 0
			this.sourceAudio = source
			this.analyseurAudio = analyser
			analyser.fftSize = 2048
			const bufferLength = analyser.frequencyBinCount
			const dataArray = new Uint8Array(bufferLength)
			source.connect(analyser)
			analyser.connect(silence)
			silence.connect(contexte.destination)
			const dessiner = () => {
				if (document.querySelector('#visualisation_' + this.id)) {
					const canvas = document.querySelector('#visualisation_' + this.id)
					const canvasCtx = canvas.getContext('2d')
					const largeur = document.querySelector('#enregistrement_' + this.id)?.offsetWidth ?? 0
					const hauteur = canvas.height
					canvas.width = largeur
					this.animationFrameId = requestAnimationFrame(dessiner)
					analyser.getByteTimeDomainData(dataArray)
					canvasCtx.fillStyle = '#eeeeee'
					canvasCtx.fillRect(0, 0, largeur, hauteur)
					canvasCtx.lineWidth = 2
					canvasCtx.strokeStyle = '#000000'
					canvasCtx.beginPath()
					const sliceWidth = largeur * 1.0 / bufferLength
					let x = 0
					for (let i = 0; i < bufferLength; i++) {
						const v = dataArray[i] / 128.0
						const y = v * hauteur / 2
						if (i === 0) {
							canvasCtx.moveTo(x, y)
						} else {
							canvasCtx.lineTo(x, y)
						}
						x += sliceWidth
					}
					canvasCtx.lineTo(canvas.width, canvas.height / 2)
					canvasCtx.stroke()
				} else {
					this.animationFrameId = null
				}
			}
			this.$nextTick(() => {
				dessiner()
			})
		}
	}
}
</script>

<style>
.panneau .panneau-enregistrement .audio:not(.bouton) {
	display: flex;
	align-items: center;
	font-size: 0;
	margin-bottom: 2rem;
}

.panneau .panneau-enregistrement .audio .bouton-secondaire {
    width: auto!important;
    margin-left: 0.5rem;
	line-height: 1;
}

.panneau .panneau-enregistrement audio {
	width: 100%;
}

.panneau .panneau-enregistrement audio.masque {
	display: none;
}

.panneau .panneau-enregistrement audio + label {
	margin-top: 2rem;
}

.panneau .panneau-enregistrement .choix label {
	display: inline-block;
	width: auto;
	font-size: 1.6rem;
	font-weight: 400;
    margin-left: 1rem;
	margin-bottom: 0;
}

.panneau .panneau-enregistrement .lecteur-audio {
	margin-right: 2.5rem;
}

.panneau .panneau-enregistrement .contenu.lecture-audio {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.panneau .panneau-enregistrement .contenu.lecture-audio .bouton-secondaire {
	width: 3.6rem;
	line-height: 1;
}

.panneau .panneau-enregistrement .bouton.audio {
	height: 6.4rem;
	line-height: 6.4rem;
	padding: 0 3.5rem;
	margin-top: 0;
}

.panneau .panneau-enregistrement .bouton.audio i {
	font-size: 4.8rem;
}

.panneau .panneau-enregistrement .enregistrer {
	margin-top: 0;
}

.panneau .panneau-enregistrement .enregistrer i {
	font-size: 24px;
	margin-right: 1rem;
	color: #ff1f1f;
}

.panneau .panneau-enregistrement .enregistrement {
	display: flex;
	justify-content: center;
	align-items: center;
}

.panneau .panneau-enregistrement .enregistrement .duree {
	font-family: 'RobotoMono';
	font-size: 3rem;
	font-weight: 400;
	margin-left: 2.5rem;
}

.panneau .panneau-enregistrement .enregistrement .bouton-enregistrement:first-child {
	margin-right: 2.5rem;
}

.panneau .panneau-enregistrement .enregistrement .bouton-enregistrement {
	background-color: #fff;
	border-color: #001d1d;
	border-width: 1px;
	border-radius: 0;
	line-height: 1;
	height: auto;
	padding: 1rem;
	margin-top: 0;
	cursor: pointer;
}

.panneau .panneau-enregistrement .enregistrement .bouton-enregistrement i {
	font-size: 4.8rem;
	line-height: 1;
	margin: 0;
}

.panneau .panneau-enregistrement .enregistrement .bouton-enregistrement.stopper {
	color: #001d1d;
    animation: couleur ease-in 2s infinite;
}

.panneau .panneau-enregistrement .enregistrement .bouton-enregistrement:hover {
  color: #001d1d;
  background-color: #eee;
}

.visualisation {
	margin-bottom: 2rem;
}

@keyframes couleur {
    0% {
		background: #fff;
	}
    50% {
		background: #ff1f1f;
	}
    100% {
		background: #fff;
	}
}
</style>
