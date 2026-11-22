<template>
	<JsPanel class="panneau" :visible="!chargement" :options="options">
		<div class="conteneur-gauche" />
		<div class="conteneur panneau-categories">
			<div class="contenu" v-if="mode === 'edition'">
				<label :id="'libelle_categories_' + id">{{ $t('categories') }}</label>
				<ol class="categories-edition" :aria-labelledby="'libelle_categories_' + id">
					<li v-for="(categorie, index) in categories" :key="categorie.id">
						<span class="numero" aria-hidden="true">{{ index + 1 }}</span>
						<input type="text" :value="categorie.titre" :aria-label="$t('nomCategorie', { numero: index + 1 })" :placeholder="$t('categorie') + ' ' + (index + 1)" @input="categorie.titre = $event.target.value">
						<button type="button" class="supprimer" :disabled="categories.length < 3" :title="$t('supprimerCategorie')" :aria-label="$t('libelleCible', { action: $t('supprimerCategorie'), cible: nomsCategories[index] })" @click="supprimerCategorie(index)"><i class="material-icons" aria-hidden="true">highlight_off</i></button>
					</li>
				</ol>
				<button type="button" class="bouton-secondaire ajouter" :disabled="categories.length > 5" :title="$t('ajouterCategorie')" :aria-label="$t('ajouterCategorie')" @click="ajouterCategorie"><i class="material-icons" aria-hidden="true">add_circle_outline</i></button>
				<label :id="'libelle_etiquettes_' + id">{{ $t('etiquettesClasser') }}</label>
				<span class="consigne">{{ $t('consigneCategories') }}</span>
				<ol class="etiquettes-edition" :aria-labelledby="'libelle_etiquettes_' + id">
					<li v-for="(etiquette, index) in etiquettes" :key="etiquette.id">
						<span class="numero" aria-hidden="true">{{ index + 1 }}</span>
						<ItemMedia :element="etiquette.element" :edition="true" :identifiant="etiquette.id" :libelle="$t('etiquette') + ' ' + (index + 1)" @modifier="etiquette.element = $event" />
						<select :value="etiquette.categorie" :aria-label="$t('libelleCible', { action: $t('categorie'), cible: $t('etiquette') + ' ' + (index + 1) })" @change="etiquette.categorie = $event.target.value">
							<option :value="categorie.id" v-for="(categorie, indexCategorie) in categories" :key="'option_' + etiquette.id + '_' + categorie.id">{{ nomsCategories[indexCategorie] }}</option>
						</select>
						<button type="button" class="supprimer" :disabled="etiquettes.length < 2" :title="$t('supprimerEtiquette')" :aria-label="$t('libelleCible', { action: $t('supprimerEtiquette'), cible: index + 1 })" @click="supprimerEtiquette(index)"><i class="material-icons" aria-hidden="true">highlight_off</i></button>
					</li>
				</ol>
				<button type="button" class="bouton-secondaire ajouter" :title="$t('ajouterEtiquette')" :aria-label="$t('ajouterEtiquette')" @click="ajouterEtiquette"><i class="material-icons" aria-hidden="true">add_circle_outline</i></button>
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
				<label :id="'groupe_etiquettes_bas_' + id" class="libelle-option">{{ $t('afficherEtiquettesBas') }}</label>
				<div class="choix" role="radiogroup" :aria-labelledby="'groupe_etiquettes_bas_' + id">
					<span class="oui">
						<input :id="'etiquettes_bas_oui_' + id" type="radio" :name="'etiquettes_bas_' + id" value="oui" :checked="etiquettesBas === 'oui'" @change="etiquettesBas = $event.target.value">
						<label :for="'etiquettes_bas_oui_' + id">{{ $t('oui') }}</label>
					</span>
					<span class="non">
						<input :id="'etiquettes_bas_non_' + id" type="radio" :name="'etiquettes_bas_' + id" value="non" :checked="etiquettesBas === 'non'" @change="etiquettesBas = $event.target.value">
						<label :for="'etiquettes_bas_non_' + id">{{ $t('non') }}</label>
					</span>
				</div>
				<div class="actions">
					<button type="button" class="bouton" @click="generer">{{ $t('valider') }}</button>
				</div>
			</div>
			<div class="contenu lecture" :class="{'plein-ecran': statut === 'max', 'etiquettes-bas': etiquettesBas === 'oui'}" v-else>
				<div class="reserve" role="group" :aria-label="$t('aPlacer')" v-if="resultat !== 'correct'">
					<draggable v-model="zones[0]" :group="'categories_' + id" class="etiquettes" filter=".deplacer, .lire" :prevent-on-filter="false" @change="modifierZone">
						<div class="etiquette" :class="etiquette.element.type" v-for="(etiquette, index) in zones[0]" :key="'reserve_' + etiquette.id">
							<ItemMedia :element="etiquette.element" :libelle="libellesEtiquettes[etiquette.id]" />
							<span class="deplacements" v-if="fleches === 'oui'">
								<button type="button" class="deplacer apres" :title="$t('colonneSuivante')" :aria-label="$t('libelleCible', { action: $t('colonneSuivante'), cible: libellesEtiquettes[etiquette.id] })" @click="deplacerEtiquette(0, index, 1)"><i class="material-icons" aria-hidden="true">{{ etiquettesBas === 'oui' ? 'arrow_upward' : 'arrow_downward' }}</i></button>
							</span>
						</div>
					</draggable>
				</div>
				<div class="colonnes">
					<div class="colonne" role="group" :aria-label="nomsZones[index + 1]" v-for="(categorie, index) in categoriesValides" :key="'colonne_' + categorie.id">
						<div class="en-tete">{{ nomsZones[index + 1] }}</div>
						<draggable v-model="zones[index + 1]" :group="'categories_' + id" class="etiquettes" filter=".deplacer, .lire" :prevent-on-filter="false" :disabled="resultat === 'correct'" @change="modifierZone">
							<div class="etiquette" :class="[etiquette.element.type, resultats[etiquette.id]]" v-for="(etiquette, indexEtiquette) in zones[index + 1]" :key="'colonne_' + etiquette.id">
								<ItemMedia :element="etiquette.element" :libelle="libellesEtiquettes[etiquette.id]" />
								<span class="lecteur-ecran" v-if="resultats[etiquette.id] === 'correct'">{{ $t('correct') }}</span>
								<span class="lecteur-ecran" v-else-if="resultats[etiquette.id] === 'incorrect'">{{ $t('incorrect') }}</span>
								<span class="deplacements" v-if="fleches === 'oui' && resultat !== 'correct'">
									<button type="button" class="deplacer avant" :title="index === 0 ? $t('aPlacer') : $t('colonnePrecedente')" :aria-label="$t('libelleCible', { action: index === 0 ? $t('aPlacer') : $t('colonnePrecedente'), cible: libellesEtiquettes[etiquette.id] })" @click="deplacerEtiquette(index + 1, indexEtiquette, -1)"><i class="material-icons" aria-hidden="true">{{ index === 0 ? (etiquettesBas === 'oui' ? 'arrow_downward' : 'arrow_upward') : 'arrow_back' }}</i></button>
									<button type="button" class="deplacer apres" :disabled="index === categoriesValides.length - 1" :title="$t('colonneSuivante')" :aria-label="$t('libelleCible', { action: $t('colonneSuivante'), cible: libellesEtiquettes[etiquette.id] })" @click="deplacerEtiquette(index + 1, indexEtiquette, 1)"><i class="material-icons" aria-hidden="true">arrow_forward</i></button>
								</span>
							</div>
						</draggable>
					</div>
				</div>
				<div class="resultat" v-if="resultat === 'correct'">
					<span class="emoticones">🎉🥳</span>
					<span class="bouton correct">{{ $t('bravoExercice') }}</span>
					<span class="emoticones">🥳🎉</span>
				</div>
				<div class="resultat" v-else-if="resultat === 'incorrect'">
					<span class="emoticones">🙁🙁</span>
					<button type="button" class="bouton verifier" @click="verifier">{{ $t('verifier') }}</button>
					<span class="emoticones">🙁🙁</span>
				</div>
				<div class="resultat" v-else>
					<button type="button" class="bouton verifier" @click="verifier">{{ $t('verifier') }}</button>
				</div>
			</div>
		</div>
		<div class="conteneur-droite" />
		<div class="conteneur-bas" />
	</JsPanel>
</template>

<script>
import JsPanel from '@/components/jspanel.vue'
import ItemMedia from '@/components/item-media.vue'
import { VueDraggableNext } from 'vue-draggable-next'
import Panneau from '@/panneau'

export default {
	name: 'PCategories',
	components: {
		JsPanel,
		ItemMedia,
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
			minw: 40,
			minh: 30,
			statut: '',
			dimensions: {},
			position: {},
			donnees: { w: 0, h: 0, x: 0, y: 0 },
			categories: [],
			etiquettes: [],
			fleches: 'non',
			etiquettesBas: 'non',
			categoriesValides: [],
			zones: [[]],
			resultats: {},
			resultat: ''
		}
	},
	computed: {
		libellesEtiquettes () {
			return Object.fromEntries(this.etiquettes.map((etiquette, index) => [etiquette.id, etiquette.element.type === 'texte' ? etiquette.element.valeur : this.$t(etiquette.element.type) + ' ' + (index + 1)]))
		},
		etiquettesValides () {
			return this.etiquettes.filter((etiquette) => etiquette.element && typeof etiquette.element.valeur === 'string' && etiquette.element.valeur.trim() !== '' && this.categories.some((categorie) => categorie.id === etiquette.categorie))
		},
		nomsCategories () {
			return this.categories.map((categorie, index) => categorie.titre.trim() !== '' ? categorie.titre.trim() : this.$t('categorie') + ' ' + (index + 1))
		},
		nomsZones () {
			return [this.$t('aPlacer')].concat(this.categoriesValides.map((categorie) => this.nomsCategories[this.categories.indexOf(categorie)]))
		}
	},
	watch: {
		export (valeur) {
			if (valeur === true) {
				this.position = { x: this.x, y: this.y }
				this.$emit('export', { id: this.id, titre: this.titre, mode: this.mode, statut: this.statut, dimensions: this.dimensions, position: this.position, contenu: { categories: this.categories, etiquettes: this.etiquettes, fleches: this.fleches, etiquettesBas: this.etiquettesBas }, w: this.w, h: this.h, x: this.x, y: this.y })
			}
		}
	},
	created () {
		this.definirCaracteristiques('categories')
		if (this.panneau.contenu !== '') {
			this.categories = this.panneau.contenu.categories
			this.etiquettes = this.panneau.contenu.etiquettes
			this.fleches = this.panneau.contenu.fleches || 'non'
			this.etiquettesBas = this.panneau.contenu.etiquettesBas || 'non'
		} else {
			this.categories = [{ id: this.genererId(), titre: '' }, { id: this.genererId(), titre: '' }]
			this.etiquettes = [this.creerEtiquette(), this.creerEtiquette()]
		}
		if (this.mode === 'lecture') {
			this.redimensionnement = true
			this.creer()
		}
		this.genererOptions('categories')
	},
	mounted () {
		this.initialiser()
		this.positionner()
		this.chargement = false
		if (this.mode === 'edition' && this.statut !== 'min') {
			setTimeout(() => {
				document.querySelector('#' + this.id + ' .categories-edition input')?.focus()
			}, 0)
		}
	},
	methods: {
		creerEtiquette () {
			const categorie = this.categories.length > 0 ? this.categories[0].id : ''
			return { id: this.genererId(), element: { type: 'texte', valeur: '' }, categorie: categorie }
		},
		ajouterCategorie () {
			if (this.categories.length > 5) return
			this.categories.push({ id: this.genererId(), titre: '' })
			this.$nextTick(() => {
				const champs = this.$el.querySelectorAll('.categories-edition input')
				champs[champs.length - 1]?.focus()
			})
		},
		supprimerCategorie (index) {
			if (this.categories.length < 3) return
			const id = this.categories[index].id
			this.categories.splice(index, 1)
			this.etiquettes.forEach((etiquette) => {
				if (etiquette.categorie === id) {
					etiquette.categorie = this.categories[0].id
				}
			})
		},
		ajouterEtiquette () {
			this.etiquettes.push(this.creerEtiquette())
			this.$nextTick(() => {
				const etiquettes = this.$el.querySelectorAll('.etiquettes-edition li')
				etiquettes[etiquettes.length - 1]?.querySelector('input[type="text"], .types button')?.focus()
			})
		},
		supprimerEtiquette (index) {
			if (this.etiquettes.length < 2) return
			this.etiquettes.splice(index, 1)
		},
		generer () {
			if (this.categories.length < 2 || this.etiquettesValides.length === 0) return
			this.mode = 'lecture'
			this.redimensionnement = true
			this.creer()
			if (this.donnees.w > 0 && this.donnees.h > 0) {
				this.w = this.donnees.w
				this.h = this.donnees.h
			} else {
				this.w = 80
				this.h = 60
			}
			if (this.donnees.x > 0 && this.donnees.y > 0) {
				this.x = this.donnees.x
				this.y = this.donnees.y
			}
			this.$nextTick(() => {
				document.querySelector('#' + this.id)?.focus()
			})
			this.positionner()
		},
		creer () {
			this.categoriesValides = [...this.categories]
			this.zones = [this.melanger([...this.etiquettesValides])].concat(this.categoriesValides.map(() => []))
			this.resultats = {}
			this.resultat = ''
		},
		editer () {
			this.mode = 'edition'
			this.redimensionnement = false
			this.donnees.w = this.w
			this.donnees.h = this.h
			this.donnees.x = this.x
			this.donnees.y = this.y
			this.w = 64
			this.h = 70
			this.resultat = ''
			this.$nextTick(() => {
				document.querySelector('#' + this.id + ' .categories-edition input')?.focus()
			})
			this.positionner()
		},
		deplacerEtiquette (indexZone, indexEtiquette, direction) {
			const cible = indexZone + direction
			if (cible < 0 || cible > this.categoriesValides.length) return
			const zones = this.zones.map((zone) => [...zone])
			const etiquette = zones[indexZone].splice(indexEtiquette, 1)[0]
			zones[cible].push(etiquette)
			this.zones = zones
			delete this.resultats[etiquette.id]
			this.$nextTick(() => {
				const listes = this.$el.querySelectorAll('.contenu.lecture .etiquettes')
				const elements = listes[cible]?.querySelectorAll('.etiquette')
				const element = elements?.[elements.length - 1]
				const bouton = element?.querySelector(direction < 0 ? '.deplacer.avant' : '.deplacer.apres')
				if (bouton && !bouton.disabled) {
					bouton.focus()
				} else {
					element?.querySelector('.deplacer:not(:disabled)')?.focus()
				}
				this.annoncer(this.$t('etiquetteDeplacee', { etiquette: this.libellesEtiquettes[etiquette.id], zone: this.nomsZones[cible] }))
			})
		},
		modifierZone (event) {
			if (!event.added) return
			const etiquette = event.added.element
			delete this.resultats[etiquette.id]
			this.$nextTick(() => {
				const cible = this.zones.findIndex((zone) => zone.includes(etiquette))
				if (cible > -1) {
					this.annoncer(this.$t('etiquetteDeplacee', { etiquette: this.libellesEtiquettes[etiquette.id], zone: this.nomsZones[cible] }))
				}
			})
		},
		verifier () {
			const resultats = {}
			let correct = 0
			let total = this.zones[0].length
			this.categoriesValides.forEach((categorie, index) => {
				this.zones[index + 1].forEach((etiquette) => {
					total++
					if (etiquette.categorie === categorie.id) {
						resultats[etiquette.id] = 'correct'
						correct++
					} else {
						resultats[etiquette.id] = 'incorrect'
					}
				})
			})
			this.resultats = resultats
			if (correct === total) {
				this.resultat = 'correct'
				this.lancerConfettis()
				this.annoncer(this.$t('bravoExercice'))
			} else {
				this.resultat = 'incorrect'
				this.annoncer(this.$t('reponsesCorrectes', { correct: correct, total: total }))
			}
		},
		genererId () {
			let id = ''
			const caracteres = 'abcdefghijklmnopqrstuvwxyz0123456789'
			for (let i = 0; i < 8; i++) {
				id += caracteres.charAt(Math.floor(Math.random() * 36))
			}
			return id
		}
	}
}
</script>

<style>
.panneau .panneau-categories .categories-edition,
.panneau .panneau-categories .etiquettes-edition {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	list-style: none;
	margin-bottom: 1rem;
}

.panneau .panneau-categories .categories-edition li,
.panneau .panneau-categories .etiquettes-edition li {
	display: flex;
	align-items: center;
	gap: 1rem;
}

.panneau .panneau-categories .etiquettes-edition li {
	padding: 1rem;
	border: 1px solid #ddd;
	border-radius: 0.5rem;
}

.panneau .panneau-categories .categories-edition input {
	margin: 0;
}

.panneau .panneau-categories .etiquettes-edition select {
	flex-shrink: 0;
	width: 16rem;
	margin: 0;
}

.panneau .panneau-categories .numero {
	flex-shrink: 0;
	width: 2rem;
	font-weight: 700;
	font-size: 1.4rem;
}

.panneau .panneau-categories .supprimer {
	flex-shrink: 0;
	font-size: 2.2rem;
	color: #777;
	line-height: 1;
	cursor: pointer;
}

.panneau .panneau-categories .supprimer:disabled,
.panneau .panneau-categories .bouton-secondaire:disabled {
	opacity: 0.4;
	cursor: default;
}

.panneau .panneau-categories .bouton-secondaire.ajouter {
	display: block;
	margin: 0 auto 2rem;
}

.panneau .panneau-categories .choix {
	margin-bottom: 2rem;
}

.panneau .panneau-categories .choix span.oui {
	margin-right: 2.5rem;
}

.panneau .panneau-categories .choix label {
	display: inline-block;
	width: auto;
	font-size: 1.6rem;
	font-weight: 400;
	margin-left: 1rem;
	margin-bottom: 0;
}

.panneau .panneau-categories .actions .bouton {
	margin-top: 0;
	margin-right: 0;
}

.panneau .panneau-categories .contenu.lecture {
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;
	height: 100%;
	padding: 1rem 0;
}

.panneau .panneau-categories .reserve {
	width: 100%;
	padding: 1rem;
	border: 2px dashed #ddd;
	border-radius: 0.5rem;
	margin-bottom: 1.5rem;
}

.panneau .panneau-categories .reserve .etiquettes {
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: center;
	min-height: 6rem;
}

.panneau .panneau-categories .colonnes {
	display: flex;
	gap: 1.5rem;
	width: 100%;
	flex: 1;
}

.panneau .panneau-categories .colonne {
	display: flex;
	flex-direction: column;
	flex: 1 1 0;
	min-width: 0;
	border: 1px solid #ddd;
	border-radius: 0.5rem;
	background: #fff;
}

.panneau .panneau-categories .colonne .en-tete {
	padding: 1.2rem 1rem;
	border-bottom: 1px solid #ddd;
	font-size: 2rem;
	font-weight: 700;
	line-height: 1.3;
	word-break: break-word;
}

.panneau .panneau-categories .contenu.lecture.plein-ecran .colonne .en-tete {
	font-size: 2.4rem;
}

.panneau .panneau-categories .etiquettes {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1rem;
	flex: 1;
	min-height: 10rem;
	padding: 1rem;
}

.panneau .panneau-categories .etiquette {
	display: inline-flex;
	align-items: center;
	gap: 0.8rem;
	max-width: 100%;
	padding: 0.8rem 1.2rem;
	font-size: 1.8rem;
	background: #e5fafa;
	border: 2px solid #00ced1;
	border-radius: 0.5rem;
	cursor: move;
	user-select: none;
}

.panneau .panneau-categories .contenu.lecture.plein-ecran .etiquette {
	font-size: 2.2rem;
}

.panneau .panneau-categories .etiquette.image {
	background: #fff;
}

.panneau .panneau-categories .etiquette .item-media img {
	max-height: 9rem;
}

.panneau .panneau-categories .etiquette .item-media .lire {
	width: 4.4rem;
	height: 4.4rem;
}

.panneau .panneau-categories .etiquette .item-media .lire i {
	font-size: 2.8rem;
}

.panneau .panneau-categories .etiquette.correct {
	border-color: #00b894;
	background: #e6f8f4;
}

.panneau .panneau-categories .etiquette.incorrect {
	border-color: #ff7675;
	background: #fff0f0;
}

.panneau .panneau-categories .etiquette .deplacements {
	display: inline-flex;
	gap: 0.4rem;
}

.panneau .panneau-categories .etiquette .deplacer {
	display: inline-flex;
	justify-content: center;
	align-items: center;
	width: 2.6rem;
	height: 2.6rem;
	color: #001d1d;
	background: #fff;
	border: 1px solid #ddd;
	border-radius: 50%;
	cursor: pointer;
}

.panneau .panneau-categories .etiquette .deplacer:disabled {
	opacity: 0.4;
	cursor: default;
}

.panneau .panneau-categories .etiquette .deplacer i {
	font-size: 1.8rem;
}
.panneau .panneau-categories .contenu.lecture.etiquettes-bas .reserve {
	order: 1;
	margin-top: 1.5rem;
	margin-bottom: 0;
}

.panneau .panneau-categories .contenu.lecture.etiquettes-bas > :not(.reserve, .colonnes) {
	order: 2;
}
</style>
