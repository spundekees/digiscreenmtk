<template>
	<JsPanel class="panneau" :visible="!chargement" :options="options">
		<div class="conteneur-gauche" />
		<div class="conteneur panneau-tableau">
			<div class="contenu edition" v-if="mode === 'edition'">
				<label :for="'lignes_' + id">{{ $t('lignes') }}</label>
				<input :id="'lignes_' + id" type="number" class="lignes" :value="lignes" :min="1" :max="100" @input="lignes = $event.target.value">
				<label :id="'libelle-tableau-1_' + id">{{ $t('colonnes') }}</label>
				<draggable role="group" :aria-labelledby="'libelle-tableau-1_' + id" class="colonnes" v-model="colonnes" handle=".numero, .poignee" @sort="definirTableau">
					<div class="colonne" v-for="(colonne, index) in colonnes" :key="'colonne_' + index">
						<div>
							<span class="poignee"><i class="material-icons" aria-hidden="true">drag_handle</i></span>
							<span class="numero">{{ index + 1 }}. </span>
							<button type="button" class="deplacer avant" :disabled="index === 0" :title="$t('deplacerAvant')" :aria-label="$t('libelleCible', { action: $t('deplacerAvant'), cible: $t('colonnes') + ' ' + (index + 1) })" @click="deplacerColonne(index, -1)"><i class="material-icons" aria-hidden="true">arrow_upward</i></button>
							<button type="button" class="deplacer apres" :disabled="index === colonnes.length - 1" :title="$t('deplacerApres')" :aria-label="$t('libelleCible', { action: $t('deplacerApres'), cible: $t('colonnes') + ' ' + (index + 1) })" @click="deplacerColonne(index, 1)"><i class="material-icons" aria-hidden="true">arrow_downward</i></button>
							<input type="text" :aria-label="$t('titreColonne') + ' ' + (index + 1)" :placeholder="$t('titreColonne')" :value="colonnes[index].title" @input="colonnes[index].title = $event.target.value">
							<select :aria-label="$t('formatColonne') + ' ' + (index + 1)" @change="definirDonneesColonne($event.target.value, index)">
								<option v-for="(format, indexFormat) in formats" :selected="colonnes[index].formatter === format" :value="format" :key="'format_' + indexFormat">{{ $t(format) }}</option>
							</select>
						</div>
						<textarea :aria-label="$t('listeMots') + ' (' + $t('colonnes') + ' ' + (index + 1) + ')'" :value="listes[colonnes[index].field]" @input="listes[colonnes[index].field] = $event.target.value" :placeholder="$t('listeMots')" v-if="colonnes[index].formatter === 'list'"></textarea>
					</div>
				</draggable>
				<div class="boutons">
					<button type="button" class="bouton-secondaire" :title="$t('supprimerColonne')" :aria-label="$t('supprimerColonne')" @click="supprimerColonne" v-if="colonnes.length > 1"><i class="material-icons" aria-hidden="true">remove_circle_outline</i></button>
					<button type="button" class="bouton-secondaire" :title="$t('ajouterColonne')" :aria-label="$t('ajouterColonne')" @click="ajouterColonne"><i class="material-icons" aria-hidden="true">add_circle_outline</i></button>
				</div>
				<div class="actions">
					<button type="button" class="bouton" @click="generer">{{ $t('valider') }}</button>
				</div>
			</div>
			<div class="contenu" v-else>
				<div :id="'tableau_' + id" :style="{'font-size': convertirRem(taille) + 'px'}" />
				<div class="boutons">
					<button type="button" class="bouton-secondaire" :title="$t('supprimerLigne')" :aria-label="$t('supprimerLigne')" @click="supprimerLigne" v-if="tableau.length > 1"><i class="material-icons" aria-hidden="true">remove_circle_outline</i></button>
					<button type="button" class="bouton-secondaire" :title="$t('ajouterLigne')" :aria-label="$t('ajouterLigne')" @click="ajouterLigne"><i class="material-icons" aria-hidden="true">add_circle_outline</i></button>
				</div>
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
import { TabulatorFull as Tabulator } from 'tabulator-tables'

export default {
	name: 'PTableau',
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
			minh: 45,
			statut: '',
			dimensions: {},
			position: {},
			donnees: { w: 0, h: 0, x: 0, y: 0 },
			tabulator: '',
			tableau: [],
			colonnes: [{ title: '', field: 'colonne0', formatter: 'plaintext', editor: true, vertAlign: 'middle' }, { title: '', field: 'colonne1', formatter: 'plaintext', editor: true, vertAlign: 'middle' }, { title: '', field: 'colonne2', formatter: 'plaintext', editor: true, vertAlign: 'middle' }],
			formats: ['rownum', 'plaintext', 'textarea', 'html', 'list', 'link', 'color', 'star', 'progress', 'tickCross'],
			listes: {},
			lignes: 8,
			taille: 1.8
		}
	},
	watch: {
		export (valeur) {
			if (valeur === true) {
				this.position = { x: this.x, y: this.y }
				this.$emit('export', { id: this.id, titre: this.titre, mode: this.mode, statut: this.statut, dimensions: this.dimensions, position: this.position, contenu: { tableau: this.tableau, colonnes: this.colonnes, listes: this.listes, lignes: this.lignes, taille: this.taille }, w: this.w, h: this.h, x: this.x, y: this.y })
			}
		}
	},
	created () {
		this.definirCaracteristiques('tableau')
		if (this.panneau.contenu !== '') {
			this.tableau = this.panneau.contenu.tableau
			this.colonnes = this.panneau.contenu.colonnes
			this.listes = this.panneau.contenu.listes
			this.lignes = this.panneau.contenu.lignes
			this.taille = this.panneau.contenu.taille
			this.donnees.w = this.panneau.w
			this.donnees.h = this.panneau.h
			this.donnees.x = this.panneau.x
			this.donnees.y = this.panneau.y
		}
		this.genererOptions('tableau')
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
			this.$nextTick(() => {
				this.generer()
			})
		}
	},
	methods: {
		generer () {
			if (this.colonnes.length > 0 && this.lignes > 0) {
				this.colonnes.forEach((colonne, index) => {
					if (colonne.formatter === 'list' && this.listes.hasOwnProperty(colonne.field) && this.listes[colonne.field] !== '') {
						let liste = this.listes[colonne.field].split(',').map(item => item.trim())
						liste = liste.filter(item => item !== '')
						const donneesListe = {}
						liste.forEach((item) => {
							donneesListe[item.toLowerCase()] = item
						})
						this.colonnes[index].editorParams = { values: donneesListe }
					}
				})
				if (this.tableau.length === 0) {
					for (let i = 0; i < this.lignes; i++) {
						this.ajouterLigne()
					}
				} else if (this.tableau.length > 0 && this.tableau.length < this.lignes) {
					this.tableau = JSON.parse(JSON.stringify(this.tableau))
					for (let i = 0; i < (this.lignes - (this.tableau.length - 1)); i++) {
						this.ajouterLigne()
					}
				} else if (this.tableau.length > 0 && this.tableau.length > this.lignes) {
					this.tableau = JSON.parse(JSON.stringify(this.tableau))
					this.tableau.splice(this.tableau.length - (this.tableau.length - this.lignes), (this.tableau.length - this.lignes))
				}
				this.mode = 'lecture'
				this.redimensionnement = true
				this.$nextTick(() => {
					this.tabulator = new Tabulator('#tableau_' + this.id, {
						layout: 'fitColumns',
						resizableRows: true,
						addRowPos: 'bottom',
						history: true,
						data: this.tableau,
						reactiveData: true,
						columns: this.colonnes
					})
				})
				if (this.donnees.w > 0 && this.donnees.h > 0) {
					this.w = this.donnees.w
					this.h = this.donnees.h
				} else {
					this.w = 70
					this.h = 45
				}
				if (this.donnees.x > 0 && this.donnees.y > 0) {
					this.x = this.donnees.x
					this.y = this.donnees.y
				}
				this.minw = 30
				this.minh = 20
				setTimeout(() => {
					document.querySelector('#' + this.id)?.focus()
				}, 0)
				this.positionner()
			}
		},
		editer () {
			if (this.tabulator !== '') {
				const donneesTableau = this.tableau
				const donneesColonnes = this.colonnes
				this.tabulator.clearData()
				this.tabulator.destroy()
				this.tableau = donneesTableau
				this.colonnes = donneesColonnes
			}
			this.mode = 'edition'
			this.redimensionnement = false
			this.donnees.w = this.w
			this.donnees.h = this.h
			this.donnees.x = this.x
			this.donnees.y = this.y
			this.w = 60
			this.h = 45
			this.minw = 60
			this.minh = 45
			this.$nextTick(() => {
				document.querySelector('#' + this.id + ' input')?.focus()
			})
			this.positionner()
		},
		ajouterColonne () {
			const index = this.colonnes.length
			this.colonnes.push({ title: '', field: 'colonne' + index, formatter: 'plaintext', editor: true, vertAlign: 'middle' })
			this.tableau.forEach((ligne) => {
				ligne['colonne' + index] = ''
			})
		},
		supprimerColonne () {
			this.colonnes.pop()
			this.tableau.forEach((ligne) => {
				const cles = Object.keys(ligne)
				delete ligne[cles[cles.length - 1]]
			})
		},
		ajouterLigne () {
			const donneesLigne = {}
			this.colonnes.forEach((colonne) => {
				switch (colonne.formatter) {
				case 'star':
					donneesLigne[colonne.field] = 0
					break
				case 'progress':
					donneesLigne[colonne.field] = 20
					break
				case 'color':
					donneesLigne[colonne.field] = 'red'
					break
				default:
					donneesLigne[colonne.field] = ''
				}
			})
			this.tableau.push(donneesLigne)
			if (this.mode === 'lecture') {
				this.lignes++
			}
		},
		supprimerLigne () {
			this.tableau.pop()
			if (this.mode === 'lecture') {
				this.lignes--
			}
		},
		definirDonneesColonne (format, index) {
			if (this.colonnes[index].hasOwnProperty('formatterParams')) {
				delete this.colonnes[index].formatterParams
			}
			if (this.colonnes[index].hasOwnProperty('width')) {
				delete this.colonnes[index].width
			}
			if (this.colonnes[index].hasOwnProperty('minWidth')) {
				delete this.colonnes[index].minWidth
			}
			if (this.colonnes[index].hasOwnProperty('sorter')) {
				delete this.colonnes[index].sorter
			}
			if (this.colonnes[index].hasOwnProperty('hozAlign')) {
				delete this.colonnes[index].hozAlign
			}
			switch (format) {
			case 'rownum':
				this.colonnes[index].formatter = format
				this.colonnes[index].editor = false
				this.colonnes[index].width = 70
				this.colonnes[index].hozAlign = 'center'
				break
			case 'link':
				this.colonnes[index].formatter = format
				this.colonnes[index].editor = true
				this.colonnes[index].formatterParams = { urlPrefix: '', target: '_blank' }
				break
			case 'list':
				this.colonnes[index].formatter = format
				this.colonnes[index].editor = 'list'
				break
			case 'star':
				this.colonnes[index].formatter = format
				this.colonnes[index].editor = true
				this.colonnes[index].formatterParams = { stars: 5 }
				this.colonnes[index].minWidth = 130
				this.colonnes[index].hozAlign = 'center'
				break
			case 'progress':
				this.colonnes[index].formatter = format
				this.colonnes[index].editor = true
				this.colonnes[index].formatterParams = { min: 0, max: 100, color: '#00ced1' }
				this.colonnes[index].sorter = 'number'
				break
			case 'color':
				this.colonnes[index].formatter = format
				this.colonnes[index].editor = 'list'
				this.colonnes[index].editorParams = { values: { red: this.$t('rouge'), orange: this.$t('orange'), green: this.$t('vert'), blue: this.$t('bleu'), yellow: this.$t('jaune'), purple: this.$t('pourpre'), turquoise: this.$t('turquoise'), black: this.$t('noir'), grey: this.$t('gris'), white: this.$t('blanc') } }
				this.colonnes[index].width = 70
				this.colonnes[index].hozAlign = 'center'
				break
			case 'tickCross':
				this.colonnes[index].formatter = format
				this.colonnes[index].editor = true
				this.colonnes[index].formatterParams = { allowEmpty: true, allowTruthy: false, tickElement: '<i class="material-icons" aria-hidden="true">done</i>', crossElement: '<i class="material-icons" aria-hidden="true">close</i>' }
				this.colonnes[index].width = 70
				this.colonnes[index].hozAlign = 'center'
				break
			default:
				this.colonnes[index].formatter = format
				this.colonnes[index].editor = true
			}
			this.tableau.forEach((ligne) => {
				if (ligne.hasOwnProperty('colonne' + index)) {
					switch (format) {
					case 'star':
						ligne['colonne' + index] = 0
						break
					case 'progress':
						ligne['colonne' + index] = 20
						break
					case 'color':
						ligne['colonne' + index] = 'red'
						break
					default:
						ligne['colonne' + index] = ''
					}
				}
			})
		},
		deplacerColonne (index, direction) {
			const cible = index + direction
			if (cible < 0 || cible > this.colonnes.length - 1) return
			const colonnes = [...this.colonnes]
			const colonne = colonnes.splice(index, 1)[0]
			colonnes.splice(cible, 0, colonne)
			this.colonnes = colonnes
			this.definirTableau()
			this.$nextTick(() => {
				const element = this.$el.querySelectorAll('.colonnes .colonne')[cible]
				const bouton = element?.querySelector(direction < 0 ? '.deplacer.avant' : '.deplacer.apres')
				if (bouton && !bouton.disabled) {
					bouton.focus()
				} else {
					element?.querySelector('.deplacer:not(:disabled)')?.focus()
				}
				this.annoncer(this.$t('elementDeplace', { position: cible + 1 }))
			})
		},
		definirTableau () {
			const ordreColonnes = []
			this.colonnes.forEach((colonne) => {
				ordreColonnes.push(colonne.field)
			})
			this.tableau.forEach((ligne) => {
				const nouvelleLigne = {}
				ordreColonnes.forEach((colonne) => {
					if (ligne.hasOwnProperty(colonne)) {
						nouvelleLigne[colonne] = ligne[colonne]
					}
				})
				if (Object.keys(nouvelleLigne).length > 0) {
					ligne = nouvelleLigne
				}
			})
		},
		augmenterTaille () {
			if (this.taille < 2.7) {
				this.taille = this.taille + 0.1
			}
		},
		reduireTaille () {
			if (this.taille > 1.4) {
				this.taille = this.taille - 0.1
			}
		},
		annulerTaille () {
			this.taille = 1.8
		}
	}
}
</script>

<style>
.panneau .panneau-tableau input.lignes {
	margin-bottom: 2rem;
}

.panneau .panneau-tableau .colonne {
	margin-bottom: 1rem;
}

.panneau .panneau-tableau .colonne div {
	display: flex;
	justify-content: flex-start;
	align-items: center;
}

.panneau .panneau-tableau .numero,
.panneau .panneau-tableau .poignee {
	cursor: move;
}

.panneau .panneau-tableau .colonne .deplacer {
	display: inline-flex;
	justify-content: center;
	align-items: center;
	width: 2.8rem;
	height: 2.8rem;
	min-width: 24px;
	min-height: 24px;
	margin-right: 0.5rem;
	color: #001d1d;
	background: #fff;
	border: 1px solid #ddd;
	border-radius: 50%;
	flex-shrink: 0;
	cursor: pointer;
}

.panneau .panneau-tableau .poignee {
	font-size: 24px;
	text-align: left;
	width: 3.2rem;
	flex-shrink: 0;
	margin-right: 0;
}

.panneau .panneau-tableau .colonne .deplacer:disabled {
	opacity: 0.4;
	cursor: default;
}

.panneau .panneau-tableau .colonne .deplacer i {
	font-size: 1.8rem;
}

.panneau .panneau-tableau .colonne textarea {
	margin-top: 0.5rem;
}

.panneau .panneau-tableau .colonne input,
.panneau .panneau-tableau .colonne span {
	margin-right: 0.5rem;
}

.panneau .panneau-tableau .colonne input {
	cursor: text;
}

.panneau .panneau-tableau .colonne select {
	width: 20rem;
}

.panneau .panneau-tableau .colonne textarea {
	height: 5.5rem;
}

.panneau .panneau-tableau .tabulator {
	font-size: 1.8rem;
	border-top: 1px solid #ddd;
	border-left: 1px solid #ddd;
}

.panneau .panneau-tableau .tabulator .tabulator-header .tabulator-col.tabulator-sortable.tabulator-col-sorter-element:hover,
.panneau .panneau-tableau .tabulator .tabulator-row.tabulator-selectable:hover {
	background-color: #f5f5f5!important;
}

.panneau .panneau-tableau .tabulator .tabulator-row .tabulator-cell {
	padding: 5px;
}

.panneau .panneau-tableau .tabulator .tabulator-row .tabulator-cell input,
.panneau .panneau-tableau .tabulator .tabulator-row .tabulator-cell textarea {
	font-size: inherit!important;
}

.panneau .panneau-tableau .tabulator .tabulator-row .tabulator-cell svg {
	width: 20px;
	height: 20px;
}

.panneau .panneau-tableau .tabulator .tabulator-row .tabulator-cell[aria-checked="true"] i {
	font-size: 24px;
	line-height: 1;
	color: green;
}

.panneau .panneau-tableau .tabulator .tabulator-row .tabulator-cell[aria-checked="false"] i {
	font-size: 24px;
	line-height: 1;
	color: red;
}

.panneau .panneau-tableau .tabulator-row .tabulator-cell.tabulator-editing {
	border: 1px solid #ed5b00;
}

.panneau .panneau-tableau .contenu:not(.edition) .boutons {
	margin-top: 1rem;
}

.panneau .panneau-tableau .bouton-secondaire:first-child {
	margin-right: 2.5rem;
}
</style>
