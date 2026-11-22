<template>
	<JsPanel class="panneau" :visible="!chargement" :options="options">
		<div class="conteneur-gauche" />
		<div class="conteneur panneau-appariement">
			<div class="contenu" v-if="mode === 'edition'">
				<label :id="'libelle_paires_' + id">{{ $t('pairesAssocier') }}</label>
				<span class="consigne">{{ $t('consigneAppariement') }}</span>
				<ol class="paires-edition" :aria-labelledby="'libelle_paires_' + id">
					<li class="paire" v-for="(paire, index) in paires" :key="paire.id">
						<span class="numero" aria-hidden="true">{{ index + 1 }}</span>
						<ItemMedia :element="paire.a" :edition="true" :identifiant="paire.id + '_a'" :libelle="$t('elementPaire', { paire: index + 1, element: 1 })" @modifier="paire.a = $event" />
						<i class="material-icons fleche" aria-hidden="true">sync_alt</i>
						<ItemMedia :element="paire.b" :edition="true" :identifiant="paire.id + '_b'" :libelle="$t('elementPaire', { paire: index + 1, element: 2 })" @modifier="paire.b = $event" />
						<button type="button" class="supprimer" :disabled="paires.length < 3" :title="$t('supprimerPaire')" :aria-label="$t('libelleCible', { action: $t('supprimerPaire'), cible: index + 1 })" @click="supprimerPaire(index)"><i class="material-icons" aria-hidden="true">highlight_off</i></button>
					</li>
				</ol>
				<button type="button" class="bouton-secondaire ajouter" :title="$t('ajouterPaire')" :aria-label="$t('ajouterPaire')" @click="ajouterPaire"><i class="material-icons" aria-hidden="true">add_circle_outline</i></button>
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
				<ul class="paires">
					<li class="paire" :class="resultats[index]" v-for="(paire, index) in pairesValides" :key="'paire_' + paire.id">
						<div class="element source">
							<ItemMedia :element="paire.a" :libelle="libelles[paire.id].a" />
						</div>
						<i class="material-icons fleche" aria-hidden="true">arrow_forward</i>
						<div class="cible" :class="{'vide': cibles[index].length === 0}">
							<draggable class="zone-cible" v-model="cibles[index]" :group="'appariement_' + id" filter=".lire, .retirer" :prevent-on-filter="false" :disabled="resultat === 'correct'" @change="modifierCible(index, $event)">
								<div class="element" v-for="item in cibles[index]" :key="'cible_' + item.id">
									<ItemMedia :element="item.b" :libelle="libelles[item.id].b" />
									<button type="button" class="retirer" :title="$t('retirer')" :aria-label="$t('libelleCible', { action: $t('retirer'), cible: libelles[item.id].b })" @click="retirer(index)" v-if="resultat !== 'correct'"><i class="material-icons" aria-hidden="true">close</i></button>
								</div>
							</draggable>
							<button type="button" class="placer" :title="$t('placerIci')" :aria-label="$t('libelleCible', { action: $t('placerIci'), cible: libelles[paire.id].a })" @click="placer(index)" v-if="selection !== '' && cibles[index].length === 0">{{ $t('placerIci') }}</button>
						</div>
						<span class="lecteur-ecran" v-if="resultats[index] === 'correct'">{{ $t('correct') }}</span>
						<span class="lecteur-ecran" v-else-if="resultats[index] === 'incorrect'">{{ $t('incorrect') }}</span>
					</li>
				</ul>
				<draggable class="reserve" :group="'appariement_' + id" v-model="reserve" filter=".lire, .choisir" :prevent-on-filter="false" :aria-label="$t('aPlacer')" role="group" v-if="resultat !== 'correct'">
					<div class="element" :class="{'selectionne': selection === item.id}" v-for="item in reserve" :key="'reserve_' + item.id">
						<ItemMedia :element="item.b" :libelle="libelles[item.id].b" />
						<button type="button" class="choisir" :aria-pressed="selection === item.id" :title="$t('selectionner')" :aria-label="$t('libelleCible', { action: $t('selectionner'), cible: libelles[item.id].b })" @click="selectionner(item.id)"><i class="material-icons" aria-hidden="true">{{ selection === item.id ? 'check_circle' : 'radio_button_unchecked' }}</i></button>
					</div>
				</draggable>
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
	name: 'PAppariement',
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
			paires: [],
			etiquettesBas: 'oui',
			cibles: [],
			reserve: [],
			selection: '',
			resultats: [],
			resultat: ''
		}
	},
	computed: {
		pairesValides () {
			return this.paires.filter((paire) => [paire.a, paire.b].every((element) => element && typeof element.valeur === 'string' && element.valeur.trim() !== ''))
		},
		libelles () {
			const libelle = (element, numero) => element.type === 'texte' ? element.valeur : this.$t(element.type) + ' ' + numero
			return Object.fromEntries(this.pairesValides.map((paire, index) => [paire.id, { a: libelle(paire.a, index + 1), b: libelle(paire.b, index + 1) }]))
		}
	},
	watch: {
		export (valeur) {
			if (valeur === true) {
				this.position = { x: this.x, y: this.y }
				this.$emit('export', { id: this.id, titre: this.titre, mode: this.mode, statut: this.statut, dimensions: this.dimensions, position: this.position, contenu: { paires: this.paires, etiquettesBas: this.etiquettesBas }, w: this.w, h: this.h, x: this.x, y: this.y })
			}
		}
	},
	created () {
		this.definirCaracteristiques('appariement')
		if (this.panneau.contenu !== '') {
			this.paires = this.panneau.contenu.paires
			this.etiquettesBas = this.panneau.contenu.etiquettesBas || 'oui'
		} else {
			this.paires = [this.creerPaire(), this.creerPaire(), this.creerPaire()]
		}
		if (this.mode === 'lecture') {
			this.redimensionnement = true
			this.creer()
		}
		this.genererOptions('appariement')
	},
	mounted () {
		this.initialiser()
		this.positionner()
		this.chargement = false
		if (this.mode === 'edition' && this.statut !== 'min') {
			setTimeout(() => {
				document.querySelector('#' + this.id + ' .paires-edition input[type="text"]')?.focus()
			}, 0)
		}
	},
	methods: {
		creerPaire () {
			return { id: this.genererId(), a: { type: 'texte', valeur: '' }, b: { type: 'texte', valeur: '' } }
		},
		ajouterPaire () {
			this.paires.push(this.creerPaire())
			this.$nextTick(() => {
				const paires = this.$el.querySelectorAll('.paires-edition .paire')
				paires[paires.length - 1]?.querySelector('input[type="text"], .types button')?.focus()
			})
		},
		supprimerPaire (index) {
			if (this.paires.length < 3) return
			this.paires.splice(index, 1)
		},
		generer () {
			if (this.pairesValides.length < 2) return
			this.mode = 'lecture'
			this.redimensionnement = true
			this.creer()
			if (this.donnees.w > 0 && this.donnees.h > 0) {
				this.w = this.donnees.w
				this.h = this.donnees.h
			} else {
				this.w = 64
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
			this.cibles = this.pairesValides.map(() => [])
			this.reserve = this.melanger(this.pairesValides.map((paire) => ({ id: paire.id, b: paire.b })))
			this.resultats = this.pairesValides.map(() => '')
			this.resultat = ''
			this.selection = ''
		},
		editer () {
			this.mode = 'edition'
			this.redimensionnement = false
			this.donnees.w = this.w
			this.donnees.h = this.h
			this.donnees.x = this.x
			this.donnees.y = this.y
			this.w = 64
			this.h = 56
			this.resultat = ''
			this.$nextTick(() => {
				document.querySelector('#' + this.id + ' .paires-edition .types button')?.focus()
			})
			this.positionner()
		},
		selectionner (id) {
			this.selection = this.selection === id ? '' : id
			if (this.selection !== '') {
				const item = this.reserve.find((element) => element.id === id)
				this.annoncer(this.$t('elementSelectionne', { element: this.libelles[item.id].b }))
			}
		},
		placer (index) {
			const indexReserve = this.reserve.findIndex((element) => element.id === this.selection)
			if (indexReserve === -1 || this.cibles[index].length > 0) return
			const item = this.reserve.splice(indexReserve, 1)[0]
			this.cibles[index] = [item]
			this.selection = ''
			this.reinitialiserResultat(index)
			this.$nextTick(() => {
				this.$el.querySelectorAll('.paires .paire')[index]?.querySelector('.retirer')?.focus()
				this.annoncer(this.$t('elementPlace', { element: this.libelles[item.id].b, cible: this.libelles[this.pairesValides[index].id].a }))
			})
		},
		modifierCible (index, event) {
			if (event.added) {
				const autres = this.cibles[index].filter((item) => item.id !== event.added.element.id)
				if (autres.length > 0) {
					this.cibles[index] = [event.added.element]
					this.reserve.push(...autres)
				}
				if (this.selection === event.added.element.id) {
					this.selection = ''
				}
				this.reinitialiserResultat(index)
			} else if (event.removed) {
				this.reinitialiserResultat(index)
			}
		},
		retirer (index) {
			const item = this.cibles[index][0]
			if (!item) return
			this.cibles[index] = []
			this.reserve.push(item)
			this.reinitialiserResultat(index)
			this.$nextTick(() => {
				this.$el.querySelector('.reserve .element:last-child .choisir')?.focus()
			})
		},
		reinitialiserResultat (index) {
			this.resultats[index] = ''
		},
		verifier () {
			let correct = 0
			this.resultats = this.pairesValides.map((paire, index) => {
				const item = this.cibles[index][0]
				if (!item) return ''
				if (item.id === paire.id) {
					correct++
					return 'correct'
				}
				return 'incorrect'
			})
			if (correct === this.pairesValides.length) {
				this.resultat = 'correct'
				this.selection = ''
				this.lancerConfettis()
				this.annoncer(this.$t('bravoExercice'))
			} else {
				this.resultat = 'incorrect'
				this.annoncer(this.$t('reponsesCorrectes', { correct: correct, total: this.pairesValides.length }))
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
.panneau .panneau-appariement .paires-edition {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	list-style: none;
	margin-bottom: 1rem;
}

.panneau .panneau-appariement .paires-edition .paire {
	display: flex;
	align-items: center;
	gap: 1rem;
	padding: 1rem;
	border: 1px solid #ddd;
	border-radius: 0.5rem;
}

.panneau .panneau-appariement .paires-edition .numero {
	flex-shrink: 0;
	width: 2rem;
	font-weight: 700;
	font-size: 1.4rem;
}

.panneau .panneau-appariement .paires-edition .fleche {
	flex-shrink: 0;
	color: #777;
	font-size: 2.2rem;
}

.panneau .panneau-appariement .paires-edition .supprimer {
	flex-shrink: 0;
	font-size: 2.2rem;
	color: #777;
	line-height: 1;
	cursor: pointer;
}

.panneau .panneau-appariement .paires-edition .supprimer:disabled {
	opacity: 0.4;
	cursor: default;
}

.panneau .panneau-appariement .bouton-secondaire.ajouter {
	display: block;
	margin: 0 auto 2rem;
}

.panneau .panneau-appariement .actions .bouton {
	margin-right: 0;
}

.panneau .panneau-appariement .contenu.lecture {
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;
	height: 100%;
	padding: 1rem 0;
}

.panneau .panneau-appariement ul.paires {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	width: 100%;
	list-style: none;
}

.panneau .panneau-appariement ul.paires .paire {
	display: flex;
	align-items: center;
	gap: 1.5rem;
	padding: 0.5rem;
	border: 2px solid transparent;
	border-radius: 0.7rem;
}

.panneau .panneau-appariement ul.paires .paire.correct {
	border-color: #00b894;
	background: #e6f8f4;
}

.panneau .panneau-appariement ul.paires .paire.incorrect {
	border-color: #ff7675;
	background: #fff0f0;
}

.panneau .panneau-appariement ul.paires .fleche {
	flex-shrink: 0;
	color: #777;
	font-size: 3rem;
}

.panneau .panneau-appariement .element {
	position: relative;
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 7rem;
	padding: 1rem 1.5rem;
	font-size: 2rem;
	background: #fff;
	border: 1px solid #ddd;
	border-radius: 0.5rem;
}

.panneau .panneau-appariement .contenu.lecture.plein-ecran .element {
	font-size: 2.6rem;
}

.panneau .panneau-appariement .element.source {
	flex: 1 1 0;
	min-width: 0;
}

.panneau .panneau-appariement .cible {
	position: relative;
	flex: 1 1 0;
	min-width: 0;
	align-self: stretch;
	border-radius: 0.5rem;
}

.panneau .panneau-appariement .cible.vide {
	border: 2px dashed #00ced1;
}

.panneau .panneau-appariement .zone-cible {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 100%;
	min-height: 7rem;
}

.panneau .panneau-appariement .cible .element {
	width: 100%;
	cursor: move;
}

.panneau .panneau-appariement .cible .placer {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	padding: 0.5rem 1rem;
	font-weight: 700;
	font-size: 1.2rem;
	text-transform: uppercase;
	color: #001d1d;
	background: #e5fafa;
	border-radius: 0.5rem;
	cursor: pointer;
}

.panneau .panneau-appariement .retirer,
.panneau .panneau-appariement .choisir {
	position: absolute;
	top: -1.1rem;
	right: -1.1rem;
	display: flex;
	justify-content: center;
	align-items: center;
	width: 2.4rem;
	height: 2.4rem;
	color: #777;
	background: #fff;
	border: 1px solid #ddd;
	border-radius: 50%;
	cursor: pointer;
}

.panneau .panneau-appariement .retirer i,
.panneau .panneau-appariement .choisir i {
	font-size: 1.8rem;
}

.panneau .panneau-appariement .reserve {
	display: flex;
	justify-content: center;
	align-items: center;
	flex-wrap: wrap;
	gap: 1.5rem;
	width: 100%;
	min-height: 9rem;
	padding: 1.5rem;
	margin-top: 2rem;
	border: 2px dashed #ddd;
	border-radius: 0.5rem;
}

.panneau .panneau-appariement .reserve .element {
	cursor: move;
}

.panneau .panneau-appariement .reserve .element .item-media img {
	max-height: 9rem;
}

.panneau .panneau-appariement .reserve .element.selectionne {
	border-color: #00ced1;
	box-shadow: 0 0 0 2px #00ced1;
}

.panneau .panneau-appariement .reserve .element.selectionne .choisir {
	color: #00898b;
	border-color: #00ced1;
}
.panneau .panneau-appariement .choix {
	margin-bottom: 2rem;
}

.panneau .panneau-appariement .choix span.oui {
	margin-right: 2.5rem;
}

.panneau .panneau-appariement .choix label {
	display: inline-block;
	width: auto;
	font-size: 1.6rem;
	font-weight: 400;
	margin-left: 1rem;
	margin-bottom: 0;
}

.panneau .panneau-appariement .contenu.lecture:not(.etiquettes-bas) .reserve {
	order: -1;
	margin-top: 0;
	margin-bottom: 2rem;
}
</style>
