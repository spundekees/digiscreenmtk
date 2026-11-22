<template>
	<JsPanel class="panneau" :visible="!chargement" :options="options">
		<div class="conteneur-gauche" />
		<div class="conteneur panneau-humeur">
			<div class="contenu" v-if="mode === 'edition'">
				<label :for="'liste_personnes_' + id">{{ $t('listePersonnes') }}</label>
				<span :id="'consigne_' + id" class="consigne" v-html="$t('consigneGroupe')" />
				<textarea :id="'liste_personnes_' + id" :aria-describedby="'consigne_' + id" class="humeur" :value="texte" @input="texte = $event.target.value" :placeholder="$t('exempleGroupe')"></textarea>
				<label :id="'groupe_colonnes_' + id" class="libelle-option">{{ $t('nombreColonnes') }}</label>
				<div class="choix" role="radiogroup" :aria-labelledby="'groupe_colonnes_' + id">
					<span class="oui" v-for="nombre in [3, 4, 5]" :key="'nombre_' + nombre">
						<input :id="'colonnes_' + nombre + '_' + id" type="radio" :name="'colonnes_' + id" :value="nombre" :checked="nombreColonnes === nombre" @change="nombreColonnes = nombre">
						<label :for="'colonnes_' + nombre + '_' + id">{{ nombre }}</label>
					</span>
				</div>
				<div class="colonnes-edition">
					<div class="colonne-edition" role="group" :aria-labelledby="'titre_colonne_' + index + '_' + id" v-for="(colonne, index) in colonnesAffichees" :key="'colonne_edition_' + index">
						<span :id="'titre_colonne_' + index + '_' + id" class="titre">{{ $t('colonne') }} {{ index + 1 }}</span>
						<div class="humeurs" role="radiogroup" :aria-label="$t('humeurColonne', { numero: index + 1 })">
							<button type="button" role="radio" :aria-checked="colonne.humeur === humeur" :class="{'selectionne': colonne.humeur === humeur}" :title="$t(humeurs[humeur])" :aria-label="$t(humeurs[humeur])" @click="colonne.humeur = humeur" v-for="humeur in Object.keys(humeurs)" :key="'humeur_' + index + '_' + humeur"><img :src="$recupererRessource('./static/img/humeurs/' + humeur + '.svg')" alt=""></button>
						</div>
						<input type="text" :value="colonne.libelle" :aria-label="$t('libelleColonne', { numero: index + 1 })" :placeholder="$t(humeurs[colonne.humeur])" @input="colonne.libelle = $event.target.value">
					</div>
				</div>
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
					<span role="button" class="bouton-secondaire" tabindex="0" :title="$t('televerserFichierTxt')" :aria-label="$t('televerserFichierTxt')" @keydown.enter.space.prevent="activerInput('selectionner_txt_' + id)" @click="activerInput('selectionner_txt_' + id)"><i class="material-icons" aria-hidden="true">upload_file</i></span>
					<input :id="'selectionner_txt_' + id" type="file" @change="televerserTxt" style="display: none" accept=".txt">
					<button type="button" class="bouton" @click="generer">{{ $t('valider') }}</button>
				</div>
			</div>
			<div class="contenu lecture" :class="{'plein-ecran': statut === 'max', 'etiquettes-bas': etiquettesBas === 'oui'}" v-else>
				<div class="reserve" role="group" :aria-label="$t('aPlacer')">
					<draggable v-model="zones[0]" :group="'humeur_' + id" tag="ul" class="etiquettes" filter=".deplacer" :prevent-on-filter="false" @change="modifierZone">
						<li v-for="(personne, index) in zones[0]" :key="'reserve_' + personne + '_' + index">
							<span>{{ personne }}</span>
							<span class="deplacements" v-if="fleches === 'oui'">
								<button type="button" class="deplacer apres" :title="$t('colonneSuivante')" :aria-label="$t('libelleCible', { action: $t('colonneSuivante'), cible: personne })" @click="deplacerEtiquette(0, index, 1)"><i class="material-icons" aria-hidden="true">{{ etiquettesBas === 'oui' ? 'arrow_upward' : 'arrow_downward' }}</i></button>
							</span>
						</li>
					</draggable>
				</div>
				<div class="colonnes">
					<div class="colonne" role="group" :aria-label="nomsZones[index + 1]" v-for="(colonne, index) in colonnesAffichees" :key="'colonne_' + index">
						<div class="en-tete">
							<img :src="$recupererRessource('./static/img/humeurs/' + colonne.humeur + '.svg')" alt="">
							<span>{{ nomsZones[index + 1] }}</span>
						</div>
						<draggable v-model="zones[index + 1]" :group="'humeur_' + id" tag="ul" class="etiquettes" filter=".deplacer" :prevent-on-filter="false" @change="modifierZone">
							<li v-for="(personne, indexPersonne) in zones[index + 1]" :key="'colonne_' + index + '_' + personne + '_' + indexPersonne">
								<span>{{ personne }}</span>
								<span class="deplacements" v-if="fleches === 'oui'">
									<button type="button" class="deplacer avant" :title="index === 0 ? $t('aPlacer') : $t('colonnePrecedente')" :aria-label="$t('libelleCible', { action: index === 0 ? $t('aPlacer') : $t('colonnePrecedente'), cible: personne })" @click="deplacerEtiquette(index + 1, indexPersonne, -1)"><i class="material-icons" aria-hidden="true">{{ index === 0 ? (etiquettesBas === 'oui' ? 'arrow_downward' : 'arrow_upward') : 'arrow_back' }}</i></button>
									<button type="button" class="deplacer apres" :disabled="index === colonnesAffichees.length - 1" :title="$t('colonneSuivante')" :aria-label="$t('libelleCible', { action: $t('colonneSuivante'), cible: personne })" @click="deplacerEtiquette(index + 1, indexPersonne, 1)"><i class="material-icons" aria-hidden="true">arrow_forward</i></button>
								</span>
							</li>
						</draggable>
					</div>
				</div>
				<button type="button" class="bouton" @click="reinitialiser">{{ $t('reinitialiser') }}</button>
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

const humeurs = {
	'soleil': 'humeurSoleil',
	'soleil-nuage': 'humeurEclaircies',
	'nuage': 'humeurNuage',
	'pluie': 'humeurPluie',
	'orage': 'humeurOrage',
	'tres-content': 'humeurTresBien',
	'content': 'humeurBien',
	'neutre': 'humeurMoyen',
	'triste': 'humeurPasBien',
	'en-pleurs': 'humeurTriste',
	'en-colere': 'humeurColere',
	'fatigue': 'humeurFatigue'
}

export default {
	name: 'PHumeur',
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
			minw: 40,
			minh: 30,
			statut: '',
			dimensions: {},
			position: {},
			donnees: { w: 0, h: 0, x: 0, y: 0 },
			humeurs: humeurs,
			texte: '',
			nombreColonnes: 4,
			colonnes: [{ humeur: 'soleil', libelle: '' }, { humeur: 'soleil-nuage', libelle: '' }, { humeur: 'pluie', libelle: '' }, { humeur: 'orage', libelle: '' }, { humeur: 'nuage', libelle: '' }],
			fleches: 'non',
			etiquettesBas: 'non',
			zones: [[]]
		}
	},
	computed: {
		colonnesAffichees () {
			return this.colonnes.slice(0, this.nombreColonnes)
		},
		nomsZones () {
			return [this.$t('aPlacer')].concat(this.colonnesAffichees.map((colonne) => colonne.libelle.trim() !== '' ? colonne.libelle.trim() : this.$t(this.humeurs[colonne.humeur])))
		}
	},
	watch: {
		export (valeur) {
			if (valeur === true) {
				this.position = { x: this.x, y: this.y }
				this.$emit('export', { id: this.id, titre: this.titre, mode: this.mode, statut: this.statut, dimensions: this.dimensions, position: this.position, contenu: { texte: this.texte, nombreColonnes: this.nombreColonnes, colonnes: this.colonnes, fleches: this.fleches, etiquettesBas: this.etiquettesBas, zones: this.zones }, w: this.w, h: this.h, x: this.x, y: this.y })
			}
		}
	},
	created () {
		this.definirCaracteristiques('meteoHumeur')
		if (this.panneau.contenu !== '') {
			this.texte = this.panneau.contenu.texte
			this.nombreColonnes = this.panneau.contenu.nombreColonnes
			this.colonnes = this.panneau.contenu.colonnes
			if (this.colonnes.length < 5) {
				this.colonnes.push({ humeur: 'nuage', libelle: '' })
			}
			this.fleches = this.panneau.contenu.fleches || 'non'
			this.etiquettesBas = this.panneau.contenu.etiquettesBas || 'non'
			this.zones = this.panneau.contenu.zones
		}
		if (this.mode === 'lecture') {
			this.redimensionnement = true
		}
		this.genererOptions('humeur')
	},
	mounted () {
		this.initialiser()
		this.positionner()
		this.chargement = false
		if (this.mode === 'edition' && this.statut !== 'min' && this.texte === '') {
			setTimeout(() => {
				document.querySelector('#' + this.id + ' textarea')?.focus()
			}, 0)
		}
	},
	methods: {
		generer () {
			const liste = this.texte.split(',').map(item => item.trim()).filter(item => item !== '')
			if (liste.length === 0) return
			const restantes = [...liste]
			const zones = [[]]
			for (let i = 1; i <= this.nombreColonnes; i++) {
				const zone = []
				const anciennes = this.zones[i] || []
				anciennes.forEach((personne) => {
					const index = restantes.indexOf(personne)
					if (index > -1) {
						zone.push(personne)
						restantes.splice(index, 1)
					}
				})
				zones.push(zone)
			}
			zones[0] = restantes
			this.zones = zones
			this.mode = 'lecture'
			this.redimensionnement = true
			if (this.donnees.w > 0 && this.donnees.h > 0) {
				this.w = this.donnees.w
				this.h = this.donnees.h
			} else {
				this.w = this.nombreColonnes > 4 ? 96 : 80
				this.h = 56
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
		editer () {
			this.mode = 'edition'
			this.redimensionnement = false
			this.donnees.w = this.w
			this.donnees.h = this.h
			this.donnees.x = this.x
			this.donnees.y = this.y
			this.w = 50
			this.h = 60
			this.$nextTick(() => {
				document.querySelector('#' + this.id + ' textarea')?.focus()
			})
			this.positionner()
		},
		deplacerEtiquette (indexZone, indexPersonne, direction) {
			const cible = indexZone + direction
			if (cible < 0 || cible > this.nombreColonnes) return
			const zones = this.zones.map((zone) => [...zone])
			const personne = zones[indexZone].splice(indexPersonne, 1)[0]
			zones[cible].push(personne)
			this.zones = zones
			this.$nextTick(() => {
				const listes = this.$el.querySelectorAll('.contenu.lecture ul.etiquettes')
				const elements = listes[cible]?.querySelectorAll('li')
				const element = elements?.[elements.length - 1]
				const bouton = element?.querySelector(direction < 0 ? '.deplacer.avant' : '.deplacer.apres')
				if (bouton && !bouton.disabled) {
					bouton.focus()
				} else {
					element?.querySelector('.deplacer:not(:disabled)')?.focus()
				}
				this.annoncer(this.$t('etiquetteDeplacee', { etiquette: personne, zone: this.nomsZones[cible] }))
			})
		},
		modifierZone (event) {
			if (!event.added) return
			this.$nextTick(() => {
				const cible = this.zones.findIndex((zone) => zone.includes(event.added.element))
				if (cible > -1) {
					this.annoncer(this.$t('etiquetteDeplacee', { etiquette: event.added.element, zone: this.nomsZones[cible] }))
				}
			})
		},
		reinitialiser () {
			this.zones = [this.texte.split(',').map(item => item.trim()).filter(item => item !== '')].concat(Array.from({ length: this.nombreColonnes }, () => []))
		},
		televerserTxt (event) {
			const fichier = event.target.files[0]
			if (fichier) {
				const reader = new FileReader()
				reader.readAsText(fichier)
				reader.onloadend = (e) => {
					this.texte = e.target.result.trim()
					this.$nextTick(() => {
						document.querySelector('#' + this.id + ' textarea')?.focus()
					})
				}
			}
		}
	}
}
</script>

<style>
.panneau .conteneur textarea.humeur {
	height: 10rem;
	max-height: 10rem;
	margin-bottom: 2rem;
}

.panneau .panneau-humeur .choix {
	margin-bottom: 2rem;
}

.panneau .panneau-humeur .choix span.oui {
	margin-right: 2.5rem;
}

.panneau .panneau-humeur .choix label {
	display: inline-block;
	width: auto;
	font-size: 1.6rem;
	font-weight: 400;
	margin-left: 1rem;
	margin-bottom: 0;
}

.panneau .panneau-humeur .colonnes-edition {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
	margin-bottom: 2rem;
}

.panneau .panneau-humeur .colonne-edition {
	padding: 1.5rem;
	border: 1px solid #ddd;
	border-radius: 0.5rem;
	text-align: left;
}

.panneau .conteneur .panneau-humeur .colonne-edition span.titre,
.panneau .panneau-humeur .colonne-edition .titre {
	display: block;
	font-weight: 700;
	font-size: 1.4rem;
	margin-bottom: 1rem;
}

.panneau .panneau-humeur .humeurs {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
	margin-bottom: 1rem;
}

.panneau .panneau-humeur .humeurs button {
	width: 4.4rem;
	height: 4.4rem;
	padding: 0.3rem;
	background: #fff;
	border: 2px solid transparent;
	border-radius: 0.5rem;
	cursor: pointer;
}

.panneau .panneau-humeur .humeurs button:hover {
	border-color: #ddd;
}

.panneau .panneau-humeur .humeurs button.selectionne {
	border-color: #00ced1;
	background: #e5fafa;
}

.panneau .panneau-humeur .humeurs button img {
	width: 100%;
	height: 100%;
}

.panneau .panneau-humeur .actions {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-top: 2rem;
}

.panneau .panneau-humeur .actions .bouton {
	margin-top: 0;
	margin-left: 2rem;
	margin-right: 0;
}

.panneau .panneau-humeur .contenu.lecture {
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;
	height: 100%;
	padding: 1rem 0;
}

.panneau .panneau-humeur .reserve {
	width: 100%;
	padding: 1rem;
	border: 2px dashed #ddd;
	border-radius: 0.5rem;
	margin-bottom: 1.5rem;
}

.panneau .panneau-humeur .reserve ul.etiquettes {
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: center;
	min-height: 4.6rem;
}

.panneau .panneau-humeur .colonnes {
	display: flex;
	gap: 1.5rem;
	width: 100%;
	flex: 1;
}

.panneau .panneau-humeur .colonne {
	display: flex;
	flex-direction: column;
	flex: 1 1 0;
	min-width: 0;
	border: 1px solid #ddd;
	border-radius: 0.5rem;
	background: #fff;
}

.focus .panneau .panneau-humeur .colonne {
	background: transparent;
}

.panneau .panneau-humeur .colonne .en-tete {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 1rem;
	border-bottom: 1px solid #ddd;
	font-size: 1.8rem;
	font-weight: 700;
}

.panneau .panneau-humeur .colonne .en-tete img {
	width: 7rem;
	height: 7rem;
}

.panneau .panneau-humeur .contenu.lecture.plein-ecran .colonne .en-tete img {
	width: 10rem;
	height: 10rem;
}

.panneau .panneau-humeur ul.etiquettes {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.8rem;
	flex: 1;
	min-height: 8rem;
	padding: 1rem;
	list-style: none;
}

.panneau .panneau-humeur ul.etiquettes li {
	display: inline-flex;
	align-items: center;
	max-width: 100%;
	padding: 0.6rem 1.2rem;
	font-size: 1.8rem;
	line-height: 1.4;
	background: #e5fafa;
	border: 1px solid #00ced1;
	border-radius: 2rem;
	cursor: move;
	user-select: none;
}

.panneau .panneau-humeur .contenu.lecture.plein-ecran ul.etiquettes li {
	font-size: 2.2rem;
}

.panneau .panneau-humeur ul.etiquettes li .deplacements {
	display: inline-flex;
	gap: 0.4rem;
	margin-left: 0.8rem;
}

.panneau .panneau-humeur ul.etiquettes li .deplacer {
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

.panneau .panneau-humeur ul.etiquettes li .deplacer:disabled {
	opacity: 0.4;
	cursor: default;
}

.panneau .panneau-humeur ul.etiquettes li .deplacer i {
	font-size: 1.8rem;
}

.panneau .panneau-humeur .contenu.lecture > .bouton {
	margin-top: 1.5rem;
}
.panneau .panneau-humeur .contenu.lecture.etiquettes-bas .reserve {
	order: 1;
	margin-top: 1.5rem;
	margin-bottom: 0;
}

.panneau .panneau-humeur .contenu.lecture.etiquettes-bas > :not(.reserve, .colonnes) {
	order: 2;
}
</style>
