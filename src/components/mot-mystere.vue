<template>
	<JsPanel class="panneau" :visible="!chargement" :options="options">
		<div class="conteneur-gauche" :class="{'masque': mode === 'lecture'}" />
		<div class="conteneur panneau-mot-mystere" v-if="mode === 'edition'">
			<div class="contenu" v-if="!chargementImage">
				<label :for="'mot_' + id">{{ $t('motATrouver') }}</label>
				<input :id="'mot_' + id" type="text" :value="mot" @input="mot = $event.target.value">
				<label :for="'illustration_' + id">{{ $t('illustration') }}</label>
				<select :id="'illustration_' + id" :value="illustration" @change="illustration = $event.target.value">
					<option v-for="nom in illustrations" :key="'illustration_' + nom" :value="nom">{{ $t(nomsIllustrations[nom]) }}</option>
				</select>
				<div class="apercu" aria-hidden="true">
					<img v-if="illustration === 'image' && image !== ''" :src="$recupererRessource(image)" alt="">
					<div class="dessin-apercu" v-else-if="illustration !== 'image'" v-html="dessins[illustration]" />
				</div>
				<template v-if="illustration === 'image'">
					<span role="button" class="bouton selectionner-image" tabindex="0" @keydown.enter.space.prevent="activerInput('selectionner_image_' + id)" @click="activerInput('selectionner_image_' + id)">{{ $t('selectionnerImage') }}</span>
					<input :id="'selectionner_image_' + id" type="file" @change="televerserImage" style="display: none" accept=".jpg, .jpeg, .png, .gif">
				</template>
				<label :for="'nombre_erreurs_' + id">{{ $t('nombreErreurs') }}</label>
				<input :id="'nombre_erreurs_' + id" type="number" :value="erreurs" :min="1" :max="20" @input="erreurs = parseInt($event.target.value)">
				<label :for="'caracteres_' + id">{{ $t('caracteres') }}</label>
				<textarea :id="'caracteres_' + id" class="caracteres" :value="caracteres" @input="caracteres = $event.target.value"></textarea>
				<button type="button" class="bouton" @click="generer">{{ $t('valider') }}</button>
			</div>
			<div class="contenu" v-else>
				<div class="conteneur-chargement">
					<div class="chargement"><span class="lecteur-ecran">{{ $t('chargementEnCours') }}</span></div>
				</div>
			</div>
		</div>
		<div class="conteneur panneau-mot-mystere lecture" v-else>
			<div class="contenu">
				<div class="gauche">
					<img v-if="illustration === 'image'" :src="$recupererRessource(image)" :style="'opacity:' + opacite" alt="" />
					<div class="dessin-jeu" v-else v-html="dessins[illustration]" aria-hidden="true" />
					<div>
						<label>{{ $t('erreursRestantes') }}</label>
						<span class="erreurs">{{ erreursRestantes }}</span>
					</div>
				</div>
				<div class="droite">
					<p class="lecteur-ecran">{{ texteMotLecteur }}</p>
					<div class="mot" :class="{'trouve': motTrouve}" aria-hidden="true">
						<span class="mot-groupe" v-for="(groupe, indexGroupe) in groupes" :key="'groupe_' + indexGroupe">
							<span class="lettre" :class="lettre.classe" v-for="lettre in groupe" :key="'lettre_' + lettre.index">{{ lettre.caractere }}</span>
						</span>
					</div>
					<div class="caracteres">
						<template v-for="(caractere, indexCaractere) in tableauCaracteres" :key="'caractere_' + indexCaractere">
							<span class="caractere inactif" :class="definirEtatCaractere(caractere)" v-if="motTrouve || erreursRestantes === 0 || caracteresUtilises.includes(caractere)">{{ caractere.toUpperCase() }}</span>
							<button type="button" class="caractere" :title="$t('selectionnerCaractere', { caractere: caractere.toUpperCase() })" :aria-label="$t('selectionnerCaractere', { caractere: caractere.toUpperCase() })" @click="verifierLettre(caractere)" v-else>{{ caractere.toUpperCase() }}</button>
						</template>
					</div>
					<div class="actions" v-if="motTrouve || erreursRestantes === 0">
						<button type="button" class="bouton rejouer" @click="rejouer">{{ $t('rejouer') }}</button>
					</div>
				</div>
			</div>
		</div>
		<div class="conteneur-droite" :class="{'masque': mode === 'lecture'}" />
		<div class="conteneur-bas" :class="{'masque': mode === 'lecture'}" />
	</JsPanel>
</template>

<script>
import JsPanel from '@/components/jspanel.vue'
import Panneau from '@/panneau'
import dessins from '@/illustrations-mot-mystere'

export default {
	name: 'PMotMystere',
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
			minw: 40,
			minh: 50,
			statut: '',
			dimensions: {},
			position: {},
			donnees: { w: 0, h: 0, x: 0, y: 0 },
			mot: '',
			lettresTrouvees: [],
			motTrouve: false,
			caracteres: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
			tableauCaracteres: [],
			caracteresUtilises: [],
			erreurs: 5,
			erreursRestantes: 5,
			illustration: 'emoji',
			image: '',
			chargementImage: false,
			dessins: dessins,
			illustrations: ['emoji', 'bonhomme', 'fleur', 'monstre', 'fusee', 'image'],
			nomsIllustrations: { emoji: 'emoji', bonhomme: 'bonhommeNeige', fleur: 'fleur', monstre: 'monstre', fusee: 'fusee', image: 'imagePersonnalisee' }
		}
	},
	computed: {
		caracteresMajuscules () {
			return this.tableauCaracteres.map((caractere) => caractere.toUpperCase())
		},
		groupes () {
			const groupes = []
			let groupe = null
			this.lettresTrouvees.forEach((lettre, index) => {
				if (lettre === ' ') {
					groupe = null
					return
				}
				if (groupe === null) {
					groupe = []
					groupes.push(groupe)
				}
				if (lettre === '_') {
					groupe.push({ index: index, caractere: '', classe: 'cachee' })
				} else {
					groupe.push({ index: index, caractere: lettre.toUpperCase(), classe: this.caracteresMajuscules.includes(lettre.toUpperCase()) ? '' : 'autre' })
				}
			})
			return groupes
		},
		opacite () {
			return this.erreursRestantes === 0 ? 1 : (this.erreurs - this.erreursRestantes) / this.erreurs
		},
		texteMotLecteur () {
			const mot = this.lettresTrouvees.map((lettre) => {
				if (lettre === '_') return this.$t('vide')
				if (lettre === ' ') return this.$t('espace')
				return lettre.toUpperCase()
			}).join(', ')
			return this.$t('motATrouverLecteur', { mot: mot })
		}
	},
	watch: {
		chargementImage (valeur) {
			if (valeur) this.annoncer(this.$t('chargementEnCours'))
		},
		illustration () {
			this.$nextTick(() => {
				this.actualiserDessins()
			})
		},
		export (valeur) {
			if (valeur === true) {
				this.position = { x: this.x, y: this.y }
				this.$emit('export', { id: this.id, titre: this.titre, mode: this.mode, statut: this.statut, dimensions: this.dimensions, position: this.position, contenu: { mot: this.mot, caracteres: this.caracteres, erreurs: this.erreurs, illustration: this.illustration, image: this.image }, w: this.w, h: this.h, x: this.x, y: this.y })
			}
		}
	},
	created () {
		this.definirCaracteristiques('motMystere')
		if (this.panneau.contenu !== '') {
			const contenu = this.panneau.contenu
			const image = contenu.image || ''
			this.mot = contenu.mot
			this.caracteres = contenu.caracteres
			this.erreurs = contenu.erreurs
			if (contenu.hasOwnProperty('illustration') && this.illustrations.includes(contenu.illustration)) {
				this.illustration = contenu.illustration
				this.image = image
			} else if (image !== '' && !image.startsWith('./static/img/pendu/')) {
				this.illustration = 'image'
				this.image = image
			}
			if (this.illustration === 'image' && this.image === '') {
				this.illustration = 'emoji'
			}
		}
		this.genererOptions('mot-mystere')
	},
	mounted () {
		this.initialiser()
		this.positionner()
		this.chargement = false
		if (this.mode === 'edition' && this.statut !== 'min') {
			setTimeout(() => {
				document.querySelector('#' + this.id + ' input')?.focus()
			}, 0)
		} else if (this.mode === 'lecture') {
			this.redimensionnement = true
			this.initialiserPartie()
		}
		this.$nextTick(() => {
			this.actualiserDessins()
		})
	},
	methods: {
		initialiserPartie () {
			this.erreursRestantes = this.erreurs
			this.lettresTrouvees = []
			this.caracteresUtilises = []
			this.motTrouve = false
			const caracteres = this.caracteres.split('')
			this.tableauCaracteres = caracteres.filter((element) => element !== '')
			const caracteresMajuscules = this.tableauCaracteres.map((caractere) => caractere.toUpperCase())
			this.mot.split('').forEach((lettre) => {
				if (lettre === ' ' || !caracteresMajuscules.includes(lettre.toUpperCase())) {
					this.lettresTrouvees.push(lettre)
				} else {
					this.lettresTrouvees.push('_')
				}
			})
		},
		definirEtatCaractere (caractere) {
			if (!this.caracteresUtilises.includes(caractere)) return ''
			return this.mot.toUpperCase().includes(caractere.toUpperCase()) ? 'present' : 'absent'
		},
		rejouer () {
			this.initialiserPartie()
			this.$nextTick(() => {
				this.actualiserDessins()
				document.querySelector('#' + this.id + ' button.caractere')?.focus()
			})
		},
		generer () {
			if (this.mot !== '') {
				if (this.illustration === 'image' && this.image === '') {
					this.app.notification = { type: 'erreur', message: this.$t('erreurImageMotMystere') }
					return
				}
				this.mode = 'lecture'
				this.redimensionnement = true
				this.initialiserPartie()
				if (this.donnees.w > 0 && this.donnees.h > 0) {
					this.w = this.donnees.w
					this.h = this.donnees.h
				} else {
					this.w = 85
					this.h = 64
				}
				if (this.donnees.x > 0 && this.donnees.y > 0) {
					this.x = this.donnees.x
					this.y = this.donnees.y
				}
				this.$nextTick(() => {
					this.actualiserDessins()
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
			this.lettresTrouvees = []
			this.tableauCaracteres = []
			this.caracteresUtilises = []
			this.motTrouve = false
			this.w = 40
			this.h = 60.4
			this.$nextTick(() => {
				this.actualiserDessins()
				document.querySelector('#' + this.id + ' input')?.focus()
			})
			this.positionner()
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
						if (img.width > 1500) {
							const canvas = document.createElement('canvas')
							const ratio = img.width / img.height
							const largeur = 1500
							const hauteur = 1500 / ratio
							canvas.width = largeur
							canvas.height = hauteur
							canvas.getContext('2d').drawImage(img, 0, 0, largeur, hauteur)
							this.chargementImage = false
							this.image = canvas.toDataURL('image/jpeg', 0.85)
						} else {
							this.chargementImage = false
							this.image = e.target.result
						}
					}
				}
				reader.onerror = () => {
					this.chargementImage = false
				}
			}
		},
		compterEtapes (svg) {
			let total = 0
			svg.querySelectorAll('.etape').forEach((etape) => {
				total = Math.max(total, parseInt(etape.dataset.etape || 0), parseInt(etape.dataset.de || 0), parseInt(etape.dataset.a || 0))
			})
			return total
		},
		appliquerEtape (svg, etapeCourante, perdu) {
			svg.querySelectorAll('.etape').forEach((etape) => {
				let visible
				if (svg.dataset.mode === 'transformer') {
					const de = parseInt(etape.dataset.de || 0)
					const a = etape.dataset.a !== undefined ? parseInt(etape.dataset.a) : Infinity
					visible = etapeCourante >= de && etapeCourante < a
				} else if (svg.dataset.mode === 'defaire') {
					visible = etapeCourante < parseInt(etape.dataset.etape)
				} else {
					visible = etapeCourante >= parseInt(etape.dataset.etape)
				}
				etape.classList.toggle('visible', visible)
			})
			svg.classList.toggle('perdu', perdu)
		},
		actualiserDessins () {
			const conteneur = this.$el
			if (!conteneur || typeof conteneur.querySelector !== 'function') return
			const apercu = conteneur.querySelector('.dessin-apercu svg')
			if (apercu) {
				this.appliquerEtape(apercu, apercu.dataset.mode === 'construire' ? this.compterEtapes(apercu) : 0, false)
			}
			const dessin = conteneur.querySelector('.dessin-jeu svg')
			if (dessin) {
				const total = this.compterEtapes(dessin)
				const perdu = this.erreursRestantes === 0
				this.appliquerEtape(dessin, perdu ? total : Math.ceil((this.erreurs - this.erreursRestantes) * total / this.erreurs), perdu)
			}
		},
		verifierLettre (caractere) {
			if (this.motTrouve === false && this.erreursRestantes > 0 && !this.caracteresUtilises.includes(caractere)) {
				const lettre = caractere.toUpperCase()
				const mot = this.mot.split('').map((element) => element.toUpperCase())
				let annonce
				if (mot.includes(lettre)) {
					let occurrences = 0
					mot.forEach((element, index) => {
						if (element === lettre) {
							this.lettresTrouvees[index] = element
							occurrences++
						}
					})
					annonce = this.$t(occurrences > 1 ? 'lettreApparaitFois' : 'lettreApparaitUneFois', { caractere: lettre, nombre: occurrences })
					if (!this.lettresTrouvees.includes('_')) {
						this.motTrouve = true
						annonce = this.$t('annonceMotTrouve', { mot: this.mot.toUpperCase() })
						this.lancerConfettis()
					}
				} else {
					this.erreursRestantes--
					annonce = this.$t('lettreAbsenteMot', { caractere: lettre, nombre: this.erreursRestantes })
					if (this.erreursRestantes === 0) {
						annonce = this.$t('reponseMotMystere', { mot: this.mot.toUpperCase() })
					}
				}
				this.caracteresUtilises.push(caractere)
				this.annoncer(annonce)
				this.$nextTick(() => {
					this.actualiserDessins()
				})
			}
		}
	}
}
</script>

<style>
.panneau .panneau-mot-mystere .conteneur-chargement {
	font-size: 0;
	line-height: 1;
	text-align: center;
}

.panneau .panneau-mot-mystere .chargement {
	display: inline-block;
	border: 7px solid #ddd;
	border-top: 7px solid #00ced1;
	border-radius: 50%;
	width: 45px;
	height: 45px;
	animation: rotation 0.7s linear infinite;
}

.panneau .panneau-mot-mystere span:where([role="button"]).bouton,
.panneau .panneau-mot-mystere input[type="text"],
.panneau .panneau-mot-mystere input[type="number"],
.panneau .panneau-mot-mystere select {
	margin-bottom: 2rem;
}

.panneau .panneau-mot-mystere span:where([role="button"]).bouton.selectionner-image,
.panneau .panneau-mot-mystere .bouton.rejouer {
	margin-top: 0;
}

.panneau .panneau-mot-mystere .apercu {
	width: 9rem;
	margin: 0 auto 2rem;
}

.panneau .panneau-mot-mystere .apercu:empty {
	display: none;
}

.panneau .panneau-mot-mystere .apercu img {
	max-width: 100%;
	max-height: 9rem;
}

.panneau .panneau-mot-mystere .dessin {
	width: 100%;
	height: auto;
	overflow: hidden;
}

.panneau .panneau-mot-mystere .dessin .etape {
	opacity: 0;
	transform-box: fill-box;
	transform-origin: center;
	transition: opacity ease-in 0.3s, transform ease-in 0.5s;
}

.panneau .panneau-mot-mystere .dessin .etape.visible {
	opacity: 1;
}

.panneau .panneau-mot-mystere .dessin[data-mode="defaire"] .etape:not(.visible) {
	transform: translateY(40px) rotate(25deg);
}

.panneau .panneau-mot-mystere .dessin .fin-perdu {
	opacity: 0;
	transition: opacity ease-in 0.3s 0.3s;
}

.panneau .panneau-mot-mystere .dessin.perdu .fin-perdu {
	opacity: 1;
}

.panneau .panneau-mot-mystere .dessin.perdu .etape.masque-perdu.visible {
	opacity: 0;
}

.panneau .panneau-mot-mystere .dessin .fondre,
.panneau .panneau-mot-mystere .dessin .decoller {
	transform-box: view-box;
	transform-origin: 100px 205px;
	transition: transform ease-in 2s 0.4s;
}

.panneau .panneau-mot-mystere .dessin.perdu .fondre {
	transform: scale(1.15, 0.4);
}

.panneau .panneau-mot-mystere .dessin.perdu .decoller {
	transform: translateY(-260px);
}

.panneau .panneau-mot-mystere .dessin .coeur,
.panneau .panneau-mot-mystere .dessin .tige {
	transition: fill ease-in 0.5s, stroke ease-in 0.5s;
}

.panneau .panneau-mot-mystere .dessin.perdu .coeur {
	fill: #bbb;
}

.panneau .panneau-mot-mystere .dessin.perdu .tige {
	stroke: #999;
}

.panneau .panneau-mot-mystere.lecture .contenu {
   display: flex;
}

.panneau .panneau-mot-mystere.lecture .gauche {
   width: 35%;
}

.panneau .panneau-mot-mystere.lecture img {
   max-width: 100%;
   height: auto;
}

.panneau .panneau-mot-mystere.lecture .gauche .erreurs {
   font-size: 3rem;
   font-weight: 700;
}

.panneau .panneau-mot-mystere.lecture .droite {
   width: 65%;
}

.panneau .panneau-mot-mystere.lecture .droite .mot {
	display: flex;
	padding: 0;
	flex-wrap: wrap;
	justify-content: center;
	gap: 2.5rem 4.5rem;
	margin-bottom: 4rem;
}

.focus .panneau .panneau-mot-mystere.lecture .droite .mot {
	background: rgba(255, 255, 255, 0.9);
	border-radius: 1rem;
	padding: 2rem;
}

.panneau .panneau-mot-mystere.lecture .droite .mot .mot-groupe {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: 1rem;
}

.panneau .panneau-mot-mystere.lecture .droite .mot .lettre {
	display: inline-block;
	min-width: 1em;
	height: 1.35em;
	font-size: 5rem;
	font-weight: 700;
	line-height: 1.3;
	text-align: center;
	border-bottom: 0.4rem solid #001d1d;
}

.panneau .panneau-mot-mystere.lecture .droite .mot .lettre.autre {
	min-width: 0.5em;
	border-bottom-color: transparent;
}

.panneau .panneau-mot-mystere.lecture .droite .mot.trouve .lettre {
	color: #007f63;
}

.panneau .panneau-mot-mystere.lecture .droite .caracteres {
	display: flex;
	justify-content: center;
	flex-wrap: wrap;
}

.panneau .panneau-mot-mystere.lecture .droite .caractere {
	width: 6rem;
	text-align: center;
	font-size: 3rem;
	font-weight: 700;
	padding: 1rem 0;
	margin: 0.5rem;
	color: #001d1d;
	background: #fff;
	border: 2px solid #001d1d;
	border-radius: 0.5rem;
	user-select: none;
	transition: color ease-in 0.1s, background-color ease-in 0.1s, border-color ease-in 0.1s;
	cursor: pointer;
}

.panneau .panneau-mot-mystere.lecture .droite .caractere:hover {
	color: #001d1d;
	background: #00ced1;
}

.panneau .panneau-mot-mystere.lecture .droite .caractere.inactif:hover,
.panneau .panneau-mot-mystere.lecture .droite .caractere.inactif {
	color: #767676;
	background: #fff;
	border-color: #ddd;
	cursor: default;
}

.panneau .panneau-mot-mystere.lecture .droite .caractere.inactif.present {
	color: #fff;
	background: #007f63;
	border-color: #007f63;
}

.panneau .panneau-mot-mystere.lecture .droite .caractere.inactif.absent {
	color: #767676;
	background: #eee;
	border-color: #ddd;
	text-decoration: line-through;
}

.panneau .panneau-mot-mystere.lecture .droite .actions {
	margin-top: 2.5rem;
}
</style>
