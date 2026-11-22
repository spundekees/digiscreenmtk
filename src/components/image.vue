<template>
	<JsPanel class="panneau" :visible="!chargement" :options="options">
		<div class="conteneur-gauche" />
		<div class="conteneur panneau-image" :class="{'mode-lecture': mode === 'lecture'}">
			<div class="contenu" v-if="mode === 'edition' && !chargementImage">
				<label :for="'champ_image_' + id" v-if="pixabayAPIKey !== ''">{{ $t('lienImageRecherche') }}</label>
				<div class="rechercher" v-if="pixabayAPIKey !== ''">
					<input :id="'champ_image_' + id" type="search" :value="image" @input="image = $event.target.value" @keydown.enter="generer">
					<button type="button" :title="$t('rechercher')" :aria-label="$t('rechercher')" class="bouton-secondaire" @click="generer"><i class="material-icons" aria-hidden="true">search</i></button>
				</div>
				<div class="separateur" v-if="pixabayAPIKey !== ''"><span>{{ $t('ou') }}</span></div>
				<label :id="'libelle-image-1_' + id">{{ $t('fichierAppareil') }}</label>
				<span :aria-describedby="'libelle-image-1_' + id" role="button" class="bouton" tabindex="0" @keydown.enter.space.prevent="activerInput('selectionner_image_' + id)" @click="activerInput('selectionner_image_' + id)" :id="'bouton_selectionner_image_' + id">{{ $t('selectionnerImage') }}</span>
				<input :id="'selectionner_image_' + id" type="file" @change="televerserImage" style="display: none" accept=".jpg, .jpeg, .png, .gif">
			</div>
			<div class="contenu" v-else-if="mode === 'edition' && chargementImage">
				<div class="conteneur-chargement">
					<div class="chargement"><span class="lecteur-ecran">{{ $t('chargementEnCours') }}</span></div>
				</div>
			</div>
			<div class="contenu" v-else-if="mode === 'recherche'">
				<label :id="'libelle-image-2_' + id">{{ $t('resultatsRecherche') }}</label>
				<div role="group" :aria-labelledby="'libelle-image-2_' + id" class="recherche">
					<div class="rechercher">
						<input type="search" :aria-label="$t('rechercher')" :value="requete" @input="requete = $event.target.value" @keydown.enter="rechercher(1)">
						<button type="button" :title="$t('rechercher')" :aria-label="$t('rechercher')" class="bouton-secondaire" @click="rechercher(1)"><i class="material-icons" aria-hidden="true">search</i></button>
					</div>
					<div class="resultats" v-if="Object.keys(resultats).length > 0">
						<button type="button" class="item" :title="$t('selectionnerImageRecherche', { image: resultat.id })" :aria-label="$t('selectionnerImageRecherche', { image: resultat.id })" :data-w="resultat.previewWidth" :data-h="resultat.previewHeight" v-for="(resultat, index) in resultats.hits" @click="selectionnerImage(resultat.previewURL.replace('_150', '_1280'))" :key="'image_' + index">
							<img :src="resultat.previewURL" :alt="resultat.id">
						</button>
					</div>
					<div class="navigation" v-if="Object.keys(resultats).length > 0 && (page > 1 || page < (resultats.total / 12))">
						<button type="button" :aria-label="$t('pagePrecedente')" :class="{'invisible': page < 2}" @click="modifierPage('precedente')">{{ $t('pagePrecedente') }}</button>
						<button type="button" :aria-label="$t('pageSuivante')" :class="{'invisible': page >= (resultats.total / 12)}" @click="modifierPage('suivante')">{{ $t('pageSuivante') }}</button>
					</div>
				</div>
			</div>
			<img :id="'image_' + id" :src="image" alt="Image" v-else>
		</div>
		<div class="conteneur-droite" />
		<div class="conteneur-bas" />
	</JsPanel>
</template>

<script>
import JsPanel from '@/components/jspanel.vue'
import Panneau from '@/panneau'

export default {
	name: 'PImage',
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
			x: 0,
			y: 0,
			minw: 27,
			minh: 15,
			statut: '',
			dimensions: {},
			position: {},
			donnees: { w: 0, h: 0, x: 0, y: 0, zoom: 0 },
			image: '',
			pixabayAPIKey: '',
			requete: '',
			resultats: {},
			page: 1,
			panzoom: '',
			zoom: 1,
			chargementImage: false
		}
	},
	watch: {
		chargementImage (valeur) {
			if (valeur) this.annoncer(this.$t('chargementEnCours'))
		},
		export (valeur) {
			if (valeur === true) {
				this.position = { x: this.x, y: this.y }
				this.$emit('export', { id: this.id, titre: this.titre, mode: this.mode, statut: this.statut, dimensions: this.dimensions, position: this.position, contenu: { image: this.image, requete: this.requete, page: this.page, coordonnees: this.definirCoordonnees(), zoom: this.zoom }, w: this.w, h: this.h, x: this.x, y: this.y })
			}
		},
		page (page) {
			this.rechercher(page)
		},
		statut (statut) {
			if (statut === '') {
				this.$nextTick(() => {
					new flexImages({ selector: '.resultats', rowHeight: this.convertirRem(6.5) })
				})
			}
		}
	},
	created () {
		if (import.meta.env.VITE_PIXABAY_API_KEY) {
			this.pixabayAPIKey = import.meta.env.VITE_PIXABAY_API_KEY
		}
		this.definirCaracteristiques('image')
		if (this.panneau.contenu !== '') {
			this.image = this.panneau.contenu.image
			this.requete = this.panneau.contenu.requete
			this.page = this.panneau.contenu.page
			this.zoom = this.panneau.contenu.zoom
		}
		this.genererOptions('image')
	},
	mounted () {
		this.initialiser()
		this.positionner()
		this.chargement = false
		if (this.mode === 'edition' && this.statut !== 'min' && this.requete === '') {
			setTimeout(() => {
				if (this.pixabayAPIKey !== '') {
					document.querySelector('#' + this.id + ' input')?.focus()
				} else {
					document.querySelector('#bouton_selectionner_image_' + this.id)?.focus()
				}
			}, 0)
		} else if (this.mode === 'recherche') {
			setTimeout(() => {
				this.rechercher(this.page)
			}, 0)
		} else if (this.mode === 'lecture') {
			this.redimensionnement = true
			setTimeout(() => {
				const image = document.querySelector('#image_' + this.id)
				this.panzoom = Panzoom(image, {
					maxScale: 15,
					minScale: 0.5,
					panOnlyWhenZoomed: true
				})
				this.panzoom.zoom(this.zoom)
				if (this.panneau.contenu.hasOwnProperty('coordonnees') && this.panneau.contenu.coordonnees !== '') {
					const coordonnees = this.panneau.contenu.coordonnees
					setTimeout(() => {
						this.panzoom.pan(coordonnees.x, coordonnees.y)
					}, 0)
				}
				image.parentElement.addEventListener('wheel', this.panzoom.zoomWithWheel)
				image.addEventListener('panzoomchange', this.modifierZoom)
				if (this.statut !== 'min') {
					image.focus()
				}
			}, 0)
		}
	},
	methods: {
		generer () {
			if (this.verifierURL(this.image) === true || this.image.substring(0, 10) === 'data:image') {
				this.mode = 'lecture'
				this.redimensionnement = true
				this.chargementImage = false
				this.w = 40
				this.h = 30
				if (this.donnees.w > 0 && this.donnees.h > 0) {
					this.w = this.donnees.w
					this.h = this.donnees.h
				} else {
					this.w = 40
					this.h = 30
				}
				if (this.donnees.x > 0 && this.donnees.y > 0) {
					this.x = this.donnees.x
					this.y = this.donnees.y
				}
				if (this.donnees.zoom > 0) {
					this.zoom = this.donnees.zoom
				}
				this.positionner()
				this.$nextTick(() => {
					const image = document.querySelector('#image_' + this.id)
					this.panzoom = Panzoom(image, {
						maxScale: 15,
						minScale: 0.5,
						panOnlyWhenZoomed: true
					})
					this.panzoom.zoom(this.zoom)
					image.parentElement.addEventListener('wheel', this.panzoom.zoomWithWheel)
					image.addEventListener('panzoomchange', this.modifierZoom)
					image.focus()
				})
			} else {
				this.mode = 'recherche'
				this.requete = this.image
				this.w = 40
				this.h = 35.4
				this.rechercher(1)
				this.positionner()
			}
		},
		editer () {
			this.redimensionnement = false
			this.chargementImage = false
			this.donnees.zoom = this.zoom
			this.zoom = 1
			if (this.panzoom !== '') {
				const image = document.querySelector('#image_' + this.id)
				image.removeEventListener('panzoomchange', this.modifierZoom)
				image.parentElement.removeEventListener('wheel', this.panzoom.zoomWithWheel)
				this.panzoom.destroy()
				this.panzoom = ''
			}
			this.donnees.w = this.w
			this.donnees.h = this.h
			this.donnees.x = this.x
			this.donnees.y = this.y
			this.mode = 'recherche'
			this.w = 40
			this.h = 35.4
			this.rechercher(this.page)
			if (this.image.substring(0, 10) === 'data:image') {
				this.image = ''
			}
			this.$nextTick(() => {
				if (this.pixabayAPIKey !== '') {
					document.querySelector('#' + this.id + ' input')?.focus()
				} else {
					document.querySelector('#bouton_selectionner_image_' + this.id)?.focus()
				}
			})
			this.positionner()
		},
		rechercher (page) {
			if (this.requete !== '') {
				const requete = encodeURIComponent(this.requete.trim())
				const xhr = new XMLHttpRequest()
				xhr.onload = () => {
					if (xhr.status === 200) {
						try {
							const donnees = JSON.parse(xhr.responseText)
							if (donnees && donnees.total > 0) {
								this.resultats = donnees
								this.$nextTick(() => {
									new flexImages({ selector: '.resultats', rowHeight: this.convertirRem(6.5) })
								})
							}
						} catch {
							this.resultats = {}
						}
					}
				}
				if (page === 1) {
					this.page = page
				}
				xhr.open('GET', 'https://pixabay.com/api/?key=' + this.pixabayAPIKey + '&q=' + requete + '&image_type=photo&lang=fr&orientation=horizontal&safesearch=true&per_page=12&page=' + page, true)
				xhr.send()
			}
		},
		modifierPage (type) {
			if (type === 'suivante' && this.page < (this.resultats.total / 12)) {
				this.page++
			} else if (type === 'precedente' && this.page > 1) {
				this.page--
			}
		},
		selectionnerImage (image) {
			this.image = image
			this.generer()
		},
		televerserImage (event) {
			const fichier = event.target.files[0]
			if (fichier) {
				this.chargementImage = true
				const reader = new FileReader()
				reader.readAsDataURL(fichier)
				reader.onloadend = (e) => {
					const img = new Image()
					img.src = e.target.result
					img.onload = () => {
						if (img.width > 1200) {
							const canvas = document.createElement('canvas')
							const ratio = img.width / img.height
							const largeur = 1200
							const hauteur = 1200 / ratio
							canvas.width = largeur
							canvas.height = hauteur
							canvas.getContext('2d').drawImage(img, 0, 0, largeur, hauteur)
							this.chargementImage = false
							this.image = canvas.toDataURL('image/jpeg', 0.85)
							this.generer()
						} else {
							this.chargementImage = false
							this.image = e.target.result
							this.generer()
						}
					}
				}
				reader.onerror = () => {
					this.chargementImage = false
				}
			}
		},
		definirCoordonnees () {
			if (this.panzoom !== '') {
				return this.panzoom.getPan()
			} else {
				return ''
			}
		},
		zoomer () {
			if (this.zoom < 15) {
				this.zoom = this.zoom + 0.1
				this.panzoom.zoom(this.zoom, { animated: true })
			}
		},
		dezoomer () {
			if (this.zoom > 0.5) {
				this.zoom = this.zoom - 0.1
				this.panzoom.zoom(this.zoom, { animated: true })
			}
		},
		recadrer () {
			this.zoom = 1
			setTimeout(() => {
				this.panzoom.reset()
			}, 10)
		},
		modifierZoom (event) {
			if (event.detail.scale !== this.zoom) {
				this.zoom = event.detail.scale
				this.panzoom.zoom(this.zoom, { animated: true })
			}
		}
	}
}
</script>

<style>
.panneau .panneau-image.mode-lecture {
	height: calc(100% - 3rem);
}

.panneau .panneau-image .conteneur-chargement {
	font-size: 0;
	line-height: 1;
	text-align: center;
}

.panneau .panneau-image .chargement {
	display: inline-block;
	border: 7px solid #ddd;
	border-top: 7px solid #00ced1;
	border-radius: 50%;
	width: 45px;
	height: 45px;
	animation: rotation 0.7s linear infinite;
}

.panneau .panneau-image .separateur {
    position: relative;
    margin: 2rem 25% 2rem;
    text-align: center;
    width: 50%;
}

.panneau .panneau-image .separateur::before {
    position: absolute;
    top: 50%;
    display: block;
    content: '';
    width: 100%;
    height: 1px;
    background-color: #ddd;
}

.panneau .panneau-image .separateur span {
    position: relative;
	display: inline-block;
    margin: 0;
    font-size: 1.5rem;
    z-index: 2;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    vertical-align: middle;
    background-color: #fff;
}

.panneau .panneau-image img {
	max-width: 100%;
	max-height: 100%;
	align-self: center;
	cursor: default;
}

.panneau .panneau-image span:where([role="button"]).bouton {
	margin-top: 0;
	margin-bottom: 0!important;
}
</style>
