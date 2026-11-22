<template>
	<JsPanel class="panneau" :visible="!chargement" :options="options">
		<div class="conteneur-gauche" />
		<div class="conteneur panneau-images-sequentielles">
			<div class="contenu" v-if="mode === 'edition'">
				<label :id="'groupe_fleches_' + id" class="libelle-option">{{ $t('afficherFlechesDeplacement') }}</label>
				<div class="choix" role="radiogroup" :aria-labelledby="'groupe_fleches_' + id">
					<span class="oui">
						<input :id="'fleches_oui_' + id" type="radio" :name="'fleches_' + id" value="oui" :checked="fleches === 'oui'" @change="fleches = $event.target.value">
						<label :for="'fleches_oui_' + id">{{ $t('oui') }}</label>
					</span>
					<span class="non">
						<input :id="'fleches_non_' + id" type="radio" :name="'fleches_' + id" value="non" :checked="fleches === 'non'" @change="fleches = $event.target.value">
						<label :for="'fleches_non_' + id">{{ $t('non') }}</label>
					</span>
				</div>
				<label :id="'libelle-images-sequentielles-1_' + id">{{ $t('imagesOrdre') }}</label>
				<div role="group" :aria-labelledby="'libelle-images-sequentielles-1_' + id" class="zone" @dragover.prevent @drop.prevent>
					<input :id="'selectionner_images_' + id" type="file" multiple accept="image/*" @change="selectionnerImages" style="display: none;">
					<span role="button" tabindex="0" @drop="glisserImages" @keydown.enter.space.prevent="activerInput('selectionner_images_' + id)" @click="activerInput('selectionner_images_' + id)" :id="'bouton_selectionner_images_' + id">{{ $t('selectionnerImages') }}</span>
				</div>
				<draggable class="images" role="list" v-model="images" filter=".deplacer, .fermer" :prevent-on-filter="false">
					<div class="image" role="listitem" v-for="(image, index) in images" :key="'image_' + index">
						<img :src="image" :alt="$t('image') + ' ' + (index + 1)">
						<button type="button" class="fermer" :title="$t('supprimer')" :aria-label="$t('libelleCible', { action: $t('supprimer'), cible: $t('image') + ' ' + (index + 1) })" @click="supprimerImage(index)"><i class="material-icons" aria-hidden="true">highlight_off</i></button>
						<span class="deplacements">
							<button type="button" class="deplacer avant" :disabled="index === 0" :title="$t('deplacerAvant')" :aria-label="$t('libelleCible', { action: $t('deplacerAvant'), cible: $t('image') + ' ' + (index + 1) })" @click="deplacerElement('images', index, -1, '.contenu:not(.lecture) .images .image')"><i class="material-icons" aria-hidden="true">arrow_back</i></button>
							<button type="button" class="deplacer apres" :disabled="index === images.length - 1" :title="$t('deplacerApres')" :aria-label="$t('libelleCible', { action: $t('deplacerApres'), cible: $t('image') + ' ' + (index + 1) })" @click="deplacerElement('images', index, 1, '.contenu:not(.lecture) .images .image')"><i class="material-icons" aria-hidden="true">arrow_forward</i></button>
						</span>
					</div>
				</draggable>
				<button type="button" class="bouton" @click="generer">{{ $t('valider') }}</button>
			</div>
			<div class="contenu lecture" v-else>
				<draggable class="images" role="list" v-model="imagesMelangees" filter=".image.correct, .deplacer" :prevent-on-filter="false" :class="{'plein-ecran': statut === 'max'}">
					<div class="image" role="listitem" :class="{'correct': resultat === 'correct'}" v-for="(image, index) in imagesMelangees" :key="'image_' + index">
						<img :src="image" :alt="$t('image') + ' ' + (index + 1)">
						<span class="deplacements" v-if="fleches === 'oui'">
							<button type="button" class="deplacer avant" :disabled="resultat === 'correct' || index === 0" :title="$t('deplacerAvant')" :aria-label="$t('libelleCible', { action: $t('deplacerAvant'), cible: $t('image') + ' ' + (index + 1) })" @click="deplacerElement('imagesMelangees', index, -1, '.contenu.lecture .images .image')"><i class="material-icons" aria-hidden="true">arrow_back</i></button>
							<button type="button" class="deplacer apres" :disabled="resultat === 'correct' || index === imagesMelangees.length - 1" :title="$t('deplacerApres')" :aria-label="$t('libelleCible', { action: $t('deplacerApres'), cible: $t('image') + ' ' + (index + 1) })" @click="deplacerElement('imagesMelangees', index, 1, '.contenu.lecture .images .image')"><i class="material-icons" aria-hidden="true">arrow_forward</i></button>
						</span>
					</div>
				</draggable>
				<div v-if="resultat === 'correct'">
					<span class="emoticones">🎉🥳</span>
					<span class="bouton correct">{{ $t('bravoExercice') }}</span>
					<span class="emoticones">🥳🎉</span>
				</div>
				<div v-else-if="resultat === 'incorrect'">
					<span class="emoticones">🙁🙁</span>
					<button type="button" class="bouton verifier" @click="verifier">{{ $t('verifier') }}</button>
					<span class="emoticones">🙁🙁</span>
				</div>
				<button type="button" class="bouton verifier" v-else @click="verifier">{{ $t('verifier') }}</button>
			</div>
		</div>
		<div class="conteneur-droite" />
		<div class="conteneur-bas" />
	</JsPanel>
</template>

<script>
import JsPanel from '@/components/jspanel.vue'
import { VueDraggableNext } from 'vue-draggable-next'
import Panneau from '@/panneau'

export default {
	name: 'PImagesSequentielles',
	components: {
		JsPanel,
		draggable: VueDraggableNext
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
			x: 0,
			y: 0,
			minw: 30,
			minh: 20,
			statut: '',
			dimensions: {},
			position: {},
			donnees: { w: 0, h: 0, x: 0, y: 0 },
			images: [],
			imagesMelangees: [],
			fleches: 'non',
			resultat: ''
		}
	},
	watch: {
		export (valeur) {
			if (valeur === true) {
				this.position = { x: this.x, y: this.y }
				this.$emit('export', { id: this.id, titre: this.titre, mode: this.mode, statut: this.statut, dimensions: this.dimensions, position: this.position, contenu: { images: this.images, fleches: this.fleches }, w: this.w, h: this.h, x: this.x, y: this.y })
			}
		}
	},
	created () {
		this.definirCaracteristiques('imagesSequentielles')
		if (this.panneau.contenu !== '') {
			this.images = this.panneau.contenu.images
			this.fleches = this.panneau.contenu.fleches || 'non'
			this.imagesMelangees = this.melanger(JSON.parse(JSON.stringify(this.images)))
		}
		if (this.mode === 'lecture' && this.images.length > 0) {
			this.redimensionnement = true
		}
		this.genererOptions('images-sequentielles')
	},
	mounted () {
		this.initialiser()
		this.positionner()
		this.chargement = false
		if (this.mode === 'edition' && this.statut !== 'min') {
			setTimeout(() => {
				document.querySelector('#bouton_selectionner_images_' + this.id)?.focus()
			}, 0)
		}
	},
	methods: {
		generer () {
			if (this.images.length > 1) {
				this.mode = 'lecture'
				this.redimensionnement = true
				this.imagesMelangees = this.melanger(JSON.parse(JSON.stringify(this.images)))
				if (this.donnees.w > 0 && this.donnees.h > 0) {
					this.w = this.donnees.w
					this.h = this.donnees.h
				} else {
					this.w = 74
					this.h = 54
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
			this.redimensionnement = false
			this.donnees.w = this.w
			this.donnees.h = this.h
			this.donnees.x = this.x
			this.donnees.y = this.y
			this.w = 60
			this.h = 44
			this.index = 0
			this.resultat = ''
			this.$nextTick(() => {
				document.querySelector('#bouton_selectionner_images_' + this.id)?.focus()
			})
			this.positionner()
		},
		selectionnerImages (event) {
			for (let i = 0; i < event.target.files.length; i++) {
				const reader = new FileReader()
				reader.readAsDataURL(event.target.files[i])
				reader.onloadend = (e) => {
					const img = new Image()
					img.src = e.target.result
					img.onload = () => {
						if (img.width > 1000) {
							const canvas = document.createElement('canvas')
							const ratio = img.width / img.height
							const largeur = 1000
							const hauteur = 1000 / ratio
							canvas.width = largeur
							canvas.height = hauteur
							canvas.getContext('2d').drawImage(img, 0, 0, largeur, hauteur)
							this.images.push(canvas.toDataURL('image/jpeg', 0.85))
						} else {
							this.images.push(e.target.result)
						}
					}
				}
			}
		},
		glisserImages (event) {
			for (let i = 0; i < event.dataTransfer.files.length; i++) {
				const reader = new FileReader()
				reader.readAsDataURL(event.dataTransfer.files[i])
				reader.onloadend = (e) => {
					const img = new Image()
					img.src = e.target.result
					img.onload = () => {
						if (img.width > 1000) {
							const canvas = document.createElement('canvas')
							const ratio = img.width / img.height
							const largeur = 1000
							const hauteur = 1000 / ratio
							canvas.width = largeur
							canvas.height = hauteur
							canvas.getContext('2d').drawImage(img, 0, 0, largeur, hauteur)
							this.images.push(canvas.toDataURL('image/jpeg', 0.85))
						} else {
							this.images.push(e.target.result)
						}
					}
				}
			}
		},
		supprimerImage (index) {
			this.images.splice(index, 1)
		},
		verifier () {
			if (this.images.toString() === this.imagesMelangees.toString()) {
				this.resultat = 'correct'
				this.lancerConfettis()
			} else {
				this.resultat = 'incorrect'
			}
		}
	}
}
</script>

<style>
.panneau .panneau-images-sequentielles .contenu.lecture {
	width: 100%;
	height: 100%;
}

.panneau .panneau-images-sequentielles .choix {
	margin-bottom: 2rem;
}

.panneau .panneau-images-sequentielles .choix span.oui {
	margin-right: 2.5rem;
}

.panneau .panneau-images-sequentielles .choix label {
	display: inline-block;
	width: auto;
	font-size: 1.6rem;
	font-weight: 400;
	margin-left: 1rem;
	margin-bottom: 0;
}

.panneau .panneau-images-sequentielles .zone {
	height: 7rem;
	border: 2px dashed #00ced1;
	cursor: pointer;
}

.panneau .panneau-images-sequentielles .zone span:where([role="button"]) {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 100%;
	font-weight: 700;
	font-size: 1.4rem;
	text-transform: uppercase;
	margin-bottom: 0;
}

.panneau .panneau-images-sequentielles .images {
	display: flex;
	justify-content: flex-start;
	align-items: center;
	flex-wrap: wrap;
	padding: 1rem;
}

.panneau .panneau-images-sequentielles .images .image {
	position: relative;
	margin: 1rem;
	padding: 0.5rem;
	border: 1px solid #ddd;
	cursor: move;
}

.panneau .panneau-images-sequentielles .images .image img {
	width: 8.8rem;
	height: auto;
}

.panneau .panneau-images-sequentielles .images .image .fermer {
	position: absolute;
	top: -1.1rem;
	right: -1.1rem;
	font-size: 2.2rem;
	color: #777;
	background: #fff;
	border-radius: 50%;
	line-height: 1;
	cursor: pointer;
}

.panneau .panneau-images-sequentielles .images .image .deplacements {
	display: flex;
	justify-content: center;
	gap: 0.5rem;
	margin-top: 0.5rem;
}

.panneau .panneau-images-sequentielles .images .image .deplacer {
	display: inline-flex;
	justify-content: center;
	align-items: center;
	width: 3.2rem;
	height: 3.2rem;
	color: #001d1d;
	background: #fff;
	border: 1px solid #ddd;
	border-radius: 50%;
	cursor: pointer;
}

.panneau .panneau-images-sequentielles .images .image .deplacer:disabled {
	opacity: 0.4;
	cursor: default;
}

.panneau .panneau-images-sequentielles .images .image .deplacer i {
	font-size: 2rem;
}

.panneau .panneau-images-sequentielles .contenu:not(.lecture) .bouton {
	margin-top: 0;
}

.panneau .panneau-images-sequentielles .images .image.correct {
    border: 1px solid #00b894;
	cursor: default;
}

.panneau .panneau-images-sequentielles .contenu.lecture .images {
	justify-content: center;
}

.panneau .panneau-images-sequentielles .contenu.lecture .images .image img {
	width: 27rem;
	height: auto;
}

.panneau .panneau-images-sequentielles .contenu.lecture .images.plein-ecran .image img {
	width: 32rem;
	height: auto;
}
</style>
