<template>
	<JsPanel class="panneau" :visible="!chargement" :options="options">
		<div class="conteneur-gauche" />
		<div class="conteneur panneau-cartes" v-if="mode === 'edition'">
			<div class="contenu">
				<label :id="'groupe_format_' + id" class="libelle-option">{{ $t('formatCartes') }}</label>
				<div class="format" role="radiogroup" :aria-labelledby="'groupe_format_' + id">
					<span class="paysage">
						<input :id="'format_paysage_' + id" type="radio" :name="'format_' + id" value="paysage" :checked="format === 'paysage'" @change="format = $event.target.value">
						<label :for="'format_paysage_' + id">{{ $t('paysage') }}</label>
					</span>
					<span class="portrait">
						<input :id="'format_portrait_' + id" type="radio" :name="'format_' + id" value="portrait" :checked="format === 'portrait'" @change="format = $event.target.value">
						<label :for="'format_portrait_' + id">{{ $t('portrait') }}</label>
					</span>
					<span class="carre">
						<input :id="'format_carre_' + id" type="radio" :name="'format_' + id" value="carre" :checked="format === 'carre'" @change="format = $event.target.value">
						<label :for="'format_carre_' + id">{{ $t('carre') }}</label>
					</span>
				</div>
				<label :for="'texte_recto_' + id">{{ $t('recto') }}</label>
				<div class="conteneur-recto">
					<input :id="'texte_recto_' + id" type="text" :value="texteRecto" :maxlength="50" @input="texteRecto = $event.target.value">
					<input :id="'fond-recto-' + id" type="color" :value="fondRecto" :title="$t('selectionnerCouleurFond')" :aria-label="$t('selectionnerCouleurFond')" @change="fondRecto = $event.target.value" v-if="imageRecto === '' && chargementImage === ''">
					<span class="fond-recto" v-if="fondRecto === '#001d1d' && imageRecto === '' && chargementImage === ''">
						<span role="button" class="bouton-secondaire" tabindex="0" :title="$t('selectionnerImage')" :aria-label="$t('selectionnerImage')" @keydown.enter.space.prevent="activerInput('televerser_image_recto_' + id)" @click="activerInput('televerser_image_recto_' + id)"><i class="material-icons" aria-hidden="true">add_photo_alternate</i></span>
						<input :id="'televerser_image_recto_' + id" type="file" @change="televerserImage($event, 'recto')" style="display: none" accept=".jpg, .jpeg, .png, .gif">
					</span>
					<span class="fond-recto" v-else-if="imageRecto === '' && chargementImage === 'recto'">
						<span class="conteneur-chargement">
							<span class="chargement"><span class="lecteur-ecran">{{ $t('chargementEnCours') }}</span></span>
						</span>
					</span>
					<span class="fond-recto image" v-else-if="imageRecto !== ''" :style="'background-image: url(' + imageRecto + ')'" />
					<button type="button" class="supprimer-image" :title="$t('supprimer')" :aria-label="$t('supprimer')" @click="imageRecto = ''" v-if="imageRecto !== ''"><i class="material-icons" aria-hidden="true">highlight_off</i></button>
					<button type="button" class="supprimer-fond" :title="$t('supprimer')" :aria-label="$t('supprimer')" @click="fondRecto = '#001d1d'" v-if="fondRecto !== '#001d1d' && imageRecto === ''"><i class="material-icons" aria-hidden="true">highlight_off</i></button>
				</div>
				<label :for="'texte_verso_' + id">{{ $t('verso') }}</label>
				<div class="conteneur-verso">
					<input :id="'texte_verso_' + id" type="text" :value="texteVerso" :maxlength="50" @input="texteVerso = $event.target.value">
					<input type="color" :id="'fond_verso_' + id" :value="fondVerso" :title="$t('selectionnerCouleurFond')" :aria-label="$t('selectionnerCouleurFond')" @change="fondVerso = $event.target.value" v-if="imageVerso === '' && chargementImage === ''">
					<span class="fond-verso" v-if="fondVerso === '#ffffff' && imageVerso === '' && chargementImage === ''">
						<span role="button" class="bouton-secondaire" tabindex="0" :title="$t('selectionnerImage')" :aria-label="$t('selectionnerImage')" @keydown.enter.space.prevent="activerInput('televerser_image_verso_' + id)" @click="activerInput('televerser_image_verso_' + id)"><i class="material-icons" aria-hidden="true">add_photo_alternate</i></span>
						<input :id="'televerser_image_verso_' + id" type="file" @change="televerserImage($event, 'verso')" style="display: none" accept=".jpg, .jpeg, .png, .gif">
					</span>
					<span class="fond-verso" v-else-if="imageVerso === '' && chargementImage === 'verso'">
						<span class="conteneur-chargement">
							<span class="chargement"><span class="lecteur-ecran">{{ $t('chargementEnCours') }}</span></span>
						</span>
					</span>
					<span class="fond-verso image" v-else-if="imageVerso !== ''" :style="'background-image: url(' + imageVerso + ')'" />
					<button type="button" class="supprimer-image" :title="$t('supprimer')" :aria-label="$t('supprimer')" @click="imageVerso = ''" v-if="imageVerso !== ''"><i class="material-icons" aria-hidden="true">highlight_off</i></button>
					<button type="button" class="supprimer-fond" :title="$t('supprimer')" :aria-label="$t('supprimer')" @click="fondVerso = '#ffffff'" v-if="fondVerso !== '#ffffff' && imageVerso === ''"><i class="material-icons" aria-hidden="true">highlight_off</i></button>
				</div>
				<button type="button" class="bouton-secondaire ajouter" :title="$t('ajouterCarte')" :aria-label="$t('ajouterCarte')" @click="ajouterCarte"><i class="material-icons" aria-hidden="true">add_circle_outline</i></button>
				<draggable class="items" role="list" v-model="cartes" filter=".deplacer, .fermer" :prevent-on-filter="false">
					<div class="item" role="listitem" :class="format" v-for="(carte, index) in cartes" :key="'item_' + index">
						<button type="button" :id="'item_' + id + '_' + index" class="carte" :title="$t('retournerCarte')" :aria-label="$t('retournerCarte')" @click="retournerCarte('item_' + id + '_' + index)">
							<div class="recto" :style="'background-color:' + carte.recto.fond" aria-hidden="false">
								<div :style="'background-image: linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url(' + carte.recto.image + ')'" v-if="carte.recto.image !== '' && carte.recto.texte !== ''">
									<h1 style="color: #000;">{{ carte.recto.texte }}</h1>
								</div>
								<div :style="'background-image: url(' + carte.recto.image + ')'" v-else-if="carte.recto.image !== '' && carte.recto.texte === ''" />
								<div v-else>
									<h1 :style="'color:' + definirCouleurTexte(carte.recto.fond)" v-if="carte.recto.texte !== ''">{{ carte.recto.texte }}</h1>
								</div>
							</div>
							<div class="verso" :style="'background-color:' + carte.verso.fond" aria-hidden="true">
								<div :style="'background-image: linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url(' + carte.verso.image + ')'" v-if="carte.verso.image !== '' && carte.verso.texte !== ''">
									<p style="color: #000;">{{ carte.verso.texte }}</p>
								</div>
								<div :style="'background-image: url(' + carte.verso.image + ')'" v-else-if="carte.verso.image !== '' && carte.verso.texte === ''" />
								<div v-else>
									<p :style="'color:' + definirCouleurTexte(carte.verso.fond)" v-if="carte.verso.texte !== ''">{{ carte.verso.texte }}</p>
								</div>
							</div>
						</button>
						<button type="button" class="fermer" :title="$t('supprimer')" :aria-label="$t('libelleCible', { action: $t('supprimer'), cible: $t('carte') + ' ' + (index + 1) })" @click="supprimerCarte(index)"><i class="material-icons" aria-hidden="true">highlight_off</i></button>
						<span class="deplacements">
							<button type="button" class="deplacer avant" :disabled="index === 0" :title="$t('deplacerAvant')" :aria-label="$t('libelleCible', { action: $t('deplacerAvant'), cible: $t('carte') + ' ' + (index + 1) })" @click="deplacerElement('cartes', index, -1, '.items .item')"><i class="material-icons" aria-hidden="true">arrow_back</i></button>
							<button type="button" class="deplacer apres" :disabled="index === cartes.length - 1" :title="$t('deplacerApres')" :aria-label="$t('libelleCible', { action: $t('deplacerApres'), cible: $t('carte') + ' ' + (index + 1) })" @click="deplacerElement('cartes', index, 1, '.items .item')"><i class="material-icons" aria-hidden="true">arrow_forward</i></button>
						</span>
					</div>
				</draggable>
				<button type="button" class="bouton" @click="generer">{{ $t('valider') }}</button>
			</div>
		</div>
		<div class="conteneur panneau-cartes" v-else>
			<div class="contenu cartes">
				<button type="button" :id="'carte_' + id + '_' + index" class="carte" :title="$t('retournerCarte')" :aria-label="$t('retournerCarte')" :class="format" v-for="(carte, index) in cartes" @click="retournerCarte('carte_' + id + '_' + index)" :key="'carte_' + index">
					<div class="recto" :style="'background-color:' + carte.recto.fond" aria-hidden="false">
						<div :style="'background-image: linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url(' + carte.recto.image + ')'" v-if="carte.recto.image !== '' && carte.recto.texte !== ''">
							<h1 style="color: #000;">{{ carte.recto.texte }}</h1>
						</div>
						<div :style="'background-image: url(' + carte.recto.image + ')'" v-else-if="carte.recto.image !== '' && carte.recto.texte === ''" />
						<div v-else>
							<h1 :style="'color:' + definirCouleurTexte(carte.recto.fond)" v-if="carte.recto.texte !== ''">{{ carte.recto.texte }}</h1>
						</div>
					</div>
					<div class="verso" :style="'background-color:' + carte.verso.fond" aria-hidden="true">
						<div :style="'background-image: linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url(' + carte.verso.image + ')'" v-if="carte.verso.image !== '' && carte.verso.texte !== ''">
							<p style="color: #000;">{{ carte.verso.texte }}</p>
						</div>
						<div :style="'background-image: url(' + carte.verso.image + ')'" v-else-if="carte.verso.image !== '' && carte.verso.texte === ''" />
						<div v-else>
							<p :style="'color:' + definirCouleurTexte(carte.verso.fond)" v-if="carte.verso.texte !== ''">{{ carte.verso.texte }}</p>
						</div>
					</div>
				</button>
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
	name: 'PCartes',
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
			minw: 60,
			minh: 50,
			statut: '',
			dimensions: {},
			position: {},
			donnees: { w: 0, h: 0, x: 0, y: 0 },
			cartes: [],
			format: 'paysage',
			texteRecto: '',
			texteVerso: '',
			fondRecto: '#001d1d',
			fondVerso: '#ffffff',
			imageRecto: '',
			imageVerso: '',
			chargementImage: ''
		}
	},
	watch: {
		chargementImage (valeur) {
			if (valeur) this.annoncer(this.$t('chargementEnCours'))
		},
		export (valeur) {
			if (valeur === true) {
				this.position = { x: this.x, y: this.y }
				this.$emit('export', { id: this.id, titre: this.titre, mode: this.mode, statut: this.statut, dimensions: this.dimensions, position: this.position, contenu: { cartes: this.cartes, format: this.format }, w: this.w, h: this.h, x: this.x, y: this.y })
			}
		}
	},
	created () {
		this.definirCaracteristiques('cartes')
		if (this.panneau.contenu !== '') {
			this.cartes = this.panneau.contenu.cartes
			this.format = this.panneau.contenu.format
		}
		this.genererOptions('cartes')
	},
	mounted () {
		this.initialiser()
		this.positionner()
		this.chargement = false
		if (this.mode === 'edition' && this.statut !== 'min') {
			setTimeout(() => {
				document.querySelector('#' + this.id + ' input[type="text"]')?.focus()
			}, 0)
		} else if (this.mode === 'lecture' && this.statut !== 'min') {
			this.redimensionnement = true
			setTimeout(() => {
				document.querySelector('#' + this.id + ' .carte')?.focus()
			}, 0)
		}
	},
	methods: {
		generer () {
			if (this.cartes.length > 0) {
				this.mode = 'lecture'
				this.redimensionnement = true
				if (this.donnees.w > 0 && this.donnees.h > 0) {
					this.w = this.donnees.w
					this.h = this.donnees.h
				} else {
					this.w = 90
					this.h = 64
				}
				if (this.donnees.x > 0 && this.donnees.y > 0) {
					this.x = this.donnees.x
					this.y = this.donnees.y
				}
				this.$nextTick(() => {
					document.querySelector('#' + this.id + ' .carte')?.focus()
				})
				this.positionner()
			}
		},
		editer () {
			this.mode = 'edition'
			this.redimensionnement = false
			this.texteRecto = ''
			this.texteVerso = ''
			this.fondRecto = '#001d1d'
			this.fondVerso = '#ffffff'
			this.imageRecto = ''
			this.imageVerso = ''
			this.chargementImage = ''
			this.donnees.w = this.w
			this.donnees.h = this.h
			this.donnees.x = this.x
			this.donnees.y = this.y
			this.w = 60
			this.h = 50
			this.$nextTick(() => {
				document.querySelector('#' + this.id + ' input[type="text"]')?.focus()
			})
			this.positionner()
		},
		ajouterCarte () {
			const carte = { recto: { texte: this.texteRecto, fond: this.fondRecto, image: this.imageRecto }, verso: { texte: this.texteVerso, fond: this.fondVerso, image: this.imageVerso }}
			this.cartes.push(carte)
			this.texteRecto = ''
			this.texteVerso = ''
			this.imageRecto = ''
			this.imageVerso = ''
			this.chargementImage = ''
		},
		retournerCarte (id) {
			const carte = document.querySelector('#' + id)
			carte.classList.contains('flip') ? carte.classList.remove('flip') : carte.classList.add('flip')
			if (carte.classList.contains('flip')) {
				carte.querySelector('.recto').setAttribute('aria-hidden', true)
				carte.querySelector('.verso').setAttribute('aria-hidden', false)
			} else {
				carte.querySelector('.recto').setAttribute('aria-hidden', false)
				carte.querySelector('.verso').setAttribute('aria-hidden', true)
			}
		},
		supprimerCarte (index) {
			this.cartes.splice(index, 1)
		},
		televerserImage (event, type) {
			const fichier = event.target.files[0]
			if (fichier) {
				this.chargementImage = type
				const reader = new FileReader()
				reader.readAsDataURL(fichier)
				reader.onloadend = (e) => {
					const img = new Image()
					img.src = e.target.result
					img.onload = () => {
						if (img.width > 1500) {
							const canvas = document.createElement('canvas')
							const ratio = img.width / img.height
							const largeur = 1500
							const hauteur = 1500 / ratio
							canvas.width = largeur
							canvas.height = hauteur
							canvas.getContext('2d').drawImage(img, 0, 0, largeur, hauteur)
							this.chargementImage = ''
							if (type === 'recto') {
								this.imageRecto = canvas.toDataURL('image/jpeg', 0.85)
							} else {
								this.imageVerso = canvas.toDataURL('image/jpeg', 0.85)
							}
						} else {
							this.chargementImage = ''
							if (type === 'recto') {
								this.imageRecto = e.target.result
							} else {
								this.imageVerso = e.target.result
							}
						}
					}
				}
				reader.onerror = () => {
					this.chargementImage = ''
				}
			}
		},
		definirCouleurTexte (couleurFond) {
			const couleur = (couleurFond.charAt(0) === '#') ? couleurFond.substring(1, 7) : couleurFond
			const r = parseInt(couleur.substring(0, 2), 16)
			const v = parseInt(couleur.substring(2, 4), 16)
			const b = parseInt(couleur.substring(4, 6), 16)
			return (((r * 0.299) + (v * 0.587) + (b * 0.114)) > 186) ? '#001d1d' : '#ffffff'
		}
	}
}
</script>

<style>
.panneau .panneau-cartes .paysage,
.panneau .panneau-cartes .portrait {
	margin-right: 2.5rem;
}

.panneau .panneau-cartes .format {
	margin-bottom: 2rem;
}

.panneau .panneau-cartes .format label {
	display: inline-block;
    width: auto;
	font-size: 1.6rem;
	font-weight: 400;
    margin-left: 1rem;
	margin-bottom: 0;
}

.panneau .panneau-cartes .conteneur-recto,
.panneau .panneau-cartes .conteneur-verso {
	position: relative;
	display: flex;
	justify-content: flex-start;
	align-items: center;
}

.panneau .panneau-cartes .conteneur-recto {
	margin-bottom: 2rem;
}

.panneau .panneau-cartes .conteneur-recto .bouton-secondaire,
.panneau .panneau-cartes .conteneur-verso .bouton-secondaire {
	font-size: 3.6rem;
	font-weight: 400;
	margin-bottom: 0;
	margin-left: 1rem;
	line-height: 1;
}

.panneau .panneau-cartes .ajouter {
	margin-top: 1.5rem;
}

.panneau .panneau-cartes .cartes,
.panneau .panneau-cartes .items {
	display: flex;
	justify-content: center;
	flex-wrap: wrap;
}

.panneau .panneau-cartes .items .item {
	position: relative;
	margin: 1rem;
}

.panneau .panneau-cartes .items .item .deplacements {
	display: flex;
	justify-content: center;
	gap: 0.5rem;
	margin-top: 0.5rem;
}

.panneau .panneau-cartes .items .item .deplacer {
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

.panneau .panneau-cartes .items .item .deplacer:disabled {
	opacity: 0.4;
	cursor: default;
}

.panneau .panneau-cartes .items .item .deplacer i {
	font-size: 2rem;
}

.panneau .panneau-cartes .items .item .fermer {
	position: absolute;
    top: 0;
    right: 0;
	font-size: 2.2rem;
	color: #777;
	background: #fff;
	cursor: pointer;
	line-height: 1;
	z-index: 5;
}

.panneau .panneau-cartes .carte {
	position: relative;
    display: inline-block;
    margin: 0 0.5em 1.5rem;
	border: none;
	padding: 0;
	background: none;
	box-sizing: border-box;
	cursor: pointer;
}

.panneau .panneau-cartes .carte.paysage {
	width: 32rem;
}

.panneau .panneau-cartes .carte.portrait {
	width: 22rem;
}

.panneau .panneau-cartes .carte.carre {
	width: 27rem;
}

.panneau .panneau-cartes .paysage .carte {
	width: 16rem;
}

.panneau .panneau-cartes .portrait .carte {
	width: 11rem;
}

.panneau .panneau-cartes .carre .carte {
	width: 13.5rem;
}

.panneau .panneau-cartes .items .carte {
	margin: 0;
}

.panneau .panneau-cartes .carte h1 {
    font-size: 2.2em;
	text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3);
}

.panneau .panneau-cartes .items .carte h1 {
    font-size: 1.1em;
}

.panneau .panneau-cartes .carte > .recto,
.panneau .panneau-cartes .carte > .verso {
    width: inherit;
    border-radius: 0.7rem;
	border: 1px solid #001d1d;
	transition-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275);
    transition-duration: 0.5s;
    transition-property: transform, opacity;
}

.panneau .panneau-cartes .carte.paysage > .recto,
.panneau .panneau-cartes .carte.paysage > .verso {
	height: 22rem;
}

.panneau .panneau-cartes .carte.portrait > .recto,
.panneau .panneau-cartes .carte.portrait > .verso {
	height: 32rem;
}

.panneau .panneau-cartes .carte.carre > .recto,
.panneau .panneau-cartes .carte.carre > .verso {
	height: 27rem;
}

.panneau .panneau-cartes .paysage .carte > .recto,
.panneau .panneau-cartes .paysage .carte > .verso {
	height: 11rem;
}

.panneau .panneau-cartes .portrait .carte > .recto,
.panneau .panneau-cartes .portrait .carte > .verso {
	height: 16rem;
}

.panneau .panneau-cartes .carre .carte > .recto,
.panneau .panneau-cartes .carre .carte > .verso {
	height: 13.5rem;
}

.panneau .panneau-cartes .carte > .recto {
    transform: rotateY(0deg);
	background-size: cover;
}

.panneau .panneau-cartes .carte > .verso {
    position: absolute;
    opacity: 0;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
	background-size: contain;
    transform: rotateX(-180deg);
}

.panneau .panneau-cartes .carte.flip > .recto {
    transform: rotateX(180deg);
}

.panneau .panneau-cartes .carte.flip > .verso {
    opacity: 1;
    transform: rotateX(0deg);
}

.panneau .panneau-cartes .carte > .verso p {
    font-size: 1.5em;
    line-height: 1.4;
	font-weight: 400;
	text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3);
}

.panneau .panneau-cartes .items .carte > .verso p {
    font-size: 0.75em;
}

.panneau .panneau-cartes .carte > .recto > div,
.panneau .panneau-cartes .carte > .verso > div {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
    height: 100%;
	padding: 1em;
	border-radius: 0.5rem;
}

.panneau .panneau-cartes .carte > .recto > div,
.panneau .panneau-cartes .carte > .verso > div {
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
}

.panneau .panneau-cartes span.conteneur-chargement {
	width: 2.4rem;
}

.panneau .panneau-cartes span.conteneur-chargement .chargement {
	display: inline-block;
	border: 0.4rem solid #ddd;
	border-top: 0.4rem solid #00ced1;
	border-radius: 50%;
	width: 2.4rem;
	height: 2.4rem;
	animation: rotation 0.7s linear infinite;
}

.panneau .panneau-cartes .fond-verso,
.panneau .panneau-cartes .fond-recto {
	width: 3.6rem;
}

.panneau .panneau-cartes .fond-verso.image,
.panneau .panneau-cartes .fond-recto.image {
	position: absolute;
	top: 0;
	bottom: 0;
    right: 4.6rem;
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
	border-radius: 0.4rem;
}

.panneau .panneau-cartes input[type="text"] {
	width: calc(100% - 9.2rem);
	margin: 0;
}

.panneau .panneau-cartes .supprimer-fond,
.panneau .panneau-cartes .supprimer-image {
	width: 3.6rem;
	line-height: 4rem;
	font-size: 2.4rem;
	cursor: pointer;
}

.panneau .panneau-cartes .supprimer-fond {
	margin-left: 1rem;
}

.panneau .panneau-cartes .supprimer-image {
	margin-left: 5.6rem;
}

.panneau .panneau-cartes input[type="color"] {
	width: 3.6rem;
	height: 3.6rem;
	border: none;
	margin-left: 1rem;
	cursor: pointer;
}

.panneau .panneau-cartes input[type="color"]::-moz-color-swatch {
	border: 1px solid #ddd;
	border-radius: 50%;
}

.panneau .panneau-cartes input[type="color"]:focus::-moz-color-swatch {
	border: 1px solid #001d1d;
}

.panneau .panneau-cartes input[type="color"]::-webkit-color-swatch {
	border: 1px solid #ddd;
	border-radius: 50%;
}

.panneau .panneau-cartes input[type="color"]:focus::-webkit-color-swatch {
	border: 1px solid #001d1d;
}

.panneau .panneau-cartes input[type="color"]::-webkit-color-swatch-wrapper {
	padding: 0;
}
</style>
