<template>
	<JsPanel class="panneau" :visible="!chargement" :options="options">
		<div class="conteneur-gauche" />
		<div class="conteneur panneau-groupes">
			<div class="contenu" v-if="mode === 'edition'">
				<label :for="'liste_personnes_' + id">{{ $t('listePersonnes') }}</label>
				<span :id="'consigne_' + id" class="consigne" v-html="$t('consigneGroupe')" />
				<textarea :id="'liste_personnes_' + id" :aria-describedby="'consigne_' + id" class="groupes" :value="texte" @input="texte = $event.target.value" :placeholder="$t('exempleGroupe')"></textarea>
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
				<label :for="'nombre_personnes_' + id">{{ $t('nombrePersonnesGroupe') }}</label>
				<input :id="'nombre_personnes_' + id" type="number" :value="personnes" :min="1" @input="personnes = $event.target.value">
				<div class="actions">
					<span role="button" class="bouton-secondaire" tabindex="0" :title="$t('televerserFichierTxt')" :aria-label="$t('televerserFichierTxt')" @keydown.enter.space.prevent="activerInput('selectionner_txt_' + id)" @click="activerInput('selectionner_txt_' + id)"><i class="material-icons" aria-hidden="true">upload_file</i></span>
					<input :id="'selectionner_txt_' + id" type="file" @change="televerserTxt" style="display: none" accept=".txt">
					<button type="button" class="bouton" @click="generer">{{ $t('valider') }}</button>
				</div>
			</div>
			<div class="contenu" v-else>
				<div class="groupes">
					<div class="groupe" v-for="(groupe, index) in groupes" :key="'groupe_' + index">
						<div>{{ $t('groupe') }} {{ index + 1 }}</div>
						<draggable v-model="groupes[index]" group="groupe" tag="ul" filter=".deplacer" :prevent-on-filter="false">
							<li v-for="(personne, indexPersonne) in groupe" :key="personne + '_' + indexPersonne">
								<span>{{ personne }}</span>
								<span class="deplacements" v-if="fleches === 'oui'">
									<button type="button" class="deplacer avant" :disabled="index === 0" :title="$t('groupePrecedent')" :aria-label="$t('libelleCible', { action: $t('groupePrecedent'), cible: personne })" @click="changerGroupe(index, indexPersonne, -1)"><i class="material-icons" aria-hidden="true">arrow_back</i></button>
									<button type="button" class="deplacer apres" :disabled="index === groupes.length - 1" :title="$t('groupeSuivant')" :aria-label="$t('libelleCible', { action: $t('groupeSuivant'), cible: personne })" @click="changerGroupe(index, indexPersonne, 1)"><i class="material-icons" aria-hidden="true">arrow_forward</i></button>
								</span>
							</li>
						</draggable>
					</div>
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

export default {
	name: 'PGroupes',
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
			minw: 32,
			minh: 28,
			statut: '',
			dimensions: {},
			position: {},
			donnees: { w: 0, h: 0, x: 0, y: 0 },
			texte: '',
			personnes: 1,
			fleches: 'non',
			groupes: []
		}
	},
	watch: {
		export (valeur) {
			if (valeur === true) {
				this.position = { x: this.x, y: this.y }
				this.$emit('export', { id: this.id, titre: this.titre, mode: this.mode, statut: this.statut, dimensions: this.dimensions, position: this.position, contenu: { texte: this.texte, personnes: this.personnes, fleches: this.fleches, groupes: this.groupes }, w: this.w, h: this.h, x: this.x, y: this.y })
			}
		}
	},
	created () {
		this.definirCaracteristiques('groupes')
		if (this.panneau.contenu !== '') {
			this.texte = this.panneau.contenu.texte
			this.personnes = this.panneau.contenu.personnes
			this.fleches = this.panneau.contenu.fleches || 'non'
			this.groupes = this.panneau.contenu.groupes
		}
		if (this.mode === 'lecture') {
			this.redimensionnement = true
		}
		this.genererOptions('groupes')
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
		changerGroupe (indexGroupe, indexPersonne, direction) {
			const cible = indexGroupe + direction
			if (cible < 0 || cible > this.groupes.length - 1) return
			const groupes = this.groupes.map((groupe) => [...groupe])
			const personne = groupes[indexGroupe].splice(indexPersonne, 1)[0]
			groupes[cible].push(personne)
			this.groupes = groupes
			this.$nextTick(() => {
				const elements = this.$el.querySelectorAll('.groupes .groupe')[cible]?.querySelectorAll('li')
				const element = elements?.[elements.length - 1]
				const bouton = element?.querySelector(direction < 0 ? '.deplacer.avant' : '.deplacer.apres')
				if (bouton && !bouton.disabled) {
					bouton.focus()
				} else {
					element?.querySelector('.deplacer:not(:disabled)')?.focus()
				}
				this.annoncer(this.$t('personneDeplaceeGroupe', { personne: personne, groupe: cible + 1 }))
			})
		},
		generer () {
			if (this.texte !== '') {
				this.mode = 'lecture'
				this.redimensionnement = true
				let liste = this.texte.split(',').map(item => item.trim())
				liste = liste.filter(item => item !== '')
				liste = this.melanger(liste)
				const nombrePersonnes = parseInt(this.personnes)
				if (liste.length > 0 && nombrePersonnes > 0) {
					let nombreGroupes = Math.ceil(liste.length / nombrePersonnes)
					let indexPersonne = 0
					while (nombreGroupes > 0) {
						const groupe = []
						let i
						if (nombreGroupes < 1) {
							while (indexPersonne < liste.length) {
								groupe[groupe.length] = liste[indexPersonne]
								indexPersonne++
							}
						} else {
							for (i = nombrePersonnes; i > 0 ; i--) {
								groupe[groupe.length] = liste[indexPersonne]
								indexPersonne++
							}
						}
						this.groupes[this.groupes.length] = groupe
						nombreGroupes--
					}
				}
				if (this.donnees.w > 0 && this.donnees.h > 0) {
					this.w = this.donnees.w
					this.h = this.donnees.h
				} else {
					this.w = 64
					this.h = 48
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
			this.groupes = []
			this.donnees.w = this.w
			this.donnees.h = this.h
			this.donnees.x = this.x
			this.donnees.y = this.y
			this.w = 46
			this.h = 50
			this.$nextTick(() => {
				document.querySelector('#' + this.id + ' textarea')?.focus()
			})
			this.positionner()
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
.panneau .conteneur textarea.groupes {
	height: 15rem;
	max-height: 15rem;
	margin-bottom: 2rem;
}

.panneau .conteneur div.groupes {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
}

.panneau .conteneur .groupe {
    border: 1px solid #ddd;
    width: 28rem;
    padding: 1.5rem 1rem;
    margin: 1rem;
    font-size: 2.4rem;
}

.panneau .conteneur .groupe div {
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #ddd;
    margin-bottom: 1.5rem;
    font-weight: 700;
}

.panneau .conteneur .groupe ul {
	width: 100%;
	height: calc(100% - 6rem);
    list-style: none;
}

.panneau .conteneur .groupe li {
    margin-bottom: 1rem;
    line-height: 1.4;
	cursor: move;
}

.panneau .conteneur .groupe li:last-child {
    margin-bottom: 0;
}

.panneau .conteneur .groupe li .deplacements {
	display: inline-flex;
	gap: 0.4rem;
	margin-left: 0.8rem;
	vertical-align: middle;
}

.panneau .conteneur .groupe li .deplacer {
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

.panneau .conteneur .groupe li .deplacer:disabled {
	opacity: 0.4;
	cursor: default;
}

.panneau .conteneur .groupe li .deplacer i {
	font-size: 1.8rem;
}

.panneau .panneau-groupes .choix {
	margin-bottom: 2rem;
}

.panneau .panneau-groupes .choix span.oui {
	margin-right: 2.5rem;
}

.panneau .panneau-groupes .choix label {
	display: inline-block;
	width: auto;
	font-size: 1.6rem;
	font-weight: 400;
	margin-left: 1rem;
	margin-bottom: 0;
}

.panneau .panneau-groupes .actions {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-top: 2rem;
}

.panneau .panneau-groupes .actions .bouton {
	margin-top: 0;
	margin-left: 2rem;
	margin-right: 0;
}
</style>
