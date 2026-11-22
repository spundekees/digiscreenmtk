<template>
	<JsPanel class="panneau" :visible="!chargement" :options="options">
		<div class="conteneur-gauche" />
		<div class="conteneur panneau-webcam" v-if="mode === 'edition'">
			<div class="contenu">
				<label :for="'webcam_' + id">{{ $t('webcam') }}</label>
				<div class="webcam">
					<select :id="'webcam_' + id" @change="webcam = $event.target.value">
						<option :selected="webcam === ''" value="">--</option>
						<option v-for="(item, index) in webcams" :selected="webcam === definirWebcam(item)" :value="definirWebcam(item)" :key="'webcam_' + index">{{ definirWebcam(item) }}</option>
					</select>
				</div>
				<div class="actions">
					<button type="button" class="bouton" @click="generer">{{ $t('valider') }}</button>
				</div>
			</div>
		</div>
		<div class="conteneur panneau-webcam lecture" v-else>
			<video :id="'video_' + id" controls autoplay />
		</div>
		<div class="conteneur-droite" />
		<div class="conteneur-bas" />
	</JsPanel>
</template>

<script>
import JsPanel from '@/components/jspanel.vue'
import Panneau from '@/panneau'

export default {
	name: 'PWebcam',
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
			titre: '',
			id: '',
			w: 0,
			h: 0,
			ws: 0,
			hs: 0,
			x: 0,
			y: 0,
			minw: 40,
			minh: 22,
			statut: '',
			dimensions: {},
			position: {},
			donnees: { w: 0, h: 0, x: 0, y: 0 },
			webcams: [],
			webcam: '',
			flux: null,
			panneauDemonte: false
		}
	},
	watch: {
		export (valeur) {
			if (valeur === true) {
				this.position = { x: this.x, y: this.y }
				this.$emit('export', { id: this.id, titre: this.titre, mode: this.mode, statut: this.statut, dimensions: this.dimensions, position: this.position, contenu: { webcam: this.webcam }, w: this.w, h: this.h, x: this.x, y: this.y })
			}
		}
	},
	created () {
		this.definirCaracteristiques('webcam')
		if (this.panneau.contenu !== '') {
			this.webcam = this.panneau.contenu.webcam
		}
		if (this.mode === 'lecture') {
			this.redimensionnement = true
		}
		this.genererOptions('webcam')
	},
	async mounted () {
		this.initialiser()
		this.positionner()
		this.chargement = false
		if (!navigator.mediaDevices || !navigator.mediaDevices?.enumerateDevices || !navigator.mediaDevices?.getUserMedia) {
			alert(this.$t('navigateurNonSupporte'))
		} else {
			let devices = await navigator.mediaDevices.enumerateDevices()
			if (devices.some((device) => device.kind === 'videoinput' && device.label === '')) {
				const autorisation = await navigator.mediaDevices.getUserMedia({ audio: false, video: true }).catch(() => null)
				if (autorisation) {
					autorisation.getTracks().forEach((piste) => piste.stop())
					devices = await navigator.mediaDevices.enumerateDevices()
				}
			}
			for (const device of devices) {
				if (device.kind === 'videoinput') {
					this.webcams.push(device)
				}
			}
		}
		if (this.webcam !== '') {
			let webcamExiste = false
			this.webcams.forEach((webcam) => {
				if (webcam.label === this.webcam || webcam.deviceId === this.webcam) {
					webcamExiste = true
				}
			})
			if (webcamExiste === false) {
				this.webcam = ''
				this.editer()
			} else {
				const flux = await this.ouvrirFlux()
				this.$nextTick(() => {
					const video = document.querySelector('#video_' + this.id)
					if (video) video.srcObject = flux
				})
			}
		}
		if (this.mode === 'edition' && this.statut !== 'min') {
			setTimeout(() => {
				document.querySelector('#' + this.id + ' select')?.focus()
			}, 0)
		}
	},
	beforeUnmount () {
		this.panneauDemonte = true
		this.arreterFlux()
	},
	methods: {
		async generer () {
			if (this.webcam === '') {
				alert(this.$t('aucuneEntreeVideo'))
				return
			}
			this.mode = 'lecture'
			this.redimensionnement = true
			if (this.donnees.w > 0 && this.donnees.h > 0) {
				this.w = this.donnees.w
				this.h = this.donnees.h
			} else {
				this.w = 48
				this.h = 41
			}
			if (this.donnees.x > 0 && this.donnees.y > 0) {
				this.x = this.donnees.x
				this.y = this.donnees.y
			}
			this.positionner()
			const flux = await this.ouvrirFlux()
			this.$nextTick(() => {
				const video = document.querySelector('#video_' + this.id)
				if (video) {
					video.srcObject = flux
					video.focus()
				}
			})
		},
		async ouvrirFlux () {
			const webcam = this.webcams.find((item) => item.label === this.webcam || item.deviceId === this.webcam)
			const video = webcam?.deviceId ? { deviceId: { exact: webcam.deviceId } } : true
			const flux = await navigator.mediaDevices.getUserMedia({ audio: false, video })
			if (this.panneauDemonte || this.mode !== 'lecture') {
				flux.getTracks().forEach((piste) => piste.stop())
				return null
			}
			this.flux = flux
			return flux
		},
		arreterFlux () {
			this.flux?.getTracks().forEach((piste) => piste.stop())
			this.flux = null
		},
		editer () {
			this.arreterFlux()
			this.mode = 'edition'
			this.redimensionnement = false
			this.donnees.w = this.w
			this.donnees.h = this.h
			this.donnees.x = this.x
			this.donnees.y = this.y
			this.w = 40
			this.h = 22
			if (this.statut !== 'min') {
				this.$nextTick(() => {
					document.querySelector('#' + this.id + ' select')?.focus()
				})
			}
			this.positionner()
		},
		definirWebcam (webcam) {
			if (webcam.label !== '') {
				return webcam.label
			} else if (webcam.deviceId !== '') {
				return webcam.deviceId
			} else {
				return 'Webcam'
			}
		}
	}
}
</script>

<style>
.panneau .panneau-webcam.lecture {
	height: calc(100% - 3rem);
}

.panneau .panneau-webcam .contenu {
	width: 100%;
	height: 100%;
	font-size: 0;
}

.panneau .panneau-webcam video {
	width: 100%;
	height: 100%;
	outline: 0;
}
</style>
