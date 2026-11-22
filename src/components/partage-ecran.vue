<template>
	<JsPanel class="panneau" :visible="!chargement" :options="options">
		<div class="conteneur-gauche" />
		<div class="conteneur panneau-partage-ecran" v-if="mode === 'edition'">
			<div class="contenu" >
				<button type="button" class="bouton" @click="generer">{{ $t('demarrerPartage') }}</button>
			</div>
		</div>
		<div class="conteneur panneau-partage-ecran lecture" v-else>
			<video :id="'video_' + id" autoplay />
		</div>
		<div class="conteneur-droite" />
		<div class="conteneur-bas" />
	</JsPanel>
</template>

<script>
import JsPanel from '@/components/jspanel.vue'
import Panneau from '@/panneau'

export default {
	name: 'PPartage',
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
			minh: 11,
			statut: '',
			dimensions: {},
			position: {},
			donnees: { w: 0, h: 0, x: 0, y: 0 },
			contraintes: { audio: true, video: true }
		}
	},
	watch: {
		export (valeur) {
			if (valeur === true) {
				this.position = { x: this.x, y: this.y }
				let contraintes = this.contraintes
				if (document.querySelector('#video_' + this.id)) {
					const video = document.querySelector('#video_' + this.id).srcObject.getVideoTracks()[0]
					contraintes = video.getConstraints()
				}
				this.$emit('export', { id: this.id, titre: this.titre, mode: this.mode, statut: this.statut, dimensions: this.dimensions, position: this.position, contenu: { contraintes: contraintes }, w: this.w, h: this.h, x: this.x, y: this.y })
			}
		}
	},
	created () {
		this.definirCaracteristiques('partageEcran')
		if (this.panneau.contenu !== '') {
			this.contraintes = this.panneau.contenu.contraintes
		}
		if (this.mode === 'lecture') {
			this.redimensionnement = true
		}
		this.genererOptions('partage-ecran')
	},
	async mounted () {
		this.initialiser()
		this.positionner()
		this.chargement = false
		if (!navigator.mediaDevices || !navigator.mediaDevices?.getDisplayMedia) {
			alert(this.$t('navigateurNonSupporte'))
		}
		if (this.mode === 'lecture') {
			const flux = await navigator.mediaDevices.getDisplayMedia(this.contraintes)
			this.$nextTick(() => {
				document.querySelector('#video_' + this.id).srcObject = flux
			})
		} else if (this.mode === 'edition' && this.statut !== 'min') {
			setTimeout(() => {
				document.querySelector('#' + this.id + ' .bouton')?.focus()
			}, 0)
		}
	},
	methods: {
		async generer () {
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
			const flux = await navigator.mediaDevices.getDisplayMedia(this.contraintes)
			this.$nextTick(() => {
				document.querySelector('#video_' + this.id).srcObject = flux
			})
		},
		editer () {
			this.mode = 'edition'
			this.redimensionnement = false
			this.donnees.w = this.w
			this.donnees.h = this.h
			this.donnees.x = this.x
			this.donnees.y = this.y
			this.w = 40
			this.h = 11
			if (this.statut !== 'min') {
				this.$nextTick(() => {
					document.querySelector('#' + this.id + ' .bouton')?.focus()
				})
			}
			this.positionner()
		}
	}
}
</script>

<style>
.panneau .panneau-partage-ecran.lecture {
	height: calc(100% - 3rem);
}

.panneau .panneau-partage-ecran .contenu {
	width: 100%;
	height: 100%;
	font-size: 0;
}

.panneau .panneau-partage-ecran .contenu > .bouton {
	margin-top: 0.5rem;
}

.panneau .panneau-partage-ecran video {
	width: 100%;
	height: 100%;
	outline: 0;
}
</style>
