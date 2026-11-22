<template>
	<JsPanel class="panneau" :visible="!chargement" :options="options">
		<div class="conteneur-gauche" />
		<div class="conteneur panneau-histoire">
			<div class="contenu" v-if="mode === 'edition'">
				<label :for="'nombre_images_' + id">{{ $t('nombreImages') }} (3 - 10)</label>
				<input :id="'nombre_images_' + id" type="number" :value="images" :min="3" :max="10" @input="images = parseInt($event.target.value)" @keydown.enter="generer">
				<button type="button" class="bouton" @click="generer">{{ $t('valider') }}</button>
			</div>
			<div class="contenu" v-else>
				<div class="histoire">
					<img :src="$recupererRessource('./static/img/pictogrammes/' + image)" v-for="(image, index) in selection" :key="'image_' + index" :alt="image.substring(0, image.lastIndexOf('.'))">
				</div>
				<div class="source" :class="{'avec-focus': statut === 'focus'}"><a href="https://arasaac.org" target="_blank" rel="noreferrer">{{ $t('sourceImages') }}&nbsp;: ARASAAC. Licence&nbsp;: CC (BY-NC-SA)<span class="lecteur-ecran"> ({{ $t('nouvelOnglet') }})</span></a></div>
				<button type="button" class="bouton" @click="selectionner">{{ $t('generer') }}</button>
			</div>
		</div>
		<div class="conteneur-droite" />
		<div class="conteneur-bas" />
	</JsPanel>
</template>

<script>
import JsPanel from '@/components/jspanel.vue'
import Panneau from '@/panneau'
import pictogrammes from '@/pictogrammes'

export default {
	name: 'PHistoire',
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
			minw: 40,
			minh: 22,
			statut: '',
			dimensions: {},
			position: {},
			donnees: { x: 0, y: 0 },
			pictogrammes: pictogrammes,
			images: 5,
			selection: []
		}
	},
	watch: {
		export (valeur) {
			if (valeur === true) {
				this.position = { x: this.x, y: this.y }
				this.$emit('export', { id: this.id, titre: this.titre, mode: this.mode, statut: this.statut, dimensions: this.dimensions, position: this.position, contenu: this.selection, echelle: this.echelle, w: this.w, h: this.h, x: this.x, y: this.y })
			}
		}
	},
	created () {
		this.definirCaracteristiques('histoire')
		if (this.panneau.contenu !== '') {
			this.selection = this.panneau.contenu
			if (this.selection.length > 0) {
				this.images = this.selection.length
			}
		}
		this.genererOptions('histoire')
	},
	mounted () {
		this.initialiser()
		this.positionner()
		this.chargement = false
		if (this.mode === 'edition' && this.statut !== 'min' && this.images === 5) {
			setTimeout(() => {
				document.querySelector('#' + this.id + ' input')?.focus()
			}, 0)
		} else if (this.mode === 'lecture') {
			this.generer()
		}
	},
	methods: {
		generer () {
			this.mode = 'lecture'
			if (this.images > 2 && this.images < 11) {
				switch (this.images) {
				case 3:
					this.w = 52
					this.h = 32
					break
				case 4:
					this.w = 69
					this.h = 32
					break
				case 5:
					this.w = 86
					this.h = 32
					break
				case 6:
					this.w = 103
					this.h = 32
					break
				case 7:
				case 8:
					this.w = 69
					this.h = 48
					break
				case 9:
				case 10:
					this.w = 86
					this.h = 48
					break
				}
				if (this.selection.length === 0) {
					this.selectionner()
				}
				if (this.donnees.x > 0 && this.donnees.y > 0) {
					this.x = this.donnees.x
					this.y = this.donnees.y
				}
				setTimeout(() => {
					document.querySelector('#' + this.id + ' .bouton')?.focus()
				}, 0)
				this.positionner()
			}
		},
		editer () {
			this.mode = 'edition'
			this.selection = []
			this.donnees.x = this.x
			this.donnees.y = this.y
			this.w = 40
			this.h = 22
			this.$nextTick(() => {
				document.querySelector('#' + this.id + ' input')?.focus()
			})
			this.positionner()
		},
		selectionner () {
			const selection = []
			for (let i = 0; i < this.images;) {
				const picto = Math.floor(Math.random() * this.pictogrammes.length)
				if (selection.includes(this.pictogrammes[picto]) === true) {
					continue
				}
				selection.push(this.pictogrammes[picto])
				i++
			}
			this.selection = selection
		}
	}
}
</script>

<style>
.panneau .panneau-histoire .histoire {
	display: flex;
	justify-content: center;
	flex-wrap: wrap;
}

.panneau .panneau-histoire .histoire img {
	max-width: 15rem;
	height: auto;
	padding: 1rem;
	margin: 0.5rem;
	border: 1px solid #ddd;
	border-radius: 0.5rem;
	background: #fff;
}

.panneau .panneau-histoire .histoire img:last-child {
	margin-right: 0;
}

.panneau .panneau-histoire .source {
	font-size: 1rem;
	margin-top: 1.5rem;
}

.panneau .panneau-histoire .source.avec-focus {
	color: #fff;
}
</style>
