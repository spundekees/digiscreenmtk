<template>
	<JsPanel class="panneau" :visible="!chargement" :options="options">
		<div class="conteneur-gauche" />
		<div class="conteneur panneau-codeqr">
			<div class="contenu">
				<label :for="'lien_' + id" v-if="mode === 'edition'">{{ $t('lienOuTexte') }}</label>
				<input :id="'lien_' + id" type="text" :maxlength="255" :value="texte" @input="texte = $event.target.value" v-if="mode === 'edition'">
				<a class="domaine" :href="texte" target="_blank" rel="noopener noreferrer" v-else-if="mode === 'lecture' && lien !== ''">{{ lien }}<span class="lecteur-ecran"> ({{ $t('nouvelOnglet') }})</span></a>
				<div :id="'qr_' + id" class="codeqr" :class="{'edition': mode === 'edition'}" />
				<button type="button" class="bouton" @click="generer" v-if="mode === 'edition'">{{ $t('valider') }}</button>
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
	name: 'PCodeQR',
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
			minw: 30,
			minh: 32,
			statut: '',
			dimensions: {},
			position: {},
			donnees: { x: 0, y: 0 },
			codeqr: null,
			texte: 'https://ladigitale.dev',
			lien: ''
		}
	},
	watch: {
		export (valeur) {
			if (valeur === true) {
				this.position = { x: this.x, y: this.y }
				this.$emit('export', { id: this.id, titre: this.titre, mode: this.mode, statut: this.statut, dimensions: this.dimensions, position: this.position, contenu: this.texte, echelle: this.echelle, w: this.w, h: this.h, x: this.x, y: this.y })
			}
		},
		deplacement (valeur) {
			if (valeur === false && this.mode === 'lecture') {
				const element = document.querySelector('#' + this.id + ' .codeqr')
				if (element) {
					this.codeqr.width = element.offsetWidth
					this.codeqr.height = element.offsetWidth
				}
			}
		}
	},
	created () {
		this.definirCaracteristiques('codeqr')
		if (this.panneau.contenu !== '') {
			this.texte = this.panneau.contenu
			if (this.verifierURL(this.texte) === true) {
				this.lien = this.texte.replace('http://', '').replace('https://', '')
			}
		}
		this.genererOptions('codeqr')
	},
	mounted () {
		this.initialiser()
		this.positionner()
		this.chargement = false
		if (this.mode === 'edition' && this.statut !== 'min') {
			setTimeout(() => {
				document.querySelector('#' + this.id + ' input')?.focus()
				document.querySelector('#' + this.id + ' input')?.select()
			}, 0)
		}
		this.$nextTick(() => {
			const texte = this.texte
			this.codeqr = new QRCode('qr_' + this.id, {
				text: texte,
				width: this.convertirRem(100),
				height: this.convertirRem(100),
				colorDark: '#000000',
				colorLight: '#ffffff',
				correctLevel: QRCode.CorrectLevel.H
			})
		})
	},
	methods: {
		generer () {
			if (this.texte !== '') {
				this.mode = 'lecture'
				this.codeqr.makeCode(this.texte)
				if (this.verifierURL(this.texte) === true) {
					this.lien = this.texte.replace('http://', '').replace('https://', '')
					if (this.donnees.w > 0 && this.donnees.h > 0) {
						this.w = this.donnees.w
						this.h = this.donnees.h
					} else {
						this.w = 30
						this.h = 38
					}
				} else if (this.verifierURL(this.texte) === false && this.donnees.w > 0 && this.donnees.h > 0) {
					this.w = this.donnees.w
					this.h = this.donnees.h
				} else if (this.verifierURL(this.texte) === false) {
					this.w = 30
					this.h = 32
				}
				if (this.donnees.x > 0 && this.donnees.y > 0) {
					this.x = this.donnees.x
					this.y = this.donnees.y
				}
				this.$nextTick(() => {
					document.querySelector('#' + this.id)?.focus()
				})
				this.positionner()
			}
		},
		editer () {
			this.mode = 'edition'
			this.lien = ''
			this.donnees.w = this.w
			this.donnees.h = this.h
			this.donnees.x = this.x
			this.donnees.y = this.y
			this.w = 36
			this.h = 46
			this.$nextTick(() => {
				document.querySelector('#' + this.id + ' input')?.focus()
				document.querySelector('#' + this.id + ' input')?.select()
			})
			this.positionner()
		}
	}
}
</script>

<style>
.panneau .conteneur .codeqr {
	margin: 0 auto;
	user-select: none;
}

.panneau .conteneur input + .codeqr,
.panneau .conteneur .domaine + .codeqr {
	margin: 2rem auto 0;
}

.panneau .conteneur .codeqr img {
	display: inline-block!important;
	max-width: 100%;
}

.panneau .conteneur .codeqr canvas {
	display: none!important;
}

.panneau .conteneur .codeqr.edition img {
	max-height: 25rem!important;
}

.panneau .conteneur a.domaine {
	display: block;
	font-size: 1.6rem;
	line-height: 1.5;
	padding: 0.7rem 1.5rem;
	color: inherit;
	text-align: center;
	text-decoration: underline;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	background: #fff;
	border: 1px solid #ddd;
}

.panneau .conteneur a.domaine:focus {
	outline-offset: -2px;
}
</style>
